/**
 * Server-side wrapper for LegiScan API
 * Includes Redis caching support
 */

import { kv } from '@vercel/kv';
import { LegiScanApi, LegiScan } from './api';
import PQueue from 'p-queue';

// Load environment variables
const LEGISCAN_API_KEY = process.env.LEGISCAN_API_KEY || '';
const CACHE_ENABLED = process.env.CACHE_ENABLED !== 'false';
const CACHE_TTL = parseInt(process.env.CACHE_TTL || '3600'); // Default 1 hour

// Initialize LegiScan API client
const legiscanApi = new LegiScanApi({
  apiKey: LEGISCAN_API_KEY,
  cacheResults: false, // We'll handle caching ourselves
});

// Global rate limiter for expensive operations (getMasterListRaw, bulk searches)
// This prevents exceeding the 30k/mo quota
const globalBulkOperationsQueue = new PQueue({
  concurrency: 1, // Only one bulk operation at a time
  interval: 60 * 60 * 1000, // 1 hour interval
  intervalCap: 2, // Max 2 bulk operations per hour
});

/**
 * Server-side LegiScan API client with caching support
 */
export class ServerLegiScanApi {
  /**
   * Get data from cache or fetch from LegiScan API
   * Improved error handling to surface API errors with appropriate status codes
   */
  private static async getWithCache<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    ttl: number = CACHE_TTL
  ): Promise<T> {
    // Try to get from cache first
    if (CACHE_ENABLED) {
      try {
        const cached = await kv.get<T>(cacheKey);
        if (cached) {
          console.log(`Cache hit for ${cacheKey}`);
          return cached;
        }
      } catch (error) {
        console.error(`Error accessing cache for ${cacheKey}:`, error);
        // Continue with API fetch on cache error
      }
    }

    // Fetch from API
    console.log(`Cache miss for ${cacheKey}, fetching from API`);
    
    try {
      const data = await fetchFn();
      
      // Check for API errors in the response
      // LegiScan returns status: "ERROR" with an alert message when there's an issue
      const responseData = data as any;
      if (responseData && responseData.status === 'ERROR') {
        const errorMessage = responseData.alert?.message || 'Unknown LegiScan API error';
        
        // Create a custom error with additional information
        const error = new Error(errorMessage);
        
        // Add a custom statusCode property to the error
        // This helps API routes differentiate between types of errors
        if (errorMessage.includes('Invalid API Key')) {
          (error as any).statusCode = 401; // Unauthorized
        } else if (errorMessage.includes('not found') || errorMessage.includes('No such')) {
          (error as any).statusCode = 404; // Not Found
        } else if (errorMessage.includes('Rate limit') || errorMessage.includes('Quota exceeded')) {
          (error as any).statusCode = 429; // Too Many Requests
        } else {
          (error as any).statusCode = 400; // Bad Request (default for API errors)
        }
        
        // Add the original response for context
        (error as any).apiResponse = responseData;
        
        // Don't cache error responses
        throw error;
      }
      
      // Cache the successful result if enabled
      if (CACHE_ENABLED) {
        try {
          await kv.set(cacheKey, data, { ex: ttl });
        } catch (error) {
          console.error(`Error caching data for ${cacheKey}:`, error);
          // Continue even if caching fails
        }
      }

      return data;
    } catch (error) {
      // Let the error propagate up - we'll handle it at the API route level
      console.error(`Error fetching data for ${cacheKey}:`, error);
      throw error;
    }
  }

  /**
   * Get list of available sessions for Virginia
   */
  static async getVaSessions(): Promise<LegiScan.Session[]> {
    const cacheKey = 'legiscan:va_sessions';
    
    const response = await this.getWithCache<LegiScan.SessionListResponse>(
      cacheKey,
      () => legiscanApi.getSessionList('VA'),
      86400 // Cache for 1 day
    );
    
    return response.sessions;
  }

  /**
   * Get the most recent Virginia session
   */
  static async getCurrentVaSession(): Promise<LegiScan.Session> {
    const sessions = await this.getVaSessions();
    
    // Find the most recent regular session that's not a prior session
    const currentSession = sessions.find(session => 
      session.year_end >= new Date().getFullYear() && 
      !session.prior && 
      !session.special
    );
    
    if (!currentSession) {
      // Fallback to the most recent regular session
      const regularSessions = sessions.filter(session => !session.special)
        .sort((a, b) => b.year_start - a.year_start);
      
      if (regularSessions.length === 0) {
        throw new Error('No Virginia sessions found');
      }
      
      return regularSessions[0];
    }
    
    return currentSession;
  }

  /**
   * Get master list of bills for the current Virginia session
   */
  static async getVaMasterList(): Promise<Record<string, LegiScan.MasterListBill>> {
    const currentSession = await this.getCurrentVaSession();
    const cacheKey = `legiscan:va_masterlist:${currentSession.session_id}`;
    
    const response = await this.getWithCache<LegiScan.MasterListResponse>(
      cacheKey,
      () => legiscanApi.getMasterList(currentSession.session_id),
      3600 // Cache for 1 hour
    );
    
    return response.masterlist;
  }
  
  /**
   * Get raw master list of bills for the current Virginia session
   * Rate limited to once per hour to avoid quota issues
   */
  static async getVaMasterListRaw(): Promise<Record<string, LegiScan.MasterListRawBill>> {
    const currentSession = await this.getCurrentVaSession();
    const cacheKey = `legiscan:va_masterlist_raw:${currentSession.session_id}`;
    
    // Try to get from cache first with a longer TTL (3 hours)
    if (CACHE_ENABLED) {
      try {
        const cached = await kv.get(cacheKey);
        if (cached) {
          console.log(`Cache hit for ${cacheKey}`);
          return cached as Record<string, LegiScan.MasterListRawBill>;
        }
      } catch (error) {
        console.error(`Error accessing cache for ${cacheKey}:`, error);
      }
    }
    
    // If not in cache, use the global rate limiter for this expensive operation
    console.log(`Cache miss for ${cacheKey}, queueing getMasterListRaw operation`);
    
    try {
      // This will wait in the queue if we're exceeding our rate limit
      const response = await globalBulkOperationsQueue.add(() => 
        legiscanApi.getMasterListRaw(currentSession.session_id)
      );
      
      // Cache with a longer TTL (3 hours) since this is an expensive operation
      if (CACHE_ENABLED) {
        try {
          await kv.set(cacheKey, response.masterlist, { ex: 3 * 3600 });
        } catch (error) {
          console.error(`Error caching data for ${cacheKey}:`, error);
        }
      }
      
      return response.masterlist;
    } catch (error) {
      console.error(`Error fetching master list raw:`, error);
      throw error;
    }
  }

  /**
   * Get bill details by ID
   */
  static async getBill(billId: number | string): Promise<LegiScan.Bill> {
    const cacheKey = `legiscan:bill:${billId}`;
    
    const response = await this.getWithCache<LegiScan.BillResponse>(
      cacheKey,
      () => legiscanApi.getBill(billId),
      3600 * 12 // Cache for 12 hours
    );
    
    return response.bill;
  }
  
  /**
   * Get vote details by ID
   */
  static async getVotes(rollCallId: number | string): Promise<LegiScan.RollCallResponse['roll_call']> {
    const cacheKey = `legiscan:rollcall:${rollCallId}`;
    
    const response = await this.getWithCache<LegiScan.RollCallResponse>(
      cacheKey,
      () => legiscanApi.getRollCall(rollCallId),
      86400 * 7 // Cache for 1 week (votes don't change)
    );
    
    return response.roll_call;
  }
  
  /**
   * Get bill text by document ID
   */
  static async getBillText(docId: number | string): Promise<LegiScan.BillTextResponse['text']> {
    const cacheKey = `legiscan:text:${docId}`;
    
    const response = await this.getWithCache<LegiScan.BillTextResponse>(
      cacheKey,
      () => legiscanApi.getBillText(docId),
      86400 * 30 // Cache for 30 days (texts don't change)
    );
    
    return response.text;
  }
  
  /**
   * Get amendment document by ID
   */
  static async getAmendment(amendmentId: number | string): Promise<LegiScan.AmendmentResponse['amendment']> {
    const cacheKey = `legiscan:amendment:${amendmentId}`;
    
    const response = await this.getWithCache<LegiScan.AmendmentResponse>(
      cacheKey,
      () => legiscanApi.getAmendment(amendmentId),
      86400 * 30 // Cache for 30 days (amendments don't change)
    );
    
    return response.amendment;
  }
  
  /**
   * Search for bills in Virginia
   */
  static async searchVaBills(
    query: string,
    options: { year?: number | string; page?: number } = {}
  ): Promise<LegiScan.SearchResponse> {
    const { year = 2, page = 1 } = options;
    const cacheKey = `legiscan:search:VA:${query}:${year}:${page}`;
    
    return this.getWithCache<LegiScan.SearchResponse>(
      cacheKey,
      () => legiscanApi.getSearch({ state: 'VA', query, year, page }),
      3600 // Cache for 1 hour
    );
  }
  
  /**
   * Get raw search results for bills in Virginia (or any state)
   * Useful for bulk processing with minimum information
   */
  static async getSearchRaw(
    query: string,
    options: { state?: string; year?: number | string; page?: number; sessionId?: number | string } = {}
  ): Promise<LegiScan.SearchRawResponse> {
    const { state = 'VA', year = 2, page = 1, sessionId } = options;
    
    // We can search by state+year or by specific session ID
    const searchParams = sessionId 
      ? { id: sessionId, query, page }
      : { state, query, year, page };
    
    const paramString = sessionId
      ? `session:${sessionId}:${query}:${page}`
      : `${state}:${query}:${year}:${page}`;
    
    const cacheKey = `legiscan:searchraw:${paramString}`;
    
    return this.getWithCache<LegiScan.SearchRawResponse>(
      cacheKey,
      () => legiscanApi.getSearchRaw(searchParams),
      3600 // Cache for 1 hour
    );
  }
  
  /**
   * Throttled bulk search for multiple terms
   * Rate limited to avoid excessive API usage
   */
  static async bulkSearch(
    queries: string[],
    options: { state?: string; year?: number | string; sessionId?: number | string; useRaw?: boolean } = {}
  ): Promise<Array<LegiScan.SearchResponse | LegiScan.SearchRawResponse>> {
    const { state = 'VA', year = 2, sessionId, useRaw = false } = options;
    
    // Create a unique cache key for this bulk operation
    const cacheKey = `legiscan:bulksearch:${
      sessionId ? `session:${sessionId}` : `${state}:${year}`
    }:${queries.sort().join('+')}:${useRaw ? 'raw' : 'full'}`;
    
    // Try to get from cache first with a longer TTL (3 hours)
    if (CACHE_ENABLED) {
      try {
        const cached = await kv.get(cacheKey);
        if (cached) {
          console.log(`Cache hit for bulk search: ${cacheKey}`);
          return cached as Array<LegiScan.SearchResponse | LegiScan.SearchRawResponse>;
        }
      } catch (error) {
        console.error(`Error accessing cache for ${cacheKey}:`, error);
      }
    }
    
    // Use the global bulk operations queue to rate limit
    console.log(`Cache miss for bulk search, queueing operation for terms: ${queries.join(', ')}`);
    
    try {
      // Run through the global queue to throttle these high-cost operations
      const results = await globalBulkOperationsQueue.add(async () => {
        // Inside the queue, we'll run each search sequentially with its own delay
        const searchResults: Array<LegiScan.SearchResponse | LegiScan.SearchRawResponse> = [];
        
        for (const query of queries) {
          console.log(`Running ${useRaw ? 'raw' : 'normal'} search for term: ${query}`);
          
          try {
            // Run the appropriate search type
            const result = useRaw
              ? await this.getSearchRaw(query, { state, year, sessionId })
              : await this.searchVaBills(query, { year, page: 1 });
              
            searchResults.push(result);
            
            // Add a delay between searches to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (error) {
            console.error(`Error searching for term "${query}":`, error);
            // Continue with other queries even if one fails
          }
        }
        
        return searchResults;
      });
      
      // Cache the results with a longer TTL (2 hours)
      if (CACHE_ENABLED) {
        try {
          await kv.set(cacheKey, results, { ex: 2 * 3600 });
        } catch (error) {
          console.error(`Error caching bulk search results:`, error);
        }
      }
      
      return results;
    } catch (error) {
      console.error(`Error performing bulk search:`, error);
      throw error;
    }
  }
  
  /**
   * Get list of blockchain-related bills in Virginia
   * Uses rate-limited bulk search to prevent quota issues
   */
  static async getBlockchainBills(): Promise<LegiScan.Bill[]> {
    const searchTerms = [
      'blockchain',
      'digital asset',
      'cryptocurrency',
      'virtual currency',
      'distributed ledger'
    ];
    
    // Use bulkSearch to run searches with rate limiting
    const searchResults = await this.bulkSearch(searchTerms, { 
      year: 3,  // Search recent sessions
      useRaw: false // Use normal search for full details
    });
    
    // Collect unique bill IDs
    const billIds = new Set<number>();
    
    searchResults.forEach(result => {
      // Skip the 'summary' property
      Object.entries(result.searchresult).forEach(([key, value]) => {
        if (key !== 'summary' && typeof value === 'object' && value.bill_id) {
          billIds.add(value.bill_id);
        }
      });
    });
    
    console.log(`Found ${billIds.size} unique blockchain-related bills`);
    
    // Use batched fetching for bills to avoid overwhelming the API
    const allBills: LegiScan.Bill[] = [];
    const batchSize = 10; // Process 10 bills at a time
    
    const billIdArray = Array.from(billIds);
    
    for (let i = 0; i < billIdArray.length; i += batchSize) {
      const batch = billIdArray.slice(i, i + batchSize);
      console.log(`Fetching batch ${i/batchSize + 1} of ${Math.ceil(billIdArray.length/batchSize)}`);
      
      const batchPromises = batch.map(billId => 
        this.getBill(billId).catch(error => {
          console.error(`Error fetching bill ${billId}:`, error);
          return null;
        })
      );
      
      const batchResults = await Promise.all(batchPromises);
      
      // Add non-null results to our collection
      allBills.push(...batchResults.filter(bill => bill !== null) as LegiScan.Bill[]);
      
      // Add a small delay between batches
      if (i + batchSize < billIdArray.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return allBills;
  }
  
  /**
   * Get sponsors for a bill
   */
  static async getBillSponsors(billId: number | string): Promise<LegiScan.Bill['sponsors']> {
    const bill = await this.getBill(billId);
    return bill.sponsors || [];
  }
  
  /**
   * Get person details
   */
  static async getPerson(peopleId: number | string): Promise<LegiScan.PersonResponse['person']> {
    const cacheKey = `legiscan:person:${peopleId}`;
    
    const response = await this.getWithCache<LegiScan.PersonResponse>(
      cacheKey,
      () => legiscanApi.getPerson(peopleId),
      86400 * 7 // Cache for 1 week
    );
    
    return response.person;
  }
  
  /**
   * Get list of bills sponsored by a legislator
   */
  static async getSponsoredBills(peopleId: number | string): Promise<LegiScan.SponsoredListResponse['sponsoredbills']> {
    const cacheKey = `legiscan:sponsored:${peopleId}`;
    
    const response = await this.getWithCache<LegiScan.SponsoredListResponse>(
      cacheKey,
      () => legiscanApi.getSponsoredList(peopleId),
      86400 // Cache for 1 day
    );
    
    return response.sponsoredbills;
  }
  
  /**
   * Clear cache for a specific key
   */
  static async clearCache(key: string): Promise<void> {
    if (CACHE_ENABLED) {
      await kv.del(key);
    }
  }
  
  /**
   * Clear all LegiScan cache
   */
  static async clearAllCache(): Promise<void> {
    if (CACHE_ENABLED) {
      // Get all cache keys with the "legiscan:" prefix
      const keys = await kv.keys('legiscan:*');
      
      if (keys.length > 0) {
        // Delete all keys in a single operation
        await kv.del(...keys);
      }
    }
  }
  
  /**
   * Get a supplement document
   */
  static async getSupplement(supplementId: number | string): Promise<LegiScan.SupplementResponse['supplement']> {
    const cacheKey = `legiscan:supplement:${supplementId}`;
    
    const response = await this.getWithCache<LegiScan.SupplementResponse>(
      cacheKey,
      () => legiscanApi.getSupplement(supplementId),
      86400 * 30 // Cache for 30 days (supplements don't change)
    );
    
    return response.supplement;
  }
  
  /**
   * Get dataset list
   */
  static async getDatasetList(options: { state?: string; year?: number | string } = {}): Promise<LegiScan.DatasetListResponse['datasetlist']> {
    const cacheKey = `legiscan:datasetlist:${options.state || 'all'}:${options.year || 'all'}`;
    
    const response = await this.getWithCache<LegiScan.DatasetListResponse>(
      cacheKey,
      () => legiscanApi.getDatasetList(options),
      86400 // Cache for 1 day
    );
    
    return response.datasetlist;
  }
  
  /**
   * Get dataset (ZIP file)
   */
  static async getDataset(sessionId: number | string, accessKey: string, format: 'json' | 'csv' = 'json'): Promise<LegiScan.DatasetResponse['dataset']> {
    const cacheKey = `legiscan:dataset:${sessionId}:${format}`;
    
    const response = await this.getWithCache<LegiScan.DatasetResponse>(
      cacheKey,
      () => legiscanApi.getDataset(sessionId, accessKey, format),
      86400 * 7 // Cache for 1 week
    );
    
    return response.dataset;
  }
  
  /**
   * Get raw dataset (ZIP file)
   */
  static async getDatasetRaw(sessionId: number | string, accessKey: string): Promise<LegiScan.DatasetRawResponse['datasetraw']> {
    const cacheKey = `legiscan:datasetraw:${sessionId}`;
    
    const response = await this.getWithCache<LegiScan.DatasetRawResponse>(
      cacheKey,
      () => legiscanApi.getDatasetRaw(sessionId, accessKey),
      86400 * 7 // Cache for 1 week
    );
    
    return response.datasetraw;
  }
  
  /**
   * Get monitor list
   */
  static async getMonitorList(record: 'current' | 'archived' | string = 'current'): Promise<Record<string, any>> {
    const cacheKey = `legiscan:monitorlist:${record}`;
    
    const response = await this.getWithCache<LegiScan.MonitorListResponse>(
      cacheKey,
      () => legiscanApi.getMonitorList(record),
      3600 // Cache for 1 hour
    );
    
    return response.monitorlist;
  }
  
  /**
   * Get people (legislators) for a session with long-term caching
   */
  static async getSessionPeople(sessionId: number | string): Promise<LegiScan.SessionPeopleResponse['sessionpeople']> {
    const cacheKey = `legiscan:sessionpeople:${sessionId}`;
    
    const response = await this.getWithCache<LegiScan.SessionPeopleResponse>(
      cacheKey,
      () => legiscanApi.getSessionPeople(sessionId),
      604800 // Cache for 1 week (7 * 24 * 3600 = 604800 seconds)
    );
    
    return response.sessionpeople;
  }
  
  /**
   * Set monitor status for bills
   */
  static async setMonitor(options: { 
    list: string; 
    action: 'monitor' | 'remove' | 'set'; 
    stance?: 'watch' | 'support' | 'oppose'
  }): Promise<Record<string, string>> {
    // This is a write operation, so we don't cache it
    const response = await legiscanApi.setMonitor(options);
    
    // But we should invalidate the monitor list cache
    await this.clearCache('legiscan:monitorlist:current');
    
    return response.return;
  }
}
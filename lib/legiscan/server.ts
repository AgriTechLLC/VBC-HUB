/**
 * Server-side wrapper for LegiScan API
 * Includes Redis caching support
 */

import { kv } from '@vercel/kv';
import { LegiScanApi, LegiScan } from './api';

// Load environment variables
const LEGISCAN_API_KEY = process.env.LEGISCAN_API_KEY || '';
const CACHE_ENABLED = process.env.CACHE_ENABLED !== 'false';
const CACHE_TTL = parseInt(process.env.CACHE_TTL || '3600'); // Default 1 hour

// Initialize LegiScan API client
const legiscanApi = new LegiScanApi({
  apiKey: LEGISCAN_API_KEY,
  cacheResults: false, // We'll handle caching ourselves
});

/**
 * Server-side LegiScan API client with caching support
 */
export class ServerLegiScanApi {
  /**
   * Get data from cache or fetch from LegiScan API
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
    const data = await fetchFn();

    // Cache the result if enabled
    if (CACHE_ENABLED) {
      try {
        await kv.set(cacheKey, data, { ex: ttl });
      } catch (error) {
        console.error(`Error caching data for ${cacheKey}:`, error);
        // Continue even if caching fails
      }
    }

    return data;
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
   * Get list of blockchain-related bills in Virginia
   */
  static async getBlockchainBills(): Promise<LegiScan.Bill[]> {
    const searchTerms = [
      'blockchain',
      'digital asset',
      'cryptocurrency',
      'virtual currency',
      'distributed ledger'
    ];
    
    // Use Promise.all to run searches in parallel
    const searchPromises = searchTerms.map(term => 
      this.searchVaBills(term, { year: 3 }) // Search recent sessions
    );
    
    const searchResults = await Promise.all(searchPromises);
    
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
    
    // Fetch details for each bill
    const billPromises = Array.from(billIds).map(billId => 
      this.getBill(billId).catch(error => {
        console.error(`Error fetching bill ${billId}:`, error);
        return null;
      })
    );
    
    const bills = await Promise.all(billPromises);
    
    // Filter out null values (failed requests)
    return bills.filter(bill => bill !== null) as LegiScan.Bill[];
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
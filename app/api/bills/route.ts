import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import * as LegiScan from '@/lib/legiscan-redis';
import { Redis } from '@upstash/redis';

// Initialize Redis client for bill cache
let redis: Redis;

try {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
  });
} catch (error) {
  console.error('Failed to initialize Redis client:', error);
  // Will fall back to in-memory cache if Redis fails
}

// Fallback in-memory cache when Redis is unavailable (for development)
// Exported so the [id] route can access the same cache
export let billCache: Record<string, any> = {};
let lastFetchTime = 0;
const CACHE_TTL = process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : 3600000; // 1 hour in milliseconds
const BILLS_CACHE_KEY = 'vbc:bills:all';

interface BillData {
  bill_id: number;
  bill_number: string;
  title: string;
  status_id: number;
  status: string;
  progress: number;
  last_action: string;
  last_action_date: string;
  url?: string;
  description?: string;
  change_hash: string;
}

/**
 * GET handler for /api/bills
 * Returns cached bills or fetches new ones if cache is stale
 */
export async function GET(request: Request) {
  try {
    // Check for mock parameter
    const url = new URL(request.url);
    const useMock = url.searchParams.get('mock') === 'true';
    
    if (useMock || (process.env.NODE_ENV === 'development' && !process.env.USE_REAL_API)) {
      console.log('[API] Using mock data');
      return getMockBills();
    }
    
    // Try to get bills from Redis first
    if (redis) {
      try {
        const cachedBills = await redis.get(BILLS_CACHE_KEY);
        if (cachedBills) {
          console.log('[API] Returning bills from Redis cache');
          return NextResponse.json({
            bills: Object.values(cachedBills),
            cached: true,
            lastUpdated: await redis.get('vbc:bills:lastUpdated') || new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('[API] Redis bills cache read error:', error);
        // Continue with in-memory cache or API fetch
      }
    }
    
    // Check in-memory cache if Redis fails or is empty
    const now = Date.now();
    if (now - lastFetchTime < CACHE_TTL && Object.keys(billCache).length > 0) {
      console.log('[API] Returning bills from memory cache');
      return NextResponse.json({
        bills: Object.values(billCache),
        cached: true,
        lastUpdated: new Date(lastFetchTime).toISOString()
      });
    }
    
    // Fetch fresh data from LegiScan
    console.log('[API] Fetching bills from LegiScan');
    await refreshBills();
    
    return NextResponse.json({
      bills: Object.values(billCache),
      cached: false,
      lastUpdated: new Date(now).toISOString()
    });
  } catch (error) {
    console.error('[API] Error fetching bills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bills' },
      { status: 500 }
    );
  }
}

/**
 * Refresh bills from LegiScan API
 * This function is designed to be called by a scheduled job (Vercel cron)
 */
export async function refreshBills() {
  try {
    // Get current session for Virginia using the new auto-discover function
    const sessionId = await LegiScan.currentVaSession();
    if (!sessionId) {
      throw new Error('No active session found for Virginia');
    }
    
    // Get master list of bills
    const masterList = await LegiScan.getMasterListRaw(sessionId);
    
    // Get stored change hashes from Redis or memory cache
    let oldHashes: Record<string, string> = {};
    
    if (redis) {
      try {
        const cachedBills = await redis.get(BILLS_CACHE_KEY) as Record<string, any> || {};
        Object.entries(cachedBills).forEach(([billId, bill]) => {
          oldHashes[billId] = bill.change_hash;
        });
      } catch (error) {
        console.error('[API] Redis bills cache read error for hashes:', error);
        // Fall back to in-memory cache
        Object.entries(billCache).forEach(([billId, bill]) => {
          oldHashes[billId] = bill.change_hash;
        });
      }
    } else {
      // Use in-memory cache
      Object.entries(billCache).forEach(([billId, bill]) => {
        oldHashes[billId] = bill.change_hash;
      });
    }
    
    // Find changed bills
    const changedBillIds = LegiScan.diffHashes(masterList, oldHashes);
    
    // If this is our first run, limit to blockchain-related bills only
    const isFirstRun = Object.keys(oldHashes).length === 0;
    
    if (isFirstRun) {
      console.log('[API] Initial load - filtering for blockchain-related bills');
      
      // Filter master list for blockchain-related bills
      const blockchainKeywords = ['blockchain', 'crypto', 'digital asset', 'token', 'cryptocurrency', 'distributed ledger'];
      
      // Clear the changed bills array and refill with only blockchain-related bills
      const blockchainBillIds: number[] = [];
      
      for (const [billId, bill] of Object.entries(masterList)) {
        const title = bill.title?.toLowerCase() || '';
        const description = bill.description?.toLowerCase() || '';
        
        const isBlockchainRelated = blockchainKeywords.some(keyword => 
          title.includes(keyword) || description.includes(keyword)
        );
        
        if (isBlockchainRelated) {
          blockchainBillIds.push(Number(billId));
        }
      }
      
      // Use only blockchain-related bills for first run
      changedBillIds.length = 0;
      changedBillIds.push(...blockchainBillIds);
    }
    
    console.log(`[API] Fetching details for ${changedBillIds.length} bills`);
    
    // Create a new cache object (either Redis or in-memory)
    const newBillCache: Record<string, any> = { ...billCache };
    
    // Fetch details for changed bills
    for (const billId of changedBillIds) {
      const billDetails = await LegiScan.getBill(billId);
      
      newBillCache[billId] = {
        bill_id: billDetails.bill_id,
        bill_number: billDetails.bill_number,
        title: billDetails.title,
        status_id: billDetails.status,
        status: LegiScan.getBillStatusDescription(billDetails.status),
        progress: LegiScan.calculateProgress(billDetails.status),
        last_action: billDetails.history[0]?.action || 'No action',
        last_action_date: billDetails.history[0]?.date || new Date().toISOString().split('T')[0],
        url: billDetails.state_link,
        description: billDetails.description || '',
        change_hash: billDetails.change_hash
      };
    }
    
    // Update the in-memory cache
    billCache = newBillCache;
    lastFetchTime = Date.now();
    
    // Update Redis cache if available
    if (redis) {
      try {
        await redis.set(BILLS_CACHE_KEY, newBillCache, { ex: Math.floor(CACHE_TTL / 1000) });
        await redis.set('vbc:bills:lastUpdated', new Date().toISOString(), { ex: Math.floor(CACHE_TTL / 1000) });
      } catch (error) {
        console.error('[API] Redis bills cache write error:', error);
        // Continue despite Redis errors
      }
    }
    
    // Revalidate cache for the bills page
    revalidateTag('va-bills');
    
    console.log(`[API] Updated ${changedBillIds.length} bills`);
    return changedBillIds;
  } catch (error) {
    console.error('[API] Error refreshing bills:', error);
    throw error;
  }
}

/**
 * Get mock bills for development and testing
 */
function getMockBills() {
  const mockBills: BillData[] = [
    {
      bill_id: 1234567,
      bill_number: "HB1234",
      title: "Digital Asset Trading Regulation",
      status_id: 7,
      status: "Committee",
      progress: 30,
      last_action: "Referred to Commerce Committee",
      last_action_date: "2024-03-15",
      url: "https://lis.virginia.gov/cgi-bin/legp604.exe?251+sum+HB1234",
      description: "A bill to establish a framework for the regulation of digital asset trading platforms in the Commonwealth.",
      change_hash: "abc123"
    },
    {
      bill_id: 5678901,
      bill_number: "SB5678",
      title: "Blockchain Technology Innovation Act",
      status_id: 4,
      status: "Passed",
      progress: 100,
      last_action: "Signed by Governor",
      last_action_date: "2024-03-10",
      url: "https://lis.virginia.gov/cgi-bin/legp604.exe?251+sum+SB5678",
      description: "Establishes the Blockchain Technology Innovation Fund and authorizes grants to blockchain technology companies establishing operations in the Commonwealth.",
      change_hash: "def456"
    },
    {
      bill_id: 9012345,
      bill_number: "HB4567",
      title: "Cryptocurrency Taxation Standards",
      status_id: 8,
      status: "Referred",
      progress: 20,
      last_action: "Referred to Finance Committee",
      last_action_date: "2024-03-05",
      url: "https://lis.virginia.gov/cgi-bin/legp604.exe?251+sum+HB4567",
      description: "Sets standards for the taxation of cryptocurrency transactions and mining operations in Virginia.",
      change_hash: "ghi789"
    },
    {
      bill_id: 3456789,
      bill_number: "SB7890",
      title: "Digital Identity Verification Act",
      status_id: 10,
      status: "Amended",
      progress: 60,
      last_action: "House amendments agreed to by Senate",
      last_action_date: "2024-04-12",
      url: "https://lis.virginia.gov/cgi-bin/legp604.exe?251+sum+SB7890",
      description: "Establishes a framework for digital identity verification using distributed ledger technology for state services and agencies.",
      change_hash: "jkl012"
    }
  ];

  // Update in-memory cache
  billCache = {};
  mockBills.forEach(bill => {
    billCache[bill.bill_id] = bill;
  });
  lastFetchTime = Date.now();
  
  // Also update Redis cache if available
  if (redis) {
    try {
      const redisBillCache: Record<string, any> = {};
      mockBills.forEach(bill => {
        redisBillCache[bill.bill_id] = bill;
      });
      
      redis.set(BILLS_CACHE_KEY, redisBillCache, { ex: Math.floor(CACHE_TTL / 1000) });
      redis.set('vbc:bills:lastUpdated', new Date().toISOString(), { ex: Math.floor(CACHE_TTL / 1000) });
    } catch (error) {
      console.error('[API] Redis mock bills cache write error:', error);
      // Continue despite Redis errors
    }
  }

  return NextResponse.json({
    bills: mockBills,
    cached: false,
    lastUpdated: new Date(lastFetchTime).toISOString()
  });
}
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { ServerLegiScanApi } from '@/lib/legiscan/server';
import { embedBill } from '@/lib/embeddings';
import { kv } from '@vercel/kv';

// Constants
const BILLS_CACHE_KEY = 'vbc:bills:all';
const CACHE_TTL = process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : 3600; // 1 hour in seconds

// Fallback in-memory cache when KV is unavailable (for development)
// Exported so the [id] route can access the same cache
export let billCache: Record<string, any> = {};
let lastFetchTime = 0;

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
    
    // Try to get bills from KV first
    try {
      const cachedBills = await kv.get(BILLS_CACHE_KEY);
      if (cachedBills) {
        console.log('[API] Returning bills from KV cache');
        return NextResponse.json({
          bills: Object.values(cachedBills),
          cached: true,
          lastUpdated: await kv.get('vbc:bills:lastUpdated') || new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('[API] KV bills cache read error:', error);
      // Continue with in-memory cache or API fetch
    }
    
    // Check in-memory cache if KV fails or is empty
    const now = Date.now();
    if (now - lastFetchTime < CACHE_TTL * 1000 && Object.keys(billCache).length > 0) {
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
    // Get blockchain-related bills from the new ServerLegiScanApi
    const blockchainBills = await ServerLegiScanApi.getBlockchainBills();
    
    // Create a new cache object
    const newBillCache: Record<string, any> = {};
    
    // Process bills into our simplified format
    for (const bill of blockchainBills) {
      const billId = bill.bill_id.toString();
      
      newBillCache[billId] = {
        bill_id: bill.bill_id,
        bill_number: bill.bill_number,
        title: bill.title,
        status_id: bill.status,
        status: bill.status,  // Status description will be client-formatted
        progress: 0,  // Progress will be client-calculated
        last_action: bill.history && bill.history.length > 0 ? bill.history[0].action : 'No action',
        last_action_date: bill.history && bill.history.length > 0 ? bill.history[0].date : new Date().toISOString().split('T')[0],
        url: bill.state_link,
        description: bill.description || '',
        change_hash: bill.change_hash
      };
      
      // Generate embeddings for bill text (if OpenAI API is configured)
      if (process.env.USE_REAL_API === 'true' && process.env.OPENAI_API_KEY) {
        try {
          // Get full bill text (when available) for embedding
          if (bill.texts && bill.texts.length > 0) {
            const documentId = bill.texts[0].doc_id;
            const billText = await ServerLegiScanApi.getBillText(documentId);
            
            if (billText && billText.doc) {
              // Extract text from base64 encoded document
              const textContent = Buffer.from(billText.doc, 'base64').toString();
              // Create embeddings for text search
              await embedBill({ bill_id: bill.bill_id, text: textContent });
            }
          }
        } catch (error) {
          console.error(`[API] Error embedding bill ${billId}:`, error);
          // Continue despite embedding errors
        }
      }
    }
    
    // Update the in-memory cache
    billCache = newBillCache;
    lastFetchTime = Date.now();
    
    // Update KV cache
    try {
      await kv.set(BILLS_CACHE_KEY, newBillCache, { ex: CACHE_TTL });
      await kv.set('vbc:bills:lastUpdated', new Date().toISOString(), { ex: CACHE_TTL });
    } catch (error) {
      console.error('[API] KV bills cache write error:', error);
      // Continue despite KV errors
    }
    
    // Revalidate cache for the bills page
    revalidateTag('va-bills');
    
    console.log(`[API] Updated ${Object.keys(newBillCache).length} bills`);
    return Object.keys(newBillCache).map(Number);
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
  
  // Also update KV cache if available
  try {
    const kvBillCache: Record<string, any> = {};
    mockBills.forEach(bill => {
      kvBillCache[bill.bill_id] = bill;
    });
    
    kv.set(BILLS_CACHE_KEY, kvBillCache, { ex: CACHE_TTL });
    kv.set('vbc:bills:lastUpdated', new Date().toISOString(), { ex: CACHE_TTL });
  } catch (error) {
    console.error('[API] KV mock bills cache write error:', error);
    // Continue despite KV errors
  }

  return NextResponse.json({
    bills: mockBills,
    cached: false,
    lastUpdated: new Date(lastFetchTime).toISOString()
  });
}
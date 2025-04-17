import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import * as LegiScan from '@/lib/legiscan';

// In-memory cache for bills (in production, use Redis or database)
// Exported so the [id] route can access the same cache
export let billCache: Record<string, any> = {};
let lastFetchTime = 0;
const CACHE_TTL = process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : 3600000; // 1 hour in milliseconds

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
export async function GET() {
  try {
    // Check if cache is still valid
    const now = Date.now();
    if (now - lastFetchTime < CACHE_TTL && Object.keys(billCache).length > 0) {
      console.log('[API] Returning cached bills');
      return NextResponse.json({
        bills: Object.values(billCache),
        cached: true,
        lastUpdated: new Date(lastFetchTime).toISOString()
      });
    }

    // In development/testing mode, use mock data to avoid API calls
    if (process.env.NODE_ENV === 'development' && !process.env.USE_REAL_API) {
      console.log('[API] Using mock data in development');
      return getMockBills();
    }

    // In production or when testing real API, fetch from LegiScan
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
    // Get current session for Virginia
    const currentSession = await LegiScan.getCurrentSession('VA');
    if (!currentSession) {
      throw new Error('No active session found for Virginia');
    }
    
    // Get master list of bills
    const masterList = await LegiScan.getMasterListRaw(currentSession.session_id);
    
    // Get stored change hashes
    const oldHashes: Record<string, string> = {};
    Object.entries(billCache).forEach(([billId, bill]) => {
      oldHashes[billId] = bill.change_hash;
    });
    
    // Find changed bills
    const changedBillIds = LegiScan.diffHashes(masterList, oldHashes);
    
    // If this is our first run, limit to blockchain-related bills only
    const isFirstRun = Object.keys(billCache).length === 0;
    
    if (isFirstRun) {
      console.log('[API] Initial load - filtering for blockchain-related bills');
      
      // Filter master list for blockchain-related bills
      const blockchainKeywords = ['blockchain', 'crypto', 'digital asset', 'token', 'cryptocurrency', 'distributed ledger'];
      
      for (const [billId, bill] of Object.entries(masterList)) {
        const title = bill.title?.toLowerCase() || '';
        const description = bill.description?.toLowerCase() || '';
        
        const isBlockchainRelated = blockchainKeywords.some(keyword => 
          title.includes(keyword) || description.includes(keyword)
        );
        
        if (isBlockchainRelated) {
          changedBillIds.push(Number(billId));
        }
      }
    }
    
    console.log(`[API] Fetching details for ${changedBillIds.length} bills`);
    
    // Fetch details for changed bills
    for (const billId of changedBillIds) {
      const billDetails = await LegiScan.getBill(billId);
      
      billCache[billId] = {
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
    
    lastFetchTime = Date.now();
    
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
 * Get mock bills for development
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

  billCache = {};
  mockBills.forEach(bill => {
    billCache[bill.bill_id] = bill;
  });
  lastFetchTime = Date.now();

  return NextResponse.json({
    bills: mockBills,
    cached: false,
    lastUpdated: new Date(lastFetchTime).toISOString()
  });
}
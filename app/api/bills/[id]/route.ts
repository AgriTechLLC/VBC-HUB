import { NextRequest, NextResponse } from 'next/server';
import { ServerLegiScanApi } from '@/lib/legiscan/server';
import { kv } from '@vercel/kv';

// External reference to the bill cache from the main bills API route
import { billCache } from '../route';

// Constants
const BILLS_CACHE_KEY = 'vbc:bills:all';
const BILL_CACHE_TTL = process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : 3600; // 1 hour in seconds

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const billId = params.id;
    
    // Check for mock parameter
    const url = new URL(request.url);
    const useMock = url.searchParams.get('mock') === 'true';
    
    if (useMock || (process.env.NODE_ENV === 'development' && !process.env.USE_REAL_API)) {
      return getMockBill(billId);
    }
    
    // Try to get the bill from KV first
    try {
      // Check if bill exists in the KV bills cache
      const cachedBills = await kv.get(BILLS_CACHE_KEY) as Record<string, any> || {};
      if (cachedBills && cachedBills[billId]) {
        return NextResponse.json(cachedBills[billId]);
      }
      
      // Also check individual bill cache
      const cacheBillKey = `vbc:bill:${billId}`;
      const cachedBill = await kv.get(cacheBillKey);
      if (cachedBill) {
        return NextResponse.json(cachedBill);
      }
    } catch (error) {
      console.error(`[API] KV bill cache read error for ${billId}:`, error);
      // Continue with in-memory cache or API fetch
    }
    
    // Check in-memory cache if KV fails or is empty
    if (billCache[billId]) {
      return NextResponse.json(billCache[billId]);
    }
    
    // If not in any cache, fetch from LegiScan
    try {
      const bill = await ServerLegiScanApi.getBill(parseInt(billId));
      
      // Transform LegiScan response to our bill format
      const billData = {
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
        change_hash: bill.change_hash,
        // Adding additional fields that might be useful for bill detail views
        full_history: bill.history || [],
        sponsors: bill.sponsors || [],
        texts: bill.texts || [],
        votes: bill.votes || [],
        session: bill.session,
        amendments: bill.amendments || []
      };
      
      // Add to in-memory cache
      billCache[billId] = billData;
      
      // Add to KV cache if available
      try {
        // Cache individual bill
        const billCacheKey = `vbc:bill:${billId}`;
        await kv.set(billCacheKey, billData, { ex: BILL_CACHE_TTL });
        
        // Update all bills cache
        const cachedBills = await kv.get(BILLS_CACHE_KEY) as Record<string, any> || {};
        cachedBills[billId] = billData;
        await kv.set(BILLS_CACHE_KEY, cachedBills, { ex: BILL_CACHE_TTL });
      } catch (error) {
        console.error(`[API] KV bill cache write error for ${billId}:`, error);
        // Continue despite KV errors
      }
      
      return NextResponse.json(billData);
    } catch (error) {
      console.error(`[API] Error fetching bill ${billId}:`, error);
      return NextResponse.json(
        { error: `Bill not found: ${billId}` },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('[API] Error in bill detail route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bill' },
      { status: 500 }
    );
  }
}

/**
 * Get a mock bill for development and testing
 */
function getMockBill(billId: string) {
  // Mock data for specific bill IDs
  const mockBills: Record<string, any> = {
    '1234567': {
      bill_id: 1234567,
      bill_number: "HB1234",
      title: "Digital Asset Trading Regulation",
      status_id: 7,
      status: "Committee",
      progress: 30,
      last_action: "Referred to Commerce Committee",
      last_action_date: "2024-03-15",
      url: "https://lis.virginia.gov/cgi-bin/legp604.exe?251+sum+HB1234",
      description: "A bill to establish a framework for the regulation of digital asset trading platforms in the Commonwealth. This legislation aims to create licensing requirements, consumer protections, and operational standards for businesses that facilitate the exchange of digital currencies and blockchain-based assets. The bill includes provisions for registration with the State Corporation Commission, minimum capital requirements, cybersecurity standards, and disclosure requirements for consumer protection.",
      change_hash: "abc123",
      full_history: [
        { date: "2024-03-15", action: "Referred to Commerce Committee", chamber: "House", importance: 1 },
        { date: "2024-03-10", action: "First reading", chamber: "House", importance: 1 },
        { date: "2024-03-05", action: "Prefiled", chamber: "House", importance: 1 }
      ],
      sponsors: [
        { name: "Jane Smith", party: "Republican", district: "12th" },
        { name: "John Doe", party: "Democrat", district: "8th" }
      ],
      texts: [
        { doc_id: 12345, date: "2024-03-10", type: "Introduced", type_id: 1 }
      ],
      votes: [],
      amendments: []
    },
    '5678901': {
      bill_id: 5678901,
      bill_number: "SB5678",
      title: "Blockchain Technology Innovation Act",
      status_id: 4,
      status: "Passed",
      progress: 100,
      last_action: "Signed by Governor",
      last_action_date: "2024-03-10",
      url: "https://lis.virginia.gov/cgi-bin/legp604.exe?251+sum+SB5678",
      description: "Establishes the Blockchain Technology Innovation Fund and authorizes grants to blockchain technology companies establishing operations in the Commonwealth. The fund will provide financial support for startups and established businesses developing blockchain solutions with applications in finance, supply chain, healthcare, and government services. The legislation also creates a Blockchain Advisory Council to guide the distribution of funds and promote Virginia as a hub for distributed ledger technology innovation.",
      change_hash: "def456",
      full_history: [
        { date: "2024-03-10", action: "Signed by Governor", chamber: "Executive", importance: 1 },
        { date: "2024-03-05", action: "Passed House (98-2)", chamber: "House", importance: 1 },
        { date: "2024-02-28", action: "Passed Senate (35-5)", chamber: "Senate", importance: 1 },
        { date: "2024-02-15", action: "Reported from Finance Committee (15-0)", chamber: "Senate", importance: 1 },
        { date: "2024-01-20", action: "Introduced", chamber: "Senate", importance: 1 }
      ],
      sponsors: [
        { name: "Robert Johnson", party: "Republican", district: "10th" },
        { name: "Sarah Williams", party: "Republican", district: "6th" },
        { name: "Michael Chen", party: "Democrat", district: "30th" }
      ],
      texts: [
        { doc_id: 23456, date: "2024-01-20", type: "Introduced", type_id: 1 },
        { doc_id: 23457, date: "2024-02-15", type: "Committee Substitute", type_id: 2 },
        { doc_id: 23458, date: "2024-03-10", type: "Enrolled", type_id: 5 }
      ],
      votes: [
        { roll_call_id: 12345, date: "2024-02-28", chamber: "Senate", yea: 35, nay: 5, passed: 1 },
        { roll_call_id: 12346, date: "2024-03-05", chamber: "House", yea: 98, nay: 2, passed: 1 }
      ],
      amendments: []
    },
    '9012345': {
      bill_id: 9012345,
      bill_number: "HB4567",
      title: "Cryptocurrency Taxation Standards",
      status_id: 8,
      status: "Referred",
      progress: 20,
      last_action: "Referred to Finance Committee",
      last_action_date: "2024-03-05",
      url: "https://lis.virginia.gov/cgi-bin/legp604.exe?251+sum+HB4567",
      description: "Sets standards for the taxation of cryptocurrency transactions and mining operations in Virginia. This bill establishes clear guidelines for reporting capital gains and losses from digital asset investments, creates a framework for assessing property taxes on cryptocurrency mining equipment, and addresses income tax implications for rewards earned through staking and validation activities on proof-of-stake blockchains.",
      change_hash: "ghi789",
      full_history: [
        { date: "2024-03-05", action: "Referred to Finance Committee", chamber: "House", importance: 1 },
        { date: "2024-03-01", action: "First reading", chamber: "House", importance: 1 },
        { date: "2024-02-25", action: "Prefiled", chamber: "House", importance: 1 }
      ],
      sponsors: [
        { name: "Thomas Anderson", party: "Republican", district: "15th" },
        { name: "Elizabeth Taylor", party: "Republican", district: "22nd" }
      ],
      texts: [
        { doc_id: 34567, date: "2024-02-25", type: "Introduced", type_id: 1 }
      ],
      votes: [],
      amendments: []
    },
    '3456789': {
      bill_id: 3456789,
      bill_number: "SB7890",
      title: "Digital Identity Verification Act",
      status_id: 10,
      status: "Amended",
      progress: 60,
      last_action: "House amendments agreed to by Senate",
      last_action_date: "2024-04-12",
      url: "https://lis.virginia.gov/cgi-bin/legp604.exe?251+sum+SB7890",
      description: "Establishes a framework for digital identity verification using distributed ledger technology for state services and agencies. The bill authorizes the creation of a blockchain-based system for Virginians to securely store and selectively share identity credentials with government agencies and approved private entities. It includes privacy protections, technical standards for implementation, and provisions for interoperability with federal and other state identity systems.",
      change_hash: "jkl012",
      full_history: [
        { date: "2024-04-12", action: "House amendments agreed to by Senate", chamber: "Senate", importance: 1 },
        { date: "2024-04-10", action: "Passed House with amendments (90-10)", chamber: "House", importance: 1 },
        { date: "2024-03-25", action: "Passed Senate (32-8)", chamber: "Senate", importance: 1 },
        { date: "2024-03-15", action: "Reported from Technology Committee (12-3)", chamber: "Senate", importance: 1 },
        { date: "2024-02-10", action: "Introduced", chamber: "Senate", importance: 1 }
      ],
      sponsors: [
        { name: "Patricia Garcia", party: "Democrat", district: "18th" },
        { name: "James Wilson", party: "Democrat", district: "25th" },
        { name: "Richard Brown", party: "Republican", district: "5th" }
      ],
      texts: [
        { doc_id: 45678, date: "2024-02-10", type: "Introduced", type_id: 1 },
        { doc_id: 45679, date: "2024-03-15", type: "Committee Substitute", type_id: 2 },
        { doc_id: 45680, date: "2024-04-10", type: "Amended", type_id: 3 }
      ],
      votes: [
        { roll_call_id: 23456, date: "2024-03-25", chamber: "Senate", yea: 32, nay: 8, passed: 1 },
        { roll_call_id: 23457, date: "2024-04-10", chamber: "House", yea: 90, nay: 10, passed: 1 }
      ],
      amendments: [
        { amendment_id: 12345, date: "2024-04-10", title: "Privacy Protections Amendment", adopted: 1 }
      ]
    }
  };
  
  // Cache the mock bill in KV if available
  if (mockBills[billId]) {
    try {
      const billCacheKey = `vbc:bill:${billId}`;
      kv.set(billCacheKey, mockBills[billId], { ex: BILL_CACHE_TTL });
    } catch (error) {
      console.error(`[API] KV mock bill cache write error for ${billId}:`, error);
      // Continue despite KV errors
    }
  }
  
  // Return the mock bill if it exists, otherwise 404
  if (mockBills[billId]) {
    return NextResponse.json(mockBills[billId]);
  } else {
    return NextResponse.json(
      { error: `Bill not found: ${billId}` },
      { status: 404 }
    );
  }
}
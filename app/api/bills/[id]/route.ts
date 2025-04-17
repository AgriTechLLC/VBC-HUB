import { NextRequest, NextResponse } from 'next/server';
import * as LegiScan from '@/lib/legiscan';

// External reference to the bill cache from the main bills API route
// In production, this would be replaced with a database or Redis
import { billCache } from '../route';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const billId = params.id;
    
    // First check if the bill is in our cache
    if (billCache[billId]) {
      return NextResponse.json(billCache[billId]);
    }
    
    // If not in cache, check if we're in development mode with mock data
    if (process.env.NODE_ENV === 'development' && !process.env.USE_REAL_API) {
      return getMockBill(billId);
    }
    
    // If we're in production or testing real API, fetch from LegiScan
    try {
      const bill = await LegiScan.getBill(parseInt(billId));
      
      // Transform LegiScan response to our bill format
      const billData = {
        bill_id: bill.bill_id,
        bill_number: bill.bill_number,
        title: bill.title,
        status_id: bill.status,
        status: LegiScan.getBillStatusDescription(bill.status),
        progress: LegiScan.calculateProgress(bill.status),
        last_action: bill.history[0]?.action || 'No action',
        last_action_date: bill.history[0]?.date || new Date().toISOString().split('T')[0],
        url: bill.state_link,
        description: bill.description || '',
        change_hash: bill.change_hash
      };
      
      // Add to cache
      billCache[billId] = billData;
      
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
 * Get a mock bill for development
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
      change_hash: "abc123"
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
      change_hash: "def456"
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
      change_hash: "ghi789"
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
      change_hash: "jkl012"
    }
  };
  
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
import { NextRequest, NextResponse } from 'next/server';
import { ServerLegiScanApi } from '@/lib/legiscan/server';

/**
 * GET handler for /api/bills/[id]/sponsors
 * Returns sponsors for a specific bill
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const billId = params.id;
    
    // Validate parameter
    if (!billId || isNaN(parseInt(billId))) {
      return NextResponse.json({
        error: true,
        message: 'Invalid bill ID parameter'
      }, { status: 400 });
    }
    
    // Check for mock parameter
    const searchParams = request.nextUrl.searchParams;
    const useMock = searchParams.get('mock') === 'true';
    
    if (useMock || (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_REAL_API !== 'true')) {
      return NextResponse.json(getMockSponsors(billId));
    }
    
    // Fetch bill sponsors
    const sponsors = await ServerLegiScanApi.getBillSponsors(billId);
    
    // Format response
    return NextResponse.json({
      success: true,
      billId: parseInt(billId),
      sponsors: sponsors
    });
  } catch (error: any) {
    console.error(`Error fetching sponsors for bill ${params.id}:`, error);
    return NextResponse.json({
      error: true,
      message: error.message || 'Failed to fetch bill sponsors'
    }, { status: 500 });
  }
}

/**
 * Generate mock sponsors data for testing
 */
function getMockSponsors(billId: string) {
  return {
    success: true,
    billId: parseInt(billId),
    sponsors: [
      {
        people_id: 12345,
        person_hash: "abcde12345",
        party_id: "D",
        party: "Democratic",
        role_id: 1,
        role: "Representative",
        name: "Jane Smith",
        first_name: "Jane",
        middle_name: "",
        last_name: "Smith",
        suffix: "",
        nickname: "",
        district: "15",
        sponsor_type_id: 1,
        sponsor_order: 1,
        committee_sponsor: 0,
        committee_id: 0
      },
      {
        people_id: 67890,
        person_hash: "fghij67890",
        party_id: "R",
        party: "Republican",
        role_id: 2,
        role: "Senator",
        name: "John Doe",
        first_name: "John",
        middle_name: "A",
        last_name: "Doe",
        suffix: "Jr",
        nickname: "",
        district: "22",
        sponsor_type_id: 2,
        sponsor_order: 2,
        committee_sponsor: 0,
        committee_id: 0
      }
    ]
  };
}
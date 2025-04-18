import { NextRequest, NextResponse } from 'next/server';
import { ServerLegiScanApi } from '@/lib/legiscan/server';

/**
 * GET handler for /api/people/[id]
 * Returns details for a specific legislator
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const peopleId = params.id;
    
    // Validate parameter
    if (!peopleId || isNaN(parseInt(peopleId))) {
      return NextResponse.json({
        error: true,
        message: 'Invalid people ID parameter'
      }, { status: 400 });
    }
    
    // Check for mock parameter
    const searchParams = request.nextUrl.searchParams;
    const useMock = searchParams.get('mock') === 'true';
    
    if (useMock || (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_REAL_API !== 'true')) {
      return NextResponse.json(getMockPerson(peopleId));
    }
    
    // Fetch person data
    const person = await ServerLegiScanApi.getPerson(peopleId);
    
    // Format response
    return NextResponse.json({
      success: true,
      person: person
    });
  } catch (error: any) {
    console.error(`Error fetching person data for ID ${params.id}:`, error);
    return NextResponse.json({
      error: true,
      message: error.message || 'Failed to fetch person data'
    }, { status: 500 });
  }
}

/**
 * Generate mock person data for testing
 */
function getMockPerson(peopleId: string) {
  return {
    success: true,
    person: {
      people_id: parseInt(peopleId),
      person_hash: "abcde12345",
      state_id: 47, // VA
      party_id: "D",
      party: "Democratic",
      role_id: 2,
      role: "Senator",
      name: "Jane Smith",
      first_name: "Jane",
      middle_name: "M",
      last_name: "Smith",
      suffix: "",
      nickname: "",
      district: "15",
      ftm_eid: 12345,
      votesmart_id: 67890,
      opensecrets_id: "VA15",
      knowwho_pid: 54321,
      ballotpedia: "Jane_Smith",
      committee_sponsor: 0,
      committee_id: 0
    }
  };
}
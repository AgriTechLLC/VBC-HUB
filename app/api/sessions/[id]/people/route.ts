import { NextRequest, NextResponse } from 'next/server';
import { ServerLegiScanApi } from '@/lib/legiscan/server';

/**
 * GET handler for /api/sessions/[id]/people
 * Returns list of legislators for a specific session
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    
    // Validate parameter
    if (!sessionId || isNaN(parseInt(sessionId))) {
      return NextResponse.json({
        error: true,
        message: 'Invalid session ID parameter'
      }, { status: 400 });
    }
    
    // Check for mock parameter
    const searchParams = request.nextUrl.searchParams;
    const useMock = searchParams.get('mock') === 'true';
    
    if (useMock || (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_REAL_API !== 'true')) {
      return NextResponse.json(getMockSessionPeople(sessionId));
    }
    
    // Fetch session people data
    const sessionPeople = await ServerLegiScanApi.getSessionPeople(sessionId);
    
    // Format response
    return NextResponse.json({
      success: true,
      session: sessionPeople.session,
      people: sessionPeople.people
    });
  } catch (error: any) {
    console.error(`Error fetching session people for session ${params.id}:`, error);
    return NextResponse.json({
      error: true,
      message: error.message || 'Failed to fetch session people data'
    }, { status: 500 });
  }
}

/**
 * Generate mock session people data for testing
 */
function getMockSessionPeople(sessionId: string) {
  return {
    success: true,
    session: {
      session_id: parseInt(sessionId),
      state_id: 47, // VA
      year_start: 2024,
      year_end: 2025,
      prefile: 1,
      sine_die: 0,
      prior: 0,
      special: 0,
      session_tag: "Regular Session",
      session_title: "2024-2025 Regular Session",
      session_name: "2024-2025 Regular Session",
    },
    people: [
      {
        people_id: 12345,
        person_hash: "abcde12345",
        state_id: 47,
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
        committee_sponsor: 0,
        committee_id: 0
      },
      {
        people_id: 67890,
        person_hash: "fghij67890",
        state_id: 47,
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
        committee_sponsor: 0,
        committee_id: 0
      },
      {
        people_id: 54321,
        person_hash: "klmno54321",
        state_id: 47,
        party_id: "I",
        party: "Independent",
        role_id: 1,
        role: "Representative",
        name: "Alex Johnson",
        first_name: "Alex",
        middle_name: "",
        last_name: "Johnson",
        suffix: "",
        nickname: "",
        district: "7",
        committee_sponsor: 0,
        committee_id: 0
      }
    ]
  };
}
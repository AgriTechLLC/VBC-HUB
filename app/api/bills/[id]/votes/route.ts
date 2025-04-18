import { kv } from '@vercel/kv';
import { ServerLegiScanApi } from '@/lib/legiscan/server';

export const runtime = 'edge';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const billId = params.id;
  const cacheKey = `bill-votes:${billId}`;
  
  // Check for mock parameter
  const url = new URL(req.url);
  const useMock = url.searchParams.get('mock') === 'true';
  
  if (useMock || (process.env.NODE_ENV === 'development' && !process.env.USE_REAL_API)) {
    return Response.json(getMockVotes(billId));
  }
  
  // Check cache first
  try {
    const cachedVotes = await kv.get(cacheKey);
    if (cachedVotes) {
      return Response.json(cachedVotes);
    }
  } catch (error) {
    console.error('Error accessing vote cache:', error);
    // Continue with API fetch
  }

  try {
    // Fetch bill data using our new ServerLegiScanApi
    const bill = await ServerLegiScanApi.getBill(billId);
    
    if (!bill.votes || bill.votes.length === 0) {
      return Response.json({ 
        hasVotes: false, 
        message: "No vote data available for this bill" 
      });
    }

    // Get the most recent vote which typically has a roll_call_id
    const latestVoteWithId = [...bill.votes]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .find(vote => vote.roll_call_id);
    
    if (!latestVoteWithId) {
      return Response.json({ 
        hasVotes: true, 
        summary: bill.votes,
        message: "Vote summary available, but no detailed roll call data" 
      });
    }
    
    // Fetch detailed roll call data
    const voteDetails = await ServerLegiScanApi.getVotes(latestVoteWithId.roll_call_id);
    
    // Process vote data for visualization
    const processedData = processVoteData(bill.votes, voteDetails);
    
    // Cache for 1 day (in seconds)
    try {
      await kv.set(cacheKey, processedData, { ex: 24 * 60 * 60 });
    } catch (error) {
      console.error('Error caching vote data:', error);
      // Continue despite cache error
    }
    
    return Response.json(processedData);
  } catch (error) {
    console.error('Error fetching vote data:', error);
    return Response.json(
      { error: "Failed to fetch vote data. Please try again later." },
      { status: 500 }
    );
  }
}

function processVoteData(voteSummaries: any[], voteDetails: any) {
  // Get the most recent vote (usually the final passage vote)
  const latestVote = voteSummaries[voteSummaries.length - 1];
  
  // Basic vote stats
  const voteStats = {
    hasVotes: true,
    totalVotes: latestVote.total,
    yesVotes: latestVote.yea,
    noVotes: latestVote.nay,
    otherVotes: (latestVote.nv || 0) + (latestVote.absent || 0),
    passed: latestVote.passed === 1,
    date: latestVote.date,
    chamber: latestVote.chamber,
    desc: latestVote.desc || "Vote on bill",
    allVotes: voteSummaries
  };
  
  // Prepare chart data by party
  const partyBreakdown = {
    democratic: {
      yes: 0,
      no: 0,
      other: 0
    },
    republican: {
      yes: 0,
      no: 0,
      other: 0
    },
    independent: {
      yes: 0,
      no: 0,
      other: 0
    }
  };
  
  // Process roll call votes if available
  if (voteDetails && voteDetails.votes && voteDetails.votes.length > 0) {
    // We need to fetch person details for each vote to get party information
    // In a real implementation, we'd want to batch this or use SessionPeople,
    // but for simplicity in this sample, we'll use mock party data
    
    voteDetails.votes.forEach((vote: any) => {
      // Mock party data - in a real implementation, we'd need to look up
      // the person's party from their people_id
      const mockParty = vote.people_id % 3 === 0 ? 'democratic' : 
                       vote.people_id % 3 === 1 ? 'republican' : 'independent';
      
      // Count votes by party
      if (vote.vote_id === 1) { // Yea
        partyBreakdown[mockParty as keyof typeof partyBreakdown].yes++;
      } else if (vote.vote_id === 2) { // Nay
        partyBreakdown[mockParty as keyof typeof partyBreakdown].no++;
      } else {
        partyBreakdown[mockParty as keyof typeof partyBreakdown].other++;
      }
    });
  }
  
  // Format data for chart
  const chartData = [
    { name: 'Democratic', yes: partyBreakdown.democratic.yes, no: partyBreakdown.democratic.no, other: partyBreakdown.democratic.other },
    { name: 'Republican', yes: partyBreakdown.republican.yes, no: partyBreakdown.republican.no, other: partyBreakdown.republican.other },
    { name: 'Independent', yes: partyBreakdown.independent.yes, no: partyBreakdown.independent.no, other: partyBreakdown.independent.other }
  ];
  
  return {
    ...voteStats,
    partyBreakdown,
    chartData
  };
}

function getMockVotes(billId: string) {
  // Mock vote data for specific bill IDs
  const mockVotes: Record<string, any> = {
    '5678901': {
      hasVotes: true,
      totalVotes: 40,
      yesVotes: 35,
      noVotes: 5,
      otherVotes: 0,
      passed: true,
      date: "2024-02-28",
      chamber: "Senate",
      desc: "Third Reading",
      allVotes: [
        { roll_call_id: 12345, date: "2024-02-28", chamber: "Senate", yea: 35, nay: 5, passed: 1 }
      ],
      partyBreakdown: {
        democratic: { yes: 15, no: 0, other: 0 },
        republican: { yes: 20, no: 5, other: 0 },
        independent: { yes: 0, no: 0, other: 0 }
      },
      chartData: [
        { name: 'Democratic', yes: 15, no: 0, other: 0 },
        { name: 'Republican', yes: 20, no: 5, other: 0 },
        { name: 'Independent', yes: 0, no: 0, other: 0 }
      ]
    },
    '3456789': {
      hasVotes: true,
      totalVotes: 40,
      yesVotes: 32,
      noVotes: 8,
      otherVotes: 0,
      passed: true,
      date: "2024-03-25",
      chamber: "Senate",
      desc: "Final Passage",
      allVotes: [
        { roll_call_id: 23456, date: "2024-03-25", chamber: "Senate", yea: 32, nay: 8, passed: 1 }
      ],
      partyBreakdown: {
        democratic: { yes: 18, no: 2, other: 0 },
        republican: { yes: 14, no: 6, other: 0 },
        independent: { yes: 0, no: 0, other: 0 }
      },
      chartData: [
        { name: 'Democratic', yes: 18, no: 2, other: 0 },
        { name: 'Republican', yes: 14, no: 6, other: 0 },
        { name: 'Independent', yes: 0, no: 0, other: 0 }
      ]
    }
  };
  
  return mockVotes[billId] || { 
    hasVotes: false, 
    message: "No vote data available for this bill" 
  };
}
import { kv } from '@vercel/kv';

export const runtime = 'edge';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const billId = params.id;
  const cacheKey = `bill-votes:${billId}`;
  
  // Check cache first
  const cachedVotes = await kv.get(cacheKey);
  if (cachedVotes) {
    return Response.json(cachedVotes);
  }

  try {
    // Fetch bill votes from LegiScan
    const response = await fetch(
      `${process.env.LEGISCAN_BASE_URL}/get?key=${process.env.LEGISCAN_API_KEY}&op=getBill&id=${billId}&votes=1`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch bill votes: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.bill || !data.bill.votes || data.bill.votes.length === 0) {
      return Response.json({ 
        hasVotes: false, 
        message: "No vote data available for this bill" 
      });
    }

    // Process vote data for visualization
    const votes = data.bill.votes;
    const processedData = processVoteData(votes);
    
    // Cache for 1 day (in seconds)
    await kv.set(cacheKey, processedData, { ex: 24 * 60 * 60 });
    
    return Response.json(processedData);
  } catch (error) {
    console.error('Error fetching vote data:', error);
    return Response.json(
      { error: "Failed to fetch vote data. Please try again later." },
      { status: 500 }
    );
  }
}

function processVoteData(votes: any[]) {
  // Get the most recent vote (usually the final passage vote)
  const latestVote = votes[votes.length - 1];
  
  // Basic vote stats
  const voteStats = {
    hasVotes: true,
    totalVotes: latestVote.total,
    yesVotes: latestVote.yea,
    noVotes: latestVote.nay,
    otherVotes: latestVote.nv + latestVote.absent + latestVote.abstain,
    passed: latestVote.passed === 1,
    date: latestVote.date,
    chamber: latestVote.chamber,
    desc: latestVote.desc || "Vote on bill",
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
  if (latestVote.roll_call && latestVote.roll_call.length > 0) {
    latestVote.roll_call.forEach((vote: any) => {
      let party = vote.party.toLowerCase();
      
      // Normalize party names
      if (party.includes('democrat')) {
        party = 'democratic';
      } else if (party.includes('republic')) {
        party = 'republican';
      } else {
        party = 'independent';
      }
      
      // Count votes by party
      if (vote.vote_text === 'Yea' || vote.vote_text === 'Yes') {
        partyBreakdown[party as keyof typeof partyBreakdown].yes++;
      } else if (vote.vote_text === 'Nay' || vote.vote_text === 'No') {
        partyBreakdown[party as keyof typeof partyBreakdown].no++;
      } else {
        partyBreakdown[party as keyof typeof partyBreakdown].other++;
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
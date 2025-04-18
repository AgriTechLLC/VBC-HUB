import { NextRequest } from 'next/server';
import { ServerLegiScanApi } from '@/lib/legiscan/server';
import { kv } from '@vercel/kv';

export const runtime = 'edge';

export async function GET(
  req: Request
) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const year = searchParams.get('year') || '';
  
  // Check for empty query
  if (!query || query.trim() === '') {
    return Response.json({
      results: [],
      total: 0,
      page: 1,
      totalPages: 0,
      query
    });
  }
  
  // Check for mock parameter
  const useMock = searchParams.get('mock') === 'true';
  
  if (useMock || (process.env.NODE_ENV === 'development' && !process.env.USE_REAL_API)) {
    return Response.json(getMockSearchResults(query));
  }
  
  // Create a cache key based on the search query and parameters
  const cacheKey = `search:${query.toLowerCase()}:${year}:${page}`;
  
  // Check cache first
  try {
    const cachedResults = await kv.get(cacheKey);
    if (cachedResults) {
      console.log('Using cached search results for', query);
      return Response.json(cachedResults);
    }
  } catch (error) {
    console.error('Error accessing search cache:', error);
    // Continue with API fetch
  }
  
  try {
    // Perform search using the ServerLegiScanApi
    const searchParams: any = { 
      state: 'VA', 
      query: query, 
      page 
    };
    
    if (year && !isNaN(parseInt(year))) {
      searchParams.year = parseInt(year);
    }
    
    const searchResults = await ServerLegiScanApi.searchVaBills(query, {
      year: year ? parseInt(year) : undefined,
      page
    });
    
    // Format the search results
    const results = Object.entries(searchResults.searchresult || {})
      .filter(([key]) => key !== 'summary')
      .map(([_, value]: [string, any]) => ({
        id: value.bill_id,
        number: value.bill_number,
        title: value.title,
        description: value.description || '',
        status: value.status_desc,
        statusId: value.status_id,
        lastAction: value.last_action,
        lastActionDate: value.last_action_date,
        url: value.state_link,
        relevance: value.relevance
      }));
    
    // Extract pagination information
    const { summary } = searchResults.searchresult || { summary: { page: 1, page_total: 1 } };
    
    const response = {
      results,
      total: results.length,
      page: summary.page || 1,
      totalPages: summary.page_total || 1,
      query
    };
    
    // Cache the results (15 minutes for search results)
    try {
      await kv.set(cacheKey, response, { ex: 900 });
    } catch (error) {
      console.error('Error caching search results:', error);
      // Continue despite cache error
    }
    
    return Response.json(response);
  } catch (error) {
    console.error('Error searching bills:', error);
    return Response.json(
      { error: 'Failed to search bills. Please try again later.', query },
      { status: 500 }
    );
  }
}

function getMockSearchResults(query: string) {
  // Simplified mock results that match the query in some way
  const allMockResults = [
    {
      id: 1234567,
      number: "HB1234",
      title: "Digital Asset Trading Regulation",
      description: "A bill to establish a framework for the regulation of digital asset trading platforms in the Commonwealth.",
      status: "In Committee",
      statusId: 7,
      lastAction: "Referred to Commerce Committee",
      lastActionDate: "2024-03-15",
      url: "https://lis.virginia.gov/cgi-bin/legp604.exe?251+sum+HB1234",
      relevance: 95
    },
    {
      id: 5678901,
      number: "SB5678",
      title: "Blockchain Technology Innovation Act",
      description: "Establishes the Blockchain Technology Innovation Fund and authorizes grants to blockchain technology companies establishing operations in the Commonwealth.",
      status: "Passed",
      statusId: 4,
      lastAction: "Signed by Governor",
      lastActionDate: "2024-03-10",
      url: "https://lis.virginia.gov/cgi-bin/legp604.exe?251+sum+SB5678",
      relevance: 90
    },
    {
      id: 9012345,
      number: "HB4567",
      title: "Cryptocurrency Taxation Standards",
      description: "Sets standards for the taxation of cryptocurrency transactions and mining operations in Virginia.",
      status: "Referred",
      statusId: 8,
      lastAction: "Referred to Finance Committee",
      lastActionDate: "2024-03-05", 
      url: "https://lis.virginia.gov/cgi-bin/legp604.exe?251+sum+HB4567",
      relevance: 85
    },
    {
      id: 3456789,
      number: "SB7890",
      title: "Digital Identity Verification Act",
      description: "Establishes a framework for digital identity verification using distributed ledger technology for state services and agencies.",
      status: "Amended",
      statusId: 10,
      lastAction: "House amendments agreed to by Senate",
      lastActionDate: "2024-04-12",
      url: "https://lis.virginia.gov/cgi-bin/legp604.exe?251+sum+SB7890",
      relevance: 80
    },
    {
      id: 5678902,
      number: "HB2222",
      title: "Blockchain Technology Task Force",
      description: "Establishes a task force to study the potential applications of blockchain technology in government operations.",
      status: "In Committee",
      statusId: 7,
      lastAction: "Referred to Science and Technology Committee",
      lastActionDate: "2024-02-15",
      url: "https://lis.virginia.gov/cgi-bin/legp604.exe?251+sum+HB2222",
      relevance: 75
    }
  ];
  
  // Simple filtering based on query string presence in title or description
  const queryLower = query.toLowerCase();
  const results = allMockResults.filter(
    bill => bill.title.toLowerCase().includes(queryLower) || 
           bill.description.toLowerCase().includes(queryLower)
  );
  
  return {
    results,
    total: results.length,
    page: 1,
    totalPages: 1,
    query
  };
}
import { NextRequest, NextResponse } from 'next/server';
import { ServerLegiScanApi } from '@/lib/legiscan/server';
import { kv } from '@vercel/kv';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  // Get search parameters
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  
  // Parse and validate numeric parameters with defaults
  const page = searchParams.has('page') 
    ? Math.max(1, parseInt(searchParams.get('page') || '1')) 
    : 1;
    
  const year = searchParams.has('year') 
    ? parseInt(searchParams.get('year') || '0') 
    : new Date().getFullYear(); // Default to current year
  
  // Get optional parameters
  const state = searchParams.get('state')?.toUpperCase() || 'VA'; // Default to Virginia
  const sessionId = searchParams.has('session_id') 
    ? parseInt(searchParams.get('session_id') || '0') 
    : undefined;
    
  // Check for empty query
  if (!query || query.trim() === '') {
    return NextResponse.json({
      results: [],
      total: 0,
      page: 1,
      totalPages: 0,
      query
    });
  }
  
  // Check for mock parameter
  const useMock = searchParams.get('mock') === 'true';
  
  if (useMock || (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_REAL_API !== 'true')) {
    return NextResponse.json(getMockSearchResults(query));
  }
  
  // Create a cache key based on the search query and parameters
  // Include sessionId in cache key if provided
  const cacheKey = sessionId 
    ? `search:${query.toLowerCase()}:session:${sessionId}:${page}`
    : `search:${query.toLowerCase()}:${state}:${year}:${page}`;
  
  // Check cache first (15 minute TTL for search)
  try {
    const cachedResults = await kv.get(cacheKey);
    if (cachedResults) {
      console.log('Using cached search results for', query);
      return NextResponse.json(cachedResults);
    }
  } catch (error) {
    console.error('Error accessing search cache:', error);
    // Continue with API fetch
  }
  
  try {
    // Build search options
    const searchOptions: any = { page };
    
    // Based on whether we have a session ID or state+year
    if (sessionId) {
      searchOptions.sessionId = sessionId;
    } else {
      searchOptions.year = year;
      // We'll always use state in the getSearchRaw method
    }
    
    // Determine which search method to use based on the parameters
    let searchResults;
    
    if (state === 'VA') {
      // Use our specialized Virginia search method
      searchResults = await ServerLegiScanApi.searchVaBills(query, searchOptions);
    } else {
      // Use the generic search method for other states
      // For this we'll use the more specific getSearchRaw method
      const rawOptions = sessionId 
        ? { id: sessionId, query, page }
        : { state, query, year, page };
      
      searchResults = await ServerLegiScanApi.getSearchRaw(query, { 
        state, 
        year,
        page,
        sessionId
      });
    }
    
    // Format the search results
    // Process search results - handle slightly different formats between search and searchRaw
    const searchResultData = searchResults.searchresult || {};
    
    // Filter out the summary key and map the results to a consistent format
    const results = Object.entries(searchResultData)
      .filter(([key]) => key !== 'summary')
      .map(([_, value]: [string, any]) => ({
        id: value.bill_id,
        number: value.bill_number || value.number, // Handle potential differences
        title: value.title,
        description: value.description || '',
        // Use status_desc when available, or map from status_id
        status: value.status_desc || (value.status_id ? value.status_id.toString() : 'Unknown'),
        statusId: value.status_id,
        lastAction: value.last_action,
        lastActionDate: value.last_action_date,
        url: value.state_link || value.url, // Handle potential URL field differences
        relevance: value.relevance || 0
      }));
    
    // Extract pagination information
    const { summary } = searchResultData || { summary: { count: 0, page_current: 1, page_total: 1 } };
    
    // Build response with consistent data format
    const response = {
      results,
      total: summary?.count || results.length,
      page: summary?.page_current || 1,
      totalPages: summary?.page_total || 1,
      query,
      // Include additional metadata
      parameters: {
        state,
        year,
        page,
        sessionId: sessionId || undefined
      }
    };
    
    // Cache the results (15 minutes for search results)
    try {
      await kv.set(cacheKey, response, { ex: 900 });
    } catch (error) {
      console.error('Error caching search results:', error);
      // Continue despite cache error
    }
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error searching bills:', error);
    
    // Improve error response with more details when available
    return NextResponse.json(
      {
        error: true,
        message: error.message || 'Failed to search bills. Please try again later.',
        query,
        parameters: { state, year, page, sessionId: sessionId || undefined }
      },
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
    query,
    parameters: {
      mock: true
    }
  };
}
import { NextRequest, NextResponse } from 'next/server';
import { ServerLegiScanApi } from '@/lib/legiscan/server';

/**
 * GET handler for /api/bills/search/raw
 * Returns raw search results (minimal bill information for bulk processing)
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const page = searchParams.get('page');
    const year = searchParams.get('year');
    const sessionId = searchParams.get('id');
    const state = searchParams.get('state');
    const mock = searchParams.get('mock') === 'true';
    
    // Validate required parameters
    if (!query) {
      return NextResponse.json(
        { error: true, message: 'Missing required parameter: query' }, 
        { status: 400 }
      );
    }
    
    // Mock response for development
    if (mock || (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_USE_REAL_API)) {
      return NextResponse.json({
        success: true,
        searchresult: {
          summary: {
            page: '1-10 / 15',
            range: '1-10',
            relevancy: '100',
            count: 15,
            page_current: 1,
            page_total: 2
          },
          results: [
            {
              bill_id: 1234567,
              bill_number: 'HB1234',
              status_id: 4,
              status_date: '2024-04-15',
              last_action_date: '2024-04-10',
              last_action: 'Signed by Governor',
              title: 'Digital Asset Trading Framework',
              relevance: 95
            },
            {
              bill_id: 7654321,
              bill_number: 'SB5678',
              status_id: 7,
              status_date: '2024-04-05',
              last_action_date: '2024-04-05',
              last_action: 'In committee',
              title: 'Blockchain Technology Innovation Act',
              relevance: 90
            }
          ]
        }
      });
    }
    
    // Build options for the search
    const options: any = {};
    if (page) options.page = parseInt(page);
    if (year) options.year = parseInt(year);
    if (state) options.state = state;
    if (sessionId) options.sessionId = parseInt(sessionId);
    
    // Get raw search results
    const searchResponse = await ServerLegiScanApi.getSearchRaw(query, options);
    
    // Return the search results
    return NextResponse.json({
      success: true,
      searchresult: searchResponse.searchresult
    });
  } catch (error: any) {
    console.error('Error searching bills (raw):', error);
    return NextResponse.json(
      { error: true, message: error.message || 'Failed to search bills' },
      { status: 500 }
    );
  }
}
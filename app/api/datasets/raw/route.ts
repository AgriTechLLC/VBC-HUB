import { NextRequest, NextResponse } from 'next/server';
import { ServerLegiScanApi } from '@/lib/legiscan/server';

/**
 * GET handler for /api/datasets/raw
 * Returns raw dataset (ZIP file)
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('id');
    const accessKey = searchParams.get('access_key');
    
    // Validate required parameters
    if (!sessionId || !accessKey) {
      return NextResponse.json(
        { error: true, message: 'Missing required parameters: id and access_key' }, 
        { status: 400 }
      );
    }
    
    // Get dataset raw
    const datasetRaw = await ServerLegiScanApi.getDatasetRaw(sessionId, accessKey);
    
    // Return the raw dataset
    return NextResponse.json({
      success: true,
      dataset: datasetRaw
    });
  } catch (error: any) {
    console.error('Error fetching raw dataset:', error);
    return NextResponse.json(
      { error: true, message: error.message || 'Failed to fetch raw dataset' },
      { status: 500 }
    );
  }
}
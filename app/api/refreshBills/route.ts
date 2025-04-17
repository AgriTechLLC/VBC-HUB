import { NextRequest, NextResponse } from 'next/server';
import { refreshBills } from '../bills/route';

// This route is called by Vercel Cron every hour
export async function GET(request: NextRequest) {
  try {
    // Check for the required auth token (to prevent unauthorized access)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET;
    
    // Skip auth check in development, but require it in production
    if (process.env.NODE_ENV === 'production' && expectedToken) {
      if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    
    // Check for mock parameter in development
    const url = new URL(request.url);
    const useMock = url.searchParams.get('mock') === 'true';
    
    if (useMock && process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        success: true,
        message: 'Mock refresh completed',
        updatedBills: []
      });
    }
    
    const changedBills = await refreshBills();
    
    return NextResponse.json({
      success: true,
      message: `Successfully refreshed ${changedBills.length} bills`,
      updatedBills: changedBills
    });
  } catch (error) {
    console.error('Error in refresh job:', error);
    
    // Return error but with 200 status so Vercel doesn't retry immediately
    return NextResponse.json({
      success: false,
      error: (error as Error).message || 'Unknown error'
    }, { status: 200 });
  }
}
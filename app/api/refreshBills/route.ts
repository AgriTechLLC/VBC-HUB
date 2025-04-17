import { NextResponse } from 'next/server';
import { refreshBills } from '../bills/route';

// This route is called by Vercel Cron every hour
export async function GET() {
  try {
    // Check for the required auth token (to prevent unauthorized access)
    const authHeader = headers().get('authorization');
    const expectedToken = process.env.CRON_SECRET;
    
    if (expectedToken && (!authHeader || authHeader !== `Bearer ${expectedToken}`)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      error: error.message || 'Unknown error'
    }, { status: 200 });
  }
}

// Helper function to access headers
function headers() {
  return {
    get(name: string) {
      return (process.env.NODE_ENV === 'production')
        ? process.env[`HTTP_${name.toUpperCase()}`] || null
        : null;
    }
  };
}
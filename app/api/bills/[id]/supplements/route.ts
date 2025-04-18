import { NextRequest, NextResponse } from 'next/server';
import { ServerLegiScanApi } from '@/lib/legiscan/server';

/**
 * GET handler for /api/bills/[id]/supplements
 * Returns supplemental documents for a bill
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const billId = params.id;
    
    // Validate parameter
    if (!billId || isNaN(parseInt(billId))) {
      return NextResponse.json({
        error: true,
        message: 'Invalid bill ID parameter'
      }, { status: 400 });
    }
    
    // Check for mock parameter
    const searchParams = request.nextUrl.searchParams;
    const useMock = searchParams.get('mock') === 'true';
    const supplementId = searchParams.get('supplement_id');
    
    if (useMock || (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_REAL_API !== 'true')) {
      return NextResponse.json(
        supplementId 
          ? getMockSupplement(billId, supplementId)
          : getMockSupplements(billId)
      );
    }
    
    // If a specific supplement ID is provided
    if (supplementId && !isNaN(parseInt(supplementId))) {
      const supplement = await ServerLegiScanApi.getSupplement(supplementId);
      return NextResponse.json({
        success: true,
        billId: parseInt(billId),
        supplement
      });
    }
    
    // Otherwise, get the full bill to get its supplements
    const bill = await ServerLegiScanApi.getBill(billId);
    
    // Return the supplements array or an empty array if none
    return NextResponse.json({
      success: true,
      billId: parseInt(billId),
      supplements: bill.supplements || []
    });
  } catch (error: any) {
    console.error(`Error fetching supplements for bill ${params.id}:`, error);
    return NextResponse.json({
      error: true,
      message: error.message || 'Failed to fetch bill supplements'
    }, { status: 500 });
  }
}

/**
 * Generate mock supplements list for testing
 */
function getMockSupplements(billId: string) {
  return {
    success: true,
    billId: parseInt(billId),
    supplements: [
      {
        supplement_id: 123456,
        date: "2024-03-15",
        type: "Fiscal Note",
        type_id: 1,
        title: "Fiscal Impact Analysis",
        description: "Analysis of the fiscal impact of the bill on state finances.",
        mime: "application/pdf",
        mime_id: 2,
        url: "https://example.com/supplements/fiscal-note.pdf",
        state_link: "https://lis.virginia.gov/cgi-bin/legp604.exe?251+oth+HB1234FS1+PDF",
        supplement_size: 250000,
        supplement_hash: "abcdef123456"
      },
      {
        supplement_id: 654321,
        date: "2024-03-20",
        type: "Analysis",
        type_id: 2,
        title: "Impact Assessment",
        description: "Analysis of the economic impact of the proposed legislation.",
        mime: "application/pdf",
        mime_id: 2,
        url: "https://example.com/supplements/impact-assessment.pdf",
        state_link: "https://lis.virginia.gov/cgi-bin/legp604.exe?251+oth+HB1234IM1+PDF",
        supplement_size: 320000,
        supplement_hash: "ghijkl789012"
      }
    ]
  };
}

/**
 * Generate a mock specific supplement for testing
 */
function getMockSupplement(billId: string, supplementId: string) {
  return {
    success: true,
    billId: parseInt(billId),
    supplement: {
      supplement_id: parseInt(supplementId),
      bill_id: parseInt(billId),
      date: "2024-03-15",
      type_id: 1,
      type: "Fiscal Note",
      title: "Fiscal Impact Analysis",
      description: "Analysis of the fiscal impact of the bill on state finances.",
      mime: "application/pdf",
      mime_id: 2,
      supplement_size: 250000,
      supplement_hash: "abcdef123456",
      doc: "JVBERi0xLjUKJYCBgoMKMSAwIG9iago8PC9GaWx0ZXIvRmxhdGVEZWNvZGUvRmlyc3QgMTQxL04gMjAvTGVuZ3..." // Base64 encoded PDF (truncated)
    }
  };
}
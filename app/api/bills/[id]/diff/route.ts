import { kv } from '@vercel/kv';
import * as diffLib from 'diff';
import { ServerLegiScanApi } from '@/lib/legiscan/server';

export const runtime = 'edge';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url);
  const billId = params.id;
  const amendmentId = searchParams.get('amendmentId');
  
  if (!amendmentId) {
    return Response.json(
      { error: 'amendmentId is required' },
      { status: 400 }
    );
  }
  
  // Check for mock parameter
  const useMock = searchParams.get('mock') === 'true';
  
  if (useMock || (process.env.NODE_ENV === 'development' && !process.env.USE_REAL_API)) {
    return Response.json({ diff: getMockDiff(billId, amendmentId) });
  }
  
  const cacheKey = `bill-diff:${billId}:${amendmentId}`;
  
  // Check cache first
  try {
    const cachedDiff = await kv.get(cacheKey);
    if (cachedDiff) {
      return Response.json({ diff: cachedDiff });
    }
  } catch (error) {
    console.error('Error accessing diff cache:', error);
    // Continue with API fetch
  }
  
  try {
    // Fetch original bill using the ServerLegiScanApi
    const bill = await ServerLegiScanApi.getBill(billId);
    
    if (!bill || !bill.texts || bill.texts.length === 0) {
      return Response.json(
        { error: 'No bill text available' },
        { status: 404 }
      );
    }
    
    // Get the document ID for the original bill text
    const docId = bill.texts[0].doc_id;
    
    // Fetch the full bill text
    const billTextData = await ServerLegiScanApi.getBillText(docId);
    
    if (!billTextData || !billTextData.doc) {
      return Response.json(
        { error: 'No bill text available' },
        { status: 404 }
      );
    }
    
    // Extract original text from base64
    const originalText = Buffer.from(billTextData.doc, 'base64').toString();
    
    // Fetch amendment text
    const amendmentData = await ServerLegiScanApi.getAmendment(amendmentId);
    
    if (!amendmentData || !amendmentData.doc) {
      return Response.json(
        { error: 'No amendment text available' },
        { status: 404 }
      );
    }
    
    // Extract amendment text from base64
    const amendmentText = Buffer.from(amendmentData.doc, 'base64').toString();
    
    // Generate diff
    const diffResult = diffLib.diffWords(originalText, amendmentText);
    
    // Convert diff to HTML
    const diffHtml = diffResult.map((part: diffLib.Change) => {
      if (part.added) {
        return `<ins class="bg-green-100 dark:bg-green-900">${part.value}</ins>`;
      }
      if (part.removed) {
        return `<del class="bg-red-100 dark:bg-red-900">${part.value}</del>`;
      }
      return `<span>${part.value}</span>`;
    }).join('');
    
    // Cache the diff for 1 week (in seconds)
    try {
      await kv.set(cacheKey, diffHtml, { ex: 7 * 24 * 60 * 60 });
    } catch (error) {
      console.error('Error caching diff:', error);
      // Continue despite cache error
    }
    
    return Response.json({ diff: diffHtml });
  } catch (error) {
    console.error('Error generating diff:', error);
    return Response.json(
      { error: 'Failed to generate diff. Please try again later.' },
      { status: 500 }
    );
  }
}

function getMockDiff(billId: string, amendmentId: string): string {
  // For simplicity, we'll just return a mock diff for any combination
  return `<span>Section 1. This act shall be known as the </span>
<del class="bg-red-100 dark:bg-red-900">Digital Asset Trading Regulation Act</del>
<ins class="bg-green-100 dark:bg-green-900">Virginia Digital Asset Business Act</ins>
<span>.</span>

<span>Section 2. Definitions.</span>
<span>As used in this chapter:</span>
<span>"Digital asset" means a representation of economic, proprietary, or access rights that is stored electronically, has a transaction history that is recorded on a distributed, digital ledger or digital data structure in which consensus is achieved through a mathematically verifiable process, and includes cryptocurrency and other digital assets.</span>

<del class="bg-red-100 dark:bg-red-900">"Digital asset trading platform" means any person or entity that facilitates the exchange, transfer, purchase, sale, or trading of digital assets.</del>
<ins class="bg-green-100 dark:bg-green-900">"Digital asset business" means a person that engages in one or more of the following activities:
(i) exchanging, transferring, or storing digital assets or engaging in digital asset administration;
(ii) holding or maintaining custody or control of a digital asset on behalf of others;
(iii) buying and selling digital assets as a customer business;
(iv) performing exchange services as a customer business; or
(v) controlling, participating in, or issuing a digital asset.</ins>`;
}
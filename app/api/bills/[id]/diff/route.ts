import { kv } from '@vercel/kv';
import * as diffLib from 'diff';

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
  
  const cacheKey = `bill-diff:${billId}:${amendmentId}`;
  
  // Check cache first
  const cachedDiff = await kv.get(cacheKey);
  if (cachedDiff) {
    return Response.json({ diff: cachedDiff });
  }
  
  try {
    // Fetch original bill text
    const billResponse = await fetch(
      `${process.env.LEGISCAN_BASE_URL}/get?key=${process.env.LEGISCAN_API_KEY}&op=getBill&id=${billId}&text=1`
    );
    
    if (!billResponse.ok) {
      throw new Error(`Failed to fetch bill: ${billResponse.statusText}`);
    }
    
    const billData = await billResponse.json();
    const originalText = billData?.bill?.text?.doc || '';
    
    if (!originalText) {
      return Response.json(
        { error: 'No bill text available' },
        { status: 404 }
      );
    }
    
    // Fetch amendment text
    const amendmentResponse = await fetch(
      `${process.env.LEGISCAN_BASE_URL}/get?key=${process.env.LEGISCAN_API_KEY}&op=getAmendment&id=${amendmentId}`
    );
    
    if (!amendmentResponse.ok) {
      throw new Error(`Failed to fetch amendment: ${amendmentResponse.statusText}`);
    }
    
    const amendmentData = await amendmentResponse.json();
    const amendmentText = amendmentData?.amendment?.text?.doc || '';
    
    if (!amendmentText) {
      return Response.json(
        { error: 'No amendment text available' },
        { status: 404 }
      );
    }
    
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
    await kv.set(cacheKey, diffHtml, { ex: 7 * 24 * 60 * 60 });
    
    return Response.json({ diff: diffHtml });
  } catch (error) {
    console.error('Error generating diff:', error);
    return Response.json(
      { error: 'Failed to generate diff. Please try again later.' },
      { status: 500 }
    );
  }
}
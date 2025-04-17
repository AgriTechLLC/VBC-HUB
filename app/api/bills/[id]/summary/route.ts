import { OpenAI } from 'openai';
import { kv } from '@vercel/kv';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const billId = params.id;
  const cacheKey = `bill-summary:${billId}`;

  // Check cache first
  const cachedSummary = await kv.get(cacheKey);
  if (cachedSummary) {
    return Response.json({ summary: cachedSummary });
  }

  try {
    // Fetch bill data including text
    const billResponse = await fetch(
      `${process.env.LEGISCAN_BASE_URL}/get?key=${process.env.LEGISCAN_API_KEY}&op=getBill&id=${billId}&text=1`
    );
    
    if (!billResponse.ok) {
      throw new Error(`Failed to fetch bill: ${billResponse.statusText}`);
    }
    
    const billData = await billResponse.json();
    const billText = billData?.bill?.text?.doc || '';
    
    if (!billText) {
      return Response.json(
        { summary: "<p>No bill text available to summarize.</p>" },
        { status: 200 }
      );
    }

    // Generate summary with GPT-4o-mini
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert legislative analyst and attorney who specializes in explaining complex legislation to the public. Your task is to provide a concise, informative, and factual summary of the bill text provided.`
        },
        {
          role: "user",
          content: `Please provide a summary of this bill. Structure your response with HTML paragraphs with these sections:
          1. Executive Summary (1-2 paragraphs)
          2. Key Provisions (3-5 bullet points)
          3. Potential Impact (1 paragraph)
          
          Include only factual information derived from the bill text. Do not include political commentary or opinions. Format your response using HTML tags (<p>, <ul>, <li>, <h3>, etc.) for clean display.
          
          Bill text:
          ${billText}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const summary = completion.choices[0].message.content || "Summary generation failed.";
    
    // Cache the summary for 1 week (in seconds)
    await kv.set(cacheKey, summary, { ex: 7 * 24 * 60 * 60 });
    
    return Response.json({ summary });
  } catch (error) {
    console.error('Error generating bill summary:', error);
    return Response.json(
      { summary: "<p>Failed to generate bill summary. Please try again later.</p>" },
      { status: 500 }
    );
  }
}
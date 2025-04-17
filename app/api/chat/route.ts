import { NextResponse } from "next/server";
import OpenAI from "openai";
import { redis } from "@/lib/redis";

export const runtime = "edge";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Set a daily token cap for cost control
const DAILY_TOKEN_CAP = 100000; // 100k tokens per day

// System prompt for the assistant
const SYSTEM_PROMPT = `You are VBC-GPT, a helpful assistant for the Virginia Blockchain Council.
You help answer questions about blockchain-related legislation in Virginia.
Be concise, helpful, and cite bill numbers (like "HB1234" or "SB5678") when referencing them.
If you're not sure about something, say so rather than making up information.`;

/**
 * POST handler for /api/chat
 * Handles semantic search and LLM Q&A for bill text
 */
export async function POST(req: Request) {
  try {
    // Parse the request body
    const { query } = await req.json();
    
    // Check if the query exists
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }
    
    // Check for moderation (optional but recommended)
    try {
      const moderation = await openai.moderations.create({ input: query });
      if (moderation.results[0].flagged) {
        return NextResponse.json({ 
          error: 'Query was flagged by content moderation' 
        }, { status: 400 });
      }
    } catch (error) {
      console.error('[Chat] Moderation error:', error);
      // Continue without moderation if it fails
    }
    
    // Check daily token usage cap
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const usageKey = `openai:usage:${today}`;
    
    let dailyUsage = 0;
    try {
      dailyUsage = Number(await redis.get(usageKey) || 0);
      
      if (dailyUsage >= DAILY_TOKEN_CAP) {
        return NextResponse.json({ 
          error: 'Daily usage limit reached. Please try again tomorrow.' 
        }, { status: 429 });
      }
    } catch (error) {
      console.error('[Chat] Redis usage check error:', error);
      // Continue despite Redis errors
    }
    
    // Generate an embedding for the query
    const queryVec = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });
    
    // Convert the embedding to base64 for Redis
    const encoded = Buffer.from(
      new Float32Array(queryVec.data[0].embedding).buffer
    ).toString("base64");
    
    // Run semantic search with KNN (k-nearest neighbors)
    let matches;
    try {
      matches = await redis.ft.search(
        "idx:vectors",
        "*=>[KNN 8 @__vector__ $VEC]",
        { PARAMS: { VEC: encoded }, RETURN: ["chunk", "bill_id"], DIALECT: 2 }
      );
    } catch (error) {
      console.error('[Chat] Vector search error:', error);
      // Return empty array if search fails
      matches = { documents: [] };
    }
    
    // Extract relevant context from search results
    const context = matches.documents
      .map((d: any) => `Bill ${d.value.bill_id}: ${d.value.chunk}`)
      .join("\n\n---\n\n");
    
    // Call the OpenAI API to generate a response
    const stream = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      stream: true,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Context from Virginia legislation:\n${context}\n\nQuestion: ${query}` },
      ],
    });
    
    // Increment token usage (approximate)
    // 1 token ≈ 4 chars for English, 1k tokens for context + query, 500 for response
    const estimatedTokens = Math.ceil(context.length / 4) + Math.ceil(query.length / 4) + 500;
    try {
      await redis.incrby(usageKey, estimatedTokens);
      await redis.expire(usageKey, 86400); // Expire in 24 hours
    } catch (error) {
      console.error('[Chat] Redis usage update error:', error);
    }
    
    // Return the streaming response
    return new NextResponse(stream as any, {
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        "connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error('[Chat] Error processing request:', error);
    return NextResponse.json({ 
      error: 'An error occurred while processing your request' 
    }, { status: 500 });
  }
}
import OpenAI from "openai";
import { redis } from "./redis";
import { chunk } from "./text-chunk";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Bill interface for embedding
 */
interface Bill {
  bill_id: number;
  text: string;
}

/**
 * Create embeddings for a bill and store them in Redis Vector
 * @param bill - Object with bill_id and full text
 */
export async function embedBill(bill: Bill): Promise<void> {
  // Split text into chunks
  const segments = chunk(bill.text, Number(process.env.EMBED_CHUNK_TOKENS) || 900);
  
  // Generate embeddings for all segments
  const vectors = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: segments,
  });

  // Ensure the vector index exists in Redis
  try {
    // Using type assertion to solve TypeScript error with ft property
    await (redis as any).ft.create(
      "idx:vectors",
      { vector: { type: "VECTOR", dims: 1536, algorithm: "HNSW" } },
      { ON: "HASH", PREFIX: "vbc:vec:" }
    );
  } catch (error) {
    // Ignore if index already exists
    if (!(error instanceof Error) || !error.message.includes('Index already exists')) {
      console.error('Error creating vector index:', error);
    }
  }

  // Store each chunk with its embedding in Redis
  for (let i = 0; i < vectors.data.length; i++) {
    await redis.hset(`vbc:vec:${bill.bill_id}:${i}`, {
      bill_id: bill.bill_id.toString(),
      chunk: segments[i],
      // Upstash expects base64 encoded vectors
      __vector__: Buffer.from(new Float32Array(vectors.data[i].embedding).buffer).toString("base64"),
    });
  }
  
  console.log(`[Embeddings] Stored ${segments.length} chunks for bill ${bill.bill_id}`);
}
/**
 * Split text into chunks of roughly equal token size
 * @param text The text to split
 * @param tokens The approximate number of tokens per chunk (default: 900)
 * @returns An array of text chunks
 */
export function chunk(text: string, tokens = 900): string[] {
  // Split text into words
  const words = text.split(/\s+/);
  
  // Estimate tokens - roughly 0.75 words per token for English
  const approxTokens = Math.ceil(words.length / 0.75);
  
  // If the text is already small enough, return as is
  if (approxTokens <= tokens) return [text];
  
  // Calculate chunk size based on tokens
  // Ensure size is at least 1 to avoid infinite loops when the token
  // limit is extremely small compared to the text length
  const size = Math.max(
    1,
    Math.floor(words.length / Math.ceil(approxTokens / tokens))
  );
  
  // Split into chunks
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += size) {
    chunks.push(words.slice(i, i + size).join(' '));
  }
  
  return chunks;
}
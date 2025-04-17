import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chunk } from './text-chunk';

// Mock OpenAI and Redis
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      embeddings: {
        create: vi.fn().mockResolvedValue({
          data: [
            { embedding: [0.1, 0.2, 0.3] },
            { embedding: [0.4, 0.5, 0.6] }
          ]
        })
      }
    }))
  };
});

vi.mock('./redis', () => {
  return {
    redis: {
      ft: {
        create: vi.fn().mockResolvedValue(true)
      },
      hset: vi.fn().mockResolvedValue(true)
    }
  };
});

describe('Text Chunking Utility', () => {
  it('should return the original text if it is smaller than the token limit', () => {
    const text = 'This is a short text';
    const result = chunk(text, 100);
    expect(result).toEqual([text]);
  });

  it('should split text into chunks based on token limit', () => {
    const text = 'This is a longer text that should be split into multiple chunks based on token count estimation for the purpose of testing the text chunking utility function';
    const result = chunk(text, 10); // Very small token limit for testing
    expect(result.length).toBeGreaterThan(1);
    
    // Each chunk should be smaller than the original
    result.forEach(chunk => {
      expect(chunk.length).toBeLessThan(text.length);
    });
    
    // All chunks combined should contain all words
    const originalWords = text.split(/\s+/).length;
    const chunkWords = result.join(' ').split(/\s+/).length;
    expect(chunkWords).toBe(originalWords);
  });
});
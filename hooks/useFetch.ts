/**
 * Shared fetch utility with Zod validation
 */
import { useCallback } from 'react';
import { z } from 'zod';

/**
 * Type-safe fetch function with Zod validation
 */
export async function fetchWithValidation<T>(
  url: string, 
  schema: z.ZodType<T>,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate with Zod schema
    const validated = schema.parse(data);
    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.issues);
      throw new Error(`API response validation failed: ${error.issues[0].message}`);
    }
    throw error;
  }
}

/**
 * Create a fetch function with validation for SWR
 */
export function createFetcher<T>(schema: z.ZodType<T>) {
  return async (url: string): Promise<T> => {
    return fetchWithValidation(url, schema);
  };
}

/**
 * Create a parameterized fetch function with validation for SWR
 */
export function createParameterizedFetcher<T, P extends object>(
  schema: z.ZodType<T>,
  createUrl: (params: P) => string
) {
  return async (params: P): Promise<T> => {
    const url = createUrl(params);
    return fetchWithValidation(url, schema);
  };
}
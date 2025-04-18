import { NextResponse } from 'next/server';

/**
 * Centralized error handling for API routes
 * Standardizes error response format and status codes
 */
export function handleApiError(error: any, context: Record<string, any> = {}) {
  console.error('API Error:', error);
  
  // Determine the appropriate status code based on the error
  let statusCode = error.statusCode || 500;
  
  // Create a consistent error response
  const errorResponse = {
    error: true,
    message: error.message || 'An unknown error occurred',
    code: statusCode,
    ...context // Include any additional context
  };
  
  // Include the API response if available (for debugging and client handling)
  if (error.apiResponse) {
    errorResponse.details = error.apiResponse;
  }
  
  // Return formatted error response
  return NextResponse.json(errorResponse, { status: statusCode });
}

/**
 * Create validation error response
 */
export function validationError(message: string, context: Record<string, any> = {}) {
  return NextResponse.json({
    error: true,
    message,
    code: 400,
    ...context
  }, { status: 400 });
}

/**
 * Create not found error response
 */
export function notFoundError(message: string, context: Record<string, any> = {}) {
  return NextResponse.json({
    error: true,
    message,
    code: 404,
    ...context
  }, { status: 404 });
}
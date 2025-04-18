import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

// In-memory rate limit store (would be Redis in production)
const rateLimits: Record<string, { count: number, timestamp: number }> = {};

// Rate limit window in milliseconds (1 minute)
const RATE_LIMIT_WINDOW = 60 * 1000;

// Maximum requests per window
const CHAT_RATE_LIMIT = 20; // 20 requests per minute for /api/chat

// Create internationalization middleware
const intlMiddleware = createIntlMiddleware({
  locales: ['en'],
  defaultLocale: 'en',
  localeDetection: false
});

export function middleware(request: NextRequest) {
  // Only apply rate limiting to the chat API
  if (request.nextUrl.pathname === '/api/chat') {
    return rateLimitMiddleware(request);
  }
  
  // Skip internationalization for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Apply internationalization middleware for normal routes
  return intlMiddleware(request);
}

function rateLimitMiddleware(request: NextRequest) {
  // Get IP address from request
  const ip = request.ip || '127.0.0.1';
  const key = `rate:${ip}:chat`;
  const now = Date.now();
  
  // Get existing rate limit data
  let rateLimit = rateLimits[key];
  
  // If no existing data or window expired, create new entry
  if (!rateLimit || now - rateLimit.timestamp > RATE_LIMIT_WINDOW) {
    rateLimits[key] = { count: 1, timestamp: now };
    return NextResponse.next();
  }
  
  // Increment count
  rateLimit.count++;
  
  // If over limit, return 429 Too Many Requests
  if (rateLimit.count > CHAT_RATE_LIMIT) {
    return new NextResponse(JSON.stringify({ 
      error: 'Too many requests. Please try again later.' 
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '60'
      }
    });
  }
  
  // Otherwise continue
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)']
};
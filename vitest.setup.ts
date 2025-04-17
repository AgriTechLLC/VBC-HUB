// Global setup for Vitest

// Add any global setup here
// This file runs before tests

// Mock environment variables
if (typeof process.env.NODE_ENV === 'undefined') {
  Object.defineProperty(process.env, 'NODE_ENV', { 
    value: 'test',
    configurable: true 
  });
}

if (typeof process.env.USE_REAL_API === 'undefined') {
  Object.defineProperty(process.env, 'USE_REAL_API', { 
    value: 'false',
    configurable: true 
  });
}
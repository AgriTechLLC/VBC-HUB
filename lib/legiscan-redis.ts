// LegiScan API utility functions with Redis caching and quota management

import { Redis } from '@upstash/redis';

// Initialize Redis client
let redis: Redis;

try {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
  });
} catch (error) {
  console.error('Failed to initialize Redis client:', error);
  throw new Error('Redis configuration is missing or invalid');
}

// Monthly query limit
const MONTHLY_LIMIT = 30000;
const QUOTA_ALERT_THRESHOLD = 25000; // Send alert when quota reaches this value

// Cache TTL in seconds (default: 1 hour)
const CACHE_TTL_SECONDS = process.env.CACHE_TTL 
  ? Math.floor(parseInt(process.env.CACHE_TTL) / 1000) 
  : 3600; // 1 hour

// Session cache TTL in seconds (1 day)
const SESSION_TTL_SECONDS = 86400; // 24 hours

// Monthly quota counter TTL (32 days to ensure it covers a full month)
const MONTHLY_QUOTA_TTL_SECONDS = 32 * 86400; // 32 days

// Cache for current session ID
let cachedSessionId: number | null = null;

/**
 * Get current month key for quota tracking
 * Format: ls:usage:YYYY-MM
 */
function getCurrentMonthKey(): string {
  const now = new Date();
  const yearMonth = now.toISOString().slice(0, 7); // "2025-04"
  return `ls:usage:${yearMonth}`;
}

/**
 * Send an alert when quota threshold is reached
 */
async function sendQuotaAlert(currentUsage: number): Promise<void> {
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('[LegiScan] No webhook URL configured for quota alerts');
    return;
  }

  try {
    const monthKey = getCurrentMonthKey();
    const message = {
      text: `🚨 LegiScan API Quota Alert: ${currentUsage}/${MONTHLY_LIMIT} queries used for ${monthKey}. Please check the usage and consider adjusting.`
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    
    console.log(`[LegiScan] Quota alert sent for ${currentUsage} queries`);
  } catch (error) {
    console.error('[LegiScan] Failed to send quota alert:', error);
  }
}

/**
 * Fetch data from LegiScan API with Redis caching and quota management
 */
export async function lsFetch(op: string, params: Record<string, string | number> = {}) {
  // Convert all params to strings for consistent cache keys
  const strParams: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    strParams[key] = String(value);
  });
  
  // Create cache key from operation and params
  const cacheKey = `legiscan:${op}:${JSON.stringify(strParams)}`;
  
  // Check Redis cache first
  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`[LegiScan] Cache hit for ${op}`);
      return cachedData;
    }
  } catch (error) {
    console.error(`[LegiScan] Redis cache read error:`, error);
    // Continue with API call if cache fails
  }
  
  // Check monthly quota from Redis
  const quotaKey = getCurrentMonthKey();
  let currentUsage = 0;
  
  try {
    // Get current usage from Redis
    currentUsage = Number(await redis.get(quotaKey) || 0);
    
    // Check if we've exceeded the monthly limit
    if (currentUsage >= MONTHLY_LIMIT) {
      throw new Error(`LegiScan monthly query quota exceeded for ${quotaKey}`);
    }
    
    // Check if we should send an alert (only once when threshold is crossed)
    if (currentUsage === QUOTA_ALERT_THRESHOLD) {
      sendQuotaAlert(currentUsage).catch(err => 
        console.error('[LegiScan] Failed to send quota alert:', err)
      );
    }
  } catch (error) {
    if (error.message.includes('quota exceeded')) {
      throw error;
    }
    console.error(`[LegiScan] Redis quota check error:`, error);
    // Continue despite Redis errors, but be cautious
  }
  
  // Get API key from environment variables
  const apiKey = process.env.LEGISCAN_KEY;
  if (!apiKey) {
    throw new Error('LEGISCAN_KEY environment variable is not set');
  }
  
  // Build query string
  const queryParams = new URLSearchParams({ key: apiKey, op, ...strParams });
  const url = `https://api.legiscan.com/?${queryParams.toString()}`;
  
  console.log(`[LegiScan] Fetching ${op} from API`);
  
  // Fetch from API
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`LegiScan API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check for API errors
    if (data.status === 'ERROR') {
      throw new Error(`LegiScan API error: ${data.alert?.message || 'Unknown error'}`);
    }
    
    // Increment monthly quota counter in Redis
    try {
      // Increment the counter
      const newCount = await redis.incr(quotaKey);
      
      // Set TTL on the counter to ensure it expires after the month
      await redis.expire(quotaKey, MONTHLY_QUOTA_TTL_SECONDS);
      
      // Check if we just crossed the threshold with this increment
      if (newCount === QUOTA_ALERT_THRESHOLD) {
        sendQuotaAlert(newCount).catch(err => 
          console.error('[LegiScan] Failed to send quota alert:', err)
        );
      }
      
      // Log every 1000 queries for monitoring
      if (newCount % 1000 === 0) {
        console.log(`[LegiScan] Quota usage milestone: ${newCount}/${MONTHLY_LIMIT} API calls for ${quotaKey}`);
      }
    } catch (error) {
      console.error(`[LegiScan] Redis quota update error:`, error);
      // Continue despite Redis errors
    }
    
    // Cache the result in Redis
    try {
      await redis.set(cacheKey, data, { ex: CACHE_TTL_SECONDS });
    } catch (error) {
      console.error(`[LegiScan] Redis cache write error:`, error);
      // Continue despite cache errors
    }
    
    return data;
  } catch (error) {
    console.error(`[LegiScan] Error fetching ${op}:`, error);
    throw error;
  }
}

/**
 * Get the list of available sessions for a state
 */
export async function getSessionList(state: string) {
  const data = await lsFetch('getSessionList', { state });
  return data.sessions;
}

/**
 * Get the current Virginia session ID
 * Uses caching to avoid redundant API calls
 */
export async function currentVaSession(): Promise<number> {
  // First check in-memory cache
  if (cachedSessionId) {
    return cachedSessionId;
  }
  
  // Then check Redis cache
  try {
    const cachedValue = await redis.get('legiscan:current_va_session');
    if (cachedValue) {
      cachedSessionId = Number(cachedValue);
      return cachedSessionId;
    }
  } catch (error) {
    console.error('[LegiScan] Redis session cache error:', error);
    // Continue to fetch from API
  }
  
  // Fetch from API
  const sessions = await getSessionList('VA');
  
  // First try to find an active regular session
  const current = sessions.find((s: any) => s.session_name.includes('Regular') && s.session_active === 1);
  
  // If found an active session, use it
  if (current) {
    cachedSessionId = current.session_id;
  } else {
    // Fallback to the most recent session in the list (the last one)
    cachedSessionId = sessions[sessions.length - 1].session_id;
  }
  
  // Cache in Redis for future use
  try {
    await redis.set('legiscan:current_va_session', cachedSessionId, { ex: SESSION_TTL_SECONDS });
  } catch (error) {
    console.error('[LegiScan] Redis session cache write error:', error);
    // Continue despite cache errors
  }
  
  return cachedSessionId;
}

/**
 * Get the master list of bills for a session
 */
export async function getMasterListRaw(sessionId: number) {
  const data = await lsFetch('getMasterListRaw', { id: sessionId });
  return data.masterlist;
}

/**
 * Get detailed information for a specific bill
 */
export async function getBill(billId: number) {
  const data = await lsFetch('getBill', { id: billId });
  return data.bill;
}

/**
 * Search for bills using keywords
 */
export async function getSearch(state: string, query: string) {
  const data = await lsFetch('getSearch', { state, query });
  return data.searchresult;
}

/**
 * Get text of a bill
 */
export async function getBillText(documentId: number) {
  const data = await lsFetch('getBillText', { id: documentId });
  return data.text;
}

/**
 * Get amendment details
 */
export async function getAmendment(amendmentId: number) {
  const data = await lsFetch('getAmendment', { id: amendmentId });
  return data.amendment;
}

/**
 * Get roll call vote details
 */
export async function getRollCall(rollCallId: number) {
  const data = await lsFetch('getRollCall', { id: rollCallId });
  return data.roll_call;
}

/**
 * Get information about legislators for a session
 */
export async function getSessionPeople(sessionId: number) {
  const data = await lsFetch('getSessionPeople', { id: sessionId });
  return data.sessionpeople;
}

/**
 * Compare change hashes to detect updated bills
 */
export function diffHashes(newMasterList: Record<string, any>, oldHashes: Record<string, string>): number[] {
  const changedBillIds: number[] = [];
  
  for (const [billId, bill] of Object.entries(newMasterList)) {
    const oldHash = oldHashes[billId];
    const newHash = bill.change_hash;
    
    if (!oldHash || oldHash !== newHash) {
      changedBillIds.push(Number(billId));
    }
  }
  
  return changedBillIds;
}

/**
 * Get status description from status ID
 */
export function getBillStatusDescription(statusId: number): string {
  const statusMap: Record<number, string> = {
    1: "Introduced",
    2: "Engrossed",
    3: "Enrolled",
    4: "Passed",
    5: "Vetoed",
    6: "Failed/Dead",
    7: "Committee",
    8: "Referred",
    9: "Reported",
    10: "Amended",
    11: "Hearing",
    12: "Substituted",
    13: "In Floor",
    14: "Scheduled",
  };
  
  return statusMap[statusId] || "Unknown";
}

/**
 * Get color for bill status display
 */
export function getStatusColor(statusId: number): string {
  // Map status IDs to tailwind color classes
  const colorMap: Record<number, string> = {
    1: "bg-blue-500",    // Introduced
    2: "bg-purple-500",  // Engrossed
    3: "bg-teal-500",    // Enrolled
    4: "bg-green-600",   // Passed
    5: "bg-red-600",     // Vetoed
    6: "bg-red-600",     // Failed/Dead
    7: "bg-yellow-500",  // Committee
    8: "bg-blue-500",    // Referred
    9: "bg-blue-600",    // Reported
    10: "bg-purple-500", // Amended
    11: "bg-yellow-500", // Hearing
    12: "bg-purple-500", // Substituted
    13: "bg-teal-500",   // In Floor
    14: "bg-yellow-500", // Scheduled
  };
  
  return colorMap[statusId] || "bg-gray-500";
}

/**
 * Calculate progress percentage based on status ID
 */
export function calculateProgress(statusId: number): number {
  // Map status IDs to progress percentages
  const progressMap: Record<number, number> = {
    1: 10,  // Introduced
    2: 30,  // Engrossed
    3: 80,  // Enrolled
    4: 100, // Passed
    5: 0,   // Vetoed
    6: 0,   // Failed/Dead
    7: 20,  // Committee
    8: 15,  // Referred
    9: 40,  // Reported
    10: 50, // Amended
    11: 25, // Hearing
    12: 35, // Substituted
    13: 70, // In Floor
    14: 30, // Scheduled
  };
  
  return progressMap[statusId] || 10;
}

/**
 * Format a bill ID for display
 */
export function formatBillNumber(billNumber: string): string {
  return billNumber.replace(/([A-Z]+)(\d+)/, "$1 $2");
}
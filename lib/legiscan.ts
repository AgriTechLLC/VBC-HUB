// LegiScan API utility functions with caching and quota management

// Monthly query limit
const MONTHLY_LIMIT = 30000;
let monthlyQueriesUsed = 0;

// In-memory cache (would be replaced with Redis in production)
const CACHE = new Map<string, { data: any, timestamp: number }>();

// Cache TTL in milliseconds (default: 1 hour)
const CACHE_TTL = process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : 3600000;

/**
 * Fetch data from LegiScan API with caching and quota management
 */
export async function lsFetch(op: string, params: Record<string, string | number> = {}) {
  // Convert all params to strings for consistent cache keys
  const strParams: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    strParams[key] = String(value);
  });
  
  // Create cache key from operation and params
  const cacheKey = JSON.stringify({ op, ...strParams });
  
  // Check cache first
  const cached = CACHE.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    console.log(`[LegiScan] Cache hit for ${op}`);
    return cached.data;
  }
  
  // Check quota
  if (monthlyQueriesUsed >= MONTHLY_LIMIT) {
    throw new Error('LegiScan monthly query quota exceeded');
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
      throw new Error(`LegiScan API error: ${data.alert.message}`);
    }
    
    // Increment quota counter
    monthlyQueriesUsed++;
    
    // Cache the result
    CACHE.set(cacheKey, { data, timestamp: Date.now() });
    
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
 * Get the current active session for a state
 */
export async function getCurrentSession(state: string) {
  const sessions = await getSessionList(state);
  const current = sessions.find((s: any) => s.session_name.includes('Regular') && s.session_active === 1);
  
  if (!current) {
    // Fallback to the most recent session or specified session ID
    if (process.env.VA_SESSION_ID) {
      return { session_id: parseInt(process.env.VA_SESSION_ID) };
    }
    // Or just the last session in the list
    return sessions[sessions.length - 1];
  }
  
  return current;
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
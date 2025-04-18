/**
 * Client-safe utility functions for bill data
 * Only includes functions that don't require server-side dependencies
 */

/**
 * Format a bill number with space between prefix and number
 * @param billNumber - The raw bill number string (e.g., "HB1234")
 * @returns Formatted bill number (e.g., "HB 1234")
 */
export function formatBillNumber(billNumber: string): string {
  return billNumber.replace(/([A-Z]+)(\d+)/, "$1 $2");
}

/**
 * Get a color value based on bill status
 * @param statusId - The numeric status ID from LegiScan
 * @returns CSS color class or hex color
 */
export function getStatusColor(statusId: number): string {
  const statusColors: Record<number, string> = {
    1: "#3B82F6", // Introduced - blue
    2: "#8B5CF6", // Engrossed - purple
    3: "#EC4899", // Enrolled - pink
    4: "#10B981", // Passed - green
    5: "#F43F5E", // Vetoed - red
    6: "#6B7280", // Failed/Dead - gray
    7: "#F59E0B", // Committee - amber
    8: "#F59E0B", // Referred to Committee - amber
    9: "#8B5CF6", // Amendment - purple
    10: "#8B5CF6", // Amended - purple
    11: "#F59E0B", // Hearing - amber
    12: "#3B82F6", // Filed - blue
    13: "#10B981", // Floor - green
  };

  return statusColors[statusId] || "#6B7280"; // Default to gray
}

/**
 * Get a human-readable description of a bill status
 * @param statusId - The numeric status ID from LegiScan
 * @returns Human-readable status description
 */
export function getBillStatusDescription(statusId: number): string {
  const statusMap: Record<number, string> = {
    1: "Introduced",
    2: "Engrossed",
    3: "Enrolled",
    4: "Passed",
    5: "Vetoed",
    6: "Failed/Dead",
    7: "In Committee",
    8: "Referred to Committee",
    9: "Amendment",
    10: "Amended",
    11: "Hearing",
    12: "Filed",
    13: "Floor"
  };
  
  return statusMap[statusId] || "Unknown";
}

/**
 * Simplify the chamber name
 * @param chamber - The full chamber name from LegiScan
 * @returns Simplified chamber name
 */
export function simplifyChambername(chamber: string): string {
  const chamberMap: Record<string, string> = {
    "House": "House",
    "Senate": "Senate",
    "Primary Chamber": "House",
    "Lower": "House",
    "Upper": "Senate",
    "H": "House",
    "S": "Senate"
  };
  
  return chamberMap[chamber] || chamber;
}

/**
 * Calculate the progress percentage of a bill through the legislative process
 * @param statusId - The numeric status ID from LegiScan
 * @returns Number between 0-100 representing progress percentage
 */
export function calculateBillProgress(statusId: number): number {
  const progressMap: Record<number, number> = {
    1: 10,  // Introduced
    2: 70,  // Engrossed
    3: 90,  // Enrolled
    4: 100, // Passed
    5: 100, // Vetoed
    6: 100, // Failed/Dead
    7: 30,  // In Committee
    8: 20,  // Referred to Committee
    9: 50,  // Amendment
    10: 60, // Amended
    11: 40, // Hearing
    12: 5,  // Filed
    13: 80  // Floor
  };
  
  return progressMap[statusId] || 0;
}
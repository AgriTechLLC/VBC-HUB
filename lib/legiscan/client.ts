/**
 * Client-side utilities for LegiScan data
 * Does not interact directly with the LegiScan API
 */

import { BillTypes, EventTypes, MimeTypes, Status, TextTypes } from './api';

// Bill progress
export interface BillProgress {
  date: string;
  event: number;
  description: string;
}

// Bill status colors
export function getStatusColor(statusId: number): string {
  const statusColors: Record<number, string> = {
    [Status.INTRODUCED]: "bg-blue-500", // Introduced - blue
    [Status.ENGROSSED]: "bg-violet-500", // Engrossed - purple
    [Status.ENROLLED]: "bg-pink-500", // Enrolled - pink
    [Status.PASSED]: "bg-green-600", // Passed - green
    [Status.VETOED]: "bg-red-500", // Vetoed - red
    [Status.FAILED]: "bg-gray-500", // Failed/Dead - gray
    7: "bg-amber-500", // Committee - amber
    8: "bg-amber-500", // Referred to Committee - amber
    9: "bg-violet-500", // Amendment - purple
    10: "bg-violet-500", // Amended - purple
    11: "bg-amber-500", // Hearing - amber
    12: "bg-blue-500", // Filed - blue
    13: "bg-green-500", // Floor - green
  };

  return statusColors[statusId] || "bg-gray-500"; // Default to gray
}

// Format bill number with space
export function formatBillNumber(billNumber: string): string {
  return billNumber.replace(/([A-Z]+)(\d+)/, "$1 $2");
}

// Get human-readable status description
export function getBillStatusDescription(statusId: number): string {
  const statusMap: Record<number, string> = {
    [Status.NA]: "Unknown",
    [Status.INTRODUCED]: "Introduced",
    [Status.ENGROSSED]: "Engrossed",
    [Status.ENROLLED]: "Enrolled",
    [Status.PASSED]: "Passed",
    [Status.VETOED]: "Vetoed",
    [Status.FAILED]: "Failed/Dead",
    7: "In Committee",
    8: "Referred to Committee",
    9: "Amendment",
    10: "Amended",
    11: "Hearing",
    12: "Filed",
    13: "Floor",
  };
  
  return statusMap[statusId] || "Unknown";
}

// Simplify chamber name
export function simplifyChambername(chamber: string): string {
  const chamberMap: Record<string, string> = {
    "House": "House",
    "Senate": "Senate",
    "Primary Chamber": "House",
    "Lower": "House",
    "Upper": "Senate",
    "H": "House",
    "S": "Senate",
  };
  
  return chamberMap[chamber] || chamber;
}

// Calculate bill progress percentage
export function calculateBillProgress(statusId: number): number {
  const progressMap: Record<number, number> = {
    [Status.NA]: 5,  // Unknown
    [Status.INTRODUCED]: 10,  // Introduced
    [Status.ENGROSSED]: 70,  // Engrossed
    [Status.ENROLLED]: 90,  // Enrolled
    [Status.PASSED]: 100, // Passed
    [Status.VETOED]: 100, // Vetoed
    [Status.FAILED]: 100, // Failed/Dead
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

// Get text type description
export function getTextTypeDescription(typeId: number | string): string {
  const typeId_ = typeof typeId === 'string' ? parseInt(typeId) : typeId;
  
  const textTypeMap: Record<number, string> = {
    [TextTypes.INTRODUCED]: "Introduced",
    [TextTypes.COMMITTEE_SUBSTITUTE]: "Committee Substitute",
    [TextTypes.AMENDED]: "Amended",
    [TextTypes.ENGROSSED]: "Engrossed",
    [TextTypes.ENROLLED]: "Enrolled",
    [TextTypes.CHAPTERED]: "Chaptered",
    [TextTypes.FISCAL_NOTE]: "Fiscal Note",
    [TextTypes.ANALYSIS]: "Analysis",
    [TextTypes.DRAFT]: "Draft",
    [TextTypes.CONFERENCE_SUBSTITUTE]: "Conference Substitute",
    [TextTypes.PREFILED]: "Prefiled",
    [TextTypes.VETO_MESSAGE]: "Veto Message",
    [TextTypes.VETO_RESPONSE]: "Veto Response",
    [TextTypes.SUBSTITUTE]: "Substitute",
  };
  
  return textTypeMap[typeId_] || "Unknown";
}

// Get bill type description
export function getBillTypeDescription(typeId: number | string): string {
  const typeId_ = typeof typeId === 'string' ? parseInt(typeId) : typeId;
  
  const billTypeMap: Record<number, string> = {
    [BillTypes.BILL]: "Bill",
    [BillTypes.RESOLUTION]: "Resolution",
    [BillTypes.CONCURRENT_RESOLUTION]: "Concurrent Resolution",
    [BillTypes.JOINT_RESOLUTION]: "Joint Resolution",
    [BillTypes.JOINT_RESOLUTION_CONST_AMENDMENT]: "Joint Resolution Constitutional Amendment",
    [BillTypes.EXECUTIVE_ORDER]: "Executive Order",
    [BillTypes.CONSTITUTIONAL_AMENDMENT]: "Constitutional Amendment",
    [BillTypes.MEMORIAL]: "Memorial",
    [BillTypes.CLAIM]: "Claim",
    [BillTypes.COMMENDATION]: "Commendation",
  };
  
  return billTypeMap[typeId_] || "Bill";
}

// Get event type description
export function getEventTypeDescription(typeId: number): string {
  const eventTypeMap: Record<number, string> = {
    [EventTypes.HEARING]: "Hearing",
    [EventTypes.EXECUTIVE_SESSION]: "Executive Session",
    [EventTypes.MARKUP_SESSION]: "Markup Session",
  };
  
  return eventTypeMap[typeId] || "Unknown";
}

// Format date for display
export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

// Get MIME type extension
export function getMimeTypeExtension(mimeId: number): string {
  const mimeExtMap: Record<number, string> = {
    [MimeTypes.HTML]: ".html",
    [MimeTypes.PDF]: ".pdf",
    [MimeTypes.WORDPERFECT]: ".wpd",
    [MimeTypes.MS_WORD]: ".doc",
    [MimeTypes.RTF]: ".rtf",
    [MimeTypes.MS_WORD_2007]: ".docx",
  };
  
  return mimeExtMap[mimeId] || "";
}

// Process bill histories into timeline events with descriptions
export function processBillHistory(history: Array<{ date: string; action: string; chamber: string; importance: number }>): BillProgress[] {
  if (!history || !Array.isArray(history)) {
    return [];
  }
  
  // Map action text patterns to event types
  const patternMap: Array<[RegExp, number]> = [
    [/introduced|first read|prefiled/i, Status.INTRODUCED],
    [/engrossed/i, Status.ENGROSSED],
    [/enrolled/i, Status.ENROLLED],
    [/passed|approved|adopted/i, Status.PASSED],
    [/veto/i, Status.VETOED],
    [/failed|died/i, Status.FAILED],
    [/committee|referred/i, 8], // Referred
    [/amendment|amended/i, 10], // Amended
    [/hearing/i, 11], // Hearing
    [/filed/i, 12], // Filed
    [/floor/i, 13], // Floor
  ];
  
  return history.map(item => {
    // Try to determine event type from action text
    const eventType = patternMap.find(([pattern]) => pattern.test(item.action))
      ? patternMap.find(([pattern]) => pattern.test(item.action))![1]
      : 0;
    
    return {
      date: item.date,
      event: eventType,
      description: item.action
    };
  });
}
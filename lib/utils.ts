import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import DOMPurify from "dompurify";
import { format, parseISO, isValid } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last time it was invoked.
 * 
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns A debounced version of the provided function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Maps a bill status ID to a human-readable status label
 */
export function getBillStatusLabel(statusId: number): string {
  const statusMap: Record<number, string> = {
    1: "Introduced",
    2: "In Committee",
    3: "Passed Committee",
    4: "Passed First Chamber",
    5: "Passed Second Chamber",
    6: "Sent to Executive",
    7: "Vetoed",
    8: "Enacted",
    9: "Dead",
    10: "Enrolled",
    11: "Withdrawn"
  };
  
  return statusMap[statusId] || "Unknown";
}

/**
 * Gets CSS classes for styling bill status badges
 */
export function getStatusColor(statusId: number): string {
  const colorMap: Record<number, string> = {
    1: "bg-blue-600", // Introduced
    2: "bg-indigo-600", // In Committee
    3: "bg-purple-600", // Passed Committee
    4: "bg-violet-600", // Passed First Chamber
    5: "bg-fuchsia-600", // Passed Second Chamber
    6: "bg-orange-500", // Sent to Executive
    7: "bg-red-600", // Vetoed
    8: "bg-green-600", // Enacted
    9: "bg-gray-600", // Dead
    10: "bg-teal-600", // Enrolled
    11: "bg-yellow-600", // Withdrawn
  };
  
  return colorMap[statusId] || "bg-gray-600";
}

/**
 * Returns progress bar value and properties based on bill status
 */
export function getBillProgress(statusId: number, progress?: number): { 
  value: number, 
  color: string,
  striped?: boolean,
  animated?: boolean
} {
  // Use provided progress value if available, otherwise estimate from status ID
  const progressValue = progress ?? Math.min((statusId / 8) * 100, 100);
  
  // For statuses that represent "dead" or "vetoed" bills, show striped pattern
  const isTerminated = [7, 9, 11].includes(statusId);
  
  // For statuses that are active and recent, show animation
  const isActive = [2, 3, 4, 5, 6].includes(statusId);
  
  // For enacted laws, show full green progress
  const isEnacted = statusId === 8;
  
  let color = "bg-blue-600";
  if (isTerminated) color = "bg-red-600";
  if (isEnacted) color = "bg-green-600";
  
  return {
    value: progressValue,
    color,
    striped: isTerminated,
    animated: isActive,
  };
}

/**
 * Formats a date string with consistent formatting
 */
export function formatDate(dateString?: string, formatStr = 'MMM d, yyyy'): string {
  if (!dateString) return '';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (!isValid(date)) return '';
    return format(date, formatStr);
  } catch (e) {
    return '';
  }
}

/**
 * Formats date and time for display
 */
export function formatDateTime(
  dateString?: string, 
  timeString?: string, 
  formatStr = 'MMM d, yyyy'
): string {
  if (!dateString) return '';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (!isValid(date)) return '';
    return format(date, formatStr) + (timeString ? ` at ${timeString}` : '');
  } catch (e) {
    return '';
  }
}

/**
 * Sanitizes HTML content for safe rendering in React
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side, we can't use DOMPurify, so we return an empty string
    // Consider using a server-compatible HTML sanitizer if needed
    return '';
  }
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'ul', 'ol', 'li',
      'strong', 'em', 'a', 'span', 'div', 'table', 'thead', 'tbody', 
      'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id']
  });
}

/**
 * Creates a URL-friendly slug from a string
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

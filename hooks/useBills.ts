/**
 * Hooks for fetching bill data
 */
import useSWR from 'swr';
import { Bill, DetailedBill } from '@/types/legiscan';
import { billsResponseSchema, billDetailResponseSchema, searchResponseSchemaWrapper } from '@/schemas/legiscan';
import { createFetcher, createParameterizedFetcher } from './useFetch';
import { ApiResponse, SearchResponse } from '@/types/legiscan';

// Fetchers with validation
const billsFetcher = createFetcher<ApiResponse<Bill[]>>(billsResponseSchema);
const billDetailFetcher = createFetcher<ApiResponse<DetailedBill>>(billDetailResponseSchema);
const searchFetcher = createFetcher<ApiResponse<SearchResponse>>(searchResponseSchemaWrapper);

/**
 * Hook for fetching all bills
 */
export function useBills() {
  return useSWR('/api/bills', billsFetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
    revalidateOnFocus: false,
  });
}

/**
 * Hook for fetching a specific bill by ID
 */
export function useBill(billId: string | number) {
  return useSWR(billId ? `/api/bills/${billId}` : null, billDetailFetcher, {
    refreshInterval: 600000, // Refresh every 10 minutes
    revalidateOnFocus: false,
  });
}

/**
 * Hook for searching bills
 */
export function useSearchBills(query: string, options?: { page?: number; year?: number; state?: string }) {
  const { page = 1, year, state } = options || {};
  
  // Build query string
  const params = new URLSearchParams();
  params.append('q', query);
  params.append('page', page.toString());
  if (year) params.append('year', year.toString());
  if (state) params.append('state', state);
  
  const queryString = params.toString();
  const url = query ? `/api/bills/search?${queryString}` : null;
  
  return useSWR(url, searchFetcher, {
    refreshInterval: 600000, // Refresh every 10 minutes
    revalidateOnFocus: false,
  });
}

// Export specific types used by these hooks
export type { Bill, DetailedBill, SearchResponse, ApiResponse };
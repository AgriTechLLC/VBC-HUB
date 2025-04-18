/**
 * Hooks for fetching legislative events data
 */
import useSWR from 'swr';
import { LegislativeEvent } from '@/types/legiscan';
import { eventsResponseSchema } from '@/schemas/legiscan';
import { createFetcher } from './useFetch';
import { ApiResponse } from '@/types/legiscan';

// Fetchers with validation
const eventsFetcher = createFetcher<ApiResponse<LegislativeEvent[]>>(eventsResponseSchema);

/**
 * Hook for fetching all events
 */
export function useEvents() {
  return useSWR('/api/events', eventsFetcher, {
    refreshInterval: 600000, // Refresh every 10 minutes
    revalidateOnFocus: false,
  });
}

/**
 * Hook for fetching upcoming events (filtered client-side)
 */
export function useUpcomingEvents() {
  const { data, error, isValidating, mutate } = useEvents();
  
  // Filter events that are in the future
  const upcomingEvents = data?.data?.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of today
    return eventDate >= today;
  });
  
  return {
    data: upcomingEvents ? { success: true, data: upcomingEvents } : undefined,
    error,
    isValidating,
    mutate,
  };
}

/**
 * Hook for fetching events related to a specific bill
 */
export function useBillEvents(billId: string | number) {
  const { data, error, isValidating, mutate } = useEvents();
  
  // Filter events for the specific bill
  const billEvents = data?.data?.filter(event => 
    event.bill_id === Number(billId)
  );
  
  return {
    data: billEvents ? { success: true, data: billEvents } : undefined,
    error,
    isValidating,
    mutate,
  };
}

// Export specific types used by these hooks
export type { LegislativeEvent, ApiResponse };
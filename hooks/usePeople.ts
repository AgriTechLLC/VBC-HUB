/**
 * Hooks for fetching people/legislators data
 */
import useSWR from 'swr';
import { Person, Sponsor } from '@/types/legiscan';
import { peopleResponseSchema, personResponseSchema, sponsorsResponseSchema } from '@/schemas/legiscan';
import { createFetcher } from './useFetch';
import { ApiResponse } from '@/types/legiscan';

// Fetchers with validation
const peopleFetcher = createFetcher<ApiResponse<Person[]>>(peopleResponseSchema);
const personFetcher = createFetcher<ApiResponse<Person>>(personResponseSchema);
const sponsorsFetcher = createFetcher<ApiResponse<Sponsor[]>>(sponsorsResponseSchema);

/**
 * Hook for fetching people in a specific session
 */
export function useSessionPeople(sessionId: string | number) {
  return useSWR(sessionId ? `/api/sessions/${sessionId}/people` : null, peopleFetcher, {
    refreshInterval: 3600000, // Refresh every hour (people don't change often)
    revalidateOnFocus: false,
  });
}

/**
 * Hook for fetching a specific person by ID
 */
export function usePerson(peopleId: string | number) {
  return useSWR(peopleId ? `/api/people/${peopleId}` : null, personFetcher, {
    refreshInterval: 3600000, // Refresh every hour
    revalidateOnFocus: false,
  });
}

/**
 * Hook for fetching sponsors of a specific bill
 */
export function useBillSponsors(billId: string | number) {
  return useSWR(billId ? `/api/bills/${billId}/sponsors` : null, sponsorsFetcher, {
    refreshInterval: 3600000, // Refresh every hour
    revalidateOnFocus: false,
  });
}

// Export specific types used by these hooks
export type { Person, Sponsor, ApiResponse };
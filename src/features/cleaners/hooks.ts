import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { endpoints } from '../../api/endpoints';
import { getData, getPaginated } from '../../api/client';
import type { CleanerListing, CleanerProfile } from '../../types/models';
import { nextPageParam } from '../../utils/query';

export const cleanerKeys = {
  listings: ['listings', 'public'] as const,
  listing: (id: string) => ['listings', 'detail', id] as const,
  publicProfile: (userId: string) => ['cleaner-profiles', 'public', userId] as const,
};

/**
 * Public, active cleaner listings (paginated).
 * The backend doesn't support text search on this endpoint, so screens
 * filter the loaded pages client-side.
 */
export function useActiveListings() {
  return useInfiniteQuery({
    queryKey: cleanerKeys.listings,
    queryFn: ({ pageParam }) => getPaginated<CleanerListing>(endpoints.listings.root, pageParam),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: cleanerKeys.listing(id),
    queryFn: () => getData<CleanerListing>(endpoints.listings.byId(id)),
  });
}

export function usePublicCleanerProfile(userId: string, enabled = true) {
  return useQuery({
    queryKey: cleanerKeys.publicProfile(userId),
    queryFn: () => getData<CleanerProfile>(endpoints.cleanerProfiles.publicById(userId)),
    enabled,
  });
}

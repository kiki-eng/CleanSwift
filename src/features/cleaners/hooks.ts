import { useQuery } from '@tanstack/react-query';

import { endpoints } from '../../api/endpoints';
import { getData, getPaginated } from '../../api/client';
import type { CleanerListing, CleanerProfile } from '../../types/models';

export const cleanerKeys = {
  listings: (search?: string) => ['listings', { search: search ?? '' }] as const,
  listing: (id: string) => ['listings', id] as const,
  publicProfile: (userId: string) => ['cleaner-profiles', 'public', userId] as const,
};

/** Public, active cleaner listings (first page — pagination comes with the search screen). */
export function useActiveListings(search?: string) {
  return useQuery({
    queryKey: cleanerKeys.listings(search),
    queryFn: () =>
      getPaginated<CleanerListing>(endpoints.listings.root, 1, search ? { search } : undefined),
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: cleanerKeys.listing(id),
    queryFn: () => getData<CleanerListing>(endpoints.listings.byId(id)),
  });
}

export function usePublicCleanerProfile(userId: string) {
  return useQuery({
    queryKey: cleanerKeys.publicProfile(userId),
    queryFn: () => getData<CleanerProfile>(endpoints.cleanerProfiles.publicById(userId)),
  });
}

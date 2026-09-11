import { useMutation, useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';

import { endpoints } from '../../api/endpoints';
import { getData, getPaginated, postData } from '../../api/client';
import { authApi } from '../auth/authApi';
import { useAuthStore } from '../../store/authStore';
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

export interface ApplyToBecomeCleanerInput {
  is_individual: boolean;
  company_name?: string;
  cleaning_experience?: string;
  hourly_rate?: number;
  service_areas?: string[];
  specialties?: string[];
}

/**
 * Customer: submit a cleaner profile application (the "apply to clean
 * later" path from the role picker). On success the backend flips the
 * user's role to CLEANER with the profile PENDING review, so we refresh
 * both the session user and the cleaner profile — RootNavigator then
 * switches from CustomerTabs to CleanerTabs automatically.
 */
export function useApplyToBecomeCleaner() {
  const setSession = useAuthStore(state => state.setSession);
  const setCleanerProfile = useAuthStore(state => state.setCleanerProfile);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ApplyToBecomeCleanerInput) =>
      postData<CleanerProfile>(endpoints.cleanerProfiles.apply, input),
    onSuccess: async profile => {
      setCleanerProfile(profile);
      try {
        setSession(await authApi.me());
      } catch {
        // Session user refresh is best-effort; the profile is already saved.
      }
      queryClient.clear();
    },
  });
}

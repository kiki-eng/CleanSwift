import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { endpoints } from '../../api/endpoints';
import { deleteData, getData, patchData, postData } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import type { ListingStatus } from '../../types/enums';
import type { CleanerListing, CleanerProfile } from '../../types/models';

export interface ListingInput {
  title: string;
  description: string;
  price: number;
  status?: ListingStatus;
}

export const listingKeys = {
  myProfile: ['cleaner-profiles', 'me'] as const,
};

/**
 * Cleaner: my own profile, including my listings.
 * Also keeps the session store's copy of the profile in sync.
 */
export function useMyCleanerProfile() {
  const setCleanerProfile = useAuthStore(state => state.setCleanerProfile);
  return useQuery({
    queryKey: listingKeys.myProfile,
    queryFn: async () => {
      const profile = await getData<CleanerProfile>(endpoints.cleanerProfiles.me);
      setCleanerProfile(profile);
      return profile;
    },
  });
}

function useInvalidateListings() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: listingKeys.myProfile });
    queryClient.invalidateQueries({ queryKey: ['listings'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };
}

export function useCreateListing() {
  const invalidate = useInvalidateListings();
  return useMutation({
    mutationFn: (input: ListingInput) =>
      postData<CleanerListing>(endpoints.listings.root, input),
    onSuccess: invalidate,
  });
}

export function useUpdateListing() {
  const invalidate = useInvalidateListings();
  return useMutation({
    mutationFn: ({ id, ...input }: ListingInput & { id: string }) =>
      patchData<CleanerListing>(endpoints.listings.byId(id), input),
    onSuccess: invalidate,
  });
}

export function useDeleteListing() {
  const invalidate = useInvalidateListings();
  return useMutation({
    mutationFn: (id: string) => deleteData(endpoints.listings.byId(id)),
    onSuccess: invalidate,
  });
}

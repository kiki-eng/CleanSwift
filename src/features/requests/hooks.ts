import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { endpoints } from '../../api/endpoints';
import { getData, getPaginated, patchData, postData } from '../../api/client';
import type { ListingRequestStatus } from '../../types/enums';
import type { ListingRequest } from '../../types/models';
import { nextPageParam } from '../../utils/query';

export interface CreateListingRequestInput {
  listing_id: string;
  address: string;
  requested_date: string;
  additional_notes?: string;
}

export const requestKeys = {
  detail: (id: string) => ['listing-requests', 'detail', id] as const,
  forCleaner: (status?: ListingRequestStatus) =>
    ['listing-requests', 'cleaner', { status: status ?? 'ALL' }] as const,
};

/** Either role: one listing request by ID. */
export function useListingRequest(id: string) {
  return useQuery({
    queryKey: requestKeys.detail(id),
    queryFn: () => getData<ListingRequest>(endpoints.listingRequests.byId(id)),
  });
}

/** Cleaner: booking requests customers sent to my listings. */
export function useCleanerRequests(status?: ListingRequestStatus) {
  return useInfiniteQuery({
    queryKey: requestKeys.forCleaner(status),
    queryFn: ({ pageParam }) =>
      getPaginated<ListingRequest>(
        endpoints.listingRequests.forCleaner,
        pageParam,
        status ? { status } : undefined,
      ),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
  });
}

/** Customer: book a cleaner directly from a listing. */
export function useCreateListingRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateListingRequestInput) =>
      postData<ListingRequest>(endpoints.listingRequests.root, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['listing-requests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/**
 * Update a request's status.
 * Cleaner: ACCEPTED / REJECTED / STARTED / COMPLETED. Customer: CANCELLED.
 */
export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ListingRequestStatus }) =>
      patchData<ListingRequest>(endpoints.listingRequests.status(id), { status }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['listing-requests'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

import { useInfiniteQuery } from '@tanstack/react-query';

import { endpoints } from '../../api/endpoints';
import { getPaginated } from '../../api/client';
import type { JobStatus, ListingRequestStatus } from '../../types/enums';
import type { Job, ListingRequest } from '../../types/models';
import { nextPageParam } from '../../utils/query';

export const bookingKeys = {
  myPostings: (status?: JobStatus) =>
    ['bookings', 'my-postings', { status: status ?? 'ALL' }] as const,
  myRequests: (status?: ListingRequestStatus) =>
    ['bookings', 'my-requests', { status: status ?? 'ALL' }] as const,
};

/** Customer: jobs I posted (paginated, optional status filter). */
export function useMyPostings(status?: JobStatus) {
  return useInfiniteQuery({
    queryKey: bookingKeys.myPostings(status),
    queryFn: ({ pageParam }) =>
      getPaginated<Job>(endpoints.jobs.myPostings, pageParam, status ? { status } : undefined),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
  });
}

/** Customer: direct booking requests I sent to cleaner listings. */
export function useMyListingRequests(status?: ListingRequestStatus) {
  return useInfiniteQuery({
    queryKey: bookingKeys.myRequests(status),
    queryFn: ({ pageParam }) =>
      getPaginated<ListingRequest>(
        endpoints.listingRequests.mine,
        pageParam,
        status ? { status } : undefined,
      ),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
  });
}

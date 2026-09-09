import { useQuery } from '@tanstack/react-query';

import { endpoints } from '../../api/endpoints';
import { getPaginated } from '../../api/client';
import type { Job, ListingRequest } from '../../types/models';

export const bookingKeys = {
  myPostings: ['bookings', 'my-postings'] as const,
  myRequests: ['bookings', 'my-requests'] as const,
};

/** Customer: jobs I posted. */
export function useMyPostings() {
  return useQuery({
    queryKey: bookingKeys.myPostings,
    queryFn: () => getPaginated<Job>(endpoints.jobs.myPostings, 1),
  });
}

/** Customer: direct booking requests I sent to cleaner listings. */
export function useMyListingRequests() {
  return useQuery({
    queryKey: bookingKeys.myRequests,
    queryFn: () => getPaginated<ListingRequest>(endpoints.listingRequests.mine, 1),
  });
}

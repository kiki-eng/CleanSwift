import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { endpoints } from '../../api/endpoints';
import { getPaginated, postData } from '../../api/client';
import type { Review } from '../../types/models';
import { nextPageParam } from '../../utils/query';

export interface CreateReviewInput {
  rating: number;
  comment?: string;
}

export const reviewKeys = {
  forCleaner: (cleanerUserId: string) => ['reviews', 'cleaner', cleanerUserId] as const,
};

/** Public reviews for a cleaner (keyed by the cleaner's user ID). */
export function useCleanerReviews(cleanerUserId: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: reviewKeys.forCleaner(cleanerUserId),
    queryFn: ({ pageParam }) =>
      getPaginated<Review>(endpoints.reviews.forCleaner(cleanerUserId), pageParam),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
    enabled,
  });
}

/** Customer: review a completed job. */
export function useReviewJob(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReviewInput) =>
      postData<Review>(endpoints.reviews.forJob(jobId), input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  });
}

/** Customer: review a completed direct booking. */
export function useReviewListingRequest(requestId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReviewInput) =>
      postData<Review>(endpoints.reviews.forListingRequest(requestId), input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  });
}

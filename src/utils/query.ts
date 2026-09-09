import type { InfiniteData } from '@tanstack/react-query';

import type { Paginated } from '../api/types';

/** Flatten React Query infinite pages into a single item array. */
export function flattenPages<T>(data: InfiniteData<Paginated<T>> | undefined): T[] {
  return data?.pages.flatMap(page => page.items) ?? [];
}

/** Shared getNextPageParam implementation for paginated endpoints. */
export function nextPageParam<T>(lastPage: Paginated<T>): number | undefined {
  if (!lastPage.hasMore) {
    return undefined;
  }
  return (lastPage.meta?.currentPage ?? 0) + 1;
}

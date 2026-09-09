import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { endpoints } from '../../api/endpoints';
import { getData, getPaginated, postData } from '../../api/client';
import type { JobMode, JobStatus, PropertyType } from '../../types/enums';
import type { Job } from '../../types/models';
import { nextPageParam } from '../../utils/query';

export interface OpenJobFilters {
  search?: string;
  mode?: JobMode;
  property_type?: PropertyType;
  location?: string;
}

export interface CreateJobInput {
  title: string;
  description: string;
  mode: JobMode;
  property_type: PropertyType;
  address: string;
  scheduled_date: number;
  estimated_duration: number;
  budget: number;
  currency?: string;
  special_requirements?: string[];
}

export const jobKeys = {
  all: ['jobs'] as const,
  open: (filters: OpenJobFilters) => ['jobs', 'open', filters] as const,
  mine: (status?: JobStatus) => ['jobs', 'mine', { status: status ?? 'ALL' }] as const,
  detail: (id: string) => ['jobs', 'detail', id] as const,
};

/** Cleaner: open jobs available to accept/apply (paginated). */
export function useOpenJobs(filters: OpenJobFilters = {}) {
  return useInfiniteQuery({
    queryKey: jobKeys.open(filters),
    queryFn: ({ pageParam }) =>
      getPaginated<Job>(endpoints.jobs.open, pageParam, {
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.mode ? { mode: filters.mode } : {}),
        ...(filters.property_type ? { property_type: filters.property_type } : {}),
        ...(filters.location ? { location: filters.location } : {}),
      }),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
  });
}

/** Cleaner: jobs assigned to me (paginated, optional status filter). */
export function useMyJobs(status?: JobStatus) {
  return useInfiniteQuery({
    queryKey: jobKeys.mine(status),
    queryFn: ({ pageParam }) =>
      getPaginated<Job>(endpoints.jobs.myJobs, pageParam, status ? { status } : undefined),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
  });
}

/** Job details (both roles). */
export function useJob(id: string) {
  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: () => getData<Job>(endpoints.jobs.byId(id)),
  });
}

function useJobAction(pathFor: (id: string) => string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => postData<Job>(pathFor(jobId)),
    onSuccess: (_data, jobId) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/** Customer: post a new job. */
export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateJobInput) => postData<Job>(endpoints.jobs.root, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/** Customer: cancel a job. */
export function useCancelJob() {
  return useJobAction(endpoints.jobs.cancel);
}

/** Cleaner: instantly accept a FIRST_COME job. */
export function useAcceptJob() {
  return useJobAction(endpoints.jobs.accept);
}

/** Cleaner: mark an assigned job as in progress. */
export function useStartJob() {
  return useJobAction(endpoints.jobs.start);
}

/** Cleaner: mark an in-progress job as completed. */
export function useCompleteJob() {
  return useJobAction(endpoints.jobs.complete);
}

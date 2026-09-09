import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { endpoints } from '../../api/endpoints';
import { getPaginated, postData } from '../../api/client';
import type { Job } from '../../types/models';

export const jobKeys = {
  open: ['jobs', 'open'] as const,
  mine: ['jobs', 'mine'] as const,
};

/** Cleaner: open jobs available to accept/apply. */
export function useOpenJobs() {
  return useQuery({
    queryKey: jobKeys.open,
    queryFn: () => getPaginated<Job>(endpoints.jobs.open, 1),
  });
}

/** Cleaner: jobs assigned to me. */
export function useMyJobs() {
  return useQuery({
    queryKey: jobKeys.mine,
    queryFn: () => getPaginated<Job>(endpoints.jobs.myJobs, 1),
  });
}

/** Cleaner: instantly accept a FIRST_COME job. */
export function useAcceptJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => postData<unknown>(endpoints.jobs.accept(jobId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  });
}

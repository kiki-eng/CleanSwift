import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { endpoints } from '../../api/endpoints';
import { getPaginated, postData } from '../../api/client';
import type { JobApplication } from '../../types/models';

export interface ApplyToJobInput {
  jobId: string;
  cover_letter?: string;
  proposed_price?: number;
}

export const applicationKeys = {
  forJob: (jobId: string) => ['applications', 'job', jobId] as const,
};

/** Customer: all applications submitted for one of my jobs. */
export function useJobApplications(jobId: string, enabled = true) {
  return useQuery({
    queryKey: applicationKeys.forJob(jobId),
    queryFn: () => getPaginated<JobApplication>(endpoints.applications.forJob(jobId), 1),
    enabled,
  });
}

/** Cleaner: apply for a CUSTOMER_SELECTS job. */
export function useApplyToJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, ...body }: ApplyToJobInput) =>
      postData<JobApplication>(endpoints.applications.apply(jobId), body),
    onSuccess: (_data, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.forJob(jobId) });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

/** Customer: accept a cleaner's application (assigns the job). */
export function useAcceptApplication(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) =>
      postData<JobApplication>(endpoints.applications.accept(applicationId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.forJob(jobId) });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

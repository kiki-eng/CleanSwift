import { useQuery } from '@tanstack/react-query';

import { endpoints } from '../../api/endpoints';
import { getData } from '../../api/client';
import type { CleanerDashboard, CustomerDashboard } from '../../types/models';

export const dashboardKeys = {
  customer: ['dashboard', 'customer'] as const,
  cleaner: ['dashboard', 'cleaner'] as const,
};

export function useCustomerDashboard() {
  return useQuery({
    queryKey: dashboardKeys.customer,
    queryFn: () => getData<CustomerDashboard>(endpoints.dashboard.customer),
  });
}

export function useCleanerDashboard() {
  return useQuery({
    queryKey: dashboardKeys.cleaner,
    queryFn: () => getData<CleanerDashboard>(endpoints.dashboard.cleaner),
  });
}

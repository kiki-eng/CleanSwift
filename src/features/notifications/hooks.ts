import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { endpoints } from '../../api/endpoints';
import { deleteData, getData, getPaginated, patchData, postData } from '../../api/client';
import type { AppNotification } from '../../types/models';
import { nextPageParam } from '../../utils/query';

export const notificationKeys = {
  list: ['notifications', 'list'] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: notificationKeys.list,
    queryFn: ({ pageParam }) =>
      getPaginated<AppNotification>(endpoints.notifications.root, pageParam),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: () => getData<{ count: number }>(endpoints.notifications.unreadCount),
    refetchInterval: 60_000,
  });
}

function useInvalidateNotifications() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: notificationKeys.list });
    queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
  };
}

export function useMarkNotificationRead() {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: (id: string) =>
      patchData<AppNotification>(endpoints.notifications.byId(id), { status: 'read' }),
    onSuccess: invalidate,
  });
}

export function useMarkAllNotificationsRead() {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: () => postData<unknown>(endpoints.notifications.markAllRead),
    onSuccess: invalidate,
  });
}

export function useDeleteNotification() {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: (id: string) => deleteData(endpoints.notifications.byId(id)),
    onSuccess: invalidate,
  });
}

import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import {
  Button,
  EmptyState,
  ErrorState,
  Icon,
  LoadingState,
  Screen,
} from '../../components';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../../features/notifications/hooks';
import { colors, radii, spacing, typography } from '../../theme';
import type { AppNotification } from '../../types/models';
import { formatUnixDate } from '../../utils/format';
import { flattenPages } from '../../utils/query';

function iconFor(type: string): string {
  if (type.startsWith('job')) {
    return 'briefcase-outline';
  }
  if (type.startsWith('listing_request')) {
    return 'calendar-outline';
  }
  if (type.startsWith('payment')) {
    return 'cash-outline';
  }
  if (type.startsWith('application')) {
    return 'document-text-outline';
  }
  return 'notifications-outline';
}

export function NotificationsScreen(): React.JSX.Element {
  const notifications = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const items = flattenPages(notifications.data);
  const hasUnread = items.some(item => item.status === 'unread');

  return (
    <Screen scroll={false} padded={false}>
      {hasUnread ? (
        <View style={styles.toolbar}>
          <Button
            title="Mark all as read"
            variant="ghost"
            size="sm"
            loading={markAllRead.isPending}
            onPress={() => markAllRead.mutate()}
          />
        </View>
      ) : null}

      {notifications.isPending ? (
        <LoadingState label="Loading notifications…" />
      ) : notifications.isError ? (
        <ErrorState
          message={notifications.error.message}
          onRetry={() => notifications.refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon="notifications-outline"
          title="No notifications"
          message="You're all caught up!"
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <NotificationRow notification={item} />}
          contentContainerStyle={styles.list}
          onEndReached={() => {
            if (notifications.hasNextPage && !notifications.isFetchingNextPage) {
              notifications.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.4}
          refreshing={notifications.isRefetching && !notifications.isFetchingNextPage}
          onRefresh={() => notifications.refetch()}
        />
      )}
    </Screen>
  );
}

function NotificationRow({ notification }: { notification: AppNotification }): React.JSX.Element {
  const navigation = useNavigation();
  const markRead = useMarkNotificationRead();
  const unread = notification.status === 'unread';

  const handlePress = (): void => {
    if (unread) {
      markRead.mutate(notification.id);
    }
    // Deep-link into the related booking when the notification points at one.
    if (notification.entity_id && notification.entity_type) {
      const type = notification.entity_type.toLowerCase();
      if (type.includes('listing_request') || type.includes('listingrequest')) {
        navigation.navigate('BookingDetails', {
          kind: 'listing-request',
          id: notification.entity_id,
        });
      } else if (type.includes('job')) {
        navigation.navigate('BookingDetails', { kind: 'job', id: notification.entity_id });
      }
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        unread && styles.rowUnread,
        pressed && styles.rowPressed,
      ]}>
      <View style={[styles.iconCircle, unread && styles.iconCircleUnread]}>
        <Icon
          name={iconFor(notification.type)}
          size={20}
          color={unread ? colors.primary : colors.ink400}
        />
      </View>
      <View style={styles.rowBody}>
        <Text style={unread ? styles.titleUnread : styles.title}>{notification.title}</Text>
        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>
        <Text style={typography.caption}>{formatUnixDate(notification.created_at)}</Text>
      </View>
      {unread ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.huge,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.ink100,
    alignItems: 'flex-start',
  },
  rowUnread: { backgroundColor: colors.primaryLight, borderColor: colors.primaryLight },
  rowPressed: { opacity: 0.9 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.ink100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleUnread: { backgroundColor: colors.white },
  rowBody: { flex: 1, gap: spacing.xxs },
  title: { ...typography.body, color: colors.ink700 },
  titleUnread: { ...typography.bodyMedium },
  message: { ...typography.body, color: colors.ink500 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: spacing.xs,
  },
});

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useUnreadCount } from '../features/notifications/hooks';
import { colors, typography } from '../theme';
import { Icon } from './Icon';

/** Bell icon with unread badge — navigates to the Notifications screen. */
export function NotificationBell(): React.JSX.Element {
  const navigation = useNavigation();
  const unread = useUnreadCount();
  const count = unread.data?.count ?? 0;

  return (
    <Pressable
      onPress={() => navigation.navigate('Notifications')}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={
        count > 0 ? `Notifications, ${count} unread` : 'Notifications'
      }
      style={styles.container}>
      <Icon name="notifications-outline" size={24} color={colors.ink700} />
      {count > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: 4 },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    ...typography.captionMedium,
    color: colors.white,
    fontSize: 10,
    lineHeight: 12,
  },
});

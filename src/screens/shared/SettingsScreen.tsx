import React, { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import {
  BottomSheet,
  Button,
  Card,
  Icon,
  Input,
  Screen,
} from '../../components';
import { env } from '../../config/env';
import {
  useDeactivateAccount,
  usePreferences,
  useUpdatePreferences,
} from '../../features/profile/hooks';
import { colors, spacing, typography } from '../../theme';
import type { NotificationPreferences } from '../../types/models';

const PREFERENCE_ROWS: Array<{
  key: keyof NotificationPreferences;
  icon: string;
  label: string;
}> = [
  { key: 'push_notifications', icon: 'notifications-outline', label: 'Push notifications' },
  { key: 'email_notifications', icon: 'mail-outline', label: 'Email notifications' },
  { key: 'job_updates', icon: 'briefcase-outline', label: 'Job updates' },
  { key: 'application_updates', icon: 'document-text-outline', label: 'Application updates' },
  { key: 'payment_alerts', icon: 'cash-outline', label: 'Payment alerts' },
];

export function SettingsScreen(): React.JSX.Element {
  const preferences = usePreferences();
  const updatePreferences = useUpdatePreferences();
  const [showDeactivate, setShowDeactivate] = useState(false);

  const notificationPrefs = preferences.data?.notifications ?? {};

  const togglePreference = (key: keyof NotificationPreferences, value: boolean): void => {
    updatePreferences.mutate({
      notifications: { ...notificationPrefs, [key]: value },
    });
  };

  return (
    <Screen>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        {preferences.isError ? (
          <Text style={styles.errorText}>Couldn't load your preferences.</Text>
        ) : (
          PREFERENCE_ROWS.map(row => (
            <Card key={row.key} style={styles.row}>
              <Icon name={row.icon} size={20} />
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Switch
                value={notificationPrefs[row.key] !== false}
                onValueChange={value => togglePreference(row.key, value)}
                disabled={preferences.isPending || updatePreferences.isPending}
                trackColor={{ true: colors.primary, false: colors.ink200 }}
              />
            </Card>
          ))
        )}
        {updatePreferences.isError ? (
          <Text style={styles.errorText}>{updatePreferences.error.message}</Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Card style={styles.row}>
          <Icon name="code-slash-outline" size={20} />
          <Text style={styles.rowLabel}>Version</Text>
          <Text style={typography.caption}>1.0.0</Text>
        </Card>
        <Card style={styles.row}>
          <Icon name="server-outline" size={20} />
          <Text style={styles.rowLabel}>API</Text>
          <Text style={typography.caption} numberOfLines={1}>
            {env.API_BASE_URL.replace('https://', '')}
          </Text>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger zone</Text>
        <Button
          title="Deactivate Account"
          variant="danger"
          onPress={() => setShowDeactivate(true)}
        />
      </View>

      <DeactivateSheet visible={showDeactivate} onClose={() => setShowDeactivate(false)} />
    </Screen>
  );
}

function DeactivateSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}): React.JSX.Element {
  const deactivate = useDeactivateAccount();
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Deactivate account">
      <Text style={styles.deactivateWarning}>
        Your account will be deactivated and you will be signed out. Contact support to
        reactivate.
      </Text>
      <Input
        label="Confirm your password"
        icon="lock-closed-outline"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="password"
      />
      <Input
        label="Reason (optional)"
        value={reason}
        onChangeText={setReason}
        placeholder="Tell us why you're leaving"
        multiline
      />
      {deactivate.isError ? (
        <Text style={styles.errorText}>{deactivate.error.message}</Text>
      ) : null}
      <Button
        title="Deactivate My Account"
        variant="danger"
        disabled={password.length === 0}
        loading={deactivate.isPending}
        onPress={() =>
          deactivate.mutate({ password, ...(reason.trim() ? { reason: reason.trim() } : {}) })
        }
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.xl, gap: spacing.md },
  sectionTitle: {
    ...typography.captionMedium,
    color: colors.ink500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowLabel: { ...typography.bodyLg, flex: 1 },
  errorText: {
    ...typography.body,
    color: colors.danger,
  },
  deactivateWarning: {
    ...typography.body,
    color: colors.ink500,
    marginBottom: spacing.lg,
  },
});

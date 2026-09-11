import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Avatar, Badge, Button, Card, Icon, Rating, Screen } from '../../components';
import { useLogout } from '../../features/auth/hooks';
import { confirmAction } from '../../store/confirmStore';
import { useAuthStore } from '../../store/authStore';
import type { CleanerStatus } from '../../types/enums';
import { colors, radii, spacing, typography } from '../../theme';
import { capitalize, displayName } from '../../utils/format';

export function ProfileScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.cleanerProfile);
  const logout = useLogout();

  if (!user) {
    return (
      <Screen scroll={false} tabScreen>
        {null}
      </Screen>
    );
  }

  // A CUSTOMER who has applied to clean has a cleanerProfile but keeps the
  // CUSTOMER role until an admin approves it — show application status
  // instead of stats that don't apply yet (0 jobs, no rating).
  const applicationPending = user.role === 'CUSTOMER' && Boolean(profile);

  return (
    <Screen tabScreen>
      <View style={styles.header}>
        <Avatar name={displayName(user)} uri={user.profile_photo_url} size={80} />
        <Text style={styles.name}>{displayName(user)}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Badge label={capitalize(user.role)} tone="brand" style={styles.roleBadge} />
      </View>

      {applicationPending && profile ? (
        <CleanerApplicationStatus status={profile.status} />
      ) : profile ? (
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <Rating value={profile.average_rating ?? 0} reviewCount={profile.total_reviews ?? 0} />
            <Text style={typography.caption}>
              {(profile.total_jobs_completed ?? 0) +
                (profile.total_listing_requests_completed ?? 0)}{' '}
              jobs completed
            </Text>
          </View>
          {profile.cleaning_experience ? (
            <Text style={styles.experience}>{profile.cleaning_experience}</Text>
          ) : null}
        </Card>
      ) : null}

      <View style={styles.rows}>
        <ProfileRow
          icon="create-outline"
          label="Edit profile"
          onPress={() => navigation.navigate('EditProfile')}
        />
        {user.role === 'CLEANER' ? (
          <ProfileRow
            icon="briefcase-outline"
            label="Business profile"
            onPress={() => navigation.navigate('CleanerProfileEdit')}
          />
        ) : null}
        <ProfileRow
          icon="key-outline"
          label="Change password"
          onPress={() => navigation.navigate('ChangePassword')}
        />
        <ProfileRow
          icon="settings-outline"
          label="Settings"
          onPress={() => navigation.navigate('Settings')}
        />
        {user.role === 'CUSTOMER' && !applicationPending ? (
          <ProfileRow
            icon="sparkles-outline"
            label="Become a cleaner"
            onPress={() => navigation.navigate('BecomeCleaner')}
          />
        ) : null}
        {user.email_verified === false ? (
          <ProfileRow
            icon="alert-circle-outline"
            label="Verify your email"
            warning
            onPress={() => navigation.navigate('VerifyEmail')}
          />
        ) : null}
        {user.phone_number ? (
          <ProfileRow icon="call-outline" label={user.phone_number} />
        ) : null}
        {user.location ? (
          <ProfileRow icon="location-outline" label={user.location} />
        ) : null}
      </View>

      <Button
        title="Log Out"
        variant="danger"
        onPress={async () => {
          const confirmed = await confirmAction({
            title: 'Log out?',
            message: "You'll need to log in again to continue.",
            confirmLabel: 'Log Out',
            destructive: true,
          });
          if (confirmed) {
            logout.mutate();
          }
        }}
        loading={logout.isPending}
        style={styles.logout}
      />
    </Screen>
  );
}

function CleanerApplicationStatus({ status }: { status: CleanerStatus }): React.JSX.Element {
  const config =
    status === 'PENDING'
      ? {
          icon: 'hourglass-outline',
          bg: colors.warningLight,
          fg: colors.warning,
          title: 'Cleaner application under review',
          text: "We're reviewing your cleaner profile. You'll switch to cleaner mode once approved.",
        }
      : status === 'SUSPENDED'
        ? {
            icon: 'pause-circle-outline',
            bg: colors.dangerLight,
            fg: colors.danger,
            title: 'Cleaner account suspended',
            text: 'Contact support for more information.',
          }
        : {
            icon: 'close-circle-outline',
            bg: colors.dangerLight,
            fg: colors.danger,
            title: 'Cleaner application not approved',
            text: 'Unfortunately your application was rejected. Contact support for details.',
          };

  return (
    <View style={[styles.statusBanner, { backgroundColor: config.bg }]}>
      <Icon name={config.icon} size={22} color={config.fg} />
      <View style={styles.statusBannerText}>
        <Text style={[typography.bodyMedium, { color: config.fg }]}>{config.title}</Text>
        <Text style={styles.statusBannerBody}>{config.text}</Text>
      </View>
    </View>
  );
}

interface ProfileRowProps {
  icon: string;
  label: string;
  onPress?: () => void;
  warning?: boolean;
}

function ProfileRow({ icon, label, onPress, warning }: ProfileRowProps): React.JSX.Element {
  return (
    <Card onPress={onPress} style={styles.row}>
      <Icon name={icon} size={20} color={warning ? colors.warning : colors.ink700} />
      <Text style={[styles.rowLabel, warning && styles.rowWarning]}>{label}</Text>
      {onPress ? <Icon name="chevron-forward" size={18} color={colors.ink400} /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  name: { ...typography.titleLg, marginTop: spacing.sm },
  email: { ...typography.body, color: colors.ink500 },
  roleBadge: { alignSelf: 'center' },
  statsCard: { gap: spacing.md, marginBottom: spacing.xl },
  statusBanner: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.lg,
    alignItems: 'flex-start',
  },
  statusBannerText: { flex: 1, gap: spacing.xxs },
  statusBannerBody: {
    ...typography.caption,
    color: colors.ink700,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  experience: { ...typography.body, color: colors.ink500 },
  rows: { gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowLabel: { ...typography.bodyLg, flex: 1 },
  rowWarning: { color: colors.warning },
  logout: { marginTop: spacing.xxl, marginBottom: spacing.xl },
});

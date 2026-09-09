import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Avatar, Badge, Button, Card, Icon, Rating, Screen } from '../../components';
import { useLogout } from '../../features/auth/hooks';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, typography } from '../../theme';
import { capitalize, displayName } from '../../utils/format';

export function ProfileScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.cleanerProfile);
  const logout = useLogout();

  if (!user) {
    return <Screen scroll={false}>{null}</Screen>;
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Avatar name={displayName(user)} uri={user.profile_photo_url} size={80} />
        <Text style={styles.name}>{displayName(user)}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Badge label={capitalize(user.role)} tone="brand" />
      </View>

      {profile ? (
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
        onPress={() => logout.mutate()}
        loading={logout.isPending}
        style={styles.logout}
      />
    </Screen>
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
  statsCard: { gap: spacing.md, marginBottom: spacing.xl },
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

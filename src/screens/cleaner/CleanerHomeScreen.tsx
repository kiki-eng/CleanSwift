import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import {
  Avatar,
  Badge,
  Button,
  Card,
  Icon,
  NotificationBell,
  jobStatusTone,
} from '../../components';
import { Screen } from '../../components';
import { useCleanerDashboard } from '../../features/dashboard/hooks';
import { useAcceptJob, useMyJobs, useOpenJobs } from '../../features/jobs/hooks';
import { useAuthStore } from '../../store/authStore';
import { colors, radii, spacing, typography } from '../../theme';
import type { CleanerStatus } from '../../types/enums';
import type { Job } from '../../types/models';
import { capitalize, displayName, formatMoney, formatUnixDate } from '../../utils/format';
import { flattenPages } from '../../utils/query';

export function CleanerHomeScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.cleanerProfile);

  const status: CleanerStatus = profile?.status ?? 'PENDING';
  const isApproved = status === 'APPROVED';

  const openJobs = useOpenJobs();
  const myJobs = useMyJobs();
  const acceptJob = useAcceptJob();
  const dashboard = useCleanerDashboard();

  const openJobItems = flattenPages(openJobs.data);
  const upcoming = flattenPages(myJobs.data)
    .filter(job => job.status === 'ASSIGNED' || job.status === 'IN_PROGRESS')
    .slice(0, 2);

  const earnings = dashboard.data?.total_earnings ?? 0;

  return (
    <Screen padded={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={typography.caption}>Welcome back,</Text>
          <Text style={typography.titleLg}>{user ? displayName(user) : ''}</Text>
        </View>
        <View style={styles.headerActions}>
          <NotificationBell />
          <Avatar name={user ? displayName(user) : '?'} uri={user?.profile_photo_url} size={44} />
        </View>
      </View>

      {/* Approval status banner */}
      {!isApproved ? <StatusBanner status={status} /> : null}

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard
          icon="cash-outline"
          label="Earnings"
          value={formatMoney(earnings)}
        />
        <StatCard
          icon="checkmark-done-outline"
          label="Jobs done"
          value={String(
            (profile?.total_jobs_completed ?? 0) +
              (profile?.total_listing_requests_completed ?? 0),
          )}
        />
        <StatCard
          icon="star-outline"
          label="Rating"
          value={
            profile?.average_rating && profile.average_rating > 0
              ? profile.average_rating.toFixed(1)
              : '—'
          }
        />
      </View>

      {/* Upcoming jobs */}
      {upcoming.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Up next</Text>
          <View style={styles.jobList}>
            {upcoming.map(job => (
              <Card
                key={job.id}
                onPress={() => navigation.navigate('BookingDetails', { kind: 'job', id: job.id })}
                style={styles.jobCard}>
                <View style={styles.jobTop}>
                  <Text style={typography.title} numberOfLines={1}>
                    {job.title}
                  </Text>
                  <Badge
                    label={capitalize(job.status.replace('_', ' '))}
                    tone={jobStatusTone(job.status)}
                  />
                </View>
                <JobMetaRow job={job} />
              </Card>
            ))}
          </View>
        </>
      ) : null}

      {/* Open jobs */}
      <View style={styles.sectionHeader}>
        <Text style={typography.titleLg}>Open jobs</Text>
        <Text
          style={styles.sectionAction}
          onPress={() => navigation.navigate('CleanerTabs', { screen: 'CleanerJobs' })}>
          See all
        </Text>
      </View>

      {!isApproved ? (
        <Card style={styles.lockedCard}>
          <Icon name="lock-closed-outline" size={20} color={colors.ink400} />
          <Text style={styles.lockedText}>
            Jobs unlock once your profile is approved.
          </Text>
        </Card>
      ) : openJobs.isPending ? (
        <Text style={styles.hint}>Finding jobs near you…</Text>
      ) : openJobItems.length === 0 ? (
        <Card style={styles.lockedCard}>
          <Icon name="time-outline" size={20} color={colors.ink400} />
          <Text style={styles.lockedText}>
            No open jobs right now — check back soon.
          </Text>
        </Card>
      ) : (
        <View style={styles.jobList}>
          {openJobItems.slice(0, 4).map(job => (
            <Card key={job.id} style={styles.jobCard}>
              <View style={styles.jobTop}>
                <Text style={typography.title} numberOfLines={1}>
                  {job.title}
                </Text>
                <Text style={styles.jobBudget}>{formatMoney(job.budget, job.currency)}</Text>
              </View>
              <Text style={styles.jobDescription} numberOfLines={2}>
                {job.description}
              </Text>
              <JobMetaRow job={job} />
              {job.mode === 'FIRST_COME' ? (
                <Button
                  title="Accept Now"
                  size="sm"
                  loading={acceptJob.isPending && acceptJob.variables === job.id}
                  onPress={() => acceptJob.mutate(job.id)}
                  style={styles.jobAction}
                />
              ) : (
                <Button
                  title="View & Apply"
                  size="sm"
                  variant="secondary"
                  onPress={() => navigation.navigate('BookingDetails', { kind: 'job', id: job.id })}
                  style={styles.jobAction}
                />
              )}
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

function StatusBanner({ status }: { status: CleanerStatus }): React.JSX.Element {
  const config =
    status === 'PENDING'
      ? {
          icon: 'hourglass-outline',
          bg: colors.warningLight,
          fg: colors.warning,
          title: 'Application under review',
          text: "We're reviewing your profile. You'll be able to accept jobs once approved.",
        }
      : status === 'SUSPENDED'
        ? {
            icon: 'pause-circle-outline',
            bg: colors.dangerLight,
            fg: colors.danger,
            title: 'Account suspended',
            text: 'Contact support for more information.',
          }
        : {
            icon: 'close-circle-outline',
            bg: colors.dangerLight,
            fg: colors.danger,
            title: 'Application not approved',
            text: 'Unfortunately your application was rejected. Contact support for details.',
          };

  return (
    <View style={[styles.banner, { backgroundColor: config.bg }]}>
      <Icon name={config.icon} size={22} color={config.fg} />
      <View style={styles.bannerText}>
        <Text style={[typography.bodyMedium, { color: config.fg }]}>{config.title}</Text>
        <Text style={styles.bannerBody}>{config.text}</Text>
      </View>
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <View style={styles.statCard}>
      <Icon name={icon} size={18} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={typography.caption}>{label}</Text>
    </View>
  );
}

function JobMetaRow({ job }: { job: Job }): React.JSX.Element {
  return (
    <View style={styles.metaRow}>
      <View style={styles.metaItem}>
        <Icon name="calendar-outline" size={14} color={colors.ink500} />
        <Text style={typography.caption}>{formatUnixDate(job.scheduled_date)}</Text>
      </View>
      <View style={styles.metaItem}>
        <Icon name="location-outline" size={14} color={colors.ink500} />
        <Text style={typography.caption} numberOfLines={1}>
          {job.address}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerText: { gap: spacing.xxs },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  banner: {
    flexDirection: 'row',
    gap: spacing.md,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.lg,
    alignItems: 'flex-start',
  },
  bannerText: { flex: 1, gap: spacing.xxs },
  bannerBody: {
    ...typography.caption,
    color: colors.ink700,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.ink100,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  statValue: { ...typography.title },
  sectionTitle: {
    ...typography.titleLg,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xxxl,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xxxl,
    marginBottom: spacing.lg,
  },
  sectionAction: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
  hint: {
    ...typography.body,
    color: colors.ink500,
    paddingHorizontal: spacing.xl,
  },
  jobList: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  jobCard: { gap: spacing.sm },
  jobTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  jobBudget: {
    ...typography.bodyMedium,
    color: colors.primaryDark,
  },
  jobDescription: {
    ...typography.body,
    color: colors.ink500,
  },
  metaRow: { gap: spacing.xs },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  jobAction: { alignSelf: 'flex-start', marginTop: spacing.xs },
  lockedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.xl,
  },
  lockedText: {
    ...typography.body,
    color: colors.ink500,
    flex: 1,
  },
});

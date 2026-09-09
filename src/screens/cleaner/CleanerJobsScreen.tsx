import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Icon,
  LoadingState,
  Screen,
  SegmentedControl,
  jobStatusTone,
  requestStatusTone,
} from '../../components';
import { useMyJobs, useOpenJobs } from '../../features/jobs/hooks';
import { useCleanerRequests } from '../../features/requests/hooks';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, typography } from '../../theme';
import type { Job, ListingRequest } from '../../types/models';
import { capitalize, formatIsoDate, formatMoney, formatUnixDate } from '../../utils/format';
import { flattenPages } from '../../utils/query';

type Segment = 'open' | 'mine' | 'requests';

const SEGMENTS = [
  { value: 'open', label: 'Open jobs' },
  { value: 'mine', label: 'My jobs' },
  { value: 'requests', label: 'Requests' },
] as const;

export function CleanerJobsScreen(): React.JSX.Element {
  const [segment, setSegment] = useState<Segment>('open');
  const profile = useAuthStore(state => state.cleanerProfile);
  const isApproved = profile?.status === 'APPROVED';

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.header}>
        <Text style={typography.display}>Jobs</Text>
        <SegmentedControl options={SEGMENTS} value={segment} onChange={setSegment} />
      </View>

      {!isApproved ? (
        <EmptyState
          icon="lock-closed-outline"
          title="Awaiting approval"
          message="Jobs unlock once your cleaner profile is approved by our team."
        />
      ) : segment === 'open' ? (
        <OpenJobsList />
      ) : segment === 'mine' ? (
        <MyJobsList />
      ) : (
        <RequestsList />
      )}
    </Screen>
  );
}

function JobRow({ job, showStatus }: { job: Job; showStatus?: boolean }): React.JSX.Element {
  const navigation = useNavigation();
  return (
    <Card
      onPress={() => navigation.navigate('BookingDetails', { kind: 'job', id: job.id })}
      style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={typography.title} numberOfLines={1}>
          {job.title}
        </Text>
        {showStatus ? (
          <Badge
            label={capitalize(job.status.replace('_', ' '))}
            tone={jobStatusTone(job.status)}
          />
        ) : (
          <Text style={styles.price}>{formatMoney(job.budget, job.currency)}</Text>
        )}
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {job.description}
      </Text>
      <View style={styles.metaRow}>
        <Icon name="calendar-outline" size={14} color={colors.ink500} />
        <Text style={typography.caption}>{formatUnixDate(job.scheduled_date)}</Text>
      </View>
      <View style={styles.metaRow}>
        <Icon name="location-outline" size={14} color={colors.ink500} />
        <Text style={typography.caption} numberOfLines={1}>
          {job.address}
        </Text>
      </View>
      {!showStatus ? (
        <Badge
          label={job.mode === 'FIRST_COME' ? 'First come' : 'Apply to win'}
          tone={job.mode === 'FIRST_COME' ? 'success' : 'info'}
        />
      ) : null}
    </Card>
  );
}

function OpenJobsList(): React.JSX.Element {
  const jobs = useOpenJobs();
  const items = flattenPages(jobs.data);

  if (jobs.isPending) {
    return <LoadingState label="Finding jobs near you…" />;
  }
  if (jobs.isError) {
    return <ErrorState message={jobs.error.message} onRetry={() => jobs.refetch()} />;
  }
  if (items.length === 0) {
    return (
      <EmptyState
        icon="time-outline"
        title="No open jobs"
        message="No open jobs right now — check back soon."
      />
    );
  }
  return (
    <FlatList
      data={items}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <JobRow job={item} />}
      contentContainerStyle={styles.list}
      onEndReached={() => {
        if (jobs.hasNextPage && !jobs.isFetchingNextPage) {
          jobs.fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.4}
      refreshing={jobs.isRefetching && !jobs.isFetchingNextPage}
      onRefresh={() => jobs.refetch()}
    />
  );
}

function MyJobsList(): React.JSX.Element {
  const jobs = useMyJobs();
  const items = flattenPages(jobs.data);

  if (jobs.isPending) {
    return <LoadingState label="Loading your jobs…" />;
  }
  if (jobs.isError) {
    return <ErrorState message={jobs.error.message} onRetry={() => jobs.refetch()} />;
  }
  if (items.length === 0) {
    return (
      <EmptyState
        icon="briefcase-outline"
        title="No jobs yet"
        message="Jobs you accept or win will show up here."
      />
    );
  }
  return (
    <FlatList
      data={items}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <JobRow job={item} showStatus />}
      contentContainerStyle={styles.list}
      onEndReached={() => {
        if (jobs.hasNextPage && !jobs.isFetchingNextPage) {
          jobs.fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.4}
      refreshing={jobs.isRefetching && !jobs.isFetchingNextPage}
      onRefresh={() => jobs.refetch()}
    />
  );
}

function RequestsList(): React.JSX.Element {
  const requests = useCleanerRequests();
  const items = flattenPages(requests.data);

  if (requests.isPending) {
    return <LoadingState label="Loading requests…" />;
  }
  if (requests.isError) {
    return <ErrorState message={requests.error.message} onRetry={() => requests.refetch()} />;
  }
  if (items.length === 0) {
    return (
      <EmptyState
        icon="mail-open-outline"
        title="No booking requests"
        message="When customers book you from your listings, requests appear here."
      />
    );
  }
  return (
    <FlatList
      data={items}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <RequestRow request={item} />}
      contentContainerStyle={styles.list}
      onEndReached={() => {
        if (requests.hasNextPage && !requests.isFetchingNextPage) {
          requests.fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.4}
      refreshing={requests.isRefetching && !requests.isFetchingNextPage}
      onRefresh={() => requests.refetch()}
    />
  );
}

function RequestRow({ request }: { request: ListingRequest }): React.JSX.Element {
  const navigation = useNavigation();
  return (
    <Card
      onPress={() =>
        navigation.navigate('BookingDetails', { kind: 'listing-request', id: request.id })
      }
      style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={typography.title} numberOfLines={1}>
          {request.listing?.title ?? 'Booking request'}
        </Text>
        <Badge label={capitalize(request.status)} tone={requestStatusTone(request.status)} />
      </View>
      <View style={styles.metaRow}>
        <Icon name="calendar-outline" size={14} color={colors.ink500} />
        <Text style={typography.caption}>{formatIsoDate(request.requested_date)}</Text>
      </View>
      <View style={styles.metaRow}>
        <Icon name="location-outline" size={14} color={colors.ink500} />
        <Text style={typography.caption} numberOfLines={1}>
          {request.address}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.lg,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.huge,
    gap: spacing.md,
  },
  card: { gap: spacing.sm },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  price: { ...typography.bodyMedium, color: colors.primaryDark },
  description: { ...typography.body, color: colors.ink500 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});

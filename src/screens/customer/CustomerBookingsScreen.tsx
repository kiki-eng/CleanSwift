import React, { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { useMyListingRequests, useMyPostings } from '../../features/bookings/hooks';
import { colors, radii, spacing, typography } from '../../theme';
import type { JobStatus, ListingRequestStatus } from '../../types/enums';
import type { Job, ListingRequest } from '../../types/models';
import { capitalize, formatIsoDate, formatMoney, formatUnixDate } from '../../utils/format';
import { flattenPages } from '../../utils/query';

type Segment = 'jobs' | 'requests';

const SEGMENTS = [
  { value: 'jobs', label: 'Job posts' },
  { value: 'requests', label: 'Direct bookings' },
] as const;

const JOB_STATUSES: JobStatus[] = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const REQUEST_STATUSES: ListingRequestStatus[] = [
  'PENDING',
  'ACCEPTED',
  'STARTED',
  'COMPLETED',
  'REJECTED',
  'CANCELLED',
];

export function CustomerBookingsScreen(): React.JSX.Element {
  const [segment, setSegment] = useState<Segment>('jobs');
  const [jobStatus, setJobStatus] = useState<JobStatus | undefined>(undefined);
  const [requestStatus, setRequestStatus] = useState<ListingRequestStatus | undefined>(undefined);

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.header}>
        <Text style={typography.display}>Bookings</Text>
        <SegmentedControl options={SEGMENTS} value={segment} onChange={setSegment} />
        <StatusFilter
          options={segment === 'jobs' ? JOB_STATUSES : REQUEST_STATUSES}
          value={segment === 'jobs' ? jobStatus : requestStatus}
          onChange={value => {
            if (segment === 'jobs') {
              setJobStatus(value as JobStatus | undefined);
            } else {
              setRequestStatus(value as ListingRequestStatus | undefined);
            }
          }}
        />
      </View>
      {segment === 'jobs' ? (
        <JobsList status={jobStatus} />
      ) : (
        <RequestsList status={requestStatus} />
      )}
    </Screen>
  );
}

interface StatusFilterProps {
  options: string[];
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

function StatusFilter({ options, value, onChange }: StatusFilterProps): React.JSX.Element {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.filterRow}>
        <FilterChip label="All" selected={!value} onPress={() => onChange(undefined)} />
        {options.map(option => (
          <FilterChip
            key={option}
            label={capitalize(option.replace('_', ' '))}
            selected={value === option}
            onPress={() => onChange(option)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.filterChip, selected && styles.filterChipSelected]}>
      <Text style={[styles.filterLabel, selected && styles.filterLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

function JobsList({ status }: { status?: JobStatus }): React.JSX.Element {
  const navigation = useNavigation();
  const postings = useMyPostings(status);
  const items = flattenPages(postings.data);

  if (postings.isPending) {
    return <LoadingState label="Loading bookings…" />;
  }
  if (postings.isError) {
    return <ErrorState message={postings.error.message} onRetry={() => postings.refetch()} />;
  }
  if (items.length === 0) {
    return (
      <EmptyState
        icon="calendar-outline"
        title="No job posts yet"
        message="Post a cleaning request and it will show up here."
        actionTitle="Book a Cleaning"
        onAction={() => navigation.navigate('CreateRequest')}
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
        if (postings.hasNextPage && !postings.isFetchingNextPage) {
          postings.fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.4}
      refreshing={postings.isRefetching && !postings.isFetchingNextPage}
      onRefresh={() => postings.refetch()}
    />
  );
}

function JobRow({ job }: { job: Job }): React.JSX.Element {
  const navigation = useNavigation();
  return (
    <Card
      onPress={() => navigation.navigate('BookingDetails', { kind: 'job', id: job.id })}
      style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={typography.title} numberOfLines={1}>
          {job.title}
        </Text>
        <Badge label={capitalize(job.status.replace('_', ' '))} tone={jobStatusTone(job.status)} />
      </View>
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
      <Text style={styles.price}>{formatMoney(job.budget, job.currency)}</Text>
    </Card>
  );
}

function RequestsList({ status }: { status?: ListingRequestStatus }): React.JSX.Element {
  const navigation = useNavigation();
  const requests = useMyListingRequests(status);
  const items = flattenPages(requests.data);

  if (requests.isPending) {
    return <LoadingState label="Loading bookings…" />;
  }
  if (requests.isError) {
    return <ErrorState message={requests.error.message} onRetry={() => requests.refetch()} />;
  }
  if (items.length === 0) {
    return (
      <EmptyState
        icon="sparkles-outline"
        title="No direct bookings yet"
        message="Book a cleaner from their listing and it will show up here."
        actionTitle="Find Cleaners"
        onAction={() => navigation.navigate('CustomerTabs', { screen: 'CleanerSearch' })}
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
          {request.listing?.title ?? 'Cleaning service'}
        </Text>
        <Badge
          label={capitalize(request.status)}
          tone={requestStatusTone(request.status)}
        />
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
      {request.listing ? (
        <Text style={styles.price}>{formatMoney(request.listing.price)}</Text>
      ) : null}
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
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterChip: {
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.ink200,
    backgroundColor: colors.ink50,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 2,
  },
  filterChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  filterLabel: { ...typography.bodyMedium, color: colors.ink500 },
  filterLabelSelected: { color: colors.primaryDark },
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  price: {
    ...typography.bodyMedium,
    color: colors.primaryDark,
  },
});

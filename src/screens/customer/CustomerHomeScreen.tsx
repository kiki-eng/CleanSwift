import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import {
  Avatar,
  Badge,
  Button,
  Card,
  Icon,
  NotificationBell,
  Rating,
  jobStatusTone,
} from '../../components';
import { Screen } from '../../components';
import { useMyPostings } from '../../features/bookings/hooks';
import { useActiveListings } from '../../features/cleaners/hooks';
import { useAuthStore } from '../../store/authStore';
import { colors, radii, shadows, spacing, typography } from '../../theme';
import type { CleanerListing } from '../../types/models';
import { capitalize, displayName, formatMoney, formatUnixDate } from '../../utils/format';
import { flattenPages } from '../../utils/query';

export function CustomerHomeScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const user = useAuthStore(state => state.user);

  const listings = useActiveListings();
  const postings = useMyPostings();

  const listingItems = flattenPages(listings.data).slice(0, 10);
  const upcoming = flattenPages(postings.data)
    .filter(job => job.status === 'OPEN' || job.status === 'ASSIGNED' || job.status === 'IN_PROGRESS')
    .slice(0, 3);

  return (
    <Screen padded={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={typography.caption}>Good {timeOfDay()},</Text>
          <Text style={typography.titleLg}>{user ? displayName(user) : 'there'} 👋</Text>
        </View>
        <View style={styles.headerActions}>
          <NotificationBell />
          <Avatar name={user ? displayName(user) : '?'} uri={user?.profile_photo_url} size={44} />
        </View>
      </View>

      {/* Hero booking card */}
      <View style={styles.section}>
        <View style={styles.hero}>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Need a sparkling clean home?</Text>
            <Text style={styles.heroSubtitle}>
              Post a request and let vetted cleaners come to you.
            </Text>
            <Button
              title="Book a Cleaning"
              size="md"
              onPress={() => navigation.navigate('CreateRequest')}
              style={styles.heroButton}
            />
          </View>
          <View style={styles.heroIcon}>
            <Icon name="sparkles" size={40} color={colors.white} />
          </View>
        </View>
      </View>

      {/* Available cleaners */}
      <SectionHeader
        title="Available cleaners"
        actionLabel="See all"
        onAction={() => navigation.navigate('CustomerTabs', { screen: 'CleanerSearch' })}
      />
      {listings.isPending ? (
        <Text style={styles.sectionHint}>Loading cleaners…</Text>
      ) : listingItems.length > 0 ? (
        <FlatList
          horizontal
          data={listingItems}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ListingCard listing={item} />}
          contentContainerStyle={styles.listingRow}
          showsHorizontalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.sectionHint}>
          No cleaners are listed yet — post a request instead and they'll come to you.
        </Text>
      )}

      {/* Upcoming bookings */}
      <SectionHeader
        title="Your upcoming bookings"
        actionLabel="View all"
        onAction={() => navigation.navigate('CustomerTabs', { screen: 'CustomerBookings' })}
      />
      <View style={styles.bookings}>
        {postings.isPending ? (
          <Text style={styles.sectionHint}>Loading bookings…</Text>
        ) : upcoming.length === 0 ? (
          <Card style={styles.emptyBookings}>
            <Icon name="calendar-outline" size={22} color={colors.ink400} />
            <Text style={styles.emptyBookingsText}>
              Nothing scheduled. Book your first cleaning today!
            </Text>
          </Card>
        ) : (
          upcoming.map(job => (
            <Card
              key={job.id}
              onPress={() => navigation.navigate('BookingDetails', { kind: 'job', id: job.id })}
              style={styles.bookingCard}>
              <View style={styles.bookingTop}>
                <Text style={typography.title} numberOfLines={1}>
                  {job.title}
                </Text>
                <Badge label={capitalize(job.status.replace('_', ' '))} tone={jobStatusTone(job.status)} />
              </View>
              <View style={styles.bookingMeta}>
                <Icon name="calendar-outline" size={14} color={colors.ink500} />
                <Text style={typography.caption}>{formatUnixDate(job.scheduled_date)}</Text>
              </View>
              <Text style={styles.bookingPrice}>{formatMoney(job.budget, job.currency)}</Text>
            </Card>
          ))
        )}
      </View>
    </Screen>
  );
}

function timeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'morning';
  }
  if (hour < 17) {
    return 'afternoon';
  }
  return 'evening';
}

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps): React.JSX.Element {
  return (
    <View style={styles.sectionHeader}>
      <Text style={typography.titleLg}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function ListingCard({ listing }: { listing: CleanerListing }): React.JSX.Element {
  const navigation = useNavigation();
  const cleanerName =
    listing.cleaner?.company_name ?? (displayName(listing.cleaner?.user) || 'Cleaner');

  return (
    <Pressable
      onPress={() => navigation.navigate('CleanerDetails', { listingId: listing.id })}
      style={({ pressed }) => [styles.listingCard, pressed && styles.listingPressed]}>
      <View style={styles.listingAvatarRow}>
        <Avatar name={cleanerName} uri={listing.cleaner?.user?.profile_photo_url} size={40} />
        {listing.cleaner?.background_checked ? (
          <Icon name="shield-checkmark" size={16} color={colors.success} />
        ) : null}
      </View>
      <Text style={typography.bodyMedium} numberOfLines={1}>
        {cleanerName}
      </Text>
      <Text style={styles.listingTitle} numberOfLines={2}>
        {listing.title}
      </Text>
      <Rating
        value={listing.cleaner?.average_rating ?? 0}
        reviewCount={listing.cleaner?.total_reviews ?? 0}
      />
      <Text style={styles.listingPrice}>{formatMoney(listing.price)}</Text>
    </Pressable>
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
  section: { paddingHorizontal: spacing.xl },
  hero: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: radii.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    ...shadows.raised,
  },
  heroText: { flex: 1, gap: spacing.sm },
  heroTitle: {
    ...typography.titleLg,
    color: colors.white,
  },
  heroSubtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.85)',
  },
  heroButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    marginTop: spacing.sm,
  },
  heroIcon: { marginLeft: spacing.md },
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
  sectionHint: {
    ...typography.body,
    color: colors.ink500,
    paddingHorizontal: spacing.xl,
  },
  listingRow: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  listingCard: {
    width: 168,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.ink100,
    padding: spacing.lg,
    gap: spacing.xs,
    ...shadows.card,
  },
  listingPressed: { opacity: 0.9 },
  listingAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  listingTitle: {
    ...typography.caption,
    color: colors.ink500,
  },
  listingPrice: {
    ...typography.bodyMedium,
    color: colors.primaryDark,
    marginTop: spacing.xs,
  },
  bookings: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.huge,
  },
  emptyBookings: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyBookingsText: {
    ...typography.body,
    color: colors.ink500,
    flex: 1,
  },
  bookingCard: { gap: spacing.sm },
  bookingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  bookingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  bookingPrice: {
    ...typography.bodyMedium,
    color: colors.primaryDark,
  },
});

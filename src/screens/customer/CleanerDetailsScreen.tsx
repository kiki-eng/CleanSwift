import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import {
  Avatar,
  Badge,
  BottomSheet,
  Button,
  Card,
  ErrorState,
  Input,
  LoadingState,
  Rating,
  ScheduleSheet,
  Screen,
} from '../../components';
import { useListing } from '../../features/cleaners/hooks';
import { useCreateListingRequest } from '../../features/requests/hooks';
import { useCleanerReviews } from '../../features/reviews/hooks';
import { colors, radii, spacing, typography } from '../../theme';
import type { CleanerListing, Review } from '../../types/models';
import { displayName, formatMoney, formatUnixDate } from '../../utils/format';
import { flattenPages } from '../../utils/query';

type Route = RouteProp<{ CleanerDetails: { listingId: string } }, 'CleanerDetails'>;

export function CleanerDetailsScreen(): React.JSX.Element {
  const { params } = useRoute<Route>();
  const listing = useListing(params.listingId);

  if (listing.isPending) {
    return (
      <Screen scroll={false}>
        <LoadingState label="Loading profile…" />
      </Screen>
    );
  }
  if (listing.isError) {
    return (
      <Screen scroll={false}>
        <ErrorState message={listing.error.message} onRetry={() => listing.refetch()} />
      </Screen>
    );
  }
  return <ListingDetails listing={listing.data} />;
}

function ListingDetails({ listing }: { listing: CleanerListing }): React.JSX.Element {
  const cleaner = listing.cleaner;
  const cleanerName = cleaner?.company_name ?? (displayName(cleaner?.user ?? null) || 'Cleaner');
  const reviews = useCleanerReviews(cleaner?.user_id ?? '', Boolean(cleaner?.user_id));
  const reviewItems = flattenPages(reviews.data);
  const [showBooking, setShowBooking] = useState(false);

  return (
    <Screen padded={false}>
      {/* Cleaner header */}
      <View style={styles.profileHeader}>
        <Avatar name={cleanerName} uri={cleaner?.user?.profile_photo_url} size={72} />
        <Text style={styles.profileName}>{cleanerName}</Text>
        <View style={styles.badgeRow}>
          <Rating
            value={cleaner?.average_rating ?? 0}
            reviewCount={cleaner?.total_reviews ?? 0}
          />
          {cleaner?.background_checked ? (
            <Badge label="Background checked" tone="success" />
          ) : null}
        </View>
        <Text style={typography.caption}>
          {(cleaner?.total_jobs_completed ?? 0) +
            (cleaner?.total_listing_requests_completed ?? 0)}{' '}
          jobs completed
        </Text>
      </View>

      {/* Listing card */}
      <View style={styles.section}>
        <Card style={styles.listingCard}>
          <View style={styles.listingTop}>
            <Text style={typography.title}>{listing.title}</Text>
            <Text style={styles.price}>{formatMoney(listing.price)}</Text>
          </View>
          <Text style={styles.description}>{listing.description}</Text>
        </Card>
      </View>

      {/* Experience & specialties */}
      {cleaner?.cleaning_experience ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{cleaner.cleaning_experience}</Text>
        </View>
      ) : null}
      {cleaner?.specialties && cleaner.specialties.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specialties</Text>
          <View style={styles.chipWrap}>
            {cleaner.specialties.map(item => (
              <Badge key={item} label={item} tone="brand" />
            ))}
          </View>
        </View>
      ) : null}
      {cleaner?.service_areas && cleaner.service_areas.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service areas</Text>
          <View style={styles.chipWrap}>
            {cleaner.service_areas.map(item => (
              <Badge key={item} label={item} />
            ))}
          </View>
        </View>
      ) : null}

      {/* Reviews */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        {reviews.isPending ? (
          <Text style={styles.hint}>Loading reviews…</Text>
        ) : reviewItems.length === 0 ? (
          <Text style={styles.hint}>No reviews yet.</Text>
        ) : (
          <View style={styles.reviewList}>
            {reviewItems.map(review => (
              <ReviewRow key={review.id} review={review} />
            ))}
            {reviews.hasNextPage ? (
              <Button
                title="Show more reviews"
                variant="ghost"
                size="sm"
                loading={reviews.isFetchingNextPage}
                onPress={() => reviews.fetchNextPage()}
              />
            ) : null}
          </View>
        )}
      </View>

      {/* Book CTA */}
      <View style={styles.footer}>
        <Button title="Book This Cleaner" onPress={() => setShowBooking(true)} />
      </View>

      <BookingSheet
        listing={listing}
        visible={showBooking}
        onClose={() => setShowBooking(false)}
      />
    </Screen>
  );
}

function ReviewRow({ review }: { review: Review }): React.JSX.Element {
  return (
    <View style={styles.review}>
      <View style={styles.reviewTop}>
        <Avatar
          name={displayName(review.customer ?? null) || 'Customer'}
          uri={review.customer?.profile_photo_url}
          size={32}
        />
        <View style={styles.reviewMeta}>
          <Text style={typography.bodyMedium}>
            {displayName(review.customer ?? null) || 'Customer'}
          </Text>
          <Text style={typography.caption}>{formatUnixDate(review.created_at)}</Text>
        </View>
        <Rating value={review.rating} />
      </View>
      {review.comment ? <Text style={styles.reviewComment}>{review.comment}</Text> : null}
    </View>
  );
}

interface BookingSheetProps {
  listing: CleanerListing;
  visible: boolean;
  onClose: () => void;
}

function BookingSheet({ listing, visible, onClose }: BookingSheetProps): React.JSX.Element {
  const navigation = useNavigation();
  const createRequest = useCreateListingRequest();

  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [requestedAt, setRequestedAt] = useState<Date | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const addressError = address.trim().length < 5 ? 'Enter the full address' : undefined;
  const dateError = !requestedAt ? 'Pick a date and time' : undefined;

  const handleSubmit = (): void => {
    setSubmitted(true);
    if (addressError || dateError || !requestedAt || createRequest.isPending) {
      return;
    }
    createRequest.mutate(
      {
        listing_id: listing.id,
        address: address.trim(),
        requested_date: requestedAt.toISOString(),
        ...(notes.trim() ? { additional_notes: notes.trim() } : {}),
      },
      {
        onSuccess: request => {
          onClose();
          navigation.navigate('BookingDetails', { kind: 'listing-request', id: request.id });
        },
      },
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Book this cleaner">
      <Text style={styles.sheetPrice}>
        {listing.title} · {formatMoney(listing.price)}
      </Text>

      <Input
        label="Address"
        icon="location-outline"
        value={address}
        onChangeText={setAddress}
        placeholder="Where should they clean?"
        error={submitted ? addressError : undefined}
      />

      <Text style={styles.fieldLabel}>Date & time</Text>
      <Button
        title={requestedAt ? formatUnixDate(requestedAt.getTime() / 1000) : 'Pick a date and time'}
        variant="secondary"
        onPress={() => setShowSchedule(true)}
        style={styles.dateButton}
      />
      {submitted && dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}

      <Input
        label="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
        placeholder="Anything the cleaner should know?"
        multiline
      />

      {createRequest.isError ? (
        <Text style={styles.errorText}>{createRequest.error.message}</Text>
      ) : null}

      <Button
        title="Send Booking Request"
        onPress={handleSubmit}
        loading={createRequest.isPending}
      />

      <ScheduleSheet
        visible={showSchedule}
        onClose={() => setShowSchedule(false)}
        onConfirm={setRequestedAt}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  profileName: { ...typography.titleLg, marginTop: spacing.xs },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.title,
    marginBottom: spacing.md,
  },
  listingCard: { gap: spacing.sm },
  listingTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  price: { ...typography.title, color: colors.primaryDark },
  description: { ...typography.body, color: colors.ink500 },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  hint: { ...typography.body, color: colors.ink500 },
  reviewList: { gap: spacing.lg },
  review: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  reviewMeta: { flex: 1, gap: spacing.xxs },
  reviewComment: { ...typography.body, color: colors.ink700 },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.huge,
  },
  sheetPrice: {
    ...typography.bodyMedium,
    color: colors.primaryDark,
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    ...typography.bodyMedium,
    color: colors.ink700,
    marginBottom: spacing.xs + 2,
  },
  dateButton: { marginBottom: spacing.lg },
  errorText: {
    ...typography.body,
    color: colors.danger,
    marginBottom: spacing.lg,
  },
});

import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import {
  Avatar,
  Badge,
  BottomSheet,
  Button,
  Card,
  ErrorState,
  Icon,
  Input,
  LoadingState,
  Rating,
  ReviewSheet,
  Screen,
  jobStatusTone,
  requestStatusTone,
} from '../../components';
import {
  useAcceptApplication,
  useApplyToJob,
  useJobApplications,
} from '../../features/applications/hooks';
import {
  useAcceptJob,
  useCancelJob,
  useCompleteJob,
  useJob,
  useStartJob,
} from '../../features/jobs/hooks';
import { useListingRequest, useUpdateRequestStatus } from '../../features/requests/hooks';
import { useReviewJob, useReviewListingRequest } from '../../features/reviews/hooks';
import { useAuthStore } from '../../store/authStore';
import { confirmAction } from '../../store/confirmStore';
import { colors, radii, spacing, typography } from '../../theme';
import type { Job, JobApplication, ListingRequest, User } from '../../types/models';
import {
  capitalize,
  displayName,
  formatIsoDate,
  formatMoney,
  formatUnixDate,
} from '../../utils/format';
import type { RootStackParamList } from '../../types/navigation';

type Route = RouteProp<RootStackParamList, 'BookingDetails'>;

export function BookingDetailsScreen(): React.JSX.Element {
  const { params } = useRoute<Route>();
  if (params.kind === 'job') {
    return <JobDetails id={params.id} />;
  }
  return <RequestDetails id={params.id} />;
}

// ---- Shared pieces ----------------------------------------------------------

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Icon name={icon} size={18} color={colors.ink500} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function PersonCard({ title, user }: { title: string; user: User }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Card style={styles.personCard}>
        <Avatar name={displayName(user)} uri={user.profile_photo_url} size={44} />
        <View style={styles.personMeta}>
          <Text style={typography.bodyMedium}>{displayName(user)}</Text>
          {user.location ? <Text style={typography.caption}>{user.location}</Text> : null}
        </View>
      </Card>
    </View>
  );
}

function confirm(
  title: string,
  message: string,
  onConfirm: () => void,
  destructive = true,
): void {
  confirmAction({ title, message, destructive, confirmLabel: 'Yes', cancelLabel: 'No' }).then(
    confirmed => {
      if (confirmed) {
        onConfirm();
      }
    },
  );
}

// ---- Job details ------------------------------------------------------------

function JobDetails({ id }: { id: string }): React.JSX.Element {
  const job = useJob(id);

  if (job.isPending) {
    return (
      <Screen scroll={false}>
        <LoadingState label="Loading booking…" />
      </Screen>
    );
  }
  if (job.isError) {
    return (
      <Screen scroll={false}>
        <ErrorState message={job.error.message} onRetry={() => job.refetch()} />
      </Screen>
    );
  }
  return <JobDetailsBody job={job.data} />;
}

function JobDetailsBody({ job }: { job: Job }): React.JSX.Element {
  const navigation = useNavigation();
  const user = useAuthStore(state => state.user);
  const cleanerProfile = useAuthStore(state => state.cleanerProfile);
  const isCustomer = user?.role !== 'CLEANER';
  const isMyJob = Boolean(cleanerProfile && job.assigned_cleaner_id === cleanerProfile.id);

  const cancelJob = useCancelJob();
  const acceptJob = useAcceptJob();
  const startJob = useStartJob();
  const completeJob = useCompleteJob();
  const reviewJob = useReviewJob(job.id);

  const [showApply, setShowApply] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewed, setReviewed] = useState(false);

  const actionError =
    cancelJob.error?.message ??
    acceptJob.error?.message ??
    startJob.error?.message ??
    completeJob.error?.message;

  return (
    <Screen padded={false}>
      {/* Header */}
      <View style={styles.header}>
        <Badge label={capitalize(job.status.replace('_', ' '))} tone={jobStatusTone(job.status)} />
        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.price}>{formatMoney(job.budget, job.currency)}</Text>
      </View>

      {/* Details */}
      <View style={styles.section}>
        <Card style={styles.detailsCard}>
          <DetailRow icon="calendar-outline" label="When" value={formatUnixDate(job.scheduled_date)} />
          <DetailRow icon="location-outline" label="Where" value={job.address} />
          <DetailRow icon="time-outline" label="Duration" value={`~${job.estimated_duration} hrs`} />
          <DetailRow
            icon="home-outline"
            label="Property"
            value={capitalize(job.property_type)}
          />
          <DetailRow
            icon="flag-outline"
            label="Hiring"
            value={job.mode === 'FIRST_COME' ? 'First come, first served' : 'Customer selects'}
          />
        </Card>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{job.description}</Text>
        {job.special_requirements && job.special_requirements.length > 0 ? (
          <View style={styles.chipWrap}>
            {job.special_requirements.map(item => (
              <Badge key={item} label={item} />
            ))}
          </View>
        ) : null}
      </View>

      {/* People */}
      {isCustomer && job.assigned_cleaner?.user ? (
        <PersonCard title="Your cleaner" user={job.assigned_cleaner.user} />
      ) : null}
      {!isCustomer && job.customer ? <PersonCard title="Customer" user={job.customer} /> : null}

      {/* Customer: applications for CUSTOMER_SELECTS jobs */}
      {isCustomer && job.mode === 'CUSTOMER_SELECTS' && job.status === 'OPEN' ? (
        <ApplicationsSection job={job} />
      ) : null}

      {/* Actions */}
      <View style={styles.actions}>
        {actionError ? <Text style={styles.errorText}>{actionError}</Text> : null}

        {isCustomer && (job.status === 'OPEN' || job.status === 'ASSIGNED') ? (
          <Button
            title="Cancel Booking"
            variant="danger"
            loading={cancelJob.isPending}
            onPress={() =>
              confirm('Cancel booking?', 'This cannot be undone.', () =>
                cancelJob.mutate(job.id, { onSuccess: () => navigation.goBack() }),
              )
            }
          />
        ) : null}

        {isCustomer && job.status === 'COMPLETED' && !reviewed ? (
          <Button title="Leave a Review" onPress={() => setShowReview(true)} />
        ) : null}
        {reviewed ? <Text style={styles.successText}>Thanks for your review!</Text> : null}

        {!isCustomer && job.status === 'OPEN' && job.mode === 'FIRST_COME' ? (
          <Button
            title="Accept This Job"
            loading={acceptJob.isPending}
            onPress={() => acceptJob.mutate(job.id)}
          />
        ) : null}
        {!isCustomer && job.status === 'OPEN' && job.mode === 'CUSTOMER_SELECTS' ? (
          <Button title="Apply for This Job" onPress={() => setShowApply(true)} />
        ) : null}
        {!isCustomer && isMyJob && job.status === 'ASSIGNED' ? (
          <Button
            title="Start Job"
            loading={startJob.isPending}
            onPress={() => startJob.mutate(job.id)}
          />
        ) : null}
        {!isCustomer && isMyJob && job.status === 'IN_PROGRESS' ? (
          <Button
            title="Mark as Completed"
            loading={completeJob.isPending}
            onPress={() =>
              confirm(
                'Complete job?',
                'Confirm the work is finished.',
                () => completeJob.mutate(job.id),
                false,
              )
            }
          />
        ) : null}
      </View>

      <ApplySheet job={job} visible={showApply} onClose={() => setShowApply(false)} />
      <ReviewSheet
        visible={showReview}
        onClose={() => setShowReview(false)}
        pending={reviewJob.isPending}
        errorMessage={reviewJob.error?.message}
        onSubmit={(rating, comment) =>
          reviewJob.mutate(
            { rating, comment },
            {
              onSuccess: () => {
                setShowReview(false);
                setReviewed(true);
              },
            },
          )
        }
      />
    </Screen>
  );
}

// ---- Applications (customer) --------------------------------------------------

function ApplicationsSection({ job }: { job: Job }): React.JSX.Element {
  const applications = useJobApplications(job.id);
  const acceptApplication = useAcceptApplication(job.id);
  const items = (applications.data?.items ?? []).filter(app => app.status === 'PENDING');

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Applications</Text>
      {applications.isPending ? (
        <Text style={styles.hint}>Loading applications…</Text>
      ) : applications.isError ? (
        <Text style={styles.errorText}>{applications.error.message}</Text>
      ) : items.length === 0 ? (
        <Text style={styles.hint}>No applications yet — cleaners will apply soon.</Text>
      ) : (
        <View style={styles.applicationList}>
          {acceptApplication.isError ? (
            <Text style={styles.errorText}>{acceptApplication.error.message}</Text>
          ) : null}
          {items.map(application => (
            <ApplicationRow
              key={application.id}
              application={application}
              pending={
                acceptApplication.isPending && acceptApplication.variables === application.id
              }
              onAccept={() =>
                confirm(
                  'Accept this cleaner?',
                  'They will be assigned to your job.',
                  () => acceptApplication.mutate(application.id),
                  false,
                )
              }
            />
          ))}
        </View>
      )}
    </View>
  );
}

function ApplicationRow({
  application,
  pending,
  onAccept,
}: {
  application: JobApplication;
  pending: boolean;
  onAccept: () => void;
}): React.JSX.Element {
  const cleaner = application.cleaner;
  const name = cleaner?.company_name ?? (displayName(cleaner?.user ?? null) || 'Cleaner');

  return (
    <Card style={styles.applicationCard}>
      <View style={styles.personCard}>
        <Avatar name={name} uri={cleaner?.user?.profile_photo_url} size={40} />
        <View style={styles.personMeta}>
          <Text style={typography.bodyMedium}>{name}</Text>
          <Rating value={cleaner?.average_rating ?? 0} reviewCount={cleaner?.total_reviews ?? 0} />
        </View>
        {application.proposed_price ? (
          <Text style={styles.proposedPrice}>{formatMoney(application.proposed_price)}</Text>
        ) : null}
      </View>
      {application.cover_letter ? (
        <Text style={styles.coverLetter}>{application.cover_letter}</Text>
      ) : null}
      <Button title="Accept" size="sm" loading={pending} onPress={onAccept} />
    </Card>
  );
}

// ---- Apply sheet (cleaner) ----------------------------------------------------

function ApplySheet({
  job,
  visible,
  onClose,
}: {
  job: Job;
  visible: boolean;
  onClose: () => void;
}): React.JSX.Element {
  const applyToJob = useApplyToJob();
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [sent, setSent] = useState(false);

  const priceValue = Number(proposedPrice.replace(/[^0-9.]/g, ''));

  const handleSubmit = (): void => {
    if (applyToJob.isPending) {
      return;
    }
    applyToJob.mutate(
      {
        jobId: job.id,
        ...(coverLetter.trim() ? { cover_letter: coverLetter.trim() } : {}),
        ...(priceValue > 0 ? { proposed_price: priceValue } : {}),
      },
      { onSuccess: () => setSent(true) },
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Apply for this job">
      {sent ? (
        <View style={styles.sentBlock}>
          <Icon name="checkmark-circle" size={48} color={colors.success} />
          <Text style={styles.sentTitle}>Application sent!</Text>
          <Text style={styles.hint}>The customer will review your application.</Text>
          <Button title="Done" onPress={onClose} style={styles.sentButton} />
        </View>
      ) : (
        <>
          <Input
            label="Cover letter (optional)"
            value={coverLetter}
            onChangeText={setCoverLetter}
            placeholder="Why are you a great fit?"
            multiline
            style={styles.multiline}
          />
          <Input
            label={`Your price (optional, budget is ${formatMoney(job.budget, job.currency)})`}
            icon="cash-outline"
            value={proposedPrice}
            onChangeText={setProposedPrice}
            placeholder="Leave empty to accept the budget"
            keyboardType="numeric"
          />
          {applyToJob.isError ? (
            <Text style={styles.errorText}>{applyToJob.error.message}</Text>
          ) : null}
          <Button title="Send Application" loading={applyToJob.isPending} onPress={handleSubmit} />
        </>
      )}
    </BottomSheet>
  );
}

// ---- Listing request details --------------------------------------------------

function RequestDetails({ id }: { id: string }): React.JSX.Element {
  const request = useListingRequest(id);

  if (request.isPending) {
    return (
      <Screen scroll={false}>
        <LoadingState label="Loading booking…" />
      </Screen>
    );
  }
  if (request.isError) {
    return (
      <Screen scroll={false}>
        <ErrorState message={request.error.message} onRetry={() => request.refetch()} />
      </Screen>
    );
  }
  return <RequestDetailsBody request={request.data} />;
}

function RequestDetailsBody({ request }: { request: ListingRequest }): React.JSX.Element {
  const navigation = useNavigation();
  const user = useAuthStore(state => state.user);
  const isCustomer = user?.role !== 'CLEANER';

  const updateStatus = useUpdateRequestStatus();
  const reviewRequest = useReviewListingRequest(request.id);
  const [showReview, setShowReview] = useState(false);
  const [reviewed, setReviewed] = useState(false);

  const setStatus = (status: Parameters<typeof updateStatus.mutate>[0]['status']): void =>
    updateStatus.mutate({ id: request.id, status });

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Badge label={capitalize(request.status)} tone={requestStatusTone(request.status)} />
        <Text style={styles.title}>{request.listing?.title ?? 'Cleaning service'}</Text>
        {request.listing ? (
          <Text style={styles.price}>{formatMoney(request.listing.price)}</Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <Card style={styles.detailsCard}>
          <DetailRow
            icon="calendar-outline"
            label="When"
            value={formatIsoDate(request.requested_date)}
          />
          <DetailRow icon="location-outline" label="Where" value={request.address} />
        </Card>
      </View>

      {request.additional_notes ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.description}>{request.additional_notes}</Text>
        </View>
      ) : null}

      {request.image_url ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photo</Text>
          <Image source={{ uri: request.image_url }} style={styles.requestImage} />
        </View>
      ) : null}

      {!isCustomer && request.customer ? (
        <PersonCard title="Customer" user={request.customer} />
      ) : null}

      <View style={styles.actions}>
        {updateStatus.isError ? (
          <Text style={styles.errorText}>{updateStatus.error.message}</Text>
        ) : null}

        {isCustomer && request.status === 'PENDING' ? (
          <Button
            title="Cancel Request"
            variant="danger"
            loading={updateStatus.isPending}
            onPress={() =>
              confirm('Cancel request?', 'This cannot be undone.', () =>
                updateStatus.mutate(
                  { id: request.id, status: 'CANCELLED' },
                  { onSuccess: () => navigation.goBack() },
                ),
              )
            }
          />
        ) : null}

        {isCustomer && request.status === 'COMPLETED' && !reviewed ? (
          <Button title="Leave a Review" onPress={() => setShowReview(true)} />
        ) : null}
        {reviewed ? <Text style={styles.successText}>Thanks for your review!</Text> : null}

        {!isCustomer && request.status === 'PENDING' ? (
          <>
            <Button
              title="Accept Request"
              loading={updateStatus.isPending && updateStatus.variables?.status === 'ACCEPTED'}
              onPress={() => setStatus('ACCEPTED')}
            />
            <Button
              title="Reject"
              variant="danger"
              loading={updateStatus.isPending && updateStatus.variables?.status === 'REJECTED'}
              onPress={() =>
                confirm('Reject request?', 'The customer will be notified.', () =>
                  setStatus('REJECTED'),
                )
              }
            />
          </>
        ) : null}
        {!isCustomer && request.status === 'ACCEPTED' ? (
          <Button
            title="Start Job"
            loading={updateStatus.isPending}
            onPress={() => setStatus('STARTED')}
          />
        ) : null}
        {!isCustomer && request.status === 'STARTED' ? (
          <Button
            title="Mark as Completed"
            loading={updateStatus.isPending}
            onPress={() =>
              confirm(
                'Complete job?',
                'Confirm the work is finished.',
                () => setStatus('COMPLETED'),
                false,
              )
            }
          />
        ) : null}
      </View>

      <ReviewSheet
        visible={showReview}
        onClose={() => setShowReview(false)}
        pending={reviewRequest.isPending}
        errorMessage={reviewRequest.error?.message}
        onSubmit={(rating, comment) =>
          reviewRequest.mutate(
            { rating, comment },
            {
              onSuccess: () => {
                setShowReview(false);
                setReviewed(true);
              },
            },
          )
        }
      />
    </Screen>
  );
}

// ---- Styles -------------------------------------------------------------------

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  title: { ...typography.display },
  price: { ...typography.titleLg, color: colors.primaryDark },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.title,
    marginBottom: spacing.md,
  },
  detailsCard: { gap: spacing.lg },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  detailLabel: {
    ...typography.body,
    color: colors.ink500,
    width: 72,
  },
  detailValue: { ...typography.bodyMedium, flex: 1 },
  description: { ...typography.body, color: colors.ink700 },
  requestImage: {
    width: '100%',
    height: 180,
    borderRadius: radii.lg,
    backgroundColor: colors.ink100,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  personMeta: { flex: 1, gap: spacing.xxs },
  applicationList: { gap: spacing.md },
  applicationCard: { gap: spacing.md },
  proposedPrice: { ...typography.bodyMedium, color: colors.primaryDark },
  coverLetter: { ...typography.body, color: colors.ink700 },
  actions: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.huge,
    gap: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
  },
  successText: {
    ...typography.bodyMedium,
    color: colors.success,
    textAlign: 'center',
  },
  hint: { ...typography.body, color: colors.ink500 },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
  sentBlock: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  sentTitle: { ...typography.titleLg },
  sentButton: { alignSelf: 'stretch', marginTop: spacing.lg },
});

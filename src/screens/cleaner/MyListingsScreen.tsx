import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Badge,
  BottomSheet,
  Button,
  Card,
  ChipGroup,
  EmptyState,
  ErrorState,
  Icon,
  Input,
  LoadingState,
  Screen,
} from '../../components';
import { env } from '../../config/env';
import {
  useCreateListing,
  useDeleteListing,
  useMyCleanerProfile,
  useUpdateListing,
} from '../../features/listings/hooks';
import { useImageUpload } from '../../features/upload/hooks';
import { confirmAction } from '../../store/confirmStore';
import { colors, radii, spacing, typography } from '../../theme';
import type { ListingStatus } from '../../types/enums';
import type { CleanerListing } from '../../types/models';
import { capitalize, formatMoney } from '../../utils/format';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'INACTIVE', label: 'Inactive' },
] as const;

export function MyListingsScreen(): React.JSX.Element {
  const profile = useMyCleanerProfile();
  const deleteListing = useDeleteListing();
  const [editorTarget, setEditorTarget] = useState<CleanerListing | 'new' | null>(null);

  const isApproved = profile.data?.status === 'APPROVED';
  const listings = profile.data?.listings ?? [];

  const handleDelete = async (listing: CleanerListing): Promise<void> => {
    const confirmed = await confirmAction({
      title: 'Delete listing?',
      message: `"${listing.title}" will be removed permanently.`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (confirmed) {
      deleteListing.mutate(listing.id);
    }
  };

  return (
    <Screen scroll={false} padded={false} tabScreen>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={typography.display}>My listings</Text>
          {isApproved ? (
            <Button title="+ New" size="sm" onPress={() => setEditorTarget('new')} />
          ) : null}
        </View>
        <Text style={styles.subtitle}>
          Listings are services customers can book you for directly.
        </Text>
      </View>

      {profile.isPending ? (
        <LoadingState label="Loading listings…" />
      ) : profile.isError ? (
        <ErrorState message={profile.error.message} onRetry={() => profile.refetch()} />
      ) : !isApproved ? (
        <EmptyState
          icon="lock-closed-outline"
          title="Awaiting approval"
          message="You can publish listings once your cleaner profile is approved."
        />
      ) : listings.length === 0 ? (
        <EmptyState
          icon="pricetags-outline"
          title="No listings yet"
          message="Publish your first service so customers can book you directly."
          actionTitle="Create a Listing"
          onAction={() => setEditorTarget('new')}
        />
      ) : (
        <FlatList
          data={listings}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshing={profile.isRefetching}
          onRefresh={() => profile.refetch()}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.listingImage} />
              ) : null}
              <View style={styles.cardTop}>
                <Text style={typography.title} numberOfLines={1}>
                  {item.title}
                </Text>
                <Badge
                  label={capitalize(item.status)}
                  tone={
                    item.status === 'ACTIVE'
                      ? 'success'
                      : item.status === 'PAUSED'
                        ? 'warning'
                        : 'neutral'
                  }
                />
              </View>
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
              <Text style={styles.price}>{formatMoney(item.price)}</Text>
              <View style={styles.cardActions}>
                <Button
                  title="Edit"
                  size="sm"
                  variant="secondary"
                  onPress={() => setEditorTarget(item)}
                />
                <Button
                  title="Delete"
                  size="sm"
                  variant="danger"
                  loading={deleteListing.isPending && deleteListing.variables === item.id}
                  onPress={() => handleDelete(item)}
                />
              </View>
            </Card>
          )}
        />
      )}

      {deleteListing.isError ? (
        <View style={styles.footerError}>
          <Icon name="alert-circle-outline" size={16} color={colors.danger} />
          <Text style={styles.errorText}>{deleteListing.error.message}</Text>
        </View>
      ) : null}

      <ListingEditorSheet
        target={editorTarget}
        onClose={() => setEditorTarget(null)}
      />
    </Screen>
  );
}

interface ListingEditorSheetProps {
  /** 'new' to create, a listing to edit, null when hidden. */
  target: CleanerListing | 'new' | null;
  onClose: () => void;
}

function ListingEditorSheet({ target, onClose }: ListingEditorSheetProps): React.JSX.Element {
  const isNew = target === 'new';
  const listing = isNew || target === null ? null : target;

  const createListing = useCreateListing();
  const updateListing = useUpdateListing();
  const mutation = isNew ? createListing : updateListing;
  const imageUpload = useImageUpload();

  const [title, setTitle] = useState(listing?.title ?? '');
  const [description, setDescription] = useState(listing?.description ?? '');
  const [price, setPrice] = useState(listing ? String(listing.price) : '');
  const [status, setStatus] = useState<ListingStatus>(listing?.status ?? 'ACTIVE');
  const [imageUrl, setImageUrl] = useState(listing?.image_url ?? undefined);
  const [submitted, setSubmitted] = useState(false);

  // Re-seed the form each time the sheet opens for a different target.
  const [seededFor, setSeededFor] = useState<CleanerListing | 'new' | null>(target);
  if (target !== null && target !== seededFor) {
    setSeededFor(target);
    setTitle(listing?.title ?? '');
    setDescription(listing?.description ?? '');
    setPrice(listing ? String(listing.price) : '');
    setStatus(listing?.status ?? 'ACTIVE');
    setImageUrl(listing?.image_url ?? undefined);
    setSubmitted(false);
    createListing.reset();
    updateListing.reset();
  }

  const priceValue = Number(price.replace(/[^0-9.]/g, ''));
  const errors = {
    title: title.trim().length < 3 ? 'Give the listing a title' : undefined,
    description: description.trim().length < 10 ? 'Describe the service (min 10 characters)' : undefined,
    price: !priceValue || priceValue <= 0 ? 'Enter a price' : undefined,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const handlePickImage = async (): Promise<void> => {
    const url = await imageUpload.pickImage();
    if (url) {
      setImageUrl(url);
    }
  };

  const handleSubmit = (): void => {
    setSubmitted(true);
    if (hasErrors || mutation.isPending) {
      return;
    }
    const body = {
      title: title.trim(),
      description: description.trim(),
      price: priceValue,
      status,
      ...(imageUrl ? { image_url: imageUrl } : {}),
    };
    if (isNew) {
      createListing.mutate(body, { onSuccess: onClose });
    } else if (listing) {
      updateListing.mutate({ id: listing.id, ...body }, { onSuccess: onClose });
    }
  };

  return (
    <BottomSheet
      visible={target !== null}
      onClose={onClose}
      title={isNew ? 'New listing' : 'Edit listing'}>
      <Text style={styles.fieldLabel}>Photo (optional)</Text>
      <Pressable
        onPress={handlePickImage}
        disabled={imageUpload.uploading}
        style={styles.imagePicker}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
        ) : imageUpload.uploading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <Icon name="camera-outline" size={22} color={colors.ink400} />
            <Text style={styles.imagePickerText}>Add a photo</Text>
          </>
        )}
      </Pressable>
      {imageUpload.error ? <Text style={styles.errorText}>{imageUpload.error}</Text> : null}

      <Input
        label="Title"
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Standard apartment cleaning"
        error={submitted ? errors.title : undefined}
      />
      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="What's included in this service?"
        multiline
        style={styles.multiline}
        error={submitted ? errors.description : undefined}
      />
      <Input
        label={`Price (${env.DEFAULT_CURRENCY})`}
        icon="cash-outline"
        value={price}
        onChangeText={setPrice}
        placeholder="e.g. 20000"
        keyboardType="numeric"
        error={submitted ? errors.price : undefined}
      />
      <ChipGroup label="Status" options={STATUS_OPTIONS} value={status} onChange={setStatus} />

      {mutation.isError ? <Text style={styles.errorText}>{mutation.error.message}</Text> : null}

      <Button
        title={isNew ? 'Publish Listing' : 'Save Changes'}
        onPress={handleSubmit}
        loading={mutation.isPending}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtitle: { ...typography.body, color: colors.ink500 },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.huge,
    gap: spacing.md,
  },
  card: { gap: spacing.sm },
  listingImage: {
    width: '100%',
    height: 140,
    borderRadius: radii.md,
    backgroundColor: colors.ink100,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  description: { ...typography.body, color: colors.ink500 },
  price: { ...typography.bodyMedium, color: colors.primaryDark },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  footerError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
  fieldLabel: {
    ...typography.bodyMedium,
    color: colors.ink700,
    marginBottom: spacing.xs + 2,
  },
  imagePicker: {
    height: 140,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.ink200,
    borderStyle: 'dashed',
    backgroundColor: colors.ink50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  imagePickerText: { ...typography.body, color: colors.ink500 },
  imagePreview: { width: '100%', height: '100%' },
});

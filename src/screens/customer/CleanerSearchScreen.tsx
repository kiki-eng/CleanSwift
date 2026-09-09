import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import {
  Avatar,
  Card,
  EmptyState,
  ErrorState,
  Icon,
  Input,
  LoadingState,
  Rating,
  Screen,
} from '../../components';
import { useActiveListings } from '../../features/cleaners/hooks';
import { colors, spacing, typography } from '../../theme';
import type { CleanerListing } from '../../types/models';
import { displayName, formatMoney } from '../../utils/format';
import { flattenPages } from '../../utils/query';

export function CleanerSearchScreen(): React.JSX.Element {
  const [search, setSearch] = useState('');
  const listings = useActiveListings();

  const items = useMemo(() => {
    const all = flattenPages(listings.data);
    const query = search.trim().toLowerCase();
    if (!query) {
      return all;
    }
    return all.filter(listing => {
      const cleanerName =
        listing.cleaner?.company_name ?? displayName(listing.cleaner?.user ?? null);
      return (
        listing.title.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query) ||
        cleanerName.toLowerCase().includes(query)
      );
    });
  }, [listings.data, search]);

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.header}>
        <Text style={typography.display}>Find cleaners</Text>
        <Input
          icon="search-outline"
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or service"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      {listings.isPending ? (
        <LoadingState label="Finding cleaners…" />
      ) : listings.isError ? (
        <ErrorState message={listings.error.message} onRetry={() => listings.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title={search ? 'No matches' : 'No cleaners yet'}
          message={
            search
              ? 'Try a different search term.'
              : 'No cleaners have published listings yet — post a request instead and they will come to you.'
          }
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ListingRow listing={item} />}
          contentContainerStyle={styles.list}
          onEndReached={() => {
            if (listings.hasNextPage && !listings.isFetchingNextPage) {
              listings.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.4}
          refreshing={listings.isRefetching && !listings.isFetchingNextPage}
          onRefresh={() => listings.refetch()}
          ListFooterComponent={
            listings.isFetchingNextPage ? (
              <Text style={styles.footerHint}>Loading more…</Text>
            ) : undefined
          }
        />
      )}
    </Screen>
  );
}

function ListingRow({ listing }: { listing: CleanerListing }): React.JSX.Element {
  const navigation = useNavigation();
  const cleanerName =
    listing.cleaner?.company_name ?? (displayName(listing.cleaner?.user ?? null) || 'Cleaner');

  return (
    <Card
      onPress={() => navigation.navigate('CleanerDetails', { listingId: listing.id })}
      style={styles.card}>
      <View style={styles.cardTop}>
        <Avatar name={cleanerName} uri={listing.cleaner?.user?.profile_photo_url} size={48} />
        <View style={styles.cardTitleBlock}>
          <View style={styles.nameRow}>
            <Text style={typography.title} numberOfLines={1}>
              {cleanerName}
            </Text>
            {listing.cleaner?.background_checked ? (
              <Icon name="shield-checkmark" size={16} color={colors.success} />
            ) : null}
          </View>
          <Rating
            value={listing.cleaner?.average_rating ?? 0}
            reviewCount={listing.cleaner?.total_reviews ?? 0}
          />
        </View>
        <Text style={styles.price}>{formatMoney(listing.price)}</Text>
      </View>
      <Text style={typography.bodyMedium} numberOfLines={1}>
        {listing.title}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {listing.description}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
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
    gap: spacing.md,
  },
  cardTitleBlock: { flex: 1, gap: spacing.xxs },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  price: {
    ...typography.bodyMedium,
    color: colors.primaryDark,
  },
  description: {
    ...typography.body,
    color: colors.ink500,
  },
  footerHint: {
    ...typography.caption,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});

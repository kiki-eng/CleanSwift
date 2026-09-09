import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../theme';
import { Icon } from './Icon';

interface RatingProps {
  value: number;
  reviewCount?: number;
  size?: number;
}

/** Compact star + numeric rating, e.g. "★ 4.8 (12)". */
export function Rating({ value, reviewCount, size = 14 }: RatingProps): React.JSX.Element {
  return (
    <View style={styles.row}>
      <Icon name="star" size={size} color={colors.accent} />
      <Text style={styles.value}>{value > 0 ? value.toFixed(1) : 'New'}</Text>
      {reviewCount !== undefined && reviewCount > 0 ? (
        <Text style={styles.count}>({reviewCount})</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  value: { ...typography.bodyMedium, color: colors.ink900 },
  count: { ...typography.caption },
});

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing } from '../theme';
import { Icon } from './Icon';

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  size?: number;
}

/** Tappable 1–5 star rating selector. */
export function RatingInput({ value, onChange, size = 36 }: RatingInputProps): React.JSX.Element {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map(star => (
        <Pressable
          key={star}
          onPress={() => onChange(star)}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel={`${star} star${star > 1 ? 's' : ''}`}>
          <Icon
            name={star <= value ? 'star' : 'star-outline'}
            size={size}
            color={star <= value ? colors.accent : colors.ink300}
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../theme';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: ReadonlyArray<SegmentOption<T>>;
  value: T;
  onChange: (value: T) => void;
}

/** iOS-style segmented control used for in-screen tab switching. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>): React.JSX.Element {
  return (
    <View style={styles.container}>
      {options.map(option => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.option, selected && styles.optionSelected]}>
            <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.ink100,
    borderRadius: radii.md,
    padding: spacing.xs,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.sm,
  },
  optionSelected: { backgroundColor: colors.white },
  label: { ...typography.bodyMedium, color: colors.ink500 },
  labelSelected: { color: colors.ink900 },
});

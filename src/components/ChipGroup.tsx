import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../theme';

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface ChipGroupProps<T extends string> {
  label?: string;
  options: ReadonlyArray<ChipOption<T>>;
  value: T | undefined;
  onChange: (value: T) => void;
}

/** Horizontal wrap of selectable pills, used for enum-style form fields. */
export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: ChipGroupProps<T>): React.JSX.Element {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        {options.map(option => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={[styles.chip, selected && styles.chipSelected]}>
              <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: {
    ...typography.bodyMedium,
    color: colors.ink700,
    marginBottom: spacing.xs + 2,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.ink200,
    backgroundColor: colors.ink50,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  chipLabel: { ...typography.bodyMedium, color: colors.ink500 },
  chipLabelSelected: { color: colors.primaryDark },
});

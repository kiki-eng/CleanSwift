import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../theme';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';

interface ScheduleSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  /** Number of selectable days starting tomorrow. */
  dayCount?: number;
}

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

function formatHour(hour: number): string {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const display = hour > 12 ? hour - 12 : hour;
  return `${display}:00 ${suffix}`;
}

/**
 * Cross-platform date + time selector (chips inside a bottom sheet) —
 * identical behavior on iOS and Android with no native picker dependency.
 */
export function ScheduleSheet({
  visible,
  onClose,
  onConfirm,
  dayCount = 14,
}: ScheduleSheetProps): React.JSX.Element {
  const days = useMemo(() => {
    const list: Date[] = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    for (let i = 1; i <= dayCount; i += 1) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      list.push(day);
    }
    return list;
  }, [dayCount]);

  const [dayIndex, setDayIndex] = useState(0);
  const [hour, setHour] = useState<number | null>(null);

  const handleConfirm = (): void => {
    if (hour === null) {
      return;
    }
    const selected = new Date(days[dayIndex]);
    selected.setHours(hour, 0, 0, 0);
    onConfirm(selected);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Pick date & time">
      <Text style={styles.sectionLabel}>Date</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.dayRow}>
          {days.map((day, index) => {
            const selected = index === dayIndex;
            return (
              <Pressable
                key={day.toISOString()}
                onPress={() => setDayIndex(index)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[styles.dayChip, selected && styles.chipSelected]}>
                <Text style={[styles.dayWeekday, selected && styles.textSelected]}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <Text style={[styles.dayNumber, selected && styles.textSelected]}>
                  {day.getDate()}
                </Text>
                <Text style={[styles.dayMonth, selected && styles.textSelected]}>
                  {day.toLocaleDateString('en-US', { month: 'short' })}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <Text style={styles.sectionLabel}>Start time</Text>
      <View style={styles.timeGrid}>
        {HOURS.map(value => {
          const selected = value === hour;
          return (
            <Pressable
              key={value}
              onPress={() => setHour(value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={[styles.timeChip, selected && styles.chipSelected]}>
              <Text style={[styles.timeLabel, selected && styles.textSelected]}>
                {formatHour(value)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Button
        title="Confirm"
        onPress={handleConfirm}
        disabled={hour === null}
        style={styles.confirm}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    ...typography.bodyMedium,
    color: colors.ink700,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  dayRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  dayChip: {
    width: 64,
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.ink200,
    backgroundColor: colors.ink50,
    paddingVertical: spacing.md,
    gap: spacing.xxs,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  dayWeekday: { ...typography.caption },
  dayNumber: { ...typography.title },
  dayMonth: { ...typography.caption },
  textSelected: { color: colors.primaryDark },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeChip: {
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.ink200,
    backgroundColor: colors.ink50,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  timeLabel: { ...typography.bodyMedium, color: colors.ink700 },
  confirm: { marginTop: spacing.xxl },
});

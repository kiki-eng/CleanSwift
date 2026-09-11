import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, radii, spacing, typography } from '../theme';
import type { JobStatus, ListingRequestStatus } from '../types/enums';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand';

interface BadgeProps {
  label: string;
  tone?: Tone;
  style?: ViewStyle;
}

export function Badge({ label, tone = 'neutral', style }: BadgeProps): React.JSX.Element {
  const palette = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }, style]}>
      <Text style={[styles.label, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

const tones: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: colors.ink100, fg: colors.ink700 },
  success: { bg: colors.successLight, fg: colors.success },
  warning: { bg: colors.warningLight, fg: colors.warning },
  danger: { bg: colors.dangerLight, fg: colors.danger },
  info: { bg: colors.infoLight, fg: colors.info },
  brand: { bg: colors.primaryLight, fg: colors.primaryDark },
};

export function jobStatusTone(status: JobStatus): Tone {
  switch (status) {
    case 'OPEN':
      return 'info';
    case 'ASSIGNED':
      return 'brand';
    case 'IN_PROGRESS':
      return 'warning';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'danger';
  }
}

export function requestStatusTone(status: ListingRequestStatus): Tone {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'ACCEPTED':
      return 'info';
    case 'STARTED':
      return 'brand';
    case 'COMPLETED':
      return 'success';
    case 'REJECTED':
    case 'CANCELLED':
      return 'danger';
  }
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  label: { ...typography.captionMedium },
});

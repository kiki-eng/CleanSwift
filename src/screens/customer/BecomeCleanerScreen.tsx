import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button, Icon, Input, Screen } from '../../components';
import { useApplyToBecomeCleaner } from '../../features/cleaners/hooks';
import { useAuthStore } from '../../store/authStore';
import { colors, radii, spacing, typography } from '../../theme';
import type { RootStackParamList } from '../../types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'BecomeCleaner'>;

function splitList(value: string): string[] | undefined {
  const items = value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
}

export function BecomeCleanerScreen(): React.JSX.Element {
  const navigation = useNavigation<Navigation>();
  const apply = useApplyToBecomeCleaner();
  const role = useAuthStore(state => state.user?.role);

  const [isIndividual, setIsIndividual] = useState(true);
  const [companyName, setCompanyName] = useState('');
  const [experience, setExperience] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [serviceAreas, setServiceAreas] = useState('');
  const [specialties, setSpecialties] = useState('');

  const canSubmit = isIndividual || companyName.trim().length > 0;
  const rateValue = Number(hourlyRate.replace(/[^0-9.]/g, ''));

  if (apply.isSuccess) {
    // If the backend flipped the role to CLEANER, RootNavigator no longer
    // registers "CustomerTabs" — it gets pruned from the stack, so a plain
    // goBack() would have nowhere to go. Reset to whichever root matches
    // the (possibly just-updated) role instead.
    const handleDone = (): void => {
      navigation.reset({
        index: 0,
        routes: [{ name: role === 'CLEANER' ? 'CleanerTabs' : 'CustomerTabs' }],
      });
    };

    return (
      <Screen scroll={false}>
        <View style={styles.successBlock}>
          <View style={styles.successIcon}>
            <Icon name="checkmark-circle" size={48} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Application submitted!</Text>
          <Text style={styles.successBody}>
            We're reviewing your cleaner profile. You'll be able to accept jobs as soon as it's
            approved.
          </Text>
          <Button title="Done" onPress={handleDone} style={styles.successButton} />
        </View>
      </Screen>
    );
  }

  const handleSubmit = (): void => {
    if (!canSubmit || apply.isPending) {
      return;
    }
    apply.mutate({
      is_individual: isIndividual,
      company_name: isIndividual ? undefined : companyName.trim(),
      cleaning_experience: experience.trim() || undefined,
      hourly_rate: rateValue > 0 ? rateValue : undefined,
      service_areas: splitList(serviceAreas),
      specialties: splitList(specialties),
    });
  };

  return (
    <Screen keyboard>
      <Text style={styles.intro}>
        Tell us a bit about your cleaning business. Your profile is reviewed before you can
        accept jobs — your customer account keeps working in the meantime.
      </Text>

      <Text style={styles.sectionLabel}>I am…</Text>
      <View style={styles.segment}>
        <SegmentOption
          label="An individual"
          selected={isIndividual}
          onPress={() => setIsIndividual(true)}
        />
        <SegmentOption
          label="A company"
          selected={!isIndividual}
          onPress={() => setIsIndividual(false)}
        />
      </View>

      {!isIndividual ? (
        <Input
          label="Company name"
          icon="business-outline"
          value={companyName}
          onChangeText={setCompanyName}
          placeholder="Sparkle Cleaners Ltd"
        />
      ) : null}

      <Input
        label="Cleaning experience (optional)"
        icon="sparkles-outline"
        value={experience}
        onChangeText={setExperience}
        placeholder="e.g. 5 years of residential deep cleaning"
        multiline
      />
      <Input
        label="Hourly rate (optional)"
        icon="cash-outline"
        value={hourlyRate}
        onChangeText={setHourlyRate}
        placeholder="e.g. 3500"
        keyboardType="numeric"
      />
      <Input
        label="Service areas (optional)"
        icon="location-outline"
        value={serviceAreas}
        onChangeText={setServiceAreas}
        placeholder="e.g. Lekki, Ikeja, Victoria Island"
      />
      <Input
        label="Specialties (optional)"
        icon="sparkles-outline"
        value={specialties}
        onChangeText={setSpecialties}
        placeholder="e.g. deep cleaning, move-out cleaning"
      />
      <Text style={styles.hint}>Separate multiple areas or specialties with commas.</Text>

      {apply.isError ? <Text style={styles.error}>{apply.error.message}</Text> : null}

      <Button
        title="Submit Application"
        onPress={handleSubmit}
        loading={apply.isPending}
        disabled={!canSubmit}
        style={styles.submit}
      />
    </Screen>
  );
}

interface SegmentOptionProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function SegmentOption({ label, selected, onPress }: SegmentOptionProps): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.segmentOption, selected && styles.segmentSelected]}>
      <Text style={[styles.segmentLabel, selected && styles.segmentLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  intro: {
    ...typography.body,
    color: colors.ink500,
    paddingVertical: spacing.lg,
  },
  sectionLabel: {
    ...typography.bodyMedium,
    color: colors.ink700,
    marginBottom: spacing.sm,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.ink100,
    borderRadius: radii.md,
    padding: spacing.xs,
    marginBottom: spacing.lg,
  },
  segmentOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.sm,
  },
  segmentSelected: { backgroundColor: colors.white },
  segmentLabel: { ...typography.bodyMedium, color: colors.ink500 },
  segmentLabelSelected: { color: colors.ink900 },
  hint: {
    ...typography.caption,
    color: colors.ink500,
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
  },
  error: {
    ...typography.body,
    color: colors.danger,
    marginBottom: spacing.lg,
  },
  submit: { marginTop: spacing.sm, marginBottom: spacing.xxl },
  successBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xxl,
  },
  successIcon: { marginBottom: spacing.md },
  successTitle: { ...typography.titleLg, textAlign: 'center' },
  successBody: {
    ...typography.body,
    color: colors.ink500,
    textAlign: 'center',
  },
  successButton: { alignSelf: 'stretch', marginTop: spacing.xl },
});

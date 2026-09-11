import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Button, ErrorState, Input, LoadingState, Screen } from '../../components';
import { useMyCleanerProfile, useUpdateCleanerProfile } from '../../features/listings/hooks';
import { colors, spacing, typography } from '../../theme';

function joinList(items?: string[] | null): string {
  return items?.join(', ') ?? '';
}

function splitList(value: string): string[] | undefined {
  const items = value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
}

export function CleanerProfileEditScreen(): React.JSX.Element {
  const profile = useMyCleanerProfile();

  if (profile.isPending) {
    return (
      <Screen scroll={false}>
        <LoadingState label="Loading your business profile…" />
      </Screen>
    );
  }
  if (profile.isError || !profile.data) {
    return (
      <Screen scroll={false}>
        <ErrorState message={profile.error?.message} onRetry={() => profile.refetch()} />
      </Screen>
    );
  }
  return <BusinessProfileForm cleanerId={profile.data.id} initial={profile.data} />;
}

interface BusinessProfileFormProps {
  cleanerId: string;
  initial: {
    company_name?: string | null;
    cleaning_experience?: string | null;
    hourly_rate?: number | null;
    service_areas?: string[] | null;
    specialties?: string[] | null;
    is_individual: boolean;
  };
}

function BusinessProfileForm({ initial }: BusinessProfileFormProps): React.JSX.Element {
  const navigation = useNavigation();
  const updateProfile = useUpdateCleanerProfile();

  const [companyName, setCompanyName] = useState(initial.company_name ?? '');
  const [experience, setExperience] = useState(initial.cleaning_experience ?? '');
  const [hourlyRate, setHourlyRate] = useState(
    initial.hourly_rate ? String(initial.hourly_rate) : '',
  );
  const [serviceAreas, setServiceAreas] = useState(joinList(initial.service_areas));
  const [specialties, setSpecialties] = useState(joinList(initial.specialties));

  const rateValue = Number(hourlyRate.replace(/[^0-9.]/g, ''));

  const handleSubmit = (): void => {
    updateProfile.mutate(
      {
        ...(initial.is_individual ? {} : { company_name: companyName.trim() || undefined }),
        cleaning_experience: experience.trim() || undefined,
        hourly_rate: rateValue > 0 ? rateValue : undefined,
        service_areas: splitList(serviceAreas),
        specialties: splitList(specialties),
      },
      { onSuccess: () => navigation.goBack() },
    );
  };

  return (
    <Screen keyboard>
      <Text style={styles.intro}>
        This shows up on your public listing so customers know what you offer.
      </Text>

      {!initial.is_individual ? (
        <Input
          label="Company name"
          icon="business-outline"
          value={companyName}
          onChangeText={setCompanyName}
          placeholder="Sparkle Cleaners Ltd"
        />
      ) : null}

      <Input
        label="Cleaning experience"
        icon="sparkles-outline"
        value={experience}
        onChangeText={setExperience}
        placeholder="e.g. 5 years of residential deep cleaning"
        multiline
      />
      <Input
        label="Hourly rate"
        icon="cash-outline"
        value={hourlyRate}
        onChangeText={setHourlyRate}
        placeholder="e.g. 3500"
        keyboardType="numeric"
      />
      <Input
        label="Service areas"
        icon="location-outline"
        value={serviceAreas}
        onChangeText={setServiceAreas}
        placeholder="e.g. Lekki, Ikeja, Victoria Island"
      />
      <Input
        label="Specialties"
        icon="ribbon-outline"
        value={specialties}
        onChangeText={setSpecialties}
        placeholder="e.g. deep cleaning, move-out cleaning"
      />
      <Text style={styles.hint}>Separate multiple areas or specialties with commas.</Text>

      {updateProfile.isError ? (
        <Text style={styles.error}>{updateProfile.error.message}</Text>
      ) : null}

      <Button
        title="Save Changes"
        onPress={handleSubmit}
        loading={updateProfile.isPending}
        style={styles.submit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    ...typography.body,
    color: colors.ink500,
    paddingVertical: spacing.lg,
  },
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
});

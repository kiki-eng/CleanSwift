import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button, ChipGroup, Icon, Input, ScheduleSheet, Screen } from '../../components';
import { env } from '../../config/env';
import { useCreateJob } from '../../features/jobs/hooks';
import { colors, radii, spacing, typography } from '../../theme';
import type { JobMode, PropertyType } from '../../types/enums';
import type { RootStackParamList } from '../../types/navigation';
import { formatUnixDate } from '../../utils/format';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CreateRequest'>;

const PROPERTY_OPTIONS = [
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'HOUSE', label: 'House' },
  { value: 'OFFICE', label: 'Office' },
  { value: 'OTHER', label: 'Other' },
] as const;

const MODE_OPTIONS = [
  { value: 'FIRST_COME', label: 'First come, first served' },
  { value: 'CUSTOMER_SELECTS', label: 'I pick from applicants' },
] as const;

const DURATION_OPTIONS = [
  { value: '2', label: '2 hrs' },
  { value: '3', label: '3 hrs' },
  { value: '4', label: '4 hrs' },
  { value: '6', label: '6 hrs' },
  { value: '8', label: '8 hrs' },
] as const;

export function CreateRequestScreen(): React.JSX.Element {
  const navigation = useNavigation<Navigation>();
  const createJob = useCreateJob();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('APARTMENT');
  const [mode, setMode] = useState<JobMode>('FIRST_COME');
  const [address, setAddress] = useState('');
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [duration, setDuration] = useState<string>('3');
  const [budget, setBudget] = useState('');
  const [requirements, setRequirements] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const budgetValue = Number(budget.replace(/[^0-9.]/g, ''));
  const errors = {
    title: title.trim().length < 3 ? 'Give your request a short title' : undefined,
    description:
      description.trim().length < 10 ? 'Describe what needs cleaning (min 10 characters)' : undefined,
    address: address.trim().length < 5 ? 'Enter the full address' : undefined,
    scheduledAt: !scheduledAt ? 'Pick a date and time' : undefined,
    budget: !budgetValue || budgetValue <= 0 ? 'Enter your budget' : undefined,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = (): void => {
    setSubmitted(true);
    if (hasErrors || !scheduledAt || createJob.isPending) {
      return;
    }
    const special = requirements
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

    createJob.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        mode,
        property_type: propertyType,
        address: address.trim(),
        scheduled_date: Math.floor(scheduledAt.getTime() / 1000),
        estimated_duration: Number(duration),
        budget: budgetValue,
        currency: env.DEFAULT_CURRENCY,
        ...(special.length > 0 ? { special_requirements: special } : {}),
      },
      {
        onSuccess: job => {
          navigation.replace('BookingDetails', { kind: 'job', id: job.id });
        },
      },
    );
  };

  return (
    <Screen keyboard>
      <Text style={styles.intro}>
        Tell us what you need — approved cleaners will see your request right away.
      </Text>

      <Input
        label="Title"
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Deep clean 2-bedroom apartment"
        error={submitted ? errors.title : undefined}
      />
      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Rooms, focus areas, supplies provided…"
        multiline
        numberOfLines={4}
        style={styles.multiline}
        error={submitted ? errors.description : undefined}
      />

      <ChipGroup
        label="Property type"
        options={PROPERTY_OPTIONS}
        value={propertyType}
        onChange={setPropertyType}
      />
      <ChipGroup
        label="How should cleaners get this job?"
        options={MODE_OPTIONS}
        value={mode}
        onChange={setMode}
      />

      <Input
        label="Address"
        icon="location-outline"
        value={address}
        onChangeText={setAddress}
        placeholder="Street, city"
        error={submitted ? errors.address : undefined}
      />

      {/* Date & time */}
      <Text style={styles.fieldLabel}>Date & time</Text>
      <Pressable
        onPress={() => setShowSchedule(true)}
        accessibilityRole="button"
        style={[styles.scheduleField, submitted && errors.scheduledAt ? styles.fieldError : null]}>
        <Icon
          name="calendar-outline"
          size={18}
          color={scheduledAt ? colors.primary : colors.ink400}
        />
        <Text style={scheduledAt ? styles.scheduleValue : styles.schedulePlaceholder}>
          {scheduledAt
            ? formatUnixDate(scheduledAt.getTime() / 1000)
            : 'Pick a date and time'}
        </Text>
        <Icon name="chevron-forward" size={18} color={colors.ink400} />
      </Pressable>
      {submitted && errors.scheduledAt ? (
        <Text style={styles.errorText}>{errors.scheduledAt}</Text>
      ) : null}

      <ChipGroup
        label="Estimated duration"
        options={DURATION_OPTIONS}
        value={duration}
        onChange={setDuration}
      />

      <Input
        label={`Budget (${env.DEFAULT_CURRENCY})`}
        icon="cash-outline"
        value={budget}
        onChangeText={setBudget}
        placeholder="e.g. 15000"
        keyboardType="numeric"
        error={submitted ? errors.budget : undefined}
      />
      <Input
        label="Special requirements (optional)"
        value={requirements}
        onChangeText={setRequirements}
        placeholder="e.g. pet-friendly products, bring supplies"
      />

      {createJob.isError ? <Text style={styles.errorText}>{createJob.error.message}</Text> : null}

      <Button
        title="Post Request"
        onPress={handleSubmit}
        loading={createJob.isPending}
        style={styles.submit}
      />

      <ScheduleSheet
        visible={showSchedule}
        onClose={() => setShowSchedule(false)}
        onConfirm={setScheduledAt}
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
  multiline: { minHeight: 88, textAlignVertical: 'top' },
  fieldLabel: {
    ...typography.bodyMedium,
    color: colors.ink700,
    marginBottom: spacing.xs + 2,
  },
  scheduleField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.ink200,
    borderRadius: radii.md,
    backgroundColor: colors.ink50,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    marginBottom: spacing.lg,
  },
  fieldError: { borderColor: colors.danger },
  scheduleValue: { ...typography.bodyLg, flex: 1 },
  schedulePlaceholder: { ...typography.bodyLg, flex: 1, color: colors.ink400 },
  errorText: {
    ...typography.body,
    color: colors.danger,
    marginBottom: spacing.lg,
  },
  submit: { marginTop: spacing.sm, marginBottom: spacing.xxl },
});

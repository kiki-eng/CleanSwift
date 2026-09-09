import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button, Input, Screen } from '../../components';
import { useRegisterCleaner, useRegisterCustomer } from '../../features/auth/hooks';
import { colors, radii, spacing, typography } from '../../theme';
import type { AuthStackParamList } from '../../types/navigation';

type Navigation = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;
type Route = RouteProp<AuthStackParamList, 'SignUp'>;

export function SignUpScreen(): React.JSX.Element {
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<Route>();
  const isCleaner = params.role === 'CLEANER';

  const registerCustomer = useRegisterCustomer();
  const registerCleaner = useRegisterCleaner();
  const mutation = isCleaner ? registerCleaner : registerCustomer;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  // Cleaner-only fields
  const [isIndividual, setIsIndividual] = useState(true);
  const [companyName, setCompanyName] = useState('');
  const [experience, setExperience] = useState('');

  const passwordTooShort = password.length > 0 && password.length < 8;
  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 8 &&
    (!isCleaner || isIndividual || companyName.trim().length > 0);

  const handleSubmit = (): void => {
    const base = {
      email: email.trim().toLowerCase(),
      password,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone_number: phone.trim() || undefined,
      location: location.trim() || undefined,
    };

    if (isCleaner) {
      registerCleaner.mutate({
        ...base,
        is_individual: isIndividual,
        company_name: isIndividual ? undefined : companyName.trim(),
        cleaning_experience: experience.trim() || undefined,
      });
    } else {
      registerCustomer.mutate(base);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={typography.display}>
          {isCleaner ? 'Start earning' : 'Create your account'}
        </Text>
        <Text style={styles.subtitle}>
          {isCleaner
            ? 'Set up your cleaner account. Your profile is reviewed before you can take jobs.'
            : 'Book your first cleaning in minutes.'}
        </Text>
      </View>

      <View style={styles.nameRow}>
        <View style={styles.nameField}>
          <Input label="First name" value={firstName} onChangeText={setFirstName} placeholder="Jane" />
        </View>
        <View style={styles.nameField}>
          <Input label="Last name" value={lastName} onChangeText={setLastName} placeholder="Smith" />
        </View>
      </View>

      <Input
        label="Email"
        icon="mail-outline"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Input
        label="Password"
        icon="lock-closed-outline"
        value={password}
        onChangeText={setPassword}
        placeholder="Minimum 8 characters"
        secureTextEntry
        error={passwordTooShort ? 'Password must be at least 8 characters' : undefined}
      />
      <Input
        label="Phone (optional)"
        icon="call-outline"
        value={phone}
        onChangeText={setPhone}
        placeholder="+234 801 234 5678"
        keyboardType="phone-pad"
      />
      <Input
        label="City (optional)"
        icon="location-outline"
        value={location}
        onChangeText={setLocation}
        placeholder="Lagos"
      />

      {isCleaner ? (
        <>
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
        </>
      ) : null}

      {mutation.isError ? <Text style={styles.error}>{mutation.error.message}</Text> : null}

      <Button
        title={isCleaner ? 'Apply & Create Account' : 'Create Account'}
        onPress={handleSubmit}
        loading={mutation.isPending}
        disabled={!canSubmit}
      />

      <View style={styles.footer}>
        <Text style={typography.body}>Already have an account?</Text>
        <Button
          title="Log in"
          variant="ghost"
          size="sm"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
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
  header: { paddingTop: spacing.xxxl, paddingBottom: spacing.xxl },
  subtitle: {
    ...typography.bodyLg,
    color: colors.ink500,
    marginTop: spacing.sm,
  },
  nameRow: { flexDirection: 'row', gap: spacing.md },
  nameField: { flex: 1 },
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
  error: {
    ...typography.body,
    color: colors.danger,
    marginBottom: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
});

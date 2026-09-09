import React, { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Button, Input, Screen } from '../../components';
import { useChangePassword } from '../../features/profile/hooks';
import { colors, spacing, typography } from '../../theme';

export function ChangePasswordScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const changePassword = useChangePassword();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirmNext, setConfirmNext] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const nextTooWeak =
    next.length > 0 &&
    (next.length < 8 || !/[A-Z]/.test(next) || !/[a-z]/.test(next) || !/[0-9]/.test(next));
  const mismatch = confirmNext.length > 0 && next !== confirmNext;
  const canSubmit =
    current.length > 0 && next.length >= 8 && !nextTooWeak && next === confirmNext;

  const handleSubmit = (): void => {
    setSubmitted(true);
    if (!canSubmit || changePassword.isPending) {
      return;
    }
    changePassword.mutate(
      { current_password: current, new_password: next, confirm_password: confirmNext },
      {
        onSuccess: () => {
          Alert.alert('Password changed', 'Your password has been updated.');
          navigation.goBack();
        },
      },
    );
  };

  return (
    <Screen keyboard>
      <Text style={styles.intro}>
        Your new password must be at least 8 characters and include uppercase, lowercase, and a
        number.
      </Text>
      <Input
        label="Current password"
        icon="lock-closed-outline"
        value={current}
        onChangeText={setCurrent}
        secureTextEntry
        textContentType="password"
      />
      <Input
        label="New password"
        icon="key-outline"
        value={next}
        onChangeText={setNext}
        secureTextEntry
        textContentType="newPassword"
        error={
          nextTooWeak
            ? 'Min 8 characters with uppercase, lowercase, and a number'
            : undefined
        }
      />
      <Input
        label="Confirm new password"
        icon="key-outline"
        value={confirmNext}
        onChangeText={setConfirmNext}
        secureTextEntry
        textContentType="newPassword"
        error={mismatch ? 'Passwords do not match' : undefined}
      />

      {changePassword.isError ? (
        <Text style={styles.error}>{changePassword.error.message}</Text>
      ) : null}
      {submitted && !canSubmit && !changePassword.isError ? (
        <Text style={styles.error}>Please fix the fields above.</Text>
      ) : null}

      <Button
        title="Change Password"
        onPress={handleSubmit}
        disabled={!canSubmit}
        loading={changePassword.isPending}
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
  error: {
    ...typography.body,
    color: colors.danger,
    marginBottom: spacing.lg,
  },
  submit: { marginTop: spacing.sm },
});

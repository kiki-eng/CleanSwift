import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button, Input, Screen } from '../../components';
import { useResetPassword } from '../../features/auth/hooks';
import { colors, spacing, typography } from '../../theme';
import type { AuthStackParamList } from '../../types/navigation';

type Navigation = NativeStackNavigationProp<AuthStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen(): React.JSX.Element {
  const navigation = useNavigation<Navigation>();
  const resetPassword = useResetPassword();

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const passwordTooShort = password.length > 0 && password.length < 8;
  const mismatch = confirm.length > 0 && password !== confirm;
  const canSubmit =
    otp.trim().length > 0 && password.length >= 8 && password === confirm;

  const handleSubmit = (): void => {
    resetPassword.mutate(
      { otp: otp.trim(), new_password: password },
      {
        onSuccess: () => {
          Alert.alert('Password reset', 'You can now log in with your new password.');
          navigation.navigate('Login');
        },
      },
    );
  };

  return (
    <Screen keyboard>
      <View style={styles.header}>
        <Text style={typography.display}>Reset password</Text>
        <Text style={styles.subtitle}>
          Enter the code from your email and choose a new password.
        </Text>
      </View>

      <Input
        label="Reset code"
        icon="keypad-outline"
        value={otp}
        onChangeText={setOtp}
        placeholder="Enter the code"
        keyboardType="number-pad"
        autoCapitalize="none"
      />
      <Input
        label="New password"
        icon="lock-closed-outline"
        value={password}
        onChangeText={setPassword}
        placeholder="Minimum 8 characters"
        secureTextEntry
        textContentType="newPassword"
        error={passwordTooShort ? 'Password must be at least 8 characters' : undefined}
      />
      <Input
        label="Confirm new password"
        icon="lock-closed-outline"
        value={confirm}
        onChangeText={setConfirm}
        placeholder="Repeat the password"
        secureTextEntry
        textContentType="newPassword"
        error={mismatch ? 'Passwords do not match' : undefined}
      />

      {resetPassword.isError ? (
        <Text style={styles.error}>{resetPassword.error.message}</Text>
      ) : null}

      <Button
        title="Reset Password"
        onPress={handleSubmit}
        disabled={!canSubmit}
        loading={resetPassword.isPending}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.huge, paddingBottom: spacing.xxl },
  subtitle: {
    ...typography.bodyLg,
    color: colors.ink500,
    marginTop: spacing.sm,
  },
  error: {
    ...typography.body,
    color: colors.danger,
    marginBottom: spacing.lg,
  },
});

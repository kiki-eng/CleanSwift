import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Button, Icon, Input, Screen } from '../../components';
import { useResendVerification, useVerifyEmail } from '../../features/auth/hooks';
import { useAuthStore } from '../../store/authStore';
import { colors, radii, spacing, typography } from '../../theme';

export function VerifyEmailScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const email = useAuthStore(state => state.user?.email);
  const verifyEmail = useVerifyEmail();
  const resend = useResendVerification();

  const [otp, setOtp] = useState('');

  const handleVerify = (): void => {
    verifyEmail.mutate(otp.trim(), {
      onSuccess: () => {
        Alert.alert('Email verified', 'Thanks — your email is now verified.');
        navigation.goBack();
      },
    });
  };

  return (
    <Screen keyboard>
      <View style={styles.hero}>
        <View style={styles.iconCircle}>
          <Icon name="mail-unread-outline" size={28} color={colors.primary} />
        </View>
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>
          Enter the verification code we sent to {email ?? 'your email address'}.
        </Text>
      </View>

      <Input
        label="Verification code"
        icon="keypad-outline"
        value={otp}
        onChangeText={setOtp}
        placeholder="Enter the code"
        keyboardType="number-pad"
        autoCapitalize="none"
      />

      {verifyEmail.isError ? (
        <Text style={styles.error}>{verifyEmail.error.message}</Text>
      ) : null}

      <Button
        title="Verify Email"
        onPress={handleVerify}
        disabled={otp.trim().length === 0}
        loading={verifyEmail.isPending}
      />
      <Button
        title={resend.isSuccess ? 'Code sent!' : "Resend code"}
        variant="ghost"
        loading={resend.isPending}
        onPress={() => resend.mutate()}
        style={styles.resend}
      />
      {resend.isError ? <Text style={styles.error}>{resend.error.message}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.sm,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: { ...typography.titleLg },
  subtitle: {
    ...typography.body,
    color: colors.ink500,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  error: {
    ...typography.body,
    color: colors.danger,
    marginVertical: spacing.md,
  },
  resend: { marginTop: spacing.sm },
});

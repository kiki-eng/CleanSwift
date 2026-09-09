import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button, Input, Screen } from '../../components';
import { useForgotPassword } from '../../features/auth/hooks';
import { colors, spacing, typography } from '../../theme';
import type { AuthStackParamList } from '../../types/navigation';

type Navigation = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen(): React.JSX.Element {
  const navigation = useNavigation<Navigation>();
  const forgotPassword = useForgotPassword();
  const [email, setEmail] = useState('');

  const handleSubmit = (): void => {
    forgotPassword.mutate(email.trim().toLowerCase(), {
      onSuccess: () => navigation.navigate('ResetPassword'),
    });
  };

  return (
    <Screen keyboard>
      <View style={styles.header}>
        <Text style={typography.display}>Forgot password?</Text>
        <Text style={styles.subtitle}>
          Enter your email and we'll send you a reset code.
        </Text>
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
        textContentType="emailAddress"
      />

      {forgotPassword.isError ? (
        <Text style={styles.error}>{forgotPassword.error.message}</Text>
      ) : null}

      <Button
        title="Send Reset Code"
        onPress={handleSubmit}
        disabled={email.trim().length === 0}
        loading={forgotPassword.isPending}
      />
      <Button
        title="I already have a code"
        variant="ghost"
        onPress={() => navigation.navigate('ResetPassword')}
        style={styles.secondary}
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
  secondary: { marginTop: spacing.sm },
});

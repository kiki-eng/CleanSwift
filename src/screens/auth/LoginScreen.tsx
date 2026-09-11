import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button, Input, Screen } from '../../components';
import { useLogin } from '../../features/auth/hooks';
import { colors, spacing, typography } from '../../theme';
import type { AuthStackParamList } from '../../types/navigation';

type Navigation = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen(): React.JSX.Element {
  const navigation = useNavigation<Navigation>();
  const login = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const handleSubmit = (): void => {
    login.mutate({ email: email.trim().toLowerCase(), password });
  };

  return (
    <Screen keyboard>
      <View style={styles.header}>
        <Text style={typography.display}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to continue.</Text>
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
      <Input
        label="Password"
        icon="lock-closed-outline"
        value={password}
        onChangeText={setPassword}
        placeholder="Your password"
        secureTextEntry
        textContentType="password"
      />

      <Button
        title="Forgot password?"
        variant="ghost"
        size="sm"
        onPress={() => navigation.navigate('ForgotPassword')}
        style={styles.forgot}
      />

      {login.isError ? (
        <Text style={styles.error}>{login.error.message}</Text>
      ) : null}

      <Button
        title="Log In"
        onPress={handleSubmit}
        loading={login.isPending}
        disabled={!canSubmit}
        style={styles.submit}
      />

      <View style={styles.footer}>
        <Text style={typography.body}>New to CleanSwift?</Text>
        <Button
          title="Create an account"
          variant="ghost"
          size="sm"
          onPress={() => navigation.navigate('ChooseRole')}
        />
      </View>
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
  forgot: { alignSelf: 'flex-end', marginBottom: spacing.sm },
  submit: { marginTop: spacing.sm },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
});

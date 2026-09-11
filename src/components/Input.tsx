import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { colors, radii, spacing, typography } from '../theme';
import { Icon } from './Icon';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: string;
}

export function Input({
  label,
  error,
  icon,
  secureTextEntry,
  style,
  ...inputProps
}: InputProps): React.JSX.Element {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const isPassword = Boolean(secureTextEntry);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          focused && styles.fieldFocused,
          error ? styles.fieldError : null,
        ]}>
        {icon ? (
          <Icon name={icon} size={18} color={focused ? colors.primary : colors.ink400} />
        ) : null}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.ink400}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={isPassword && !revealed}
          {...inputProps}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setRevealed(value => !value)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}>
            <Icon
              name={revealed ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={colors.ink400}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View style={styles.errorRow}>
          <Icon name="alert-circle" size={13} color={colors.danger} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: {
    ...typography.bodyMedium,
    color: colors.ink700,
    marginBottom: spacing.xs + 2,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.ink200,
    borderRadius: radii.md,
    backgroundColor: colors.ink50,
    paddingHorizontal: spacing.lg,
  },
  fieldFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  fieldError: { borderColor: colors.danger, backgroundColor: colors.white },
  input: {
    ...typography.bodyLg,
    flex: 1,
    paddingVertical: spacing.md + 2,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs + 2,
    marginTop: spacing.xs,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
});

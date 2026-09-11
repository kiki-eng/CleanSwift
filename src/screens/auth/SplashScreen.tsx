import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from '../../components';
import { useBootstrapSession } from '../../features/auth/hooks';
import { colors, spacing, typography } from '../../theme';

/** Shown while restoring the session from the keychain on app boot. */
export function SplashScreen(): React.JSX.Element {
  const bootstrap = useBootstrapSession();

  useEffect(() => {
    bootstrap().catch(() => undefined);
  }, [bootstrap]);

  return (
    <View style={styles.container}>
      <BrandLogo size={96} style={styles.logo} />
      <Text style={styles.brand}>CleanSwift</Text>
      <Text style={styles.tagline}>Sparkling homes, on demand</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { marginBottom: spacing.xl },
  brand: {
    ...typography.displayLg,
    color: colors.white,
  },
  tagline: {
    ...typography.body,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.sm,
  },
});

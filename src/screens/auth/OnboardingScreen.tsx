import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BrandLogo, Button, Icon, Screen } from '../../components';
import { colors, radii, spacing, typography } from '../../theme';
import type { AuthStackParamList } from '../../types/navigation';

type Navigation = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

const highlights = [
  {
    icon: 'shield-checkmark-outline',
    title: 'Vetted cleaners',
    text: 'Every cleaner is reviewed and approved before they can work.',
  },
  {
    icon: 'flash-outline',
    title: 'Book in minutes',
    text: 'Post a request or book a cleaner directly — your choice.',
  },
  {
    icon: 'star-outline',
    title: 'Rated by real customers',
    text: 'Transparent ratings and reviews on every profile.',
  },
] as const;

export function OnboardingScreen(): React.JSX.Element {
  const navigation = useNavigation<Navigation>();

  return (
    <Screen>
      <View style={styles.hero}>
        <BrandLogo size={96} style={styles.logo} />
        <Text style={styles.title}>Welcome to CleanSwift</Text>
        <Text style={styles.subtitle}>
          The easiest way to book trusted cleaners — or earn money cleaning.
        </Text>
      </View>

      <View style={styles.highlights}>
        {highlights.map(item => (
          <View key={item.title} style={styles.highlightRow}>
            <View style={styles.highlightIcon}>
              <Icon name={item.icon} size={22} color={colors.primary} />
            </View>
            <View style={styles.highlightText}>
              <Text style={typography.title}>{item.title}</Text>
              <Text style={styles.highlightBody}>{item.text}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Button title="Get Started" onPress={() => navigation.navigate('ChooseRole')} />
        <Button
          title="I already have an account"
          variant="ghost"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingTop: spacing.huge,
    paddingBottom: spacing.xxl,
  },
  logo: { marginBottom: spacing.xl },
  title: {
    ...typography.display,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyLg,
    color: colors.ink500,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  highlights: {
    flex: 1,
    gap: spacing.xxl,
    paddingVertical: spacing.xl,
  },
  highlightRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'flex-start',
  },
  highlightIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightText: { flex: 1, gap: spacing.xxs },
  highlightBody: {
    ...typography.body,
    color: colors.ink500,
  },
  footer: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
});

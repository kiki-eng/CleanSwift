import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button, Icon, Screen } from '../../components';
import { colors, radii, shadows, spacing, typography } from '../../theme';
import type { AuthStackParamList } from '../../types/navigation';

type Navigation = NativeStackNavigationProp<AuthStackParamList, 'ChooseRole'>;

export function ChooseRoleScreen(): React.JSX.Element {
  const navigation = useNavigation<Navigation>();

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={typography.display}>How will you use{'\n'}CleanSwift?</Text>
        <Text style={styles.subtitle}>You can always apply to clean later, too.</Text>
      </View>

      <View style={styles.cards}>
        <RoleCard
          icon="home-outline"
          title="I need a cleaner"
          text="Book vetted cleaners for your home or office."
          onPress={() => navigation.navigate('SignUp', { role: 'CUSTOMER' })}
        />
        <RoleCard
          icon="briefcase-outline"
          title="I want cleaning work"
          text="Find jobs nearby, set your rates, and get paid."
          onPress={() => navigation.navigate('SignUp', { role: 'CLEANER' })}
        />
      </View>

      <View style={styles.footer}>
        <Button
          title="I already have an account"
          variant="ghost"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
    </Screen>
  );
}

interface RoleCardProps {
  icon: string;
  title: string;
  text: string;
  onPress: () => void;
}

function RoleCard({ icon, title, text, onPress }: RoleCardProps): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.cardIcon}>
        <Icon name={icon} size={26} color={colors.primary} />
      </View>
      <View style={styles.cardBody}>
        <Text style={typography.title}>{title}</Text>
        <Text style={styles.cardText}>{text}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color={colors.ink400} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.huge, paddingBottom: spacing.xxl },
  subtitle: {
    ...typography.bodyLg,
    color: colors.ink500,
    marginTop: spacing.md,
  },
  cards: { gap: spacing.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.ink200,
    padding: spacing.xl,
    ...shadows.card,
  },
  cardPressed: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: spacing.xxs },
  cardText: {
    ...typography.body,
    color: colors.ink500,
  },
  footer: { flex: 1, justifyContent: 'flex-end', paddingBottom: spacing.xl },
});

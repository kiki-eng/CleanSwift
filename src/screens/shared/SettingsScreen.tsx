import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, Icon, Screen } from '../../components';
import { env } from '../../config/env';
import { colors, spacing, typography } from '../../theme';

export function SettingsScreen(): React.JSX.Element {
  return (
    <Screen>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>
        <Card style={styles.row}>
          <Icon name="notifications-outline" size={20} />
          <Text style={styles.rowLabel}>Push notifications</Text>
          <Text style={typography.caption}>Coming soon</Text>
        </Card>
        <Card style={styles.row}>
          <Icon name="moon-outline" size={20} />
          <Text style={styles.rowLabel}>Dark mode</Text>
          <Text style={typography.caption}>Coming soon</Text>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Card style={styles.row}>
          <Icon name="code-slash-outline" size={20} />
          <Text style={styles.rowLabel}>Version</Text>
          <Text style={typography.caption}>1.0.0</Text>
        </Card>
        <Card style={styles.row}>
          <Icon name="server-outline" size={20} />
          <Text style={styles.rowLabel}>API</Text>
          <Text style={typography.caption} numberOfLines={1}>
            {env.API_BASE_URL.replace('https://', '')}
          </Text>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.xl, gap: spacing.md },
  sectionTitle: {
    ...typography.captionMedium,
    color: colors.ink500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowLabel: { ...typography.bodyLg, flex: 1 },
});

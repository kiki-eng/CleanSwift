import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '../theme';

interface ScreenProps {
  children: React.ReactNode;
  /** Scrollable content (default) vs fixed layout. */
  scroll?: boolean;
  padded?: boolean;
  /** Wrap content in a KeyboardAvoidingView — use on form screens. */
  keyboard?: boolean;
  style?: ViewStyle;
}

/** Safe-area screen wrapper used by every screen. */
export function Screen({
  children,
  scroll = true,
  padded = true,
  keyboard = false,
  style,
}: ScreenProps): React.JSX.Element {
  const contentStyle = [padded && styles.padded, style];

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.fixed, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {keyboard ? (
        <KeyboardAvoidingView
          style={styles.fixed}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1 },
  fixed: { flex: 1 },
  padded: { paddingHorizontal: spacing.xl },
});

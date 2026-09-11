import React, { useContext } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { HeaderHeightContext } from '@react-navigation/elements';

import { colors, spacing } from '../theme';

interface ScreenProps {
  children: React.ReactNode;
  /** Scrollable content (default) vs fixed layout. */
  scroll?: boolean;
  padded?: boolean;
  /** Wrap content in a KeyboardAvoidingView — use on form screens. */
  keyboard?: boolean;
  /**
   * Set true for screens hosted inside a bottom tab navigator. The tab bar
   * already reserves safe-area space below its own content, so a screen
   * living above it must NOT also pad for the home indicator — that would
   * double the gap. Every screen pushed on a stack (the vast majority)
   * should leave this false so bottom-pinned content clears the home
   * indicator / gesture bar correctly.
   */
  tabScreen?: boolean;
  style?: ViewStyle;
}

/** Safe-area + keyboard-aware screen wrapper used by every screen. */
export function Screen({
  children,
  scroll = true,
  padded = true,
  keyboard = false,
  tabScreen = false,
  style,
}: ScreenProps): React.JSX.Element {
  // Read the header height context directly (not useHeaderHeight(), which
  // throws outside a header-providing navigator — tab screens have no
  // such provider). Falls back to 0 when there's no header to offset for.
  const headerHeight = useContext(HeaderHeightContext) ?? 0;
  const combinedContentStyle = [padded && styles.padded, style];

  // On iOS, a scrollable keyboard screen uses the ScrollView's own native
  // keyboard-inset adjustment rather than KeyboardAvoidingView. That legacy
  // "auto-scroll the focused TextInput into view" behavior is unreliable
  // once the input is nested a few levels deep (as ours is, inside Input's
  // own wrapper views) — automaticallyAdjustKeyboardInsets hands the whole
  // job to UIScrollView itself, which measures the real first responder and
  // always gets it right. Android already resizes the window via
  // windowSoftInputMode="adjustResize" in the manifest, so no wrapper is
  // needed there either — stacking KeyboardAvoidingView on top of that is a
  // well-known source of double-compensated, jumpy insets on Android.
  const useNativeScrollInsets = keyboard && scroll && Platform.OS === 'ios';
  const useKeyboardAvoidingView = keyboard && !useNativeScrollInsets && Platform.OS === 'ios';

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, combinedContentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      automaticallyAdjustKeyboardInsets={useNativeScrollInsets}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.fixed, combinedContentStyle]}>{children}</View>
  );

  // A native header (when shown) already reserves the top safe-area inset
  // as part of its own height — adding it again here would double the gap
  // between the header and the content below it.
  const edges: Edge[] = [
    ...(headerHeight > 0 ? [] : (['top'] as Edge[])),
    'left' as Edge,
    'right' as Edge,
    ...(tabScreen ? [] : (['bottom'] as Edge[])),
  ];

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      {useKeyboardAvoidingView ? (
        <KeyboardAvoidingView style={styles.fixed} behavior="padding" keyboardVerticalOffset={headerHeight}>
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

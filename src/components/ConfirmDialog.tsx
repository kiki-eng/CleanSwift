import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { resolveConfirm, useConfirmStore } from '../store/confirmStore';
import { colors, radii, shadows, spacing, typography } from '../theme';
import { Button } from './Button';
import { Icon } from './Icon';

/**
 * Single app-wide confirm dialog. Mount once near the app root; screens
 * trigger it with `await confirmAction({ title, message, destructive })`
 * instead of the native Alert.alert, so destructive actions (log out,
 * delete, cancel) get a themed dialog consistent with the rest of the app.
 */
export function ConfirmDialogHost(): React.JSX.Element {
  const visible = useConfirmStore(state => state.visible);
  const options = useConfirmStore(state => state.options);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
      speed: 18,
      bounciness: 6,
    }).start();
  }, [visible, progress]);

  if (!options) {
    return <></>;
  }

  const {
    title,
    message,
    destructive = false,
    confirmLabel = destructive ? 'Confirm' : 'OK',
    cancelLabel = 'Cancel',
  } = options;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => resolveConfirm(false)}>
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={() => resolveConfirm(false)}
          accessibilityLabel="Dismiss"
        />
        <Animated.View
          style={[
            styles.card,
            {
              opacity: progress,
              transform: [
                {
                  scale: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            },
          ]}>
          <View style={[styles.iconCircle, destructive ? styles.iconCircleDanger : styles.iconCircleBrand]}>
            <Icon
              name={destructive ? 'alert-circle' : 'help-circle'}
              size={26}
              color={destructive ? colors.danger : colors.primary}
            />
          </View>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            <View style={styles.actionButton}>
              <Button title={cancelLabel} variant="secondary" onPress={() => resolveConfirm(false)} />
            </View>
            <View style={styles.actionButton}>
              <Button
                title={confirmLabel}
                variant={destructive ? 'danger' : 'primary'}
                onPress={() => resolveConfirm(true)}
              />
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    ...shadows.raised,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  iconCircleDanger: { backgroundColor: colors.dangerLight },
  iconCircleBrand: { backgroundColor: colors.primaryLight },
  title: { ...typography.titleLg, textAlign: 'center' },
  message: {
    ...typography.body,
    color: colors.ink500,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xxl,
    alignSelf: 'stretch',
  },
  actionButton: { flex: 1 },
});

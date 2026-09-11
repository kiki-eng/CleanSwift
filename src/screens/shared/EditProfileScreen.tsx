import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Avatar, Button, Icon, Input, Screen } from '../../components';
import { useImageUpload } from '../../features/upload/hooks';
import { useUpdateProfile } from '../../features/profile/hooks';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, typography } from '../../theme';
import { displayName } from '../../utils/format';

export function EditProfileScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const user = useAuthStore(state => state.user);
  const updateProfile = useUpdateProfile();
  const photoUpload = useImageUpload();

  const [firstName, setFirstName] = useState(user?.first_name ?? '');
  const [lastName, setLastName] = useState(user?.last_name ?? '');
  const [phone, setPhone] = useState(user?.phone_number ?? '');
  const [location, setLocation] = useState(user?.location ?? '');
  const [photoUrl, setPhotoUrl] = useState(user?.profile_photo_url ?? undefined);

  const canSubmit = firstName.trim().length > 0 && lastName.trim().length > 0;

  const handleChangePhoto = async (): Promise<void> => {
    const url = await photoUpload.pickImage();
    if (url) {
      setPhotoUrl(url);
    }
  };

  const handleSubmit = (): void => {
    updateProfile.mutate(
      {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phone.trim() || undefined,
        location: location.trim() || undefined,
        ...(photoUrl !== user?.profile_photo_url ? { profile_photo_url: photoUrl } : {}),
      },
      { onSuccess: () => navigation.goBack() },
    );
  };

  return (
    <Screen keyboard>
      <View style={styles.avatarBlock}>
        <Pressable
          onPress={handleChangePhoto}
          disabled={photoUpload.uploading}
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
          style={styles.avatarPressable}>
          <Avatar name={user ? displayName(user) : '?'} uri={photoUrl} size={80} />
          <View style={styles.avatarBadge}>
            {photoUpload.uploading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Icon name="camera" size={16} color={colors.white} />
            )}
          </View>
        </Pressable>
        <Text style={styles.avatarHint}>Tap to change photo</Text>
        {photoUpload.error ? <Text style={styles.error}>{photoUpload.error}</Text> : null}
      </View>

      <View style={styles.nameRow}>
        <View style={styles.nameField}>
          <Input label="First name" value={firstName} onChangeText={setFirstName} />
        </View>
        <View style={styles.nameField}>
          <Input label="Last name" value={lastName} onChangeText={setLastName} />
        </View>
      </View>
      <Input
        label="Phone"
        icon="call-outline"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="+234 801 234 5678"
      />
      <Input
        label="City"
        icon="location-outline"
        value={location}
        onChangeText={setLocation}
        placeholder="Lagos"
      />

      {updateProfile.isError ? (
        <Text style={styles.error}>{updateProfile.error.message}</Text>
      ) : null}

      <Button
        title="Save Changes"
        onPress={handleSubmit}
        disabled={!canSubmit}
        loading={updateProfile.isPending}
        style={styles.submit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarBlock: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  avatarPressable: { position: 'relative' },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  avatarHint: { ...typography.caption, color: colors.ink500 },
  nameRow: { flexDirection: 'row', gap: spacing.md },
  nameField: { flex: 1 },
  error: {
    ...typography.body,
    color: colors.danger,
    marginBottom: spacing.lg,
  },
  submit: { marginTop: spacing.sm },
});

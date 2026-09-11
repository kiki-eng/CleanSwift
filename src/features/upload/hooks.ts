import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import {
  Asset,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';

import { uploadFile } from '../../api/client';
import { endpoints } from '../../api/endpoints';

/**
 * Pick a photo (camera or library) and upload it to the backend's general
 * file store, returning the public URL to save on the record (profile
 * photo, listing image, request image, etc).
 */
export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const uploadAsset = useCallback(async (asset: Asset): Promise<string | undefined> => {
    if (!asset.uri) {
      return undefined;
    }
    setUploading(true);
    setError(undefined);
    try {
      const { url } = await uploadFile(endpoints.files.generalUpload, {
        uri: asset.uri,
        name: asset.fileName ?? `upload-${Date.now()}.jpg`,
        type: asset.type ?? 'image/jpeg',
      });
      return url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed — please try again.');
      return undefined;
    } finally {
      setUploading(false);
    }
  }, []);

  const fromLibrary = useCallback(async (): Promise<string | undefined> => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 1 });
    if (result.didCancel || !result.assets?.[0]) {
      return undefined;
    }
    if (result.errorCode) {
      setError(result.errorMessage ?? 'Could not open your photo library.');
      return undefined;
    }
    return uploadAsset(result.assets[0]);
  }, [uploadAsset]);

  const fromCamera = useCallback(async (): Promise<string | undefined> => {
    const result = await launchCamera({ mediaType: 'photo', quality: 0.8, saveToPhotos: false });
    if (result.didCancel || !result.assets?.[0]) {
      return undefined;
    }
    if (result.errorCode) {
      setError(result.errorMessage ?? 'Could not open the camera.');
      return undefined;
    }
    return uploadAsset(result.assets[0]);
  }, [uploadAsset]);

  /** Shows a source picker, then uploads. Resolves the URL, or undefined if cancelled/failed. */
  const pickImage = useCallback((): Promise<string | undefined> => {
    return new Promise(resolve => {
      Alert.alert('Add a photo', undefined, [
        { text: 'Take Photo', onPress: () => fromCamera().then(resolve) },
        { text: 'Choose from Library', onPress: () => fromLibrary().then(resolve) },
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(undefined) },
      ]);
    });
  }, [fromCamera, fromLibrary]);

  return { pickImage, uploading, error, clearError: () => setError(undefined) };
}

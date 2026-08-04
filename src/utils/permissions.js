import { PermissionsAndroid, Platform, NativeModules } from 'react-native';
import { getStoredUsagePermission, setStoredUsagePermission } from './storage';

const { UsageStatsModule } = NativeModules;

export const checkNativeUsagePermission = async () => {
  if (Platform.OS !== 'android') return true;
  try {
    if (UsageStatsModule && typeof UsageStatsModule.isUsagePermissionGranted === 'function') {
      const isGranted = await UsageStatsModule.isUsagePermissionGranted();
      await setStoredUsagePermission(isGranted);
      return isGranted;
    }
  } catch (err) {
    console.warn('Native usage check failed, falling back to storage:', err);
  }
  return await getStoredUsagePermission();
};

/**
 * Checks all required permissions on Android
 * @returns {Promise<{isAllGranted: boolean, permissions: {storage: boolean, camera: boolean, microphone: boolean, usage: boolean}}>}
 */
export const checkAllPermissions = async () => {
  if (Platform.OS !== 'android') {
    return {
      isAllGranted: true,
      permissions: { storage: true, camera: true, microphone: true, usage: true },
    };
  }

  try {
    // 1. Storage Permission Verification
    let isStorageGranted = false;
    if (Platform.Version >= 33) {
      const hasImages = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
      const hasVideo = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO);
      isStorageGranted = hasImages || hasVideo;
    } else {
      isStorageGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
    }

    // 2. Camera Permission Verification
    const isCameraGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);

    // 3. Microphone Permission Verification
    const isMicrophoneGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);

    // 4. Usage Access Verification
    const isUsageGranted = await checkNativeUsagePermission();

    const permissions = {
      storage: isStorageGranted,
      camera: isCameraGranted,
      microphone: isMicrophoneGranted,
      usage: isUsageGranted,
    };

    const isAllGranted = isStorageGranted && isCameraGranted && isMicrophoneGranted && isUsageGranted;

    return { isAllGranted, permissions };
  } catch (err) {
    console.warn('Error during checkAllPermissions:', err);
    return {
      isAllGranted: false,
      permissions: { storage: false, camera: false, microphone: false, usage: false },
    };
  }
};

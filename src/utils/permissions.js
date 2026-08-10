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
 * Checks required app permissions on Android (Usage Access)
 * @returns {Promise<{isAllGranted: boolean, permissions: {usage: boolean}}>}
 */
export const checkAllPermissions = async () => {
  if (Platform.OS !== 'android') {
    return {
      isAllGranted: true,
      permissions: { usage: true },
    };
  }

  try {
    const isUsageGranted = await checkNativeUsagePermission();

    const permissions = {
      usage: isUsageGranted,
    };

    return { isAllGranted: isUsageGranted, permissions };
  } catch (err) {
    console.warn('Error during checkAllPermissions:', err);
    return {
      isAllGranted: false,
      permissions: { usage: false },
    };
  }
};

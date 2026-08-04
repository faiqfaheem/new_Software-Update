import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEYS = {
  LANGUAGE: '@user_language',
  PERMISSIONS_GRANTED: '@has_granted_permissions',
  ONBOARDING_COMPLETED: '@has_completed_onboarding',
};

/**
 * Get selected language from AsyncStorage
 */
export const getStoredLanguage = async () => {
  try {
    return await AsyncStorage.getItem(KEYS.LANGUAGE);
  } catch (e) {
    console.error('Error reading stored language:', e);
    return null;
  }
};

/**
 * Save selected language to AsyncStorage
 */
export const setStoredLanguage = async (languageCode) => {
  try {
    await AsyncStorage.setItem(KEYS.LANGUAGE, languageCode);
  } catch (e) {
    console.error('Error saving language:', e);
  }
};

/**
 * Get permissions granted status from AsyncStorage
 */
export const getPermissionsSavedStatus = async () => {
  try {
    const value = await AsyncStorage.getItem(KEYS.PERMISSIONS_GRANTED);
    return value === 'true';
  } catch (e) {
    console.error('Error reading permissions saved status:', e);
    return false;
  }
};

/**
 * Save permissions granted status to AsyncStorage
 */
export const setPermissionsSavedStatus = async (granted) => {
  try {
    await AsyncStorage.setItem(KEYS.PERMISSIONS_GRANTED, granted ? 'true' : 'false');
  } catch (e) {
    console.error('Error saving permissions status:', e);
  }
};

/**
 * Get onboarding status from AsyncStorage
 */
export const getOnboardingStatus = async () => {
  try {
    const value = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETED);
    return value === 'true';
  } catch (e) {
    console.error('Error reading onboarding status:', e);
    return false;
  }
};

/**
 * Save onboarding completion status
 */
export const setOnboardingStatus = async (completed) => {
  try {
    await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETED, completed ? 'true' : 'false');
  } catch (e) {
    console.error('Error saving onboarding status:', e);
  }
};

/**
 * Reset all stored preferences (Language, Permissions & Onboarding)
 */
export const clearAppPreferences = async () => {
  try {
    await AsyncStorage.multiRemove([
      KEYS.LANGUAGE,
      KEYS.PERMISSIONS_GRANTED,
      KEYS.ONBOARDING_COMPLETED,
    ]);
  } catch (e) {
    console.error('Error clearing preferences:', e);
  }
};

import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEYS = {
  LANGUAGE: '@user_language',
  FIRST_LAUNCH_COMPLETED: 'isFirstLaunchCompleted',
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
 * Get first launch completed status from AsyncStorage
 */
export const getFirstLaunchCompleted = async () => {
  try {
    const value = await AsyncStorage.getItem(KEYS.FIRST_LAUNCH_COMPLETED);
    return value === 'true';
  } catch (e) {
    console.error('Error reading first launch completed status:', e);
    return false;
  }
};

/**
 * Save first launch completed status to AsyncStorage
 */
export const setFirstLaunchCompleted = async (completed) => {
  try {
    await AsyncStorage.setItem(KEYS.FIRST_LAUNCH_COMPLETED, completed ? 'true' : 'false');
  } catch (e) {
    console.error('Error saving first launch completed status:', e);
  }
};

/**
 * Reset all stored app preferences
 */
export const clearAppPreferences = async () => {
  try {
    await AsyncStorage.multiRemove([
      KEYS.LANGUAGE,
      KEYS.FIRST_LAUNCH_COMPLETED,
    ]);
  } catch (e) {
    console.error('Error clearing preferences:', e);
  }
};

import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEYS = {
  LANGUAGE: '@user_language',
  FIRST_LAUNCH_COMPLETED: 'isFirstLaunchCompleted',
  USAGE_PERMISSION_GRANTED: '@usage_permission_granted',
  SENSOR_TEST_RESULTS: '@sensor_test_results',
};

/**
 * Get stored sensor test results
 */
export const getStoredTestResults = async () => {
  try {
    const value = await AsyncStorage.getItem(KEYS.SENSOR_TEST_RESULTS);
    return value ? JSON.parse(value) : {};
  } catch (e) {
    console.error('Error reading sensor test results:', e);
    return {};
  }
};

/**
 * Save stored sensor test result (result = 'pass' | 'fail')
 */
export const setStoredTestResult = async (testId, result) => {
  try {
    const current = await getStoredTestResults();
    current[testId] = result;
    await AsyncStorage.setItem(KEYS.SENSOR_TEST_RESULTS, JSON.stringify(current));
  } catch (e) {
    console.error('Error saving sensor test result:', e);
  }
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
 * Get stored usage permission status
 */
export const getStoredUsagePermission = async () => {
  try {
    const value = await AsyncStorage.getItem(KEYS.USAGE_PERMISSION_GRANTED);
    return value === 'true';
  } catch (e) {
    console.error('Error reading usage permission state:', e);
    return false;
  }
};

/**
 * Save stored usage permission status
 */
export const setStoredUsagePermission = async (granted) => {
  try {
    await AsyncStorage.setItem(KEYS.USAGE_PERMISSION_GRANTED, granted ? 'true' : 'false');
  } catch (e) {
    console.error('Error saving usage permission state:', e);
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
      KEYS.USAGE_PERMISSION_GRANTED,
    ]);
  } catch (e) {
    console.error('Error clearing preferences:', e);
  }
};

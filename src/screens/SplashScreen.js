import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import {
  getStoredLanguage,
  getPermissionsSavedStatus,
  getOnboardingStatus,
} from '../utils/storage';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      // 1. Check Selected Language
      const language = await getStoredLanguage();
      if (!language) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'LanguageScreen' }],
        });
        return;
      }

      // 2. Check Permissions Status (If already granted once, skip PermissionScreen)
      const hasGrantedPermissions = await getPermissionsSavedStatus();
      if (!hasGrantedPermissions) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'PermissionScreen' }],
        });
        return;
      }

      // 3. Check Onboarding Status
      const hasCompletedOnboarding = await getOnboardingStatus();
      if (!hasCompletedOnboarding) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'OnboardingScreen' }],
        });
        return;
      }

      // 4. All set -> Navigate directly to HomeScreen
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeScreen' }],
      });
    } catch (error) {
      console.error('Error during app initialization:', error);
      navigation.reset({
        index: 0,
        routes: [{ name: 'LanguageScreen' }],
      });
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Loading App...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#333333',
  },
});

export default SplashScreen;

import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { getFirstLaunchCompleted } from '../utils/storage';
import { checkAllPermissions } from '../utils/permissions';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    checkAppLaunchState();
  }, []);

  const checkAppLaunchState = async () => {
    const startTime = Date.now();
    try {
      const isFirstLaunchCompleted = await getFirstLaunchCompleted();
      const { isAllGranted } = await checkAllPermissions();

      // Ensure minimum display duration of 2.5 seconds (2500ms)
      const elapsedTime = Date.now() - startTime;
      const MIN_SPLASH_DURATION = 2500;
      if (elapsedTime < MIN_SPLASH_DURATION) {
        await new Promise((resolve) => setTimeout(resolve, MIN_SPLASH_DURATION - elapsedTime));
      }

      if (!isFirstLaunchCompleted) {
        // First Time User: LanguageScreen -> OnboardingScreen -> PermissionScreen
        navigation.reset({
          index: 0,
          routes: [{ name: 'LanguageScreen' }],
        });
      } else if (isAllGranted) {
        // Returning User with ALL permissions granted -> Direct to HomeScreen (Background check complete)
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeScreen' }],
        });
      } else {
        // Returning User with MISSING permissions -> Direct to PermissionScreen to grant
        navigation.reset({
          index: 0,
          routes: [{ name: 'PermissionScreen' }],
        });
      }
    } catch (error) {
      console.error('Error checking launch state:', error);
      navigation.reset({
        index: 0,
        routes: [{ name: 'LanguageScreen' }],
      });
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4C82F6" />
      <Text style={styles.loadingText}>Initializing App...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F1424',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#94A3B8',
  },
});

export default SplashScreen;

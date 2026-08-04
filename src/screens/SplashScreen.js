import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { getFirstLaunchCompleted } from '../utils/storage';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    checkAppLaunchState();
  }, []);

  const checkAppLaunchState = async () => {
    try {
      const isFirstLaunchCompleted = await getFirstLaunchCompleted();

      if (!isFirstLaunchCompleted) {
        // First Time User: LanguageScreen -> OnboardingScreen -> PermissionScreen
        navigation.reset({
          index: 0,
          routes: [{ name: 'LanguageScreen' }],
        });
      } else {
        // Returning User: Direct to PermissionScreen for live status verification
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

import { SvgXml } from 'react-native-svg';
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { getFirstLaunchCompleted } from '../utils/storage';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    checkAppLaunchState();
  }, []);

  const checkAppLaunchState = async () => {
    const startTime = Date.now();
    try {
      const isFirstLaunchCompleted = await getFirstLaunchCompleted();

      // Ensure minimum display duration of 2.5 seconds (2500ms)
      const elapsedTime = Date.now() - startTime;
      const MIN_SPLASH_DURATION = 2500;
      if (elapsedTime < MIN_SPLASH_DURATION) {
        await new Promise((resolve) => setTimeout(resolve, MIN_SPLASH_DURATION - elapsedTime));
      }

      if (!isFirstLaunchCompleted) {
        // First Time User: LanguageScreen -> OnboardingScreen -> HomeScreen
        navigation.reset({
          index: 0,
          routes: [{ name: 'LanguageScreen' }],
        });
      } else {
        // Returning User -> Direct to HomeScreen
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeScreen' }],
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
      <ActivityIndicator size="large" color="#ADC6FF" />

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

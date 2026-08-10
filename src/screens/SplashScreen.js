import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  StatusBar,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { getFirstLaunchCompleted } from '../utils/storage';

const { width } = Dimensions.get('window');
const SCAN_APPS_ICON = require('../assets/scan_apps_icon.png');

const SplashScreen = ({ navigation }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Smooth animated moving progress indicator from 0% to 100%
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false,
    }).start();

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

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1326" />

      {/* Center Branding Container */}
      <View style={styles.centerContainer}>
        <View style={styles.logoGlowBackdrop}>
          <View style={styles.logoSquare}>
            <Image source={SCAN_APPS_ICON} style={styles.logoImage} resizeMode="contain" />
          </View>
        </View>

        <Text style={styles.appTitle}>Software Update</Text>
        <Text style={styles.appSubTitle}>Phone Update & System Tools</Text>
      </View>

      {/* Bottom Moving Animated Progress Indicator */}
      <View style={styles.bottomContainer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressWidth,
              },
            ]}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1326',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoGlowBackdrop: {
    borderRadius: 30,
    backgroundColor: '#6695FF',
    shadowColor: '#6695FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 20,
    elevation: 15,
  },
  logoSquare: {
    width: 100,
    height: 100,
    borderRadius: 26,
    backgroundColor: '#121B2E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#6695FF',
  },
  logoImage: {
    width: 52,
    height: 52,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#DAE2FD',
    fontFamily: 'Gilroy-Bold',
    marginTop: 24,
    letterSpacing: 0.5,
  },
  appSubTitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 6,
    fontWeight: '500',
  },
  bottomContainer: {
    paddingBottom: 60,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  progressTrack: {
    width: width * 0.72,
    height: 6,
    backgroundColor: 'rgba(102, 149, 255, 0.18)',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6695FF',
    borderRadius: 4,
    shadowColor: '#6695FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.85,
    shadowRadius: 10,
    elevation: 8,
  },
});

export default SplashScreen;

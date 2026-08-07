import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Linking,
  NativeModules,
  Image,
} from 'react-native';

const PASS_ICON = require('../assets/test_pass_icon.png');
const FAIL_ICON = require('../assets/test_fail_icon.png');
const HERO_ICON = require('../assets/test_screen_flashlight.png');

const WhitePlaceholder = ({ size = 22, borderRadius = 4, color = '#FFFFFF' }) => (
  <View
    style={{
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: borderRadius,
    }}
  />
);

const BACK_ARROW_ICON = require('../assets/back_arrow_icon.png');

const BackArrow = ({ size = 20 }) => (
  <Image source={BACK_ARROW_ICON} style={{ width: size, height: size }} resizeMode="contain" />
);

const FlashlightTestScreen = ({ navigation }) => {
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);

  useEffect(() => {
    // Cleanup flashlight state on unmount
    return () => {
      if (NativeModules.FlashlightModule && NativeModules.FlashlightModule.setTorchMode) {
        NativeModules.FlashlightModule.setTorchMode(false).catch(() => {});
      }
    };
  }, []);

  const handleToggleFlashlight = (status) => {
    setIsFlashlightOn(status);
    if (NativeModules.FlashlightModule && NativeModules.FlashlightModule.setTorchMode) {
      NativeModules.FlashlightModule.setTorchMode(status).catch((err) => {
        console.warn('Flashlight hardware control error:', err);
      });
    }
  };

  const handleSettingsPress = () => {
    navigation.navigate('SettingsScreen');
  };

  const handleBack = () => {
    if (NativeModules.FlashlightModule && NativeModules.FlashlightModule.setTorchMode) {
      NativeModules.FlashlightModule.setTorchMode(false).catch(() => {});
    }
    navigation.goBack();
  };

  const handleResultPress = (passed) => {
    if (NativeModules.FlashlightModule && NativeModules.FlashlightModule.setTorchMode) {
      NativeModules.FlashlightModule.setTorchMode(false).catch(() => {});
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <BackArrow size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Flash Light Test</Text>
        </View>
      </View>

      {/* Main Content Body */}
      <View style={styles.container}>
        {/* Top Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.placeholderContainer}>
            <Image source={HERO_ICON} style={{ width: 80, height: 80 }} resizeMode="contain" />
          </View>

          <Text style={styles.instructionText}>
            Tap to turn the flashlight ON/OFF.
          </Text>

          <Text style={styles.sectionTitle}>
            Flashlight Functionality
          </Text>

          {/* Toggle Buttons Row (ON / OFF) */}
          <View style={styles.toggleRow}>
            {/* ON Button */}
            <TouchableOpacity
              style={[styles.togglePill, isFlashlightOn ? styles.onPillActive : styles.onPillInactive]}
              onPress={() => handleToggleFlashlight(true)}
            >
              <View style={styles.dotContainer}>
                <WhitePlaceholder size={10} borderRadius={5} color={isFlashlightOn ? '#FFFFFF' : '#84CC16'} />
              </View>
              <Text style={[styles.toggleText, isFlashlightOn ? styles.toggleTextActive : styles.toggleTextInactive]}>
                ON
              </Text>
            </TouchableOpacity>

            {/* OFF Button */}
            <TouchableOpacity
              style={[styles.togglePill, !isFlashlightOn ? styles.offPillActive : styles.offPillInactive]}
              onPress={() => handleToggleFlashlight(false)}
            >
              <View style={styles.dotContainer}>
                <WhitePlaceholder size={10} borderRadius={5} color={!isFlashlightOn ? '#FFFFFF' : '#EF4444'} />
              </View>
              <Text style={[styles.toggleText, !isFlashlightOn ? styles.toggleTextActive : styles.toggleTextInactive]}>
                OFF
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Question & Feedback Buttons (Moved Up & Solid White Placeholder Circles) */}
        <View style={styles.bottomFeedbackSection}>
          <Text style={styles.questionText}>Is the flashlight working?</Text>

          <View style={styles.feedbackButtonsRow}>
            {/* Pass Icon Button */}
            <TouchableOpacity
              style={styles.circlePlaceholderButton}
              onPress={() => handleResultPress(true)}
            >
              <Image source={PASS_ICON} style={{ width: 60, height: 60 }} resizeMode="contain" />
            </TouchableOpacity>

            {/* Fail Icon Button */}
            <TouchableOpacity
              style={styles.circlePlaceholderButton}
              onPress={() => handleResultPress(false)}
            >
              <Image source={FAIL_ICON} style={{ width: 60, height: 60 }} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#0B1120',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 6,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  settingsButton: {
    padding: 6,
  },
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
    paddingTop: 28,
  },
  heroSection: {
    alignItems: 'center',
  },
  placeholderContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionText: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  togglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    minWidth: 110,
    marginHorizontal: 8,
  },
  onPillActive: {
    backgroundColor: '#3B82F6',
  },
  onPillInactive: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  offPillActive: {
    backgroundColor: '#D4D4D8',
  },
  offPillInactive: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  dotContainer: {
    marginRight: 8,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  toggleTextInactive: {
    color: '#94A3B8',
  },
  bottomFeedbackSection: {
    alignItems: 'center',
    marginTop: 36,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  feedbackButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circlePlaceholderButton: {
    marginHorizontal: 16,
  },
});

export default FlashlightTestScreen;

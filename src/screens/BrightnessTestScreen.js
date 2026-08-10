import { SvgXml } from 'react-native-svg';
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
const HERO_ICON = require('../assets/test_screen_brightness.png');

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

const BACK_ARROW_SVG = `<svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21.4142 9.70703H1.41422M10.4142 18.707L1.41422 9.70703L10.4142 0.707031" stroke="#DAE2FD" stroke-width="2"/>
</svg>`;

const BackArrow = ({ size = 20 }) => (
  <SvgXml xml={BACK_ARROW_SVG} width={size} height={Math.round(size * (20 / 22))} />
);

const BrightnessTestScreen = ({ navigation }) => {
  const [brightnessLevel, setBrightnessLevel] = useState('max'); // 'min' | 'max'

  useEffect(() => {
    // Start at max brightness by default
    applyBrightness('max');

    return () => {
      // Restore system default brightness on screen exit
      if (NativeModules.BrightnessModule && NativeModules.BrightnessModule.restoreSystemBrightness) {
        NativeModules.BrightnessModule.restoreSystemBrightness().catch(() => {});
      }
    };
  }, []);

  const applyBrightness = (level) => {
    setBrightnessLevel(level);
    if (NativeModules.BrightnessModule && NativeModules.BrightnessModule.setScreenBrightness) {
      const val = level === 'min' ? 0.05 : 1.0;
      NativeModules.BrightnessModule.setScreenBrightness(val).catch(() => {});
    }
  };

  const handleSettingsPress = () => {
    navigation.navigate('SettingsScreen');
  };

  const handleResultPress = (passed) => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <BackArrow size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Brightness Test</Text>
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
            Test physical brightness control of your screen.
          </Text>

          <Text style={styles.sectionTitle}>
            Screen Brightness Mode
          </Text>

          {/* Real-time Hardware Brightness Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                brightnessLevel === 'min' ? styles.modeButtonActive : styles.modeButtonInactive,
              ]}
              onPress={() => applyBrightness('min')}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  brightnessLevel === 'min' ? styles.modeTextActive : styles.modeTextInactive,
                ]}
              >
                Minimum (Dim)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                brightnessLevel === 'max' ? styles.modeButtonActive : styles.modeButtonInactive,
              ]}
              onPress={() => applyBrightness('max')}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  brightnessLevel === 'max' ? styles.modeTextActive : styles.modeTextInactive,
                ]}
              >
                Maximum (Bright)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Question & Feedback Buttons (Consistent Template) */}
        <View style={styles.bottomFeedbackSection}>
          <Text style={styles.questionText}>Is the brightness working?</Text>

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
    fontSize: 24,
    fontFamily: 'Gilroy-Bold',
    fontWeight: 'bold',
    color: '#DAE2FD',
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
    width: '100%',
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
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DAE2FD',
    marginBottom: 20,
    textAlign: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  modeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 22,
    marginHorizontal: 8,
    borderWidth: 1,
  },
  modeButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  modeButtonInactive: {
    backgroundColor: '#131C31',
    borderColor: '#1E293B',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modeTextActive: {
    color: '#FFFFFF',
  },
  modeTextInactive: {
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

export default BrightnessTestScreen;

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
} from 'react-native';

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

const BackArrow = ({ color = '#FFFFFF', size = 22 }) => (
  <Text style={{ color, fontSize: size, fontWeight: 'bold' }}>←</Text>
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
            <WhitePlaceholder size={70} borderRadius={16} color="#FFFFFF" />
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
            {/* Pass White Circle Placeholder Button */}
            <TouchableOpacity
              style={styles.circlePlaceholderButton}
              onPress={() => handleResultPress(true)}
            >
              <WhitePlaceholder size={60} borderRadius={30} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Fail White Circle Placeholder Button */}
            <TouchableOpacity
              style={styles.circlePlaceholderButton}
              onPress={() => handleResultPress(false)}
            >
              <WhitePlaceholder size={60} borderRadius={30} color="#FFFFFF" />
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
    color: '#FFFFFF',
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
    borderColor: '#60A5FA',
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

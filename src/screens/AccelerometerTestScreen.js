import { SvgXml } from 'react-native-svg';
import React, { useState, useEffect } from 'react';
import { setStoredTestResult } from '../utils/storage';
import { useLanguage } from '../i18n/LanguageContext';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Linking,
  Modal,
  NativeModules,
  DeviceEventEmitter,
  Image,
} from 'react-native';

const PASS_ICON = require('../assets/test_pass_icon.png');
const FAIL_ICON = require('../assets/test_fail_icon.png');
const HERO_ICON = require('../assets/test_screen_accelerometer.png');

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

const AccelerometerTestScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const [isTestModalActive, setIsTestModalActive] = useState(false);
  const [bubblePos, setBubblePos] = useState({ x: 0, y: 0 });
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [isLevelAligned, setIsLevelAligned] = useState(true);

  // Listen to physical device Hardware Accelerometer Sensor
  useEffect(() => {
    let subscription;
    if (isTestModalActive) {
      if (NativeModules.AccelerometerModule && NativeModules.AccelerometerModule.startListening) {
        NativeModules.AccelerometerModule.startListening().catch(() => {});
        subscription = DeviceEventEmitter.addListener('AccelerometerData', (data) => {
          const { x, y, z } = data;
          if (x !== undefined && y !== undefined && z !== undefined) {
            // Calculate real-time pitch and roll angles from hardware acceleration
            const pitchDeg = Math.round(Math.atan2(y, z) * (180 / Math.PI));
            const rollDeg = Math.round(Math.atan2(-x, Math.sqrt(y * y + z * z)) * (180 / Math.PI));

            setPitch(pitchDeg);
            setRoll(rollDeg);

            // Translate hardware tilt angles to bubble offset
            const offsetX = Math.max(-65, Math.min(65, rollDeg * 2.5));
            const offsetY = Math.max(-65, Math.min(65, pitchDeg * 2.5));
            setBubblePos({ x: offsetX, y: offsetY });

            if (Math.abs(offsetX) < 18 && Math.abs(offsetY) < 18) {
              setIsLevelAligned(true);
            } else {
              setIsLevelAligned(false);
            }
          }
        });
      }
    }
    return () => {
      if (subscription) subscription.remove();
      if (NativeModules.AccelerometerModule && NativeModules.AccelerometerModule.stopListening) {
        NativeModules.AccelerometerModule.stopListening().catch(() => {});
      }
    };
  }, [isTestModalActive]);

  const handleStartTest = () => {
    setPitch(0);
    setRoll(0);
    setBubblePos({ x: 0, y: 0 });
    setIsLevelAligned(true);
    setIsTestModalActive(true);
  };



  const handleSettingsPress = () => {
    navigation.navigate('SettingsScreen');
  };

  const handleResultPress = async (passed) => {
    await setStoredTestResult('5', passed ? 'pass' : 'fail');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      {/* Authentic Physical Device Hardware Accelerometer Diagnostic Modal */}
      <Modal
        visible={isTestModalActive}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setIsTestModalActive(false)}
      >
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        <View style={styles.modalContainer}>
          {/* Top Controls Header */}
          <View style={styles.modalHeaderFloating}>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setIsTestModalActive(false)}
            >
              <Text style={styles.closeModalText}>✕ Exit Test</Text>
            </TouchableOpacity>

            <View style={[styles.sensorStatusBadge, isLevelAligned && styles.sensorStatusBadgeAligned]}>
              <Text style={styles.sensorStatusText}>
                {isLevelAligned ? '✓ HARDWARE SENSOR LEVEL' : 'HARDWARE MOTION ACTIVE'}
              </Text>
            </View>
          </View>

          <Text style={styles.modalTitleInstruction}>
            Physically tilt or move your mobile phone to test hardware motion sensor
          </Text>

          {/* Central 3D Spirit Level Circle Target Area */}
          <View style={styles.spiritLevelOuterRing}>
            <View style={styles.spiritLevelInnerTarget} />
            <View style={styles.crosshairH} />
            <View style={styles.crosshairV} />

            {/* Rolling Spirit Level Bubble */}
            <View
              style={[
                styles.rollingBubble,
                isLevelAligned ? styles.bubbleAligned : styles.bubbleTilting,
                {
                  transform: [
                    { translateX: bubblePos.x },
                    { translateY: bubblePos.y },
                  ],
                },
              ]}
            >
              <View style={styles.bubbleInnerGlow} />
            </View>
          </View>

          {/* Telemetry Sensor Data HUD */}
          <View style={styles.telemetryHudContainer}>
            <View style={styles.telemetryCard}>
              <Text style={styles.telemetryLabel}>PITCH (TILT FWD/BWD)</Text>
              <Text style={styles.telemetryValue}>{pitch > 0 ? `+${pitch}°` : `${pitch}°`}</Text>
            </View>

            <View style={styles.telemetryCard}>
              <Text style={styles.telemetryLabel}>ROLL (TILT LEFT/RIGHT)</Text>
              <Text style={styles.telemetryValue}>{roll > 0 ? `+${roll}°` : `${roll}°`}</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <BackArrow size={15} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('accelTestTitle')}</Text>
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
            {t('accelInstruction')}
          </Text>

          <TouchableOpacity style={styles.startTestButton} onPress={handleStartTest}>
            <Text style={styles.startTestButtonText}>{t('startAccelTest')}</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Question & Feedback Buttons (Consistent Template) */}
        <View style={styles.bottomFeedbackSection}>
          <Text style={styles.questionText}>{t('isAccelWorking')}</Text>

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
    marginTop: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
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
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  startTestButton: {
    width: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startTestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  // Spirit Level Accelerometer Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop: 45,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  modalHeaderFloating: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeModalButton: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  closeModalText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  sensorStatusBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sensorStatusBadgeAligned: {
    backgroundColor: '#10B981',
  },
  sensorStatusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  modalTitleInstruction: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  spiritLevelOuterRing: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#131C31',
    borderWidth: 4,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  spiritLevelInnerTarget: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    borderStyle: 'dashed',
    position: 'absolute',
  },
  crosshairH: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.25)',
  },
  crosshairV: {
    position: 'absolute',
    height: '100%',
    width: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.25)',
  },
  rollingBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  bubbleTilting: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
  },
  bubbleAligned: {
    backgroundColor: '#22C55E',
    shadowColor: '#22C55E',
  },
  bubbleInnerGlow: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  telemetryHudContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 18,
  },
  telemetryCard: {
    flex: 1,
    backgroundColor: '#131C31',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  telemetryLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94A3B8',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  telemetryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#60A5FA',
  },
  manualTiltMatrix: {
    alignItems: 'center',
    width: '100%',
  },
  manualTiltMiddleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  tiltPill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tiltPillCenter: {
    backgroundColor: '#3B82F6',
    borderColor: '#60A5FA',
  },
  tiltPillText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tiltPillTextCenter: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default AccelerometerTestScreen;

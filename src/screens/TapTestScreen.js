import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Linking,
  Modal,
  Image,
} from 'react-native';

const PASS_ICON = require('../assets/test_pass_icon.png');
const FAIL_ICON = require('../assets/test_fail_icon.png');
const HERO_ICON = require('../assets/test_screen_tap.png');

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

const TapTestScreen = ({ navigation }) => {
  const [isFullscreenTapActive, setIsFullscreenTapActive] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [ripples, setRipples] = useState([]);

  const handleStartTapTest = () => {
    setIsFullscreenTapActive(true);
  };

  const handleCanvasTap = (event) => {
    const { pageX, pageY } = event.nativeEvent;
    setTapCount((prev) => prev + 1);

    // Use pageX and pageY so ripples render at exact global screen coordinates
    const newRipple = {
      id: Date.now() + Math.random(),
      x: pageX,
      y: pageY,
    };
    setRipples((prev) => [...prev.slice(-6), newRipple]);
  };

  const handleCloseCanvas = () => {
    setIsFullscreenTapActive(false);
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

      {/* Full-Screen White Blank Canvas Tap Test Modal */}
      <Modal
        visible={isFullscreenTapActive}
        transparent={false}
        animationType="fade"
        onRequestClose={handleCloseCanvas}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <TouchableOpacity
          style={styles.whiteCanvasOverlay}
          activeOpacity={1}
          onPress={handleCanvasTap}
        >
          {/* Top Floating Controls */}
          <View style={styles.canvasHeaderFloating} pointerEvents="box-none">
            <TouchableOpacity
              style={styles.closeCanvasButton}
              onPress={(e) => {
                e.stopPropagation();
                handleCloseCanvas();
              }}
            >
              <Text style={styles.closeCanvasText}>✕ Exit Test</Text>
            </TouchableOpacity>

            <View style={styles.canvasTapCountBadge} pointerEvents="none">
              <Text style={styles.canvasTapCountText}>Taps: {tapCount}</Text>
            </View>
          </View>

          {/* Touch Ripples on White Screen */}
          {ripples.map((ripple) => (
            <View
              key={ripple.id}
              pointerEvents="none"
              style={[
                styles.whiteCanvasRipple,
                { left: ripple.x - 25, top: ripple.y - 25 },
              ]}
            />
          ))}

          {tapCount === 0 && (
            <View style={styles.canvasInstructionBadge} pointerEvents="none">
              <Text style={styles.canvasInstructionText}>
                Tap anywhere on the screen to test touch
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Modal>

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <BackArrow size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tap Test</Text>
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
            Tap to check the screen touch.
          </Text>

          <TouchableOpacity style={styles.startTestButton} onPress={handleStartTapTest}>
            <Text style={styles.startTestButtonText}>Start Tap Test</Text>
          </TouchableOpacity>

          {tapCount > 0 && (
            <View style={styles.tapsRecordedBadge}>
              <Text style={styles.tapsRecordedText}>Recorded Taps: {tapCount}</Text>
            </View>
          )}
        </View>

        {/* Bottom Question & Feedback Buttons (Same exact position & white placeholder circles) */}
        <View style={styles.bottomFeedbackSection}>
          <Text style={styles.questionText}>Is the tap sensor working?</Text>

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
  tapsRecordedBadge: {
    marginTop: 16,
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  tapsRecordedText: {
    color: '#3B82F6',
    fontSize: 14,
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
  // Full-Screen White Canvas Styles
  whiteCanvasOverlay: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  canvasHeaderFloating: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
  },
  closeCanvasButton: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 5,
  },
  closeCanvasText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  canvasTapCountBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 5,
  },
  canvasTapCountText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  canvasInstructionBadge: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  canvasInstructionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  whiteCanvasRipple: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
});

export default TapTestScreen;

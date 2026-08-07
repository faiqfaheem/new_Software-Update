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
const HERO_ICON = require('../assets/test_screen_display.png');

const WhitePlaceholder = ({ size = 64, borderRadius = 14, color = '#FFFFFF' }) => (
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

const TEST_COLORS = ['#FFFFFF', '#EF4444', '#22C55E', '#3B82F6'];

const DisplayTestScreen = ({ navigation }) => {
  const [colorIndex, setColorIndex] = useState(0);
  const [isFullscreenColorActive, setIsFullscreenColorActive] = useState(false);

  const handleNextColor = () => {
    setIsFullscreenColorActive(true);
  };

  const handleCycleColor = () => {
    if (colorIndex < TEST_COLORS.length - 1) {
      setColorIndex(colorIndex + 1);
    } else {
      setColorIndex(0);
      setIsFullscreenColorActive(false);
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

      {/* Fullscreen Test Color Overlay Modal */}
      <Modal
        visible={isFullscreenColorActive}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setIsFullscreenColorActive(false)}
      >
        <TouchableOpacity
          style={[styles.fullColorOverlay, { backgroundColor: TEST_COLORS[colorIndex] }]}
          activeOpacity={1}
          onPress={handleCycleColor}
        >
          <Text style={[styles.tapToCycleText, { color: colorIndex === 0 ? '#1E293B' : '#FFFFFF' }]}>
            Tap anywhere to cycle color ({colorIndex + 1}/{TEST_COLORS.length})
          </Text>
        </TouchableOpacity>
      </Modal>

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <BackArrow size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Display Test</Text>
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
            Tap next to go through different screen colors : white, red, green and blue.
          </Text>

          <TouchableOpacity style={styles.nextButton} onPress={handleNextColor}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Question & Feedback Buttons (Moved Up & Solid White Placeholder Circles) */}
        <View style={styles.bottomFeedbackSection}>
          <Text style={styles.questionText}>Is the display working?</Text>

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
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  nextButton: {
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
  nextButtonText: {
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
  fullColorOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  tapToCycleText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default DisplayTestScreen;

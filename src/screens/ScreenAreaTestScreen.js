import { SvgXml } from 'react-native-svg';
import React, { useState, useRef } from 'react';
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
  PanResponder,
  Dimensions,
  Image,
} from 'react-native';

const PASS_ICON = require('../assets/test_pass_icon.png');
const FAIL_ICON = require('../assets/test_fail_icon.png');
const HERO_ICON = require('../assets/test_screen_screen_area.png');

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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GRID_COLS = 8;
const GRID_ROWS = 14;
const TOTAL_CELLS = GRID_COLS * GRID_ROWS;

const ScreenAreaTestScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const [isDrawingActive, setIsDrawingActive] = useState(false);
  const [filledCells, setFilledCells] = useState({});

  const filledRef = useRef({});
  filledRef.current = filledCells;
  const isCompletedRef = useRef(false);
  const completionTimeoutRef = useRef(null);

  const handleStartDrawing = () => {
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }
    setFilledCells({});
    filledRef.current = {};
    isCompletedRef.current = false;
    setIsDrawingActive(true);
  };

  const markCellAtPoint = (x, y) => {
    if (isCompletedRef.current) return;
    if (x < 0 || y < 0 || x > SCREEN_WIDTH || y > SCREEN_HEIGHT) return;
    const col = Math.min(GRID_COLS - 1, Math.max(0, Math.floor((x / SCREEN_WIDTH) * GRID_COLS)));
    const row = Math.min(GRID_ROWS - 1, Math.max(0, Math.floor((y / SCREEN_HEIGHT) * GRID_ROWS)));
    const cellKey = `${row}-${col}`;

    if (!filledRef.current[cellKey]) {
      const nextState = { ...filledRef.current, [cellKey]: true };
      filledRef.current = nextState;
      setFilledCells(nextState);

      // When 100% grid cells are filled, wait 2 seconds so user sees full green grid before auto-closing
      if (Object.keys(nextState).length >= TOTAL_CELLS) {
        isCompletedRef.current = true;
        completionTimeoutRef.current = setTimeout(async () => {
          setIsDrawingActive(false);
          await setStoredTestResult('4', 'pass');
        }, 2000);
      }
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        markCellAtPoint(pageX, pageY);
      },
      onPanResponderMove: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        markCellAtPoint(pageX, pageY);
      },
    })
  ).current;

  const handleSettingsPress = () => {
    navigation.navigate('SettingsScreen');
  };

  const handleResultPress = async (passed) => {
    await setStoredTestResult('4', passed ? 'pass' : 'fail');
    navigation.goBack();
  };

  const coveredCount = Object.keys(filledCells).length;
  const coveragePercent = Math.round((coveredCount / TOTAL_CELLS) * 100);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      {/* Full-Screen Authentic Factory Hardware Touch Digitizer Test Modal */}
      <Modal
        visible={isDrawingActive}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setIsDrawingActive(false)}
      >
        <StatusBar hidden={true} />
        <View style={styles.digitizerModalContainer} {...panResponder.panHandlers}>
          {/* Edge-to-Edge Cell Grid Matrix */}
          <View style={styles.fullScreenGrid}>
            {Array.from({ length: GRID_ROWS }).map((_, rIndex) => (
              <View key={`r-${rIndex}`} style={styles.fullScreenRow}>
                {Array.from({ length: GRID_COLS }).map((_, cIndex) => {
                  const key = `${rIndex}-${cIndex}`;
                  const isFilled = !!filledCells[key];
                  return (
                    <View
                      key={key}
                      style={[
                        styles.cellBox,
                        isFilled ? styles.cellBoxFilled : styles.cellBoxEmpty,
                      ]}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </Modal>

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <BackArrow size={15} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('screenAreaTitle')}</Text>
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
            {t('screenAreaInstruction')}
          </Text>

          <TouchableOpacity style={styles.startDrawingButton} onPress={handleStartDrawing}>
            <Text style={styles.startDrawingButtonText}>{t('startDrawing')}</Text>
          </TouchableOpacity>

          {coveredCount > 0 && (
            <View style={styles.lastScoreBadge}>
              <Text style={styles.lastScoreText}>Last Test Coverage: {coveragePercent}%</Text>
            </View>
          )}
        </View>

        {/* Bottom Question & Feedback Buttons (Consistent template) */}
        <View style={styles.bottomFeedbackSection}>
          <Text style={styles.questionText}>{t('isScreenAreaWorking')}</Text>

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
  startDrawingButton: {
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
  startDrawingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lastScoreBadge: {
    marginTop: 16,
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  lastScoreText: {
    color: '#34D399',
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
  // Authentic Edge-to-Edge Factory Hardware Touch Digitizer Styles
  digitizerModalContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  fullScreenGrid: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  fullScreenRow: {
    flex: 1,
    flexDirection: 'row',
  },
  cellBox: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#334155',
  },
  cellBoxEmpty: {
    backgroundColor: '#1E293B',
  },
  cellBoxFilled: {
    backgroundColor: '#22C55E',
    borderColor: '#4ADE80',
  },
  floatingHudContainer: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 999,
  },
  closeHudButton: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  closeHudText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  percentBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  percentText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  resetHudButton: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  resetHudText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: 'bold',
  },
});

export default ScreenAreaTestScreen;

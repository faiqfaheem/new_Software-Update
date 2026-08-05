import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Linking,
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

const AccelerometerTestScreen = ({ navigation }) => {
  const [shakeDetected, setShakeDetected] = useState(false);

  const handleSimulateShake = () => {
    setShakeDetected(true);
  };

  const handleSettingsPress = () => {
    Linking.openSettings();
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
          <Text style={styles.headerTitle}>Accelerometer Test</Text>
        </View>

        <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
          <WhitePlaceholder size={18} borderRadius={4} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Main Content Body */}
      <View style={styles.container}>
        {/* Top Hero Section */}
        <TouchableOpacity
          style={styles.heroSection}
          activeOpacity={0.8}
          onPress={handleSimulateShake}
        >
          <View style={styles.placeholderContainer}>
            <WhitePlaceholder size={70} borderRadius={16} color="#FFFFFF" />
          </View>

          <Text style={styles.instructionText}>
            Shake your device to test accelerometer.
          </Text>

          {shakeDetected && (
            <View style={styles.shakeBadge}>
              <Text style={styles.shakeText}>Motion / Shake Detected! ✓</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Bottom Question & Feedback Buttons (Consistent Template) */}
        <View style={styles.bottomFeedbackSection}>
          <Text style={styles.questionText}>Is the accelerometer working?</Text>

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
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  shakeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shakeText: {
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
});

export default AccelerometerTestScreen;

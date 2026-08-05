import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Linking,
  Alert,
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

const HeadphonesTestScreen = ({ navigation }) => {
  const [isConnected, setIsConnected] = useState(true);

  const handleTestLeftStereo = () => {
    Alert.alert('Left Stereo Test', 'Playing audio on Left Earphone...\n\n[Audio Test Triggered]');
  };

  const handleTestRightStereo = () => {
    Alert.alert('Right Stereo Test', 'Playing audio on Right Earphone...\n\n[Audio Test Triggered]');
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
          <Text style={styles.headerTitle}>Headphones Test</Text>
        </View>

        <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
          <WhitePlaceholder size={18} borderRadius={4} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Main Content Body */}
      <View style={styles.container}>
        {/* Top Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.placeholderContainer}>
            <WhitePlaceholder size={70} borderRadius={16} color="#FFFFFF" />
          </View>

          <Text style={styles.instructionText}>
            Connect headphones and test audio output.
          </Text>

          {/* Status Row */}
          <View style={styles.statusRow}>
            <Text style={styles.statusConnected}>✓ Earphones Connected</Text>
            <Text style={styles.statusNotConnected}>✓ Earphones Notconnected</Text>
          </View>

          {/* Stereo Cards */}
          {/* Card 1: Left Stereo */}
          <View style={styles.stereoCard}>
            <View style={styles.stereoIconWrapper}>
              <WhitePlaceholder size={24} borderRadius={6} color="#FFFFFF" />
            </View>
            <Text style={styles.stereoTitle}>Left Stereo</Text>
            <TouchableOpacity style={styles.testPillButton} onPress={handleTestLeftStereo}>
              <Text style={styles.testPillText}>Test</Text>
            </TouchableOpacity>
          </View>

          {/* Card 2: Right Stereo */}
          <View style={styles.stereoCard}>
            <View style={styles.stereoIconWrapper}>
              <WhitePlaceholder size={24} borderRadius={6} color="#FFFFFF" />
            </View>
            <Text style={styles.stereoTitle}>Right Stereo</Text>
            <TouchableOpacity style={styles.testPillButton} onPress={handleTestRightStereo}>
              <Text style={styles.testPillText}>Test</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Question & Feedback Buttons (Consistent Template) */}
        <View style={styles.bottomFeedbackSection}>
          <Text style={styles.questionText}>Is the headphones working?</Text>

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
    paddingTop: 24,
  },
  heroSection: {
    alignItems: 'center',
    width: '100%',
  },
  placeholderContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  statusRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusConnected: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusNotConnected: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '600',
  },
  stereoCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131C31',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  stereoIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  stereoTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  testPillButton: {
    backgroundColor: '#84CC16',
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 16,
  },
  testPillText: {
    color: '#1E293B',
    fontSize: 13,
    fontWeight: 'bold',
  },
  bottomFeedbackSection: {
    alignItems: 'center',
    marginTop: 28,
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

export default HeadphonesTestScreen;

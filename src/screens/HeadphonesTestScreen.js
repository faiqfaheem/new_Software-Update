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
  DeviceEventEmitter,
  Image,
} from 'react-native';

const PASS_ICON = require('../assets/test_pass_icon.png');
const FAIL_ICON = require('../assets/test_fail_icon.png');
const HERO_ICON = require('../assets/test_screen_headphone.png');
const LEFT_EARPHONE_ICON = require('../assets/left_earphone_icon.png');
const RIGHT_EARPHONE_ICON = require('../assets/right_earphone_icon.png');

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

const HeadphonesTestScreen = ({ navigation }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [activeTestingChannel, setActiveTestingChannel] = useState(null); // 'LEFT' | 'RIGHT' | null

  // Subscribe to physical device Hardware Headphone Plug/Unplug events
  useEffect(() => {
    let subscription;

    if (NativeModules.HeadphoneModule) {
      // Check initial connection status on load
      if (NativeModules.HeadphoneModule.isHeadphoneConnected) {
        NativeModules.HeadphoneModule.isHeadphoneConnected()
          .then((status) => setIsConnected(!!status))
          .catch(() => { });
      }

      // Start listening to real-time hardware broadcast events
      if (NativeModules.HeadphoneModule.startListening) {
        NativeModules.HeadphoneModule.startListening().catch(() => { });
        subscription = DeviceEventEmitter.addListener('HeadphoneStatusEvent', (event) => {
          setIsConnected(!!event.connected);
        });
      }
    }

    return () => {
      if (subscription) subscription.remove();
      if (NativeModules.HeadphoneModule && NativeModules.HeadphoneModule.stopListening) {
        NativeModules.HeadphoneModule.stopListening().catch(() => { });
      }
    };
  }, []);

  const handleTestLeftStereo = () => {
    setActiveTestingChannel('LEFT');
    if (NativeModules.HeadphoneModule && NativeModules.HeadphoneModule.playAudioChannel) {
      NativeModules.HeadphoneModule.playAudioChannel('LEFT').catch(() => { });
    }
    setTimeout(() => {
      setActiveTestingChannel(null);
    }, 2000);
  };

  const handleTestRightStereo = () => {
    setActiveTestingChannel('RIGHT');
    if (NativeModules.HeadphoneModule && NativeModules.HeadphoneModule.playAudioChannel) {
      NativeModules.HeadphoneModule.playAudioChannel('RIGHT').catch(() => { });
    }
    setTimeout(() => {
      setActiveTestingChannel(null);
    }, 2000);
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
          <Text style={styles.headerTitle}>Headphones Test</Text>
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
            Connect headphones and test audio output.
          </Text>

          {/* Real-time Hardware Connection Status Indicator */}
          <View style={styles.statusRow}>
            {isConnected ? (
              <View style={styles.statusBadgeConnected}>
                <View style={styles.greenDot} />
                <Text style={styles.statusTextConnected}>Earphones Connected</Text>
              </View>
            ) : (
              <View style={styles.statusBadgeDisconnected}>
                <View style={styles.redDot} />
                <Text style={styles.statusTextDisconnected}>Earphones Not Connected</Text>
              </View>
            )}
          </View>

          {/* Left & Right Channel Stereo Cards */}
          <View style={styles.channelsContainer}>
            {/* Left Earphone Card */}
            <View style={styles.channelCard}>
              <View style={styles.channelHeader}>
                <Image source={LEFT_EARPHONE_ICON} style={{ width: 28, height: 28 }} resizeMode="contain" />
                <Text style={styles.channelTitle}>Left Earphone</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.testPillButton,
                  activeTestingChannel === 'LEFT' && styles.testPillActive,
                ]}
                onPress={handleTestLeftStereo}
              >
                <Text style={styles.testPillText}>
                  {activeTestingChannel === 'LEFT' ? 'Testing Left ' : 'Test'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Right Earphone Card */}
            <View style={styles.channelCard}>
              <View style={styles.channelHeader}>
                <Image source={RIGHT_EARPHONE_ICON} style={{ width: 28, height: 28 }} resizeMode="contain" />
                <Text style={styles.channelTitle}>Right Earphone</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.testPillButton,
                  activeTestingChannel === 'RIGHT' && styles.testPillActive,
                ]}
                onPress={handleTestRightStereo}
              >
                <Text style={styles.testPillText}>
                  {activeTestingChannel === 'RIGHT' ? 'Testing Right ' : 'Test'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bottom Question & Feedback Buttons (Same exact position & white placeholder circles) */}
        <View style={styles.bottomFeedbackSection}>
          <Text style={styles.questionText}>Is the earphone working?</Text>

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
    paddingTop: 24,
  },
  heroSection: {
    alignItems: 'center',
    width: '100%',
  },
  placeholderContainer: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  statusRow: {
    marginBottom: 20,
    alignItems: 'center',
  },
  statusBadgeConnected: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  statusTextConnected: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusBadgeDisconnected: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  statusTextDisconnected: {
    color: '#F87171',
    fontSize: 14,
    fontWeight: 'bold',
  },
  channelsContainer: {
    width: '100%',
  },
  channelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#131C31',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  channelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  channelTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
  },
  testPillButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 18,
  },
  testPillActive: {
    backgroundColor: '#3B82F6',
  },
  testPillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  bottomFeedbackSection: {
    alignItems: 'center',
    marginTop: 24,
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

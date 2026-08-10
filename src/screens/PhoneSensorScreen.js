import { SvgXml } from 'react-native-svg';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
} from 'react-native';

const DISPLAY_ICON = require('../assets/display_icon.png');
const FLASHLIGHT_ICON = require('../assets/flashlight_icon.png');
const TAP_ICON = require('../assets/tap_icon.png');
const SCREEN_AREA_ICON = require('../assets/screen_area_icon.png');
const ACCELEROMETER_ICON = require('../assets/accelerometer_icon.png');
const HEADPHONES_ICON = require('../assets/headphones_icon.png');
const WIFI_ICON = require('../assets/wifi_icon.png');
const VIBRATION_ICON = require('../assets/vibration_icon.png');
const BRIGHTNESS_ICON = require('../assets/brightness_icon.png');
const SPEAKER_ICON = require('../assets/speaker_icon.png');

const WhitePlaceholder = ({ size = 22, borderRadius = 4, color = '#FFFFFF', opacity = 1 }) => (
  <View
    style={{
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: borderRadius,
      opacity: opacity,
    }}
  />
);

const BACK_ARROW_SVG = `<svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21.4142 9.70703H1.41422M10.4142 18.707L1.41422 9.70703L10.4142 0.707031" stroke="#DAE2FD" stroke-width="2"/>
</svg>`;

const BackArrow = ({ size = 20 }) => (
  <SvgXml xml={BACK_ARROW_SVG} width={size} height={Math.round(size * (20 / 22))} />
);

const ChevronRight = ({ color = '#94A3B8', size = 18 }) => (
  <Text style={{ color, fontSize: size, fontWeight: '600' }}>›</Text>
);

const SENSOR_TESTS = [
  { id: '1', title: 'Display', subtitle: 'Test Screen Functionality', icon: DISPLAY_ICON, passed: true },
  { id: '2', title: 'Flash Light', subtitle: 'Camera Flash Test', icon: FLASHLIGHT_ICON, passed: true },
  { id: '3', title: 'Tap Test', subtitle: 'Multi-Touch Test', icon: TAP_ICON, passed: true },
  { id: '4', title: 'Screen Area', subtitle: 'Display Area Test', icon: SCREEN_AREA_ICON, passed: false },
  { id: '5', title: 'Accelerometer', subtitle: 'Motion Sensor Test', icon: ACCELEROMETER_ICON, passed: false },
  { id: '6', title: 'Headphones', subtitle: 'Headphones Test', icon: HEADPHONES_ICON, passed: false },
  { id: '7', title: 'Wifi Test', subtitle: 'Wifi Test', icon: WIFI_ICON, passed: false },
  { id: '8', title: 'Vibration', subtitle: 'Haptics & Vibration Test', icon: VIBRATION_ICON, passed: false },
  { id: '9', title: 'Brightness', subtitle: 'Screen Brightness', icon: BRIGHTNESS_ICON, passed: false },
  { id: '10', title: 'Speaker Test', subtitle: 'Speaker Audio Test', icon: SPEAKER_ICON, passed: false },
];

const PhoneSensorScreen = ({ navigation }) => {
  const handleSettingsPress = () => {
    navigation.navigate('SettingsScreen');
  };

  const handleTestPress = (test) => {
    if (test.title === 'Display' || test.id === '1') {
      navigation.navigate('DisplayTestScreen');
    } else if (test.title === 'Flash Light' || test.id === '2') {
      navigation.navigate('FlashlightTestScreen');
    } else if (test.title === 'Tap Test' || test.id === '3') {
      navigation.navigate('TapTestScreen');
    } else if (test.title === 'Screen Area' || test.id === '4') {
      navigation.navigate('ScreenAreaTestScreen');
    } else if (test.title === 'Accelerometer' || test.id === '5') {
      navigation.navigate('AccelerometerTestScreen');
    } else if (test.title === 'Headphones' || test.id === '6') {
      navigation.navigate('HeadphonesTestScreen');
    } else if (test.title === 'Wifi Test' || test.id === '7') {
      navigation.navigate('WifiTestScreen');
    } else if (test.title === 'Vibration' || test.id === '8') {
      navigation.navigate('VibrationTestScreen');
    } else if (test.title === 'Brightness' || test.id === '9') {
      navigation.navigate('BrightnessTestScreen');
    } else if (test.title === 'Loud Speaker' || test.title === 'Speaker Test' || test.id === '10') {
      navigation.navigate('SpeakerTestScreen');
    } else {
      Alert.alert(test.title, `${test.subtitle}\n\n[Sensor Test Launched]`);
    }
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
          <Text style={styles.headerTitle}>Phone Sensor</Text>
        </View>
      </View>

      {/* Scrollable Sensor Tests List */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SENSOR_TESTS.map((test) => (
          <TouchableOpacity
            key={test.id}
            style={styles.sensorCard}
            activeOpacity={0.7}
            onPress={() => handleTestPress(test)}
          >
            {/* Left Icon Container */}
            <View style={[styles.iconContainer, test.icon && { backgroundColor: 'transparent' }]}>
              {test.icon ? (
                <Image source={test.icon} style={{ width: 36, height: 36 }} resizeMode="contain" />
              ) : (
                <WhitePlaceholder size={28} borderRadius={6} color="#FFFFFF" />
              )}
            </View>

            {/* Middle Info */}
            <View style={styles.infoContainer}>
              <Text style={styles.sensorTitle}>{test.title}</Text>
              <Text style={styles.sensorSubtitle}>{test.subtitle}</Text>
            </View>

            {/* Right Chevron Arrow */}
            <ChevronRight size={20} color="#94A3B8" />
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sensorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131C31',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoContainer: {
    flex: 1,
  },
  sensorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DAE2FD',
    marginBottom: 4,
  },
  sensorSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
  },
});

export default PhoneSensorScreen;

import { SvgXml } from 'react-native-svg';
import React, { useState, useEffect } from 'react';
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
import { getStoredTestResults } from '../utils/storage';

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

const PASS_SVG = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_124_1840)">
<path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#FF4141"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.4 19.9502L13.8671 7.25405C13.7605 4.71559 18.2372 4.64177 18.1329 7.14747L17.6 19.9502C17.5636 20.8246 16.8813 21.5501 16.0001 21.5501C15.119 21.5501 14.4369 20.8306 14.4 19.9502Z" fill="white"/>
<path d="M17.6018 25.072C17.6018 24.1874 16.8846 23.4702 16 23.4702C15.1153 23.4702 14.3982 24.1874 14.3982 25.072C14.3982 25.9567 15.1153 26.6738 16 26.6738C16.8846 26.6738 17.6018 25.9567 17.6018 25.072Z" fill="white"/>
<g clip-path="url(#clip1_124_1840)">
<path d="M32 16V16.8C31.9 17.8 31.8 18.8 31.6 19.8C30.8 23.2 28.9 26.1 26.3 28.3C26.2 28.4 26 28.5 25.9 28.6C25 29.3 24 29.9 22.9 30.4C22.7 30.5 22.5 30.6 22.3 30.7C21.9 30.9 21.5 31 21.1 31.1C20.6 31.3 20.1 31.4 19.6 31.5C18.4 31.9 17.2 32 16 32C7.2 32 0 24.8 0 16C0 7.2 7.2 0 16 0C24.8 0 32 7.2 32 16Z" fill="#26AD5F"/>
<path d="M32 16.7992C31.9 17.7992 31.8 18.7992 31.6 19.7992C30.8 23.1992 28.9 26.0992 26.3 28.2992C26.2 28.3992 26 28.4992 25.9 28.5992C25 29.2992 24 29.8992 22.9 30.3992C22.7 30.4992 22.5 30.5992 22.3 30.6992C21.9 30.8992 21.5 30.9992 21.1 31.0992C21.1 31.0992 12.4 22.3992 12.3 22.2992L7.20003 16.4992C6.60003 15.7992 6.60003 14.6992 7.40003 13.9992C8.10003 13.3992 9.20003 13.3992 9.90003 14.1992C10 14.2992 13.9 18.1992 14 18.2992L22.2 9.49916C22.9 8.79916 24 8.79916 24.7 9.39916C24.7 9.49916 32 16.7992 32 16.7992Z" fill="#00A053"/>
<path d="M13.6 23.0007C13.1 23.0007 12.6 22.8007 12.3 22.4007L7.20003 16.6007C6.60003 15.9007 6.60003 14.8007 7.40003 14.1007C8.10003 13.5007 9.20003 13.5007 9.90003 14.3007L13.7 18.7007L22.2 9.60072C22.9 8.90072 24 8.90072 24.7 9.50072C25.4 10.2007 25.4 11.3007 24.8 12.0007L15 22.5007C14.5 22.8007 14.1 23.0007 13.6 23.0007Z" fill="white"/>
</g>
</g>
<defs>
<clipPath id="clip0_124_1840">
<rect width="32" height="32" fill="white"/>
</clipPath>
<clipPath id="clip1_124_1840">
<rect width="32" height="32" fill="white"/>
</clipPath>
</defs>
</svg>`;

const FAIL_SVG = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_124_1915)">
<path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#FF8A41"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.4 19.9502L13.8671 7.25405C13.7605 4.71559 18.2372 4.64177 18.1329 7.14747L17.6 19.9502C17.5636 20.8246 16.8813 21.5501 16.0001 21.5501C15.119 21.5501 14.4369 20.8306 14.4 19.9502Z" fill="white"/>
<path d="M17.6018 25.072C17.6018 24.1874 16.8846 23.4702 16 23.4702C15.1153 23.4702 14.3982 24.1874 14.3982 25.072C14.3982 25.9567 15.1153 26.6738 16 26.6738C16.8846 26.6738 17.6018 25.9567 17.6018 25.072Z" fill="white"/>
</g>
<defs>
<clipPath id="clip0_124_1915">
<rect width="32" height="32" fill="white"/>
</clipPath>
</defs>
</svg>`;

const SENSOR_TESTS = [
  { id: '1', title: 'Display', subtitle: 'Test Screen Functionality', icon: DISPLAY_ICON },
  { id: '2', title: 'Flash Light', subtitle: 'Camera Flash Test', icon: FLASHLIGHT_ICON },
  { id: '3', title: 'Tap Test', subtitle: 'Multi-Touch Test', icon: TAP_ICON },
  { id: '4', title: 'Screen Area', subtitle: 'Display Area Test', icon: SCREEN_AREA_ICON },
  { id: '5', title: 'Accelerometer', subtitle: 'Motion Sensor Test', icon: ACCELEROMETER_ICON },
  { id: '6', title: 'Headphones', subtitle: 'Headphones Test', icon: HEADPHONES_ICON },
  { id: '7', title: 'Wifi Test', subtitle: 'Wifi Test', icon: WIFI_ICON },
  { id: '8', title: 'Vibration', subtitle: 'Haptics & Vibration Test', icon: VIBRATION_ICON },
  { id: '9', title: 'Brightness', subtitle: 'Screen Brightness', icon: BRIGHTNESS_ICON },
  { id: '10', title: 'Speaker Test', subtitle: 'Speaker Audio Test', icon: SPEAKER_ICON },
];

const PhoneSensorScreen = ({ navigation }) => {
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    loadTestResults();
    const unsubscribe = navigation.addListener('focus', () => {
      loadTestResults();
    });
    return unsubscribe;
  }, [navigation]);

  const loadTestResults = async () => {
    const results = await getStoredTestResults();
    setTestResults(results || {});
  };

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
        {SENSOR_TESTS.map((test) => {
          const resultStatus = testResults[test.id];
          return (
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

              {/* Right Result Badge (Pass Green Check / Fail Red Exclamation) */}
              {resultStatus === 'pass' && (
                <SvgXml xml={PASS_SVG} width={28} height={28} />
              )}
              {resultStatus === 'fail' && (
                <SvgXml xml={FAIL_SVG} width={28} height={28} />
              )}
            </TouchableOpacity>
          );
        })}
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

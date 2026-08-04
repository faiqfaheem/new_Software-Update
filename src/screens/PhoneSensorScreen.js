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
} from 'react-native';

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

const BackArrow = ({ color = '#FFFFFF', size = 22 }) => (
  <Text style={{ color, fontSize: size, fontWeight: 'bold' }}>←</Text>
);

const ChevronRight = ({ color = '#94A3B8', size = 18 }) => (
  <Text style={{ color, fontSize: size, fontWeight: '600' }}>›</Text>
);

const SENSOR_TESTS = [
  { id: '1', title: 'Display', subtitle: 'Test Screen Functionality', passed: true },
  { id: '2', title: 'Flash Light', subtitle: 'Camera Flash Test', passed: true },
  { id: '3', title: 'Tap Test', subtitle: 'Multi-Touch Test', passed: true },
  { id: '4', title: 'Screen Area', subtitle: 'Display Area Test', passed: false },
  { id: '5', title: 'Accelerometer', subtitle: 'Motion Sensor Test', passed: false },
  { id: '6', title: 'Headphones', subtitle: 'Headphones Test', passed: false },
  { id: '7', title: 'Wifi Test', subtitle: 'Wifi Test', passed: false },
  { id: '8', title: 'Vibration', subtitle: 'Haptics & Vibration Test', passed: false },
  { id: '9', title: 'Brightness', subtitle: 'Screen Brightness', passed: false },
  { id: '10', title: 'Speaker Test', subtitle: 'Speaker Audio Test', passed: false },
  { id: '11', title: 'Proximity Sensor', subtitle: 'Distance Sensor Test', passed: false },
  { id: '12', title: 'Gyroscope', subtitle: 'Orientation Sensor Test', passed: false },
];

const PhoneSensorScreen = ({ navigation }) => {
  const handleSettingsPress = () => {
    Linking.openSettings();
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

        <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
          <WhitePlaceholder size={18} borderRadius={4} color="#FFFFFF" />
        </TouchableOpacity>
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
            {/* Left White Placeholder Icon Container */}
            <View style={styles.iconContainer}>
              <WhitePlaceholder size={28} borderRadius={6} color="#FFFFFF" />
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sensorSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
  },
});

export default PhoneSensorScreen;

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  Platform,
} from 'react-native';

const HomeScreen = () => {
  // 1. Scan App Updates handler
  const handleScanAppUpdates = () => {
    Alert.alert(
      'Scan App Updates',
      'Scanning installed apps for pending software updates...\n\n[Dummy Action: Feature Ready for Integration]'
    );
  };

  // 2. System OS Update handler
  const handleSystemOSUpdate = async () => {
    try {
      if (Platform.OS === 'android') {
        await Linking.sendIntent('android.settings.SYSTEM_UPDATE_SETTINGS').catch(
          async () => {
            await Linking.openSettings();
          }
        );
      } else {
        await Linking.openSettings();
      }
    } catch (error) {
      console.warn('Could not launch OS update settings:', error);
      Linking.openSettings();
    }
  };

  // 3. Hardware & Sensor Tests handler
  const handleHardwareTests = () => {
    Alert.alert(
      'Hardware & Sensor Tests',
      'Opening Hardware Diagnostics (Screen, Touch, Speaker, Mic, Vibrator)...\n\n[Dummy Action]'
    );
  };

  // 4. App Uninstaller & Junk Cleaner handler
  const handleAppUninstaller = () => {
    Alert.alert(
      'App Uninstaller & Junk Cleaner',
      'Scanning system cache & unused APK files...\n\n[Dummy Action]'
    );
  };

  // 5. Usage & Battery Analytics handler
  const handleUsageBatteryAnalytics = () => {
    Alert.alert(
      'Usage & Battery Analytics',
      'Loading Battery Health & Screen On Time metrics...\n\n[Dummy Action]'
    );
  };

  // 6. AI Assistant Guide handler
  const handleAIAssistantGuide = () => {
    Alert.alert(
      'AI Assistant Guide',
      'Launching AI Software Diagnostic Assistant...\n\n[Dummy Action]'
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Software Update & Utility Tool</Text>
      <Text style={styles.headerSubtitle}>System Hub & Diagnostics</Text>

      {/* Grid / List of Feature Cards */}
      <View style={styles.gridContainer}>
        {/* Feature 1 */}
        <TouchableOpacity style={styles.card} onPress={handleScanAppUpdates}>
          <Text style={styles.cardIcon}>🔄</Text>
          <Text style={styles.cardTitle}>Scan App Updates</Text>
          <Text style={styles.cardDesc}>Check pending store & system app updates</Text>
        </TouchableOpacity>

        {/* Feature 2 */}
        <TouchableOpacity style={styles.card} onPress={handleSystemOSUpdate}>
          <Text style={styles.cardIcon}>📲</Text>
          <Text style={styles.cardTitle}>System OS Update</Text>
          <Text style={styles.cardDesc}>Check Android system software updates</Text>
        </TouchableOpacity>

        {/* Feature 3 */}
        <TouchableOpacity style={styles.card} onPress={handleHardwareTests}>
          <Text style={styles.cardIcon}>⚡</Text>
          <Text style={styles.cardTitle}>Hardware & Sensor Tests</Text>
          <Text style={styles.cardDesc}>Test display, audio, vibration, & sensors</Text>
        </TouchableOpacity>

        {/* Feature 4 */}
        <TouchableOpacity style={styles.card} onPress={handleAppUninstaller}>
          <Text style={styles.cardIcon}>🧹</Text>
          <Text style={styles.cardTitle}>App Uninstaller & Junk Cleaner</Text>
          <Text style={styles.cardDesc}>Clean residual files & batch uninstall apps</Text>
        </TouchableOpacity>

        {/* Feature 5 */}
        <TouchableOpacity style={styles.card} onPress={handleUsageBatteryAnalytics}>
          <Text style={styles.cardIcon}>🔋</Text>
          <Text style={styles.cardTitle}>Usage & Battery Analytics</Text>
          <Text style={styles.cardDesc}>View screen time & battery discharge stats</Text>
        </TouchableOpacity>

        {/* Feature 6 */}
        <TouchableOpacity style={styles.card} onPress={handleAIAssistantGuide}>
          <Text style={styles.cardIcon}>🤖</Text>
          <Text style={styles.cardTitle}>AI Assistant Guide</Text>
          <Text style={styles.cardDesc}>Smart phone diagnostic assistant</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111111',
    marginTop: 20,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 15,
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 12,
    color: '#718096',
    lineHeight: 16,
  },
});

export default HomeScreen;

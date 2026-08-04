import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  Animated,
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

const ScanAppsScreen = ({ navigation }) => {
  const [progress, setProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(true);

  // App counts
  const [installedAppsCount, setInstalledAppsCount] = useState('00');
  const [scannedAppsCount, setScannedAppsCount] = useState('00');
  const [availableUpdatesCount, setAvailableUpdatesCount] = useState('00');

  useEffect(() => {
    startScanningAnimation();
  }, []);

  const startScanningAnimation = () => {
    setProgress(0);
    setIsScanning(true);
    setInstalledAppsCount('00');
    setScannedAppsCount('00');
    setAvailableUpdatesCount('00');

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 8) + 4;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setProgress(100);
        setIsScanning(false);
        // Set completed state numbers (as shown in Pic 2)
        setInstalledAppsCount('125');
        setScannedAppsCount('80');
        setAvailableUpdatesCount('20');
      } else {
        setProgress(currentProgress);
      }
    }, 120);
  };

  const handleBulkUpdate = async () => {
    try {
      if (Platform.OS === 'android') {
        await Linking.openURL('market://search?q=by_publisher').catch(async () => {
          await Linking.openSettings();
        });
      } else {
        await Linking.openSettings();
      }
    } catch (e) {
      Alert.alert('Bulk Update', 'Redirecting to App Updates...');
    }
  };

  const handleSettingsPress = () => {
    Linking.openSettings();
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
          <Text style={styles.headerTitle}>Scan Apps</Text>
        </View>

        <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
          <WhitePlaceholder size={18} borderRadius={4} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Progress Circle Card */}
        <View style={styles.progressCard}>
          <View style={styles.circleOuterRing}>
            <View style={styles.circleInnerContainer}>
              <Text style={styles.percentageText}>{progress}%</Text>
            </View>
          </View>

          <Text style={styles.scanStatusText}>
            {isScanning ? 'Scanning...' : 'Scan Completed'}
          </Text>
        </View>

        {/* Installed Apps Card */}
        <View style={styles.statRowCard}>
          <View style={[styles.iconSquare, { backgroundColor: '#1E293B' }]}>
            <WhitePlaceholder size={22} borderRadius={4} color="#FFFFFF" />
          </View>
          <Text style={styles.statCardTitle}>Installed Apps</Text>
          <Text style={styles.statCardCount}>{installedAppsCount}</Text>
        </View>

        {/* Scanned Apps Card */}
        <View style={styles.statRowCard}>
          <View style={[styles.iconSquare, { backgroundColor: '#451A1A' }]}>
            <WhitePlaceholder size={22} borderRadius={4} color="#FFFFFF" />
          </View>
          <Text style={styles.statCardTitle}>Scanned Apps</Text>
          <Text style={styles.statCardCount}>{scannedAppsCount}</Text>
        </View>

        {/* Available Updates Card */}
        <View style={styles.statRowCard}>
          <View style={[styles.iconSquare, { backgroundColor: '#1C3A1E' }]}>
            <WhitePlaceholder size={22} borderRadius={4} color="#FFFFFF" />
          </View>
          <Text style={styles.statCardTitle}>Available Updates</Text>
          <Text style={styles.statCardCount}>{availableUpdatesCount}</Text>
        </View>
      </ScrollView>

      {/* Bottom Action Button (Visible when Scan Completed) */}
      {!isScanning && (
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity style={styles.bulkUpdateButton} onPress={handleBulkUpdate}>
            <Text style={styles.bulkButtonText}>↑ Bulk Update All ({availableUpdatesCount})</Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingBottom: 30,
  },
  // Progress Circle Card
  progressCard: {
    backgroundColor: '#131C31',
    borderRadius: 18,
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  circleOuterRing: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 14,
    borderColor: '#A5B4FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  circleInnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scanStatusText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  // Stat Row Cards
  statRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#131C31',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  iconSquare: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  statCardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statCardCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  // Bottom Action Button
  bottomButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#0B1120',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  bulkUpdateButton: {
    backgroundColor: '#A5B4FC',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulkButtonText: {
    color: '#1E1B4B',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ScanAppsScreen;

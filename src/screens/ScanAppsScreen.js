import React, { useState, useEffect } from 'react';
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
  NativeModules,
  Image,
} from 'react-native';
import { scanInstalledAppsForUpdates } from '../utils/playStoreScraper';

const SETTINGS_ICON = require('../assets/settings_icon.png');

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

const BACK_ARROW_ICON = require('../assets/back_arrow_icon.png');

const BackArrow = ({ size = 20 }) => (
  <Image source={BACK_ARROW_ICON} style={{ width: size, height: size }} resizeMode="contain" />
);

const ScanAppsScreen = ({ navigation }) => {
  const [progress, setProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(true);

  // Realtime App Counts & Update Candidate List
  const [installedAppsCount, setInstalledAppsCount] = useState('0');
  const [systemAppsCount, setSystemAppsCount] = useState('0');
  const [availableUpdatesCount, setAvailableUpdatesCount] = useState('0');
  const [candidateUpdateAppsList, setCandidateUpdateAppsList] = useState([]);

  useEffect(() => {
    startRealtimeAppScan();
  }, []);

  const isUserFacingSystemApp = (app) => {
    if (!app || !app.isSystemApp) return true;

    const name = (app.appName || app.name || '').trim();
    const pkg = (app.packageName || '').trim().toLowerCase();

    if (!name || name.toLowerCase() === pkg) return false;

    const lowerName = name.toLowerCase();

    if (
      lowerName.startsWith('com.') ||
      lowerName.startsWith('org.') ||
      lowerName.startsWith('net.') ||
      lowerName.startsWith('android.') ||
      lowerName.startsWith('sys.') ||
      lowerName.startsWith('io.') ||
      lowerName.includes('.')
    ) {
      return false;
    }

    const OS_BACKGROUND_KEYWORDS = [
      'provider',
      'service',
      'services',
      'system',
      'framework',
      'installer',
      'spooler',
      'carrier',
      'companion',
      'dictionary',
      'overlay',
      'stub',
      'proxy',
      'captive',
      'fused',
      'storage',
      'telephony',
      'keychain',
      'feedback',
      'agent',
      'daemon',
      'engine',
      'component',
      'shell',
      'interface',
      'extension',
      'plugin',
      'helper',
      'wallpaper',
      'carousel',
      'analytics',
      'msa',
      'security core',
      'guard',
      'intent',
      'permission',
      'print',
      'bluetooth',
      'sim',
      'manager',
      'module',
      'handler',
    ];

    const PRIMARY_SYSTEM_NAMES = [
      'settings',
      'camera',
      'gallery',
      'photos',
      'phone',
      'dialer',
      'messages',
      'messaging',
      'contacts',
      'clock',
      'alarm',
      'calculator',
      'calendar',
      'files',
      'file manager',
      'my files',
      'chrome',
      'google',
      'youtube',
      'maps',
      'gmail',
      'drive',
      'play store',
      'notes',
      'keep',
      'voice recorder',
      'recorder',
      'compass',
      'weather',
      'radio',
      'fm radio',
      'music',
      'video',
      'browser',
      'screen recorder',
      'gboard',
      'duo',
      'meet',
    ];

    const isPrimaryName = PRIMARY_SYSTEM_NAMES.some((pName) => lowerName.includes(pName));
    if (isPrimaryName) return true;

    const isBackgroundKeyword = OS_BACKGROUND_KEYWORDS.some((kw) => lowerName.includes(kw));
    if (isBackgroundKeyword) return false;

    if (name.length > 30) return false;
    return true;
  };

  const startRealtimeAppScan = async () => {
    setProgress(0);
    setIsScanning(true);

    let installedCount = 0;
    let systemCount = 0;
    let updatesCount = 0;
    let finalUpdateApps = [];

    try {
      if (
        NativeModules.AppPermissionModule &&
        NativeModules.AppPermissionModule.getInstalledAppsPermissions
      ) {
        const rawApps = await NativeModules.AppPermissionModule.getInstalledAppsPermissions();
        if (Array.isArray(rawApps) && rawApps.length > 0) {
          const scanResults = await scanInstalledAppsForUpdates(rawApps, (scanned, total) => {
            if (total > 0) {
              const currentPct = Math.min(Math.round((scanned / total) * 100), 99);
              setProgress(currentPct);
            }
          });

          installedCount = scanResults.installedCount;
          systemCount = scanResults.systemCount;
          finalUpdateApps = scanResults.availableUpdates;
          updatesCount = scanResults.availableUpdates.length;
        }
      }
    } catch (e) {
      console.warn('Realtime app scan error:', e);
    }

    setProgress(100);
    setIsScanning(false);
    setInstalledAppsCount(String(installedCount || 0));
    setSystemAppsCount(String(systemCount || 0));
    setAvailableUpdatesCount(String(updatesCount || 0));
    setCandidateUpdateAppsList(finalUpdateApps);
  };


  const handleBulkUpdate = () => {
    navigation.navigate('AvailableUpdatesScreen', {
      updateApps: candidateUpdateAppsList,
    });
  };

  const handleSettingsPress = () => {
    navigation.navigate('SettingsScreen');
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
          <Image source={SETTINGS_ICON} style={{ width: 22, height: 22 }} resizeMode="contain" />
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
            {isScanning ? 'Scanning Installed & System Packages...' : 'Realtime Scan Completed'}
          </Text>
        </View>

        {/* Installed Apps Card */}
        <TouchableOpacity
          style={styles.statRowCard}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('AllAppsScreen', { filter: 'Installed' })}
        >
          <View style={[styles.iconSquare, { backgroundColor: '#1E293B' }]}>
            <Text style={{ fontSize: 20 }}>📱</Text>
          </View>
          <View style={styles.statTextGroup}>
            <Text style={styles.statCardTitle}>Installed Apps</Text>
            <Text style={styles.statCardSubText}>User Downloaded Packages</Text>
          </View>
          <Text style={styles.statCardCount}>{installedAppsCount}</Text>
        </TouchableOpacity>

        {/* System Apps Card */}
        <TouchableOpacity
          style={styles.statRowCard}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('AllAppsScreen', { filter: 'System' })}
        >
          <View style={[styles.iconSquare, { backgroundColor: '#312E81' }]}>
            <Text style={{ fontSize: 20 }}>⚙️</Text>
          </View>
          <View style={styles.statTextGroup}>
            <Text style={styles.statCardTitle}>System Apps</Text>
            <Text style={styles.statCardSubText}>OS Pre-Installed Packages</Text>
          </View>
          <Text style={styles.statCardCount}>{systemAppsCount}</Text>
        </TouchableOpacity>

        {/* Available Updates Card */}
        <TouchableOpacity
          style={styles.statRowCard}
          activeOpacity={0.7}
          onPress={handleBulkUpdate}
        >
          <View style={[styles.iconSquare, { backgroundColor: '#166534' }]}>
            <Text style={{ fontSize: 20 }}>🔄</Text>
          </View>
          <View style={styles.statTextGroup}>
            <Text style={styles.statCardTitle}>Available Updates</Text>
            <Text style={styles.statCardSubText}>Pending App Update Candidates</Text>
          </View>
          <Text style={[styles.statCardCount, { color: '#4ADE80' }]}>
            {availableUpdatesCount}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Action Button (Visible when Scan Completed) */}
      {!isScanning && (
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity style={styles.bulkUpdateButton} onPress={handleBulkUpdate}>
            <Text style={styles.bulkButtonText}>
              View Available Updates ({availableUpdatesCount})
            </Text>
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
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 90,
  },
  progressCard: {
    backgroundColor: '#131C31',
    borderRadius: 18,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  circleOuterRing: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 12,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  circleInnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scanStatusText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  statRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131C31',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  iconSquare: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  statTextGroup: {
    flex: 1,
  },
  statCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statCardSubText: {
    fontSize: 12,
    color: '#64748B',
  },
  statCardCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0B1120',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  bulkUpdateButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulkButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ScanAppsScreen;

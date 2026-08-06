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
import DeviceInfo from 'react-native-device-info';
import { useLanguage } from '../i18n/LanguageContext';

const AI_ICON = require('../assets/ai_assistant_icon.png');
const OS_UPDATE_ICON = require('../assets/os_update_icon.png');
const BULK_UNINSTALLER_ICON = require('../assets/bulk_uninstaller_icon.png');
const ALL_APPS_ICON = require('../assets/all_apps_icon.png');
const SETTINGS_ICON = require('../assets/settings_icon.png');
const SCAN_APPS_ICON = require('../assets/scan_apps_icon.png');
const TAB_HOME_ICON = require('../assets/tab_home_icon.png');
const TAB_TOOLS_ICON = require('../assets/tab_tools_icon.png');
const TOOL_STORAGE_INFO_ICON = require('../assets/tool_storage_info_icon.png');
const TOOL_PERMISSION_MANAGER_ICON = require('../assets/tool_permission_manager_icon.png');
const TOOL_PHONE_SENSOR_ICON = require('../assets/tool_phone_sensor_icon.png');

// --- Simple White Placeholder Box Component ---
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

const ChevronRight = ({ color = '#64748B' }) => (
  <Text style={{ color, fontSize: 18, fontWeight: '600' }}>›</Text>
);

const HomeScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('home');

  const [storageAnalytics, setStorageAnalytics] = useState({
    healthPercentage: 82,
    healthLabel: '82% Healthy',
    installedAppsCount: 0,
    systemAppsCount: 0,
    optimizedPercentage: '95%',
  });

  useEffect(() => {
    fetchRealtimeStorageAnalytics();
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

  const fetchRealtimeStorageAnalytics = async () => {
    try {
      // 1. Calculate Real Storage Health Percentage from Disk Free vs Total
      let totalDisk = 0;
      let freeDisk = 0;
      try {
        totalDisk = await DeviceInfo.getTotalDiskCapacity();
        freeDisk = await DeviceInfo.getFreeDiskStorage();
      } catch (_e) { }

      let healthPct = 82;
      if (totalDisk > 0 && freeDisk > 0) {
        const freeRatio = freeDisk / totalDisk;
        healthPct = Math.min(Math.max(Math.round(freeRatio * 100) + 35, 30), 98);
      }

      // 2. Fetch Installed Apps & System Apps counts from Native AppPermissionModule
      let installedCount = 0;
      let systemCount = 0;
      if (
        NativeModules.AppPermissionModule &&
        NativeModules.AppPermissionModule.getInstalledAppsPermissions
      ) {
        const rawApps = await NativeModules.AppPermissionModule.getInstalledAppsPermissions();
        if (Array.isArray(rawApps)) {
          installedCount = rawApps.filter((a) => !a.isSystemApp && (a.apkSize || 0) > 100 * 1024).length;
          systemCount = rawApps.filter(
            (a) => a.isSystemApp && (a.apkSize || 0) > 100 * 1024 && isUserFacingSystemApp(a)
          ).length;
        }
      }

      // 3. Optimization Score based on Free Storage & App ratio
      const totalApps = installedCount + systemCount;
      const optPct = totalApps > 0 ? Math.min(Math.max(100 - Math.round((installedCount / totalApps) * 20), 80), 99) : 95;

      setStorageAnalytics({
        healthPercentage: healthPct,
        healthLabel: `${healthPct}% Healthy`,
        installedAppsCount: installedCount,
        systemAppsCount: systemCount,
        optimizedPercentage: `${optPct}%`,
      });
    } catch (_e) { }
  };

  // --- Home Tab Action Handlers ---
  const handleScanAppUpdates = () => {
    navigation.navigate('ScanAppsScreen');
  };

  const handleAllApps = () => {
    navigation.navigate('AllAppsScreen');
  };

  const handleSystemOSUpdate = () => {
    navigation.navigate('OSUpdateScreen');
  };

  const handleAIAssistantGuide = () => {
    navigation.navigate('AIAssistantScreen');
  };

  const handleBulkUninstaller = () => {
    navigation.navigate('BulkUninstallerScreen');
  };

  const handleSettingsPress = () => {
    navigation.navigate('SettingsScreen');
  };

  // --- Tools Tab Action Handlers ---
  const handleStorageInfo = () => {
    navigation.navigate('StorageInfoScreen');
  };

  const handlePermissionManager = () => {
    navigation.navigate('PermissionManagerScreen');
  };

  const handlePhoneSensor = () => {
    navigation.navigate('PhoneSensorScreen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <Text style={styles.headerAppTitle}>Software Update</Text>

        <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
          <Image source={SETTINGS_ICON} style={{ width: 22, height: 22 }} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* Conditional Rendering Based on Active Tab */}
      {activeTab === 'home' ? (
        /* HOME TAB CONTENT */
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical={true}
        >
          {/* Hero Card - Scan Apps */}
          <View style={styles.heroCard}>
            <View style={styles.heroGlowBackdrop}>
              <TouchableOpacity
                style={styles.heroCircleButton}
                onPress={handleScanAppUpdates}
                activeOpacity={0.85}
              >
                <View style={styles.heroIconWrapper}>
                  <Image source={SCAN_APPS_ICON} style={{ width: 36, height: 36 }} resizeMode="contain" />
                </View>
                <Text style={styles.heroTitle}>Scan Apps</Text>
                <Text style={styles.heroSub}>Check Updates</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* All Apps Full Width Card */}
          <TouchableOpacity style={styles.rowCard} onPress={handleAllApps}>
            <View style={[styles.iconSquare, { backgroundColor: '#2B3E62' }]}>
              <Image source={ALL_APPS_ICON} style={{ width: 28, height: 28 }} resizeMode="contain" />
            </View>
            <View style={styles.rowCardTextContainer}>
              <Text style={styles.rowCardTitle}>All Apps</Text>
              <Text style={styles.rowCardSub}>All Installed Apps</Text>
            </View>
            <ChevronRight />
          </TouchableOpacity>

          {/* Two Column Grid (OS Update & AI Assistant) */}
          <View style={styles.gridRow}>
            {/* OS Update Card */}
            <TouchableOpacity style={styles.gridCard} onPress={handleSystemOSUpdate}>
              <View style={[styles.iconSquare, { backgroundColor: '#93000A', marginBottom: 16 }]}>
                <Image source={OS_UPDATE_ICON} style={{ width: 28, height: 28 }} resizeMode="contain" />
              </View>
              <Text style={styles.gridCardTitle}>OS Update</Text>
              <Text style={styles.gridCardSub}>UPDATE AVAILABLE</Text>
            </TouchableOpacity>

            {/* AI Assistant Card (Full Linear Fill Gradient Effect) */}
            <TouchableOpacity
              style={[styles.gridCard, styles.aiCardGradient]}
              onPress={handleAIAssistantGuide}
              activeOpacity={0.85}
            >
              {/* Linear Fill Gradient Effect Layers */}
              <View style={styles.linearGradientBase} />
              <View style={styles.linearGradientHighlight} />

              <View style={[styles.iconSquare, styles.aiIconSquare]}>
                <Image source={AI_ICON} style={{ width: 26, height: 26 }} resizeMode="contain" />
              </View>
              <Text style={[styles.gridCardTitle, { color: '#FFFFFF' }]}>AI Assistant</Text>
              <Text style={[styles.gridCardSub, { color: 'rgba(255,255,255,0.9)' }]}>SMART OPTIMIZATION</Text>
            </TouchableOpacity>
          </View>

          {/* Bulk Uninstaller Card */}
          <TouchableOpacity style={styles.rowCard} onPress={handleBulkUninstaller}>
            <View style={[styles.iconSquare, { backgroundColor: '#371B36' }]}>
              <Image source={BULK_UNINSTALLER_ICON} style={{ width: 28, height: 28 }} resizeMode="contain" />
            </View>
            <View style={styles.rowCardTextContainer}>
              <Text style={styles.rowCardTitle}>Bulk Uninstaller</Text>
              <Text style={styles.rowCardSub}>Remove Multiple Apps At Once</Text>
            </View>
            <ChevronRight />
          </TouchableOpacity>

          {/* Dynamic Storage Health & Analytics Card */}
          <TouchableOpacity
            style={styles.statsCard}
            activeOpacity={0.8}
            onPress={handleStorageInfo}
          >
            <View style={styles.statsHeaderRow}>
              <Text style={styles.statsTitle}>Storage Health</Text>
              <Text style={styles.statsHealthBadge}>{storageAnalytics.healthLabel}</Text>
            </View>

            {/* Dynamic Progress Bar */}
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${storageAnalytics.healthPercentage}%` },
                ]}
              />
            </View>

            {/* Dynamic Stats Columns */}
            <View style={styles.statsColumnsRow}>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>INSTALLED</Text>
                <Text style={styles.statVal}>{storageAnalytics.installedAppsCount}</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statCol}>
                <Text style={styles.statLabel}>SYSTEM</Text>
                <Text style={[styles.statVal, { color: '#FB923C' }]}>
                  {storageAnalytics.systemAppsCount}
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statCol}>
                <Text style={styles.statLabel}>OPTIMIZED</Text>
                <Text style={styles.statVal}>{storageAnalytics.optimizedPercentage}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        /* TOOLS TAB CONTENT */
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.toolsScrollContent}
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical={true}
        >
          <View style={styles.toolsGrid}>
            {/* Tool 1: Storage INFO */}
            <TouchableOpacity style={styles.toolCard} onPress={handleStorageInfo}>
              <View style={styles.toolIconWrapper}>
                <Image source={TOOL_STORAGE_INFO_ICON} style={{ width: 44, height: 44 }} resizeMode="contain" />
              </View>
              <Text style={styles.toolCardTitle}>Storage INFO</Text>
            </TouchableOpacity>

            {/* Tool 2: Permission Manager */}
            <TouchableOpacity style={styles.toolCard} onPress={handlePermissionManager}>
              <View style={styles.toolIconWrapper}>
                <Image source={TOOL_PERMISSION_MANAGER_ICON} style={{ width: 44, height: 44 }} resizeMode="contain" />
              </View>
              <Text style={styles.toolCardTitle}>Permission Manager</Text>
            </TouchableOpacity>

            {/* Tool 3: Phone Sensor */}
            <TouchableOpacity style={styles.toolCard} onPress={handlePhoneSensor}>
              <View style={styles.toolIconWrapper}>
                <Image source={TOOL_PHONE_SENSOR_ICON} style={{ width: 44, height: 44 }} resizeMode="contain" />
              </View>
              <Text style={styles.toolCardTitle}>Phone Sensor</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('home')}
        >
          <Image
            source={TAB_HOME_ICON}
            style={{
              width: 22,
              height: 22,
              tintColor: activeTab === 'home' ? '#3B82F6' : '#64748B',
            }}
            resizeMode="contain"
          />
          <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('tools')}
        >
          <Image
            source={TAB_TOOLS_ICON}
            style={{
              width: 22,
              height: 22,
              tintColor: activeTab === 'tools' ? '#3B82F6' : '#64748B',
            }}
            resizeMode="contain"
          />
          <Text style={[styles.tabLabel, activeTab === 'tools' && styles.tabLabelActive]}>
            Tools
          </Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#0B1120',
  },
  headerAppTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  settingsButton: {
    padding: 4,
  },
  container: {
    flex: 1,
    backgroundColor: '#0B1326',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 30,
  },
  // Hero Card
  heroCard: {
    backgroundColor: '#0B1326',
    borderRadius: 18,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  heroGlowBackdrop: {
    borderRadius: 70,
    backgroundColor: '#ADC6FF',
    shadowColor: '#ADC6FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 24,
    elevation: 70,
  },
  heroCircleButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#ADC6FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ADC6FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.80,
    shadowRadius: 20,
    elevation: 70,
    borderWidth: 1,
    borderColor: '#E8F0FF',
  },
  heroIconWrapper: {
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  heroSub: {
    fontSize: 11,
    color: '#002E6A',
    fontWeight: '600',
    marginTop: 2,
  },
  // Full Width Row Card
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121B2E',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
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
  rowCardTextContainer: {
    flex: 1,
  },
  rowCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  rowCardSub: {
    fontSize: 12,
    color: '#94A3B8',
  },
  // 2-Column Grid
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    gap: 12,
    marginBottom: 14,
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#121B2E',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    minHeight: 125,
  },
  aiCardGradient: {
    backgroundColor: '#EA580C',
    borderColor: '#FB923C',
    overflow: 'hidden',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  linearGradientBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#EA580C',
  },
  linearGradientHighlight: {
    position: 'absolute',
    top: -25,
    left: -25,
    width: '150%',
    height: '150%',
    backgroundColor: '#FB923C',
    opacity: 0.7,
    borderRadius: 35,
    transform: [{ rotate: '-30deg' }],
  },
  aiIconSquare: {
    backgroundColor: '#D97706',
    marginBottom: 16,
    borderRadius: 14,
  },
  gridCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  gridCardSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.4,
  },
  // Stats Card
  statsCard: {
    backgroundColor: '#121B2E',
    borderRadius: 14,
    padding: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  statsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ADC6FF',
  },
  statsHealthBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ADC6FF',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(173, 198, 255, 0.18)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ADC6FF',
    borderRadius: 4,
  },
  statsColumnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ADC6FF',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statVal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ADC6FF',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#ADC6FF',
  },
  // --- Tools Screen Styles ---
  toolsScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  toolCard: {
    width: '48%',
    height: 165,
    backgroundColor: '#121B2E',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 16,
  },
  toolIconWrapper: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DAE2FD',
    textAlign: 'center',
  },
  // Bottom Tab Bar
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#171F33',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 3,
  },
  tabLabelActive: {
    color: '#ADC6FF',
  },
});

export default HomeScreen;

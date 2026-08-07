import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  SafeAreaView,
  StatusBar,
  Modal,
  FlatList,
  NativeModules,
  ActivityIndicator,
  Image,
  Platform,
  BackHandler,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';

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

const ChevronRight = ({ color = '#94A3B8', size = 16 }) => (
  <Text style={{ color, fontSize: size, fontWeight: '600' }}>›</Text>
);

const TRACK_COLORS = {
  '#EF4444': 'rgba(239, 68, 68, 0.25)',
  '#06B6D4': 'rgba(6, 182, 212, 0.25)',
  '#EAB308': 'rgba(234, 179, 8, 0.25)',
  '#10B981': 'rgba(16, 185, 129, 0.25)',
};

// Circular Ring Chart Component with exact SVG arc calculation matching percentage
const RingChart = ({ percentage = '0%', ringColor = '#EF4444' }) => {
  const size = 62;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const numValue = Math.min(100, Math.max(0, parseFloat(percentage) || 0));
  const strokeDashoffset = circumference - (circumference * numValue) / 100;
  const trackColor = TRACK_COLORS[ringColor] || 'rgba(255, 255, 255, 0.2)';

  return (
    <View style={styles.ringWrapper}>
      <Svg width={size} height={size}>
        {/* Background Track Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Arc Circle */}
        {numValue > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            originX={size / 2}
            originY={size / 2}
            rotation="-90"
          />
        )}
      </Svg>
      <View style={styles.ringTextOverlay}>
        <Text style={styles.ringPercentageText}>{percentage}</Text>
      </View>
    </View>
  );
};

// Permission Category Groups (Matching OS App Settings Groups - Each group counted ONCE per app)
const PERMISSION_GROUPS = [
  {
    name: 'Camera',
    risk: 'High',
    targets: ['CAMERA'],
  },
  {
    name: 'Microphone',
    risk: 'High',
    targets: ['RECORD_AUDIO'],
  },
  {
    name: 'Location',
    risk: 'High',
    targets: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'ACCESS_BACKGROUND_LOCATION'],
  },
  {
    name: 'Photos & Storage',
    risk: 'Medium',
    targets: [
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'MANAGE_EXTERNAL_STORAGE',
      'READ_MEDIA_IMAGES',
      'READ_MEDIA_VIDEO',
      'READ_MEDIA_AUDIO',
      'READ_MEDIA_VISUAL_USER_SELECTED',
    ],
  },
  {
    name: 'Contacts',
    risk: 'High',
    targets: ['READ_CONTACTS', 'WRITE_CONTACTS', 'GET_ACCOUNTS'],
  },
  {
    name: 'Phone & Call Logs',
    risk: 'High',
    targets: [
      'READ_PHONE_STATE',
      'CALL_PHONE',
      'READ_CALL_LOG',
      'WRITE_CALL_LOG',
      'READ_PHONE_NUMBERS',
    ],
  },
  {
    name: 'SMS',
    risk: 'High',
    targets: ['READ_SMS', 'SEND_SMS', 'RECEIVE_SMS', 'RECEIVE_MMS', 'RECEIVE_WAP_PUSH'],
  },
  {
    name: 'Physical Activity & Sensors',
    risk: 'Medium',
    targets: ['ACTIVITY_RECOGNITION', 'BODY_SENSORS', 'BODY_SENSORS_BACKGROUND'],
  },
  {
    name: 'Bluetooth & Nearby Devices',
    risk: 'Medium',
    targets: ['BLUETOOTH_CONNECT', 'BLUETOOTH_SCAN', 'NEARBY_WIFI_DEVICES'],
  },
  {
    name: 'Calendar',
    risk: 'Low',
    targets: ['READ_CALENDAR', 'WRITE_CALENDAR'],
  },
  {
    name: 'Notifications',
    risk: 'Low',
    targets: ['POST_NOTIFICATIONS'],
  },
  {
    name: 'Special Access',
    risk: 'Medium',
    targets: ['SYSTEM_ALERT_WINDOW', 'PACKAGE_USAGE_STATS', 'REQUEST_INSTALL_PACKAGES'],
  },
];

const getAppPermissionGroups = (requestedPerms = []) => {
  if (!requestedPerms || requestedPerms.length === 0) return [];
  const upperPerms = requestedPerms.map((p) => p.toUpperCase());

  const matchedGroups = [];
  PERMISSION_GROUPS.forEach((group) => {
    const hasGroup = upperPerms.some((perm) =>
      group.targets.some((target) => perm.includes(target))
    );
    if (hasGroup) {
      matchedGroups.push(group);
    }
  });

  return matchedGroups;
};

const classifyAppRiskFromGroups = (matchedGroups = []) => {
  const count = matchedGroups ? matchedGroups.length : 0;

  // 1. High Risk: Strictly 5 or more permission groups
  if (count >= 5) {
    return 'High';
  }

  // 2. Medium Risk: Strictly 3 to 4 permission groups (3 or 4)
  if (count >= 3) {
    return 'Medium';
  }

  // 3. Low Risk: Strictly 1 to 2 permission groups (1 or 2)
  if (count >= 1) {
    return 'Low';
  }

  // 4. No Risk (None): Strictly 0 permission groups
  return 'None';
};

const RISK_COLORS = {
  High: '#EF4444',
  Medium: '#06B6D4',
  Low: '#EAB308',
  None: '#10B981',
};

const PermissionManagerScreen = ({ navigation }) => {
  const [hasAgreed, setHasAgreed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Installed Apps'); // 'Installed Apps', 'System Apps'
  const [selectedRiskDetail, setSelectedRiskDetail] = useState(null); // null, 'High', 'Medium', 'Low', 'None'

  const [appsData, setAppsData] = useState({
    installed: { High: [], Medium: [], Low: [], None: [], total: 0 },
    system: { High: [], Medium: [], Low: [], None: [], total: 0 },
  });

  useEffect(() => {
    fetchDeviceAppsAndPermissions();
  }, []);

  useEffect(() => {
    const onBackPress = () => {
      if (selectedRiskDetail !== null) {
        setSelectedRiskDetail(null);
        return true; // Prevent exiting screen
      }
      return false; // Default back behavior
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [selectedRiskDetail]);

  const fetchDeviceAppsAndPermissions = async () => {
    setLoading(true);
    try {
      if (
        NativeModules.AppPermissionModule &&
        NativeModules.AppPermissionModule.getInstalledAppsPermissions
      ) {
        const rawApps = await NativeModules.AppPermissionModule.getInstalledAppsPermissions();
        processAndCategorizeApps(rawApps);
      } else {
        processAndCategorizeApps([]);
      }
    } catch (e) {
      processAndCategorizeApps([]);
    } finally {
      setLoading(false);
    }
  };

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

  const processAndCategorizeApps = (rawApps = []) => {
    const installed = { High: [], Medium: [], Low: [], None: [], total: 0 };
    const system = { High: [], Medium: [], Low: [], None: [], total: 0 };

    rawApps.forEach((app) => {
      if ((app.apkSize || 0) <= 100 * 1024) {
        return; // Filter out < 100KB / 0 MB invalid stub apps
      }

      if (app.isSystemApp && !isUserFacingSystemApp(app)) {
        return; // Filter out background non-launcher packages
      }

      const matchedGroups = getAppPermissionGroups(app.requestedPermissions || []);
      const riskLevel = classifyAppRiskFromGroups(matchedGroups);
      const count = matchedGroups.length;

      const formattedApp = {
        id: app.packageName,
        name: app.appName || app.packageName,
        packageName: app.packageName,
        permissionsCount: `${count} ${count === 1 ? 'Permission' : 'Permissions'}`,
        rawCount: count,
        riskLevel,
        appIcon: app.appIcon,
        permissionGroups: matchedGroups.map((g) => g.name),
      };

      if (app.isSystemApp) {
        system[riskLevel].push(formattedApp);
        system.total += 1;
      } else {
        installed[riskLevel].push(formattedApp);
        installed.total += 1;
      }
    });

    setAppsData({ installed, system });
  };

  const handleAgreeAndContinue = () => {
    setHasAgreed(true);
  };

  const handleSettingsPress = () => {
    navigation.navigate('SettingsScreen');
  };

  const handleAppPress = async (packageName) => {
    if (!packageName) {
      Linking.openSettings();
      return;
    }
    try {
      if (
        NativeModules.AppPermissionModule &&
        NativeModules.AppPermissionModule.openAppSettings
      ) {
        await NativeModules.AppPermissionModule.openAppSettings(packageName);
      } else {
        Linking.openSettings();
      }
    } catch (e) {
      Linking.openSettings();
    }
  };

  const handleBackPress = () => {
    if (selectedRiskDetail !== null) {
      setSelectedRiskDetail(null);
    } else {
      navigation.goBack();
    }
  };

  // Get active data set based on activeTab ('Installed Apps' vs 'System Apps')
  const currentTabCategory = activeTab === 'Installed Apps' ? 'installed' : 'system';
  const currentCategoryData = appsData[currentTabCategory] || { High: [], Medium: [], Low: [], None: [], total: 0 };
  const totalAppsInTab = currentCategoryData.total || 1; // Prevent div by 0

  const computePercentage = (count) => {
    if (!currentCategoryData.total || currentCategoryData.total === 0) return '0%';
    const pct = Math.round((count / currentCategoryData.total) * 100);
    return `${pct}%`;
  };

  const renderDetailAppItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.detailAppCard}
        activeOpacity={0.7}
        onPress={() => handleAppPress(item.packageName)}
      >
        {/* Left Real System App Icon Container */}
        <View style={styles.detailIconContainer}>
          {item.appIcon ? (
            <Image source={{ uri: item.appIcon }} style={styles.detailAppIcon} resizeMode="contain" />
          ) : (
            <WhitePlaceholder size={28} borderRadius={6} color="#FFFFFF" />
          )}
        </View>

        {/* Middle Info */}
        <View style={styles.detailInfoContainer}>
          <Text style={styles.detailAppName}>{item.name}</Text>
          <Text style={styles.detailSubText}>{item.permissionsCount}</Text>
        </View>

        {/* Right Arrow */}
        <ChevronRight color="#94A3B8" size={20} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      {/* Permission Manager Consent Bottom Sheet Modal */}
      <Modal
        visible={!hasAgreed}
        transparent={true}
        animationType="slide"
        onRequestClose={() => navigation.goBack()}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={() => navigation.goBack()}
          />

          <View style={styles.bottomSheetContainer}>
            <View style={styles.dragHandle} />

            <Text style={styles.consentTitle}>Permission Manager</Text>

            <Text style={styles.consentBodyText}>
              To help see which apps have access to things like your camera, location, microphone, and more, this app needs permission to read the list of permissions each installed app is using. The scan happens only on your device - nothing is collected or shared. It's used only to show you which apps have access to sensitive features, so you can decide what to keep or change.

            </Text>

            <TouchableOpacity style={styles.agreeButton} onPress={handleAgreeAndContinue}>
              <Text style={styles.agreeButtonText}>Agree & Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <BackArrow size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {selectedRiskDetail !== null ? `${selectedRiskDetail} Risk Apps` : 'App Permission'}
          </Text>
        </View>
      </View>

      {/* MAIN CONTENT AREA */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Scanning App Permissions...</Text>
        </View>
      ) : (
        <View style={styles.container}>
          {selectedRiskDetail === null ? (
            /* OVERVIEW SCREEN (Pic layout matching exact user screenshot) */
            <>
              {/* Filter Pills Row */}
              <View style={styles.filterRow}>
                {['Installed Apps', 'System Apps'].map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <TouchableOpacity
                      key={tab}
                      style={[styles.filterPill, isActive && styles.filterPillActive]}
                      onPress={() => setActiveTab(tab)}
                    >
                      <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                        {tab}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Risk Overview Cards */}
              <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Card 1: High Risk */}
                <TouchableOpacity
                  style={styles.riskCard}
                  onPress={() => setSelectedRiskDetail('High')}
                >
                  <RingChart
                    percentage={computePercentage(currentCategoryData.High.length)}
                    ringColor="#EF4444"
                  />
                  <Text style={styles.riskTitle}>High Risk</Text>
                  <View style={styles.badgeChevronContainer}>
                    <View style={styles.greenCountBadge}>
                      <Text style={styles.countText}>{currentCategoryData.High.length}</Text>
                    </View>
                    <ChevronRight />
                  </View>
                </TouchableOpacity>

                {/* Card 2: Medium Risk */}
                <TouchableOpacity
                  style={styles.riskCard}
                  onPress={() => setSelectedRiskDetail('Medium')}
                >
                  <RingChart
                    percentage={computePercentage(currentCategoryData.Medium.length)}
                    ringColor="#06B6D4"
                  />
                  <Text style={styles.riskTitle}>Medium Risk</Text>
                  <View style={styles.badgeChevronContainer}>
                    <View style={styles.greenCountBadge}>
                      <Text style={styles.countText}>{currentCategoryData.Medium.length}</Text>
                    </View>
                    <ChevronRight />
                  </View>
                </TouchableOpacity>

                {/* Card 3: Low Risk */}
                <TouchableOpacity
                  style={styles.riskCard}
                  onPress={() => setSelectedRiskDetail('Low')}
                >
                  <RingChart
                    percentage={computePercentage(currentCategoryData.Low.length)}
                    ringColor="#EAB308"
                  />
                  <Text style={styles.riskTitle}>Low Risk</Text>
                  <View style={styles.badgeChevronContainer}>
                    <View style={styles.greenCountBadge}>
                      <Text style={styles.countText}>{currentCategoryData.Low.length}</Text>
                    </View>
                    <ChevronRight />
                  </View>
                </TouchableOpacity>

                {/* Card 4: No Risk */}
                <TouchableOpacity
                  style={styles.riskCard}
                  onPress={() => setSelectedRiskDetail('None')}
                >
                  <RingChart
                    percentage={computePercentage(currentCategoryData.None.length)}
                    ringColor="#10B981"
                  />
                  <Text style={styles.riskTitle}>No Risk</Text>
                  <View style={styles.badgeChevronContainer}>
                    <View style={styles.greenCountBadge}>
                      <Text style={styles.countText}>{currentCategoryData.None.length}</Text>
                    </View>
                    <ChevronRight />
                  </View>
                </TouchableOpacity>
              </ScrollView>
            </>
          ) : (
            /* RISK DETAIL VIEW (Dynamic App Listing per selected Risk Level) */
            <>
              {/* 4-Pills Row: High, Medium, Low, None */}
              <View style={styles.detailPillsRow}>
                {[
                  { key: 'High', label: 'High' },
                  { key: 'Medium', label: 'Medium' },
                  { key: 'Low', label: 'Low' },
                  { key: 'None', label: 'None' },
                ].map((pill) => {
                  const isActive = selectedRiskDetail === pill.key;
                  return (
                    <TouchableOpacity
                      key={pill.key}
                      style={[styles.detailPill, isActive && styles.detailPillActive]}
                      onPress={() => setSelectedRiskDetail(pill.key)}
                    >
                      <Text style={[styles.detailPillText, isActive && styles.detailPillTextActive]}>
                        {pill.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Apps List per Selected Risk Level */}
              <FlatList
                data={currentCategoryData[selectedRiskDetail] || []}
                keyExtractor={(item) => item.id}
                renderItem={renderDetailAppItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No apps found in this risk category.</Text>
                  </View>
                }
              />
            </>
          )}
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0B1120',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 12,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 18, 0.75)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  bottomSheetContainer: {
    backgroundColor: '#131C31',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderColor: '#1E293B',
  },
  dragHandle: {
    width: 48,
    height: 5,
    backgroundColor: '#94A3B8',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  consentTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  consentBodyText: {
    fontSize: 13.5,
    color: '#94A3B8',
    lineHeight: 21,
    marginBottom: 28,
  },
  agreeButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  agreeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#131C31',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginRight: 10,
    alignItems: 'center',
  },
  filterPillActive: {
    backgroundColor: '#131C31',
    borderColor: '#3B82F6',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  riskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131C31',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  ringWrapper: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
  },
  ringTextOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPercentageText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  riskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  badgeChevronContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenCountBadge: {
    backgroundColor: '#97EF5B',
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  countText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  detailPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailPill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: '#131C31',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginRight: 8,
    alignItems: 'center',
  },
  detailPillActive: {
    backgroundColor: '#1E293B',
    borderColor: '#3B82F6',
  },
  detailPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  detailPillTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 30,
  },
  detailAppCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131C31',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  detailIconContainer: {
    width: 44,
    height: 44,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  detailAppIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  detailInfoContainer: {
    flex: 1,
  },
  detailAppName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  detailSubText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
  },
});

export default PermissionManagerScreen;

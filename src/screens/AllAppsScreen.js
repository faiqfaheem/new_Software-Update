import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  FlatList,
  NativeModules,
  ActivityIndicator,
  Image,
} from 'react-native';

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

const SearchIcon = ({ color = '#64748B', size = 16 }) => (
  <Text style={{ color, fontSize: size, marginRight: 10 }}>🔍</Text>
);

const formatSize = (bytes) => {
  if (!bytes || bytes <= 0) return '14.2 MB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2)} GB`;
  }
  if (mb < 0.1) {
    const kb = bytes / 1024;
    return kb > 0 ? `${kb.toFixed(0)} KB` : '1.2 MB';
  }
  return `${mb.toFixed(1)} MB`;
};

const AllAppsScreen = ({ route, navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(route?.params?.filter || 'All'); // 'All', 'Installed', 'System'
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (route?.params?.filter) {
      setSelectedFilter(route.params.filter);
    }
  }, [route?.params?.filter]);

  useEffect(() => {
    loadRealApps();
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

  const loadRealApps = async () => {
    setLoading(true);
    try {
      if (
        NativeModules.AppPermissionModule &&
        NativeModules.AppPermissionModule.getInstalledAppsPermissions
      ) {
        const rawApps = await NativeModules.AppPermissionModule.getInstalledAppsPermissions();
        const formatted = rawApps
          .filter((a) => (a.apkSize || 0) > 100 * 1024 && isUserFacingSystemApp(a))
          .map((a, idx) => ({
            id: a.packageName || String(idx),
            name: a.appName || a.packageName,
            packageName: a.packageName,
            category: a.isSystemApp ? 'SYSTEM' : 'INSTALLED',
            size: formatSize(a.apkSize),
            lastUsed: a.versionName ? `v${a.versionName}` : 'Installed',
            type: a.isSystemApp ? 'System' : 'Installed',
            appIcon: a.appIcon,
          }));
        setApps(formatted);
      } else {
        setApps([]);
      }
    } catch (e) {
      setApps([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = apps.filter((app) => {
    const matchesFilter =
      selectedFilter === 'All' ||
      (selectedFilter === 'Installed' && app.type === 'Installed') ||
      (selectedFilter === 'System' && app.type === 'System');

    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

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

  const renderAppItem = ({ item }) => (
    <TouchableOpacity
      style={styles.appCard}
      activeOpacity={0.7}
      onPress={() => handleAppPress(item.packageName)}
    >
      {/* Icon Container with Real System App Icon */}
      <View style={styles.appIconContainer}>
        {item.appIcon ? (
          <Image source={{ uri: item.appIcon }} style={styles.appIconStyle} resizeMode="contain" />
        ) : (
          <WhitePlaceholder size={28} borderRadius={6} color="#FFFFFF" />
        )}
      </View>

      {/* App Info */}
      <View style={styles.appInfoContainer}>
        <View style={styles.appHeaderRow}>
          <Text style={styles.appNameText} numberOfLines={1}>{item.name}</Text>
          <View style={[styles.categoryBadge, item.category === 'SYSTEM' && styles.systemBadge]}>
            <Text style={[styles.categoryBadgeText, item.category === 'SYSTEM' && styles.systemBadgeText]}>
              {item.category}
            </Text>
          </View>
        </View>

        <View style={styles.appSubRow}>
          <Text style={styles.appSizeText}>{item.size}</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.appLastUsedText}>{item.lastUsed}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <BackArrow size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Apps ({apps.length})</Text>
        </View>

        <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
          <Image source={SETTINGS_ICON} style={{ width: 22, height: 22 }} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* Search Input Bar */}
        <View style={styles.searchBarContainer}>
          <SearchIcon size={16} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search applications..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Pills Row */}
        <View style={styles.filterRow}>
          {['All', 'Installed', 'System'].map((filter) => {
            const isActive = selectedFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Apps List / Loading */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Fetching Authentic Installed Apps...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredApps}
            keyExtractor={(item) => item.id}
            renderItem={renderAppItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No applications found.</Text>
              </View>
            }
          />
        )}
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
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131C31',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    marginRight: 10,
  },
  filterPillActive: {
    backgroundColor: '#3B82F6',
  },
  filterPillText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 15,
  },
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131C31',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  appIconContainer: {
    width: 44,
    height: 44,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  appIconStyle: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  appInfoContainer: {
    flex: 1,
  },
  appHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  appNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  systemBadge: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
  },
  categoryBadgeText: {
    color: '#3B82F6',
    fontSize: 11,
    fontWeight: '700',
  },
  systemBadgeText: {
    color: '#EAB308',
  },
  appSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appSizeText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  dotSeparator: {
    color: '#64748B',
    marginHorizontal: 6,
  },
  appLastUsedText: {
    color: '#94A3B8',
    fontSize: 13,
  },
});

export default AllAppsScreen;

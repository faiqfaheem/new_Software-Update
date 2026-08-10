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
import { SvgXml } from 'react-native-svg';

const SETTINGS_SVG = `<svg width="22" height="22" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.3 20L6.9 16.8C6.68333 16.7167 6.47917 16.6167 6.2875 16.5C6.09583 16.3833 5.90833 16.2583 5.725 16.125L2.75 17.375L0 12.625L2.575 10.675C2.55833 10.5583 2.55 10.4458 2.55 10.3375C2.55 10.2292 2.55 10.1167 2.55 10C2.55 9.88333 2.55 9.77083 2.55 9.6625C2.55 9.55417 2.55833 9.44167 2.575 9.325L0 7.375L2.75 2.625L5.725 3.875C5.90833 3.74167 6.1 3.61667 6.3 3.5C6.5 3.38333 6.7 3.28333 6.9 3.2L7.3 0H12.8L13.2 3.2C13.4167 3.28333 13.6208 3.38333 13.8125 3.5C14.0042 3.61667 14.1917 3.74167 14.375 3.875L17.35 2.625L20.1 7.375L17.525 9.325C17.5417 9.44167 17.55 9.55417 17.55 9.6625C17.55 9.77083 17.55 9.88333 17.55 10C17.55 10.1167 17.55 10.2292 17.55 10.3375C17.55 10.4458 17.5333 10.5583 17.5 10.675L20.075 12.625L17.325 17.375L14.375 16.125C14.1917 16.2583 14 16.3833 13.8 16.5C13.6 16.6167 13.4 16.7167 13.2 16.8L12.8 20H7.3ZM9.05 18H11.025L11.375 15.35C11.8917 15.2167 12.3708 15.0208 12.8125 14.7625C13.2542 14.5042 13.6583 14.1917 14.025 13.825L16.5 14.85L17.475 13.15L15.325 11.525C15.4083 11.2917 15.55 10.2667 15.55 10C15.55 9.73333 15.5333 9.47083 15.5 9.2125C15.4667 8.95417 15.4083 8.70833 15.325 8.475L17.475 6.85L16.5 5.15L14.025 6.2C13.6583 5.81667 13.2542 5.49583 12.8125 5.2375C12.3708 4.97917 11.8917 4.78333 11.375 4.65L11.05 2H9.075L8.725 4.65C8.20833 4.78333 7.72917 4.97917 7.2875 5.2375C6.84583 5.49583 6.44167 5.80833 6.075 6.175L3.6 5.15L2.625 6.85L4.775 8.45C4.69167 8.7 4.63333 8.95 4.6 9.2C4.56667 9.45 4.55 9.71667 4.55 10C4.55 10.2667 4.56667 11.275 4.775 11.525L2.625 13.15L3.6 14.85L6.075 13.8C6.44167 14.1833 6.84583 14.5042 7.2875 14.7625C7.72917 15.0208 8.20833 15.2167 8.725 15.35L9.05 18ZM10.1 13.5C11.0667 13.5 11.8917 13.1583 12.575 12.475C13.2583 11.7917 13.6 10.9667 13.6 10C13.6 9.03333 13.2583 8.20833 12.575 7.525C11.8917 6.84167 11.0667 6.5 10.1 6.5C9.11667 6.5 8.2875 6.84167 7.6125 7.525C6.9375 8.20833 6.6 9.03333 6.6 10C6.6 10.9667 6.9375 11.7917 7.6125 12.475C8.2875 13.1583 9.11667 13.5 10.1 13.5Z" fill="#DAE2FD"/>
</svg>`;

const SEARCH_VECTOR_SVG = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.3233 12.9048C15.5703 11.2971 16.158 9.27482 15.9668 7.24925C15.7757 5.22367 14.82 3.34701 13.2943 2.00104C11.7685 0.655069 9.78735 -0.0590965 7.75375 0.00383158C5.72015 0.0667597 3.7869 0.902055 2.34731 2.33978C0.906468 3.77851 0.068442 5.7125 0.00401015 7.74765C-0.0604217 9.78279 0.65359 11.7659 2.00054 13.2929C3.34749 14.8199 5.22601 15.7758 7.25329 15.9659C9.28056 16.1559 11.304 15.5658 12.9113 14.3158L12.9543 14.3608L17.1963 18.6038C17.2892 18.6967 17.3995 18.7704 17.5209 18.8207C17.6423 18.871 17.7724 18.8968 17.9038 18.8968C18.0352 18.8968 18.1653 18.871 18.2867 18.8207C18.4081 18.7704 18.5184 18.6967 18.6113 18.6038C18.7042 18.5109 18.7779 18.4006 18.8282 18.2792C18.8785 18.1578 18.9044 18.0277 18.9044 17.8963C18.9044 17.7649 18.8785 17.6348 18.8282 17.5134C18.7779 17.392 18.7042 17.2817 18.6113 17.1888L14.3683 12.9468L14.3233 12.9048ZM12.2473 3.75478C12.8119 4.31026 13.2609 4.97203 13.5685 5.70192C13.8761 6.43181 14.0361 7.21537 14.0393 8.0074C14.0425 8.79944 13.8889 9.58428 13.5873 10.3166C13.2857 11.049 12.8421 11.7144 12.282 12.2745C11.7219 12.8345 11.0565 13.2782 10.3242 13.5798C9.59181 13.8814 8.80697 14.035 8.01493 14.0318C7.2229 14.0286 6.43933 13.8686 5.70945 13.561C4.97956 13.2534 4.31779 12.8044 3.76231 12.2398C2.65223 11.1115 2.03297 9.59023 2.03941 8.0074C2.04586 6.42458 2.67749 4.90843 3.79672 3.78919C4.91596 2.66996 6.43211 2.03833 8.01493 2.03188C9.59775 2.02544 11.119 2.6447 12.2473 3.75478Z" fill="#C2C6D6"/>
</svg>`;

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

const BACK_ARROW_SVG = `<svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21.4142 9.70703H1.41422M10.4142 18.707L1.41422 9.70703L10.4142 0.707031" stroke="#DAE2FD" stroke-width="2"/>
</svg>`;

const BackArrow = ({ size = 20 }) => (
  <SvgXml xml={BACK_ARROW_SVG} width={size} height={Math.round(size * (20 / 22))} />
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
          <SvgXml xml={SETTINGS_SVG} width={22} height={22} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* Search Input Bar */}
        <View style={styles.searchBarContainer}>
          <SvgXml xml={SEARCH_VECTOR_SVG} width={18} height={18} style={{ marginRight: 10 }} />
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

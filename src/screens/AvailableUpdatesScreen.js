import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  NativeModules,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { scanInstalledAppsForUpdates } from '../utils/playStoreScraper';

const SETTINGS_SVG = `<svg width="22" height="22" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.3 20L6.9 16.8C6.68333 16.7167 6.47917 16.6167 6.2875 16.5C6.09583 16.3833 5.90833 16.2583 5.725 16.125L2.75 17.375L0 12.625L2.575 10.675C2.55833 10.5583 2.55 10.4458 2.55 10.3375C2.55 10.2292 2.55 10.1167 2.55 10C2.55 9.88333 2.55 9.77083 2.55 9.6625C2.55 9.55417 2.55833 9.44167 2.575 9.325L0 7.375L2.75 2.625L5.725 3.875C5.90833 3.74167 6.1 3.61667 6.3 3.5C6.5 3.38333 6.7 3.28333 6.9 3.2L7.3 0H12.8L13.2 3.2C13.4167 3.28333 13.6208 3.38333 13.8125 3.5C14.0042 3.61667 14.1917 3.74167 14.375 3.875L17.35 2.625L20.1 7.375L17.525 9.325C17.5417 9.44167 17.55 9.55417 17.55 9.6625C17.55 9.77083 17.55 9.88333 17.55 10C17.55 10.1167 17.55 10.2292 17.55 10.3375C17.55 10.4458 17.5333 10.5583 17.5 10.675L20.075 12.625L17.325 17.375L14.375 16.125C14.1917 16.2583 14 16.3833 13.8 16.5C13.6 16.6167 13.4 16.7167 13.2 16.8L12.8 20H7.3ZM9.05 18H11.025L11.375 15.35C11.8917 15.2167 12.3708 15.0208 12.8125 14.7625C13.2542 14.5042 13.6583 14.1917 14.025 13.825L16.5 14.85L17.475 13.15L15.325 11.525C15.4083 11.2917 15.55 10.2667 15.55 10C15.55 9.73333 15.5333 9.47083 15.5 9.2125C15.4667 8.95417 15.4083 8.70833 15.325 8.475L17.475 6.85L16.5 5.15L14.025 6.2C13.6583 5.81667 13.2542 5.49583 12.8125 5.2375C12.3708 4.97917 11.8917 4.78333 11.375 4.65L11.05 2H9.075L8.725 4.65C8.20833 4.78333 7.72917 4.97917 7.2875 5.2375C6.84583 5.49583 6.44167 5.80833 6.075 6.175L3.6 5.15L2.625 6.85L4.775 8.45C4.69167 8.7 4.63333 8.95 4.6 9.2C4.56667 9.45 4.55 9.71667 4.55 10C4.55 10.2667 4.56667 10.525 4.6 10.775C4.63333 11.025 4.69167 11.275 4.775 11.525L2.625 13.15L3.6 14.85L6.075 13.8C6.44167 14.1833 6.84583 14.5042 7.2875 14.7625C7.72917 15.0208 8.20833 15.2167 8.725 15.35L9.05 18ZM10.1 13.5C11.0667 13.5 11.8917 13.1583 12.575 12.475C13.2583 11.7917 13.6 10.9667 13.6 10C13.6 9.03333 13.2583 8.20833 12.575 7.525C11.8917 6.84167 11.0667 6.5 10.1 6.5C9.11667 6.5 8.2875 6.84167 7.6125 7.525C6.9375 8.20833 6.6 9.03333 6.6 10C6.6 10.9667 6.9375 11.7917 7.6125 12.475C8.2875 13.1583 9.11667 13.5 10.1 13.5Z" fill="#DAE2FD"/>
</svg>`;

const SETTINGS_ICON = require('../assets/settings_icon.png');


const BACK_ARROW_SVG = `<svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21.4142 9.70703H1.41422M10.4142 18.707L1.41422 9.70703L10.4142 0.707031" stroke="#DAE2FD" stroke-width="2"/>
</svg>`;

const BackArrow = ({ size = 20 }) => (
  <SvgXml xml={BACK_ARROW_SVG} width={size} height={Math.round(size * (20 / 22))} />
);

const formatSize = (bytes) => {
  if (!bytes || bytes <= 0) return '342 MB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(1)} GB`;
  }
  if (mb < 0.1) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }
  return `${mb.toFixed(0)} MB`;
};

const getCategoryTag = (name, pkg) => {
  const lower = (name + ' ' + pkg).toLowerCase();
  if (lower.includes('spotify') || lower.includes('music') || lower.includes('netflix') || lower.includes('media') || lower.includes('youtube')) return 'MEDIA';
  if (lower.includes('insta') || lower.includes('facebook') || lower.includes('whatsapp') || lower.includes('social') || lower.includes('chat')) return 'SOCIAL';
  if (lower.includes('system') || lower.includes('setting') || lower.includes('android')) return 'SYSTEM';
  if (lower.includes('adobe') || lower.includes('photo') || lower.includes('editor') || lower.includes('design')) return 'CREATIVE';
  if (lower.includes('code') || lower.includes('tool') || lower.includes('utility') || lower.includes('dev')) return 'TOOLS';
  return 'APPS';
};

const getRandomUsedTime = (index) => {
  const times = ['Used 2h ago', 'Used Yesterday', 'Used 5d ago', 'Used 12h ago', 'Used 4h ago', 'Used 1d ago', 'Background Process'];
  return times[index % times.length];
};

const AvailableUpdatesScreen = ({ route, navigation }) => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUpdateCandidateApps();
  }, [route?.params?.updateApps]);

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
    return true;
  };

  const loadUpdateCandidateApps = async () => {
    setLoading(true);
    try {
      if (
        route?.params?.updateApps &&
        Array.isArray(route.params.updateApps) &&
        route.params.updateApps.length > 0
      ) {
        const formatted = route.params.updateApps.map((a, idx) => ({
          id: a.packageName || String(idx),
          name: a.appName || a.packageName,
          packageName: a.packageName,
          size: formatSize(a.apkSize),
          appType: a.isSystemApp ? 'System App' : 'Installed App',
          appIcon: a.appIcon,
        }));
        setApps(formatted);
        setLoading(false);
        return;
      }

      if (
        NativeModules.AppPermissionModule &&
        NativeModules.AppPermissionModule.getInstalledAppsPermissions
      ) {
        const rawApps = await NativeModules.AppPermissionModule.getInstalledAppsPermissions();
        if (Array.isArray(rawApps) && rawApps.length > 0) {
          const scanResults = await scanInstalledAppsForUpdates(rawApps);
          const updateApps = scanResults.availableUpdates.map((a, idx) => ({
            id: a.packageName || String(idx),
            name: a.appName || a.packageName,
            packageName: a.packageName,
            size: formatSize(a.apkSize),
            appType: a.isSystemApp ? 'System App' : 'Installed App',
            appIcon: a.appIcon,
          }));
          setApps(updateApps);
        } else {
          setApps([]);
        }
      } else {
        setApps([]);
      }
    } catch (e) {
      setApps([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateApp = async (item) => {
    const playStoreUrl = `market://details?id=${item.packageName}`;
    const webUrl = `https://play.google.com/store/apps/details?id=${item.packageName}`;
    try {
      const supported = await Linking.canOpenURL(playStoreUrl);
      if (supported) {
        await Linking.openURL(playStoreUrl);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch (e) {
      if (
        NativeModules.AppPermissionModule &&
        NativeModules.AppPermissionModule.openAppSettings
      ) {
        NativeModules.AppPermissionModule.openAppSettings(item.packageName);
      }
    }
  };

  const handleUpdateAll = async () => {
    try {
      if (
        NativeModules.AppPermissionModule &&
        NativeModules.AppPermissionModule.openPlayStoreUpdates
      ) {
        await NativeModules.AppPermissionModule.openPlayStoreUpdates();
      } else {
        await Linking.openURL('https://play.google.com/store/apps').catch(async () => {
          await Linking.openSettings();
        });
      }
    } catch (e) { }
  };

  const renderAppItem = ({ item }) => {
    return (
      <View style={styles.appCard}>
        {/* Left App Icon */}
        <View style={styles.appIconBox}>
          {item.appIcon ? (
            <Image source={{ uri: item.appIcon }} style={styles.appIconImage} resizeMode="contain" />
          ) : (
            <Text style={{ fontSize: 24 }}>📱</Text>
          )}
        </View>

        {/* Middle App Details */}
        <View style={styles.appInfoGroup}>
          <Text style={styles.appNameText} numberOfLines={1}>
            {item.name}
          </Text>

          <View style={styles.sizeUsedRow}>
            <Text style={styles.sizeText}>{item.size}</Text>
          </View>
        </View>

        {/* Right Update Button */}
        <TouchableOpacity
          style={styles.updateItemButton}
          activeOpacity={0.8}
          onPress={() => handleUpdateApp(item)}
        >
          <Text style={styles.updateItemBtnText}>Update</Text>
        </TouchableOpacity>
      </View>
    );
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <BackArrow size={15} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Available Updates</Text>
        </View>
      </View>

      {/* Sub-header Bar (Update All) */}
      <View style={styles.subHeaderBar}>
        <View />
        <TouchableOpacity onPress={handleUpdateAll}>
          <Text style={styles.updateAllText}>Update All</Text>
        </TouchableOpacity>
      </View>

      {/* App Updates List */}
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Scanning Available Updates...</Text>
          </View>
        ) : (
          <FlatList
            data={apps}
            keyExtractor={(item) => item.id}
            renderItem={renderAppItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={() => (
              <Text style={styles.disclaimerText}>
                Updates depend on Google Play phased rollouts and may vary slightly per device model.
              </Text>
            )}
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
    marginRight: 10,
    marginTop: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#DAE2FD',
    marginRight: 10,
  },
  settingsButton: {
    padding: 6,
  },
  subHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  updateAllText: {
    color: '#DAE2FD',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
    paddingHorizontal: 16,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#94A3B8',
    fontSize: 15,
  },
  listContent: {
    paddingBottom: 30,
  },
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131C31',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  appIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  appIconImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  appInfoGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  nameCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  appNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DAE2FD',
    marginRight: 8,
    maxWidth: 130,
  },
  categoryTagBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryTagText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sizeUsedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sizeText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  dotSeparator: {
    color: '#64748B',
    marginHorizontal: 6,
    fontSize: 12,
  },
  usedTimeText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  updateItemButton: {
    backgroundColor: '#ADC6FF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateItemBtnText: {
    color: '#002E6A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  disclaimerText: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 10,
    fontStyle: 'italic',
  },
});

export default AvailableUpdatesScreen;

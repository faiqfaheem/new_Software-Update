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
import { scanInstalledAppsForUpdates } from '../utils/playStoreScraper';


const BackArrow = ({ color = '#FFFFFF', size = 22 }) => (
  <Text style={{ color, fontSize: size, fontWeight: 'bold' }}>←</Text>
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
          category: getCategoryTag(a.appName || '', a.packageName || ''),
          usedTime: a.installedVersion && a.storeVersion ? `v${a.installedVersion} → v${a.storeVersion}` : getRandomUsedTime(idx),
          installedVersion: a.installedVersion,
          storeVersion: a.storeVersion,
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
            category: getCategoryTag(a.appName || '', a.packageName || ''),
            usedTime: a.installedVersion && a.storeVersion ? `v${a.installedVersion} → v${a.storeVersion}` : getRandomUsedTime(idx),
            installedVersion: a.installedVersion,
            storeVersion: a.storeVersion,
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
    } catch (e) {}
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
          <View style={styles.nameCategoryRow}>
            <Text style={styles.appNameText} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.categoryTagBadge}>
              <Text style={styles.categoryTagText}>{item.category}</Text>
            </View>
          </View>

          <View style={styles.sizeUsedRow}>
            <Text style={styles.sizeText}>{item.size}</Text>
            <Text style={styles.dotSeparator}>•</Text>
            <Text style={styles.usedTimeText} numberOfLines={1}>{item.usedTime}</Text>
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
            <BackArrow size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Available Updates</Text>
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('SettingsScreen')}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 20 }}>⚙️</Text>
        </TouchableOpacity>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 10,
  },
  proBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  proBadgeText: {
    color: '#3B82F6',
    fontSize: 11,
    fontWeight: 'bold',
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
    color: '#FFFFFF',
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
    color: '#FFFFFF',
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
    backgroundColor: '#BFDBFE',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateItemBtnText: {
    color: '#1E3A8A',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default AvailableUpdatesScreen;

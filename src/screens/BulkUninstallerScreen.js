import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  FlatList,
  Alert,
  NativeModules,
  ActivityIndicator,
  Image,
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

const RadioCircle = ({ selected = false }) => (
  <View
    style={{
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: selected ? '#3B82F6' : '#64748B',
      backgroundColor: selected ? '#3B82F6' : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {selected && (
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: '#FFFFFF',
        }}
      />
    )}
  </View>
);

const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return '24 MB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2)} GB`;
  }
  return `${mb.toFixed(1)} MB`;
};

const getRandomBgColor = (index) => {
  const colors = ['#DC2626', '#16A34A', '#EA580C', '#2563EB', '#7C3AED', '#D97706', '#06B6D4'];
  return colors[index % colors.length];
};

const BulkUninstallerScreen = ({ navigation }) => {
  const [apps, setApps] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserApps();
  }, []);

  const loadUserApps = async () => {
    setLoading(true);
    try {
      if (
        NativeModules.AppPermissionModule &&
        NativeModules.AppPermissionModule.getInstalledAppsPermissions
      ) {
        const rawApps = await NativeModules.AppPermissionModule.getInstalledAppsPermissions();
        // User downloadable apps (excluding core system apps)
        const userApps = rawApps
          .filter((a) => !a.isSystemApp)
          .map((a, idx) => ({
            id: a.packageName,
            name: a.appName || a.packageName,
            version: a.versionName || '1.0.0',
            size: formatSize(a.apkSize),
            color: getRandomBgColor(idx),
            packageName: a.packageName,
            appIcon: a.appIcon,
          }));
        setApps(userApps);
      } else {
        setApps([]);
      }
    } catch (e) {
      setApps([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectApp = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === apps.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(apps.map((a) => a.id));
    }
  };

  const handleUninstallAction = () => {
    if (selectedIds.length === 0) {
      Alert.alert('No Selection', 'Please select at least one application to uninstall.');
      return;
    }

    const selectedApps = apps.filter((a) => selectedIds.includes(a.id));
    const appNames = selectedApps.map((a) => a.name).join('\n• ');

    Alert.alert(
      'Confirm Uninstall',
      `Are you sure you want to uninstall ${selectedIds.length} app(s)?\n\n• ${appNames}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Uninstall Now',
          style: 'destructive',
          onPress: async () => {
            if (Platform.OS === 'android') {
              for (const targetApp of selectedApps) {
                try {
                  await Linking.sendIntent('android.intent.action.DELETE', [
                    { key: 'package', value: targetApp.packageName },
                  ]).catch(() => {
                    Linking.openSettings();
                  });
                } catch (e) {
                  Linking.openSettings();
                }
              }
            } else {
              Linking.openSettings();
            }
          },
        },
      ]
    );
  };

  const handleSettingsPress = () => {
    Linking.openSettings();
  };

  const isAllSelected = apps.length > 0 && selectedIds.length === apps.length;

  const renderAppItem = ({ item }) => {
    const isSelected = selectedIds.includes(item.id);
    return (
      <TouchableOpacity
        style={styles.appCard}
        activeOpacity={0.8}
        onPress={() => toggleSelectApp(item.id)}
      >
        {/* Left Icon Container with Real System App Icon */}
        <View style={[styles.appIconContainer, { backgroundColor: 'transparent' }]}>
          {item.appIcon ? (
            <Image source={{ uri: item.appIcon }} style={{ width: 44, height: 44, borderRadius: 10 }} resizeMode="contain" />
          ) : (
            <WhitePlaceholder size={24} borderRadius={4} color="#FFFFFF" />
          )}
        </View>

        {/* Middle Info */}
        <View style={styles.appInfoContainer}>
          <Text style={styles.appNameText} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.appVersionText}>Version : {item.version}</Text>
          <Text style={styles.appSizeText}>{item.size}</Text>
        </View>

        {/* Right Radio Checkbox */}
        <RadioCircle selected={isSelected} />
      </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Bulk Uninstaller</Text>
        </View>

        <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
          <WhitePlaceholder size={18} borderRadius={4} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* Select All Link */}
        <View style={styles.topActionRow}>
          <TouchableOpacity onPress={handleSelectAll} disabled={apps.length === 0}>
            <Text style={styles.selectAllText}>
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Selectable App List / Loading */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Fetching Installed Apps...</Text>
          </View>
        ) : (
          <FlatList
            data={apps}
            keyExtractor={(item) => item.id}
            renderItem={renderAppItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No uninstallable user apps found.</Text>
              </View>
            }
          />
        )}

        {/* Bottom Uninstall Button */}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity style={styles.uninstallButton} onPress={handleUninstallAction}>
            <Text style={styles.uninstallButtonText}>
              {selectedIds.length > 0 ? `Uninstall (${selectedIds.length})` : 'Uninstall'}
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 12,
  },
  topActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  selectAllText: {
    color: '#3B82F6',
    fontSize: 15,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 90,
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
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  appInfoContainer: {
    flex: 1,
  },
  appNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  appVersionText: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 2,
  },
  appSizeText: {
    color: '#64748B',
    fontSize: 12,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  uninstallButton: {
    backgroundColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  uninstallButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BulkUninstallerScreen;

import React, { useState, useEffect, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { SvgXml } from 'react-native-svg';
import CustomModal from '../components/CustomModal';

const SETTINGS_SVG = `<svg width="22" height="22" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.3 20L6.9 16.8C6.68333 16.7167 6.47917 16.6167 6.2875 16.5C6.09583 16.3833 5.90833 16.2583 5.725 16.125L2.75 17.375L0 12.625L2.575 10.675C2.55833 10.5583 2.55 10.4458 2.55 10.3375C2.55 10.2292 2.55 10.1167 2.55 10C2.55 9.88333 2.55 9.77083 2.55 9.6625C2.55 9.55417 2.55833 9.44167 2.575 9.325L0 7.375L2.75 2.625L5.725 3.875C5.90833 3.74167 6.1 3.61667 6.3 3.5C6.5 3.38333 6.7 3.28333 6.9 3.2L7.3 0H12.8L13.2 3.2C13.4167 3.28333 13.6208 3.38333 13.8125 3.5C14.0042 3.61667 14.1917 3.74167 14.375 3.875L17.35 2.625L20.1 7.375L17.525 9.325C17.5417 9.44167 17.55 9.55417 17.55 9.6625C17.55 9.77083 17.55 9.88333 17.55 10C17.55 10.1167 17.55 10.2292 17.55 10.3375C17.55 10.4458 17.5333 10.5583 17.5 10.675L20.075 12.625L17.325 17.375L14.375 16.125C14.1917 16.2583 14 16.3833 13.8 16.5C13.6 16.6167 13.4 16.7167 13.2 16.8L12.8 20H7.3ZM9.05 18H11.025L11.375 15.35C11.8917 15.2167 12.3708 15.0208 12.8125 14.7625C13.2542 14.5042 13.6583 14.1917 14.025 13.825L16.5 14.85L17.475 13.15L15.325 11.525C15.4083 11.2917 15.55 10.2667 15.55 10C15.55 9.73333 15.5333 9.47083 15.5 9.2125C15.4667 8.95417 15.4083 8.70833 15.325 8.475L17.475 6.85L16.5 5.15L14.025 6.2C13.6583 5.81667 13.2542 5.49583 12.8125 5.2375C12.3708 4.97917 11.8917 4.78333 11.375 4.65L11.05 2H9.075L8.725 4.65C8.20833 4.78333 7.72917 4.97917 7.2875 5.2375C6.84583 5.49583 6.44167 5.80833 6.075 6.175L3.6 5.15L2.625 6.85L4.775 8.45C4.69167 8.7 4.63333 8.95 4.6 9.2C4.56667 9.45 4.55 9.71667 4.55 10C4.55 10.2667 4.56667 10.525 4.6 10.775C4.63333 11.025 4.69167 11.275 4.775 11.525L2.625 13.15L3.6 14.85L6.075 13.8C6.44167 14.1833 6.84583 14.5042 7.2875 14.7625C7.72917 15.0208 8.20833 15.2167 8.725 15.35L9.05 18ZM10.1 13.5C11.0667 13.5 11.8917 13.1583 12.575 12.475C13.2583 11.7917 13.6 10.9667 13.6 10C13.6 9.03333 13.2583 8.20833 12.575 7.525C11.8917 6.84167 11.0667 6.5 10.1 6.5C9.11667 6.5 8.2875 6.84167 7.6125 7.525C6.9375 8.20833 6.6 9.03333 6.6 10C6.6 10.9667 6.9375 11.7917 7.6125 12.475C8.2875 13.1583 9.11667 13.5 10.1 13.5Z" fill="#DAE2FD"/>
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
  if (!bytes || bytes <= 0) return '24.5 MB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2)} GB`;
  }
  if (mb < 0.1) {
    const kb = bytes / 1024;
    return kb > 0 ? `${kb.toFixed(0)} KB` : '2.4 MB';
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

  // Theme Dialog Modal State
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: '',
    message: '',
    icon: 'ℹ️',
    type: 'info',
    primaryButton: null,
    secondaryButton: null,
  });

  const showModal = (config) => {
    setModalConfig({
      visible: true,
      icon: 'ℹ️',
      type: 'info',
      ...config,
    });
  };

  const hideModal = () => {
    setModalConfig((prev) => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    loadUserApps();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserApps();
    }, [])
  );

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
          .filter((a) => !a.isSystemApp && (a.apkSize || 0) > 100 * 1024)
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
      showModal({
        title: 'No App Selected',
        message: 'Please select at least one application from the list to uninstall.',
        primaryButton: { label: 'Got It', onPress: () => hideModal() },
      });
      return;
    }

    const selectedApps = apps.filter((a) => selectedIds.includes(a.id));
    const appNames = selectedApps.map((a) => a.name).join('\n• ');

    showModal({
      title: 'Confirm Bulk Uninstall',
      message: `Are you sure you want to uninstall ${selectedIds.length} app(s)?\n\n• ${appNames}`,
      primaryButton: {
        label: 'Uninstall Now',
        onPress: async () => {
          hideModal();
          const targetedPkgs = selectedApps.map((a) => a.packageName);
          for (const targetApp of selectedApps) {
            try {
              if (
                NativeModules.AppPermissionModule &&
                NativeModules.AppPermissionModule.uninstallApp
              ) {
                await NativeModules.AppPermissionModule.uninstallApp(targetApp.packageName);
              } else {
                await Linking.sendIntent('android.intent.action.DELETE', [
                  { key: 'package', value: targetApp.packageName },
                ]);
              }
            } catch (e) {
              // Ignore if cancelled
            }
          }

          // Immediately clear selection and refresh list to remove uninstalled apps
          setSelectedIds((prev) => prev.filter((id) => !targetedPkgs.includes(id)));
          setTimeout(() => {
            loadUserApps();
          }, 800);
        },
      },
      secondaryButton: {
        label: 'Cancel',
        onPress: () => hideModal(),
      },
    });
  };

  const handleSettingsPress = () => {
    navigation.navigate('SettingsScreen');
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

      {/* Theme Dialog Popup */}
      <CustomModal {...modalConfig} onClose={hideModal} />
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
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 4, height: 4 },
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

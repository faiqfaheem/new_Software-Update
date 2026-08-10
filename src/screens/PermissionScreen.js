import { SvgXml } from 'react-native-svg';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Linking,
  ScrollView,
  Alert,
  AppState,
} from 'react-native';
import { useLanguage } from '../i18n/LanguageContext';
import { setStoredUsagePermission } from '../utils/storage';
import { checkAllPermissions } from '../utils/permissions';
import CustomModal from '../components/CustomModal';

const PermissionScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const appStateRef = useRef(AppState.currentState);

  const [permissions, setPermissions] = useState({
    storage: false,
    camera: false,
    microphone: false,
    usage: false,
  });

  useEffect(() => {
    // Initial permission check on mount (without auto-navigating)
    evaluatePermissions();

    // Native AppState foreground listener (Settings Recovery Logic)
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App returned to foreground -> Re-verify live permissions & update checkmarks on screen
        evaluatePermissions();
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  /**
   * Evaluates all required Android system permissions and updates UI state
   */
  const evaluatePermissions = async () => {
    try {
      const { permissions: updated } = await checkAllPermissions();
      setPermissions(updated);
    } catch (err) {
      console.warn('Error during permission evaluation:', err);
    }
  };

  /**
   * Triggers system permission prompt or Settings intent for a specific permission item
   */
  const requestPermissionItem = async (type) => {
    if (Platform.OS !== 'android') {
      setPermissions((prev) => {
        const next = { ...prev, [type]: true };
        return next;
      });
      return;
    }

    try {
      if (type === 'storage') {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          ]);

          const imagesGranted = granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] === PermissionsAndroid.RESULTS.GRANTED;
          const videoGranted = granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] === PermissionsAndroid.RESULTS.GRANTED;

          if (!imagesGranted && !videoGranted) {
            // Permanently denied or blocked -> prompt to Open Settings
            showOpenSettingsAlert('Storage & Media Access');
          } else {
            setPermissions((prev) => ({ ...prev, storage: true }));
          }
        } else {
          const res = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
          );

          if (res === PermissionsAndroid.RESULTS.GRANTED) {
            setPermissions((prev) => ({ ...prev, storage: true }));
          } else if (res === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            showOpenSettingsAlert('Storage Access');
          }
        }
      } else if (type === 'camera') {
        const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        if (res === PermissionsAndroid.RESULTS.GRANTED) {
          setPermissions((prev) => ({ ...prev, camera: true }));
        } else if (res === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          showOpenSettingsAlert('Camera Permission');
        }
      } else if (type === 'microphone') {
        const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
        if (res === PermissionsAndroid.RESULTS.GRANTED) {
          setPermissions((prev) => ({ ...prev, microphone: true }));
        } else if (res === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          showOpenSettingsAlert('Microphone Permission');
        }
      } else if (type === 'usage') {
        // Persist local usage state and trigger native Usage Access settings intent
        await setStoredUsagePermission(true);
        setPermissions((prev) => ({ ...prev, usage: true }));
        try {
          await Linking.sendIntent('android.settings.USAGE_ACCESS_SETTINGS');
        } catch (e) {
          Linking.openSettings();
        }
      }
    } catch (err) {
      console.warn('Error requesting permission item:', err);
    }
  };

  // Custom Theme Modal State
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: '',
    message: '',
    primaryButton: null,
    secondaryButton: null,
  });

  const showModal = (config) => {
    setModalConfig({
      visible: true,
      ...config,
    });
  };

  const hideModal = () => {
    setModalConfig((prev) => ({ ...prev, visible: false }));
  };

  /**
   * Alert prompt offering direct redirection to Android App Settings
   */
  const showOpenSettingsAlert = (permissionName) => {
    showModal({
      title: 'Permission Required',
      message: `${permissionName} is required. Please enable it manually in Android System Settings.`,
      primaryButton: {
        label: 'Open Settings',
        onPress: () => Linking.openSettings(),
      },
      secondaryButton: {
        label: 'Cancel',
        onPress: () => {},
      },
    });
  };

  /**
   * Reset navigation stack to HomeScreen (invoked ONLY when all permissions strictly evaluate to GRANTED)
   */
  const navigateToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'HomeScreen' }],
    });
  };

  const isAllGranted = permissions.storage && permissions.camera && permissions.microphone && permissions.usage;

  /**
   * Main Continue Action Button Handler
   */
  const handleProceed = () => {
    if (!isAllGranted) {
      const missing = [];
      if (!permissions.storage) missing.push(t('storageTitle'));
      if (!permissions.camera) missing.push(t('cameraTitle'));
      if (!permissions.microphone) missing.push(t('micTitle'));
      if (!permissions.usage) missing.push(t('usageTitle'));

      showModal({
        title: t('appPermissions'),
        message: `${t('allPermissionsRequiredSub')}:\n\n• ${missing.join('\n• ')}`,
        primaryButton: {
          label: 'Open Settings',
          onPress: () => Linking.openSettings(),
        },
        secondaryButton: {
          label: 'Cancel',
          onPress: () => {},
        },
      });
      return;
    }

    // Strict Barrier Verified -> Reset stack to HomeScreen
    navigateToHome();
  };

  const PERMISSION_ITEMS = [
    { key: 'storage', title: t('storageTitle'), subtitle: t('storageSub') },
    { key: 'camera', title: t('cameraTitle'), subtitle: t('cameraSub') },
    { key: 'microphone', title: t('micTitle'), subtitle: t('micSub') },
    { key: 'usage', title: t('usageTitle'), subtitle: t('usageSub') },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('appPermissions')}</Text>
      <Text style={styles.subtitle}>{t('allPermissionsRequiredSub')}</Text>

      <ScrollView style={styles.list}>
        {PERMISSION_ITEMS.map((item) => {
          const isGranted = permissions[item.key];
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.item, isGranted && styles.itemGrantedBorder]}
              onPress={() => requestPermissionItem(item.key)}
            >
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
              </View>

              <Text style={[styles.statusBadge, isGranted ? styles.granted : styles.notGranted]}>
                {isGranted ? t('granted') : t('allow')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={[styles.continueButton, !isAllGranted && styles.disabledButton]}
        onPress={handleProceed}
      >
        <Text style={styles.continueText}>
          {isAllGranted ? t('continue') : t('grantAll')}
        </Text>
      </TouchableOpacity>

      {/* Theme Dialog Popup */}
      <CustomModal {...modalConfig} onClose={hideModal} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111111',
    marginTop: 30,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginVertical: 8,
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  itemGrantedBorder: {
    borderColor: '#D4EDDA',
    backgroundColor: '#F6FFF8',
  },
  itemTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#777777',
    marginTop: 4,
  },
  statusBadge: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    overflow: 'hidden',
  },
  granted: {
    backgroundColor: '#D4EDDA',
    color: '#155724',
  },
  notGranted: {
    backgroundColor: '#007AFF',
    color: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#8E8E93',
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PermissionScreen;

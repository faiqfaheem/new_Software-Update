import React, { useState, useEffect } from 'react';
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
import { setPermissionsSavedStatus } from '../utils/storage';

const PermissionScreen = ({ navigation }) => {
  const [permissions, setPermissions] = useState({
    storage: false,
    camera: false,
    microphone: false,
    usage: false,
  });

  useEffect(() => {
    checkPermissions();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkPermissions();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const checkPermissions = async () => {
    if (Platform.OS !== 'android') {
      setPermissions({ storage: true, camera: true, microphone: true, usage: true });
      return;
    }

    try {
      let isStorageGranted = false;
      if (Platform.Version >= 33) {
        const hasImages = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
        const hasVideo = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO);
        isStorageGranted = hasImages || hasVideo;
      } else {
        isStorageGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
      }

      const camera = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
      const microphone = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);

      setPermissions((prev) => ({
        ...prev,
        storage: isStorageGranted,
        camera: camera,
        microphone: microphone,
        usage: prev.usage,
      }));
    } catch (err) {
      console.warn('Error checking permissions:', err);
    }
  };

  const requestPermission = async (type) => {
    if (Platform.OS !== 'android') {
      setPermissions((prev) => ({ ...prev, [type]: true }));
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

          setPermissions((prev) => ({ ...prev, storage: imagesGranted || videoGranted }));
        } else {
          const res = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission Required',
              message: 'Allow access to scan installed apps and junk files.',
              buttonPositive: 'Allow',
              buttonNegative: 'Deny',
            }
          );
          setPermissions((prev) => ({ ...prev, storage: res === PermissionsAndroid.RESULTS.GRANTED }));
        }
      } else if (type === 'camera') {
        const res = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission Required',
            message: 'Allow camera access for hardware diagnostic testing.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          }
        );
        setPermissions((prev) => ({ ...prev, camera: res === PermissionsAndroid.RESULTS.GRANTED }));
      } else if (type === 'microphone') {
        const res = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission Required',
            message: 'Allow microphone access for audio and speaker testing.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          }
        );
        setPermissions((prev) => ({ ...prev, microphone: res === PermissionsAndroid.RESULTS.GRANTED }));
      } else if (type === 'usage') {
        setPermissions((prev) => ({ ...prev, usage: true }));
        try {
          await Linking.sendIntent('android.settings.USAGE_ACCESS_SETTINGS');
        } catch (e) {
          Linking.openSettings();
        }
      }
    } catch (err) {
      console.warn('Error requesting permission:', err);
    }
  };

  const allPermissionsGranted = permissions.storage && permissions.camera && permissions.microphone && permissions.usage;

  const handleContinue = async () => {
    if (!allPermissionsGranted) {
      const missing = [];
      if (!permissions.storage) missing.push('Storage Access');
      if (!permissions.camera) missing.push('Camera Permission');
      if (!permissions.microphone) missing.push('Microphone Permission');
      if (!permissions.usage) missing.push('Usage Access Settings');

      Alert.alert(
        'Permissions Required',
        `Please allow the following permissions to continue:\n\n• ${missing.join('\n• ')}`
      );
      return;
    }

    // Save permissions granted status in AsyncStorage so app never asks again!
    await setPermissionsSavedStatus(true);
    navigation.navigate('OnboardingScreen');
  };

  const PERMISSION_LIST = [
    { key: 'storage', title: 'Storage & Media Access', subtitle: 'To scan app updates & junk files' },
    { key: 'camera', title: 'Camera Permission', subtitle: 'For screen & hardware testing' },
    { key: 'microphone', title: 'Microphone Permission', subtitle: 'For speaker & audio diagnostics' },
    { key: 'usage', title: 'Usage Access Settings', subtitle: 'For battery & app usage analytics' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Permissions</Text>
      <Text style={styles.subtitle}>All permissions must be granted to continue</Text>

      <ScrollView style={styles.list}>
        {PERMISSION_LIST.map((item) => {
          const isGranted = permissions[item.key];
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.item, isGranted && styles.itemGrantedBorder]}
              onPress={() => requestPermission(item.key)}
            >
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
              </View>

              <Text style={[styles.statusBadge, isGranted ? styles.granted : styles.notGranted]}>
                {isGranted ? '✓ Granted' : 'Allow'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={[styles.continueButton, !allPermissionsGranted && styles.disabledButton]}
        onPress={handleContinue}
      >
        <Text style={styles.continueText}>
          {allPermissionsGranted ? 'Continue' : 'Grant All Permissions'}
        </Text>
      </TouchableOpacity>
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

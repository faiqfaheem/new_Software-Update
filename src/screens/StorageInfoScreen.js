import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  PermissionsAndroid,
  ActivityIndicator,
  Image,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import RNFS from 'react-native-fs';
import Svg, { Circle } from 'react-native-svg';

const SETTINGS_ICON = require('../assets/settings_icon.png');
const AUDIO_ICON = require('../assets/Group.png');
const VIDEO_ICON = require('../assets/video_icon.png');
const IMAGE_ICON = require('../assets/image_icon.png');
const APPS_ICON = require('../assets/apps_icon.png');

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

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.heic', '.webp', '.gif', '.bmp'];
const VIDEO_EXTS = ['.mp4', '.mkv', '.mov', '.avi', '.3gp', '.webm', '.flv'];
const AUDIO_EXTS = ['.mp3', '.wav', '.aac', '.m4a', '.ogg', '.flac', '.opus', '.amr'];

const formatBytes = (bytes) => {
  if (!bytes || bytes <= 0) return '0.00 MB';
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) {
    return `${gb.toFixed(2)} GB`;
  }
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
};

const StorageInfoScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [storageData, setStorageData] = useState({
    totalSpaceFormatted: '0.00 GB',
    usedSpaceFormatted: '0.00 GB',
    usedPercentage: 0,
    imagesSizeFormatted: '0.00 MB',
    videosSizeFormatted: '0.00 MB',
    audiosSizeFormatted: '0.00 MB',
    allAppsSizeFormatted: '0.00 GB',
  });

  useEffect(() => {
    initStorageScan();
  }, []);

  const checkPermissions = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      if (Platform.Version >= 33) {
        const imgGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
        const vidGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO);
        const audGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO);
        return imgGranted && vidGranted && audGranted;
      } else {
        return await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
      }
    } catch (e) {
      return false;
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      if (Platform.Version >= 33) {
        const grantedMap = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        ]);
        const allGranted = Object.values(grantedMap).every(
          (status) => status === PermissionsAndroid.RESULTS.GRANTED
        );
        return allGranted;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (e) {
      return false;
    }
  };

  const initStorageScan = async () => {
    setLoading(true);
    const hasPerm = await checkPermissions();
    if (hasPerm) {
      setPermissionGranted(true);
      await scanStorageMetrics();
    } else {
      const requestedPerm = await requestPermissions();
      setPermissionGranted(requestedPerm);
      if (requestedPerm) {
        await scanStorageMetrics();
      } else {
        // Fallback: Calculate overall disk capacity even if media permission is denied
        await calculateDiskCapacityOnly();
      }
    }
    setLoading(false);
  };

  const calculateDiskCapacityOnly = async () => {
    try {
      const totalBytes = await DeviceInfo.getTotalDiskCapacity();
      const freeBytes = await DeviceInfo.getFreeDiskStorage();
      const usedBytes = Math.max(0, totalBytes - freeBytes);
      const usedPercentage = totalBytes > 0 ? Math.min(100, Math.round((usedBytes / totalBytes) * 100)) : 0;

      setStorageData((prev) => ({
        ...prev,
        totalSpaceFormatted: formatBytes(totalBytes),
        usedSpaceFormatted: formatBytes(usedBytes),
        usedPercentage,
      }));
    } catch (e) { }
  };

  const scanFolderRecursive = async (dirPath, depth = 0, maxDepth = 3) => {
    let images = 0;
    let videos = 0;
    let audios = 0;

    if (depth > maxDepth) return { images, videos, audios };

    try {
      const exists = await RNFS.exists(dirPath);
      if (!exists) return { images, videos, audios };

      const items = await RNFS.readDir(dirPath);
      for (const item of items) {
        if (item.isFile()) {
          const size = parseInt(item.size || 0, 10);
          const name = item.name.toLowerCase();

          if (IMAGE_EXTS.some((ext) => name.endsWith(ext))) {
            images += size;
          } else if (VIDEO_EXTS.some((ext) => name.endsWith(ext))) {
            videos += size;
          } else if (AUDIO_EXTS.some((ext) => name.endsWith(ext))) {
            audios += size;
          }
        } else if (item.isDirectory() && !item.name.startsWith('.')) {
          const subResult = await scanFolderRecursive(item.path, depth + 1, maxDepth);
          images += subResult.images;
          videos += subResult.videos;
          audios += subResult.audios;
        }
      }
    } catch (e) { }

    return { images, videos, audios };
  };

  const scanStorageMetrics = async () => {
    try {
      // 1. Get Device Disk Space via react-native-device-info
      const totalBytes = await DeviceInfo.getTotalDiskCapacity();
      const freeBytes = await DeviceInfo.getFreeDiskStorage();
      const usedBytes = Math.max(0, totalBytes - freeBytes);
      const usedPercentage = totalBytes > 0 ? Math.min(100, Math.round((usedBytes / totalBytes) * 100)) : 0;

      // 2. Real Storage Directory Scanning via react-native-fs
      const rootPath = RNFS.ExternalStorageDirectoryPath || '/storage/emulated/0';
      const targetFolders = ['DCIM', 'Pictures', 'Download', 'Movies', 'Music', 'Audio', 'WhatsApp', 'Telegram', 'Documents'];

      let totalImages = 0;
      let totalVideos = 0;
      let totalAudios = 0;

      for (const folder of targetFolders) {
        const fullPath = `${rootPath}/${folder}`;
        const folderResult = await scanFolderRecursive(fullPath, 0, 3);
        totalImages += folderResult.images;
        totalVideos += folderResult.videos;
        totalAudios += folderResult.audios;
      }

      // Calculate All Apps & System size = Used Space - (Images + Videos + Audios)
      const mediaTotal = totalImages + totalVideos + totalAudios;
      const allAppsBytes = Math.max(0, usedBytes - mediaTotal);

      setStorageData({
        totalSpaceFormatted: formatBytes(totalBytes),
        usedSpaceFormatted: formatBytes(usedBytes),
        usedPercentage,
        imagesSizeFormatted: formatBytes(totalImages),
        videosSizeFormatted: formatBytes(totalVideos),
        audiosSizeFormatted: formatBytes(totalAudios),
        allAppsSizeFormatted: formatBytes(allAppsBytes),
      });
    } catch (e) {
      await calculateDiskCapacityOnly();
    }
  };

  const handleSettingsPress = () => {
    navigation.navigate('SettingsScreen');
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
          <Text style={styles.headerTitle}>Mobile Storage</Text>
        </View>

        <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
          <Image source={SETTINGS_ICON} style={{ width: 22, height: 22 }} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* Main Content Body */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Scanning Storage Metrics...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Circular Progress Card */}
          <View style={styles.storageCircleCard}>
            <View style={{ width: 170, height: 170, alignItems: 'center', justifyContent: 'center' }}>
              <Svg style={{ position: 'absolute' }} width={170} height={170}>
                <Circle
                  stroke="#E2E8F0"
                  fill="none"
                  cx={170 / 2}
                  cy={170 / 2}
                  r={(170 - 16) / 2}
                  strokeWidth={16}
                />
                <Circle
                  stroke="#97EF5B"
                  fill="none"
                  cx={170 / 2}
                  cy={170 / 2}
                  r={(170 - 16) / 2}
                  strokeWidth={16}
                  strokeDasharray={(170 - 16) / 2 * 2 * Math.PI}
                  strokeDashoffset={((170 - 16) / 2 * 2 * Math.PI) - ((storageData.usedPercentage || 0) / 100) * ((170 - 16) / 2 * 2 * Math.PI)}
                  strokeLinecap="round"
                  originX={170 / 2}
                  originY={170 / 2}
                  rotation="-90"
                />
              </Svg>
              <View style={styles.circleInnerContainer}>
                <Text style={styles.percentageText}>{storageData.usedPercentage}%</Text>
                <Text style={styles.usedSubText}>Used</Text>
              </View>
            </View>
          </View>

          {/* Permission Prompt Banner if Storage Permission Not Granted */}
          {!permissionGranted && (
            <TouchableOpacity style={styles.permissionBanner} onPress={initStorageScan}>
              <Text style={styles.permissionBannerText}>
                Tap to grant storage permissions for full media breakdown scan
              </Text>
            </TouchableOpacity>
          )}

          {/* 2-Column Space Cards (Total Space & Used Space) */}
          <View style={styles.spaceCardsRow}>
            {/* Total Space Card */}
            <View style={[styles.spaceCard, styles.totalSpaceCard]}>
              <Text style={styles.spaceCardTitle}>Total Space</Text>
              <Text style={styles.spaceCardVal}>{storageData.totalSpaceFormatted}</Text>
            </View>

            {/* Used Space Card */}
            <View style={[styles.spaceCard, styles.usedSpaceCard]}>
              <Text style={styles.spaceCardTitle}>Used Space</Text>
              <Text style={styles.spaceCardVal}>{storageData.usedSpaceFormatted}</Text>
            </View>
          </View>

          {/* Storage Breakdown Item Cards */}
          {/* Item 1: Audios */}
          <View style={styles.breakdownCard}>
            <View style={styles.iconSquare}>
              <Image source={AUDIO_ICON} style={{ width: 36, height: 36 }} resizeMode="contain" />
            </View>
            <Text style={styles.breakdownTitle}>Audios</Text>
            <Text style={styles.breakdownSize}>{storageData.audiosSizeFormatted}</Text>
          </View>

          {/* Item 2: Videos */}
          <View style={styles.breakdownCard}>
            <View style={styles.iconSquare}>
              <Image source={VIDEO_ICON} style={{ width: 36, height: 36 }} resizeMode="contain" />
            </View>
            <Text style={styles.breakdownTitle}>Videos</Text>
            <Text style={styles.breakdownSize}>{storageData.videosSizeFormatted}</Text>
          </View>

          {/* Item 3: Images */}
          <View style={styles.breakdownCard}>
            <View style={styles.iconSquare}>
              <Image source={IMAGE_ICON} style={{ width: 36, height: 36 }} resizeMode="contain" />
            </View>
            <Text style={styles.breakdownTitle}>Images</Text>
            <Text style={styles.breakdownSize}>{storageData.imagesSizeFormatted}</Text>
          </View>

          {/* Item 4: All Apps */}
          <View style={styles.breakdownCard}>
            <View style={styles.iconSquare}>
              <Image source={APPS_ICON} style={{ width: 36, height: 36 }} resizeMode="contain" />
            </View>
            <Text style={styles.breakdownTitle}>All Apps</Text>
            <Text style={styles.breakdownSize}>{storageData.allAppsSizeFormatted}</Text>
          </View>
        </ScrollView>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    fontFamily: 'Gilroy-Bold',
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
    backgroundColor: '#0B1326',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  storageCircleCard: {
    backgroundColor: '#131C31',
    borderRadius: 20,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },

  circleInnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  usedSubText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 2,
  },
  permissionBanner: {
    backgroundColor: '#1E293B',
    borderColor: '#3B82F6',
    borderWidth: 1,
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  permissionBannerText: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  spaceCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  spaceCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    minHeight: 90,
    justifyContent: 'center',
    borderWidth: 1,
  },
  totalSpaceCard: {
    backgroundColor: '#112529',
    borderColor: '#153A40',
  },
  usedSpaceCard: {
    backgroundColor: '#2A111E',
    borderColor: '#42152E',
  },
  spaceCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  spaceCardVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  breakdownCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#131C31',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  iconSquare: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  breakdownTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  breakdownSize: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default StorageInfoScreen;

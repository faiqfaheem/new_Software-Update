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
import Svg, { Circle, SvgXml } from 'react-native-svg';

const SETTINGS_SVG = `<svg width="22" height="22" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.3 20L6.9 16.8C6.68333 16.7167 6.47917 16.6167 6.2875 16.5C6.09583 16.3833 5.90833 16.2583 5.725 16.125L2.75 17.375L0 12.625L2.575 10.675C2.55833 10.5583 2.55 10.4458 2.55 10.3375C2.55 10.2292 2.55 10.1167 2.55 10C2.55 9.88333 2.55 9.77083 2.55 9.6625C2.55 9.55417 2.55833 9.44167 2.575 9.325L0 7.375L2.75 2.625L5.725 3.875C5.90833 3.74167 6.1 3.61667 6.3 3.5C6.5 3.38333 6.7 3.28333 6.9 3.2L7.3 0H12.8L13.2 3.2C13.4167 3.28333 13.6208 3.38333 13.8125 3.5C14.0042 3.61667 14.1917 3.74167 14.375 3.875L17.35 2.625L20.1 7.375L17.525 9.325C17.5417 9.44167 17.55 9.55417 17.55 9.6625C17.55 9.77083 17.55 9.88333 17.55 10C17.55 10.1167 17.55 10.2292 17.55 10.3375C17.55 10.4458 17.5333 10.5583 17.5 10.675L20.075 12.625L17.325 17.375L14.375 16.125C14.1917 16.2583 14 16.3833 13.8 16.5C13.6 16.6167 13.4 16.7167 13.2 16.8L12.8 20H7.3ZM9.05 18H11.025L11.375 15.35C11.8917 15.2167 12.3708 15.0208 12.8125 14.7625C13.2542 14.5042 13.6583 14.1917 14.025 13.825L16.5 14.85L17.475 13.15L15.325 11.525C15.4083 11.2917 15.4667 11.0458 15.5 10.7875C15.5333 10.5292 15.55 10.2667 15.55 10C15.55 9.73333 15.5333 9.47083 15.5 9.2125C15.4667 8.95417 15.4083 8.70833 15.325 8.475L17.475 6.85L16.5 5.15L14.025 6.2C13.6583 5.81667 13.2542 5.49583 12.8125 5.2375C12.3708 4.97917 11.8917 4.78333 11.375 4.65L11.05 2H9.075L8.725 4.65C8.20833 4.78333 7.72917 4.97917 7.2875 5.2375C6.84583 5.49583 6.44167 5.80833 6.075 6.175L3.6 5.15L2.625 6.85L4.775 8.45C4.69167 8.7 4.63333 8.95 4.6 9.2C4.56667 9.45 4.55 9.71667 4.55 10C4.55 10.2667 4.56667 10.525 4.6 10.775C4.63333 11.025 4.69167 11.275 4.775 11.525L2.625 13.15L3.6 14.85L6.075 13.8C6.44167 14.1833 6.84583 14.5042 7.2875 14.7625C7.72917 15.0208 8.20833 15.2167 8.725 15.35L9.05 18ZM10.1 13.5C11.0667 13.5 11.8917 13.1583 12.575 12.475C13.2583 11.7917 13.6 10.9667 13.6 10C13.6 9.03333 13.2583 8.20833 12.575 7.525C11.8917 6.84167 11.0667 6.5 10.1 6.5C9.11667 6.5 8.2875 6.84167 7.6125 7.525C6.9375 8.20833 6.6 9.03333 6.6 10C6.6 10.9667 6.9375 11.7917 7.6125 12.475C8.2875 13.1583 9.11667 13.5 10.1 13.5Z" fill="#DAE2FD"/>
</svg>`;

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

const BACK_ARROW_SVG = `<svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21.4142 9.70703H1.41422M10.4142 18.707L1.41422 9.70703L10.4142 0.707031" stroke="#DAE2FD" stroke-width="2"/>
</svg>`;

const BackArrow = ({ size = 20 }) => (
  <SvgXml xml={BACK_ARROW_SVG} width={size} height={Math.round(size * (20 / 22))} />
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

const ALL_APPS_SVG = `<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_124_1084)">
<path d="M44.6406 22.75H33.6094C30.3785 22.75 27.75 20.1215 27.75 16.8906V5.85938C27.75 2.62852 30.3785 0 33.6094 0H44.6406C47.8715 0 50.5 2.62852 50.5 5.85938V16.8906C50.5 20.1215 47.8715 22.75 44.6406 22.75Z" fill="#FF3939"/>
<path d="M16.8906 22.75H5.85937C2.62852 22.75 0 20.1215 0 16.8906V5.85938C0 2.62852 2.62852 0 5.85937 0H16.8906C20.1215 0 22.75 2.62852 22.75 5.85938V16.8906C22.75 20.1215 20.1215 22.75 16.8906 22.75Z" fill="#7EE780"/>
<path d="M16.8906 50.5H5.85938C2.62852 50.5 0 47.8715 0 44.6406V33.6094C0 30.3785 2.62852 27.75 5.85938 27.75H16.8906C20.1215 27.75 22.75 30.3785 22.75 33.6094V44.6406C22.75 47.8715 20.1215 50.5 16.8906 50.5Z" fill="#7ED8F6"/>
<path d="M44.6406 50.5H33.6094C30.3785 50.5 27.75 47.8715 27.75 44.6406V33.6094C27.75 30.3785 30.3785 27.75 33.6094 27.75H44.6406C47.8715 27.75 50.5 30.3785 50.5 33.6094V44.6406C50.5 47.8715 47.8715 50.5 44.6406 50.5Z" fill="#FFD92E"/>
</g>
<defs>
<clipPath id="clip0_124_1084">
<rect width="50" height="50" fill="white"/>
</clipPath>
</defs>
</svg>`;

const IMAGES_SVG = `<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_124_1076)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M47.5 40C48.8807 40 50 38.8807 50 37.5V2.5C50 1.11929 48.8807 0 47.5 0H12.5C11.1193 0 10 1.11929 10 2.5V37.5C10 38.8807 11.1193 40 12.5 40H47.5ZM16.0659 35C15.433 35 15.0003 34.5225 15 34.009C15.0001 33.8097 15.0652 33.6043 15.2087 33.42L22.8221 25.318C23.2292 24.898 23.9364 24.898 24.3649 25.298L27.8577 29L34.4147 19.438C34.8647 18.838 35.8075 18.858 36.2145 19.478L44.8695 33.5C45.255 34.18 44.7408 35 43.9265 35H16.0659ZM27.5 12.5C27.5 15.2614 25.2615 17.5 22.5 17.5C19.7386 17.5 17.5 15.2614 17.5 12.5C17.5 9.73857 19.7386 7.5 22.5 7.5C25.2615 7.5 27.5 9.73857 27.5 12.5Z" fill="url(#paint0_linear_124_1076)"/>
<path d="M0 11.25C0 9.17893 1.67893 7.5 3.75 7.5H5V45H42.5V46.25C42.5 48.321 40.821 50 38.75 50H3.75C1.67893 50 0 48.321 0 46.25V11.25Z" fill="url(#paint1_linear_124_1076)"/>
</g>
<defs>
<linearGradient id="paint0_linear_124_1076" x1="25" y1="0" x2="25" y2="50" gradientUnits="userSpaceOnUse">
<stop stop-color="#EE9AE5"/>
<stop offset="1" stop-color="#5961F9"/>
</linearGradient>
<linearGradient id="paint1_linear_124_1076" x1="25" y1="-8.76539e-08" x2="25" y2="50" gradientUnits="userSpaceOnUse">
<stop stop-color="#EE9AE5"/>
<stop offset="1" stop-color="#5961F9"/>
</linearGradient>
<clipPath id="clip0_124_1076">
<rect width="50" height="50" fill="white"/>
</clipPath>
</defs>
</svg>`;

const AUDIOS_SVG = `<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M28.7626 3.61858L12.9154 14.7408H4.39453C1.97129 14.7408 0 16.7121 0 19.1354V30.8541C0 33.2774 1.97129 35.2487 4.39453 35.2487H12.9154L28.9257 46.471C31.8359 47.9862 35.3516 45.8735 35.3516 42.5729V7.41662C35.3516 4.25783 31.9923 1.87453 28.7626 3.61858Z" fill="url(#paint0_linear_124_1054)"/>
<path d="M39.7461 14.7402C38.9364 14.7402 38.2812 15.3954 38.2812 16.2051C38.2812 17.0147 38.9364 17.6699 39.7461 17.6699C43.7858 17.6699 47.0703 20.9558 47.0703 24.9941C47.0703 29.0325 43.7858 32.3184 39.7461 32.3184C38.9364 32.3184 38.2812 32.9735 38.2812 33.7832C38.2812 34.5929 38.9364 35.248 39.7461 35.248C45.3995 35.248 50 30.6476 50 24.9941C50 19.3407 45.3995 14.7402 39.7461 14.7402ZM39.7461 26.459C38.9364 26.459 38.2812 27.1142 38.2812 27.9238C38.2812 28.7335 38.9364 29.3887 39.7461 29.3887C42.1693 29.3887 44.1406 27.4174 44.1406 24.9941C44.1406 22.5709 42.1693 20.5996 39.7461 20.5996C38.9364 20.5996 38.2812 21.2548 38.2812 22.0645C38.2812 22.8741 38.9364 23.5293 39.7461 23.5293C40.5529 23.5293 41.2109 24.1859 41.2109 24.9941C41.2109 25.8023 40.5529 26.459 39.7461 26.459ZM13.3789 20.5996C12.5692 20.5996 11.9141 21.2548 11.9141 22.0645V27.9238C11.9141 28.7335 12.5692 29.3887 13.3789 29.3887C14.1886 29.3887 14.8438 28.7335 14.8438 27.9238V22.0645C14.8438 21.2548 14.1886 20.5996 13.3789 20.5996Z" fill="url(#paint1_linear_124_1054)"/>
<defs>
<linearGradient id="paint0_linear_124_1054" x1="17.6758" y1="46.9705" x2="17.6758" y2="3.02932" gradientUnits="userSpaceOnUse">
<stop stop-color="#A93AFF"/>
<stop offset="1" stop-color="#FF81FF"/>
</linearGradient>
<linearGradient id="paint1_linear_124_1054" x1="30.957" y1="35.248" x2="30.957" y2="14.7402" gradientUnits="userSpaceOnUse">
<stop stop-color="#FFBEF9"/>
<stop offset="1" stop-color="#FFF1FF"/>
</linearGradient>
</defs>
</svg>`;

const VIDEOS_SVG = `<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.25002 15.1035C4.23648 15.1035 2.60419 16.7358 2.60419 18.7493V41.666C2.60419 43.6796 4.23648 45.3119 6.25002 45.3119H43.75C45.7636 45.3119 47.3959 43.6796 47.3959 41.666V18.7493C47.3959 16.7358 45.7636 15.1035 43.75 15.1035H6.25002Z" fill="#EE4D4D"/>
<path d="M21.7294 21.636C21.2521 21.3019 20.6285 21.261 20.1117 21.5302C19.595 21.7991 19.2708 22.3333 19.2708 22.916V37.4994C19.2708 38.0821 19.595 38.6162 20.1117 38.8852C20.6285 39.1544 21.2521 39.1135 21.7294 38.7794L32.146 31.4877C32.5637 31.1954 32.8125 30.7175 32.8125 30.2077C32.8125 29.6979 32.5637 29.22 32.146 28.9277L21.7294 21.636Z" fill="#ECEFF1"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M6.77081 11.459C6.77081 10.596 7.47038 9.89648 8.33331 9.89648H41.6666C42.5296 9.89648 43.2291 10.596 43.2291 11.459C43.2291 12.3219 42.5296 13.0215 41.6666 13.0215H8.33331C7.47038 13.0215 6.77081 12.3219 6.77081 11.459Z" fill="#EE4D4D"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.9375 6.25C10.9375 5.38706 11.6371 4.6875 12.5 4.6875H37.5C38.3629 4.6875 39.0625 5.38706 39.0625 6.25C39.0625 7.11294 38.3629 7.8125 37.5 7.8125H12.5C11.6371 7.8125 10.9375 7.11294 10.9375 6.25Z" fill="#EE4D4D"/>
</svg>`;

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
          <SvgXml xml={SETTINGS_SVG} width={22} height={22} />
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
              <SvgXml xml={AUDIOS_SVG} width={36} height={36} />
            </View>
            <Text style={styles.breakdownTitle}>Audios</Text>
            <Text style={styles.breakdownSize}>{storageData.audiosSizeFormatted}</Text>
          </View>

          {/* Item 2: Videos */}
          <View style={styles.breakdownCard}>
            <View style={styles.iconSquare}>
              <SvgXml xml={VIDEOS_SVG} width={36} height={36} />
            </View>
            <Text style={styles.breakdownTitle}>Videos</Text>
            <Text style={styles.breakdownSize}>{storageData.videosSizeFormatted}</Text>
          </View>

          {/* Item 3: Images */}
          <View style={styles.breakdownCard}>
            <View style={styles.iconSquare}>
              <SvgXml xml={IMAGES_SVG} width={36} height={36} />
            </View>
            <Text style={styles.breakdownTitle}>Images</Text>
            <Text style={styles.breakdownSize}>{storageData.imagesSizeFormatted}</Text>
          </View>

          {/* Item 4: All Apps */}
          <View style={styles.breakdownCard}>
            <View style={styles.iconSquare}>
              <SvgXml xml={ALL_APPS_SVG} width={36} height={36} />
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
    color: '#DAE2FD',
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
    color: '#DAE2FD',
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
    color: '#DAE2FD',
  },
  breakdownSize: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default StorageInfoScreen;

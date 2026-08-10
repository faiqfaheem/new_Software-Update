import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  NativeModules,
  Image,
  ActivityIndicator,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { SvgXml } from 'react-native-svg';
import { useLanguage } from '../i18n/LanguageContext';

const ALL_APPS_SVG = `<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3.25 26C2.35625 26 1.59115 25.6818 0.954687 25.0453C0.318229 24.4089 0 23.6437 0 22.75C0 21.8562 0.318229 21.0911 0.954687 20.4547C1.59115 19.8182 2.35625 19.5 3.25 19.5C4.14375 19.5 4.90885 19.8182 5.54531 20.4547C6.18177 21.0911 6.5 21.8562 6.5 22.75C6.5 23.6437 6.18177 24.4089 5.54531 25.0453C4.90885 25.6818 4.14375 26 3.25 26ZM13 26C12.1062 26 11.3411 25.6818 10.7047 25.0453C10.0682 24.4089 9.75 23.6437 9.75 22.75C9.75 21.8562 10.0682 21.0911 10.7047 20.4547C11.3411 19.8182 12.1062 19.5 13 19.5C13.8937 19.5 14.6589 19.8182 15.2953 20.4547C15.9318 21.0911 16.25 21.8562 16.25 22.75C16.25 23.6437 15.9318 24.4089 15.2953 25.0453C14.6589 25.6818 13.8937 26 13 26ZM22.75 26C21.8562 26 21.0911 25.6818 20.4547 25.0453C19.8182 24.4089 19.5 23.6437 19.5 22.75C19.5 21.8562 19.8182 21.0911 20.4547 20.4547C21.0911 19.8182 21.8562 19.5 22.75 19.5C23.6437 19.5 24.4089 19.8182 25.0453 20.4547C25.6818 21.0911 26 21.8562 26 22.75C26 23.6437 25.6818 24.4089 25.0453 25.0453C24.4089 25.6818 23.6437 26 22.75 26ZM3.25 16.25C2.35625 16.25 1.59115 15.9318 0.954687 15.2953C0.318229 14.6589 0 13.8937 0 13C0 12.1062 0.318229 11.3411 0.954687 10.7047C1.59115 10.0682 2.35625 9.75 3.25 9.75C4.14375 9.75 4.90885 10.0682 5.54531 10.7047C6.18177 11.3411 6.5 12.1062 6.5 13C6.5 13.8937 6.18177 14.6589 5.54531 15.2953C4.90885 15.9318 4.14375 16.25 3.25 16.25ZM13 16.25C12.1062 16.25 11.3411 15.9318 10.7047 15.2953C10.0682 14.6589 9.75 13.8937 9.75 13C9.75 12.1062 10.0682 11.3411 10.7047 10.7047C11.3411 10.0682 12.1062 9.75 13 9.75C13.8937 9.75 14.6589 10.0682 15.2953 10.7047C15.9318 11.3411 16.25 12.1062 16.25 13C16.25 13.8937 15.9318 14.6589 15.2953 15.2953C14.6589 15.9318 13.8937 16.25 13 16.25ZM22.75 16.25C21.8562 16.25 21.0911 15.9318 20.4547 15.2953C19.8182 14.6589 19.5 13.8937 19.5 13C19.5 12.1062 19.8182 11.3411 20.4547 10.7047C21.0911 10.0682 21.8562 9.75 22.75 9.75C23.6437 9.75 24.4089 10.0682 25.0453 10.7047C25.6818 11.3411 26 12.1062 26 13C26 13.8937 25.6818 14.6589 25.0453 15.2953C24.4089 15.9318 23.6437 16.25 22.75 16.25ZM3.25 6.5C2.35625 6.5 1.59115 6.18177 0.954687 5.54531C0.318229 4.90885 0 4.14375 0 3.25C0 2.35625 0.318229 1.59115 0.954687 0.954687C1.59115 0.318229 2.35625 0 3.25 0C4.14375 0 4.90885 0.318229 5.54531 0.954687C6.18177 1.59115 6.5 2.35625 6.5 3.25C6.5 4.14375 6.18177 4.90885 5.54531 5.54531C4.90885 6.18177 4.14375 6.5 3.25 6.5ZM13 6.5C12.1062 6.5 11.3411 6.18177 10.7047 5.54531C10.0682 4.90885 9.75 4.14375 9.75 3.25C9.75 2.35625 10.0682 1.59115 10.7047 0.954687C11.3411 0.318229 12.1062 0 13 0C13.8937 0 14.6589 0.318229 15.2953 0.954687C15.9318 1.59115 16.25 2.35625 16.25 3.25C16.25 4.14375 15.9318 4.90885 15.2953 5.54531C14.6589 6.18177 13.8937 6.5 13 6.5ZM22.75 6.5C21.8562 6.5 21.0911 6.18177 20.4547 5.54531C19.8182 4.90885 19.5 4.14375 19.5 3.25C19.5 2.35625 19.8182 1.59115 20.4547 0.954687C21.0911 0.318229 21.8562 0 22.75 0C23.6437 0 24.4089 0.318229 25.0453 0.954687C25.6818 1.59115 26 2.35625 26 3.25C26 4.14375 25.6818 4.90885 25.0453 5.54531C24.4089 6.18177 23.6437 6.5 22.75 6.5Z" fill="#ADC6FF"/>
</svg>`;

const HOME_TAB_SVG = (color) => `<svg width="22" height="22" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 18V6L8 0L16 6V18H10V11H6V18H0Z" fill="${color}"/>
</svg>`;

const TOOLS_TAB_SVG = (color) => `<svg width="22" height="22" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.15 17.7L8.1 11.6C7.76667 11.7333 7.42917 11.8333 7.0875 11.9C6.74583 11.9667 6.38333 12 6 12C4.33333 12 2.91667 11.4167 1.75 10.25C0.583333 9.08333 0 7.66667 0 6C0 5.4 0.0833333 4.82917 0.25 4.2875C0.416667 3.74583 0.65 3.23333 0.95 2.75L4.6 6.4L6.4 4.6L2.75 0.95C3.23333 0.65 3.74583 0.416667 4.2875 0.25C4.82917 0.0833333 5.4 0 6 0C7.66667 0 9.08333 0.583333 10.25 1.75C11.4167 2.91667 12 4.33333 12 6C12 6.38333 11.9667 6.74583 11.9 7.0875C11.8333 7.42917 11.7333 7.76667 11.6 8.1L17.7 14.15C17.9 14.35 18 14.5917 18 14.875C18 15.1583 17.9 15.4 17.7 15.6L15.6 17.7C15.4 17.9 15.1583 18 14.875 18C14.5917 18 14.35 17.9 14.15 17.7ZM14.875 15.575L15.55 14.9L9.15 8.5C9.45 8.16667 9.66667 7.77917 9.8 7.3375C9.93333 6.89583 10 6.45 10 6C10 5 9.67917 4.12917 9.0375 3.3875C8.39583 2.64583 7.6 2.2 6.65 2.05L8.5 3.9C8.7 4.1 8.8 4.33333 8.8 4.6C8.8 4.86667 8.7 5.1 8.5 5.3L5.3 8.5C5.1 8.7 4.86667 8.8 4.6 8.8C4.33333 8.8 4.1 8.7 3.9 8.5L2.05 6.65C2.2 7.6 2.64583 8.39583 3.3875 9.0375C4.12917 9.67917 5 10 6 10C6.43333 10 6.86667 9.93333 7.3 9.8C7.73333 9.66667 8.125 9.45833 8.475 9.175L14.875 15.575Z" fill="${color}"/>
</svg>`;

const SETTINGS_SVG = `<svg width="22" height="22" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.3 20L6.9 16.8C6.68333 16.7167 6.47917 16.6167 6.2875 16.5C6.09583 16.3833 5.90833 16.2583 5.725 16.125L2.75 17.375L0 12.625L2.575 10.675C2.55833 10.5583 2.55 10.4458 2.55 10.3375C2.55 10.2292 2.55 10.1167 2.55 10C2.55 9.88333 2.55 9.77083 2.55 9.6625C2.55 9.55417 2.55833 9.44167 2.575 9.325L0 7.375L2.75 2.625L5.725 3.875C5.90833 3.74167 6.1 3.61667 6.3 3.5C6.5 3.38333 6.7 3.28333 6.9 3.2L7.3 0H12.8L13.2 3.2C13.4167 3.28333 13.6208 3.38333 13.8125 3.5C14.0042 3.61667 14.1917 3.74167 14.375 3.875L17.35 2.625L20.1 7.375L17.525 9.325C17.5417 9.44167 17.55 9.55417 17.55 9.6625C17.55 9.77083 17.55 9.88333 17.55 10C17.55 10.1167 17.55 10.2292 17.55 10.3375C17.55 10.4458 17.5333 10.5583 17.5 10.675L20.075 12.625L17.325 17.375L14.375 16.125C14.1917 16.2583 14 16.3833 13.8 16.5C13.6 16.6167 13.4 16.7167 13.2 16.8L12.8 20H7.3ZM9.05 18H11.025L11.375 15.35C11.8917 15.2167 12.3708 15.0208 12.8125 14.7625C13.2542 14.5042 13.6583 14.1917 14.025 13.825L16.5 14.85L17.475 13.15L15.325 11.525C15.4083 11.2917 15.4667 11.0458 15.5 10.7875C15.5333 10.5292 15.55 10.2667 15.55 10C15.55 9.73333 15.5333 9.47083 15.5 9.2125C15.4667 8.95417 15.4083 8.70833 15.325 8.475L17.475 6.85L16.5 5.15L14.025 6.2C13.6583 5.81667 13.2542 5.49583 12.8125 5.2375C12.3708 4.97917 11.8917 4.78333 11.375 4.65L11.05 2H9.075L8.725 4.65C8.20833 4.78333 7.72917 4.97917 7.2875 5.2375C6.84583 5.49583 6.44167 5.80833 6.075 6.175L3.6 5.15L2.625 6.85L4.775 8.45C4.69167 8.7 4.63333 8.95 4.6 9.2C4.56667 9.45 4.55 9.71667 4.55 10C4.55 10.2667 4.56667 10.525 4.6 10.775C4.63333 11.025 4.69167 11.275 4.775 11.525L2.625 13.15L3.6 14.85L6.075 13.8C6.44167 14.1833 6.84583 14.5042 7.2875 14.7625C7.72917 15.0208 8.20833 15.2167 8.725 15.35L9.05 18ZM10.1 13.5C11.0667 13.5 11.8917 13.1583 12.575 12.475C13.2583 11.7917 13.6 10.9667 13.6 10C13.6 9.03333 13.2583 8.20833 12.575 7.525C11.8917 6.84167 11.0667 6.5 10.1 6.5C9.11667 6.5 8.2875 6.84167 7.6125 7.525C6.9375 8.20833 6.6 9.03333 6.6 10C6.6 10.9667 6.9375 11.7917 7.6125 12.475C8.2875 13.1583 9.11667 13.5 10.1 13.5Z" fill="#DAE2FD"/>
</svg>`;

const OS_UPDATE_SVG = `<svg width="28" height="28" viewBox="0 0 35 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 20C0.265152 17.3089 1.11364 14.8613 2.54545 12.6571C3.97727 10.453 5.82008 8.65888 8.07386 7.27488L5.01136 2.31554C4.77273 1.95673 4.71307 1.57228 4.83239 1.16221C4.9517 0.752132 5.19697 0.444576 5.56818 0.239539C5.93939 0.0088718 6.33712 -0.0552023 6.76136 0.0473163C7.18561 0.149835 7.50379 0.380502 7.71591 0.739317L10.8977 5.85243C11.9053 5.44236 12.9593 5.1348 14.0597 4.92977C15.16 4.72473 16.3068 4.62221 17.5 4.62221C18.6932 4.62221 19.84 4.72473 20.9403 4.92977C22.0407 5.1348 23.0947 5.44236 24.1023 5.85243L27.2841 0.739317C27.4962 0.380502 27.8144 0.149835 28.2386 0.0473163C28.6629 -0.0552023 29.0606 0.0088718 29.4318 0.239539C29.803 0.444576 30.0417 0.752132 30.1477 1.16221C30.2538 1.57228 30.2008 1.95673 29.9886 2.31554L26.9261 7.27488C29.1799 8.65888 31.0227 10.453 32.4545 12.6571C33.8864 14.8613 34.7348 17.3089 35 20H0ZM26.4886 15.1944C26.8333 14.9638 27.0256 14.6242 27.0653 14.1757C27.1051 13.7271 26.9792 13.285 26.6875 12.8493C26.3958 12.4136 26.0379 12.1317 25.6136 12.0035C25.1894 11.8754 24.8049 11.9267 24.4602 12.1573C24.1155 12.388 23.9167 12.7212 23.8636 13.1569C23.8106 13.5926 23.9299 14.0283 24.2216 14.464C24.5133 14.8997 24.8778 15.188 25.3153 15.329C25.7528 15.47 26.1439 15.4251 26.4886 15.1944ZM8.55114 15.156C8.89583 15.3867 9.2803 15.4379 9.70455 15.3098C10.1288 15.1816 10.4867 14.8997 10.7784 14.464C11.0701 14.0283 11.196 13.5862 11.1562 13.1377C11.1165 12.6891 10.9242 12.3495 10.5795 12.1189C10.2348 11.8882 9.84375 11.8434 9.40625 11.9843C8.96875 12.1253 8.60417 12.4136 8.3125 12.8493C8.02083 13.285 7.90152 13.7207 7.95455 14.1564C8.00758 14.5921 8.20644 14.9253 8.55114 15.156Z" fill="#FFB4AB"/>
</svg>`;

const BULK_UNINSTALLER_SVG = `<svg width="28" height="28" viewBox="0 0 33 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21.45 22.3448V19.0345H28.05V22.3448H21.45ZM21.45 9.10345V5.7931H33V9.10345H21.45ZM21.45 15.7241V12.4138H31.35V15.7241H21.45ZM1.65 5.7931H0V2.48276H6.6V0H13.2V2.48276H19.8V5.7931H18.15V20.6897C18.15 21.6 17.8269 22.3793 17.1806 23.0276C16.5344 23.6759 15.7575 24 14.85 24H4.95C4.0425 24 3.26563 23.6759 2.61937 23.0276C1.97313 22.3793 1.65 21.6 1.65 20.6897V5.7931ZM4.95 5.7931V20.6897H14.85V5.7931H4.95Z" fill="#FFB4AB"/>
</svg>`;

const AI_ASSIST_SVG = `<svg width="26" height="26" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M24.5455 10.9091L22.8409 7.15909L19.0909 5.45455L22.8409 3.75L24.5455 0L26.25 3.75L30 5.45455L26.25 7.15909L24.5455 10.9091ZM24.5455 30L22.8409 26.25L19.0909 24.5455L22.8409 22.8409L24.5455 19.0909L26.25 22.8409L30 24.5455L26.25 26.25L24.5455 30ZM10.9091 25.9091L7.5 18.4091L0 15L7.5 11.5909L10.9091 4.09091L14.3182 11.5909L21.8182 15L14.3182 18.4091L10.9091 25.9091ZM10.9091 19.2955L12.2727 16.3636L15.2045 15L12.2727 13.6364L10.9091 10.7045L9.54545 13.6364L6.61364 15L9.54545 16.3636L10.9091 19.2955Z" fill="white"/>
</svg>`;

const AI_ICON = require('../assets/ai_assistant_icon.png');
const OS_UPDATE_ICON = require('../assets/os_update_icon.png');
const BULK_UNINSTALLER_ICON = require('../assets/bulk_uninstaller_icon.png');
const ALL_APPS_ICON = require('../assets/all_apps_icon.png');
const SETTINGS_ICON = require('../assets/settings_icon.png');
const SCAN_APPS_ICON = require('../assets/scan_apps_icon.png');
const TAB_HOME_ICON = require('../assets/tab_home_icon.png');
const TAB_TOOLS_ICON = require('../assets/tab_tools_icon.png');
const TOOL_STORAGE_INFO_ICON = require('../assets/tool_storage_info_icon.png');
const TOOL_PERMISSION_MANAGER_ICON = require('../assets/tool_permission_manager_icon.png');
const TOOL_PHONE_SENSOR_ICON = require('../assets/tool_phone_sensor_icon.png');

// --- Simple White Placeholder Box Component ---
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

const ChevronRight = ({ color = '#64748B' }) => (
  <Text style={{ color, fontSize: 18, fontWeight: '600' }}>›</Text>
);

const HomeScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('home');

  const [storageAnalytics, setStorageAnalytics] = useState({
    isLoading: true,
    healthPercentage: 0,
    healthLabel: '',
    installedAppsCount: '--',
    systemAppsCount: '--',
    optimizedPercentage: '--',
  });

  useEffect(() => {
    fetchRealtimeStorageAnalytics();
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

  const fetchRealtimeStorageAnalytics = async () => {
    try {
      // 1. Calculate Real Storage Health Percentage from Disk Free vs Total
      let totalDisk = 0;
      let freeDisk = 0;
      try {
        totalDisk = await DeviceInfo.getTotalDiskCapacity();
        freeDisk = await DeviceInfo.getFreeDiskStorage();
      } catch (_e) { }

      let healthPct = 0;
      if (totalDisk > 0 && freeDisk > 0) {
        const freeRatio = freeDisk / totalDisk;
        healthPct = Math.min(Math.max(Math.round(freeRatio * 100) + 35, 30), 98);
      } else {
        healthPct = 75;
      }

      // 2. Fetch Installed Apps & System Apps counts from Native AppPermissionModule
      let installedCount = 0;
      let systemCount = 0;
      if (
        NativeModules.AppPermissionModule &&
        NativeModules.AppPermissionModule.getInstalledAppsPermissions
      ) {
        const rawApps = await NativeModules.AppPermissionModule.getInstalledAppsPermissions();
        if (Array.isArray(rawApps)) {
          installedCount = rawApps.filter((a) => !a.isSystemApp && (a.apkSize || 0) > 100 * 1024).length;
          systemCount = rawApps.filter(
            (a) => a.isSystemApp && (a.apkSize || 0) > 100 * 1024 && isUserFacingSystemApp(a)
          ).length;
        }
      }

      // 3. Optimization Score based on Free Storage & App ratio
      const totalApps = installedCount + systemCount;
      const optPct = totalApps > 0 ? Math.min(Math.max(100 - Math.round((installedCount / totalApps) * 20), 80), 99) : 90;

      setStorageAnalytics({
        isLoading: false,
        healthPercentage: healthPct,
        healthLabel: `${healthPct}% Healthy`,
        installedAppsCount: installedCount,
        systemAppsCount: systemCount,
        optimizedPercentage: `${optPct}%`,
      });
    } catch (_e) {
      setStorageAnalytics((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  // --- Home Tab Action Handlers ---
  const handleScanAppUpdates = () => {
    navigation.navigate('ScanAppsScreen');
  };

  const handleAllApps = () => {
    navigation.navigate('AllAppsScreen');
  };

  const handleSystemOSUpdate = () => {
    navigation.navigate('OSUpdateScreen');
  };

  const handleAIAssistantGuide = () => {
    navigation.navigate('AIAssistantScreen');
  };

  const handleBulkUninstaller = () => {
    navigation.navigate('BulkUninstallerScreen');
  };

  const handleSettingsPress = () => {
    navigation.navigate('SettingsScreen');
  };

  // --- Tools Tab Action Handlers ---
  const handleStorageInfo = () => {
    navigation.navigate('StorageInfoScreen');
  };

  const handlePermissionManager = () => {
    navigation.navigate('PermissionManagerScreen');
  };

  const handlePhoneSensor = () => {
    navigation.navigate('PhoneSensorScreen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <Text style={styles.headerAppTitle}>Software Update</Text>

        <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
          <SvgXml xml={SETTINGS_SVG} width={22} height={22} />
        </TouchableOpacity>
      </View>

      {/* Conditional Rendering Based on Active Tab */}
      {activeTab === 'home' ? (
        /* HOME TAB CONTENT */
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical={true}
        >
          {/* Hero Card - Scan Apps */}
          <View style={styles.heroCard}>
            <View style={styles.heroGlowBackdrop}>
              <TouchableOpacity
                style={styles.heroCircleButton}
                onPress={handleScanAppUpdates}
                activeOpacity={0.85}
              >
                <View style={styles.heroIconWrapper}>
                  <Image source={SCAN_APPS_ICON} style={{ width: 36, height: 36 }} resizeMode="contain" />
                </View>
                <Text style={styles.heroTitle}>Scan Apps</Text>
                <Text style={styles.heroSub}>Check Updates</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* All Apps Full Width Card */}
          <TouchableOpacity style={styles.rowCard} onPress={handleAllApps}>
            <View style={[styles.iconSquare, { backgroundColor: '#2B3E62' }]}>
              <SvgXml xml={ALL_APPS_SVG} width={26} height={26} />
            </View>
            <View style={styles.rowCardTextContainer}>
              <Text style={styles.rowCardTitle}>All Apps</Text>
              <Text style={styles.rowCardSub}>All Installed Apps</Text>
            </View>
            <ChevronRight />
          </TouchableOpacity>

          {/* Two Column Grid (OS Update & AI Assistant) */}
          <View style={styles.gridRow}>
            {/* OS Update Card */}
            <TouchableOpacity style={styles.gridCard} onPress={handleSystemOSUpdate}>
              <View style={[styles.iconSquare, { backgroundColor: '#93000A', marginBottom: 16 }]}>
                <SvgXml xml={OS_UPDATE_SVG} width={28} height={28} />
              </View>
              <Text style={styles.gridCardTitle}>OS Update</Text>
              <Text style={styles.gridCardSub}>UPDATE AVAILABLE</Text>
            </TouchableOpacity>

            {/* AI Assistant Card (Full Linear Fill Gradient Effect) */}
            <TouchableOpacity
              style={[styles.gridCard, styles.aiCardGradient]}
              onPress={handleAIAssistantGuide}
              activeOpacity={0.85}
            >
              {/* Linear Fill Gradient Effect Layers */}
              <View style={styles.linearGradientBase} />
              <View style={styles.linearGradientHighlight} />

              <View style={[styles.iconSquare, styles.aiIconSquare]}>
                <SvgXml xml={AI_ASSIST_SVG} width={26} height={26} />
              </View>
              <Text style={[styles.gridCardTitle, { color: '#FFFFFF' }]}>AI Assistant</Text>
              <Text style={[styles.gridCardSub, { color: 'rgba(255,255,255,0.9)' }]}>SMART OPTIMIZATION</Text>
            </TouchableOpacity>
          </View>

          {/* Bulk Uninstaller Card */}
          <TouchableOpacity style={styles.rowCard} onPress={handleBulkUninstaller}>
            <View style={[styles.iconSquare, { backgroundColor: '#371B36' }]}>
              <SvgXml xml={BULK_UNINSTALLER_SVG} width={28} height={28} />
            </View>
            <View style={styles.rowCardTextContainer}>
              <Text style={styles.rowCardTitle}>Bulk Uninstaller</Text>
              <Text style={styles.rowCardSub}>Remove Multiple Apps At Once</Text>
            </View>
            <ChevronRight />
          </TouchableOpacity>

          {/* Dynamic Storage Health & Analytics Card */}
          <TouchableOpacity
            style={styles.statsCard}
            activeOpacity={0.8}
            onPress={handleStorageInfo}
          >
            <View style={styles.statsHeaderRow}>
              <Text style={styles.statsTitle}>Storage Health</Text>
              {storageAnalytics.isLoading ? (
                <ActivityIndicator size="small" color="#64748B" />
              ) : (
                <Text style={styles.statsHealthBadge}>{storageAnalytics.healthLabel}</Text>
              )}
            </View>

            {/* Dynamic Progress Bar */}
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${storageAnalytics.healthPercentage}%` },
                ]}
              />
            </View>

            {/* Dynamic Stats Columns */}
            <View style={styles.statsColumnsRow}>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>INSTALLED</Text>
                {storageAnalytics.isLoading ? (
                  <ActivityIndicator size="small" color="#64748B" style={{ marginVertical: 2 }} />
                ) : (
                  <Text style={styles.statVal}>{storageAnalytics.installedAppsCount}</Text>
                )}
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statCol}>
                <Text style={styles.statLabel}>SYSTEM</Text>
                {storageAnalytics.isLoading ? (
                  <ActivityIndicator size="small" color="#64748B" style={{ marginVertical: 2 }} />
                ) : (
                  <Text style={[styles.statVal, { color: '#FB923C' }]}>
                    {storageAnalytics.systemAppsCount}
                  </Text>
                )}
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statCol}>
                <Text style={styles.statLabel}>OPTIMIZED</Text>
                {storageAnalytics.isLoading ? (
                  <ActivityIndicator size="small" color="#64748B" style={{ marginVertical: 2 }} />
                ) : (
                  <Text style={styles.statVal}>{storageAnalytics.optimizedPercentage}</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        /* TOOLS TAB CONTENT */
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.toolsScrollContent}
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical={true}
        >
          <View style={styles.toolsGrid}>
            {/* Tool 1: Storage INFO */}
            <TouchableOpacity style={styles.toolCard} onPress={handleStorageInfo}>
              <View style={styles.toolIconWrapper}>
                <Image source={TOOL_STORAGE_INFO_ICON} style={{ width: 44, height: 44 }} resizeMode="contain" />
              </View>
              <Text style={styles.toolCardTitle}>Storage INFO</Text>
            </TouchableOpacity>

            {/* Tool 2: Permission Manager */}
            <TouchableOpacity style={styles.toolCard} onPress={handlePermissionManager}>
              <View style={styles.toolIconWrapper}>
                <Image source={TOOL_PERMISSION_MANAGER_ICON} style={{ width: 44, height: 44 }} resizeMode="contain" />
              </View>
              <Text style={styles.toolCardTitle}>Permission Manager</Text>
            </TouchableOpacity>

            {/* Tool 3: Phone Sensor */}
            <TouchableOpacity style={styles.toolCard} onPress={handlePhoneSensor}>
              <View style={styles.toolIconWrapper}>
                <Image source={TOOL_PHONE_SENSOR_ICON} style={{ width: 44, height: 44 }} resizeMode="contain" />
              </View>
              <Text style={styles.toolCardTitle}>Phone Sensor</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('home')}
        >
          <SvgXml
            xml={HOME_TAB_SVG(activeTab === 'home' ? '#3B82F6' : '#64748B')}
            width={22}
            height={22}
          />
          <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('tools')}
        >
          <SvgXml
            xml={TOOLS_TAB_SVG(activeTab === 'tools' ? '#3B82F6' : '#64748B')}
            width={22}
            height={22}
          />
          <Text style={[styles.tabLabel, activeTab === 'tools' && styles.tabLabelActive]}>
            Tools
          </Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#0B1120',
  },
  headerAppTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  settingsButton: {
    padding: 4,
  },
  container: {
    flex: 1,
    backgroundColor: '#0B1326',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 30,
  },
  // Hero Card
  heroCard: {
    backgroundColor: '#0B1326',
    borderRadius: 18,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  heroGlowBackdrop: {
    borderRadius: 70,
    backgroundColor: '#ADC6FF',
    shadowColor: '#ADC6FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 24,
    elevation: 70,
  },
  heroCircleButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#ADC6FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ADC6FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.80,
    shadowRadius: 20,
    elevation: 70,
    borderWidth: 1,
    borderColor: '#E8F0FF',
  },
  heroIconWrapper: {
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  heroSub: {
    fontSize: 11,
    color: '#002E6A',
    fontWeight: '600',
    marginTop: 2,
  },
  // Full Width Row Card
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121B2E',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  iconSquare: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowCardTextContainer: {
    flex: 1,
  },
  rowCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  rowCardSub: {
    fontSize: 12,
    color: '#94A3B8',
  },
  // 2-Column Grid
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    gap: 12,
    marginBottom: 14,
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#121B2E',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    minHeight: 125,
  },
  aiCardGradient: {
    backgroundColor: '#EA580C',
    borderColor: '#FB923C',
    overflow: 'hidden',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  linearGradientBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#EA580C',
  },
  linearGradientHighlight: {
    position: 'absolute',
    top: -25,
    left: -25,
    width: '150%',
    height: '150%',
    backgroundColor: '#FB923C',
    opacity: 0.7,
    borderRadius: 35,
    transform: [{ rotate: '-30deg' }],
  },
  aiIconSquare: {
    backgroundColor: '#D97706',
    marginBottom: 16,
    borderRadius: 14,
  },
  gridCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  gridCardSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.4,
  },
  // Stats Card
  statsCard: {
    backgroundColor: '#121B2E',
    borderRadius: 14,
    padding: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  statsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ADC6FF',
  },
  statsHealthBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ADC6FF',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(173, 198, 255, 0.18)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ADC6FF',
    borderRadius: 4,
  },
  statsColumnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ADC6FF',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statVal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ADC6FF',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#ADC6FF',
  },
  // --- Tools Screen Styles ---
  toolsScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  toolCard: {
    width: '48%',
    height: 165,
    backgroundColor: '#121B2E',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 16,
  },
  toolIconWrapper: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DAE2FD',
    textAlign: 'center',
  },
  // Bottom Tab Bar
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#171F33',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 3,
  },
  tabLabelActive: {
    color: '#ADC6FF',
  },
});

export default HomeScreen;

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
  ActivityIndicator,
  Image,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { SvgXml } from 'react-native-svg';
import { useLanguage } from '../i18n/LanguageContext';

const CONTAINER_SVG = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="64" height="64" rx="16" fill="url(#paint0_linear_124_411)"/>
<rect x="0.5" y="0.5" width="63" height="63" rx="15.5" stroke="white" stroke-opacity="0.1"/>
<path d="M32 15.334V22.0007M32 42.0007V48.6673M20.2166 20.2173L24.9333 24.934M39.0666 39.0673L43.7833 43.784M15.3333 32.0007H22M42 32.0007H48.6666M20.2166 43.784L24.9333 39.0673M39.0666 24.934L43.7833 20.2173" stroke="#3B82F6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M25.3333 32.0007C25.3333 35.6801 28.3205 38.6673 32 38.6673C35.6794 38.6673 38.6666 35.6801 38.6666 32.0007C38.6666 28.3212 35.6794 25.334 32 25.334C28.3205 25.334 25.3333 28.3212 25.3333 32.0007V32.0007" stroke="#3B82F6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<defs>
<linearGradient id="paint0_linear_124_411" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
<stop stop-color="white" stop-opacity="0.1"/>
<stop offset="1" stop-color="white" stop-opacity="0.05"/>
</linearGradient>
</defs>
</svg>`;

const SETTINGS_SVG = `<svg width="22" height="22" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.3 20L6.9 16.8C6.68333 16.7167 6.47917 16.6167 6.2875 16.5C6.09583 16.3833 5.90833 16.2583 5.725 16.125L2.75 17.375L0 12.625L2.575 10.675C2.55833 10.5583 2.55 10.4458 2.55 10.3375C2.55 10.2292 2.55 10.1167 2.55 10C2.55 9.88333 2.55 9.77083 2.55 9.6625C2.55 9.55417 2.55833 9.44167 2.575 9.325L0 7.375L2.75 2.625L5.725 3.875C5.90833 3.74167 6.1 3.61667 6.3 3.5C6.5 3.38333 6.7 3.28333 6.9 3.2L7.3 0H12.8L13.2 3.2C13.4167 3.28333 13.6208 3.38333 13.8125 3.5C14.0042 3.61667 14.1917 3.74167 14.375 3.875L17.35 2.625L20.1 7.375L17.525 9.325C17.5417 9.44167 17.55 9.55417 17.55 9.6625C17.55 9.77083 17.55 9.88333 17.55 10C17.55 10.1167 17.55 10.2292 17.55 10.3375C17.55 10.4458 17.5333 10.5583 17.5 10.675L20.075 12.625L17.325 17.375L14.375 16.125C14.1917 16.2583 14 16.3833 13.8 16.5C13.6 16.6167 13.4 16.7167 13.2 16.8L12.8 20H7.3ZM9.05 18H11.025L11.375 15.35C11.8917 15.2167 12.3708 15.0208 12.8125 14.7625C13.2542 14.5042 13.6583 14.1917 14.025 13.825L16.5 14.85L17.475 13.15L15.325 11.525C15.4083 11.2917 15.4667 11.0458 15.5 10.7875C15.5333 10.5292 15.55 10.2667 15.55 10C15.55 9.73333 15.5333 9.47083 15.5 9.2125C15.4667 8.95417 15.4083 8.70833 15.325 8.475L17.475 6.85L16.5 5.15L14.025 6.2C13.6583 5.81667 13.2542 5.49583 12.8125 5.2375C12.3708 4.97917 11.8917 4.78333 11.375 4.65L11.05 2H9.075L8.725 4.65C8.20833 4.78333 7.72917 4.97917 7.2875 5.2375C6.84583 5.49583 6.44167 5.80833 6.075 6.175L3.6 5.15L2.625 6.85L4.775 8.45C4.69167 8.7 4.63333 8.95 4.6 9.2C4.56667 9.45 4.55 9.71667 4.55 10C4.55 10.2667 4.56667 10.525 4.6 10.775C4.63333 11.025 4.69167 11.275 4.775 11.525L2.625 13.15L3.6 14.85L6.075 13.8C6.44167 14.1833 6.84583 14.5042 7.2875 14.7625C7.72917 15.0208 8.20833 15.2167 8.725 15.35L9.05 18ZM10.1 13.5C11.0667 13.5 11.8917 13.1583 12.575 12.475C13.2583 11.7917 13.6 10.9667 13.6 10C13.6 9.03333 13.2583 8.20833 12.575 7.525C11.8917 6.84167 11.0667 6.5 10.1 6.5C9.11667 6.5 8.2875 6.84167 7.6125 7.525C6.9375 8.20833 6.6 9.03333 6.6 10C6.6 10.9667 6.9375 11.7917 7.6125 12.475C8.2875 13.1583 9.11667 13.5 10.1 13.5Z" fill="#DAE2FD"/>
</svg>`;

const BACK_ARROW_SVG = `<svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21.4142 9.70703H1.41422M10.4142 18.707L1.41422 9.70703L10.4142 0.707031" stroke="#DAE2FD" stroke-width="2"/>
</svg>`;

const BackArrow = ({ size = 20 }) => (
  <SvgXml xml={BACK_ARROW_SVG} width={size} height={Math.round(size * (20 / 22))} />
);

const OSUpdateScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [deviceDetails, setDeviceDetails] = useState({
    androidVersion: '',
    apiLevel: '',
    brand: '',
    deviceName: '',
    model: '',
    manufacturer: '',
    hardware: '',
    buildId: '',
    securityPatch: '',
  });

  useEffect(() => {
    fetchRealtimeOSInfo();
  }, []);

  const fetchRealtimeOSInfo = async () => {
    setLoading(true);
    try {
      // 1. Android Release Version (e.g., "13", "14")
      const version = (await DeviceInfo.getSystemVersion()) || String(Platform.Version || '13');

      // 2. Android API Level (e.g., "33", "34")
      let api = '';
      try {
        const apiNum = await DeviceInfo.getApiLevel();
        if (apiNum) api = String(apiNum);
      } catch (_e) {
        api = String(DeviceInfo.getApiLevelSync() || '33');
      }

      // 3. Brand & Manufacturer
      const brand = DeviceInfo.getBrand() || Platform.constants?.Brand || 'Android Device';
      const manufacturer =
        DeviceInfo.getManufacturerSync() || Platform.constants?.Manufacturer || brand;

      // 4. Device Model (Exact string from android.os.Build.MODEL)
      const model = DeviceInfo.getModel() || Platform.constants?.Model || 'Model';

      // 5. Friendly Device Name (Settings > About Phone Device Name)
      let deviceName = '';
      try {
        deviceName = await DeviceInfo.getDeviceName();
      } catch (_e) { }

      // 6. Hardware / Board Chipset
      const hardware =
        DeviceInfo.getHardwareSync() || DeviceInfo.getBoardSync() || 'System Hardware';

      // 7. Exact OS Build Display Number (Settings > About Phone Build Number)
      let buildId = '';
      try {
        buildId = DeviceInfo.getDisplaySync() || DeviceInfo.getBuildNumber() || '';
      } catch (_e) { }

      // 8. Exact Security Patch Date (Settings > About Phone Security Patch)
      let securityPatch = '';
      try {
        securityPatch = DeviceInfo.getSecurityPatchSync() || '';
      } catch (_e) { }

      setDeviceDetails({
        androidVersion: version,
        apiLevel: api,
        brand,
        deviceName: deviceName || `${brand} ${model}`,
        model,
        manufacturer,
        hardware,
        buildId: buildId || `${brand}.${version}`,
        securityPatch: securityPatch || 'Latest System Security Patch',
      });
    } catch (_e) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  // Official Android Codename Mapping by API Level
  const getOsCodename = (ver, apiStr) => {
    const api = parseInt(apiStr, 10) || 33;
    if (api >= 36) return 'Baklava';
    if (api === 35) return 'Vanilla Ice Cream';
    if (api === 34) return 'Upside Down Cake';
    if (api === 33) return 'Tiramisu';
    if (api === 31 || api === 32) return 'Snow Cone';
    if (api === 30) return 'Red Velvet Cake';
    if (api === 29) return 'Quince Tart';
    if (api === 28) return 'Pie';
    if (api === 26 || api === 27) return 'Oreo';
    return `Android ${ver}`;
  };

  const handleCheckOSUpdateAction = async () => {
    try {
      if (Platform.OS === 'android') {
        await Linking.sendIntent('android.settings.SYSTEM_UPDATE_SETTINGS').catch(async () => {
          await Linking.openSettings();
        });
      } else {
        await Linking.openSettings();
      }
    } catch (e) {
      Linking.openSettings();
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
            <BackArrow size={15} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('osUpdateTitle')}</Text>
        </View>
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>{t('checkingUpdates')}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top OS Summary Card */}
          <View style={styles.osSummaryCard}>
            <View style={styles.osSummaryTextContainer}>
              <Text style={styles.osCodename}>
                {getOsCodename(deviceDetails.androidVersion, deviceDetails.apiLevel)}
              </Text>
              <Text style={styles.osVersionLabel}>
                Android {deviceDetails.androidVersion}
              </Text>
            </View>

            <SvgXml xml={CONTAINER_SVG} width={54} height={54} />
          </View>

          {/* Device Specifications Card (Matching Settings > About Phone 1:1) */}
          <View style={styles.specsCard}>
            <Text style={styles.specsHeaderTitle}>SYSTEM ABOUT PHONE SPECIFICATIONS</Text>

            {/* Spec Row 1: Device Name */}
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Device Name</Text>
              <Text style={styles.specValue}>{deviceDetails.deviceName}</Text>
            </View>

            {/* Spec Row 2: Brand / Manufacturer */}
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Brand & Manufacturer</Text>
              <Text style={styles.specValue}>
                {deviceDetails.brand} ({deviceDetails.manufacturer})
              </Text>
            </View>

            {/* Spec Row 3: Model Number */}
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Model Number</Text>
              <Text style={styles.specValue}>{deviceDetails.model}</Text>
            </View>

            {/* Spec Row 4: Hardware / Processor */}
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Hardware / Chipset</Text>
              <Text style={styles.specValue}>{deviceDetails.hardware}</Text>
            </View>

            {/* Spec Row 5: Android Security Patch */}
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>{t('securityPatch')}</Text>
              <Text style={[styles.specValue, { color: '#ffffff' }]}>
                {deviceDetails.securityPatch}
              </Text>
            </View>

            {/* Spec Row 6: OS Build Number */}
            <View style={[styles.specRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.specLabel}>Build Number</Text>
              <Text style={[styles.specValue, styles.buildNumberText]}>
                {deviceDetails.buildId}
              </Text>
            </View>
          </View>

          {/* Check OS Update Button */}
          <TouchableOpacity style={styles.checkOsButton} onPress={handleCheckOSUpdateAction}>
            <Text style={styles.checkOsButtonText}>{t('checkUpdatesBtn')}</Text>
          </TouchableOpacity>

          {/* Action Disclaimer Subtext */}
          <Text style={styles.disclaimerText}>
            {t('osUpdateNote')}
          </Text>
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
    marginTop: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#DAE2FD',
    letterSpacing: 0.3,
  },
  settingsButton: {
    padding: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B1120',
  },
  loadingText: {
    marginTop: 14,
    color: '#94A3B8',
    fontSize: 15,
  },
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  osSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#131C31',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  osSummaryTextContainer: {
    flex: 1,
  },
  osCodename: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  osVersionLabel: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  osBadgeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  specsCard: {
    backgroundColor: '#131C31',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  specsHeaderTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94A3B8',
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  specLabel: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  specValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  buildNumberText: {
    color: '#3B82F6',
    fontSize: 13,
  },
  checkOsButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    // Drop shadow effect
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.85,
    shadowRadius: 10,
    elevation: 8,
  },
  checkOsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
});

export default OSUpdateScreen;

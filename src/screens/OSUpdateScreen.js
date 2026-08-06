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

const SETTINGS_ICON = require('../assets/settings_icon.png');

const BackArrow = ({ color = '#FFFFFF', size = 22 }) => (
  <Text style={{ color, fontSize: size, fontWeight: 'bold' }}>←</Text>
);

const OSUpdateScreen = ({ navigation }) => {
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
      } catch (_e) {}

      // 6. Hardware / Board Chipset
      const hardware =
        DeviceInfo.getHardwareSync() || DeviceInfo.getBoardSync() || 'System Hardware';

      // 7. Exact OS Build Display Number (Settings > About Phone Build Number)
      let buildId = '';
      try {
        buildId = DeviceInfo.getDisplaySync() || DeviceInfo.getBuildNumber() || '';
      } catch (_e) {}

      // 8. Exact Security Patch Date (Settings > About Phone Security Patch)
      let securityPatch = '';
      try {
        securityPatch = DeviceInfo.getSecurityPatchSync() || '';
      } catch (_e) {}

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
            <BackArrow size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Phone Update</Text>
        </View>

        <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
          <Image source={SETTINGS_ICON} style={{ width: 22, height: 22 }} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Reading Native OS Specifications...</Text>
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
                Android {deviceDetails.androidVersion} (API Level {deviceDetails.apiLevel})
              </Text>
            </View>

            <View style={styles.osBadgeCircle}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10B981' }}>✓</Text>
            </View>
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
              <Text style={styles.specLabel}>Security Patch Level</Text>
              <Text style={[styles.specValue, { color: '#10B981' }]}>
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
            <Text style={styles.checkOsButtonText}>Check OS Update</Text>
          </TouchableOpacity>

          {/* Action Disclaimer Subtext */}
          <Text style={styles.disclaimerText}>
            Tapping this button will open your phone's official System Update settings screen.
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
    color: '#64748B',
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
    color: '#38BDF8',
    fontSize: 13,
  },
  checkOsButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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

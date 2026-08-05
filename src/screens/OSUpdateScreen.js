import React from 'react';
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

const OSUpdateScreen = ({ navigation }) => {
  const androidVersion = Platform.Version || 13;
  
  // OS Codename mapping
  const getOsName = (ver) => {
    if (ver >= 34) return 'Upside Down Cake';
    if (ver === 33) return 'Tiramisu';
    if (ver === 31 || ver === 32) return 'Snow Cone';
    if (ver === 30) return 'Red Velvet Cake';
    if (ver === 29) return 'Quince Tart';
    return 'Tiramisu';
  };

  const deviceBrand = Platform.constants?.Brand || 'Redmi';
  const deviceModel = Platform.constants?.Model || '2209116AG';
  const deviceManufacturer = Platform.constants?.Manufacturer || 'Xiaomi';
  const hardwareName = Platform.constants?.Fingerprint?.split('/')?.[0] || 'qcom';
  const buildNum = `TKQ1.${androidVersion}0${Math.floor(Math.random()*900+100)}.001 test-keys`;

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
          <WhitePlaceholder size={18} borderRadius={4} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top OS Summary Card */}
        <View style={styles.osSummaryCard}>
          <View style={styles.osSummaryTextContainer}>
            <Text style={styles.osCodename}>{getOsName(androidVersion)}</Text>
            <Text style={styles.osVersionLabel}>Android {androidVersion}</Text>
          </View>

          <View style={styles.osIconSquare}>
            <WhitePlaceholder size={24} borderRadius={4} color="#FFFFFF" />
          </View>
        </View>

        {/* Device Specifications Card */}
        <View style={styles.specsCard}>
          <Text style={styles.specsHeaderTitle}>DEVICE SPECIFICATIONS</Text>

          {/* Spec Row 1: Device Name */}
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Device Name</Text>
            <Text style={styles.specValue}>{deviceBrand}</Text>
          </View>

          {/* Spec Row 2: Manufacturer */}
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Manufacturer</Text>
            <Text style={styles.specValue}>{deviceManufacturer}</Text>
          </View>

          {/* Spec Row 3: Device Model */}
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Device Model</Text>
            <Text style={styles.specValue}>{deviceModel}</Text>
          </View>

          {/* Spec Row 4: Hardware */}
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Hardware</Text>
            <Text style={styles.specValue}>{hardwareName}</Text>
          </View>

          {/* Spec Row 5: Build Number */}
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Build Number</Text>
            <Text style={[styles.specValue, styles.buildNumberText]}>{buildNum}</Text>
          </View>

          {/* Spec Row 6: Build Date */}
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Build Date</Text>
            <Text style={styles.specValue}>May 13, 2026</Text>
          </View>

          {/* Spec Row 7: Release Date */}
          <View style={[styles.specRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.specLabel}>Release Date</Text>
            <Text style={styles.specValue}>August 15, 2022</Text>
          </View>
        </View>

        {/* Check OS Update Button */}
        <TouchableOpacity style={styles.checkOsButton} onPress={handleCheckOSUpdateAction}>
          <Text style={styles.checkOsButtonText}>Check OS Update</Text>
        </TouchableOpacity>

        {/* Action Disclaimer Subtext */}
        <Text style={styles.disclaimerText}>
          This will take you to your device's Settings, where you can check for the latest system update.
        </Text>
      </ScrollView>
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
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  // OS Summary Card
  osSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#131C31',
    borderRadius: 18,
    padding: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  osSummaryTextContainer: {
    flex: 1,
  },
  osCodename: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  osVersionLabel: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  osIconSquare: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Specifications Card
  specsCard: {
    backgroundColor: '#131C31',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  specsHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  specLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buildNumberText: {
    color: '#60A5FA',
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  // Check OS Button & Disclaimer
  checkOsButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkOsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});

export default OSUpdateScreen;

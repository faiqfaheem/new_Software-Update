import React, { useState } from 'react';
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

const MOCK_UNINSTALL_APPS = [
  { id: '1', name: 'Adobe Acrobat', version: '26.6.0.45936', size: '81.55 MB', color: '#DC2626', packageName: 'com.adobe.reader' },
  { id: '2', name: 'AL Habib Mobile', version: '1.0.90', size: '95.46 MB', color: '#16A34A', packageName: 'com.alhabib.mobile' },
  { id: '3', name: 'AliExpress', version: '8.166.7', size: '64.41 MB', color: '#EA580C', packageName: 'com.alibaba.aliexpress' },
  { id: '4', name: 'Aloha VPN', version: '2.8.0', size: '41.40 MB', color: '#2563EB', packageName: 'com.aloha.browser' },
  { id: '5', name: 'Android System Key Verifier', version: '1.367.9291', size: '9.91 MB', color: '#7C3AED', packageName: 'com.android.keyverifier' },
  { id: '6', name: 'Android System SafetyCore', version: '1.0.92557', size: '5.42 MB', color: '#1E40AF', packageName: 'com.android.safetycore' },
  { id: '7', name: 'PUBG Mobile', version: '2.7.0', size: '1.85 GB', color: '#D97706', packageName: 'com.tencent.ig' },
];

const BulkUninstallerScreen = ({ navigation }) => {
  const [selectedIds, setSelectedIds] = useState(['2', '4']); // Pre-select item 2 & 4 as in screenshot

  const toggleSelectApp = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === MOCK_UNINSTALL_APPS.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(MOCK_UNINSTALL_APPS.map((a) => a.id));
    }
  };

  const handleUninstallAction = () => {
    if (selectedIds.length === 0) {
      Alert.alert('No Selection', 'Please select at least one application to uninstall.');
      return;
    }

    const selectedApps = MOCK_UNINSTALL_APPS.filter((a) => selectedIds.includes(a.id));
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
              try {
                const targetApp = selectedApps[0];
                await Linking.sendIntent('android.intent.action.DELETE', [
                  { key: 'package', value: targetApp.packageName || 'com.example.app' },
                ]).catch(() => {
                  Linking.openSettings();
                });
              } catch (e) {
                Linking.openSettings();
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

  const isAllSelected = selectedIds.length === MOCK_UNINSTALL_APPS.length;

  const renderAppItem = ({ item }) => {
    const isSelected = selectedIds.includes(item.id);
    return (
      <TouchableOpacity
        style={styles.appCard}
        activeOpacity={0.8}
        onPress={() => toggleSelectApp(item.id)}
      >
        {/* Left Color Box with White Placeholder */}
        <View style={[styles.appIconContainer, { backgroundColor: item.color }]}>
          <WhitePlaceholder size={24} borderRadius={4} color="#FFFFFF" />
        </View>

        {/* Middle Info */}
        <View style={styles.appInfoContainer}>
          <Text style={styles.appNameText}>{item.name}</Text>
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
          <TouchableOpacity onPress={handleSelectAll}>
            <Text style={styles.selectAllText}>
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Selectable App List */}
        <FlatList
          data={MOCK_UNINSTALL_APPS}
          keyExtractor={(item) => item.id}
          renderItem={renderAppItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

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
    paddingTop: 10,
  },
  topActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  listContent: {
    paddingBottom: 20,
  },
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131C31',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  appIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  appInfoContainer: {
    flex: 1,
  },
  appNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  appVersionText: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 2,
  },
  appSizeText: {
    fontSize: 12,
    color: '#64748B',
  },
  bottomButtonContainer: {
    paddingVertical: 14,
    backgroundColor: '#0B1120',
  },
  uninstallButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
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

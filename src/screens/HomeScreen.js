import React, { useState } from 'react';
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
} from 'react-native';
import { useLanguage } from '../i18n/LanguageContext';

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
    Alert.alert(t('feature6Title'), `${t('feature6Desc')}...\n\n[Action Executed]`);
  };

  const handleBulkUninstaller = () => {
    navigation.navigate('BulkUninstallerScreen');
  };

  const handleSettingsPress = () => {
    Linking.openSettings();
  };

  // --- Tools Tab Action Handlers ---
  const handleStorageInfo = () => {
    navigation.navigate('StorageInfoScreen');
  };

  const handlePermissionManager = () => {
    navigation.navigate('PermissionManagerScreen');
  };

  const handlePhoneSensor = () => {
    Alert.alert('Phone Sensor', 'Hardware Sensors & Diagnostics Check\n\n[Action Executed]');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <Text style={styles.headerAppTitle}>Software Update</Text>

        <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
          <WhitePlaceholder size={18} borderRadius={4} color="#FFFFFF" />
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
            <TouchableOpacity style={styles.heroCircleButton} onPress={handleScanAppUpdates}>
              <View style={styles.heroIconWrapper}>
                <WhitePlaceholder size={32} borderRadius={6} color="#1D4ED8" />
              </View>
              <Text style={styles.heroTitle}>Scan Apps</Text>
              <Text style={styles.heroSub}>Check Updates</Text>
            </TouchableOpacity>
          </View>

          {/* All Apps Full Width Card */}
          <TouchableOpacity style={styles.rowCard} onPress={handleAllApps}>
            <View style={[styles.iconSquare, { backgroundColor: '#1E293B' }]}>
              <WhitePlaceholder size={22} borderRadius={4} color="#FFFFFF" />
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
              <View style={[styles.iconSquare, { backgroundColor: '#991B1B', marginBottom: 16 }]}>
                <WhitePlaceholder size={22} borderRadius={4} color="#FFFFFF" />
              </View>
              <Text style={styles.gridCardTitle}>OS Update</Text>
              <Text style={styles.gridCardSub}>UPDATE AVAILABLE</Text>
            </TouchableOpacity>

            {/* AI Assistant Card (Orange Gradient Accent) */}
            <TouchableOpacity
              style={[styles.gridCard, styles.aiCardGradient]}
              onPress={handleAIAssistantGuide}
            >
              <View style={[styles.iconSquare, { backgroundColor: 'rgba(255,255,255,0.25)', marginBottom: 16 }]}>
                <WhitePlaceholder size={22} borderRadius={4} color="#FFFFFF" />
              </View>
              <Text style={[styles.gridCardTitle, { color: '#FFFFFF' }]}>AI Assistant</Text>
              <Text style={[styles.gridCardSub, { color: 'rgba(255,255,255,0.85)' }]}>SMART OPTIMIZATION</Text>
            </TouchableOpacity>
          </View>

          {/* Bulk Uninstaller Card */}
          <TouchableOpacity style={styles.rowCard} onPress={handleBulkUninstaller}>
            <View style={[styles.iconSquare, { backgroundColor: '#371B36' }]}>
              <WhitePlaceholder size={22} borderRadius={4} color="#FFFFFF" />
            </View>
            <View style={styles.rowCardTextContainer}>
              <Text style={styles.rowCardTitle}>Bulk Uninstaller</Text>
              <Text style={styles.rowCardSub}>Remove Multiple Apps At Once</Text>
            </View>
            <ChevronRight />
          </TouchableOpacity>

          {/* Storage Health & Analytics Card */}
          <View style={styles.statsCard}>
            <View style={styles.statsHeaderRow}>
              <Text style={styles.statsTitle}>Storage Health</Text>
              <Text style={styles.statsHealthBadge}>82% Healthy</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: '82%' }]} />
            </View>

            {/* Stats Columns */}
            <View style={styles.statsColumnsRow}>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>UPDATED</Text>
                <Text style={styles.statVal}>125</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statCol}>
                <Text style={styles.statLabel}>PENDING</Text>
                <Text style={[styles.statVal, { color: '#FB923C' }]}>12</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statCol}>
                <Text style={styles.statLabel}>OPTIMIZED</Text>
                <Text style={styles.statVal}>98%</Text>
              </View>
            </View>
          </View>
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
                <WhitePlaceholder size={44} borderRadius={10} color="#FFFFFF" />
              </View>
              <Text style={styles.toolCardTitle}>Storage INFO</Text>
            </TouchableOpacity>

            {/* Tool 2: Permission Manager */}
            <TouchableOpacity style={styles.toolCard} onPress={handlePermissionManager}>
              <View style={styles.toolIconWrapper}>
                <WhitePlaceholder size={44} borderRadius={10} color="#FFFFFF" />
              </View>
              <Text style={styles.toolCardTitle}>Permission Manager</Text>
            </TouchableOpacity>

            {/* Tool 3: Phone Sensor */}
            <TouchableOpacity style={styles.toolCard} onPress={handlePhoneSensor}>
              <View style={styles.toolIconWrapper}>
                <WhitePlaceholder size={44} borderRadius={10} color="#FFFFFF" />
              </View>
              <Text style={styles.toolCardTitle}>Phone Sensor</Text>
            </TouchableOpacity>

            {/* Tool 4: Permission Manager */}
            <TouchableOpacity style={styles.toolCard} onPress={handlePermissionManager}>
              <View style={styles.toolIconWrapper}>
                <WhitePlaceholder size={44} borderRadius={10} color="#FFFFFF" />
              </View>
              <Text style={styles.toolCardTitle}>Permission Manager</Text>
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
          <WhitePlaceholder
            size={20}
            borderRadius={4}
            color={activeTab === 'home' ? '#3B82F6' : '#64748B'}
          />
          <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('tools')}
        >
          <WhitePlaceholder
            size={20}
            borderRadius={4}
            color={activeTab === 'tools' ? '#3B82F6' : '#64748B'}
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
    backgroundColor: '#0B1120',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 30,
  },
  // Hero Card
  heroCard: {
    backgroundColor: '#131C31',
    borderRadius: 18,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  heroCircleButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#C7D2FE',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#93C5FD',
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
    color: '#3B82F6',
    fontWeight: '600',
    marginTop: 2,
  },
  // Full Width Row Card
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131C31',
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
    justify: 'space-between',
    marginBottom: 14,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#131C31',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    minHeight: 125,
  },
  aiCardGradient: {
    backgroundColor: '#F97316',
    borderColor: '#FB923C',
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
    backgroundColor: '#131C31',
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
    color: '#FFFFFF',
  },
  statsHealthBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: '#60A5FA',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#1E293B',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#60A5FA',
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
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statVal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#1E293B',
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
    backgroundColor: '#131C31',
    borderRadius: 20,
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
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // Bottom Tab Bar
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#0B1120',
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
    color: '#3B82F6',
  },
});

export default HomeScreen;

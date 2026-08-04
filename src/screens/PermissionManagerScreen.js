import React, { useState } from 'react';
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
  Modal,
  FlatList,
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

const ChevronRight = ({ color = '#94A3B8', size = 16 }) => (
  <Text style={{ color, fontSize: size, fontWeight: '600' }}>›</Text>
);

const WarningTriangle = ({ color = '#DC2626', size = 22 }) => (
  <Text style={{ color, fontSize: size, fontWeight: 'bold' }}>⚠️</Text>
);

// Circular Ring Chart Component for Overview
const RingChart = ({ percentage = '85%', ringColor = '#EF4444' }) => (
  <View style={[styles.ringContainer, { borderColor: ringColor }]}>
    <Text style={styles.ringPercentageText}>{percentage}</Text>
  </View>
);

const MOCK_RISK_APPS = {
  High: [
    { id: '1', name: 'TikTok', permissionsCount: '35 Permissions' },
    { id: '2', name: 'Twitter', permissionsCount: '35 Permissions' },
    { id: '3', name: 'Instagram', permissionsCount: '35 Permissions' },
    { id: '4', name: 'Reddit', permissionsCount: '35 Permissions' },
    { id: '5', name: 'Snapchat', permissionsCount: '32 Permissions' },
  ],
  Medium: [
    { id: '1', name: 'TikTok', permissionsCount: '24 Permissions' },
    { id: '2', name: 'Twitter', permissionsCount: '24 Permissions' },
    { id: '3', name: 'Instagram', permissionsCount: '24 Permissions' },
    { id: '4', name: 'Reddit', permissionsCount: '24 Permissions' },
    { id: '5', name: 'Telegram', permissionsCount: '18 Permissions' },
  ],
  Low: [
    { id: '1', name: 'TikTok', permissionsCount: '12 Permissions' },
    { id: '2', name: 'Twitter', permissionsCount: '12 Permissions' },
    { id: '3', name: 'Instagram', permissionsCount: '12 Permissions' },
    { id: '4', name: 'Reddit', permissionsCount: '12 Permissions' },
    { id: '5', name: 'Calculator', permissionsCount: '4 Permissions' },
  ],
  None: [
    { id: '1', name: 'TikTok', permissionsCount: '0 Permissions' },
    { id: '2', name: 'Twitter', permissionsCount: '0 Permissions' },
    { id: '3', name: 'Instagram', permissionsCount: '0 Permissions' },
    { id: '4', name: 'Reddit', permissionsCount: '0 Permissions' },
    { id: '5', name: 'Clock', permissionsCount: '0 Permissions' },
  ],
};

const RISK_COLORS = {
  High: '#DC2626',
  Medium: '#06B6D4',
  Low: '#EAB308',
  None: '#10B981',
};

const PermissionManagerScreen = ({ navigation }) => {
  const [hasAgreed, setHasAgreed] = useState(false);
  const [overviewTab, setOverviewTab] = useState('Installed Apps'); // 'Installed Apps', 'System Apps'
  const [selectedRiskDetail, setSelectedRiskDetail] = useState(null); // null, 'High', 'Medium', 'Low', 'None'

  const handleAgreeAndContinue = () => {
    setHasAgreed(true);
  };

  const handleSettingsPress = () => {
    Linking.openSettings();
  };

  const handleBackPress = () => {
    if (selectedRiskDetail !== null) {
      setSelectedRiskDetail(null);
    } else {
      navigation.goBack();
    }
  };

  const renderDetailAppItem = ({ item }) => {
    const triangleColor = RISK_COLORS[selectedRiskDetail] || '#DC2626';
    return (
      <View style={styles.detailAppCard}>
        {/* Left White Placeholder Icon Container */}
        <View style={styles.detailIconContainer}>
          <WhitePlaceholder size={28} borderRadius={6} color="#FFFFFF" />
        </View>

        {/* Middle Info */}
        <View style={styles.detailInfoContainer}>
          <Text style={styles.detailAppName}>{item.name}</Text>
          <Text style={styles.detailSubText}>{item.permissionsCount}</Text>
        </View>

        {/* Right White Placeholder Box */}
        <WhitePlaceholder size={20} borderRadius={4} color="#FFFFFF" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      {/* Permission Manager Consent Bottom Sheet Modal */}
      <Modal
        visible={!hasAgreed}
        transparent={true}
        animationType="slide"
        onRequestClose={() => navigation.goBack()}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={() => navigation.goBack()}
          />

          <View style={styles.bottomSheetContainer}>
            <View style={styles.dragHandle} />

            <Text style={styles.consentTitle}>Permission Manager</Text>

            <Text style={styles.consentBodyText}>
              To help see which apps have access to things like your camera, location, microphone, and more, this app needs permission to read the list of permissions each installed app is using. The scan happens only on your device - nothing is collected or shared. It's used only to show you which apps have access to sensitive features, so you can decide what to keep or change.
            </Text>

            <TouchableOpacity style={styles.agreeButton} onPress={handleAgreeAndContinue}>
              <Text style={styles.agreeButtonText}>Agree & Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <BackArrow size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>App Permission</Text>
        </View>

        <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
          <WhitePlaceholder size={18} borderRadius={4} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* MAIN CONTENT AREA */}
      <View style={styles.container}>
        {selectedRiskDetail === null ? (
          /* OVERVIEW SCREEN (Pic 2 from previous step) */
          <>
            {/* Filter Pills Row */}
            <View style={styles.filterRow}>
              {['Installed Apps', 'System Apps'].map((tab) => {
                const isActive = overviewTab === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.filterPill, isActive && styles.filterPillActive]}
                    onPress={() => setOverviewTab(tab)}
                  >
                    <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                      {tab}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Risk Overview Cards */}
            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Card 1: High Risk */}
              <TouchableOpacity
                style={styles.riskCard}
                onPress={() => setSelectedRiskDetail('High')}
              >
                <RingChart percentage="85%" ringColor="#DC2626" />
                <Text style={styles.riskTitle}>High Risk</Text>
                <View style={styles.badgeChevronContainer}>
                  <View style={styles.greenCountBadge}>
                    <Text style={styles.countText}>35</Text>
                  </View>
                  <ChevronRight />
                </View>
              </TouchableOpacity>

              {/* Card 2: Medium Risk */}
              <TouchableOpacity
                style={styles.riskCard}
                onPress={() => setSelectedRiskDetail('Medium')}
              >
                <RingChart percentage="85%" ringColor="#06B6D4" />
                <Text style={styles.riskTitle}>Medium Risk</Text>
                <View style={styles.badgeChevronContainer}>
                  <View style={styles.greenCountBadge}>
                    <Text style={styles.countText}>35</Text>
                  </View>
                  <ChevronRight />
                </View>
              </TouchableOpacity>

              {/* Card 3: Low Risk */}
              <TouchableOpacity
                style={styles.riskCard}
                onPress={() => setSelectedRiskDetail('Low')}
              >
                <RingChart percentage="85%" ringColor="#EAB308" />
                <Text style={styles.riskTitle}>Low Risk</Text>
                <View style={styles.badgeChevronContainer}>
                  <View style={styles.greenCountBadge}>
                    <Text style={styles.countText}>35</Text>
                  </View>
                  <ChevronRight />
                </View>
              </TouchableOpacity>

              {/* Card 4: No Risk */}
              <TouchableOpacity
                style={styles.riskCard}
                onPress={() => setSelectedRiskDetail('None')}
              >
                <RingChart percentage="85%" ringColor="#10B981" />
                <Text style={styles.riskTitle}>No Risk</Text>
                <View style={styles.badgeChevronContainer}>
                  <View style={styles.greenCountBadge}>
                    <Text style={styles.countText}>35</Text>
                  </View>
                  <ChevronRight />
                </View>
              </TouchableOpacity>
            </ScrollView>
          </>
        ) : (
          /* RISK DETAIL VIEW (Pics 1 - 4: High, Medium, Low, None) */
          <>
            {/* 4-Pills Row: High, Medium, Low, None */}
            <View style={styles.detailPillsRow}>
              {[
                { key: 'High', label: 'High' },
                { key: 'Medium', label: 'Medium' },
                { key: 'Low', label: 'Low' },
                { key: 'None', label: 'None' },
              ].map((pill) => {
                const isActive = selectedRiskDetail === pill.key;
                return (
                  <TouchableOpacity
                    key={pill.key}
                    style={[styles.detailPill, isActive && styles.detailPillActive]}
                    onPress={() => setSelectedRiskDetail(pill.key)}
                  >
                    <Text style={[styles.detailPillText, isActive && styles.detailPillTextActive]}>
                      {pill.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Apps List per Selected Risk Level */}
            <FlatList
              data={MOCK_RISK_APPS[selectedRiskDetail] || []}
              keyExtractor={(item) => item.id}
              renderItem={renderDetailAppItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  // Header Bar
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
    paddingTop: 14,
  },
  // Modal Consent Bottom Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 18, 0.75)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  bottomSheetContainer: {
    backgroundColor: '#131C31',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderColor: '#1E293B',
  },
  dragHandle: {
    width: 48,
    height: 5,
    backgroundColor: '#94A3B8',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  consentTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  consentBodyText: {
    fontSize: 13.5,
    color: '#94A3B8',
    lineHeight: 21,
    marginBottom: 28,
  },
  agreeButton: {
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
  agreeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Filter Row (Overview)
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#131C31',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginRight: 10,
    alignItems: 'center',
  },
  filterPillActive: {
    backgroundColor: '#1E293B',
    borderColor: '#3B82F6',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  // Risk Cards List
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  riskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131C31',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  ringContainer: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  ringPercentageText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  riskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  badgeChevronContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenCountBadge: {
    backgroundColor: '#84CC16',
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  countText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  // --- Risk Detail View Styles ---
  detailPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailPill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: '#131C31',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginRight: 8,
    alignItems: 'center',
  },
  detailPillActive: {
    backgroundColor: '#1E293B',
    borderColor: '#3B82F6',
  },
  detailPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  detailPillTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 30,
  },
  detailAppCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131C31',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  detailIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  detailInfoContainer: {
    flex: 1,
  },
  detailAppName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  detailSubText: {
    fontSize: 12,
    color: '#94A3B8',
  },
});

export default PermissionManagerScreen;

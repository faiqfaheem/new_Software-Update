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

const StorageInfoScreen = ({ navigation }) => {
  const handleSettingsPress = () => {
    Linking.openSettings();
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
          <WhitePlaceholder size={18} borderRadius={4} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Main Mobile Storage Screen Content */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Circular Progress Card */}
        <View style={styles.storageCircleCard}>
          <View style={styles.circleOuterRing}>
            <View style={styles.circleInnerContainer}>
              <Text style={styles.percentageText}>85%</Text>
              <Text style={styles.usedSubText}>Used</Text>
            </View>
          </View>
        </View>

        {/* 2-Column Space Cards (Total Space & Used Space) */}
        <View style={styles.spaceCardsRow}>
          {/* Total Space Card */}
          <View style={[styles.spaceCard, styles.totalSpaceCard]}>
            <Text style={styles.spaceCardTitle}>Total Space</Text>
            <Text style={styles.spaceCardVal}>225.00 GB</Text>
          </View>

          {/* Used Space Card */}
          <View style={[styles.spaceCard, styles.usedSpaceCard]}>
            <Text style={styles.spaceCardTitle}>Used Space</Text>
            <Text style={styles.spaceCardVal}>225.00 GB</Text>
          </View>
        </View>

        {/* Storage Breakdown Item Cards */}
        {/* Item 1: Audios */}
        <View style={styles.breakdownCard}>
          <View style={[styles.iconSquare, { backgroundColor: '#7C3AED' }]}>
            <WhitePlaceholder size={22} borderRadius={4} color="#FFFFFF" />
          </View>
          <Text style={styles.breakdownTitle}>Audios</Text>
          <Text style={styles.breakdownSize}>1.20 GB</Text>
        </View>

        {/* Item 2: Videos */}
        <View style={styles.breakdownCard}>
          <View style={[styles.iconSquare, { backgroundColor: '#DC2626' }]}>
            <WhitePlaceholder size={22} borderRadius={4} color="#FFFFFF" />
          </View>
          <Text style={styles.breakdownTitle}>Videos</Text>
          <Text style={styles.breakdownSize}>1.20 GB</Text>
        </View>

        {/* Item 3: Images */}
        <View style={styles.breakdownCard}>
          <View style={[styles.iconSquare, { backgroundColor: '#4F46E5' }]}>
            <WhitePlaceholder size={22} borderRadius={4} color="#FFFFFF" />
          </View>
          <Text style={styles.breakdownTitle}>Images</Text>
          <Text style={styles.breakdownSize}>1.20 GB</Text>
        </View>

        {/* Item 4: All Apps */}
        <View style={styles.breakdownCard}>
          <View style={[styles.iconSquare, { backgroundColor: '#16A34A' }]}>
            <WhitePlaceholder size={22} borderRadius={4} color="#FFFFFF" />
          </View>
          <Text style={styles.breakdownTitle}>All Apps</Text>
          <Text style={styles.breakdownSize}>1.20 GB</Text>
        </View>
      </ScrollView>
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
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  // Storage Circle Card
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
  circleOuterRing: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 16,
    borderColor: '#84CC16',
    alignItems: 'center',
    justifyContent: 'center',
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
  // 2-Column Space Cards
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
    color: '#94A3B8',
  },
  // Breakdown Item Cards
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

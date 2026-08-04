import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
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

const SearchIcon = ({ color = '#64748B', size = 16 }) => (
  <Text style={{ color, fontSize: size, marginRight: 10 }}>🔍</Text>
);

const MOCK_APPS = [
  { id: '1', name: 'Spotify', category: 'MEDIA', size: '342 MB', lastUsed: 'Used 2h ago', type: 'Installed' },
  { id: '2', name: 'Instagram', category: 'SOCIAL', size: '512 MB', lastUsed: 'Used Yesterday', type: 'Installed' },
  { id: '3', name: 'System UI', category: 'SYSTEM', size: '42 MB', lastUsed: 'Background Process', type: 'System' },
  { id: '4', name: 'Adobe Lightroom', category: 'CREATIVE', size: '1.2 GB', lastUsed: 'Used 5d ago', type: 'Installed' },
  { id: '5', name: 'VS Code Mobile', category: 'TOOLS', size: '890 MB', lastUsed: 'Used 12h ago', type: 'Installed' },
  { id: '6', name: 'Android System', category: 'SYSTEM', size: '156 MB', lastUsed: 'Background Process', type: 'System' },
  { id: '7', name: 'WhatsApp', category: 'SOCIAL', size: '230 MB', lastUsed: 'Used 30m ago', type: 'Installed' },
  { id: '8', name: 'Package Installer', category: 'SYSTEM', size: '18 MB', lastUsed: 'System Service', type: 'System' },
];

const AllAppsScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All'); // 'All', 'Installed', 'System'

  const filteredApps = MOCK_APPS.filter((app) => {
    const matchesFilter =
      selectedFilter === 'All' ||
      (selectedFilter === 'Installed' && app.type === 'Installed') ||
      (selectedFilter === 'System' && app.type === 'System');

    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleSettingsPress = () => {
    Linking.openSettings();
  };

  const renderAppItem = ({ item }) => (
    <View style={styles.appCard}>
      {/* Icon Container with White Placeholder */}
      <View style={styles.appIconContainer}>
        <WhitePlaceholder size={28} borderRadius={6} color="#FFFFFF" />
      </View>

      {/* App Info */}
      <View style={styles.appInfoContainer}>
        <View style={styles.appHeaderRow}>
          <Text style={styles.appNameText}>{item.name}</Text>
          <View style={[styles.categoryBadge, item.category === 'SYSTEM' && styles.systemBadge]}>
            <Text style={[styles.categoryBadgeText, item.category === 'SYSTEM' && styles.systemBadgeText]}>
              {item.category}
            </Text>
          </View>
        </View>

        <View style={styles.appSubRow}>
          <Text style={styles.appSizeText}>{item.size}</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.appLastUsedText}>{item.lastUsed}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <BackArrow size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Apps</Text>
        </View>

        <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
          <WhitePlaceholder size={18} borderRadius={4} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* Search Input Bar */}
        <View style={styles.searchBarContainer}>
          <SearchIcon size={16} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search applications..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Pills Row */}
        <View style={styles.filterRow}>
          {['All', 'Installed', 'System'].map((filter) => {
            const isActive = selectedFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Apps FlatList */}
        <FlatList
          data={filteredApps}
          keyExtractor={(item) => item.id}
          renderItem={renderAppItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
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
    paddingTop: 14,
  },
  // Search Bar
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131C31',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
  },
  // Filter Pills
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#131C31',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginRight: 10,
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
  // List Content
  listContent: {
    paddingBottom: 30,
  },
  // App Card Item
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
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  appInfoContainer: {
    flex: 1,
  },
  appHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  appNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  categoryBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  systemBadge: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  systemBadgeText: {
    color: '#FACC15',
  },
  appSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appSizeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  dotSeparator: {
    color: '#64748B',
    marginHorizontal: 6,
    fontSize: 12,
  },
  appLastUsedText: {
    fontSize: 13,
    color: '#64748B',
  },
});

export default AllAppsScreen;

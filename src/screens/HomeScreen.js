import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { useLanguage } from '../i18n/LanguageContext';

const HomeScreen = () => {
  const { t } = useLanguage();

  const handleScanAppUpdates = () => {
    Alert.alert(
      t('feature1Title'),
      `${t('feature1Desc')}...\n\n[Dummy Action]`
    );
  };

  const handleSystemOSUpdate = async () => {
    try {
      if (Platform.OS === 'android') {
        await Linking.sendIntent('android.settings.SYSTEM_UPDATE_SETTINGS').catch(
          async () => {
            await Linking.openSettings();
          }
        );
      } else {
        await Linking.openSettings();
      }
    } catch (error) {
      console.warn('Could not launch OS update settings:', error);
      Linking.openSettings();
    }
  };

  const handleHardwareTests = () => {
    Alert.alert(
      t('feature3Title'),
      `${t('feature3Desc')}...\n\n[Dummy Action]`
    );
  };

  const handleAppUninstaller = () => {
    Alert.alert(
      t('feature4Title'),
      `${t('feature4Desc')}...\n\n[Dummy Action]`
    );
  };

  const handleUsageBatteryAnalytics = () => {
    Alert.alert(
      t('feature5Title'),
      `${t('feature5Desc')}...\n\n[Dummy Action]`
    );
  };

  const handleAIAssistantGuide = () => {
    Alert.alert(
      t('feature6Title'),
      `${t('feature6Desc')}...\n\n[Dummy Action]`
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>{t('appHeaderTitle')}</Text>
      <Text style={styles.headerSubtitle}>{t('appHeaderSub')}</Text>

      <View style={styles.gridContainer}>
        {/* Feature 1 */}
        <TouchableOpacity style={styles.card} onPress={handleScanAppUpdates}>
          <Text style={styles.cardIcon}>🔄</Text>
          <Text style={styles.cardTitle}>{t('feature1Title')}</Text>
          <Text style={styles.cardDesc}>{t('feature1Desc')}</Text>
        </TouchableOpacity>

        {/* Feature 2 */}
        <TouchableOpacity style={styles.card} onPress={handleSystemOSUpdate}>
          <Text style={styles.cardIcon}>📲</Text>
          <Text style={styles.cardTitle}>{t('feature2Title')}</Text>
          <Text style={styles.cardDesc}>{t('feature2Desc')}</Text>
        </TouchableOpacity>

        {/* Feature 3 */}
        <TouchableOpacity style={styles.card} onPress={handleHardwareTests}>
          <Text style={styles.cardIcon}>⚡</Text>
          <Text style={styles.cardTitle}>{t('feature3Title')}</Text>
          <Text style={styles.cardDesc}>{t('feature3Desc')}</Text>
        </TouchableOpacity>

        {/* Feature 4 */}
        <TouchableOpacity style={styles.card} onPress={handleAppUninstaller}>
          <Text style={styles.cardIcon}>🧹</Text>
          <Text style={styles.cardTitle}>{t('feature4Title')}</Text>
          <Text style={styles.cardDesc}>{t('feature4Desc')}</Text>
        </TouchableOpacity>

        {/* Feature 5 */}
        <TouchableOpacity style={styles.card} onPress={handleUsageBatteryAnalytics}>
          <Text style={styles.cardIcon}>🔋</Text>
          <Text style={styles.cardTitle}>{t('feature5Title')}</Text>
          <Text style={styles.cardDesc}>{t('feature5Desc')}</Text>
        </TouchableOpacity>

        {/* Feature 6 */}
        <TouchableOpacity style={styles.card} onPress={handleAIAssistantGuide}>
          <Text style={styles.cardIcon}>🤖</Text>
          <Text style={styles.cardTitle}>{t('feature6Title')}</Text>
          <Text style={styles.cardDesc}>{t('feature6Desc')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111111',
    marginTop: 20,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 15,
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 12,
    color: '#718096',
    lineHeight: 16,
  },
});

export default HomeScreen;

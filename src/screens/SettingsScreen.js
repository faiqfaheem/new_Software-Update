import { SvgXml } from 'react-native-svg';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Share,
  SafeAreaView,
  StatusBar,
  Modal,
  Alert,
  Image,
} from 'react-native';

import CustomModal from '../components/CustomModal';

const BACK_ARROW_SVG = `<svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21.4142 9.70703H1.41422M10.4142 18.707L1.41422 9.70703L10.4142 0.707031" stroke="#DAE2FD" stroke-width="2"/>
</svg>`;

const BackArrow = ({ size = 20 }) => (
  <SvgXml xml={BACK_ARROW_SVG} width={size} height={Math.round(size * (20 / 22))} />
);

const SettingsScreen = ({ navigation }) => {
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);

  // Custom Theme Modal State
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: '',
    message: '',
    primaryButton: null,
    secondaryButton: null,
  });

  const showModal = (config) => {
    setModalConfig({
      visible: true,
      ...config,
    });
  };

  const hideModal = () => {
    setModalConfig((prev) => ({ ...prev, visible: false }));
  };

  const handlePrivacyPolicy = () => {
    setPrivacyModalVisible(true);
  };

  const handleLanguages = () => {
    navigation.navigate('LanguageScreen');
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        title: 'Software Update App',
        message:
          'Check out Software Update Utility App to manage app permissions, scan updates, and test phone sensors: https://play.google.com/store/apps/details?id=com.softwareupdateutilityapp',
      });
    } catch (error) {
      showModal({
        title: 'Share App',
        message: 'Unable to open system share sheet.',
        primaryButton: { label: 'Got It', onPress: () => {} },
      });
    }
  };

  const handleRateUs = async () => {
    const playStoreUrl = 'market://details?id=com.softwareupdateutilityapp';
    const webUrl = 'https://play.google.com/store/apps/details?id=com.softwareupdateutilityapp';
    try {
      const supported = await Linking.canOpenURL(playStoreUrl);
      if (supported) {
        await Linking.openURL(playStoreUrl);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch (e) {
      showModal({
        title: 'Thank You!',
        message: 'Thank you for your rating and valuable feedback!',
        primaryButton: { label: 'Close', onPress: () => {} },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <BackArrow size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Main Settings List */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Item 1: Privacy Policy */}
        <TouchableOpacity
          style={styles.settingsCard}
          activeOpacity={0.7}
          onPress={handlePrivacyPolicy}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#1E293B' }]}>
            <Text style={{ fontSize: 24 }}>📄</Text>
          </View>
          <Text style={styles.settingsTitle}>Privacy Policy</Text>
        </TouchableOpacity>

        {/* Item 2: Languages */}
        <TouchableOpacity
          style={styles.settingsCard}
          activeOpacity={0.7}
          onPress={handleLanguages}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#1E293B' }]}>
            <Text style={{ fontSize: 24 }}>🌐</Text>
          </View>
          <Text style={styles.settingsTitle}>Languages</Text>
        </TouchableOpacity>

        {/* Item 3: Share App */}
        <TouchableOpacity
          style={styles.settingsCard}
          activeOpacity={0.7}
          onPress={handleShareApp}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#1E293B' }]}>
            <Text style={{ fontSize: 24 }}>📲</Text>
          </View>
          <Text style={styles.settingsTitle}>Share App</Text>
        </TouchableOpacity>

        {/* Item 4: Rate Us */}
        <TouchableOpacity
          style={styles.settingsCard}
          activeOpacity={0.7}
          onPress={handleRateUs}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#1E293B' }]}>
            <Text style={{ fontSize: 24 }}>⭐</Text>
          </View>
          <Text style={styles.settingsTitle}>Rate Us</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Privacy Policy Modal */}
      <Modal
        visible={privacyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalText}>
                Your privacy is important to us. Software Update Utility App scans installed packages and permissions locally on your device to help you manage sensitive accesses.
                {"\n\n"}
                • No personal data, contacts, or media files are uploaded to any external server.
                {"\n"}
                • All scanning processes occur strictly offline on your local device.
                {"\n"}
                • App permission details are displayed solely for user awareness and management.
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setPrivacyModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Theme Dialog Popup */}
      <CustomModal {...modalConfig} onClose={hideModal} />
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#0B1120',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    padding: 6,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Gilroy-Bold',
    fontWeight: 'bold',
    color: '#DAE2FD',
    letterSpacing: 0.3,
  },
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  settingsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131C31',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DAE2FD',
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#131C31',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DAE2FD',
    marginBottom: 14,
  },
  modalScroll: {
    marginBottom: 20,
  },
  modalText: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;

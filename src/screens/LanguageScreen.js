import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { setStoredLanguage } from '../utils/storage';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'ur', label: 'Urdu', native: 'اردو' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
];

const LanguageScreen = ({ navigation }) => {
  const [selectedLang, setSelectedLang] = useState('en');

  const handleContinue = async () => {
    if (!selectedLang) {
      Alert.alert('Language Required', 'Please select a language to continue.');
      return;
    }
    await setStoredLanguage(selectedLang);
    navigation.navigate('PermissionScreen');
  };

  const renderItem = ({ item }) => {
    const isSelected = item.code === selectedLang;
    return (
      <TouchableOpacity
        style={[styles.itemContainer, isSelected && styles.itemSelected]}
        onPress={() => setSelectedLang(item.code)}
      >
        <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
          {item.label} ({item.native})
        </Text>
        <Text style={styles.radioText}>{isSelected ? '[ ✓ ]' : '[   ]'}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Language</Text>
      <Text style={styles.subtitle}>Choose your preferred language for the app</Text>

      <FlatList
        data={LANGUAGES}
        keyExtractor={(item) => item.code}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>Continue / Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111111',
    marginTop: 40,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginVertical: 10,
  },
  listContainer: {
    marginVertical: 15,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#FAF9F6',
  },
  itemSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#EBF5FF',
  },
  itemText: {
    fontSize: 16,
    color: '#333333',
  },
  itemTextSelected: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  radioText: {
    fontSize: 16,
    color: '#007AFF',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LanguageScreen;

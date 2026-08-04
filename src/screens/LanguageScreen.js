import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useLanguage } from '../i18n/LanguageContext';

const LanguageScreen = ({ navigation }) => {
  const { language, changeLanguage, t, LANGUAGES } = useLanguage();

  const handleContinue = async () => {
    navigation.navigate('OnboardingScreen');
  };

  const renderItem = ({ item }) => {
    const isSelected = item.code === language;
    return (
      <TouchableOpacity
        style={[styles.itemContainer, isSelected && styles.itemSelected]}
        onPress={() => changeLanguage(item.code)}
      >
        <View style={styles.leftContainer}>
          <Text style={styles.flagText}>{item.flag}</Text>
          <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
            {item.name}
          </Text>
        </View>

        <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('selectLanguage')}</Text>
      <Text style={styles.subtitle}>{t('chooseLanguageSub')}</Text>

      <FlatList
        data={LANGUAGES}
        keyExtractor={(item) => item.code}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>{t('continueNext')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0F1424',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 30,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginVertical: 8,
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#1E253B',
  },
  itemSelected: {
    borderColor: '#5B8DEF',
    backgroundColor: '#4C82F6',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagText: {
    fontSize: 24,
    marginRight: 14,
  },
  itemText: {
    fontSize: 16,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  itemTextSelected: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4C82F6',
  },
  continueButton: {
    backgroundColor: '#4C82F6',
    paddingVertical: 16,
    borderRadius: 12,
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

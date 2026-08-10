import { SvgXml } from 'react-native-svg';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { useLanguage } from '../i18n/LanguageContext';

const FLAG_ICONS = {
  en: require('../assets/flags/ic_uk.png'),
  ar: require('../assets/flags/ic_uae.png'),
  fr: require('../assets/flags/ic_france.png'),
  de: require('../assets/flags/ic_germany.png'),
  zh: require('../assets/flags/ic_china.png'),
  pt: require('../assets/flags/portugal.png'),
  es: require('../assets/flags/ic_spain.png'),
  ru: require('../assets/flags/ic_russia.png'),
};

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
          {FLAG_ICONS[item.code] ? (
            <Image
              source={FLAG_ICONS[item.code]}
              style={styles.flagIcon}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.flagPlaceholder} />
          )}

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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1326" />

      {/* Header Row with Title and Top Right Next Button */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t('selectLanguage')}</Text>
        <TouchableOpacity style={styles.nextButton} onPress={handleContinue}>
          <Text style={styles.nextText}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Language List */}
      <FlatList
        data={LANGUAGES}
        keyExtractor={(item) => item.code}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#0B1326',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#DAE2FD',
    fontFamily: 'Gilroy-Bold',
  },
  nextButton: {
    backgroundColor: '#6695FF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 30,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    marginBottom: 14,
    backgroundColor: '#232A3B',
  },
  itemSelected: {
    borderColor: '#5B93FF',
    backgroundColor: '#6695FF',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagIcon: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 14,
  },
  flagPlaceholder: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#FFFFFF',
    marginRight: 14,
  },
  itemText: {
    fontSize: 18,
    color: '#CBD5E1',
    fontWeight: '500',
    paddingLeft: 10,
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
    backgroundColor: '#0F1424',
  },
});

export default LanguageScreen;

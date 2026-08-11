import { SvgXml } from 'react-native-svg';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { setFirstLaunchCompleted } from '../utils/storage';
import { useLanguage } from '../i18n/LanguageContext';

const { width } = Dimensions.get('window');

const ONBOARDING_IMAGE_1 = require('../assets/onboardings/onboarding1.png');
const ONBOARDING_IMAGE_2 = require('../assets/onboardings/onboarding2.png');
const ONBOARDING_IMAGE_3 = require('../assets/onboardings/onboarding3.png');

const OnboardingScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const SLIDES = [
    {
      id: '1',
      title: t('slide1Title'),
      description: t('slide1Desc'),
      image: ONBOARDING_IMAGE_1,
    },
    {
      id: '2',
      title: t('slide2Title'),
      description: t('slide2Desc'),
      image: ONBOARDING_IMAGE_2,
    },
    {
      id: '3',
      title: t('slide3Title'),
      description: t('slide3Desc'),
      image: ONBOARDING_IMAGE_3,
    },
  ];

  const handleFinishOnboarding = async () => {
    await setFirstLaunchCompleted(true);
    navigation.reset({
      index: 0,
      routes: [{ name: 'HomeScreen' }],
    });
  };

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      await handleFinishOnboarding();
    }
  };

  const handleSkip = async () => {
    await handleFinishOnboarding();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      const index = viewableItems[0].index;
      if (index !== null && index !== undefined) {
        setCurrentIndex(index);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const getItemLayout = (_, index) => ({
    length: width,
    offset: width * index,
    index,
  });

  const renderSlide = ({ item }) => {
    return (
      <View style={styles.slide}>
        {/* Uniform Hero Image Box for 100% Locked Position Across All 3 Slides */}
        <View style={styles.heroImageContainer}>
          <Image
            source={item.image}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* Title & Description */}
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1326" />

      {/* Top Navigation Bar with Skip */}
      <View style={styles.topBar}>
        {!isLastSlide ? (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>{t('skip')}</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
      </View>

      {/* Slide Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
      />

      {/* Bottom Footer Stack: Centered Page Indicators & Centered Next Button */}
      <View style={styles.bottomVerticalStack}>
        {/* Step Indicator Bars */}
        <View style={styles.paginationRow}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dotBar,
                currentIndex === index ? styles.activeDotBar : styles.inactiveDotBar,
              ]}
            />
          ))}
        </View>

        {/* Next -> Action Button */}
        <TouchableOpacity style={styles.nextLink} onPress={handleNext}>
          <Text style={styles.nextLinkText}>
            {isLastSlide ? t('getStarted') : t('next')}
          </Text>
          <Text style={styles.arrowIcon}> →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1326',
  },
  topBar: {
    paddingHorizontal: 24,
    paddingTop: 10,
    height: 45,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 15,
    color: '#94A3B8',
    fontWeight: '500',
  },
  slide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  heroImageContainer: {
    width: 326,
    height: 295,
    marginTop: 25,
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#DAE2FD',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Gilroy-Bold',
  },
  description: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 28,
  },
  bottomVerticalStack: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 36,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  dotBar: {
    height: 5,
    borderRadius: 2.5,
    marginHorizontal: 3,
  },
  activeDotBar: {
    width: 28,
    backgroundColor: '#6695FF',
    shadowColor: '#6695FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  inactiveDotBar: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(102, 149, 255, 0.3)',
  },
  nextLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6695FF',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 30,
    shadowColor: '#6695FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  nextLinkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  arrowIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default OnboardingScreen;

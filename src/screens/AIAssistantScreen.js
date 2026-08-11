/**
 * AIAssistantScreen.js
 * ─────────────────────────────────────────────────────────────────
 * Fully-functional In-App AI Assistant using the Groq API.
 * Design: matches attached mockup — hero logo, SYSTEMS ONLINE,
 *         chat bubbles, bottom input bar with white placeholders.
 * ─────────────────────────────────────────────────────────────────
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Image,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { GROQ_API_KEY } from '../config/env';
import { useLanguage } from '../i18n/LanguageContext';

const SEND_BUTTON_SVG = `<svg width="42" height="42" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="37.8462" height="37.8462" rx="12.6154" fill="#3B82F6"/>
<path d="M19.4073 11.0637C19.2377 10.7253 18.8917 10.5117 18.5133 10.5117C18.1348 10.5117 17.7888 10.7253 17.6193 11.0637L10.6193 25.0637C10.4418 25.4183 10.4907 25.8444 10.744 26.1496C10.9972 26.4549 11.4069 26.5816 11.7883 26.4727L16.7883 25.0437C17.2176 24.9208 17.5135 24.5282 17.5133 24.0817V19.5107C17.5133 19.1534 17.7039 18.8233 18.0133 18.6446C18.3227 18.466 18.7039 18.466 19.0133 18.6446C19.3227 18.8233 19.5133 19.1534 19.5133 19.5107V24.0817C19.513 24.5282 19.8089 24.9208 20.2383 25.0437L25.2383 26.4717C25.6195 26.5808 26.0292 26.4544 26.2827 26.1494C26.5361 25.8444 26.5854 25.4185 26.4083 25.0637L19.4083 11.0637H19.4073Z" fill="white"/>
</svg>`;

const MAIN_AI_LOGO_SVG = `<svg width="110" height="110" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M97.55 108.51H64C63.8674 108.51 63.7402 108.457 63.6464 108.364C63.5527 108.27 63.5 108.143 63.5 108.01C63.5 107.877 63.5527 107.75 63.6464 107.656C63.7402 107.563 63.8674 107.51 64 107.51H97.55C100.631 107.507 103.585 106.282 105.764 104.104C107.942 101.925 109.167 98.971 109.17 95.89V84C109.17 83.8674 109.223 83.7402 109.316 83.6464C109.41 83.5527 109.537 83.5 109.67 83.5C109.803 83.5 109.93 83.5527 110.024 83.6464C110.117 83.7402 110.17 83.8674 110.17 84V95.89C110.167 99.2362 108.837 102.445 106.471 104.811C104.105 107.177 100.896 108.507 97.55 108.51Z" fill="#3D47A3"/>
<path d="M68.7101 104.32H59.2901C58.3433 104.37 57.4516 104.78 56.7989 105.468C56.1462 106.155 55.7823 107.067 55.7823 108.015C55.7823 108.963 56.1462 109.875 56.7989 110.563C57.4516 111.25 58.3433 111.661 59.2901 111.71H68.7101C69.6568 111.661 70.5485 111.25 71.2012 110.563C71.8539 109.875 72.2178 108.963 72.2178 108.015C72.2178 107.067 71.8539 106.155 71.2012 105.468C70.5485 104.78 69.6568 104.37 68.7101 104.32Z" fill="#4E91F2"/>
<path d="M109.67 65.9995C109.537 65.9995 109.41 65.9468 109.317 65.853C109.223 65.7592 109.17 65.6321 109.17 65.4995C109.17 40.0995 88.7601 19.4395 63.6801 19.4395C38.6001 19.4395 18.1901 40.0995 18.1901 65.4995C18.1875 65.6313 18.134 65.757 18.0408 65.8502C17.9476 65.9434 17.8219 65.9969 17.6901 65.9995C17.5575 65.9995 17.4303 65.9468 17.3365 65.853C17.2427 65.7592 17.1901 65.6321 17.1901 65.4995C17.1901 39.5494 38.0401 18.4395 63.6801 18.4395C89.3201 18.4395 110.17 39.5494 110.17 65.4995C110.17 65.6321 110.117 65.7592 110.024 65.853C109.93 65.9468 109.803 65.9995 109.67 65.9995Z" fill="#3D47A3"/>
<path d="M95.8901 34.9292C95.1832 34.9318 94.5038 34.6551 94.0001 34.1592C85.9517 26.1156 75.0387 21.5972 63.66 21.5972C52.2814 21.5972 41.3684 26.1156 33.3201 34.1592C33.0746 34.4173 32.7799 34.6235 32.4533 34.7655C32.1267 34.9076 31.7749 34.9826 31.4188 34.9862C31.0626 34.9897 30.7094 34.9217 30.3801 34.7862C30.0507 34.6507 29.7519 34.4504 29.5014 34.1972C29.2509 33.944 29.0538 33.6431 28.9218 33.3123C28.7898 32.9815 28.7255 32.6276 28.7329 32.2715C28.7402 31.9155 28.819 31.5645 28.9645 31.2394C29.11 30.9144 29.3193 30.6218 29.5801 30.3792C38.6269 21.3561 50.8827 16.2891 63.66 16.2891C76.4374 16.2891 88.6932 21.3561 97.7401 30.3792C98.2383 30.8779 98.5182 31.5541 98.5182 32.2592C98.5182 32.9642 98.2383 33.6404 97.7401 34.1392C97.2524 34.6373 96.587 34.9214 95.8901 34.9292Z" fill="#4E91F2"/>
<path d="M18.29 59.998H21.79V96.758H18.29C16.964 96.758 15.6922 96.2313 14.7545 95.2936C13.8168 94.3559 13.29 93.0841 13.29 91.758V64.998C13.29 63.672 13.8168 62.4002 14.7545 61.4625C15.6922 60.5248 16.964 59.998 18.29 59.998Z" fill="#336CBD"/>
<path d="M12.3 64.5977H13.3V92.1277H12.3C10.974 92.1277 9.7022 91.6009 8.76451 90.6632C7.82683 89.7255 7.30005 88.4537 7.30005 87.1277V69.5977C7.30005 68.2716 7.82683 66.9998 8.76451 66.0621C9.7022 65.1244 10.974 64.5977 12.3 64.5977Z" fill="#4E91F2"/>
<path d="M24.5 56.3184H23.82C22.6989 56.3184 21.79 57.2272 21.79 58.3484V98.3784C21.79 99.4995 22.6989 100.408 23.82 100.408H24.5C25.6212 100.408 26.53 99.4995 26.53 98.3784V58.3484C26.53 57.2272 25.6212 56.3184 24.5 56.3184Z" fill="#4E91F2"/>
<path d="M109.71 96.7285H106.21V59.9685H109.71C111.036 59.9685 112.308 60.4953 113.245 61.433C114.183 62.3707 114.71 63.6424 114.71 64.9685V91.7285C114.71 93.0546 114.183 94.3264 113.245 95.264C112.308 96.2017 111.036 96.7285 109.71 96.7285Z" fill="#336CBD"/>
<path d="M115.7 92.1289H114.7V64.5989H115.7C117.026 64.5989 118.298 65.1257 119.235 66.0634C120.173 67.0011 120.7 68.2728 120.7 69.5989V87.1289C120.7 88.455 120.173 89.7268 119.235 90.6644C118.298 91.6021 117.026 92.1289 115.7 92.1289Z" fill="#4E91F2"/>
<path d="M104.65 100.129H105.33C106.451 100.129 107.36 99.22 107.36 98.0989V58.0689C107.36 56.9478 106.451 56.0389 105.33 56.0389H104.65C103.529 56.0389 102.62 56.9478 102.62 58.0689V98.0989C102.62 99.22 103.529 100.129 104.65 100.129Z" fill="#4E91F2"/>
<path d="M74.4701 60.1664C75.4595 54.3941 71.5822 48.9127 65.8099 47.9234C60.0377 46.934 54.5563 50.8113 53.5669 56.5836C52.5775 62.3558 56.4549 67.8372 62.2271 68.8266C67.9994 69.8159 73.4807 65.9386 74.4701 60.1664Z" fill="#A5B8F3"/>
<path d="M87.8001 67.209H40.1901C38.5332 67.209 37.1901 68.5521 37.1901 70.209V91.519C37.1901 93.1758 38.5332 94.519 40.1901 94.519H87.8001C89.4569 94.519 90.8001 93.1758 90.8001 91.519V70.209C90.8001 68.5521 89.4569 67.209 87.8001 67.209Z" fill="#A5B8F3"/>
<path d="M91.6601 74.7598H36.3401C34.6832 74.7598 33.3401 76.1029 33.3401 77.7598V83.9598C33.3401 85.6166 34.6832 86.9598 36.3401 86.9598H91.6601C93.3169 86.9598 94.6601 85.6166 94.6601 83.9598V77.7598C94.6601 76.1029 93.3169 74.7598 91.6601 74.7598Z" fill="#C5D0F3"/>
<path d="M81.95 62.9805H46.05C43.2886 62.9805 41.05 65.219 41.05 67.9805V93.7305C41.05 96.4919 43.2886 98.7305 46.05 98.7305H81.95C84.7115 98.7305 86.95 96.4919 86.95 93.7305V67.9805C86.95 65.219 84.7115 62.9805 81.95 62.9805Z" fill="#E2E7F3"/>
<path d="M58.3301 75.7793C58.3301 76.5704 58.0955 77.3438 57.656 78.0016C57.2164 78.6594 56.5917 79.1721 55.8608 79.4748C55.1299 79.7776 54.3256 79.8568 53.5497 79.7024C52.7738 79.5481 52.0611 79.1671 51.5017 78.6077C50.9422 78.0483 50.5613 77.3356 50.4069 76.5597C50.2526 75.7837 50.3318 74.9795 50.6346 74.2486C50.9373 73.5177 51.45 72.8929 52.1078 72.4534C52.7656 72.0139 53.539 71.7793 54.3301 71.7793C55.3869 71.7923 56.3968 72.2179 57.1442 72.9652C57.8915 73.7126 58.3171 74.7225 58.3301 75.7793Z" fill="white"/>
<path d="M77.7601 75.7793C77.7601 76.5683 77.5267 77.3396 77.0893 77.9963C76.652 78.653 76.0302 79.1656 75.3022 79.4698C74.5742 79.774 73.7725 79.856 72.998 79.7057C72.2235 79.5554 71.5107 79.1793 70.9493 78.6249C70.388 78.0705 70.0031 77.3625 69.8432 76.5899C69.6832 75.8173 69.7554 75.0146 70.0505 74.2829C70.3456 73.5512 70.8505 72.9231 71.5016 72.4776C72.1528 72.0321 72.9212 71.7892 73.7101 71.7793C74.7757 71.7792 75.7983 72.199 76.5564 72.9478C77.3145 73.6965 77.747 74.7139 77.7601 75.7793Z" fill="white"/>
<path d="M55.5501 85.6309V91.4809H54.2101C53.4639 91.4372 52.7626 91.11 52.2497 90.5663C51.7368 90.0225 51.4512 89.3033 51.4512 88.5559C51.4512 87.8084 51.7368 87.0892 52.2497 86.5454C52.7626 86.0017 53.4639 85.6745 54.2101 85.6309H55.5501Z" fill="#FFC77C"/>
<path d="M55.55 85.6309H59.78V91.4809H55.55V85.6309Z" fill="#FFAB39"/>
<path d="M59.78 85.6309H64V91.4809H59.78V85.6309Z" fill="#FFC77C"/>
<path d="M64.0001 85.6309H68.2201V91.4809H64.0001V85.6309Z" fill="#FFAB39"/>
<path d="M68.2201 85.6309H72.4501V91.4809H68.2201V85.6309Z" fill="#FFC77C"/>
<path d="M76.7201 88.5609C76.7148 89.3354 76.4041 90.0766 75.8555 90.6233C75.3069 91.1701 74.5646 91.4782 73.7901 91.4809H72.4501V85.6309H73.7901C74.1749 85.6309 74.5559 85.7067 74.9113 85.8539C75.2668 86.0011 75.5898 86.217 75.8619 86.489C76.134 86.7611 76.3498 87.0841 76.497 87.4396C76.6443 87.7951 76.7201 88.1761 76.7201 88.5609Z" fill="#FFAB39"/>
<path d="M50.3901 58.4004H77.6101C78.4058 58.4004 79.1689 58.7165 79.7315 59.2791C80.2941 59.8417 80.6101 60.6047 80.6101 61.4004V63.0004H47.3901V61.4004C47.3901 60.6047 47.7062 59.8417 48.2688 59.2791C48.8314 58.7165 49.5945 58.4004 50.3901 58.4004Z" fill="#C5D0F3"/>
</svg>`;

const BACK_ARROW_SVG = `<svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21.4142 9.70703H1.41422M10.4142 18.707L1.41422 9.70703L10.4142 0.707031" stroke="#DAE2FD" stroke-width="2"/>
</svg>`;

const AI_ICON = require('../assets/ai_assistant_icon.png');
const VIRTUAL_ASSISTANT_LOGO = require('../assets/virtual_assistant_icon.png');
const SEND_SVG_ICON = require('../assets/send_icon_svg.png');

/* ─────────────────────────────────────────────────────────────────
   GROQ CONSTANTS
───────────────────────────────────────────────────────────────── */
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = {
  role: 'system',
  content:
    'You are the official in-app AI Assistant for this Software Update & Device Utility app.\n\n' +
    'STRICT SCOPE BOUNDARIES:\n' +
    '1. You MUST ONLY answer queries related to this application, including:\n' +
    '   - App Update Scanning & Play Store updates.\n' +
    '   - Device Storage info, Large File Cleaner, and App Manager/Uninstaller.\n' +
    '   - Permission Manager (High Risk, Medium Risk permissions).\n' +
    '   - Phone Sensor & Hardware Tests (Display, Speaker, Mic, Motion).\n' +
    '   - App Usage, Data Consumption, and Battery Analytics.\n' +
    '2. If the user asks about ANYTHING OUTSIDE this scope (e.g., cooking, general knowledge, sports, coding, news, weather, general chit-chat), you must politely decline.\n\n' +
    'DYNAMIC LANGUAGE RULE (CRITICAL):\n' +
    '1. ALWAYS detect the language of the user\'s latest message and respond in that EXACT SAME language.\n' +
    '2. If the user asks in Roman Urdu (e.g., \'Storage kaise clean karu?\'), respond in Roman Urdu.\n' +
    '3. If the user asks in Urdu script (e.g., \'اسٹوریج کیسے صاف کریں؟\'), respond in Urdu script.\n' +
    '4. If the user asks in Hindi, English, Arabic, Spanish, etc., mirror their language choice instantly.\n' +
    '5. DO NOT restrict yourself to English only. DO NOT check app settings for language; base the output language purely on the user\'s prompt.',
};


const NETWORK_ERROR_MSG =
  'Unable to reach AI Assistant right now. Please check your network connection.';

/* ─────────────────────────────────────────────────────────────────
   PULSING GREEN DOT (SYSTEMS ONLINE)
───────────────────────────────────────────────────────────────── */
const PulseDot = () => {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.6, duration: 700, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, [scale]);
  return (
    <Animated.View style={[styles.pulseDot, { transform: [{ scale }] }]} />
  );
};

/* ─────────────────────────────────────────────────────────────────
   TYPING BUBBLE
───────────────────────────────────────────────────────────────── */
const TypingBubble = ({ t }) => (
  <View style={styles.messageRowBot}>
    <View style={styles.typingBubble}>
      <ActivityIndicator size="small" color="#60A5FA" />
      <Text style={styles.typingText}>{t('aiIsTyping')}</Text>
    </View>
  </View>
);

/* ─────────────────────────────────────────────────────────────────
   SINGLE MESSAGE BUBBLE
───────────────────────────────────────────────────────────────── */
const MessageBubble = ({ item }) => {
  const isUser = item.sender === 'user';
  return (
    <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowBot]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
        <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextBot]}>
          {item.text}
        </Text>
      </View>
    </View>
  );
};

/* ─────────────────────────────────────────────────────────────────
   HERO SECTION (shown above the chat list as ListHeaderComponent)
───────────────────────────────────────────────────────────────── */
const HeroHeader = ({ t }) => (
  <View style={styles.heroSection}>
    {/* ── Virtual Assistant Logo ── */}
    <View style={{ marginBottom: 16 }}>
      <SvgXml xml={MAIN_AI_LOGO_SVG} width={110} height={110} />
    </View>

    {/* ── SYSTEMS ONLINE ── */}
    <View style={styles.statusRow}>
      <PulseDot />
      <Text style={styles.statusText}>{t('systemsOnline')}</Text>
    </View>
  </View>
);

/* ─────────────────────────────────────────────────────────────────
   MAIN SCREEN
───────────────────────────────────────────────────────────────── */
const AIAssistantScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const INITIAL_MESSAGE = {
    id: 'init-1',
    text: t('aiWelcomeMessage'),
    sender: 'assistant',
  };
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const flatListRef = useRef(null);

  const buildHistory = useCallback(
    (msgs) =>
      msgs
        .filter((m) => m.sender !== 'error')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        })),
    [],
  );

  const scrollToBottom = () =>
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;

    const userMsg = { id: `u-${Date.now()}`, text: trimmed, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    scrollToBottom();

    try {
      if (!GROQ_API_KEY || GROQ_API_KEY.includes('REPLACE')) {
        throw new Error('API key not configured');
      }

      const res = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [SYSTEM_PROMPT, ...buildHistory([...messages, userMsg])],
          max_tokens: 200,
          temperature: 0.6,
          stream: false,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error('Empty response');

      setMessages((prev) => [
        ...prev,
        { id: `b-${Date.now()}`, text: content, sender: 'assistant' },
      ]);
    } catch (err) {
      console.warn('[AIAssistant]', err.message);
      setMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, text: NETWORK_ERROR_MSG, sender: 'assistant' },
      ]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const renderItem = ({ item }) => <MessageBubble item={item} />;
  const keyExtractor = (item) => item.id;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <SvgXml xml={BACK_ARROW_SVG} width={15} height={15} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('aiAssistantTitle')}</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={10}
      >
        {/* ── Chat list ── */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
          ListHeaderComponent={<HeroHeader t={t} />}
          ListFooterComponent={isLoading ? <TypingBubble t={t} /> : null}
        />

        {/* ── Input bar ── */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder={t('typeHere')}
            placeholderTextColor="#64748B"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline={false}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!inputText.trim() || isLoading) && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            activeOpacity={0.8}
            disabled={!inputText.trim() || isLoading}
          >
            <SvgXml xml={SEND_BUTTON_SVG} width={42} height={42} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/* ─────────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1120',
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0B1120',
  },
  backBtn: { padding: 6, marginRight: 10, marginTop: 2 },
  backArrow: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
  headerTitle: { color: '#DAE2FD', fontSize: 16, fontWeight: '500' },

  /* Hero section */
  heroSection: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 20,
  },

  /* Virtual assistant logo */
  logoBotPlaceholder: {
    width: 110,
    height: 110,
    marginBottom: 16,
  },

  /* SYSTEMS ONLINE */
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  statusText: {
    color: '#22C55E',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },

  /* List */
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  /* Message rows */
  messageRow: { marginBottom: 10 },
  messageRowUser: { alignItems: 'flex-end' },
  messageRowBot: { alignItems: 'flex-start', marginBottom: 10 },

  bubble: {
    maxWidth: '88%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: '#131C31',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  bubbleTextUser: { color: '#FFFFFF' },
  bubbleTextBot: { color: '#CBD5E1' },

  /* Typing bubble */
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131C31',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  typingText: { color: '#64748B', fontSize: 13 },

  /* Input bar */
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0B1120',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  textInput: {
    flex: 1,
    height: 46,
    backgroundColor: '#131C31',
    borderRadius: 24,
    paddingHorizontal: 18,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginRight: 10,
  },

  /* Send button wrapper */
  sendBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },

  /* Send placeholder — Figma spec: 37.85×37.85, radius 12.62, padding 8.41 */
  sendIconPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#3B82F6',
    padding: 8,
  },
});

export default AIAssistantScreen;

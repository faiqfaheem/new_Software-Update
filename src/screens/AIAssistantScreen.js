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
import { GROQ_API_KEY } from '../config/env';

const AI_ICON = require('../assets/ai_assistant_icon.png');

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
const TypingBubble = () => (
  <View style={styles.messageRowBot}>
    <View style={styles.typingBubble}>
      <ActivityIndicator size="small" color="#60A5FA" />
      <Text style={styles.typingText}>AI is typing…</Text>
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
const HeroHeader = () => (
  <View style={styles.heroSection}>
    {/* ── AI Assistant Icon ── */}
    <Image source={AI_ICON} style={styles.logoBotPlaceholder} resizeMode="contain" />

    {/* ── SYSTEMS ONLINE ── */}
    <View style={styles.statusRow}>
      <PulseDot />
      <Text style={styles.statusText}>SYSTEMS ONLINE</Text>
    </View>
  </View>
);

/* ─────────────────────────────────────────────────────────────────
   MAIN SCREEN
───────────────────────────────────────────────────────────────── */
const INITIAL_MESSAGE = {
  id: 'init-1',
  text: "Hi, I'm your Software Update assistant. I can help you with app features, device optimization, and software-related questions.",
  sender: 'assistant',
};

const AIAssistantScreen = ({ navigation }) => {
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
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Assistant</Text>
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
          ListHeaderComponent={<HeroHeader />}
          ListFooterComponent={isLoading ? <TypingBubble /> : null}
        />

        {/* ── Input bar ── */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Type here..."
            placeholderTextColor="#64748B"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline={false}
            editable={!isLoading}
          />

          {/* 46×46 blue send button — white 24×24 placeholder inside */}
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!inputText.trim() || isLoading) && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            activeOpacity={0.8}
            disabled={!inputText.trim() || isLoading}
          >
            <View style={styles.sendIconPlaceholder} />
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
  backBtn: { padding: 6, marginRight: 10 },
  backArrow: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },

  /* Hero section */
  heroSection: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 20,
  },

  /* 96×96 white logo placeholder — replace View with <Image> when asset ready */
  logoBotPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
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

  /* 46×46 blue circle send button */
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#1E3A8A',
    opacity: 0.55,
  },

  /* 24×24 white send-icon placeholder — replace with <Image> when asset ready */
  sendIconPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});

export default AIAssistantScreen;

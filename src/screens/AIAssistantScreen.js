import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';

/* ─────────────── PLACEHOLDER COMPONENTS ─────────────── */

// AI Bot hero image placeholder — 96×96 white block, exact position from design
const AiBotPlaceholder = () => (
  <View style={styles.botImgPlaceholder} />
);

/* ─────────────── QUICK-ACTION CHIP ─────────────── */
const QuickChip = ({ label, onPress }) => (
  <TouchableOpacity style={styles.chip} onPress={onPress} activeOpacity={0.7}>
    <Text style={styles.chipText}>{label}</Text>
  </TouchableOpacity>
);

/* ─────────────── CHAT BUBBLE ─────────────── */
const ChatBubble = ({ message, isBot }) => (
  <View style={[styles.bubbleWrap, isBot ? styles.bubbleBot : styles.bubbleUser]}>
    <Text style={[styles.bubbleText, !isBot && styles.bubbleTextUser]}>{message}</Text>
  </View>
);

/* ─────────────── PULSE DOT ─────────────── */
const PulseDot = () => {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.5, duration: 700, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [scale]);
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', marginRight: 6 }}>
      <Animated.View style={[styles.pulseDot, { transform: [{ scale }] }]} />
    </View>
  );
};

/* ─────────────── SCREEN ─────────────── */
const INITIAL_BOT_MESSAGE =
  "Hi, I'm your Software Update assistant. I can help you with app features, device optimization, and software-related questions.";

const QUICK_CHIPS = [
  'Update History',
  'App Usage',
  'Scan',
  'Test Phone',
  'Data Manager',
  'Permissions',
];

const BOT_RESPONSES = {
  'update history': "Your device has received 3 system updates in the last 30 days. The latest update was on August 1st, 2026. All updates were successfully installed.",
  'app usage': "I can help analyze your app usage patterns. Go to Scan Apps → Installed Apps to see detailed usage statistics for each app on your device.",
  'scan': "To scan your apps, tap the 'Scan Apps' card on the Home screen. The scanner checks for available updates, system app health, and app permissions.",
  'test phone': "Phone hardware testing is available under the Tools tab. You can test: Speaker, Microphone, Vibration, Flashlight, Display, WiFi, and more.",
  'data manager': "Data Manager is available under Tools. It shows Storage Info, helping you identify large files and apps consuming the most space.",
  'permissions': "Permission Manager is available under Tools. It shows which apps have access to your Camera, Microphone, Location, Storage, and more.",
};

const getResponse = (input) => {
  const lower = input.toLowerCase().trim();
  for (const [key, val] of Object.entries(BOT_RESPONSES)) {
    if (lower.includes(key)) return val;
  }
  if (lower.includes('hello') || lower.includes('hi')) return "Hello! How can I assist you today? You can ask me about app updates, device testing, storage, or permissions.";
  if (lower.includes('update')) return "I can help with updates! Tap 'Scan Apps' on the Home screen to check for available app updates. For OS updates, check the OS Update section.";
  if (lower.includes('storage') || lower.includes('space')) return "To check your storage, go to Tools → Storage Info. I can also help you identify apps taking up the most space.";
  if (lower.includes('battery')) return "For battery optimization, try uninstalling unused apps via Bulk Uninstaller, and restrict background app permissions using Permission Manager.";
  return "I'm here to help! You can ask me about app scanning, device testing, storage management, permissions, or software updates. What would you like to know?";
};

const AIAssistantScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    { id: '1', text: INITIAL_BOT_MESSAGE, isBot: true },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef(null);

  const sendMessage = (text) => {
    const userText = text || inputText.trim();
    if (!userText) return;

    const userMsg = { id: Date.now().toString(), text: userText, isBot: false };
    const botMsg = {
      id: (Date.now() + 1).toString(),
      text: getResponse(userText),
      isBot: true,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInputText('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Assistant</Text>
        {/* 48×48 placeholder for potential settings/info icon */}
        <View style={styles.headerIconPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Bot icon + Status ── */}
          <View style={styles.heroSection}>
            {/* 96×96 AI hero image placeholder — replace with <Image> when asset is ready */}
            <AiBotPlaceholder />

            <View style={styles.statusRow}>
              <PulseDot />
              <Text style={styles.statusText}>SYSTEMS ONLINE</Text>
            </View>
          </View>

          {/* ── Messages ── */}
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg.text} isBot={msg.isBot} />
          ))}

        </ScrollView>

        {/* ── Input Bar ── */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Type here..."
            placeholderTextColor="#64748B"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => sendMessage()}
            returnKeyType="send"
            multiline={false}
          />
          {/* Send button — 44×44 icon placeholder, exact position from design */}
          <TouchableOpacity style={styles.sendBtn} onPress={() => sendMessage()} activeOpacity={0.85}>
            {/* Replace inner View with <Image> when send-icon asset is ready */}
            <View style={styles.sendIconPlaceholder} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/* ─────────────── STYLES ─────────────── */
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
  backBtn: {
    padding: 6,
    marginRight: 10,
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerIconPlaceholder: {
    // 28×28 top-right settings/info icon placeholder
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#2563EB',
  },

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  /* Hero section */
  heroSection: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  botIconContainer: {
    marginBottom: 16,
  },

  /* ── Bot icon placeholder ── */
  botIconWrapper: {
    alignItems: 'center',
  },
  botHead: {
    width: 72,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  /* AI Bot hero image placeholder — 96×96 white block, exact position from design */
  botImgPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },

  /* Status row */
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  statusText: {
    color: '#22C55E',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },

  /* Chat bubbles */
  bubbleWrap: {
    maxWidth: '90%',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
  },
  bubbleBot: {
    alignSelf: 'flex-start',
    backgroundColor: '#131C31',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563EB',
  },
  bubbleText: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextUser: {
    color: '#FFFFFF',
  },

  /* Quick actions card */
  quickCard: {
    backgroundColor: '#131C31',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 16,
    marginVertical: 8,
  },
  quickCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sparkleIconPlaceholder: {
    // 20×20 sparkle icon placeholder
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#1E3A8A',
    borderWidth: 1,
    borderColor: '#3B82F6',
    marginRight: 8,
  },
  quickCardTitle: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2563EB',
    backgroundColor: '#0F1E3D',
    marginBottom: 4,
  },
  chipText: {
    color: '#93C5FD',
    fontSize: 13,
    fontWeight: '500',
  },

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
  sendBtn: {
    // 44×44 send button placeholder exact position
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  /* Send button icon placeholder — 24×24 white block inside 44×44 circle, exact position */
  sendIconPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});

export default AIAssistantScreen;

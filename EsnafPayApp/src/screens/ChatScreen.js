import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { messageApi } from '../api/client';

function getInitials(name = '') {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function formatDay(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const diff = Math.floor((today - d) / 86400000);
  if (diff === 0) return 'Bugün';
  if (diff === 1) return 'Dün';
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
}

export default function ChatScreen({ navigation, route }) {
  const { conversation } = route.params;
  // conversation: { customerId, esnafId, musteriUserId, customerName, esnafName, ... }
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const isEsnaf = user?.role === 'esnaf';
  const otherName = isEsnaf
    ? (conversation.customerName || 'Müşteri')
    : (conversation.esnafName || 'Esnaf');

  const fetchMessages = useCallback(async () => {
    try {
      const res = await messageApi.getMessages(conversation.customerId);
      setMessages(res.data);
    } catch {
      // sessiz
    } finally {
      setLoading(false);
    }
  }, [conversation.customerId]);

  useFocusEffect(useCallback(() => {
    fetchMessages();
    // 5 saniyede bir otomatik yenile
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]));

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await messageApi.send({
        customerId: conversation.customerId,
        esnafId: conversation.esnafId,
        musteriUserId: conversation.musteriUserId,
        text: text.trim(),
      });
      setText('');
      await fetchMessages();
    } catch {
      // sessiz
    } finally {
      setSending(false);
    }
  };

  // Mesajları güne göre grupla
  const grouped = [];
  let lastDay = '';
  for (const msg of messages) {
    const day = formatDay(msg.createdAt);
    if (day !== lastDay) {
      grouped.push({ type: 'day', label: day });
      lastDay = day;
    }
    grouped.push({ type: 'msg', ...msg });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={[styles.headerAvatar, { backgroundColor: isEsnaf ? colors.tealLight : colors.orangeLight }]}>
              <Text style={[styles.headerAvatarText, { color: isEsnaf ? colors.teal : colors.orange }]}>
                {getInitials(otherName)}
              </Text>
            </View>
            <View>
              <Text style={styles.headerName}>{otherName}</Text>
              <Text style={styles.headerOnline}>● Aktif</Text>
            </View>
          </View>
          <View style={{ width: 34 }} />
        </View>

        {/* Borç özet kartı */}
        {conversation.totalDebt !== undefined && (
          <View style={styles.debtCard}>
            <Text style={styles.debtLabel}>Mevcut Borç</Text>
            <Text style={styles.debtAmount}>₺{(conversation.totalDebt || 0).toLocaleString('tr-TR')}</Text>
          </View>
        )}

        {/* Mesajlar */}
        {loading ? (
          <ActivityIndicator color={colors.orange} style={{ marginTop: 40 }} />
        ) : (
          <ScrollView
            ref={scrollRef}
            style={styles.msgList}
            contentContainerStyle={styles.msgContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {grouped.length === 0 && (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyIcon}>👋</Text>
                <Text style={styles.emptyText}>Konuşmaya başla</Text>
              </View>
            )}
            {grouped.map((item, idx) => {
              if (item.type === 'day') {
                return (
                  <Text key={idx} style={styles.dayLabel}>{item.label}</Text>
                );
              }
              const isMine = String(item.senderId) === String(user?._id || user?.id);
              return (
                <View key={item._id} style={[styles.bubbleWrap, isMine ? styles.bubbleWrapMe : styles.bubbleWrapOther]}>
                  <View style={[styles.bubble, isMine ? styles.bubbleMe : styles.bubbleOther]}>
                    <Text style={[styles.bubbleText, isMine ? styles.bubbleTextMe : styles.bubbleTextOther]}>
                      {item.text}
                    </Text>
                    <Text style={[styles.bubbleTime, isMine ? { color: 'rgba(255,255,255,0.7)' } : { color: colors.muted }]}>
                      {formatTime(item.createdAt)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Mesaj giriş alanı */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Mesaj yaz..."
            placeholderTextColor={colors.muted}
            value={text}
            onChangeText={setText}
            multiline
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sending) && { opacity: 0.5 }]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
          >
            {sending
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.sendIcon}>➤</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 12,
    backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { width: 34 },
  backText: { fontSize: 20, color: colors.ink },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  headerAvatarText: { fontFamily: 'Nunito_800ExtraBold', fontSize: 13 },
  headerName: { fontFamily: 'Nunito_800ExtraBold', fontSize: 15, color: colors.ink },
  headerOnline: { fontSize: 11, color: colors.green, fontFamily: 'PlusJakartaSans_600SemiBold' },
  debtCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.card, marginHorizontal: 16, marginTop: 10,
    borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border,
  },
  debtLabel: { fontSize: 12, color: colors.muted, fontFamily: 'PlusJakartaSans_600SemiBold' },
  debtAmount: { fontFamily: 'Nunito_900Black', fontSize: 18, color: colors.orange },
  msgList: { flex: 1 },
  msgContent: { padding: 16, paddingBottom: 8 },
  emptyWrap: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 14, color: colors.muted, fontFamily: 'PlusJakartaSans_400Regular' },
  dayLabel: {
    textAlign: 'center', fontSize: 11, color: colors.muted,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginVertical: 12,
  },
  bubbleWrap: { marginBottom: 6 },
  bubbleWrapMe: { alignItems: 'flex-end' },
  bubbleWrapOther: { alignItems: 'flex-start' },
  bubble: { maxWidth: '78%', padding: 10, borderRadius: 18 },
  bubbleMe: { backgroundColor: colors.orange, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: colors.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextMe: { color: '#fff', fontFamily: 'PlusJakartaSans_400Regular' },
  bubbleTextOther: { color: colors.ink, fontFamily: 'PlusJakartaSans_400Regular' },
  bubbleTime: { fontSize: 10, marginTop: 3, textAlign: 'right' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    padding: 12, backgroundColor: colors.card,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  input: {
    flex: 1, backgroundColor: colors.bg, borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 14, color: colors.ink,
    fontFamily: 'PlusJakartaSans_400Regular',
    maxHeight: 100,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.orange,
    alignItems: 'center', justifyContent: 'center',
  },
  sendIcon: { fontSize: 16, color: '#fff' },
});

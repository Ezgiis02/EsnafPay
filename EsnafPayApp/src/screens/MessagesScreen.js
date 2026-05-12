import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput,
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

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 1) return 'Az önce';
  if (diff < 60) return `${diff} dk`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h} sa`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Dün';
  return `${d} gün`;
}

const AVATAR_COLORS = [
  { bg: colors.orangeLight, text: colors.orange },
  { bg: colors.tealLight, text: colors.teal },
  { bg: colors.redLight, text: colors.red },
  { bg: colors.greenLight, text: colors.green },
];

export default function MessagesScreen({ navigation }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await messageApi.getConversations();
      setConversations(res.data);
    } catch {
      // sessiz
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchConversations(); }, [fetchConversations]));

  const filtered = conversations.filter(c => {
    const name = user?.role === 'esnaf'
      ? (c.customerName || '')
      : (c.esnafName || '');
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const openChat = (conv) => {
    navigation.navigate('Chat', { conversation: conv });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mesajlar</Text>
        <View style={{ width: 34 }} />
      </View>

      {/* Arama */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍  Konuşma ara..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={colors.orange} style={{ marginTop: 60 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>Henüz mesaj yok</Text>
            <Text style={styles.emptySub}>
              {user?.role === 'esnaf'
                ? 'Henüz müşteri eklemediniz.'
                : 'Bir esnaf seni sisteme eklediğinde burada görünür.'}
            </Text>
          </View>
        ) : (
          <View style={styles.listSection}>
            {filtered.map((conv, i) => {
              const clr = AVATAR_COLORS[i % AVATAR_COLORS.length];
              const name = user?.role === 'esnaf'
                ? (conv.customerName || 'Müşteri')
                : (conv.esnafName || 'Esnaf');
              return (
                <TouchableOpacity
                  key={i}
                  style={styles.convItem}
                  onPress={() => openChat(conv)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.avatar, { backgroundColor: clr.bg }]}>
                    <Text style={[styles.avatarText, { color: clr.text }]}>{getInitials(name)}</Text>
                  </View>
                  <View style={styles.convInfo}>
                    <View style={styles.convTop}>
                      <Text style={styles.convName}>{name}</Text>
                      <Text style={styles.convTime}>{timeAgo(conv.lastTime)}</Text>
                    </View>
                    <Text style={styles.convLast} numberOfLines={1}>
                      {conv.lastMessage || '...'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 14,
    backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { width: 34 },
  backText: { fontSize: 20, color: colors.ink },
  headerTitle: { fontFamily: 'Nunito_900Black', fontSize: 17, color: colors.ink },
  searchWrap: { padding: 12, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  searchInput: {
    backgroundColor: colors.bg, borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 14,
    fontSize: 13, color: colors.ink,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  emptyWrap: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 14 },
  emptyTitle: { fontFamily: 'Nunito_800ExtraBold', fontSize: 17, color: colors.ink, marginBottom: 8 },
  emptySub: {
    fontSize: 13, color: colors.muted,
    fontFamily: 'PlusJakartaSans_400Regular',
    textAlign: 'center', lineHeight: 20, paddingHorizontal: 32,
  },
  listSection: { backgroundColor: colors.card, marginTop: 8, borderRadius: 16, marginHorizontal: 16, overflow: 'hidden' },
  convItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Nunito_800ExtraBold', fontSize: 16 },
  convInfo: { flex: 1 },
  convTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  convName: { fontFamily: 'Nunito_800ExtraBold', fontSize: 14, color: colors.ink },
  convTime: { fontSize: 11, color: colors.muted, fontFamily: 'PlusJakartaSans_400Regular' },
  convLast: { fontSize: 12, color: colors.muted, fontFamily: 'PlusJakartaSans_400Regular' },
});

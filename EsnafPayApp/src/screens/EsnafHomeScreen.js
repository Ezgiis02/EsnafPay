import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { customerApi, messageApi, installmentApi } from '../api/client';

// 2 harfli baş harf + renk paleti
const AVATAR_COLORS = [
  { bg: '#FEF0F0', fg: '#E84040' },
  { bg: '#FEF7E8', fg: '#F5A623' },
  { bg: '#E6F9F7', fg: '#00B4A0' },
  { bg: '#E8FAF2', fg: '#1AAD72' },
  { bg: '#FFF0EB', fg: '#FF6B35' },
  { bg: '#EEF0FF', fg: '#5A67F2' },
];

function getInitials(name = '') {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function getAvatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function getBadge(debt) {
  if (debt === 0) return { label: 'Temiz', bg: '#E8FAF2', fg: '#1AAD72' };
  if (debt > 1000) return { label: 'Gecikmiş', bg: '#FEF0F0', fg: '#E84040' };
  return { label: 'Aktif', bg: '#FFF0EB', fg: '#FF6B35' };
}

function thisWeekCount(customers) {
  const now = new Date();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  return customers.filter((c) => new Date(c.createdAt) >= weekAgo).length;
}

export default function EsnafHomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dueTomorrow, setDueTomorrow] = useState([]);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await customerApi.getAll();
      setCustomers(res.data);
    } catch {
      // hata sessizce geçilir
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await messageApi.getUnreadCount();
      setUnreadCount(res.data.count || 0);
    } catch { /* sessiz */ }
  }, []);

  const fetchDueTomorrow = useCallback(async () => {
    try {
      const res = await installmentApi.getDueTomorrow();
      setDueTomorrow(res.data);
    } catch { /* sessiz */ }
  }, []);

  useFocusEffect(useCallback(() => {
    fetchCustomers();
    fetchUnread();
    fetchDueTomorrow();
  }, [fetchCustomers, fetchUnread, fetchDueTomorrow]));

  const onRefresh = () => { setRefreshing(true); fetchCustomers(); };

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  const totalDebt = customers.reduce((s, c) => s + (c.totalDebt || 0), 0);

  const formatDate = (d) => {
    if (!d) return '—';
    const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
    if (diff === 0) return 'Bugün';
    if (diff === 1) return '1 gün önce';
    if (diff < 7) return `${diff} gün önce`;
    if (diff < 14) return '1 hafta önce';
    return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        {/* Gradient Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Günaydın 👋</Text>
              <Text style={styles.userName}>{user?.name || 'Esnaf'}</Text>
              {user?.shopName ? (
                <Text style={styles.shopName}>🏪 {user.shopName}</Text>
              ) : null}
            </View>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <TouchableOpacity
                style={styles.bellBtn}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Text style={styles.bellIcon}>🔔</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowLogoutModal(true)} style={styles.logoutBtn}>
                <Text style={styles.logoutText}>Çıkış</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={styles.statVal}>{customers.length}</Text>
              <Text style={styles.statLbl}>Müşteri</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statVal}>₺{totalDebt.toLocaleString('tr-TR')}</Text>
              <Text style={styles.statLbl}>Açık Borç</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statVal}>{thisWeekCount(customers)}</Text>
              <Text style={styles.statLbl}>Bu Hafta</Text>
            </View>
          </View>
        </View>

        {/* Yarınki taksit uyarısı */}
        {dueTomorrow.length > 0 && (
          <View style={styles.reminderCard}>
            <Text style={styles.reminderIcon}>🔔</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.reminderTitle}>Yarın Vadesi Dolan Taksitler</Text>
              {dueTomorrow.map((inst, i) => (
                <Text key={i} style={styles.reminderText}>
                  • {inst.customerName} — ₺{inst.amount.toLocaleString('tr-TR')}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Arama */}
        <View style={styles.searchWrap}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍  Müşteri ara..."
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Yeni Müşteri Ekle */}
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('AddCustomer', { onAdded: fetchCustomers })}
        >
          <Text style={styles.addBtnText}>＋  Yeni Müşteri Ekle</Text>
        </TouchableOpacity>

        {/* Liste */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>MÜŞTERİLER</Text>

          {loading ? (
            <ActivityIndicator color={colors.orange} style={{ marginVertical: 32 }} />
          ) : filtered.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>🏪</Text>
              <Text style={styles.emptyTitle}>
                {search ? 'Sonuç bulunamadı' : 'Henüz müşteri yok'}
              </Text>
              <Text style={styles.emptySub}>
                {search
                  ? 'Farklı bir isim veya telefon deneyin.'
                  : '"Yeni Müşteri Ekle" butonuyla ilk müşterini ekleyebilirsin.'}
              </Text>
            </View>
          ) : (
            filtered.map((c) => {
              const initials = getInitials(c.name);
              const ac = getAvatarColor(c.name);
              const badge = getBadge(c.totalDebt || 0);
              return (
                <TouchableOpacity
                  key={c._id}
                  style={styles.customerCard}
                  activeOpacity={0.75}
                  onPress={() => navigation.navigate('CustomerDetail', { customer: c })}
                >
                  <View style={[styles.avatar, { backgroundColor: ac.bg }]}>
                    <Text style={[styles.avatarText, { color: ac.fg }]}>{initials}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{c.name}</Text>
                    <Text style={styles.cardSub}>Son: {formatDate(c.lastTransactionDate)}</Text>
                  </View>
                  <View style={styles.cardRight}>
                    <Text style={[styles.cardDebt, { color: badge.fg }]}>
                      ₺{(c.totalDebt || 0).toLocaleString('tr-TR')}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.badgeText, { color: badge.fg }]}>{badge.label}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <View style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={[styles.navLabel, { color: colors.orange }]}>Ana Sayfa</Text>
        </View>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navLabel}>Borçlar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Messages')}>
          <View style={{ position: 'relative' }}>
            <Text style={styles.navIcon}>💬</Text>
            {unreadCount > 0 && (
              <View style={styles.navBadge}>
                <Text style={styles.navBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.navLabel}>Mesajlar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profil</Text>
        </TouchableOpacity>
      </View>

      {/* Çıkış Onay Modal */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Text style={styles.modalIcon}>👋</Text>
            </View>
            <Text style={styles.modalTitle}>Çıkış Yap</Text>
            <Text style={styles.modalDesc}>Hesabından çıkmak istediğine emin misin?</Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowLogoutModal(false)}>
                <Text style={styles.modalBtnCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnLogout} onPress={logout}>
                <Text style={styles.modalBtnLogoutText}>Çıkış Yap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    background: 'linear-gradient(135deg, #FF6B35, #FF8C55)',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 22,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontFamily: 'PlusJakartaSans_600SemiBold' },
  userName: { fontSize: 22, fontFamily: 'Nunito_900Black', color: '#fff', marginTop: 2 },
  shopName: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'PlusJakartaSans_600SemiBold', marginTop: 2 },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
  },
  logoutText: { color: '#fff', fontFamily: 'Nunito_700Bold', fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 10 },
  bellBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  bellIcon: { fontSize: 18 },
  statChip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  statVal: { fontFamily: 'Nunito_900Black', fontSize: 18, color: '#fff' },
  statLbl: { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontFamily: 'PlusJakartaSans_600SemiBold', marginTop: 1 },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginHorizontal: 18,
    marginTop: 12,
    backgroundColor: '#FFF8E1',
    borderWidth: 1.5,
    borderColor: '#F5A623',
    borderRadius: 14,
    padding: 12,
  },
  reminderIcon: { fontSize: 20, marginTop: 1 },
  reminderTitle: { fontFamily: 'Nunito_800ExtraBold', fontSize: 13, color: '#B8860B', marginBottom: 4 },
  reminderText: { fontSize: 13, color: colors.ink, fontFamily: 'PlusJakartaSans_600SemiBold', lineHeight: 20 },
  searchWrap: { marginHorizontal: 18, marginTop: 12 },
  searchInput: {
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,
    fontSize: 13,
    color: colors.ink,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  addBtn: {
    marginHorizontal: 18,
    marginTop: 10,
    backgroundColor: colors.ink,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontFamily: 'Nunito_800ExtraBold', fontSize: 14 },
  listSection: {
    marginHorizontal: 18,
    marginTop: 12,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.muted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  emptyWrap: { alignItems: 'center', paddingVertical: 32 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontFamily: 'Nunito_800ExtraBold', fontSize: 15, color: colors.ink, marginBottom: 6 },
  emptySub: {
    fontSize: 13, color: colors.muted, fontFamily: 'PlusJakartaSans_400Regular',
    textAlign: 'center', lineHeight: 20, paddingHorizontal: 20,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: 'Nunito_800ExtraBold', fontSize: 14 },
  cardInfo: { flex: 1 },
  cardName: { fontFamily: 'Nunito_800ExtraBold', fontSize: 14, color: colors.ink },
  cardSub: { fontSize: 12, color: colors.muted, fontFamily: 'PlusJakartaSans_400Regular', marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  cardDebt: { fontFamily: 'Nunito_800ExtraBold', fontSize: 14 },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 100 },
  badgeText: { fontSize: 11, fontFamily: 'Nunito_700Bold' },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  navItem: { alignItems: 'center', gap: 3 },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 10, fontFamily: 'Nunito_700Bold', color: colors.muted },
  navBadge: {
    position: 'absolute', top: -4, right: -8,
    backgroundColor: colors.orange,
    borderRadius: 8, minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  navBadgeText: { color: '#fff', fontSize: 9, fontFamily: 'Nunito_800ExtraBold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.orangeLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  modalIcon: { fontSize: 28 },
  modalTitle: { fontFamily: 'Nunito_900Black', fontSize: 20, color: colors.ink, marginBottom: 10 },
  modalDesc: {
    fontSize: 14, color: colors.muted,
    fontFamily: 'PlusJakartaSans_400Regular',
    textAlign: 'center', lineHeight: 22, marginBottom: 24,
  },
  modalBtnRow: { flexDirection: 'row', gap: 12, width: '100%' },
  modalBtnCancel: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: colors.border, alignItems: 'center',
  },
  modalBtnCancelText: { fontFamily: 'Nunito_800ExtraBold', fontSize: 15, color: colors.ink },
  modalBtnLogout: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: colors.orange, alignItems: 'center',
  },
  modalBtnLogoutText: { fontFamily: 'Nunito_800ExtraBold', fontSize: 15, color: '#fff' },
});

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { musteriApi, messageApi, installmentApi, notificationApi } from '../api/client';

function getInitials(name = '') {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function getDaysLeft(dateStr) {
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `${Math.abs(diff)} gün geçti`;
  if (diff === 0) return 'Bugün';
  return `${diff} gün kaldı`;
}

const NOTIF_STATUS = {
  bekliyor:   { icon: '⏳', label: 'Bekliyor',   bg: colors.yellowLight, color: colors.yellow },
  onaylandi:  { icon: '✅', label: 'Onaylandı',  bg: colors.greenLight,  color: colors.green },
  reddedildi: { icon: '❌', label: 'Reddedildi', bg: colors.redLight,    color: colors.red },
};

const AVATAR_COLORS = [
  { bg: colors.orangeLight, text: colors.orange },
  { bg: colors.tealLight, text: colors.teal },
  { bg: colors.redLight, text: colors.red },
  { bg: colors.greenLight, text: colors.green },
  { bg: colors.yellowLight, text: colors.yellow },
];

export default function MusteriHomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState([]);  // [{ customer, esnaf, debts, nextInstallment }]
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dueTomorrow, setDueTomorrow] = useState([]);
  const [myNotifs, setMyNotifs] = useState([]);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await musteriApi.getMyProfile();
      setProfile(res.data);
    } catch {
      // sessiz hata
    } finally {
      setLoading(false);
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

  const fetchMyNotifs = useCallback(async () => {
    try {
      const res = await notificationApi.getMy();
      setMyNotifs(res.data.slice(0, 3));
    } catch { /* sessiz */ }
  }, []);

  useFocusEffect(useCallback(() => {
    fetchProfile();
    fetchUnread();
    fetchDueTomorrow();
    fetchMyNotifs();
  }, [fetchProfile, fetchUnread, fetchDueTomorrow, fetchMyNotifs]));

  const totalDebt = profile.reduce((sum, p) => sum + (p.customer.totalDebt || 0), 0);
  const esnafCount = profile.length;

  // En yakın yaklaşan taksit
  const approaching = profile
    .filter(p => p.nextInstallment)
    .map(p => ({ ...p.nextInstallment, esnafName: p.esnaf?.shopName || p.esnaf?.name || 'Esnaf' }))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

  const approachingCount = profile.filter(p => p.nextInstallment).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Teal Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Günaydın 👋</Text>
              <Text style={styles.userName}>{user?.name || 'Müşteri'}</Text>
            </View>
            <TouchableOpacity onPress={() => setShowLogoutModal(true)} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Çıkış</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={styles.statVal}>₺{totalDebt.toLocaleString('tr-TR')}</Text>
              <Text style={styles.statLbl}>Toplam Borcum</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statVal}>{esnafCount}</Text>
              <Text style={styles.statLbl}>Esnaf</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statVal}>{approachingCount}</Text>
              <Text style={styles.statLbl}>Yaklaşan</Text>
            </View>
          </View>
        </View>

        {/* Yarın vadeli taksit uyarısı */}
        {dueTomorrow.length > 0 && (
          <View style={[styles.warningCard, styles.warningCardRed]}>
            <Text style={styles.warningIcon}>🔔</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.warningTitle, { color: colors.red }]}>Yarın Ödeme Günün!</Text>
              {dueTomorrow.map((inst, i) => (
                <Text key={i} style={styles.warningText}>
                  {inst.esnafName} — ₺{inst.amount?.toLocaleString('tr-TR')}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Yaklaşan ödeme uyarısı */}
        {approaching && dueTomorrow.length === 0 && (
          <View style={styles.warningCard}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.warningTitle}>Yaklaşan Ödeme</Text>
              <Text style={styles.warningText}>
                {approaching.esnafName} — ₺{approaching.amount?.toLocaleString('tr-TR')} · {getDaysLeft(approaching.dueDate)}
              </Text>
            </View>
          </View>
        )}

        {/* Son Bildirimlerim */}
        {myNotifs.length > 0 && (
          <View style={styles.listSection}>
            <Text style={styles.sectionTitle}>SON BİLDİRİMLERİM</Text>
            {myNotifs.map((n) => {
              const cfg = NOTIF_STATUS[n.status] || NOTIF_STATUS.bekliyor;
              return (
                <View key={n._id} style={styles.notifRow}>
                  <View style={[styles.notifIcon, { backgroundColor: cfg.bg }]}>
                    <Text style={{ fontSize: 14 }}>{cfg.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notifName}>{n.esnafName}</Text>
                    <Text style={styles.notifSub}>₺{n.amount.toLocaleString('tr-TR')} · {new Date(n.createdAt).toLocaleDateString('tr-TR')}</Text>
                  </View>
                  <View style={[styles.notifBadge, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.notifBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Esnaf Listesi */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>ESNAFLARIM</Text>

          {loading ? (
            <ActivityIndicator color={colors.teal} style={{ marginVertical: 32 }} />
          ) : profile.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>🧑‍💼</Text>
              <Text style={styles.emptyTitle}>Henüz borç kaydı yok</Text>
              <Text style={styles.emptySub}>
                Bir esnaf seni sisteme eklediğinde borç bilgilerin burada görünür.
              </Text>
            </View>
          ) : (
            profile.map((p, i) => {
              const clr = AVATAR_COLORS[i % AVATAR_COLORS.length];
              const esnafName = p.esnaf?.shopName || p.esnaf?.name || 'Esnaf';
              const debt = p.customer.totalDebt || 0;
              const activeDebts = p.debts.filter(d => d.status !== 'odendi').length;
              const hasTaksit = p.debts.some(d => d.type === 'taksit' && d.status !== 'odendi');

              return (
                <TouchableOpacity
                  key={p.customer._id}
                  style={styles.listItem}
                  onPress={() => navigation.navigate('SendNotification', { profile: p })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.avatar, { backgroundColor: clr.bg }]}>
                    <Text style={[styles.avatarText, { color: clr.text }]}>{getInitials(esnafName)}</Text>
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{esnafName}</Text>
                    <Text style={styles.itemSub}>
                      {activeDebts > 0
                        ? hasTaksit ? `${activeDebts} taksit aktif` : `${activeDebts} borç bekliyor`
                        : 'Temizlendi'}
                    </Text>
                  </View>
                  <View style={styles.itemRight}>
                    <Text style={[styles.itemAmount, { color: debt > 0 ? colors.orange : colors.green }]}>
                      ₺{debt.toLocaleString('tr-TR')}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: debt > 0 ? colors.orangeLight : colors.greenLight }]}>
                      <Text style={[styles.badgeText, { color: debt > 0 ? colors.orange : colors.green }]}>
                        {debt > 0 ? (hasTaksit ? 'Taksitli' : 'Bekliyor') : 'Temiz'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Ödeme Bildirimi Butonu */}
        {profile.length > 0 && (
          <TouchableOpacity
            style={styles.payBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('SendNotification', { profile: profile[0] })}
          >
            <Text style={styles.payBtnText}>💸  Ödeme Bildirimi Gönder</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <View style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={[styles.navLabel, { color: colors.teal }]}>Ana Sayfa</Text>
        </View>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navLabel}>Borçlarım</Text>
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
    backgroundColor: colors.teal,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 22,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  userName: {
    fontSize: 22,
    fontFamily: 'Nunito_900Black',
    color: '#fff',
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
  },
  logoutText: { color: '#fff', fontFamily: 'Nunito_700Bold', fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statChip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  statVal: { fontFamily: 'Nunito_900Black', fontSize: 16, color: '#fff' },
  statLbl: { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontFamily: 'PlusJakartaSans_600SemiBold', marginTop: 2 },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 18,
    marginTop: 14,
    backgroundColor: colors.orangeLight,
    borderWidth: 1.5,
    borderColor: colors.orange,
    borderRadius: 14,
    padding: 12,
  },
  warningCardRed: {
    backgroundColor: colors.redLight,
    borderColor: colors.red,
  },
  warningIcon: { fontSize: 22 },
  warningTitle: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: colors.orange },
  warningText: { fontSize: 13, color: colors.ink, fontFamily: 'PlusJakartaSans_600SemiBold', marginTop: 2 },
  listSection: {
    marginHorizontal: 18,
    marginTop: 14,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.muted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  emptyWrap: { alignItems: 'center', paddingVertical: 32 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontFamily: 'Nunito_800ExtraBold', fontSize: 15, color: colors.ink, marginBottom: 6 },
  emptySub: {
    fontSize: 13, color: colors.muted,
    fontFamily: 'PlusJakartaSans_400Regular',
    textAlign: 'center', lineHeight: 20, paddingHorizontal: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: 'Nunito_800ExtraBold', fontSize: 15 },
  itemInfo: { flex: 1 },
  itemName: { fontFamily: 'Nunito_800ExtraBold', fontSize: 14, color: colors.ink },
  itemSub: { fontSize: 12, color: colors.muted, marginTop: 1, fontFamily: 'PlusJakartaSans_400Regular' },
  itemRight: { alignItems: 'flex-end', gap: 4 },
  itemAmount: { fontFamily: 'Nunito_800ExtraBold', fontSize: 14 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  badgeText: { fontSize: 11, fontFamily: 'Nunito_700Bold' },
  payBtn: {
    marginHorizontal: 18,
    marginTop: 12,
    backgroundColor: colors.teal,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  payBtnText: { color: '#fff', fontFamily: 'Nunito_800ExtraBold', fontSize: 15 },
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
  notifRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  notifIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  notifName: { fontFamily: 'Nunito_800ExtraBold', fontSize: 13, color: colors.ink },
  notifSub: { fontSize: 11, color: colors.muted, fontFamily: 'PlusJakartaSans_400Regular', marginTop: 1 },
  notifBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  notifBadgeText: { fontSize: 11, fontFamily: 'Nunito_700Bold' },
  navItem: { alignItems: 'center', gap: 3 },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 10, fontFamily: 'Nunito_700Bold', color: colors.muted },
  navBadge: {
    position: 'absolute', top: -4, right: -8,
    backgroundColor: colors.teal,
    borderRadius: 8, minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  navBadgeText: { color: '#fff', fontSize: 9, fontFamily: 'Nunito_800ExtraBold' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 32,
  },
  modalCard: {
    width: '100%', backgroundColor: colors.card,
    borderRadius: 24, padding: 24, alignItems: 'center',
  },
  modalIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.tealLight,
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
    backgroundColor: colors.teal, alignItems: 'center',
  },
  modalBtnLogoutText: { fontFamily: 'Nunito_800ExtraBold', fontSize: 15, color: '#fff' },
});

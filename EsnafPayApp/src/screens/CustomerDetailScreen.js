import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { customerApi } from '../api/client';

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

export default function CustomerDetailScreen({ navigation, route }) {
  const { customer } = route.params;
  const initials = getInitials(customer.name);
  const ac = getAvatarColor(customer.name);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Müşteriyi Sil',
      `"${customer.name}" silinecek. Emin misin?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await customerApi.delete(customer._id);
              navigation.goBack();
            } catch {
              Alert.alert('Hata', 'Müşteri silinemedi');
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Koyu Gradient Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Text style={styles.iconBtnText}>←</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={styles.iconBtn} onPress={() => {}}>
              <Text style={styles.iconBtnText}>✉️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { marginLeft: 8 }]} onPress={handleDelete} disabled={deleting}>
              {deleting
                ? <ActivityIndicator size="small" color="#FF7070" />
                : <Text style={styles.iconBtnText}>🗑️</Text>
              }
            </TouchableOpacity>
          </View>

          <View style={styles.profileRow}>
            <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Text style={[styles.avatarText, { color: '#fff' }]}>{initials}</Text>
            </View>
            <View>
              <Text style={styles.customerName}>{customer.name}</Text>
              <Text style={styles.customerPhone}>{customer.phone || 'Telefon eklenmedi'}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={[styles.statVal, { color: '#FF7070' }]}>
                ₺{(customer.totalDebt || 0).toLocaleString('tr-TR')}
              </Text>
              <Text style={styles.statLbl}>Toplam Borç</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={[styles.statVal, { color: '#5EEDC0' }]}>₺0</Text>
              <Text style={styles.statLbl}>Ödenen</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={[styles.statVal, { color: '#FFD580' }]}>0</Text>
              <Text style={styles.statLbl}>Taksit</Text>
            </View>
          </View>
        </View>

        {/* Aksiyon Butonları */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionLabel}>Borç Ekle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionLabel}>Taksit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionLabel}>Mesaj</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>📞</Text>
            <Text style={styles.actionLabel}>Ara</Text>
          </TouchableOpacity>
        </View>

        {/* Borç Geçmişi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BORÇ GEÇMİŞİ</Text>
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Henüz borç kaydı yok</Text>
            <Text style={styles.emptySub}>Borç ekleme özelliği 3. haftada gelecek.</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('EsnafHome')}
        >
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={[styles.navLabel, { color: colors.orange }]}>Ana Sayfa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navLabel}>Borçlar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>💬</Text>
          <Text style={styles.navLabel}>Mesajlar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  // Header — koyu gradient (ink teması)
  header: {
    backgroundColor: colors.ink,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 22,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: { color: '#fff', fontSize: 16 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: 'Nunito_800ExtraBold', fontSize: 18 },
  customerName: { fontFamily: 'Nunito_900Black', fontSize: 20, color: '#fff' },
  customerPhone: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: 'PlusJakartaSans_400Regular', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statChip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  statVal: { fontFamily: 'Nunito_900Black', fontSize: 17 },
  statLbl: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontFamily: 'PlusJakartaSans_600SemiBold', marginTop: 2 },

  // Aksiyonlar
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 18,
    marginTop: 12,
    marginBottom: 4,
  },
  actionBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  actionIcon: { fontSize: 18 },
  actionLabel: { fontSize: 10, fontFamily: 'Nunito_700Bold', color: colors.ink2, marginTop: 2 },

  // Borç Listesi
  section: {
    marginHorizontal: 18,
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.muted,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  emptyWrap: { alignItems: 'center', paddingVertical: 24 },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyTitle: { fontFamily: 'Nunito_800ExtraBold', fontSize: 14, color: colors.ink, marginBottom: 4 },
  emptySub: { fontSize: 12, color: colors.muted, fontFamily: 'PlusJakartaSans_400Regular', textAlign: 'center' },

  // Bottom Nav
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
});

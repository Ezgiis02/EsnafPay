import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export default function MusteriHomeScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Merhaba 👋</Text>
              <Text style={styles.userName}>{user?.name || 'Müşteri'}</Text>
            </View>
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Çıkış</Text>
            </TouchableOpacity>
          </View>

          {/* Toplam Borç Kartı */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>TOPLAM AÇIK BORÇ</Text>
            <Text style={styles.totalAmount}>₺0</Text>
            <View style={styles.statsRow}>
              <View style={styles.statChip}>
                <Text style={styles.statVal}>0</Text>
                <Text style={styles.statLbl}>Aktif Esnaf</Text>
              </View>
              <View style={styles.statChip}>
                <Text style={styles.statVal}>0</Text>
                <Text style={styles.statLbl}>Toplam</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Esnaf Borç Listesi */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>ESNAF LİSTESİ</Text>
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🧑‍💼</Text>
            <Text style={styles.emptyTitle}>Henüz borç kaydı yok</Text>
            <Text style={styles.emptySub}>
              Bir esnaf seni sisteme eklediğinde borç bilgilerin burada görünür.
            </Text>
          </View>
        </View>

        {/* Ödeme Bildirimi */}
        <TouchableOpacity style={styles.payBtn} activeOpacity={0.85}>
          <Text style={styles.payBtnText}>💸  Ödeme Bildirimi Gönder</Text>
        </TouchableOpacity>
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
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
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
  logoutText: {
    color: '#fff',
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
  },
  totalCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
  },
  totalLabel: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 32,
    fontFamily: 'Nunito_900Black',
    color: '#fff',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statChip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
  },
  statVal: {
    fontFamily: 'Nunito_900Black',
    fontSize: 18,
    color: '#fff',
  },
  statLbl: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginTop: 1,
  },
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
    marginBottom: 6,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: colors.ink,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: colors.muted,
    fontFamily: 'PlusJakartaSans_400Regular',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  payBtn: {
    marginHorizontal: 18,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: colors.teal,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  payBtnText: {
    color: '#fff',
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
  },
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
  navItem: {
    alignItems: 'center',
    gap: 3,
  },
  navIcon: {
    fontSize: 20,
  },
  navLabel: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    color: colors.muted,
  },
});

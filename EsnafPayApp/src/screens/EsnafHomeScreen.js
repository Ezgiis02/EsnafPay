import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { customerApi } from '../api/client';

export default function EsnafHomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await customerApi.getAll();
      setCustomers(res.data);
    } catch {
      // hata sessizce geçilir, boş liste kalır
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomers();
  };

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const totalDebt = customers.reduce((s, c) => s + (c.totalDebt || 0), 0);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.orange} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Merhaba 👋</Text>
              <Text style={styles.userName}>{user?.name || 'Esnaf'}</Text>
            </View>
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Çıkış</Text>
            </TouchableOpacity>
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
              <Text style={styles.statVal}>
                {customers.filter((c) => c.totalDebt > 0).length}
              </Text>
              <Text style={styles.statLbl}>Borçlu</Text>
            </View>
          </View>
        </View>

        {/* Arama */}
        <View style={styles.searchWrap}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍  Müşteri ara..."
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
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

        {/* Müşteri Listesi */}
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
            filtered.map((c) => (
              <TouchableOpacity
                key={c._id}
                style={styles.customerCard}
                activeOpacity={0.75}
                onPress={() => navigation.navigate('CustomerDetail', { customer: c })}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{c.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{c.name}</Text>
                  <Text style={styles.cardSub}>
                    {c.phone || 'Telefon yok'} · {formatDate(c.lastTransactionDate)}
                  </Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={[styles.cardDebt, c.totalDebt > 0 && { color: colors.orange }]}>
                    ₺{(c.totalDebt || 0).toLocaleString('tr-TR')}
                  </Text>
                  <Text style={styles.cardArrow}>›</Text>
                </View>
              </TouchableOpacity>
            ))
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
  header: {
    backgroundColor: colors.orange,
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  statVal: { fontFamily: 'Nunito_900Black', fontSize: 18, color: '#fff' },
  statLbl: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginTop: 1,
  },
  searchWrap: { marginHorizontal: 18, marginTop: 12 },
  searchInput: {
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,
    fontSize: 13,
    color: colors.ink,
    fontFamily: 'PlusJakartaSans_400Regular',
    borderWidth: 1.5,
    borderColor: 'transparent',
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
    backgroundColor: colors.orangeLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: 'Nunito_900Black', fontSize: 18, color: colors.orange },
  cardInfo: { flex: 1 },
  cardName: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: colors.ink },
  cardSub: {
    fontSize: 12,
    color: colors.muted,
    fontFamily: 'PlusJakartaSans_400Regular',
    marginTop: 2,
  },
  cardRight: { alignItems: 'flex-end', gap: 2 },
  cardDebt: { fontFamily: 'Nunito_800ExtraBold', fontSize: 14, color: colors.muted },
  cardArrow: { fontSize: 18, color: colors.muted },
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

import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { debtApi } from '../api/client';

const STATUS_CFG = {
  bekliyor:  { icon: '🛒', label: 'Bekliyor',  bg: colors.redLight,    color: colors.red },
  taksitli:  { icon: '📦', label: 'Taksitli',  bg: colors.yellowLight, color: colors.yellow },
  odendi:    { icon: '✅', label: 'Ödendi',    bg: colors.greenLight,  color: colors.green },
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function DebtsScreen({ navigation }) {
  const { user } = useAuth();
  const isEsnaf = user?.role === 'esnaf';
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDebts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await debtApi.getAll();
      setDebts(res.data);
    } catch {
      // sessiz
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchDebts(); }, [fetchDebts]));

  const totalBorc = debts.filter(d => d.status !== 'odendi').reduce((s, d) => s + d.amount, 0);
  const odenenSayisi = debts.filter(d => d.status === 'odendi').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isEsnaf ? colors.orange : colors.teal }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Borç Geçmişi</Text>
        <View style={{ width: 34 }} />
      </View>

      {/* Özet */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryChip}>
          <Text style={styles.summaryVal}>{debts.length}</Text>
          <Text style={styles.summaryLbl}>Toplam Kayıt</Text>
        </View>
        <View style={styles.summaryChip}>
          <Text style={[styles.summaryVal, { color: colors.red }]}>
            ₺{totalBorc.toLocaleString('tr-TR')}
          </Text>
          <Text style={styles.summaryLbl}>Açık Borç</Text>
        </View>
        <View style={styles.summaryChip}>
          <Text style={[styles.summaryVal, { color: colors.green }]}>{odenenSayisi}</Text>
          <Text style={styles.summaryLbl}>Ödenen</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={isEsnaf ? colors.orange : colors.teal} style={{ marginTop: 40 }} />
        ) : debts.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Henüz borç kaydı yok</Text>
            <Text style={styles.emptySub}>
              {isEsnaf ? 'Müşteriye borç ekleyince burada görünür.' : 'Esnaf borç eklediğinde burada görünür.'}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {debts.map((d) => {
              const cfg = STATUS_CFG[d.status] || STATUS_CFG.bekliyor;
              return (
                <View key={d._id} style={styles.row}>
                  <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
                    <Text style={styles.icon}>{cfg.icon}</Text>
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.name}>
                      {isEsnaf ? d.customerName : d.esnafName}
                    </Text>
                    <Text style={styles.desc}>{d.description || 'Borç kaydı'}</Text>
                    <Text style={styles.date}>
                      {formatDate(d.date)}
                      {d.type === 'taksit' ? ` · ${d.installmentCount} taksit` : ''}
                    </Text>
                  </View>
                  <View style={styles.right}>
                    <Text style={[styles.amount, { color: cfg.color }]}>
                      ₺{d.amount.toLocaleString('tr-TR')}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
                      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 14,
  },
  backBtn: { width: 34 },
  backText: { fontSize: 20, color: '#fff' },
  headerTitle: { fontFamily: 'Nunito_900Black', fontSize: 17, color: '#fff' },
  summaryRow: {
    flexDirection: 'row', gap: 10,
    marginHorizontal: 18, marginVertical: 14,
  },
  summaryChip: {
    flex: 1, backgroundColor: colors.card,
    borderRadius: 14, padding: 12, alignItems: 'center',
  },
  summaryVal: { fontFamily: 'Nunito_900Black', fontSize: 16, color: colors.ink },
  summaryLbl: { fontSize: 10, color: colors.muted, fontFamily: 'PlusJakartaSans_600SemiBold', marginTop: 2 },
  emptyWrap: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 44, marginBottom: 12 },
  emptyTitle: { fontFamily: 'Nunito_800ExtraBold', fontSize: 16, color: colors.ink, marginBottom: 6 },
  emptySub: { fontSize: 13, color: colors.muted, fontFamily: 'PlusJakartaSans_400Regular', textAlign: 'center', paddingHorizontal: 32 },
  list: {
    marginHorizontal: 18, backgroundColor: colors.card,
    borderRadius: 16, padding: 14,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  iconWrap: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 17 },
  info: { flex: 1 },
  name: { fontFamily: 'Nunito_800ExtraBold', fontSize: 13, color: colors.ink },
  desc: { fontSize: 12, color: colors.muted, fontFamily: 'PlusJakartaSans_400Regular', marginTop: 1 },
  date: { fontSize: 11, color: colors.muted, fontFamily: 'PlusJakartaSans_400Regular', marginTop: 1 },
  right: { alignItems: 'flex-end', gap: 4 },
  amount: { fontFamily: 'Nunito_800ExtraBold', fontSize: 14 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 100 },
  badgeText: { fontSize: 11, fontFamily: 'Nunito_700Bold' },
});

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { installmentApi } from '../api/client';

const TEAL = '#00B4A0';
const TEAL2 = '#00D4BC';

function getStatus(inst) {
  if (inst.status === 'odendi') return 'odendi';
  const today = new Date();
  const due = new Date(inst.dueDate);
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) return 'yaklasan';
  return 'bekliyor';
}

export default function InstallmentScreen({ navigation, route }) {
  const { debt, customer } = route.params;
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);

  const fetchInstallments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await installmentApi.getByDebt(debt._id);
      setInstallments(res.data);
    } catch {
      // sessiz hata
    } finally {
      setLoading(false);
    }
  }, [debt._id]);

  useFocusEffect(fetchInstallments);

  const handlePay = async (inst) => {
    setPaying(inst._id);
    try {
      if (inst.status === 'odendi') {
        await installmentApi.unpay(inst._id);
      } else {
        await installmentApi.pay(inst._id);
      }
      await fetchInstallments();
    } catch {
      // sessiz hata
    } finally {
      setPaying(null);
    }
  };

  const paidCount = installments.filter(i => i.status === 'odendi').length;
  const paidAmount = installments.filter(i => i.status === 'odendi').reduce((s, i) => s + i.amount, 0);
  const remainingAmount = debt.amount - paidAmount;
  const progress = installments.length > 0 ? paidCount / installments.length : 0;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  const getDaysLeft = (dueDate) => {
    const diff = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)} gün geçti`;
    if (diff === 0) return 'Bugün';
    return `${diff} gün kaldı`;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Teal Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Taksit Planı</Text>
          <View style={{ width: 34 }} />
        </View>

        <Text style={styles.headerSub}>
          {debt.description || 'Borç kaydı'} · {customer.name}
        </Text>
        <Text style={styles.headerAmount}>
          ₺{debt.amount.toLocaleString('tr-TR')}
        </Text>
        <Text style={styles.headerMeta}>
          {debt.installmentCount} taksit · Başlangıç: {formatDate(debt.firstDueDate || debt.date)}
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressWrap}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLbl}>{paidCount}/{installments.length} ödendi</Text>
            <Text style={styles.progressLbl}>₺{remainingAmount.toLocaleString('tr-TR')} kaldı</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TAKSİT DETAYI</Text>

          {loading ? (
            <ActivityIndicator color={TEAL} style={{ marginVertical: 32 }} />
          ) : (
            installments.map((inst) => {
              const st = getStatus(inst);
              return (
                <View
                  key={inst._id}
                  style={[
                    styles.instRow,
                    st === 'yaklasan' && styles.instRowActive,
                  ]}
                >
                  {/* Numaralı daire */}
                  <View style={[styles.circle,
                    st === 'odendi' && styles.circleGreen,
                    st === 'yaklasan' && styles.circleOrange,
                    st === 'bekliyor' && styles.circleGray,
                  ]}>
                    <Text style={[styles.circleText,
                      st === 'odendi' && { color: colors.green },
                      st === 'yaklasan' && { color: colors.orange },
                      st === 'bekliyor' && { color: colors.muted },
                    ]}>
                      {inst.installmentNumber}
                    </Text>
                  </View>

                  {/* Bilgi */}
                  <View style={styles.instInfo}>
                    <Text style={styles.instDate}>{formatDate(inst.dueDate)}</Text>
                    {st === 'odendi' && (
                      <Text style={styles.instSubGreen}>
                        ✓ Ödendi · {formatDate(inst.paidDate)}
                      </Text>
                    )}
                    {st === 'yaklasan' && (
                      <Text style={styles.instSubOrange}>
                        ⏳ Yaklaşıyor · {getDaysLeft(inst.dueDate)}
                      </Text>
                    )}
                    {st === 'bekliyor' && (
                      <Text style={styles.instSubGray}>Bekliyor</Text>
                    )}
                  </View>

                  {/* Tutar + buton */}
                  <View style={styles.instRight}>
                    <Text style={[styles.instAmount,
                      st === 'odendi' && { color: colors.green },
                      st === 'yaklasan' && { color: colors.orange },
                      st === 'bekliyor' && { color: colors.muted },
                    ]}>
                      ₺{inst.amount.toLocaleString('tr-TR')}
                    </Text>
                    <TouchableOpacity
                      style={[styles.payBtn,
                        st === 'odendi' && styles.payBtnGreen,
                        st !== 'odendi' && styles.payBtnTeal,
                      ]}
                      onPress={() => handlePay(inst)}
                      disabled={paying === inst._id}
                    >
                      {paying === inst._id
                        ? <ActivityIndicator size="small" color="#fff" />
                        : <Text style={styles.payBtnText}>
                            {st === 'odendi' ? 'Geri Al' : 'Ödendi'}
                          </Text>
                      }
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    background: TEAL,
    backgroundColor: TEAL,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 22,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backBtn: { width: 34 },
  backText: { fontSize: 20, color: 'rgba(255,255,255,0.75)' },
  headerTitle: {
    flex: 1,
    fontFamily: 'Nunito_900Black',
    fontSize: 17,
    color: '#fff',
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  headerAmount: {
    fontFamily: 'Nunito_900Black',
    fontSize: 34,
    color: '#fff',
    marginTop: 4,
  },
  headerMeta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'PlusJakartaSans_400Regular',
    marginTop: 4,
  },
  progressWrap: { marginTop: 14 },
  progressBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressLbl: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  section: {
    margin: 18,
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
  instRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  instRowActive: {
    borderLeftWidth: 3,
    borderLeftColor: colors.orange,
    paddingLeft: 8,
    marginLeft: -8,
  },
  circle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  circleGreen: { backgroundColor: '#E8FAF2' },
  circleOrange: { backgroundColor: '#FFF0EB' },
  circleGray: { backgroundColor: colors.border },
  circleText: { fontFamily: 'Nunito_800ExtraBold', fontSize: 13 },
  instInfo: { flex: 1 },
  instDate: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: colors.ink },
  instSubGreen: { fontSize: 11, color: '#1AAD72', fontFamily: 'PlusJakartaSans_600SemiBold', marginTop: 1 },
  instSubOrange: { fontSize: 11, color: colors.orange, fontFamily: 'PlusJakartaSans_600SemiBold', marginTop: 1 },
  instSubGray: { fontSize: 11, color: colors.muted, fontFamily: 'PlusJakartaSans_600SemiBold', marginTop: 1 },
  instRight: { alignItems: 'flex-end', gap: 6 },
  instAmount: { fontFamily: 'Nunito_800ExtraBold', fontSize: 14 },
  payBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  payBtnTeal: { backgroundColor: TEAL },
  payBtnGreen: { backgroundColor: colors.border },
  payBtnText: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: '#fff' },
});

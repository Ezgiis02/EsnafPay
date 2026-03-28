import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

export default function CustomerDetailScreen({ navigation, route }) {
  const { customer } = route.params;

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Müşteri Detayı</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profil Kartı */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{customer.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.customerName}>{customer.name}</Text>
          {customer.phone ? (
            <Text style={styles.customerPhone}>{customer.phone}</Text>
          ) : null}
          {customer.notes ? (
            <Text style={styles.customerNotes}>{customer.notes}</Text>
          ) : null}
        </View>

        {/* Borç Özeti */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryVal, { color: colors.orange }]}>
              ₺{(customer.totalDebt || 0).toLocaleString('tr-TR')}
            </Text>
            <Text style={styles.summaryLbl}>Toplam Borç</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryVal}>{formatDate(customer.lastTransactionDate)}</Text>
            <Text style={styles.summaryLbl}>Son İşlem</Text>
          </View>
        </View>

        {/* Borç Kayıtları */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>BORÇ KAYITLARI</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>+ Borç Ekle</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Henüz borç kaydı yok</Text>
            <Text style={styles.emptySub}>
              Borç ekleme özelliği 3. haftada gelecek.
            </Text>
          </View>
        </View>

        {/* Taksit Durumu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TAKSİT DURUMU</Text>
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>Aktif taksit yok</Text>
            <Text style={styles.emptySub}>Taksit planı 4. haftada eklenecek.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 60 },
  backText: { color: colors.orange, fontFamily: 'Nunito_700Bold', fontSize: 15 },
  headerTitle: { fontFamily: 'Nunito_900Black', fontSize: 17, color: colors.ink },
  profileCard: {
    backgroundColor: colors.card,
    margin: 18,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.orangeLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontFamily: 'Nunito_900Black', fontSize: 28, color: colors.orange },
  customerName: { fontFamily: 'Nunito_900Black', fontSize: 20, color: colors.ink },
  customerPhone: {
    fontSize: 14,
    color: colors.muted,
    fontFamily: 'PlusJakartaSans_400Regular',
    marginTop: 4,
  },
  customerNotes: {
    fontSize: 13,
    color: colors.muted,
    fontFamily: 'PlusJakartaSans_400Regular',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  summaryRow: {
    flexDirection: 'row',
    marginHorizontal: 18,
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  summaryVal: {
    fontFamily: 'Nunito_900Black',
    fontSize: 16,
    color: colors.ink,
    marginBottom: 4,
  },
  summaryLbl: {
    fontSize: 11,
    color: colors.muted,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  section: {
    marginHorizontal: 18,
    marginBottom: 12,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.muted,
    letterSpacing: 0.8,
  },
  sectionAction: {
    fontSize: 13,
    color: colors.orange,
    fontFamily: 'Nunito_700Bold',
  },
  emptyWrap: { alignItems: 'center', paddingVertical: 24 },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.ink,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: colors.muted,
    fontFamily: 'PlusJakartaSans_400Regular',
    textAlign: 'center',
  },
});

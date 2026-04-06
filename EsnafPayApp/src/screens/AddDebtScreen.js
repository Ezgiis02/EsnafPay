import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { debtApi } from '../api/client';

function getInitials(name = '') {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

export default function AddDebtScreen({ navigation, route }) {
  const { customer, onAdded } = route.params;

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(
    new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  );
  const [type, setType] = useState('tek');
  const [installmentCount, setInstallmentCount] = useState('2');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const parseDate = (str) => {
    const parts = str.split('.');
    if (parts.length === 3) {
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    return new Date();
  };

  const handleAdd = async () => {
    setError('');
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (!amount.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Geçerli bir tutar girin');
      return;
    }
    if (type === 'taksit' && (!installmentCount || parseInt(installmentCount) < 2)) {
      setError('Taksit sayısı en az 2 olmalıdır');
      return;
    }
    setLoading(true);
    try {
      await debtApi.create({
        customerId: customer._id,
        amount: parsedAmount,
        description: description.trim(),
        date: parseDate(date),
        type,
        installmentCount: parseInt(installmentCount) || 2,
      });
      onAdded?.();
      navigation.goBack();
    } catch (err) {
      setError(err.response?.data?.message || 'Borç eklenemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Geri</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yeni Borç Ekle</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Müşteri kartı */}
          <View style={styles.customerCard}>
            <View style={styles.customerAvatar}>
              <Text style={styles.customerAvatarText}>{getInitials(customer.name)}</Text>
            </View>
            <View>
              <Text style={styles.customerName}>{customer.name}</Text>
              <Text style={styles.customerDebt}>
                Mevcut borç: ₺{(customer.totalDebt || 0).toLocaleString('tr-TR')}
              </Text>
            </View>
          </View>

          {/* Hata */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          ) : null}

          {/* Tutar */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>TUTAR (₺)</Text>
            <TextInput
              style={[styles.input, amount && styles.inputFilled]}
              placeholder="0,00"
              placeholderTextColor={colors.muted}
              value={amount}
              onChangeText={(v) => { setAmount(v); setError(''); }}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Açıklama */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>AÇIKLAMA (opsiyonel)</Text>
            <TextInput
              style={styles.input}
              placeholder="Market alışverişi, ekmek & süt..."
              placeholderTextColor={colors.muted}
              value={description}
              onChangeText={setDescription}
              autoCapitalize="sentences"
            />
          </View>

          {/* Tarih */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>TARİH</Text>
            <TextInput
              style={styles.input}
              placeholder="GG.AA.YYYY"
              placeholderTextColor={colors.muted}
              value={date}
              onChangeText={setDate}
              keyboardType="numeric"
            />
          </View>

          {/* Ödeme Tipi */}
          <Text style={styles.label}>ÖDEME TİPİ</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeCard, type === 'tek' && styles.typeCardSelected]}
              onPress={() => setType('tek')}
            >
              <Text style={styles.typeIcon}>💰</Text>
              <Text style={[styles.typeName, type === 'tek' && styles.typeNameSelected]}>
                Tek Seferlik
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeCard, type === 'taksit' && styles.typeCardSelected]}
              onPress={() => setType('taksit')}
            >
              <Text style={styles.typeIcon}>📅</Text>
              <Text style={[styles.typeName, type === 'taksit' && styles.typeNameSelected]}>
                Taksitle
              </Text>
            </TouchableOpacity>
          </View>

          {/* Taksit sayısı */}
          {type === 'taksit' && (
            <View style={[styles.inputBlock, { marginTop: 12 }]}>
              <Text style={styles.label}>TAKSİT SAYISI</Text>
              <TextInput
                style={[styles.input, installmentCount && styles.inputFilled]}
                placeholder="2"
                placeholderTextColor={colors.muted}
                value={installmentCount}
                onChangeText={setInstallmentCount}
                keyboardType="number-pad"
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={handleAdd}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Borç Kaydını Ekle ✓</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnOutline} onPress={() => navigation.goBack()}>
            <Text style={styles.btnOutlineText}>İptal</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  content: { padding: 18, paddingTop: 16 },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  customerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.orangeLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerAvatarText: { fontFamily: 'Nunito_900Black', fontSize: 16, color: colors.orange },
  customerName: { fontFamily: 'Nunito_800ExtraBold', fontSize: 15, color: colors.ink },
  customerDebt: { fontSize: 12, color: colors.muted, fontFamily: 'PlusJakartaSans_400Regular', marginTop: 2 },
  errorBox: {
    backgroundColor: '#FEF0F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FCCACA',
  },
  errorText: { color: '#E84040', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 },
  inputBlock: { marginBottom: 14 },
  label: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: colors.muted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: colors.ink,
  },
  inputFilled: { borderColor: colors.orange, backgroundColor: colors.orangeLight },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  typeCard: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  typeCardSelected: { borderColor: colors.orange, backgroundColor: colors.orangeLight },
  typeIcon: { fontSize: 26, marginBottom: 6 },
  typeName: { fontFamily: 'Nunito_800ExtraBold', fontSize: 13, color: colors.ink },
  typeNameSelected: { color: colors.orange },
  btn: {
    backgroundColor: colors.orange,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  btnText: { color: '#fff', fontFamily: 'Nunito_800ExtraBold', fontSize: 15 },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  btnOutlineText: { fontFamily: 'Nunito_800ExtraBold', fontSize: 15, color: colors.ink },
});

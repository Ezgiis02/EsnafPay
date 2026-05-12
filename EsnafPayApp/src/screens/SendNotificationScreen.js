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
import { notificationApi } from '../api/client';

function getInitials(name = '') {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

export default function SendNotificationScreen({ navigation, route }) {
  const { profile } = route.params; // { customer, esnaf, debts, nextInstallment }
  const { customer, esnaf, debts } = profile;

  const activeDebts = debts.filter(d => d.status !== 'odendi');
  const [selectedDebt, setSelectedDebt] = useState(activeDebts[0] || null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const esnafName = esnaf?.shopName || esnaf?.name || 'Esnaf';

  const handleSend = async () => {
    setError('');
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (!amount.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Geçerli bir tutar girin');
      return;
    }
    setLoading(true);
    try {
      await notificationApi.send({
        customerId: customer._id,
        debtId: selectedDebt?._id || null,
        esnafId: customer.esnafId,
        amount: parsedAmount,
        message: message.trim() || `${esnafName} borcumu ödedim.`,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Bildirim gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.successWrap}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Bildirim Gönderildi!</Text>
          <Text style={styles.successSub}>
            {esnafName} ödeme bildiriminizi aldı. Onaylaması bekleniyor.
          </Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.doneBtnText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Geri</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ödeme Bildirimi</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Esnaf Kartı */}
          <View style={styles.esnafCard}>
            <View style={styles.esnafAvatar}>
              <Text style={styles.esnafAvatarText}>{getInitials(esnafName)}</Text>
            </View>
            <View>
              <Text style={styles.esnafName}>{esnafName}</Text>
              <Text style={styles.esnafDebt}>
                Toplam borcunuz: ₺{(customer.totalDebt || 0).toLocaleString('tr-TR')}
              </Text>
            </View>
          </View>

          {/* Hata */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          ) : null}

          {/* Borç Seç */}
          {activeDebts.length > 0 && (
            <View style={styles.inputBlock}>
              <Text style={styles.label}>BORÇ SEÇ</Text>
              {activeDebts.map(d => (
                <TouchableOpacity
                  key={d._id}
                  style={[styles.debtOption, selectedDebt?._id === d._id && styles.debtOptionSelected]}
                  onPress={() => setSelectedDebt(d)}
                >
                  <Text style={[styles.debtOptionText, selectedDebt?._id === d._id && styles.debtOptionTextSelected]}>
                    {d.description || 'Borç'} — ₺{d.amount.toLocaleString('tr-TR')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Tutar */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>ÖDENEN TUTAR (₺)</Text>
            <TextInput
              style={[styles.input, amount && styles.inputFilled]}
              placeholder="0,00"
              placeholderTextColor={colors.muted}
              value={amount}
              onChangeText={(v) => { setAmount(v); setError(''); }}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Mesaj */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>MESAJ (opsiyonel)</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 13 }]}
              placeholder="Esnafa iletmek istediğiniz mesaj..."
              placeholderTextColor={colors.muted}
              value={message}
              onChangeText={setMessage}
              multiline
              autoCapitalize="sentences"
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={handleSend}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>📤 Bildirimi Gönder</Text>
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
  backText: { color: colors.teal, fontFamily: 'Nunito_700Bold', fontSize: 15 },
  headerTitle: { fontFamily: 'Nunito_900Black', fontSize: 17, color: colors.ink },
  content: { padding: 18, paddingTop: 16 },
  esnafCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  esnafAvatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.tealLight,
    alignItems: 'center', justifyContent: 'center',
  },
  esnafAvatarText: { fontFamily: 'Nunito_900Black', fontSize: 16, color: colors.teal },
  esnafName: { fontFamily: 'Nunito_800ExtraBold', fontSize: 15, color: colors.ink },
  esnafDebt: { fontSize: 12, color: colors.muted, fontFamily: 'PlusJakartaSans_400Regular', marginTop: 2 },
  errorBox: {
    backgroundColor: colors.redLight, borderRadius: 12, padding: 12,
    marginBottom: 14, borderWidth: 1, borderColor: '#FCCACA',
  },
  errorText: { color: colors.red, fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 },
  inputBlock: { marginBottom: 14 },
  label: {
    fontSize: 11, fontFamily: 'PlusJakartaSans_700Bold',
    color: colors.muted, letterSpacing: 0.8, marginBottom: 6,
  },
  debtOption: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 6,
  },
  debtOptionSelected: { borderColor: colors.teal, backgroundColor: colors.tealLight },
  debtOptionText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: colors.ink },
  debtOptionTextSelected: { color: colors.teal },
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
  inputFilled: { borderColor: colors.teal, backgroundColor: colors.tealLight },
  btn: {
    backgroundColor: colors.teal,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: { color: '#fff', fontFamily: 'Nunito_800ExtraBold', fontSize: 15 },
  btnOutline: {
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 16, paddingVertical: 14,
    alignItems: 'center', marginTop: 10,
  },
  btnOutlineText: { fontFamily: 'Nunito_800ExtraBold', fontSize: 15, color: colors.ink },
  successWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  successIcon: { fontSize: 64, marginBottom: 20 },
  successTitle: { fontFamily: 'Nunito_900Black', fontSize: 24, color: colors.ink, marginBottom: 10 },
  successSub: {
    fontSize: 14, color: colors.muted,
    fontFamily: 'PlusJakartaSans_400Regular',
    textAlign: 'center', lineHeight: 22, marginBottom: 32,
  },
  doneBtn: {
    backgroundColor: colors.teal,
    borderRadius: 16, paddingVertical: 16,
    paddingHorizontal: 40, alignItems: 'center',
  },
  doneBtnText: { color: '#fff', fontFamily: 'Nunito_800ExtraBold', fontSize: 15 },
});

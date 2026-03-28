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
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [role, setRole] = useState('esnaf');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    if (!name.trim() || !phone.trim() || !password.trim()) {
      setError('Ad, telefon ve şifre zorunludur');
      return;
    }
    if (role === 'esnaf' && !shopName.trim()) {
      setError('Dükkan adı zorunludur');
      return;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), phone.trim(), password, role, shopName.trim());
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt olunamadı');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successWrap}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>Hesabın Oluşturuldu!</Text>
          <Text style={styles.successSub}>Şimdi giriş yapabilirsin.</Text>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.btnPrimaryText}>Giriş Yap →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoWrap}>
            <Text style={styles.logoText}>
              <Text style={styles.logoOrange}>Esnaf</Text>
              <Text style={styles.logoInk}>Pay</Text>
            </Text>
            <Text style={styles.logoSub}>Yeni hesap oluştur</Text>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabSwitcher}>
            <TouchableOpacity style={styles.tabPassive} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.tabPassiveText}>Giriş Yap</Text>
            </TouchableOpacity>
            <View style={styles.tabActive}>
              <Text style={styles.tabActiveText}>Kayıt Ol</Text>
            </View>
          </View>

          {/* Hata kutusu */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          ) : null}

          {/* Hesap Türü — önce seçilsin, sonra alanlar çıksın */}
          <Text style={styles.inputLabel}>HESAP TÜRÜ</Text>
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[styles.roleCard, role === 'esnaf' && styles.roleCardOrange]}
              onPress={() => { setRole('esnaf'); setError(''); }}
              activeOpacity={0.8}
            >
              <Text style={styles.roleIcon}>🏪</Text>
              <Text style={[styles.roleName, role === 'esnaf' && styles.roleNameOrange]}>Esnaf</Text>
              {role === 'esnaf' && <Text style={styles.roleDesc}>Müşteri & borç yönet</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleCard, role === 'musteri' && styles.roleCardTeal]}
              onPress={() => { setRole('musteri'); setShopName(''); setError(''); }}
              activeOpacity={0.8}
            >
              <Text style={styles.roleIcon}>🧑‍💼</Text>
              <Text style={[styles.roleName, role === 'musteri' && styles.roleNameTeal]}>Müşteri</Text>
              {role === 'musteri' && <Text style={styles.roleDesc}>Borcunu takip et</Text>}
            </TouchableOpacity>
          </View>

          {/* Ad Soyad */}
          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>AD SOYAD</Text>
            <TextInput
              style={[styles.inputField, name && styles.inputFilled]}
              placeholder="Adınız Soyadınız"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={(v) => { setName(v); setError(''); }}
              autoCapitalize="words"
            />
          </View>

          {/* Dükkan Adı — sadece esnaf seçilince */}
          {role === 'esnaf' && (
            <View style={styles.inputBlock}>
              <Text style={styles.inputLabel}>DÜKKAN ADI</Text>
              <TextInput
                style={[styles.inputField, shopName && styles.inputFilled]}
                placeholder="Örn: Ahmet'in Marketi"
                placeholderTextColor={colors.muted}
                value={shopName}
                onChangeText={(v) => { setShopName(v); setError(''); }}
                autoCapitalize="words"
              />
            </View>
          )}

          {/* Telefon */}
          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>TELEFON</Text>
            <TextInput
              style={styles.inputField}
              placeholder="0 5__ ___ __ __"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(v) => { setPhone(v); setError(''); }}
            />
          </View>

          {/* Şifre */}
          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>ŞİFRE</Text>
            <TextInput
              style={styles.inputField}
              placeholder="En az 6 karakter"
              placeholderTextColor={colors.muted}
              secureTextEntry
              value={password}
              onChangeText={(v) => { setPassword(v); setError(''); }}
            />
          </View>

          {/* Kayıt Butonu */}
          <TouchableOpacity
            style={[styles.btnPrimary, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Hesap Oluştur →</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnOutline} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.btnOutlineText}>Zaten hesabım var</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.card },
  container: { flexGrow: 1, padding: 24, paddingTop: 8 },
  logoWrap: { alignItems: 'center', paddingVertical: 20 },
  logoText: { fontSize: 40, fontFamily: 'Nunito_900Black' },
  logoOrange: { color: colors.orange },
  logoInk: { color: colors.ink },
  logoSub: { fontSize: 13, color: colors.muted, marginTop: 4, fontFamily: 'PlusJakartaSans_400Regular' },
  tabSwitcher: {
    flexDirection: 'row', backgroundColor: colors.bg,
    borderRadius: 12, padding: 3, marginBottom: 16,
  },
  tabActive: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: colors.card, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  tabActiveText: { fontFamily: 'Nunito_800ExtraBold', fontSize: 14, color: colors.ink },
  tabPassive: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabPassiveText: { fontFamily: 'Nunito_800ExtraBold', fontSize: 14, color: colors.muted },
  errorBox: {
    backgroundColor: '#FEF0F0', borderRadius: 12, padding: 12,
    marginBottom: 14, borderWidth: 1, borderColor: '#FCCACA',
  },
  errorText: { color: '#E84040', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 },
  inputBlock: { marginBottom: 14 },
  inputLabel: {
    fontSize: 11, fontFamily: 'PlusJakartaSans_700Bold',
    color: colors.muted, letterSpacing: 0.8, marginBottom: 6,
  },
  inputField: {
    width: '100%', padding: 14, backgroundColor: colors.bg,
    borderRadius: 13, borderWidth: 1.5, borderColor: 'transparent',
    fontFamily: 'PlusJakartaSans_400Regular', fontSize: 15, color: colors.ink2,
  },
  inputFilled: { borderColor: colors.orange, backgroundColor: colors.orangeLight },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  roleCard: {
    flex: 1, paddingVertical: 18, paddingHorizontal: 12,
    borderRadius: 16, borderWidth: 2, borderColor: colors.border, alignItems: 'center',
  },
  roleCardOrange: { borderColor: colors.orange, backgroundColor: colors.orangeLight },
  roleCardTeal: { borderColor: colors.teal, backgroundColor: colors.tealLight },
  roleIcon: { fontSize: 28, marginBottom: 6 },
  roleName: { fontFamily: 'Nunito_800ExtraBold', fontSize: 14, color: colors.ink },
  roleNameOrange: { color: colors.orange },
  roleNameTeal: { color: colors.teal },
  roleDesc: { fontSize: 10, color: colors.muted, marginTop: 2, fontFamily: 'PlusJakartaSans_400Regular', textAlign: 'center' },
  btnPrimary: {
    backgroundColor: colors.orange, paddingVertical: 16,
    borderRadius: 16, alignItems: 'center', marginBottom: 10,
  },
  btnPrimaryText: { color: '#fff', fontFamily: 'Nunito_800ExtraBold', fontSize: 16 },
  btnOutline: {
    borderWidth: 1.5, borderColor: colors.border,
    paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginBottom: 20,
  },
  btnOutlineText: { color: colors.ink, fontFamily: 'Nunito_800ExtraBold', fontSize: 16 },
  // Başarı ekranı
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  successIcon: { fontSize: 64, marginBottom: 16 },
  successTitle: { fontFamily: 'Nunito_900Black', fontSize: 24, color: colors.ink, marginBottom: 8 },
  successSub: { fontSize: 15, color: colors.muted, fontFamily: 'PlusJakartaSans_400Regular', marginBottom: 32 },
});

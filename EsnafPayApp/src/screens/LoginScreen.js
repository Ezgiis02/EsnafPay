import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert('Hata', 'Telefon ve şifre zorunludur');
      return;
    }
    setLoading(true);
    try {
      await login(phone.trim(), password);
    } catch (err) {
      const msg = err.response?.data?.message || 'Giriş yapılamadı';
      Alert.alert('Hata', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
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
            <Text style={styles.logoSub}>Borç ve taksit yönetimi, şeffaf ve kolay</Text>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabSwitcher}>
            <View style={styles.tabActive}>
              <Text style={styles.tabActiveText}>Giriş Yap</Text>
            </View>
            <TouchableOpacity
              style={styles.tabPassive}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.tabPassiveText}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>

          {/* Telefon */}
          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>TELEFON NUMARASI</Text>
            <TextInput
              style={[styles.inputField, phone ? styles.inputFilled : null]}
              placeholder="0 5__ ___ __ __"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              autoComplete="tel"
            />
          </View>

          {/* Şifre */}
          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>ŞİFRE</Text>
            <TextInput
              style={styles.inputField}
              placeholder="••••••••"
              placeholderTextColor={colors.muted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.forgotWrap}>
            <Text style={styles.forgotText}>Şifremi unuttum</Text>
          </TouchableOpacity>

          {/* Giriş Butonu */}
          <TouchableOpacity
            style={[styles.btnPrimary, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnPrimaryText}>Giriş Yap →</Text>
            )}
          </TouchableOpacity>

          <View style={styles.orRow}>
            <Text style={styles.orText}>— veya —</Text>
          </View>

          <TouchableOpacity
            style={styles.btnOutline}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.btnOutlineText}>Hesap Oluştur</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.card,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 8,
  },
  logoWrap: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  logoText: {
    fontSize: 40,
    fontFamily: 'Nunito_900Black',
  },
  logoOrange: {
    color: colors.orange,
  },
  logoInk: {
    color: colors.ink,
  },
  logoSub: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderRadius: 12,
    padding: 3,
    marginBottom: 22,
  },
  tabActive: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.card,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabActiveText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.ink,
  },
  tabPassive: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabPassiveText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.muted,
  },
  inputBlock: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: colors.muted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputField: {
    width: '100%',
    padding: 14,
    backgroundColor: colors.bg,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: 'transparent',
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 15,
    color: colors.ink2,
  },
  inputFilled: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeLight,
  },
  forgotWrap: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  forgotText: {
    fontSize: 13,
    color: colors.orange,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  btnPrimary: {
    backgroundColor: colors.orange,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  btnPrimaryText: {
    color: '#fff',
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
  },
  orRow: {
    alignItems: 'center',
    marginVertical: 14,
  },
  orText: {
    fontSize: 13,
    color: colors.muted,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  btnOutlineText: {
    color: colors.ink,
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
  },
});

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
import { customerApi } from '../api/client';

export default function AddCustomerScreen({ navigation, route }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    setError('');
    if (!name.trim()) {
      setError('Müşteri adı zorunludur');
      return;
    }
    setLoading(true);
    try {
      await customerApi.create({ name: name.trim(), phone: phone.trim(), notes: notes.trim() });
      route.params?.onAdded?.();
      navigation.goBack();
    } catch (err) {
      setError(err.response?.data?.message || 'Müşteri eklenemedi');
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
          <Text style={styles.headerTitle}>Yeni Müşteri</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Hata mesajı */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          ) : null}

          {/* Ad */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>AD SOYAD *</Text>
            <TextInput
              style={[styles.input, name && styles.inputFilled]}
              placeholder="Ahmet Yılmaz"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={(v) => { setName(v); setError(''); }}
              autoCapitalize="words"
            />
          </View>

          {/* Telefon */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>TELEFON (opsiyonel)</Text>
            <TextInput
              style={styles.input}
              placeholder="0 5__ ___ __ __"
              placeholderTextColor={colors.muted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* Not */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>NOT (opsiyonel)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Müşteri hakkında not..."
              placeholderTextColor={colors.muted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={handleAdd}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Müşteri Ekle</Text>
            )}
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
  content: { padding: 18, paddingTop: 22 },
  errorBox: {
    backgroundColor: '#FEF0F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FCCACA',
  },
  errorText: { color: '#E84040', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 },
  inputBlock: { marginBottom: 16 },
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
  textArea: { minHeight: 80 },
  btn: {
    backgroundColor: colors.orange,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: { color: '#fff', fontFamily: 'Nunito_800ExtraBold', fontSize: 16 },
});

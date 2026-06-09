import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, Modal, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { authApi } from '../api/client';

function getInitials(name = '') {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUser } = useAuth();
  const isEsnaf = user?.role === 'esnaf';

  const [editName, setEditName] = useState(user?.name || '');
  const [editShop, setEditShop] = useState(user?.shopName || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleSave = async () => {
    setError('');
    setSuccess(false);
    if (!editName.trim()) { setError('Ad soyad boş bırakılamaz'); return; }
    if (isEsnaf && !editShop.trim()) { setError('Dükkan adı boş bırakılamaz'); return; }
    setSaving(true);
    try {
      const res = await authApi.updateProfile({ name: editName.trim(), shopName: editShop.trim() });
      await updateUser(res.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (e) {
      setError(e.response?.data?.message || 'Güncelleme başarısız');
    } finally {
      setSaving(false);
    }
  };

  const avatarColor = isEsnaf ? colors.orange : colors.teal;
  const avatarBg = isEsnaf ? colors.orangeLight : colors.tealLight;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: avatarColor }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profilim</Text>
          <View style={{ width: 34 }} />
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
            <Text style={[styles.avatarText, { color: avatarColor }]}>
              {getInitials(user?.name || '')}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <View style={[styles.roleBadge, { backgroundColor: avatarBg }]}>
            <Text style={[styles.roleText, { color: avatarColor }]}>
              {isEsnaf ? '🏪 Esnaf' : '👤 Müşteri'}
            </Text>
          </View>
        </View>

        {/* Bilgi kartı */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>TELEFON</Text>
          <Text style={styles.infoValue}>{user?.phone}</Text>
          {isEsnaf && user?.shopName ? (
            <>
              <Text style={[styles.infoLabel, { marginTop: 12 }]}>DÜKKAN ADI</Text>
              <Text style={styles.infoValue}>{user.shopName}</Text>
            </>
          ) : null}
        </View>

        {/* Düzenleme formu */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Bilgileri Düzenle</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✅ Bilgiler güncellendi</Text>
            </View>
          ) : null}

          <Text style={styles.inputLabel}>AD SOYAD *</Text>
          <TextInput
            style={styles.input}
            value={editName}
            onChangeText={(v) => { setEditName(v); setError(''); }}
            placeholder="Ad Soyad"
            placeholderTextColor={colors.muted}
            autoCapitalize="words"
          />

          {isEsnaf && (
            <>
              <Text style={styles.inputLabel}>DÜKKAN ADI *</Text>
              <TextInput
                style={styles.input}
                value={editShop}
                onChangeText={(v) => { setEditShop(v); setError(''); }}
                placeholder="Dükkan Adı"
                placeholderTextColor={colors.muted}
                autoCapitalize="words"
              />
            </>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: avatarColor }, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.saveBtnText}>Kaydet</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Çıkış butonu */}
        <TouchableOpacity style={styles.logoutBtn} onPress={() => setShowLogoutModal(true)}>
          <Text style={styles.logoutText}>🚪  Hesaptan Çık</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Çıkış Onay Modal */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.modalIconWrap, { backgroundColor: colors.orangeLight }]}>
              <Text style={{ fontSize: 28 }}>👋</Text>
            </View>
            <Text style={styles.modalTitle}>Çıkış Yap</Text>
            <Text style={styles.modalDesc}>Hesabından çıkmak istediğine emin misin?</Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowLogoutModal(false)}>
                <Text style={styles.modalBtnCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtnLogout, { backgroundColor: avatarColor }]} onPress={logout}>
                <Text style={styles.modalBtnLogoutText}>Çıkış Yap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  avatarSection: { alignItems: 'center', marginTop: 24, marginBottom: 8 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontFamily: 'Nunito_900Black', fontSize: 28 },
  userName: { fontFamily: 'Nunito_900Black', fontSize: 20, color: colors.ink, marginBottom: 6 },
  roleBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 100 },
  roleText: { fontFamily: 'Nunito_700Bold', fontSize: 13 },
  infoCard: {
    marginHorizontal: 18, marginTop: 16,
    backgroundColor: colors.card, borderRadius: 16, padding: 16,
  },
  infoLabel: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: colors.muted, letterSpacing: 0.8 },
  infoValue: { fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold', color: colors.ink, marginTop: 3 },
  formCard: {
    marginHorizontal: 18, marginTop: 12,
    backgroundColor: colors.card, borderRadius: 16, padding: 16,
  },
  formTitle: { fontFamily: 'Nunito_800ExtraBold', fontSize: 15, color: colors.ink, marginBottom: 14 },
  errorBox: {
    backgroundColor: colors.redLight, borderRadius: 10, padding: 10,
    marginBottom: 12, borderWidth: 1, borderColor: colors.red,
  },
  errorText: { color: colors.red, fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 },
  successBox: {
    backgroundColor: colors.greenLight, borderRadius: 10, padding: 10,
    marginBottom: 12, borderWidth: 1, borderColor: colors.green,
  },
  successText: { color: colors.green, fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 },
  inputLabel: {
    fontSize: 11, fontFamily: 'PlusJakartaSans_700Bold', color: colors.muted,
    letterSpacing: 0.8, marginBottom: 6, marginTop: 10,
  },
  input: {
    backgroundColor: colors.bg, borderRadius: 12,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: 12, paddingVertical: 11,
    fontSize: 14, fontFamily: 'PlusJakartaSans_400Regular', color: colors.ink,
  },
  saveBtn: {
    marginTop: 18, borderRadius: 14, paddingVertical: 14, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontFamily: 'Nunito_800ExtraBold', fontSize: 15 },
  logoutBtn: {
    marginHorizontal: 18, marginTop: 12,
    backgroundColor: colors.card, borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.redLight,
  },
  logoutText: { color: colors.red, fontFamily: 'Nunito_800ExtraBold', fontSize: 15 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 32,
  },
  modalCard: {
    width: '100%', backgroundColor: colors.card,
    borderRadius: 24, padding: 24, alignItems: 'center',
  },
  modalIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  modalTitle: { fontFamily: 'Nunito_900Black', fontSize: 20, color: colors.ink, marginBottom: 10 },
  modalDesc: {
    fontSize: 14, color: colors.muted, fontFamily: 'PlusJakartaSans_400Regular',
    textAlign: 'center', lineHeight: 22, marginBottom: 24,
  },
  modalBtnRow: { flexDirection: 'row', gap: 12, width: '100%' },
  modalBtnCancel: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: colors.border, alignItems: 'center',
  },
  modalBtnCancelText: { fontFamily: 'Nunito_800ExtraBold', fontSize: 15, color: colors.ink },
  modalBtnLogout: {
    flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
  },
  modalBtnLogoutText: { fontFamily: 'Nunito_800ExtraBold', fontSize: 15, color: '#fff' },
});

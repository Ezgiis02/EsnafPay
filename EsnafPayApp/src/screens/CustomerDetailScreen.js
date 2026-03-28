import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { customerApi } from '../api/client';

const AVATAR_COLORS = [
  { bg: '#FEF0F0', fg: '#E84040' },
  { bg: '#FEF7E8', fg: '#F5A623' },
  { bg: '#E6F9F7', fg: '#00B4A0' },
  { bg: '#E8FAF2', fg: '#1AAD72' },
  { bg: '#FFF0EB', fg: '#FF6B35' },
  { bg: '#EEF0FF', fg: '#5A67F2' },
];

function getInitials(name = '') {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function getAvatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export default function CustomerDetailScreen({ navigation, route }) {
  const { customer } = route.params;
  const [localCustomer, setLocalCustomer] = useState(customer);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(customer.name);
  const [editPhone, setEditPhone] = useState(customer.phone || '');
  const [editAddress, setEditAddress] = useState(customer.address || '');
  const [editNotes, setEditNotes] = useState(customer.notes || '');
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);

  const initials = getInitials(localCustomer.name);
  const ac = getAvatarColor(localCustomer.name);

  const doEdit = async () => {
    setEditError('');
    if (!editName.trim()) { setEditError('Ad zorunludur'); return; }
    setSaving(true);
    try {
      const res = await customerApi.update(localCustomer._id, {
        name: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
        notes: editNotes.trim(),
      });
      setLocalCustomer(res.data);
      setShowEditModal(false);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Güncellenemedi');
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await customerApi.delete(localCustomer._id);
      setShowDeleteModal(false);
      navigation.goBack();
    } catch {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Text style={styles.iconBtnText}>←</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={styles.editBtn} onPress={() => { setEditName(localCustomer.name); setEditPhone(localCustomer.phone || ''); setEditNotes(localCustomer.notes || ''); setEditError(''); setShowEditModal(true); }}>
              <Text style={styles.editBtnText}>Düzenle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.deleteBtn, { marginLeft: 8 }]} onPress={() => setShowDeleteModal(true)}>
              <Text style={styles.deleteBtnText}>Sil</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileRow}>
            <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Text style={[styles.avatarText, { color: '#fff' }]}>{initials}</Text>
            </View>
            <View>
              <Text style={styles.customerName}>{localCustomer.name}</Text>
              <Text style={styles.customerPhone}>{localCustomer.phone || 'Telefon eklenmedi'}</Text>
              {localCustomer.address ? (
                <Text style={styles.customerAddress}>📍 {localCustomer.address}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={[styles.statVal, { color: '#FF7070' }]}>
                ₺{(localCustomer.totalDebt || 0).toLocaleString('tr-TR')}
              </Text>
              <Text style={styles.statLbl}>Toplam Borç</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={[styles.statVal, { color: '#5EEDC0' }]}>₺0</Text>
              <Text style={styles.statLbl}>Ödenen</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={[styles.statVal, { color: '#FFD580' }]}>0</Text>
              <Text style={styles.statLbl}>Taksit</Text>
            </View>
          </View>
        </View>

        {/* Aksiyon Butonları */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionLabel}>Borç Ekle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionLabel}>Taksit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionLabel}>Mesaj</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>📞</Text>
            <Text style={styles.actionLabel}>Ara</Text>
          </TouchableOpacity>
        </View>

        {/* Borç Geçmişi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BORÇ GEÇMİŞİ</Text>
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Henüz borç kaydı yok</Text>
            <Text style={styles.emptySub}>Henüz borç kaydı bulunmuyor.</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('EsnafHome')}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={[styles.navLabel, { color: colors.orange }]}>Ana Sayfa</Text>
        </TouchableOpacity>
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

      {/* Düzenleme Modal */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { alignItems: 'stretch' }]}>
            <Text style={[styles.modalTitle, { textAlign: 'left', marginBottom: 16 }]}>Müşteriyi Düzenle</Text>

            {editError ? (
              <View style={styles.editErrorBox}>
                <Text style={styles.editErrorText}>⚠ {editError}</Text>
              </View>
            ) : null}

            <Text style={styles.editLabel}>AD SOYAD *</Text>
            <TextInput
              style={[styles.editInput, editName && styles.editInputFilled]}
              value={editName}
              onChangeText={(v) => { setEditName(v); setEditError(''); }}
              placeholder="Ad Soyad"
              placeholderTextColor={colors.muted}
              autoCapitalize="words"
            />

            <Text style={styles.editLabel}>TELEFON</Text>
            <TextInput
              style={styles.editInput}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="0 5__ ___ __ __"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
            />

            <Text style={styles.editLabel}>ADRES</Text>
            <TextInput
              style={styles.editInput}
              value={editAddress}
              onChangeText={setEditAddress}
              placeholder="Adres..."
              placeholderTextColor={colors.muted}
              autoCapitalize="sentences"
            />

            <Text style={styles.editLabel}>NOT</Text>
            <TextInput
              style={[styles.editInput, { minHeight: 70, textAlignVertical: 'top' }]}
              value={editNotes}
              onChangeText={setEditNotes}
              placeholder="Not..."
              placeholderTextColor={colors.muted}
              multiline
            />

            <View style={[styles.modalBtnRow, { marginTop: 8 }]}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowEditModal(false)} disabled={saving}>
                <Text style={styles.modalBtnCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtnSave, saving && { opacity: 0.7 }]} onPress={doEdit} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.modalBtnSaveText}>Kaydet</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Silme Onay Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* İkon */}
            <View style={styles.modalIconWrap}>
              <Text style={styles.modalIcon}>🗑️</Text>
            </View>

            <Text style={styles.modalTitle}>Müşteriyi Sil</Text>
            <Text style={styles.modalDesc}>
              <Text style={{ fontFamily: 'Nunito_800ExtraBold', color: colors.ink }}>
                {localCustomer.name}
              </Text>
              {' '}adlı müşteri kalıcı olarak silinecek.{'\n'}Bu işlem geri alınamaz.
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                <Text style={styles.modalBtnCancelText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtnDelete, deleting && { opacity: 0.7 }]}
                onPress={doDelete}
                disabled={deleting}
              >
                {deleting
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.modalBtnDeleteText}>Evet, Sil</Text>
                }
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
    backgroundColor: colors.ink,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 22,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: { color: '#fff', fontSize: 16 },
  editBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
  },
  editBtnText: { color: '#fff', fontFamily: 'Nunito_700Bold', fontSize: 13 },
  deleteBtn: {
    backgroundColor: 'rgba(255,100,100,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
  },
  deleteBtnText: { color: '#FF7070', fontFamily: 'Nunito_700Bold', fontSize: 13 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: 'Nunito_800ExtraBold', fontSize: 18 },
  customerName: { fontFamily: 'Nunito_900Black', fontSize: 20, color: '#fff' },
  customerPhone: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: 'PlusJakartaSans_400Regular', marginTop: 2 },
  customerAddress: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'PlusJakartaSans_400Regular', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statChip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  statVal: { fontFamily: 'Nunito_900Black', fontSize: 17 },
  statLbl: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontFamily: 'PlusJakartaSans_600SemiBold', marginTop: 2 },

  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 18,
    marginTop: 12,
    marginBottom: 4,
  },
  actionBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  actionIcon: { fontSize: 18 },
  actionLabel: { fontSize: 10, fontFamily: 'Nunito_700Bold', color: colors.ink2, marginTop: 2 },

  section: {
    marginHorizontal: 18,
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.muted,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  emptyWrap: { alignItems: 'center', paddingVertical: 24 },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyTitle: { fontFamily: 'Nunito_800ExtraBold', fontSize: 14, color: colors.ink, marginBottom: 4 },
  emptySub: { fontSize: 12, color: colors.muted, fontFamily: 'PlusJakartaSans_400Regular', textAlign: 'center' },

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

  // Silme Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalIcon: { fontSize: 28 },
  modalTitle: {
    fontFamily: 'Nunito_900Black',
    fontSize: 20,
    color: colors.ink,
    marginBottom: 10,
  },
  modalDesc: {
    fontSize: 14,
    color: colors.muted,
    fontFamily: 'PlusJakartaSans_400Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modalBtnCancelText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: colors.ink,
  },
  modalBtnDelete: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#E84040',
    alignItems: 'center',
  },
  modalBtnDeleteText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: '#fff',
  },
  modalBtnSave: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.orange,
    alignItems: 'center',
  },
  modalBtnSaveText: { fontFamily: 'Nunito_800ExtraBold', fontSize: 15, color: '#fff' },
  editErrorBox: {
    backgroundColor: '#FEF0F0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FCCACA',
  },
  editErrorText: { color: '#E84040', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 },
  editLabel: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: colors.muted,
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 10,
  },
  editInput: {
    backgroundColor: colors.bg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: colors.ink,
  },
  editInputFilled: { borderColor: colors.orange, backgroundColor: colors.orangeLight },
});

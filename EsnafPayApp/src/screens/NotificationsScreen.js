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
import { notificationApi } from '../api/client';

function getInitials(name = '') {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 1) return 'Az önce';
  if (diff < 60) return `${diff} dk önce`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h} saat önce`;
  return `${Math.floor(h / 24)} gün önce`;
}

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getPending();
      setNotifications(res.data);
    } catch {
      // sessiz
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchNotifications(); }, [fetchNotifications]));

  const handleApprove = async (id) => {
    setActionId(id);
    try {
      await notificationApi.approve(id);
      await fetchNotifications();
    } catch {
      // sessiz
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    setActionId(id);
    try {
      await notificationApi.reject(id);
      await fetchNotifications();
    } catch {
      // sessiz
    } finally {
      setActionId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ödeme Bildirimleri</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator color={colors.orange} style={{ marginTop: 60 }} />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>Bekleyen bildirim yok</Text>
            <Text style={styles.emptySub}>
              Müşterileriniz ödeme yaptığında burada görünecek.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                🔔 {notifications.length} ödeme bildirimi onayınızı bekliyor
              </Text>
            </View>
            {notifications.map(n => {
              const name = n.customer?.name || 'Müşteri';
              const isActing = actionId === n._id;
              return (
                <View key={n._id} style={styles.notifCard}>
                  <View style={styles.notifHeader}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{getInitials(name)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.notifName}>{name}</Text>
                      <Text style={styles.notifTime}>{timeAgo(n.createdAt)}</Text>
                    </View>
                    <Text style={styles.notifAmount}>
                      ₺{n.amount.toLocaleString('tr-TR')}
                    </Text>
                  </View>

                  {n.message ? (
                    <View style={styles.msgBubble}>
                      <Text style={styles.msgText}>"{n.message}"</Text>
                    </View>
                  ) : null}

                  {n.debt && (
                    <Text style={styles.debtRef}>
                      📋 {n.debt.description || 'Borç'} · ₺{n.debt.amount.toLocaleString('tr-TR')}
                    </Text>
                  )}

                  <View style={styles.btnRow}>
                    <TouchableOpacity
                      style={[styles.approveBtn, isActing && { opacity: 0.6 }]}
                      onPress={() => handleApprove(n._id)}
                      disabled={!!actionId}
                    >
                      {isActing
                        ? <ActivityIndicator size="small" color="#fff" />
                        : <Text style={styles.approveBtnText}>✓ Onayla</Text>
                      }
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.rejectBtn, isActing && { opacity: 0.6 }]}
                      onPress={() => handleReject(n._id)}
                      disabled={!!actionId}
                    >
                      <Text style={styles.rejectBtnText}>✗ Reddet</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </>
        )}
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
  backBtn: { width: 34 },
  backText: { fontSize: 20, color: colors.ink },
  headerTitle: { fontFamily: 'Nunito_900Black', fontSize: 17, color: colors.ink },
  content: { padding: 18 },
  emptyWrap: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 14 },
  emptyTitle: { fontFamily: 'Nunito_800ExtraBold', fontSize: 17, color: colors.ink, marginBottom: 8 },
  emptySub: {
    fontSize: 13, color: colors.muted,
    fontFamily: 'PlusJakartaSans_400Regular',
    textAlign: 'center', lineHeight: 20, paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: colors.yellowLight,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  infoText: { fontSize: 13, color: colors.ink, fontFamily: 'PlusJakartaSans_600SemiBold' },
  notifCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  notifHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.tealLight,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: 'Nunito_800ExtraBold', fontSize: 15, color: colors.teal },
  notifName: { fontFamily: 'Nunito_800ExtraBold', fontSize: 14, color: colors.ink },
  notifTime: { fontSize: 11, color: colors.muted, fontFamily: 'PlusJakartaSans_400Regular', marginTop: 1 },
  notifAmount: { fontFamily: 'Nunito_900Black', fontSize: 17, color: colors.green },
  msgBubble: {
    backgroundColor: colors.bg,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  msgText: { fontSize: 13, color: colors.ink2, fontFamily: 'PlusJakartaSans_400Regular', lineHeight: 18 },
  debtRef: { fontSize: 11, color: colors.muted, fontFamily: 'PlusJakartaSans_600SemiBold', marginBottom: 10 },
  btnRow: { flexDirection: 'row', gap: 8 },
  approveBtn: {
    flex: 1, backgroundColor: colors.teal,
    borderRadius: 12, paddingVertical: 10,
    alignItems: 'center',
  },
  approveBtnText: { color: '#fff', fontFamily: 'Nunito_800ExtraBold', fontSize: 13 },
  rejectBtn: {
    flex: 1, borderWidth: 1.5,
    borderColor: colors.red,
    borderRadius: 12, paddingVertical: 10,
    alignItems: 'center',
  },
  rejectBtnText: { color: colors.red, fontFamily: 'Nunito_800ExtraBold', fontSize: 13 },
});

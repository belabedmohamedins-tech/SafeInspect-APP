// app/screens/notifications.tsx — Notification Centre
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { NotificationRepository } from '../../src/repositories/NotificationRepository';
import { NotificationItem, NotificationType } from '../../src/types';

// ── Helpers ────────────────────────────────────────────────────────────────
function dayLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((today.getTime() - itemDay.getTime()) / 86400000);
  if (diff === 0) return 'اليوم';
  if (diff === 1) return 'أمس';
  return 'أقدم';
}

function typeIcon(type: NotificationType): string {
  switch (type) {
    case 'CAP_DEADLINE':   return '⚠️';
    case 'AGENDA_REMINDER': return '📅';
    case 'APPROVAL_ACTION': return '✅';
    case 'FOLLOW_UP':      return '🔄';
    default:               return '🔔';
  }
}

function typeColor(type: NotificationType): string {
  switch (type) {
    case 'CAP_DEADLINE':   return '#c0392b';
    case 'AGENDA_REMINDER': return '#2980b9';
    case 'APPROVAL_ACTION': return '#27ae60';
    case 'FOLLOW_UP':      return '#8e44ad';
    default:               return '#7f8c8d';
  }
}

interface Section {
  label: string;
  data: NotificationItem[];
}

function groupByDay(items: NotificationItem[]): Section[] {
  const map: Record<string, NotificationItem[]> = {};
  for (const item of items) {
    const label = dayLabel(item.createdAt);
    if (!map[label]) map[label] = [];
    map[label].push(item);
  }
  const order = ['اليوم', 'أمس', 'أقدم'];
  return order.filter(l => map[l]).map(l => ({ label: l, data: map[l] }));
}

// ── Component ─────────────────────────────────────────────────────────────
export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const all = await NotificationRepository.getAll();
    setNotifications(all.filter(n => !n.dismissed));
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleMarkAllRead = async () => {
    await NotificationRepository.markAllRead();
    load();
  };

  const handleDismiss = async (id: string) => {
    await NotificationRepository.dismiss(id);
    load();
  };

  const handleTap = async (item: NotificationItem) => {
    if (!item.readAt) {
      await NotificationRepository.markRead(item.id);
      load();
    }
    if (item.link?.screen) {
      router.push(item.link.screen as any);
    }
  };

  const handleClearAll = () => {
    Alert.alert('مسح الإشعارات', 'هل تريد مسح جميع الإشعارات؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'مسح', style: 'destructive', onPress: async () => {
          await NotificationRepository.clear();
          load();
        },
      },
    ]);
  };

  const sections = groupByDay(notifications);
  const unreadCount = notifications.filter(n => !n.readAt).length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2c7a4b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإشعارات</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={handleMarkAllRead} disabled={unreadCount === 0}>
          <Text style={[styles.toolbarBtn, unreadCount === 0 && styles.toolbarBtnDisabled]}>
            تعليم الكل مقروءاً
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleClearAll} disabled={notifications.length === 0}>
          <Text style={[styles.toolbarBtnDanger, notifications.length === 0 && styles.toolbarBtnDisabled]}>
            مسح الكل
          </Text>
        </TouchableOpacity>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyText}>لا توجد إشعارات</Text>
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={s => s.label}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item: section }) => (
            <View>
              <Text style={styles.sectionLabel}>{section.label}</Text>
              {section.data.map(notif => (
                <TouchableOpacity
                  key={notif.id}
                  style={[styles.card, !notif.readAt && styles.cardUnread]}
                  onPress={() => handleTap(notif)}
                  onLongPress={() =>
                    Alert.alert('تجاهل الإشعار', notif.title, [
                      { text: 'إلغاء', style: 'cancel' },
                      { text: 'تجاهل', style: 'destructive', onPress: () => handleDismiss(notif.id) },
                    ])
                  }
                >
                  <View style={[styles.typeStripe, { backgroundColor: typeColor(notif.type) }]} />
                  <View style={styles.cardBody}>
                    <View style={styles.cardRow}>
                      <Text style={styles.typeIcon}>{typeIcon(notif.type)}</Text>
                      <Text style={styles.cardTitle} numberOfLines={1}>{notif.title}</Text>
                      {!notif.readAt && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.cardBody2} numberOfLines={2}>{notif.body}</Text>
                    <Text style={styles.cardTime}>
                      {new Date(notif.createdAt).toLocaleTimeString('ar-DZ', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#f0f4f0' },
  center:     { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2c7a4b',
                paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14, gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff', flex: 1, textAlign: 'right' },
  badge:      { backgroundColor: '#e74c3c', borderRadius: 10, minWidth: 20, height: 20,
                alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  badgeText:  { color: '#fff', fontSize: 11, fontWeight: '700' },
  toolbar:    { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16,
                paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1,
                borderBottomColor: '#e0e0e0' },
  toolbarBtn: { fontSize: 13, color: '#2c7a4b', fontWeight: '600' },
  toolbarBtnDanger: { fontSize: 13, color: '#c0392b', fontWeight: '600' },
  toolbarBtnDisabled: { opacity: 0.35 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#7f8c8d', paddingHorizontal: 16,
                  paddingTop: 16, paddingBottom: 6, textAlign: 'right' },
  card:       { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 12,
                marginBottom: 8, borderRadius: 10, overflow: 'hidden',
                shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  cardUnread: { backgroundColor: '#eaf6ef' },
  typeStripe: { width: 4 },
  cardBody:   { flex: 1, padding: 12 },
  cardRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  typeIcon:   { fontSize: 16 },
  cardTitle:  { flex: 1, fontSize: 14, fontWeight: '700', color: '#1a1a2e', textAlign: 'right' },
  unreadDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2c7a4b' },
  cardBody2:  { fontSize: 13, color: '#555', textAlign: 'right', lineHeight: 18 },
  cardTime:   { fontSize: 11, color: '#aaa', textAlign: 'right', marginTop: 4 },
  empty:      { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyIcon:  { fontSize: 48 },
  emptyText:  { fontSize: 16, color: '#95a5a6' },
});

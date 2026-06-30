// app/(tabs)/cap.tsx
// Phase-4 — Corrective Action Plan (CAP) list screen.
//
// Tabs: all | open (+ in-progress + overdue) | overdue | resolved
// Each row shows: facility name, criteria excerpt, severity chip,
// status badge, deadline (red when overdue).
// FAB bottom-right: schedule push notifications for all open items.
// Header-right: export PDF via CapReportService.

import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../../constants';
import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';
import { CapNotificationService } from '../../src/services/CapNotificationService';
import { CapReportService } from '../../src/services/CapReportService';
import { CorrectiveAction } from '../../src/types';

// ─── constants ────────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'open' | 'overdue' | 'resolved';

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',      label: 'الكل'    },
  { key: 'open',     label: 'مفتوح'   },
  { key: 'overdue',  label: 'متأخر'   },
  { key: 'resolved', label: 'مغلق'    },
];

const STATUS_LABEL: Record<CorrectiveAction['status'], string> = {
  open:          'مفتوح',
  'in-progress': 'جارٍ',
  resolved:      'مغلق',
  overdue:       'متأخر',
};

const STATUS_COLOR: Record<CorrectiveAction['status'], string> = {
  open:          '#f39c12',
  'in-progress': '#2980b9',
  resolved:      '#27ae60',
  overdue:       '#e74c3c',
};

const SEVERITY_COLOR: Record<CorrectiveAction['severity'], string> = {
  low:      '#27ae60',
  medium:   '#f39c12',
  high:     '#e74c3c',
  critical: '#8e44ad',
};

const SEVERITY_LABEL: Record<CorrectiveAction['severity'], string> = {
  low:      'منخفض',
  medium:   'متوسط',
  high:     'عالٍ',
  critical: 'حرج',
};

function isOverdueDate(deadline: string): boolean {
  return deadline < new Date().toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ar-DZ', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch { return iso; }
}

// ─── component ────────────────────────────────────────────────────────────────

export default function CapScreen() {
  const router = useRouter();
  const [items,  setItems]  = useState<CorrectiveAction[]>([]);
  const [filter, setFilter] = useState<FilterTab>('open');
  const [loading, setLoading] = useState(true);

  // Refresh list whenever tab is focused
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        const all = await CorrectiveActionRepository.getAll();
        if (!cancelled) {
          setItems(all);
          setLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }, []),
  );

  const filtered = items.filter(item => {
    if (filter === 'all')      return true;
    if (filter === 'open')     return item.status === 'open' || item.status === 'in-progress' || item.status === 'overdue';
    if (filter === 'overdue')  return item.status === 'overdue';
    if (filter === 'resolved') return item.status === 'resolved';
    return true;
  });

  const overdueCount = items.filter(i => i.status === 'overdue').length;

  // Quick resolve action (from list — no detail navigation required)
  const handleResolve = (id: string) => {
    Alert.alert('إغلاق الإجراء', 'تأكيد إغلاق هذا الإجراء التصحيحي؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'إغلاق', style: 'default',
        onPress: async () => {
          await CorrectiveActionRepository.updateStatus(id, 'resolved');
          setItems(prev => prev.map(i =>
            i.id === id ? { ...i, status: 'resolved', closedAt: new Date().toISOString() } : i,
          ));
        },
      },
    ]);
  };

  const handleDelete = (id: string) => {
    Alert.alert('حذف الإجراء', 'هل أنت متأكد من حذف هذا الإجراء التصحيحي؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive',
        onPress: async () => {
          await CorrectiveActionRepository.delete(id);
          setItems(prev => prev.filter(i => i.id !== id));
        },
      },
    ]);
  };

  const handleScheduleNotifications = async () => {
    try {
      await CapNotificationService.scheduleAll();
      Alert.alert('تم', 'تم جدولة الإشعارات للإجراءات المفتوحة.');
    } catch {
      Alert.alert('خطأ', 'تعذّر جدولة الإشعارات.');
    }
  };

  const renderItem = ({ item }: { item: CorrectiveAction }) => {
    const overdue = item.status === 'overdue' || (item.status !== 'resolved' && isOverdueDate(item.deadline));
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => router.push({ pathname: '/cap/[id]', params: { id: item.id } })}
      >
        {/* severity stripe */}
        <View style={[styles.stripe, { backgroundColor: SEVERITY_COLOR[item.severity] }]} />

        <View style={styles.cardBody}>
          {/* top row */}
          <View style={styles.cardRow}>
            <Text style={styles.facilityName} numberOfLines={1}>{item.facilityName}</Text>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] }]}>
              <Text style={styles.statusText}>{STATUS_LABEL[item.status]}</Text>
            </View>
          </View>

          {/* criteria */}
          <Text style={styles.criteria} numberOfLines={2}>{item.criteria}</Text>

          {/* bottom row */}
          <View style={styles.cardRow}>
            <View style={[styles.severityChip, { borderColor: SEVERITY_COLOR[item.severity] }]}>
              <Text style={[styles.severityText, { color: SEVERITY_COLOR[item.severity] }]}>
                {SEVERITY_LABEL[item.severity]}
              </Text>
            </View>
            <Text style={[styles.deadline, overdue && styles.deadlineOverdue]}>
              <FontAwesome name="calendar" size={11} /> {formatDate(item.deadline)}
            </Text>
          </View>

          {item.assignedTo ? (
            <Text style={styles.assigned}>
              <FontAwesome name="user" size={11} /> {item.assignedTo}
            </Text>
          ) : null}
        </View>

        {/* quick actions */}
        {item.status !== 'resolved' && (
          <TouchableOpacity style={styles.quickAction} onPress={() => handleResolve(item.id)}>
            <FontAwesome name="check" size={16} color={Colors.success ?? '#27ae60'} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.quickAction} onPress={() => handleDelete(item.id)}>
          <FontAwesome name="trash" size={16} color={Colors.danger ?? '#e74c3c'} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.empty}>
      <FontAwesome name="check-circle" size={48} color={Colors.textTertiary ?? '#bdc3c7'} style={{ marginBottom: Spacing.md }} />
      <Text style={styles.emptyTitle}>
        {filter === 'resolved'
          ? 'لا توجد إجراءات مغلقة'
          : filter === 'overdue'
          ? 'لا توجد إجراءات متأخرة'
          : 'لا توجد إجراءات مفتوحة'}
      </Text>
      <Text style={styles.emptyBody}>ستظهر الإجراءات التصحيحية هنا عند اكتمال التفتيش.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {/* ── Header summary strip ── */}
      {overdueCount > 0 && (
        <View style={styles.overdueStrip}>
          <FontAwesome name="exclamation-triangle" size={14} color="#fff" />
          <Text style={styles.overdueStripText}>
            {overdueCount} إجراء{overdueCount === 1 ? '' : 'ات'} متأخرة — يتطلب اتخاذ إجراء فوري
          </Text>
        </View>
      )}

      {/* ── Filter tabs ── */}
      <View style={styles.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, filter === tab.key && styles.tabActive]}
            onPress={() => setFilter(tab.key)}
          >
            <Text style={[styles.tabLabel, filter === tab.key && styles.tabLabelActive]}>
              {tab.label}
              {tab.key === 'overdue' && overdueCount > 0
                ? ` (${overdueCount})`
                : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── List ── */}
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={<EmptyState />}
        refreshing={loading}
        onRefresh={async () => {
          setLoading(true);
          const all = await CorrectiveActionRepository.getAll();
          setItems(all);
          setLoading(false);
        }}
      />

      {/* ── Actions row ── */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.exportBtn}
          onPress={() => CapReportService.export('open')}
        >
          <FontAwesome name="file-pdf-o" size={16} color="#fff" />
          <Text style={styles.exportBtnText}>تصدير PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.notifyBtn}
          onPress={handleScheduleNotifications}
        >
          <FontAwesome name="bell" size={16} color="#fff" />
          <Text style={styles.exportBtnText}>جدولة الإشعارات</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:         { flex: 1, backgroundColor: Colors.background },
  overdueStrip:     { backgroundColor: '#e74c3c', flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, gap: Spacing.sm },
  overdueStripText: { color: '#fff', fontSize: FontSize.sm, fontWeight: '600', flex: 1 },
  tabRow:           { flexDirection: 'row', backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab:              { flex: 1, paddingVertical: Spacing.sm + 2, alignItems: 'center' },
  tabActive:        { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabLabel:         { fontSize: FontSize.sm, color: Colors.textSecondary },
  tabLabelActive:   { color: Colors.primary, fontWeight: '700' },
  list:             { padding: Spacing.sm },
  emptyContainer:   { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  empty:            { alignItems: 'center' },
  emptyTitle:       { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm, textAlign: 'center' },
  emptyBody:        { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', maxWidth: 260 },
  card:             { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.md, marginBottom: Spacing.sm, overflow: 'hidden', ...Shadow.sm },
  stripe:           { width: 5 },
  cardBody:         { flex: 1, padding: Spacing.md, gap: 4 },
  cardRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  facilityName:     { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, flex: 1, marginEnd: Spacing.sm },
  criteria:         { fontSize: FontSize.sm + 1, color: Colors.textSecondary, lineHeight: 20 },
  statusBadge:      { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.sm },
  statusText:       { color: '#fff', fontSize: FontSize.xs + 1, fontWeight: '700' },
  severityChip:     { borderWidth: 1, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 1 },
  severityText:     { fontSize: FontSize.xs + 1, fontWeight: '600' },
  deadline:         { fontSize: FontSize.xs + 1, color: Colors.textTertiary },
  deadlineOverdue:  { color: '#e74c3c', fontWeight: '700' },
  assigned:         { fontSize: FontSize.xs + 1, color: Colors.textSecondary },
  quickAction:      { justifyContent: 'center', paddingHorizontal: Spacing.md },
  actionsRow:       { flexDirection: 'row', padding: Spacing.md, gap: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface },
  exportBtn:        { flex: 1, flexDirection: 'row', backgroundColor: '#e74c3c', borderRadius: Radius.md, paddingVertical: Spacing.sm + 2, justifyContent: 'center', alignItems: 'center', gap: Spacing.sm },
  notifyBtn:        { flex: 1, flexDirection: 'row', backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: Spacing.sm + 2, justifyContent: 'center', alignItems: 'center', gap: Spacing.sm },
  exportBtnText:    { color: '#fff', fontSize: FontSize.sm, fontWeight: '700' },
});

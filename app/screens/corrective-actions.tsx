// app/screens/corrective-actions.tsx
// Phase-12 + Phase-17: Corrective Action Tracker
// Phase-17: header overdue badge uses getStats() instead of re-filtering actions list
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants';
import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';
import { CorrectiveAction, Severity } from '../../src/types';

// ── Status meta ──────────────────────────────────────────────────────────────────
type ActionStatus = CorrectiveAction['status'];

const STATUS_META: Record<ActionStatus, { label: string; bg: string; fg: string; next?: ActionStatus }> = {
  open:          { label: 'مفتوح',    bg: '#e3f2fd', fg: '#1565c0', next: 'in-progress' },
  'in-progress': { label: 'جارٍ',      bg: '#fff9c4', fg: '#f57f17', next: 'resolved'    },
  resolved:      { label: 'محلول',    bg: '#e8f5e9', fg: '#2e7d32', next: undefined     },
  overdue:       { label: 'متأخر ⚠', bg: '#ffebee', fg: '#c62828', next: 'in-progress' },
};

const SEVERITY_COLOR: Record<Severity, string> = {
  high: '#c62828', medium: '#e65100', low: '#2e7d32',
};
const SEVERITY_LABEL: Record<Severity, string> = {
  high: 'خطير', medium: 'متوسط', low: 'بسيط',
};

// ── Filter tabs ───────────────────────────────────────────────────────────────────
type FilterTab = 'all' | 'open' | 'overdue' | 'resolved';
const FILTER_LABELS: Record<FilterTab, string> = {
  all: 'الكل', open: 'مفتوح', overdue: '⚠ متأخر', resolved: 'محلول',
};

// ── Relative date helper ──────────────────────────────────────────────────────────
function relativeDeadline(isoDate: string): { text: string; urgent: boolean } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(isoDate);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86_400_000);
  if (diff < 0)   return { text: `متأخر ${Math.abs(diff)} يوم`, urgent: true };
  if (diff === 0) return { text: 'اليوم آخر موعد', urgent: true };
  if (diff <= 3)  return { text: `${diff} أيام متبقية`, urgent: true };
  return {
    text: new Date(isoDate).toLocaleDateString('ar-DZ', {
      day: 'numeric', month: 'short', year: 'numeric',
    }),
    urgent: false,
  };
}

// ── Card ────────────────────────────────────────────────────────────────────────────────
function ActionCard({
  action, onStatusCycle, onDelete,
}: {
  action: CorrectiveAction;
  onStatusCycle: (id: string, next: ActionStatus) => void;
  onDelete: (id: string) => void;
}) {
  const statusMeta = STATUS_META[action.status];
  const nextStatus = statusMeta.next;
  const dl         = relativeDeadline(action.deadline);
  const sev        = (action.severity ?? 'medium') as Severity;

  const renderRight = () => (
    <TouchableOpacity style={cardStyles.deleteBtn} onPress={() => onDelete(action.id)}>
      <FontAwesome name="trash" size={20} color="#fff" />
      <Text style={cardStyles.deleteBtnText}>حذف</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable renderRightActions={renderRight}>
      <View style={cardStyles.card}>
        <View style={cardStyles.topRow}>
          <Text style={cardStyles.facility} numberOfLines={1}>{action.facilityName}</Text>
          <View style={[cardStyles.sevChip, { backgroundColor: SEVERITY_COLOR[sev] + '22' }]}>
            <Text style={[cardStyles.sevText, { color: SEVERITY_COLOR[sev] }]}>
              {SEVERITY_LABEL[sev]}
            </Text>
          </View>
        </View>

        <Text style={cardStyles.criteria} numberOfLines={2}>{action.criteria}</Text>

        {!!action.notes && (
          <Text style={cardStyles.notes} numberOfLines={1}>{action.notes}</Text>
        )}

        <View style={cardStyles.bottomRow}>
          <View style={[cardStyles.dlBadge, dl.urgent && cardStyles.dlBadgeUrgent]}>
            <FontAwesome name="clock-o" size={11} color={dl.urgent ? '#c62828' : '#555'} />
            <Text style={[cardStyles.dlText, dl.urgent && cardStyles.dlTextUrgent]}>
              {dl.text}
            </Text>
          </View>

          <TouchableOpacity
            style={[cardStyles.statusChip, { backgroundColor: statusMeta.bg }]}
            onPress={() => nextStatus && onStatusCycle(action.id, nextStatus)}
            disabled={!nextStatus}
            accessibilityLabel={
              nextStatus
                ? `تغيير الحالة إلى ${STATUS_META[nextStatus].label}`
                : 'مغلق'
            }
          >
            <Text style={[cardStyles.statusText, { color: statusMeta.fg }]}>
              {statusMeta.label}
            </Text>
            {nextStatus && (
              <FontAwesome
                name="angle-left" size={11}
                color={statusMeta.fg}
                style={{ marginTop: 1 }}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Swipeable>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14,
    marginBottom: 10, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 2,
  },
  topRow:        { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 8 },
  facility:      { flex: 1, fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
  sevChip:       { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  sevText:       { fontSize: 11, fontWeight: '700' },
  criteria:      { fontSize: 13, color: '#444', lineHeight: 18, marginBottom: 4 },
  notes:         { fontSize: 11, color: '#888', marginBottom: 6 },
  bottomRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  dlBadge:       { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: '#f5f5f5' },
  dlBadgeUrgent: { backgroundColor: '#ffebee' },
  dlText:        { fontSize: 11, color: '#555' },
  dlTextUrgent:  { color: '#c62828', fontWeight: '700' },
  statusChip:    { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText:    { fontSize: 12, fontWeight: '700' },
  deleteBtn:     { backgroundColor: Colors.red, justifyContent: 'center', alignItems: 'center', width: 72, borderRadius: 10, marginBottom: 10 },
  deleteBtnText: { color: '#fff', fontSize: 11, marginTop: 4 },
});

// ── Screen ──────────────────────────────────────────────────────────────────────────────
export default function CorrectiveActionsScreen() {
  const [actions,      setActions]      = useState<CorrectiveAction[]>([]);
  const [search,       setSearch]       = useState('');
  const [filterTab,    setFilterTab]    = useState<FilterTab>('all');
  // Phase-17: dedicated overdue count from getStats() — accurate from first render
  const [overdueCount, setOverdueCount] = useState(0);

  const load = useCallback(async () => {
    try {
      const [all, stats] = await Promise.all([
        CorrectiveActionRepository.getAll(),
        CorrectiveActionRepository.getStats(),
      ]);
      // Newest first
      setActions([...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setOverdueCount(stats.overdue);
    } catch (e) {
      console.error('Failed to load corrective actions', e);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleStatusCycle = async (id: string, next: ActionStatus) => {
    try {
      await CorrectiveActionRepository.updateStatus(id, next);
      await load();
    } catch {
      Alert.alert('خطأ', 'تعذّر تحديث الحالة');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('حذف المهمة', 'هل أنت متأكد من حذف هذه المهمة؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive',
        onPress: async () => {
          await CorrectiveActionRepository.delete(id);
          await load();
        },
      },
    ]);
  };

  // Derive filtered list only — overdueCount comes from getStats() above
  const displayed = useMemo(() => {
    let list = actions;
    if (filterTab === 'open')     list = actions.filter(a => a.status === 'open' || a.status === 'in-progress');
    if (filterTab === 'overdue')  list = actions.filter(a => a.status === 'overdue');
    if (filterTab === 'resolved') list = actions.filter(a => a.status === 'resolved');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.facilityName.toLowerCase().includes(q) ||
        a.criteria.toLowerCase().includes(q),
      );
    }
    return list;
  }, [actions, filterTab, search]);

  return (
    <SafeAreaView style={screenStyles.safeArea}>
      {/* Header */}
      <View style={screenStyles.headerRow}>
        <Text style={screenStyles.title}>الإجراءات التصحيحية</Text>
        {overdueCount > 0 && (
          <View style={screenStyles.overdueBadge}>
            <Text style={screenStyles.overdueBadgeText}>{overdueCount} متأخر</Text>
          </View>
        )}
      </View>

      {/* Search */}
      <TextInput
        style={screenStyles.search}
        placeholder="بحث..."
        placeholderTextColor={Colors.textTertiary}
        value={search}
        onChangeText={setSearch}
        textAlign="right"
      />

      {/* Filter tabs */}
      <View style={screenStyles.tabRow}>
        {(Object.keys(FILTER_LABELS) as FilterTab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              screenStyles.tab,
              filterTab === tab && (
                tab === 'overdue' ? screenStyles.tabActiveOverdue : screenStyles.tabActive
              ),
            ]}
            onPress={() => setFilterTab(tab)}
          >
            <Text style={[
              screenStyles.tabText,
              filterTab === tab && screenStyles.tabTextActive,
            ]}>
              {FILTER_LABELS[tab]}
              {tab === 'overdue' && overdueCount > 0 ? ` (${overdueCount})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={displayed}
        keyExtractor={a => a.id}
        renderItem={({ item }) => (
          <ActionCard
            action={item}
            onStatusCycle={handleStatusCycle}
            onDelete={handleDelete}
          />
        )}
        contentContainerStyle={screenStyles.list}
        ListEmptyComponent={
          <View style={screenStyles.empty}>
            <FontAwesome name="check-square-o" size={48} color={Colors.light ?? '#ccc'} />
            <Text style={screenStyles.emptyText}>لا توجد مهام</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const screenStyles = StyleSheet.create({
  safeArea:         { flex: 1, backgroundColor: Colors.background },
  headerRow:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 8, paddingBottom: 4, gap: 8 },
  title:            { fontSize: 18, fontWeight: '800', color: Colors.dark, flex: 1, textAlign: 'right' },
  overdueBadge:     { backgroundColor: '#ffebee', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  overdueBadgeText: { fontSize: 12, fontWeight: '700', color: '#c62828' },
  search: {
    margin: 10, padding: 10,
    backgroundColor: Colors.white, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.border,
    textAlign: 'right', color: Colors.dark,
  },
  tabRow:           { flexDirection: 'row', paddingHorizontal: 10, marginBottom: 8, gap: 8, flexWrap: 'wrap' },
  tab:              { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: Colors.background },
  tabActive:        { backgroundColor: Colors.blue },
  tabActiveOverdue: { backgroundColor: '#c62828' },
  tabText:          { fontSize: 13, color: Colors.mid },
  tabTextActive:    { color: Colors.white, fontWeight: '700' },
  list:             { padding: 10 },
  empty:            { alignItems: 'center', padding: 40, gap: 12 },
  emptyText:        { fontSize: 16, color: Colors.mid },
});

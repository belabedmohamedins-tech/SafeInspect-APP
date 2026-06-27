// app/screens/cap.tsx
// Corrective Action Plan — full list with filter, status update & delete
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants';
import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';
import { CorrectiveAction } from '../../src/types';

type StatusFilter = 'all' | CorrectiveAction['status'];

const STATUS_LABELS: Record<CorrectiveAction['status'], string> = {
  open:        'مفتوح',
  'in-progress': 'جارٍ',
  resolved:    'محلول',
  overdue:     'متأخر',
};

const SEVERITY_COLORS: Record<CorrectiveAction['severity'], string> = {
  low:      Colors.success,
  medium:   Colors.warning,
  high:     Colors.danger,
  critical: '#8e44ad',
};

const SEVERITY_LABELS: Record<CorrectiveAction['severity'], string> = {
  low:      'منخفض',
  medium:   'متوسط',
  high:     'عالٍ',
  critical: 'حرج',
};

const STATUS_CHIP_COLOR: Record<CorrectiveAction['status'], string> = {
  open:        Colors.primary,
  'in-progress': Colors.warning,
  resolved:    Colors.success,
  overdue:     Colors.danger,
};

const FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'الكل',    value: 'all' },
  { label: 'مفتوح',  value: 'open' },
  { label: 'جارٍ',   value: 'in-progress' },
  { label: 'متأخر',  value: 'overdue' },
  { label: 'محلول',  value: 'resolved' },
];

const NEW_STATUSES: CorrectiveAction['status'][] = ['open', 'in-progress', 'resolved'];

export default function CAPScreen() {
  const router = useRouter();
  const [items, setItems]       = useState<CorrectiveAction[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<StatusFilter>('all');
  const [selected, setSelected] = useState<CorrectiveAction | null>(null);
  const repo = CorrectiveActionRepository;

  const load = useCallback(async () => {
    setLoading(true);
    const all = await repo.getAll();
    setItems(all);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const visible = filter === 'all' ? items : items.filter(i => i.status === filter);

  const handleUpdateStatus = async (newStatus: CorrectiveAction['status']) => {
    if (!selected) return;
    await repo.updateStatus(selected.id, newStatus);
    setSelected(null);
    load();
  };

  const handleDelete = (item: CorrectiveAction) => {
    Alert.alert(
      'حذف الإجراء',
      `هل تريد حذف الإجراء الخاص بـ "${item.facilityName}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف', style: 'destructive',
          onPress: async () => { await repo.delete(item.id); load(); },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: CorrectiveAction }) => {
    const isOverdue = item.status === 'overdue';
    return (
      <TouchableOpacity
        style={[styles.card, isOverdue && styles.cardOverdue]}
        onPress={() => setSelected(item)}
        onLongPress={() => handleDelete(item)}
        activeOpacity={0.75}
      >
        {/* Header row */}
        <View style={styles.cardHeader}>
          <View style={[styles.severityPill, { backgroundColor: SEVERITY_COLORS[item.severity] }]}>
            <Text style={styles.severityText}>{SEVERITY_LABELS[item.severity]}</Text>
          </View>
          <View style={[styles.statusChip, { backgroundColor: STATUS_CHIP_COLOR[item.status] + '22', borderColor: STATUS_CHIP_COLOR[item.status] }]}>
            <Text style={[styles.statusChipText, { color: STATUS_CHIP_COLOR[item.status] }]}>
              {STATUS_LABELS[item.status]}
            </Text>
          </View>
        </View>

        {/* Criteria */}
        <Text style={styles.criteria} numberOfLines={2}>{item.criteria}</Text>

        {/* Facility + deadline */}
        <View style={styles.cardMeta}>
          <FontAwesome name="building" size={12} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{item.facilityName}</Text>
        </View>
        {item.assignedTo ? (
          <View style={styles.cardMeta}>
            <FontAwesome name="user" size={12} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{item.assignedTo}</Text>
          </View>
        ) : null}
        <View style={styles.cardMeta}>
          <FontAwesome name="calendar" size={12} color={isOverdue ? Colors.danger : Colors.textSecondary} />
          <Text style={[styles.metaText, isOverdue && { color: Colors.danger, fontWeight: FontWeight.semibold }]}>
            الموعد النهائي: {new Date(item.deadline).toLocaleDateString('ar-DZ')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="arrow-right" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>خطة الإجراءات التصحيحية</Text>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.filterChipText, filter === f.value && styles.filterChipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Summary bar */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {visible.length} إجراء{visible.length !== 1 ? '' : ''}
          {items.filter(i => i.status === 'overdue').length > 0
            ? `  ·  ${items.filter(i => i.status === 'overdue').length} متأخر`
            : ''}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={Colors.primary} />
      ) : visible.length === 0 ? (
        <View style={styles.empty}>
          <FontAwesome name="check-circle" size={48} color={Colors.success} />
          <Text style={styles.emptyTitle}>لا توجد إجراءات</Text>
          <Text style={styles.emptyText}>لا توجد إجراءات تصحيحية في هذه الفئة.</Text>
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Status update bottom sheet */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setSelected(null)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>تحديث الحالة</Text>
          {selected && (
            <Text style={styles.sheetSub} numberOfLines={2}>{selected.criteria}</Text>
          )}
          {NEW_STATUSES.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.sheetOption, selected?.status === s && styles.sheetOptionActive]}
              onPress={() => handleUpdateStatus(s)}
            >
              <View style={[styles.sheetDot, { backgroundColor: STATUS_CHIP_COLOR[s] }]} />
              <Text style={[styles.sheetOptionText, selected?.status === s && { color: Colors.primary, fontWeight: FontWeight.semibold }]}>
                {STATUS_LABELS[s]}
              </Text>
              {selected?.status === s && <FontAwesome name="check" size={14} color={Colors.primary} />}
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.sheetCancel} onPress={() => setSelected(null)}>
            <Text style={styles.sheetCancelText}>إلغاء</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.background },
  header:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn:     { padding: Spacing.xs },
  title:       { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'right' },

  filterRow:     { maxHeight: 52, backgroundColor: Colors.surface },
  filterContent: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm, flexDirection: 'row' },
  filterChip:    { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full, backgroundColor: Colors.surfaceOffset, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText:   { fontSize: FontSize.sm, color: Colors.textSecondary },
  filterChipTextActive: { color: Colors.textInverse, fontWeight: FontWeight.medium },

  summary:     { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs },
  summaryText: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right' },

  list: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  card:        { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, gap: Spacing.sm, ...Shadow.sm, borderWidth: 1, borderColor: Colors.border },
  cardOverdue: { borderColor: Colors.danger + '66', backgroundColor: '#fff5f5' },
  cardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  severityPill: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
  severityText: { fontSize: FontSize.xs, color: '#fff', fontWeight: FontWeight.semibold },

  statusChip:     { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1 },
  statusChipText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },

  criteria: { fontSize: FontSize.base, color: Colors.textPrimary, fontWeight: FontWeight.medium, textAlign: 'right' },

  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, justifyContent: 'flex-end' },
  metaText: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right' },

  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xxl },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  emptyText:  { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet:   { backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.lg, gap: Spacing.sm, paddingBottom: Spacing.xxl },
  sheetHandle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: Radius.full, alignSelf: 'center', marginBottom: Spacing.sm },
  sheetTitle:  { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'right' },
  sheetSub:    { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right' },
  sheetOption: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm, borderRadius: Radius.md },
  sheetOptionActive: { backgroundColor: Colors.primary + '11' },
  sheetDot:    { width: 10, height: 10, borderRadius: Radius.full },
  sheetOptionText: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary, textAlign: 'right' },
  sheetCancel: { marginTop: Spacing.sm, paddingVertical: Spacing.md, alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.border },
  sheetCancelText: { fontSize: FontSize.base, color: Colors.textSecondary },
});

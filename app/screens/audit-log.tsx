// app/screens/audit-log.tsx
// Audit Log — read-only chronological event log with filter and clear
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants';
import { AuditLogRepository } from '../../src/repositories/AuditLogRepository';
import { AuditAction, AuditLogEntry } from '../../src/types';

type FilterValue = 'all' | AuditAction;

const ACTION_LABELS: Record<AuditAction, string> = {
  INSPECTION_SAVED:       'حفظ تفتيش',
  INSPECTION_DELETED:     'حذف تفتيش',
  INSPECTION_BULK_DELETED:'حذف مجموعة',
  AGENDA_ITEM_SAVED:      'حفظ مهمة',
  AGENDA_ITEM_DELETED:    'حذف مهمة',
  SETTINGS_CHANGED:       'تغيير الإعدادات',
  BACKUP_RESTORED:        'استعادة نسخة احتياطية',
};

const ACTION_ICONS: Record<AuditAction, string> = {
  INSPECTION_SAVED:       'clipboard',
  INSPECTION_DELETED:     'trash',
  INSPECTION_BULK_DELETED:'trash',
  AGENDA_ITEM_SAVED:      'calendar',
  AGENDA_ITEM_DELETED:    'calendar-times-o',
  SETTINGS_CHANGED:       'cog',
  BACKUP_RESTORED:        'database',
};

const ACTION_COLORS: Record<AuditAction, string> = {
  INSPECTION_SAVED:       Colors.success,
  INSPECTION_DELETED:     Colors.danger,
  INSPECTION_BULK_DELETED:Colors.danger,
  AGENDA_ITEM_SAVED:      Colors.primary,
  AGENDA_ITEM_DELETED:    Colors.warning,
  SETTINGS_CHANGED:       Colors.textSecondary,
  BACKUP_RESTORED:        '#8e44ad',
};

const FILTER_OPTIONS: { label: string; value: FilterValue }[] = [
  { label: 'الكل',             value: 'all' },
  { label: 'حفظ تفتيش',        value: 'INSPECTION_SAVED' },
  { label: 'حذف تفتيش',        value: 'INSPECTION_DELETED' },
  { label: 'مهام الجدول',      value: 'AGENDA_ITEM_SAVED' },
  { label: 'الإعدادات',        value: 'SETTINGS_CHANGED' },
  { label: 'نسخ احتياطي',      value: 'BACKUP_RESTORED' },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('ar-DZ', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AuditLogScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<FilterValue>('all');

  const load = useCallback(async () => {
    setLoading(true);
    const all = filter === 'all'
      ? await AuditLogRepository.getAll()
      : await AuditLogRepository.getByAction(filter);
    // newest first
    setEntries([...all].reverse());
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleClear = () => {
    Alert.alert(
      'مسح السجل',
      'هل تريد حذف جميع إدخالات سجل الأحداث؟ لا يمكن التراجع عن هذا.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'مسح', style: 'destructive',
          onPress: async () => {
            await AuditLogRepository.clear();
            load();
          },
        },
      ],
    );
  };

  const visible = entries;

  const renderItem = ({ item, index }: { item: AuditLogEntry; index: number }) => {
    const color = ACTION_COLORS[item.action];
    const icon  = ACTION_ICONS[item.action] as any;
    const isLast = index === visible.length - 1;
    return (
      <View style={styles.entryRow}>
        {/* Timeline line */}
        <View style={styles.timelineCol}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          {!isLast && <View style={styles.line} />}
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: color + '22' }]}>
              <FontAwesome name={icon} size={14} color={color} />
            </View>
            <Text style={styles.actionLabel}>{ACTION_LABELS[item.action]}</Text>
            <Text style={styles.timeText}>{formatDate(item.timestamp)}</Text>
          </View>

          {item.facilityName ? (
            <Text style={styles.detail} numberOfLines={1}>
              <Text style={styles.detailKey}>المنشأة: </Text>{item.facilityName}
            </Text>
          ) : null}

          {item.inspectorName ? (
            <Text style={styles.detail} numberOfLines={1}>
              <Text style={styles.detailKey}>المفتش: </Text>{item.inspectorName}
            </Text>
          ) : null}

          {item.detail ? (
            <Text style={styles.detail} numberOfLines={2}>{item.detail}</Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="arrow-right" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>سجل الأحداث</Text>
        <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
          <FontAwesome name="trash" size={18} color={Colors.danger} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {FILTER_OPTIONS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.filterChipText, filter === f.value && styles.filterChipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>{visible.length} حدث مسجّل</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={Colors.primary} />
      ) : visible.length === 0 ? (
        <View style={styles.empty}>
          <FontAwesome name="list-alt" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>السجل فارغ</Text>
          <Text style={styles.emptyText}>لم يتم تسجيل أي أحداث بعد.</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn:   { padding: Spacing.xs },
  title:     { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'right' },
  clearBtn:  { padding: Spacing.xs },

  filterRow:     { maxHeight: 52, backgroundColor: Colors.surface },
  filterContent: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm, flexDirection: 'row' },
  filterChip:    { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full, backgroundColor: Colors.surfaceOffset, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText:   { fontSize: FontSize.sm, color: Colors.textSecondary },
  filterChipTextActive: { color: Colors.textInverse, fontWeight: FontWeight.medium },

  countRow:  { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs },
  countText: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right' },

  list: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  entryRow:    { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.sm },
  timelineCol: { alignItems: 'center', width: 20 },
  dot:         { width: 12, height: 12, borderRadius: Radius.full, marginTop: Spacing.md },
  line:        { flex: 1, width: 2, backgroundColor: Colors.border, marginTop: 2 },

  card:       { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.xs, ...Shadow.sm, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  iconWrap:   { width: 28, height: 28, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  actionLabel:{ flex: 1, fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textPrimary, textAlign: 'right' },
  timeText:   { fontSize: FontSize.xs, color: Colors.textTertiary, textAlign: 'right' },

  detail:    { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right' },
  detailKey: { fontWeight: FontWeight.semibold, color: Colors.textPrimary },

  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xxl },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  emptyText:  { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center' },
});

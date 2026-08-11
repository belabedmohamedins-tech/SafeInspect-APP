// app/screens/audit-log.tsx
// Audit Log — read-only chronological event log with filter and clear
// W39: added AUDIT_LOG_CLEARED to ACTION_LABELS/ICONS/COLORS;
//      clear() now passes inspector name from settings (falls back to 'مفتش').
// W52/W53: added INSPECTION_DELETE_BLOCKED + SERVER_SYNC_PENDING to all three maps.
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
import { AuditAction, AuditEntry as AuditLogEntry, AuditLogRepository } from '../../src/repositories/AuditLogRepository';
import { SettingsRepository } from '../../src/repositories/SettingsRepository';

type FilterValue = 'all' | AuditAction;

const ACTION_LABELS: Record<AuditAction, string> = {
  INSPECTION_SAVED:              'حفظ تفتيش',
  INSPECTION_DELETED:            'حذف تفتيش',
  INSPECTION_BULK_DELETED:       'حذف مجموعة',
  INSPECTION_DELETE_BLOCKED:     'حذف محظور — تقرير معتمد',
  SERVER_SYNC_PENDING:           'مزامنة معلقة — تعذر الاتصال بالخادم',
  AGENDA_ITEM_SAVED:             'حفظ مهمة',
  AGENDA_ITEM_DELETED:           'حذف مهمة',
  SETTINGS_CHANGED:              'تغيير الإعدادات',
  BACKUP_RESTORED:               'استعادة نسخة احتياطية',
  AUDIT_LOG_CLEARED:             'مسح سجل الأحداث',
};

const ACTION_ICONS: Record<AuditAction, string> = {
  INSPECTION_SAVED:              'clipboard',
  INSPECTION_DELETED:            'trash',
  INSPECTION_BULK_DELETED:       'trash',
  INSPECTION_DELETE_BLOCKED:     'lock',
  SERVER_SYNC_PENDING:           'cloud-upload',
  AGENDA_ITEM_SAVED:             'calendar',
  AGENDA_ITEM_DELETED:           'calendar-times-o',
  SETTINGS_CHANGED:              'cog',
  BACKUP_RESTORED:               'database',
  AUDIT_LOG_CLEARED:             'eraser',
};

const ACTION_COLORS: Record<AuditAction, string> = {
  INSPECTION_SAVED:              Colors.success,
  INSPECTION_DELETED:            Colors.danger,
  INSPECTION_BULK_DELETED:       Colors.danger,
  INSPECTION_DELETE_BLOCKED:     Colors.warning,
  SERVER_SYNC_PENDING:           '#f39c12',
  AGENDA_ITEM_SAVED:             Colors.primary,
  AGENDA_ITEM_DELETED:           Colors.warning,
  SETTINGS_CHANGED:              Colors.textSecondary,
  BACKUP_RESTORED:               '#8e44ad',
  AUDIT_LOG_CLEARED:             Colors.textSecondary,
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
            // W39: pass inspectorName so the sentinel row is attributed.
            const settings = await SettingsRepository.get();
            const inspectorName = settings?.inspectorName?.trim() || 'مفتش';
            await AuditLogRepository.clear(inspectorName);
            load();
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: AuditLogEntry }) => (
    <View style={s.card}>
      <View style={[s.iconWrap, { backgroundColor: (ACTION_COLORS[item.action] ?? Colors.textSecondary) + '18' }]}>
        <FontAwesome
          name={(ACTION_ICONS[item.action] ?? 'info') as any}
          size={18}
          color={ACTION_COLORS[item.action] ?? Colors.textSecondary}
        />
      </View>
      <View style={s.cardBody}>
        <View style={s.cardTop}>
          <Text style={[s.actionLabel, { color: ACTION_COLORS[item.action] ?? Colors.textSecondary }]}>
            {ACTION_LABELS[item.action] ?? item.action}
          </Text>
          <Text style={s.timestamp}>{formatDate(item.timestamp)}</Text>
        </View>
        <Text style={s.inspector} numberOfLines={1}>{item.inspectorName}</Text>
        {item.facilityName ? (
          <Text style={s.facility} numberOfLines={1}>{item.facilityName}</Text>
        ) : null}
        {item.detail ? (
          <Text style={s.detail} numberOfLines={2}>{item.detail}</Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <FontAwesome name="arrow-right" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.title}>سجل الأحداث</Text>
        <TouchableOpacity onPress={handleClear} style={s.clearBtn}>
          <FontAwesome name="trash" size={18} color={Colors.danger} />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow}
      >
        {FILTER_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[s.chip, filter === opt.value && s.chipActive]}
            onPress={() => setFilter(opt.value)}
          >
            <Text style={[s.chipText, filter === opt.value && s.chipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={Colors.primary} />
      ) : entries.length === 0 ? (
        <View style={s.empty}>
          <FontAwesome name="list-alt" size={48} color={Colors.border} />
          <Text style={s.emptyText}>لا توجد أحداث مسجلة</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={e => e.id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={s.count}>{entries.length} حدث</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.background },
  header:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
                 paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
                 backgroundColor: Colors.surface,
                 borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn:     { padding: Spacing.xs },
  title:       { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold,
                 color: Colors.textPrimary, textAlign: 'right' },
  clearBtn:    { padding: Spacing.xs },

  filterRow:   { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm },
  chip:        { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
                 borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
                 backgroundColor: Colors.surface },
  chipActive:  { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText:    { fontSize: FontSize.sm, color: Colors.textSecondary },
  chipTextActive: { color: '#fff', fontWeight: FontWeight.semibold },

  count:       { fontSize: FontSize.sm, color: Colors.textSecondary,
                 textAlign: 'right', marginBottom: Spacing.sm },
  list:        { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },

  card:        { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
                 backgroundColor: Colors.surface, borderRadius: Radius.lg,
                 padding: Spacing.md, marginBottom: Spacing.sm, ...Shadow.sm,
                 borderWidth: 1, borderColor: Colors.border },
  iconWrap:    { width: 40, height: 40, borderRadius: Radius.md,
                 alignItems: 'center', justifyContent: 'center' },
  cardBody:    { flex: 1, gap: 3 },
  cardTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  timestamp:   { fontSize: FontSize.xs, color: Colors.textTertiary },
  inspector:   { fontSize: FontSize.sm, color: Colors.textPrimary, textAlign: 'right' },
  facility:    { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'right' },
  detail:      { fontSize: FontSize.xs, color: Colors.textTertiary, textAlign: 'right',
                 fontStyle: 'italic' },

  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  emptyText:   { fontSize: FontSize.base, color: Colors.textSecondary },
});

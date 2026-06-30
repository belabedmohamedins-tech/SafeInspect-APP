// app/screens/approval-queue.tsx
// Supervisor approval queue screen (FR-069→075)
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Modal, TextInput, Alert, I18nManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants';
import { ApprovalRecord, ApprovalRepository } from '../../src/repositories/ApprovalRepository';
import { SettingsRepository } from '../../src/repositories/SettingsRepository';

I18nManager.forceRTL(true);

type FilterTab = 'all' | 'pending' | 'approved' | 'returned' | 'escalated';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',       label: 'الكل' },
  { key: 'pending',   label: 'بانتظار' },
  { key: 'approved',  label: 'معتمد' },
  { key: 'returned',  label: 'معاد' },
  { key: 'escalated', label: 'مرفوع' },
];

const STATUS_COLOR: Record<string, string> = {
  pending:   Colors.warning,
  approved:  Colors.success,
  returned:  Colors.danger,
  escalated: '#7c3aed',
};

const GRADE_COLOR: Record<string, string> = {
  A: Colors.success,
  B: Colors.primary,
  C: Colors.warning,
  D: Colors.danger,
};

type ActionSheet = { record: ApprovalRecord; mode: 'approve' | 'return' | 'escalate' } | null;

export default function ApprovalQueueScreen() {
  const router = useRouter();
  const [records, setRecords] = useState<ApprovalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('pending');
  const [actionSheet, setActionSheet] = useState<ActionSheet>(null);
  const [textInput, setTextInput]   = useState('');
  const [textError, setTextError]   = useState('');
  const [supervisorName, setSupervisorName] = useState('المشرف');

  const load = useCallback(async () => {
    setLoading(true);
    const [q, settings] = await Promise.all([
      ApprovalRepository.getQueue(),
      SettingsRepository.get(),
    ]);
    setRecords(q);
    if (settings?.inspectorName) setSupervisorName(settings.inspectorName);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'all'
    ? records
    : records.filter(r => r.status === filter);

  const openAction = (record: ApprovalRecord, mode: ActionSheet['mode']) => {
    if (record.status === 'approved') {
      Alert.alert('ثابت', 'لا يمكن تعديل تقرير معتمد.');
      return;
    }
    setTextInput('');
    setTextError('');
    setActionSheet({ record, mode });
  };

  const submitAction = async () => {
    if (!actionSheet) return;
    const { record, mode } = actionSheet;
    if ((mode === 'return') && textInput.trim().length < 5) {
      setTextError('يرجى إدخال سبب واضح');
      return;
    }
    try {
      if (mode === 'approve') {
        await ApprovalRepository.approve(record.inspectionId, supervisorName, textInput.trim() || undefined);
      } else if (mode === 'return') {
        await ApprovalRepository.returnForRevision(record.inspectionId, supervisorName, textInput.trim());
      } else {
        await ApprovalRepository.escalate(record.inspectionId, supervisorName, textInput.trim() || undefined);
      }
      setActionSheet(null);
      load();
    } catch (e: any) {
      Alert.alert('خطأ', e.message);
    }
  };

  const renderRecord = ({ item }: { item: ApprovalRecord }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusPill, { backgroundColor: STATUS_COLOR[item.status] + '22' }]}>
          <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>
            {FILTER_TABS.find(t => t.key === item.status)?.label}
          </Text>
        </View>
        {item.grade && (
          <Text style={[styles.grade, { color: GRADE_COLOR[item.grade] ?? Colors.textPrimary }]}>
            {item.grade}
          </Text>
        )}
      </View>
      <Text style={styles.facility}>{item.facilityName}</Text>
      <Text style={styles.meta}>{item.inspectorName} • {item.date}</Text>
      {item.score !== undefined && (
        <Text style={styles.meta}>النتيجة: {item.score}%</Text>
      )}
      {item.returnedReason ? (
        <Text style={styles.returnedNote}>سبب الإعادة: {item.returnedReason}</Text>
      ) : null}
      {item.status !== 'approved' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={() => openAction(item, 'approve')}
          >
            <Text style={[styles.actionBtnText, { color: Colors.success }]}>اعتماد</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.returnBtn]}
            onPress={() => openAction(item, 'return')}
          >
            <Text style={[styles.actionBtnText, { color: Colors.danger }]}>إعادة</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.escalateBtn]}
            onPress={() => openAction(item, 'escalate')}
          >
            <Text style={[styles.actionBtnText, { color: '#7c3aed' }]}>رفع</Text>
          </TouchableOpacity>
        </View>
      )}
      {item.status === 'approved' && (
        <Text style={styles.approvedNote}>✓ معتمد بواسطة {item.approvedBy}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>طابور الاعتماد</Text>
      </View>

      {/* Filter tabs */}
      <View style={styles.tabs}>
        {FILTER_TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, filter === t.key && styles.tabActive]}
            onPress={() => setFilter(t.key)}
          >
            <Text style={[styles.tabText, filter === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={Colors.primary} />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>لا توجد تقارير في هذا القسم</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={r => r.inspectionId}
          renderItem={renderRecord}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Action bottom sheet */}
      <Modal visible={!!actionSheet} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {actionSheet?.mode === 'approve' ? 'اعتماد التقرير'
               : actionSheet?.mode === 'return' ? 'إعادة للمراجعة'
               : 'رفع للجهة الأعلى'}
            </Text>
            <Text style={styles.modalFacility}>
              {actionSheet?.record.facilityName}
            </Text>
            <TextInput
              style={styles.textInput}
              value={textInput}
              onChangeText={t => { setTextInput(t); setTextError(''); }}
              placeholder={
                actionSheet?.mode === 'return'
                  ? 'سبب الإعادة (إلزامي)'
                  : 'ملاحظة اختيارية'
              }
              placeholderTextColor={Colors.textFaint}
              multiline
              textAlign="right"
            />
            {textError ? <Text style={styles.errorText}>{textError}</Text> : null}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setActionSheet(null)}
              >
                <Text style={styles.cancelBtnText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={submitAction}>
                <Text style={styles.submitBtnText}>تأكيد</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, padding: Spacing.lg, alignItems: 'center' },
  headerTitle: { color: Colors.textInverse, fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  tabs: { flexDirection: 'row', backgroundColor: Colors.surface, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.xs },
  tab: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full, backgroundColor: Colors.surfaceOffset },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  tabTextActive: { color: Colors.textInverse, fontWeight: FontWeight.bold },
  list: { padding: Spacing.md, gap: Spacing.md },
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, ...Shadow.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  statusPill: { borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  grade: { fontSize: 28, fontWeight: FontWeight.bold },
  facility: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'right', marginBottom: Spacing.xs },
  meta: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'right', marginBottom: 2 },
  returnedNote: { fontSize: FontSize.xs, color: Colors.danger, backgroundColor: Colors.danger + '18', borderRadius: Radius.sm, padding: Spacing.sm, marginTop: Spacing.xs, textAlign: 'right' },
  approvedNote: { fontSize: FontSize.xs, color: Colors.success, marginTop: Spacing.xs, textAlign: 'right' },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md, justifyContent: 'flex-end' },
  actionBtn: { borderRadius: Radius.md, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderWidth: 1.5 },
  approveBtn: { backgroundColor: Colors.success + '18', borderColor: Colors.success },
  returnBtn: { backgroundColor: Colors.danger + '18', borderColor: Colors.danger },
  escalateBtn: { backgroundColor: '#ede9fe', borderColor: '#7c3aed' },
  actionBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: Colors.textFaint, fontSize: FontSize.md },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.lg },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, textAlign: 'right', marginBottom: Spacing.xs },
  modalFacility: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right', marginBottom: Spacing.md },
  textInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.base, minHeight: 80, textAlignVertical: 'top', marginBottom: Spacing.xs },
  errorText: { color: Colors.danger, fontSize: FontSize.xs, textAlign: 'right', marginBottom: Spacing.xs },
  modalActions: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'flex-end' },
  cancelBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg },
  cancelBtnText: { color: Colors.textSecondary, fontSize: FontSize.base },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg },
  submitBtnText: { color: Colors.textInverse, fontSize: FontSize.base, fontWeight: FontWeight.bold },
});

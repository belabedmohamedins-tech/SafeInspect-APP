// app/screens/approval-queue.tsx
// Supervisor approval queue screen (FR-069→075)
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Modal, TextInput, Alert, I18nManager,
} from 'react-native';
import { useRouter } from 'expo-router';
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
  pending:   '#d97706',
  approved:  '#16a34a',
  returned:  '#dc2626',
  escalated: '#7c3aed',
};

const GRADE_COLOR: Record<string, string> = {
  A: '#16a34a', B: '#2563eb', C: '#d97706', D: '#dc2626',
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
          <Text style={[styles.grade, { color: GRADE_COLOR[item.grade] ?? '#374151' }]}>
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
            <Text style={styles.actionBtnText}>اعتماد</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.returnBtn]}
            onPress={() => openAction(item, 'return')}
          >
            <Text style={[styles.actionBtnText, { color: '#dc2626' }]}>إعادة</Text>
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
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#1e40af" />
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
              placeholderTextColor="#9ca3af"
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
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#1e40af', padding: 20, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  tab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f1f5f9' },
  tabActive: { backgroundColor: '#1e40af' },
  tabText: { fontSize: 13, color: '#64748b' },
  tabTextActive: { color: '#fff', fontWeight: '700' },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statusPill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 12, fontWeight: '700' },
  grade: { fontSize: 28, fontWeight: '800' },
  facility: { fontSize: 15, fontWeight: '700', color: '#1e293b', textAlign: 'right', marginBottom: 4 },
  meta: { fontSize: 12, color: '#64748b', textAlign: 'right', marginBottom: 2 },
  returnedNote: { fontSize: 12, color: '#dc2626', backgroundColor: '#fee2e2', borderRadius: 6, padding: 8, marginTop: 6, textAlign: 'right' },
  approvedNote: { fontSize: 12, color: '#16a34a', marginTop: 6, textAlign: 'right' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12, justifyContent: 'flex-end' },
  actionBtn: { borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1.5 },
  approveBtn: { backgroundColor: '#dcfce7', borderColor: '#16a34a' },
  returnBtn: { backgroundColor: '#fee2e2', borderColor: '#dc2626' },
  escalateBtn: { backgroundColor: '#ede9fe', borderColor: '#7c3aed' },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: '#16a34a' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#9ca3af', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 17, fontWeight: '700', textAlign: 'right', marginBottom: 4 },
  modalFacility: { fontSize: 13, color: '#64748b', textAlign: 'right', marginBottom: 12 },
  textInput: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: 'top', marginBottom: 6 },
  errorText: { color: '#dc2626', fontSize: 12, textAlign: 'right', marginBottom: 6 },
  modalActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  cancelBtn: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 20 },
  cancelBtnText: { color: '#64748b', fontSize: 14 },
  submitBtn: { backgroundColor: '#1e40af', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 20 },
  submitBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

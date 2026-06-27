// app/screens/approval-detail.tsx — Supervisor read-only inspection review
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import { ApprovalRepository } from '../../src/repositories/ApprovalRepository';
import { SavedInspection, InspectionItem } from '../../src/types';

// ── Helpers ────────────────────────────────────────────────────────────────
function gradeColor(grade?: string) {
  switch (grade) {
    case 'A': return '#27ae60';
    case 'B': return '#2980b9';
    case 'C': return '#f39c12';
    case 'D': return '#e74c3c';
    default:  return '#95a5a6';
  }
}

function statusLabel(status?: string) {
  switch (status) {
    case 'approved':  return { text: 'معتمد ✓',        color: '#27ae60' };
    case 'returned':  return { text: 'مُعاد للمراجعة', color: '#e67e22' };
    case 'escalated': return { text: 'مُصعَّد',         color: '#8e44ad' };
    default:          return { text: 'بانتظار الاعتماد', color: '#7f8c8d' };
  }
}

function groupByAxis(items: InspectionItem[]): Record<string, InspectionItem[]> {
  const map: Record<string, InspectionItem[]> = {};
  for (const item of items) {
    const key = item.axis || 'عام';
    if (!map[key]) map[key] = [];
    map[key].push(item);
  }
  return map;
}

function severityLabel(s: string) {
  return s === 'high' ? 'عالية' : s === 'medium' ? 'متوسطة' : 'منخفضة';
}

function severityColor(s: string) {
  return s === 'high' ? '#e74c3c' : s === 'medium' ? '#e67e22' : '#27ae60';
}

function complianceLabel(c: string) {
  switch (c) {
    case 'compliant':     return { text: 'مطابق',     color: '#27ae60' };
    case 'non-compliant': return { text: 'غير مطابق', color: '#e74c3c' };
    case 'na':            return { text: 'لا ينطبق',  color: '#95a5a6' };
    default:              return { text: 'لم يُقيَّم', color: '#bdc3c7' };
  }
}

// ── Action Modal ───────────────────────────────────────────────────────────
type ActionType = 'approve' | 'return' | 'escalate';

interface ActionModalProps {
  visible: boolean;
  action: ActionType | null;
  onClose: () => void;
  onSubmit: (note: string, reason: string) => void;
}

function ActionModal({ visible, action, onClose, onSubmit }: ActionModalProps) {
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');

  const titles: Record<ActionType, string> = {
    approve:  'اعتماد التقرير',
    return:   'إعادة إلى المفتش',
    escalate: 'تصعيد التقرير',
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          <Text style={modal.title}>{action ? titles[action] : ''}</Text>

          {action === 'return' && (
            <>
              <Text style={modal.label}>سبب الإعادة *</Text>
              <TextInput
                style={modal.input}
                placeholder="اذكر سبب إعادة التقرير..."
                multiline
                numberOfLines={3}
                textAlign="right"
                value={reason}
                onChangeText={setReason}
              />
            </>
          )}

          <Text style={modal.label}>ملاحظة (اختياري)</Text>
          <TextInput
            style={modal.input}
            placeholder="أضف ملاحظة..."
            multiline
            numberOfLines={2}
            textAlign="right"
            value={note}
            onChangeText={setNote}
          />

          <View style={modal.btnRow}>
            <TouchableOpacity style={modal.cancelBtn} onPress={onClose}>
              <Text style={modal.cancelText}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modal.submitBtn,
                action === 'approve'  ? { backgroundColor: '#27ae60' } :
                action === 'return'   ? { backgroundColor: '#e67e22' } :
                                       { backgroundColor: '#8e44ad' }]}
              onPress={() => {
                if (action === 'return' && !reason.trim()) {
                  Alert.alert('خطأ', 'سبب الإعادة مطلوب');
                  return;
                }
                onSubmit(note.trim(), reason.trim());
                setNote(''); setReason('');
              }}
            >
              <Text style={modal.submitText}>
                {action === 'approve' ? 'اعتماد' : action === 'return' ? 'إعادة' : 'تصعيد'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Main Screen ─────────────────────────────────────────────────────────────
export default function ApprovalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [inspection, setInspection] = useState<SavedInspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<ActionType | null>(null);
  const [processing, setProcessing] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const all = await InspectionRepository.getCompleted();
    const found = all.find(i => i.id === id) ?? null;
    setInspection(found);
    setLoading(false);
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleAction = async (note: string, reason: string) => {
    if (!inspection || !actionModal) return;
    setProcessing(true);
    setActionModal(null);
    const supervisor = 'المشرف';
    if (actionModal === 'approve') {
      await ApprovalRepository.approve(inspection.id, supervisor, note);
    } else if (actionModal === 'return') {
      await ApprovalRepository.returnForRevision(inspection.id, supervisor, reason, note);
    } else {
      await ApprovalRepository.escalate(inspection.id, supervisor, note);
    }
    setProcessing(false);
    Alert.alert('', 'تم تنفيذ الإجراء بنجاح', [{ text: 'حسناً', onPress: () => router.back() }]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2c7a4b" />
      </View>
    );
  }

  if (!inspection) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#999' }}>التقرير غير موجود</Text>
      </View>
    );
  }

  const isLocked = inspection.approvalStatus === 'approved';
  const status = statusLabel(inspection.approvalStatus);
  const grouped = groupByAxis(inspection.items);
  const nonCompliant = inspection.items.filter(i => i.complianceStatus === 'non-compliant');
  const evaluated   = inspection.items.filter(i => i.complianceStatus !== 'not-evaluated');
  const score = inspection.score ?? 0;

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>→ طابور الاعتماد</Text>
        </TouchableOpacity>

        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={[styles.gradeBadge, { backgroundColor: gradeColor(inspection.grade) }]}>
              <Text style={styles.gradeText}>{inspection.grade ?? '—'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.facilityName}>{inspection.facilityName}</Text>
              <Text style={styles.facilityAddr}>{inspection.facilityAddress}</Text>
              <Text style={styles.meta}>
                {new Date(inspection.date).toLocaleDateString('ar-DZ', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </Text>
            </View>
          </View>

          {/* Approval status pill */}
          <View style={[styles.statusPill, { backgroundColor: status.color + '22' }]}>
            <Text style={[styles.statusPillText, { color: status.color }]}>{status.text}</Text>
          </View>

          {/* Score row */}
          <View style={styles.scoreRow}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreVal}>{score}%</Text>
              <Text style={styles.scoreLabel}>النتيجة</Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreVal}>{evaluated.length}</Text>
              <Text style={styles.scoreLabel}>مُقيَّم</Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={[styles.scoreVal, nonCompliant.length > 0 && { color: '#e74c3c' }]}>
                {nonCompliant.length}
              </Text>
              <Text style={styles.scoreLabel}>مخالفة</Text>
            </View>
          </View>

          {/* Integrity */}
          {inspection.integrityHash ? (
            <View style={styles.integrityRow}>
              <Text style={styles.integrityIcon}>🔒</Text>
              <Text style={styles.integrityText}>سلامة البيانات مؤكدة</Text>
            </View>
          ) : null}

          {/* Geofence override note */}
          {inspection.geofenceOverrideNote ? (
            <View style={styles.geoNote}>
              <Text style={styles.geoNoteText}>
                ⚠️ تجاوز جيوفنسينج: {inspection.geofenceOverrideNote}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Inspector info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات المفتش</Text>
          <Row label="المفتش" value={inspection.inspectorName} />
          {inspection.officeName ? <Row label="المكتب" value={inspection.officeName} /> : null}
          {inspection.inspectionCause ? <Row label="سبب التفتيش" value={inspection.inspectionCause} /> : null}
          {inspection.committeeMembers?.length ? (
            <Row label="أعضاء اللجنة" value={inspection.committeeMembers.join('، ')} />
          ) : null}
        </View>

        {/* Approval history */}
        {(inspection.approvedBy || inspection.returnedReason) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>سجل الاعتماد</Text>
            {inspection.approvedBy   ? <Row label="بواسطة" value={inspection.approvedBy} /> : null}
            {inspection.approvedAt   ? <Row label="التاريخ" value={new Date(inspection.approvedAt).toLocaleString('ar-DZ')} /> : null}
            {inspection.returnedReason ? <Row label="سبب الإعادة" value={inspection.returnedReason} /> : null}
            {inspection.approvalNote ? <Row label="ملاحظة" value={inspection.approvalNote} /> : null}
          </View>
        )}

        {/* Items by axis */}
        {Object.entries(grouped).map(([axis, items]) => (
          <View key={axis} style={styles.section}>
            <Text style={styles.axisTitle}>{axis}</Text>
            {items.map(item => {
              const comp = complianceLabel(item.complianceStatus);
              return (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <View style={[styles.compBadge, { backgroundColor: comp.color + '22' }]}>
                      <Text style={[styles.compBadgeText, { color: comp.color }]}>{comp.text}</Text>
                    </View>
                    <View style={[styles.sevBadge, { backgroundColor: severityColor(item.severity) + '22' }]}>
                      <Text style={[styles.sevBadgeText, { color: severityColor(item.severity) }]}>
                        {severityLabel(item.severity)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.itemCriteria}>{item.criteria}</Text>
                  {item.comment ? (
                    <Text style={styles.itemComment}>💬 {item.comment}</Text>
                  ) : null}
                  <Text style={styles.itemRef}>{item.legalReference}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Action Bar — hidden once approved */}
      {!isLocked && !processing && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#e67e22' }]}
            onPress={() => setActionModal('return')}
          >
            <Text style={styles.actionBtnText}>إعادة</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#8e44ad' }]}
            onPress={() => setActionModal('escalate')}
          >
            <Text style={styles.actionBtnText}>تصعيد</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={() => setActionModal('approve')}
          >
            <Text style={styles.actionBtnText}>اعتماد ✓</Text>
          </TouchableOpacity>
        </View>
      )}

      {processing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      <ActionModal
        visible={actionModal !== null}
        action={actionModal}
        onClose={() => setActionModal(null)}
        onSubmit={handleAction}
      />
    </>
  );
}

// ── Row helper ───────────────────────────────────────────────────────────────
function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={row.container}>
      <Text style={row.value}>{value}</Text>
      <Text style={row.label}>{label}:</Text>
    </View>
  );
}

const row = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6,
               borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  label:     { fontSize: 13, color: '#888', fontWeight: '600' },
  value:     { fontSize: 13, color: '#1a1a2e', flex: 1, textAlign: 'right' },
});

const modal = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
                padding: 20, paddingBottom: 36 },
  title:      { fontSize: 18, fontWeight: '700', textAlign: 'right', marginBottom: 16, color: '#1a1a2e' },
  label:      { fontSize: 13, color: '#555', textAlign: 'right', marginBottom: 4, marginTop: 10 },
  input:      { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10,
                fontSize: 14, color: '#1a1a2e', backgroundColor: '#fafafa',
                textAlignVertical: 'top' },
  btnRow:     { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelBtn:  { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
                paddingVertical: 12, alignItems: 'center' },
  cancelText: { fontSize: 14, color: '#555', fontWeight: '600' },
  submitBtn:  { flex: 2, borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  submitText: { fontSize: 15, color: '#fff', fontWeight: '700' },
});

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f0f4f0' },
  center:           { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn:          { paddingHorizontal: 16, paddingTop: 52, paddingBottom: 8 },
  backText:         { fontSize: 13, color: '#2c7a4b', fontWeight: '600' },
  headerCard:       { backgroundColor: '#fff', margin: 12, borderRadius: 12, padding: 16,
                      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
  headerRow:        { flexDirection: 'row', gap: 12, marginBottom: 12 },
  gradeBadge:       { width: 52, height: 52, borderRadius: 26, alignItems: 'center',
                      justifyContent: 'center' },
  gradeText:        { fontSize: 22, fontWeight: '900', color: '#fff' },
  facilityName:     { fontSize: 16, fontWeight: '700', color: '#1a1a2e', textAlign: 'right' },
  facilityAddr:     { fontSize: 13, color: '#888', textAlign: 'right', marginTop: 2 },
  meta:             { fontSize: 12, color: '#aaa', textAlign: 'right', marginTop: 2 },
  statusPill:       { alignSelf: 'flex-end', borderRadius: 20, paddingHorizontal: 12,
                      paddingVertical: 4, marginBottom: 12 },
  statusPillText:   { fontSize: 13, fontWeight: '700' },
  scoreRow:         { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  scoreBox:         { alignItems: 'center' },
  scoreVal:         { fontSize: 20, fontWeight: '800', color: '#2c7a4b' },
  scoreLabel:       { fontSize: 11, color: '#aaa', marginTop: 2 },
  integrityRow:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10,
                      backgroundColor: '#eaf6ef', borderRadius: 8, padding: 8 },
  integrityIcon:    { fontSize: 16 },
  integrityText:    { fontSize: 13, color: '#27ae60', fontWeight: '600' },
  geoNote:          { marginTop: 8, backgroundColor: '#fef9e7', borderRadius: 8, padding: 8 },
  geoNoteText:      { fontSize: 12, color: '#d35400', textAlign: 'right' },
  section:          { backgroundColor: '#fff', margin: 12, marginTop: 0, borderRadius: 12,
                      padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  sectionTitle:     { fontSize: 15, fontWeight: '700', color: '#1a1a2e', textAlign: 'right',
                      marginBottom: 10 },
  axisTitle:        { fontSize: 14, fontWeight: '700', color: '#2c7a4b', textAlign: 'right',
                      marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e8f5e9',
                      paddingBottom: 6 },
  itemCard:         { backgroundColor: '#fafafa', borderRadius: 8, padding: 10, marginBottom: 8 },
  itemHeader:       { flexDirection: 'row', justifyContent: 'flex-end', gap: 6, marginBottom: 6 },
  compBadge:        { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  compBadgeText:    { fontSize: 11, fontWeight: '700' },
  sevBadge:         { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  sevBadgeText:     { fontSize: 11, fontWeight: '600' },
  itemCriteria:     { fontSize: 13, color: '#1a1a2e', textAlign: 'right', lineHeight: 19 },
  itemComment:      { fontSize: 12, color: '#555', textAlign: 'right', marginTop: 4,
                      fontStyle: 'italic' },
  itemRef:          { fontSize: 11, color: '#aaa', textAlign: 'right', marginTop: 4 },
  actionBar:        { position: 'absolute', bottom: 0, left: 0, right: 0,
                      flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 32,
                      backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  actionBtn:        { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  approveBtn:       { backgroundColor: '#2c7a4b', flex: 2 },
  actionBtnText:    { color: '#fff', fontSize: 14, fontWeight: '700' },
  processingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                       backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center',
                       alignItems: 'center' },
});

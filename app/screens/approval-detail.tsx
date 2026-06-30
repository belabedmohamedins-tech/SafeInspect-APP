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
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants';
import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import { ApprovalRepository } from '../../src/repositories/ApprovalRepository';
import { SettingsRepository } from '../../src/repositories/SettingsRepository';
import { SavedInspection, InspectionItem } from '../../src/types';

// ── Helpers ────────────────────────────────────────────────────────────────────────────
function gradeColor(grade?: string) {
  switch (grade) {
    case 'A': return Colors.success;
    case 'B': return Colors.primary;
    case 'C': return Colors.warning;
    case 'D': return Colors.danger;
    default:  return Colors.textSecondary;
  }
}

function statusLabel(status?: string) {
  switch (status) {
    case 'approved':  return { text: 'معتمد ✓',        color: Colors.success };
    case 'returned':  return { text: 'مُعاد للمراجعة', color: Colors.warning };
    case 'escalated': return { text: 'مُصعَّد',         color: '#8e44ad' };
    default:          return { text: 'بانتظار الاعتماد', color: Colors.textSecondary };
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
  return s === 'high' ? Colors.danger : s === 'medium' ? Colors.warning : Colors.success;
}

function complianceLabel(c: string) {
  switch (c) {
    case 'compliant':     return { text: 'مطابق',     color: Colors.success };
    case 'non-compliant': return { text: 'غير مطابق', color: Colors.danger };
    case 'na':            return { text: 'لا ينطبق',  color: Colors.textSecondary };
    default:              return { text: 'لم يُقيَّم', color: Colors.textFaint };
  }
}

// ── Action Modal ─────────────────────────────────────────────────────────────────────
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

  const actionColor = action === 'approve' ? Colors.success
    : action === 'return' ? Colors.warning
    : '#8e44ad';

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
              style={[modal.submitBtn, { backgroundColor: actionColor }]}
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

// ── Main Screen ───────────────────────────────────────────────────────────────────────
export default function ApprovalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [inspection, setInspection] = useState<SavedInspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<ActionType | null>(null);
  const [processing, setProcessing] = useState(false);
  const [supervisorName, setSupervisorName] = useState('المشرف');

  const load = useCallback(async () => {
    if (!id) return;
    const [all, settings] = await Promise.all([
      InspectionRepository.getCompleted(),
      SettingsRepository.get(),
    ]);
    const found = all.find(i => i.id === id) ?? null;
    setInspection(found);
    if (settings?.inspectorName) setSupervisorName(settings.inspectorName);
    setLoading(false);
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleAction = async (note: string, reason: string) => {
    if (!inspection || !actionModal) return;
    setProcessing(true);
    setActionModal(null);
    if (actionModal === 'approve') {
      await ApprovalRepository.approve(inspection.id, supervisorName, note || undefined);
    } else if (actionModal === 'return') {
      await ApprovalRepository.returnForRevision(inspection.id, supervisorName, reason);
    } else {
      await ApprovalRepository.escalate(inspection.id, supervisorName, note || undefined);
    }
    setProcessing(false);
    Alert.alert('', 'تم تنفيذ الإجراء بنجاح', [{ text: 'حسناً', onPress: () => router.back() }]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!inspection) {
    return (
      <View style={styles.center}>
        <Text style={{ color: Colors.textSecondary }}>التقرير غير موجود</Text>
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
              <Text style={[styles.scoreVal, nonCompliant.length > 0 && { color: Colors.danger }]}>
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
            style={[styles.actionBtn, { backgroundColor: Colors.warning }]}
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
          <ActivityIndicator size="large" color={Colors.textInverse} />
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

// ── Row helper ────────────────────────────────────────────────────────────────────────────
function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={row.container}>
      <Text style={row.value}>{value}</Text>
      <Text style={row.label}>{label}:</Text>
    </View>
  );
}

const row = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs,
               borderBottomWidth: 1, borderBottomColor: Colors.border },
  label:     { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.semibold },
  value:     { fontSize: FontSize.sm, color: Colors.textPrimary, flex: 1, textAlign: 'right' },
});

const modal = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
                padding: Spacing.lg, paddingBottom: Spacing.xxl },
  title:      { fontSize: FontSize.lg, fontWeight: FontWeight.bold, textAlign: 'right', marginBottom: Spacing.md, color: Colors.textPrimary },
  label:      { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right', marginBottom: Spacing.xs, marginTop: Spacing.sm },
  input:      { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.sm,
                fontSize: FontSize.base, color: Colors.textPrimary, backgroundColor: Colors.surfaceOffset,
                textAlignVertical: 'top' },
  btnRow:     { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
  cancelBtn:  { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md,
                paddingVertical: Spacing.md, alignItems: 'center' },
  cancelText: { fontSize: FontSize.base, color: Colors.textSecondary, fontWeight: FontWeight.semibold },
  submitBtn:  { flex: 2, borderRadius: Radius.md, paddingVertical: Spacing.md, alignItems: 'center' },
  submitText: { fontSize: FontSize.md, color: Colors.textInverse, fontWeight: FontWeight.bold },
});

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: Colors.background },
  center:           { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn:          { paddingHorizontal: Spacing.md, paddingTop: 52, paddingBottom: Spacing.sm },
  backText:         { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  headerCard:       { backgroundColor: Colors.surface, margin: Spacing.sm, borderRadius: Radius.lg, padding: Spacing.md, ...Shadow.sm },
  headerRow:        { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  gradeBadge:       { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  gradeText:        { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textInverse },
  facilityName:     { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'right' },
  facilityAddr:     { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right', marginTop: Spacing.xs },
  meta:             { fontSize: FontSize.xs, color: Colors.textFaint, textAlign: 'right', marginTop: Spacing.xs },
  statusPill:       { alignSelf: 'flex-end', borderRadius: Radius.full, paddingHorizontal: Spacing.md,
                      paddingVertical: Spacing.xs, marginBottom: Spacing.md },
  statusPillText:   { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  scoreRow:         { flexDirection: 'row', justifyContent: 'space-around', marginTop: Spacing.sm },
  scoreBox:         { alignItems: 'center' },
  scoreVal:         { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary },
  scoreLabel:       { fontSize: FontSize.xs, color: Colors.textFaint, marginTop: Spacing.xs },
  integrityRow:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.sm,
                      backgroundColor: Colors.success + '18', borderRadius: Radius.md, padding: Spacing.sm },
  integrityIcon:    { fontSize: FontSize.base },
  integrityText:    { fontSize: FontSize.sm, color: Colors.success, fontWeight: FontWeight.semibold },
  geoNote:          { marginTop: Spacing.sm, backgroundColor: Colors.warning + '18', borderRadius: Radius.md, padding: Spacing.sm },
  geoNoteText:      { fontSize: FontSize.xs, color: Colors.warning, textAlign: 'right' },
  section:          { backgroundColor: Colors.surface, margin: Spacing.sm, marginTop: 0, borderRadius: Radius.lg,
                      padding: Spacing.sm + 2, ...Shadow.sm },
  sectionTitle:     { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'right',
                      marginBottom: Spacing.sm },
  axisTitle:        { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.primary, textAlign: 'right',
                      marginBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border,
                      paddingBottom: Spacing.xs },
  itemCard:         { backgroundColor: Colors.surfaceOffset, borderRadius: Radius.md, padding: Spacing.sm, marginBottom: Spacing.sm },
  itemHeader:       { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.xs, marginBottom: Spacing.xs },
  compBadge:        { borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  compBadgeText:    { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  sevBadge:         { borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  sevBadgeText:     { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  itemCriteria:     { fontSize: FontSize.sm, color: Colors.textPrimary, textAlign: 'right', lineHeight: 19 },
  itemComment:      { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'right', marginTop: Spacing.xs,
                      fontStyle: 'italic' },
  itemRef:          { fontSize: FontSize.xs, color: Colors.textFaint, textAlign: 'right', marginTop: Spacing.xs },
  actionBar:        { position: 'absolute', bottom: 0, left: 0, right: 0,
                      flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md, paddingBottom: Spacing.xxl,
                      backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border },
  actionBtn:        { flex: 1, borderRadius: Radius.md, paddingVertical: Spacing.md, alignItems: 'center' },
  approveBtn:       { backgroundColor: Colors.success, flex: 2 },
  actionBtnText:    { color: Colors.textInverse, fontSize: FontSize.base, fontWeight: FontWeight.bold },
  processingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                       backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center',
                       alignItems: 'center' },
});

// app/cap/[id].tsx
// Phase-4 — CAP item detail / edit screen.
//
// Shows all fields of a CorrectiveAction, lets the inspector:
//  - Change status (open → in-progress → resolved)
//  - Edit deadline (DateTimePicker)
//  - Edit assignedTo and notes inline
//  - Navigate to the source inspection report
//  - Delete the CAP item

import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../../constants';
import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';
import { CorrectiveAction } from '../../src/types';

// ─── helpers ─────────────────────────────────────────────────────────────────

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
  low: 'منخفض', medium: 'متوسط', high: 'عالٍ', critical: 'حرج',
};

const NEXT_STATUS: Partial<Record<CorrectiveAction['status'], CorrectiveAction['status']>> = {
  open:          'in-progress',
  'in-progress': 'resolved',
  overdue:       'in-progress',
};
const NEXT_LABEL: Partial<Record<CorrectiveAction['status'], string>> = {
  open:          'بدء التنفيذ',
  'in-progress': 'إغلاق الإجراء',
  overdue:       'استئناف التنفيذ',
};

function formatDateLong(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ar-DZ', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch { return iso; }
}

// ─── component ───────────────────────────────────────────────────────────────

export default function CapDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [item,       setItem]       = useState<CorrectiveAction | null>(null);
  const [assignedTo, setAssignedTo] = useState('');
  const [notes,      setNotes]      = useState('');
  const [deadline,   setDeadline]   = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [saving,     setSaving]     = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const all  = await CorrectiveActionRepository.getAll();
      const found = all.find(a => a.id === id);
      if (found) {
        setItem(found);
        setAssignedTo(found.assignedTo ?? '');
        setNotes(found.notes ?? '');
        setDeadline(new Date(found.deadline));
      }
    })();
  }, [id]);

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);
    await CorrectiveActionRepository.save({
      ...item,
      assignedTo,
      notes,
      deadline: deadline.toISOString().slice(0, 10),
    });
    setSaving(false);
    Alert.alert('تم الحفظ', 'تم حفظ التغييرات بنجاح.');
    setItem(prev => prev ? { ...prev, assignedTo, notes, deadline: deadline.toISOString().slice(0, 10) } : prev);
  };

  const handleStatusChange = async () => {
    if (!item) return;
    const next = NEXT_STATUS[item.status];
    if (!next) return;
    await CorrectiveActionRepository.updateStatus(item.id, next, notes);
    setItem(prev => prev ? { ...prev, status: next } : prev);
  };

  const handleDelete = () => {
    Alert.alert('حذف الإجراء', 'هل أنت متأكد من حذف هذا الإجراء التصحيحي؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive',
        onPress: async () => {
          if (id) await CorrectiveActionRepository.delete(id);
          router.back();
        },
      },
    ]);
  };

  if (!item) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.notFound}>الإجراء غير موجود</Text>
      </SafeAreaView>
    );
  }

  const overdueFlag = item.status === 'overdue' ||
    (item.status !== 'resolved' && item.deadline < new Date().toISOString().slice(0, 10));

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: 'تفاصيل الإجراء التصحيحي',
          headerStyle: { backgroundColor: Colors.textPrimary },
          headerTintColor: '#fff',
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} style={{ marginRight: Spacing.md }}>
              <FontAwesome name="trash" size={20} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ── Status banner ── */}
        <View style={[styles.statusBanner, { backgroundColor: STATUS_COLOR[item.status] + '20', borderColor: STATUS_COLOR[item.status] }]}>
          <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[item.status] }]} />
          <Text style={[styles.statusLabel, { color: STATUS_COLOR[item.status] }]}>
            {STATUS_LABEL[item.status]}
          </Text>
          {overdueFlag && (
            <View style={styles.overduePill}>
              <Text style={styles.overduePillText}>متأخر</Text>
            </View>
          )}
        </View>

        {/* ── Info card ── */}
        <View style={styles.card}>
          <View style={[styles.severityStripe, { backgroundColor: SEVERITY_COLOR[item.severity] }]} />
          <View style={styles.cardInner}>
            <Text style={styles.facilityName}>{item.facilityName}</Text>
            <Text style={styles.criteria}>{item.criteria}</Text>
            <View style={[styles.severityChip, { borderColor: SEVERITY_COLOR[item.severity] }]}>
              <Text style={[styles.severityText, { color: SEVERITY_COLOR[item.severity] }]}>
                خطورة: {SEVERITY_LABEL[item.severity]}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Deadline ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الموعد النهائي</Text>
          <TouchableOpacity
            style={[styles.dateBtn, overdueFlag && styles.dateBtnOverdue]}
            onPress={() => setShowPicker(true)}
          >
            <FontAwesome name="calendar" size={14} color={overdueFlag ? '#e74c3c' : Colors.primary} />
            <Text style={[styles.dateBtnText, overdueFlag && { color: '#e74c3c' }]}>
              {formatDateLong(deadline.toISOString().slice(0, 10))}
            </Text>
            <FontAwesome name="pencil" size={12} color={Colors.textTertiary} />
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={deadline}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onChange={(_, date) => {
                setShowPicker(Platform.OS === 'ios');
                if (date) setDeadline(date);
              }}
            />
          )}
        </View>

        {/* ── Assigned to ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المسؤول عن التنفيذ</Text>
          <TextInput
            style={styles.textInput}
            value={assignedTo}
            onChangeText={setAssignedTo}
            placeholder="اسم المسؤول..."
            placeholderTextColor={Colors.textTertiary}
          />
        </View>

        {/* ── Notes ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ملاحظات</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="أضف ملاحظات..."
            placeholderTextColor={Colors.textTertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* ── Linked inspection ── */}
        {item.inspectionId ? (
          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() =>
              router.push({ pathname: '/reports/[id]', params: { id: item.inspectionId } })
            }
          >
            <FontAwesome name="file-text-o" size={14} color={Colors.primary} />
            <Text style={styles.linkBtnText}>عرض تقرير التفتيش المرتبط</Text>
            <FontAwesome name="chevron-left" size={12} color={Colors.primary} />
          </TouchableOpacity>
        ) : null}

        {/* ── Creation/update dates ── */}
        <View style={styles.metaRow}>
          <Text style={styles.meta}>أُنشئ: {formatDateLong(item.createdAt)}</Text>
          <Text style={styles.meta}>آخر تحديث: {formatDateLong(item.updatedAt)}</Text>
          {item.closedAt && <Text style={styles.meta}>أُغلق: {formatDateLong(item.closedAt)}</Text>}
        </View>

      </ScrollView>

      {/* ── Bottom action bar ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <FontAwesome name="save" size={16} color="#fff" />
          <Text style={styles.btnText}>حفظ التعديلات</Text>
        </TouchableOpacity>

        {NEXT_STATUS[item.status] && (
          <TouchableOpacity
            style={[styles.statusBtn, { backgroundColor: STATUS_COLOR[NEXT_STATUS[item.status]!] }]}
            onPress={handleStatusChange}
          >
            <FontAwesome name="arrow-left" size={16} color="#fff" />
            <Text style={styles.btnText}>{NEXT_LABEL[item.status]}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:         { flex: 1, backgroundColor: Colors.background },
  centered:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFound:         { fontSize: FontSize.lg, color: Colors.danger },
  scroll:           { padding: Spacing.md, paddingBottom: Spacing.xxl ?? 80 },
  statusBanner:     { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, marginBottom: Spacing.md, gap: Spacing.sm },
  statusDot:        { width: 10, height: 10, borderRadius: 5 },
  statusLabel:      { fontSize: FontSize.md, fontWeight: '700', flex: 1 },
  overduePill:      { backgroundColor: '#e74c3c', borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  overduePillText:  { color: '#fff', fontSize: FontSize.xs + 1, fontWeight: '700' },
  card:             { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.md, marginBottom: Spacing.md, overflow: 'hidden', ...Shadow.sm },
  severityStripe:   { width: 5 },
  cardInner:        { flex: 1, padding: Spacing.md, gap: Spacing.sm },
  facilityName:     { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  criteria:         { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 22 },
  severityChip:     { alignSelf: 'flex-start', borderWidth: 1, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  severityText:     { fontSize: FontSize.sm, fontWeight: '600' },
  section:          { marginBottom: Spacing.md },
  sectionTitle:     { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary, marginBottom: Spacing.sm, textTransform: 'uppercase' },
  dateBtn:          { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  dateBtnOverdue:   { borderColor: '#e74c3c', backgroundColor: '#fdf2f2' },
  dateBtnText:      { flex: 1, fontSize: FontSize.base, color: Colors.textPrimary },
  textInput:        { backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, fontSize: FontSize.base, color: Colors.textPrimary, textAlign: 'right' },
  textArea:         { minHeight: 100, lineHeight: 22 },
  linkBtn:          { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.primary + '60', marginBottom: Spacing.md },
  linkBtnText:      { flex: 1, fontSize: FontSize.base, color: Colors.primary, fontWeight: '600', textAlign: 'right' },
  metaRow:          { gap: 4, marginBottom: Spacing.md },
  meta:             { fontSize: FontSize.xs + 1, color: Colors.textTertiary, textAlign: 'right' },
  bottomBar:        { flexDirection: 'row', padding: Spacing.md, gap: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface },
  saveBtn:          { flex: 1, flexDirection: 'row', backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: Spacing.sm + 4, justifyContent: 'center', alignItems: 'center', gap: Spacing.sm },
  statusBtn:        { flex: 1, flexDirection: 'row', borderRadius: Radius.md, paddingVertical: Spacing.sm + 4, justifyContent: 'center', alignItems: 'center', gap: Spacing.sm },
  btnText:          { color: '#fff', fontSize: FontSize.sm, fontWeight: '700' },
});

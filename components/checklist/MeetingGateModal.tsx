// components/checklist/MeetingGateModal.tsx
// Phase-5: reusable modal for opening and closing meeting gates.
//
// Usage:
//   <MeetingGateModal
//     visible={showGate}
//     type="opening"          // or "closing"
//     facilityName="..."
//     onConfirm={() => { /* gate passed */ }}
//     onCancel={() => { /* user chose to abort */ }}
//   />
//
// The modal cannot be confirmed until all required checkboxes are ticked.
// Cancelling an OPENING gate navigates the inspector back (handled by caller).
// Cancelling a CLOSING gate keeps the inspector on the checklist.

import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '../../constants';

// ─── types ───────────────────────────────────────────────────────────────────────

export type MeetingGateType = 'opening' | 'closing';

interface CheckItem {
  key: string;
  label: string;
}

const OPENING_CHECKS: CheckItem[] = [
  { key: 'permit',  label: 'تم التحقق من ترخيص المنشأة ووثائق النشاط' },
  { key: 'rep',     label: 'تم التحقق من هوية ممثل المنشأة' },
  { key: 'scope',   label: 'تم إبلاغ ممثل المنشأة بنطاق ومحاور التفتيش' },
];

const CLOSING_CHECKS: CheckItem[] = [
  { key: 'communicated', label: 'تم إبلاغ ممثل المنشأة بنتائج التفتيش شفهياً قبل التوقيع' },
  { key: 'ack',          label: 'أقرّ ممثل المنشأة باستلام النتائج والإشعار بالمخالفات' },
];

interface Props {
  visible:      boolean;
  type:         MeetingGateType;
  facilityName: string;
  onConfirm:    () => void;
  onCancel:     () => void;
}

// ─── component ───────────────────────────────────────────────────────────────────────

export default function MeetingGateModal({
  visible, type, facilityName, onConfirm, onCancel,
}: Props) {
  const isOpening = type === 'opening';
  const checks    = isOpening ? OPENING_CHECKS : CLOSING_CHECKS;

  const [ticked, setTicked] = useState<Record<string, boolean>>({});

  // Reset ticks whenever the modal opens
  useEffect(() => {
    if (visible) setTicked({});
  }, [visible]);

  const toggle = (key: string) =>
    setTicked(prev => ({ ...prev, [key]: !prev[key] }));

  const allTicked = checks.every(c => ticked[c.key]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>

          {/* ── Header ── */}
          <View style={[styles.header, { backgroundColor: isOpening ? Colors.primary : '#e67e22' }]}>
            <FontAwesome
              name={isOpening ? 'handshake-o' : 'check-circle'}
              size={22}
              color="#fff"
            />
            <Text style={styles.headerTitle}>
              {isOpening ? 'اجتماع الافتتاح' : 'اجتماع الإختتام'}
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.body}>

            {/* Facility name */}
            <Text style={styles.facilityLabel}>المنشأة</Text>
            <Text style={styles.facilityName}>{facilityName}</Text>

            {/* Instruction */}
            <Text style={styles.instruction}>
              {isOpening
                ? 'يجب إتمام الإجراءات التالية قبل بدء قائمة التفتيش:'
                : 'يجب إتمام الإجراءات التالية قبل إغلاق التفتيش وتصدير التقرير:'}
            </Text>

            {/* Checklist */}
            {checks.map(item => (
              <TouchableOpacity
                key={item.key}
                style={styles.checkRow}
                onPress={() => toggle(item.key)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, ticked[item.key] && styles.checkboxTicked]}>
                  {ticked[item.key] && (
                    <FontAwesome name="check" size={12} color="#fff" />
                  )}
                </View>
                <Text style={styles.checkLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}

            {/* Progress hint */}
            {!allTicked && (
              <View style={styles.hintRow}>
                <FontAwesome name="info-circle" size={13} color={Colors.textTertiary} />
                <Text style={styles.hintText}>
                  يجب تأشير جميع البنود لمتابعة التفتيش
                </Text>
              </View>
            )}
          </ScrollView>

          {/* ── Action buttons ── */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelBtnText}>
                {isOpening ? 'إلغاء التفتيش' : 'العودة للقائمة'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, !allTicked && styles.confirmBtnDisabled]}
              onPress={allTicked ? onConfirm : undefined}
              activeOpacity={allTicked ? 0.85 : 1}
            >
              <FontAwesome name="arrow-left" size={15} color="#fff" style={{ opacity: allTicked ? 1 : 0.4 }} />
              <Text style={[styles.confirmBtnText, !allTicked && { opacity: 0.4 }]}>
                {isOpening ? 'بدء التفتيش' : 'إغلاق وتأكيد'}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:            { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet:              { backgroundColor: Colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden', maxHeight: '85%' },
  header:             { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.lg },
  headerTitle:        { color: '#fff', fontSize: FontSize.lg, fontWeight: '700', flex: 1, textAlign: 'right' },
  body:               { padding: Spacing.lg, paddingBottom: Spacing.sm },
  facilityLabel:      { fontSize: FontSize.xs + 1, color: Colors.textTertiary, textAlign: 'right', textTransform: 'uppercase', marginBottom: 2 },
  facilityName:       { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, textAlign: 'right', marginBottom: Spacing.md },
  instruction:        { fontSize: FontSize.sm + 1, color: Colors.textSecondary, textAlign: 'right', marginBottom: Spacing.md, lineHeight: 22 },
  checkRow:           { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.md, paddingVertical: 2 },
  checkbox:           { width: 24, height: 24, borderRadius: Radius.sm, borderWidth: 2, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center', marginTop: 1, flexShrink: 0 },
  checkboxTicked:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkLabel:         { flex: 1, fontSize: FontSize.base, color: Colors.textPrimary, textAlign: 'right', lineHeight: 22 },
  hintRow:            { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surfaceOffset, borderRadius: Radius.sm, padding: Spacing.sm, marginTop: Spacing.sm },
  hintText:           { fontSize: FontSize.xs + 1, color: Colors.textTertiary, flex: 1, textAlign: 'right' },
  actions:            { flexDirection: 'row', padding: Spacing.md, gap: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  cancelBtn:          { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingVertical: Spacing.md, alignItems: 'center' },
  cancelBtnText:      { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  confirmBtn:         { flex: 2, flexDirection: 'row', backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: Spacing.md, justifyContent: 'center', alignItems: 'center', gap: Spacing.sm },
  confirmBtnDisabled: { backgroundColor: Colors.border },
  confirmBtnText:     { color: '#fff', fontSize: FontSize.sm, fontWeight: '700' },
});

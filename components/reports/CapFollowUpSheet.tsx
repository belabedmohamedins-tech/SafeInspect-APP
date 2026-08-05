/**
 * components/reports/CapFollowUpSheet.tsx
 *
 * Bottom sheet showing CAP (Corrective Action Plan) follow-up details for a
 * given inspection report.  This is a stub — full implementation is planned
 * in a later phase.
 *
 * Props:
 *   visible       — controls sheet visibility
 *   inspectionId  — the inspection whose CAPs are displayed
 *   onClose       — called when the user dismisses the sheet
 */

import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, Radius } from '../../constants';

interface Props {
  visible: boolean;
  inspectionId?: string;
  onClose: () => void;
}

export default function CapFollowUpSheet({ visible, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>متابعة خطة الإجراءات التصحيحية</Text>
          <Text style={styles.body}>لا توجد إجراءات تصحيحية مرتبطة بهذا التقرير حتى الآن.</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>إغلاق</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.xl,
    minHeight: 200,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'right',
  },
  body: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginBottom: Spacing.xl,
  },
  closeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  closeBtnText: {
    color: Colors.textInverse,
    fontWeight: '600',
    fontSize: FontSize.base,
  },
});

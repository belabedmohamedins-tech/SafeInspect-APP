// src/components/RepeatViolationBadge.tsx
//
// Phase-2: Visual badge shown on checklist items that are repeat violations.
//
// Usage:
//   <RepeatViolationBadge
//     visible={item.isRepeatViolation === true}
//     priorStatus={item.priorInspectionStatus}
//   />
//
// The badge renders nothing when visible === false, so it is safe to mount
// unconditionally in the checklist item row.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ComplianceStatus } from '../types';

interface Props {
  /** Show the badge only when true. */
  visible: boolean;
  /** The status this criterion had in the prior inspection (optional display). */
  priorStatus?: ComplianceStatus;
}

const LABEL = 'تكرار — كان غير مطابق في الزيارة السابقة';

export function RepeatViolationBadge({ visible, priorStatus: _priorStatus }: Props) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.icon} accessibilityLabel="تكرار مخالفة">
        🔁
      </Text>
      <Text style={styles.label}>{LABEL}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FEF3C7',   // amber-100 — warm warning, not red
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  icon: {
    fontSize: 13,
  },
  label: {
    fontSize: 12,
    color: '#92400E',              // amber-800 for contrast
    fontWeight: '600',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
});

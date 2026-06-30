// src/components/DiffStatusIndicator.tsx
//
// Phase-3: Inline diff status pip for checklist item rows.
//
// Shows:
//   ✓ تم التصحيح      (green)  — was non-compliant, now compliant
//   ⚠ لا يزال غير مطابق (red) — was non-compliant, still non-compliant
//   🆕 مخالفة جديدة    (orange) — new violation not in prior inspection
//
// Renders nothing for 'unchanged', 'not-in-prior', or when not in
// follow-up mode (pass visible={false}).
//
// Usage (inside checklist item row, follow-up mode only):
//   <DiffStatusIndicator diffStatus={diffEntry?.diffStatus} />

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DiffStatus } from '../services/differentialView';

interface Props {
  diffStatus?: DiffStatus;
}

export function DiffStatusIndicator({ diffStatus }: Props) {
  if (!diffStatus || diffStatus === 'unchanged' || diffStatus === 'not-in-prior') {
    return null;
  }

  const config = STATUS_CONFIG[diffStatus];

  return (
    <View style={[styles.container, { backgroundColor: config.bg }]}>
      <Text style={styles.icon}>{config.icon}</Text>
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const STATUS_CONFIG: Record<
  Exclude<DiffStatus, 'unchanged' | 'not-in-prior'>,
  { icon: string; label: string; bg: string; color: string }
> = {
  resolved: {
    icon: '✓',
    label: 'تم التصحيح',
    bg: '#d4edda',
    color: '#155724',
  },
  'still-failing': {
    icon: '⚠',
    label: 'لا يزال غير مطابق',
    bg: '#f8d7da',
    color: '#721c24',
  },
  'new-violation': {
    icon: '🆕',
    label: 'مخالفة جديدة',
    bg: '#fff3cd',
    color: '#856404',
  },
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  icon: {
    fontSize: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
  },
});

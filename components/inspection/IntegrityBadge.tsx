// components/inspection/IntegrityBadge.tsx
// Shows verified / tampered / pending integrity status for a completed inspection
import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../constants';
import { IntegrityService } from '../../src/services/IntegrityService';
import { SavedInspection } from '../../src/types';

type Status = 'loading' | 'verified' | 'tampered' | 'no-hash';

interface Props {
  inspection: SavedInspection;
}

const CONFIG: Record<Exclude<Status, 'loading'>, { icon: string; label: string; color: string; bg: string }> = {
  verified:  { icon: 'shield',       label: 'موثق وسليم',    color: Colors.success, bg: Colors.success + '18' },
  tampered:  { icon: 'exclamation-triangle', label: 'تحذير: تم التعديل', color: Colors.danger,  bg: Colors.danger  + '18' },
  'no-hash': { icon: 'clock-o',      label: 'لا يوجد بصمة',  color: Colors.textSecondary, bg: Colors.surfaceOffset },
};

export default function IntegrityBadge({ inspection }: Props) {
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (inspection.status !== 'completed') { if (!cancelled) setStatus('no-hash'); return; }
      const result = await IntegrityService.verifyInspection(inspection);
      if (cancelled) return;
      if (!result.storedHash) setStatus('no-hash');
      else setStatus(result.ok ? 'verified' : 'tampered');
    })();
    return () => { cancelled = true; };
  }, [inspection]);

  if (status === 'loading') return null;

  const cfg = CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.color + '44' }]}>
      <FontAwesome name={cfg.icon as any} size={13} color={cfg.color} />
      <Text style={[styles.label, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});

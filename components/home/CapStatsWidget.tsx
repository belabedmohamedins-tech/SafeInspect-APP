// components/home/CapStatsWidget.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { CapStats, CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';

export default function CapStatsWidget() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const push = router.push as (href: any) => void;
  const [stats, setStats] = useState<CapStats | null>(null);

  useEffect(() => {
    CorrectiveActionRepository.getStats().then(setStats);
  }, []);

  if (!stats || stats.total === 0) return null;

  const handlePress = () => {
    push({ pathname: '/(tabs)/actions', params: { highlight: 'overdue' } });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.85}>
      <View style={styles.titleRow}>
        <MaterialIcons name="assignment" size={18} color="#1e40af" />
        <Text style={styles.title}>الإجراءات التصحيحية</Text>
      </View>

      <View style={styles.statsRow}>
        <StatItem label="مفتوحة"    value={stats.open}       color="#3b82f6" />
        <StatItem label="قيد التنفيذ" value={stats.inProgress} color="#f59e0b" />
        <StatItem label="متأخرة"    value={stats.overdue}    color="#dc2626" />
        <StatItem label="مُغلَقة"    value={stats.resolved}   color="#16a34a" />
      </View>

      {stats.overdue > 0 && (
        <View style={styles.warningBanner}>
          <MaterialIcons name="warning" size={14} color="#dc2626" />
          <Text style={styles.warningText}>
            {stats.overdue} إجراء متأخر — يستوجب تدخلاً فورياً
          </Text>
        </View>
      )}

      {stats.nearDeadlineCount > 0 && stats.overdue === 0 && (
        <View style={styles.nearBanner}>
          <MaterialIcons name="schedule" size={14} color="#f59e0b" />
          <Text style={styles.nearText}>
            {stats.nearDeadlineCount} إجراء يقترب موعد إغلاقه
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function StatItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, justifyContent: 'flex-end' },
  title: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 2, textAlign: 'center' },
  warningBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fef2f2', borderRadius: 8, padding: 8, justifyContent: 'flex-end',
  },
  warningText: { fontSize: 12, color: '#dc2626', fontWeight: '600', textAlign: 'right' },
  nearBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fffbeb', borderRadius: 8, padding: 8, justifyContent: 'flex-end',
  },
  nearText: { fontSize: 12, color: '#f59e0b', fontWeight: '600', textAlign: 'right' },
});

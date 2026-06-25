import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants';

interface Props {
  totalInspections: number;
  completedThisMonth: number;
  pendingCount: number;
}

export default function StatsBar({ totalInspections, completedThisMonth, pendingCount }: Props) {
  return (
    <View style={styles.container}>
      <StatItem label="إجمالي" value={totalInspections} color={Colors.primary} />
      <View style={styles.separator} />
      <StatItem label="هذا الشهر" value={completedThisMonth} color={Colors.success} />
      <View style={styles.separator} />
      <StatItem label="مسودات" value={pendingCount} color={Colors.warning} />
    </View>
  );
}

function StatItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.item}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: Colors.textInverse, marginHorizontal: 12, marginTop: 6, marginBottom: 10, padding: 14, borderRadius: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2 },
  item:       { alignItems: 'center', flex: 1 },
  value:      { fontSize: 24, fontWeight: 'bold' },
  label:      { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  separator:  { width: 1, height: 32, backgroundColor: Colors.border },
});

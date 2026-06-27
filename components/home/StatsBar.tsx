import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants';

interface Props {
  totalCompleted: number;
  totalDrafts: number;
  nonCompliantFacilities: number;
  openCapCount: number;
}

export default function StatsBar({
  totalCompleted,
  totalDrafts,
  nonCompliantFacilities,
  openCapCount,
}: Props) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatItem label="مكتمل" value={totalCompleted} color={Colors.primary} />
      <View style={styles.separator} />
      <StatItem label="مسودات" value={totalDrafts} color={Colors.warning} />
      <View style={styles.separator} />
      <StatItem label="غير مطابق" value={nonCompliantFacilities} color={Colors.danger} />
      <View style={styles.separator} />
      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push('/screens/cap')}
        activeOpacity={0.7}
      >
        <Text style={[styles.value, { color: openCapCount > 0 ? Colors.danger : Colors.success }]}>
          {openCapCount}
        </Text>
        <Text style={styles.label}>إجراءات مفتوحة</Text>
        {openCapCount > 0 && <View style={styles.dot} />}
      </TouchableOpacity>
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
  item:       { alignItems: 'center', flex: 1, position: 'relative' },
  value:      { fontSize: 22, fontWeight: 'bold' },
  label:      { fontSize: 11, color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },
  separator:  { width: 1, height: 32, backgroundColor: Colors.border },
  dot:        { position: 'absolute', top: 0, right: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger },
});

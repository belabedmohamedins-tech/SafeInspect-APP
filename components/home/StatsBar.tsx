import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BLUE, Colors } from '../../constants';

interface Props {
  totalCompleted: number;
  totalDrafts: number;
  nonCompliantFacilities: number;
}

export default function StatsBar({ totalCompleted, totalDrafts, nonCompliantFacilities }: Props) {
  return (
    <View style={styles.container}>
      <StatCard icon="clipboard"           value={totalCompleted}          label="تفتيش مكتمل" />
      <StatCard icon="pencil-square-o"     value={totalDrafts}             label="مسودة" />
      <StatCard icon="exclamation-triangle" value={nonCompliantFacilities} label="منشأة غير مطابقة" />
    </View>
  );
}

function StatCard({ icon, value, label }: { icon: any; value: number; label: string }) {
  return (
    <View style={styles.card}>
      <FontAwesome name={icon} size={24} color={BLUE} />
      <Text style={styles.number}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-around', padding: 16, backgroundColor: Colors.textInverse, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: Colors.surfaceOffset },
  card:   { alignItems: 'center', flex: 1 },
  number: { fontSize: 24, fontWeight: 'bold', color: Colors.textPrimary, marginTop: 4 },
  label:  { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
});
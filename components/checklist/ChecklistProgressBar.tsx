import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants';

interface Props {
  evaluated: number;
  total: number;
  percent: number;
}

export default function ChecklistProgressBar({ evaluated, total, percent }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>
      <Text style={styles.label}>
        {evaluated} / {total} — {percent.toFixed(0)}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.background },
  track:     { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  fill:      { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  label:     { fontSize: 12, color: Colors.textSecondary, marginTop: 4, textAlign: 'right' },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius } from '../../constants';

interface Props {
  evaluated: number;
  total: number;
  percent: number;
}

export default function ChecklistProgressBar({ evaluated, total, percent }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` as any }]} />
      </View>
      <Text style={styles.label}>
        {evaluated}/{total} ({percent.toFixed(1)}%)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.textInverse,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  track: { flex: 1, height: 8, backgroundColor: Colors.surfaceOffset, borderRadius: Radius.sm, marginRight: 10 },
  fill: { height: 8, backgroundColor: Colors.success, borderRadius: Radius.sm },
  label: { fontSize: 12, color: Colors.textSecondary },
});

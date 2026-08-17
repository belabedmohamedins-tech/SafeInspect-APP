// components/home/PriorityWidget.tsx
// W71 — surfaces top-priority facilities (grade C/D or ≥3 high violations)
// so the inspector knows which facilities need reinspection first.
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { PriorityFacility } from '../../src/utils/loadHomeData';
import { Colors } from '../../constants';

const GRADE_COLOR: Record<string, string> = {
  A: '#22c55e',
  B: '#f59e0b',
  C: '#f97316',
  D: '#ef4444',
};

interface Props {
  facilities: PriorityFacility[];
}

export default function PriorityWidget({ facilities }: Props) {
  const router = useRouter();
  if (facilities.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name="alert-triangle" size={16} color="#f97316" />
        <Text style={styles.title}>منشآت تستوجب إعادة التفتيش</Text>
      </View>

      {facilities.map(f => (
        <TouchableOpacity
          key={f.facilityId}
          style={styles.row}
          onPress={() => router.push('/screens/facilities')}
          activeOpacity={0.7}
        >
          <View style={[styles.gradeBadge, { backgroundColor: GRADE_COLOR[f.grade] ?? '#9ca3af' }]}>
            <Text style={styles.gradeText}>{f.grade}</Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{f.facilityName}</Text>
            {f.highViolations > 0 && (
              <Text style={styles.violations}>
                {f.highViolations} مخالفة عالية الخطورة
              </Text>
            )}
          </View>

          <Feather name="chevron-left" size={16} color={(Colors as any).textMuted ?? '#9ca3af'} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical:   8,
    backgroundColor:  '#fff7ed',
    borderRadius:     12,
    borderWidth:      1,
    borderColor:      '#fed7aa',
    padding:          12,
  },
  header: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            6,
    marginBottom:   10,
  },
  title: {
    fontSize:   14,
    fontWeight: '700',
    color:      '#c2410c',
    textAlign:  'right',
    flex:       1,
  },
  row: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingVertical: 8,
    gap:             10,
    borderTopWidth:  1,
    borderTopColor:  '#fed7aa',
  },
  gradeBadge: {
    width:          32,
    height:         32,
    borderRadius:   8,
    alignItems:     'center',
    justifyContent: 'center',
  },
  gradeText: {
    color:      '#fff',
    fontWeight: '800',
    fontSize:   13,
  },
  info: {
    flex:       1,
    alignItems: 'flex-end',
  },
  name: {
    fontSize:   13,
    fontWeight: '600',
    color:      '#1c1917',
    textAlign:  'right',
  },
  violations: {
    fontSize:  11,
    color:     '#ef4444',
    marginTop: 2,
    textAlign: 'right',
  },
});

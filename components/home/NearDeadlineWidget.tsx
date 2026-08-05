// components/home/NearDeadlineWidget.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { CorrectiveAction } from '../../src/types';
import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';

const NEAR_DAYS = 7;

export default function NearDeadlineWidget() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const push = router.push as (href: any) => void;
  const [items, setItems] = useState<CorrectiveAction[]>([]);

  useEffect(() => {
    (async () => {
      const open   = await CorrectiveActionRepository.getOpen();
      const today  = new Date().toISOString().slice(0, 10);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + NEAR_DAYS);
      const cutoffStr = cutoff.toISOString().slice(0, 10);

      const near = open.filter(
        a => a.deadline >= today && a.deadline <= cutoffStr,
      );
      setItems(near.slice(0, 5));
    })();
  }, []);

  if (items.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <MaterialIcons name="schedule" size={18} color="#f59e0b" />
        <Text style={styles.title}>مواعيد قريبة ({items.length})</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={i => i.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              push({ pathname: '/(tabs)/actions', params: { filter: 'open' } })
            }
          >
            <View style={styles.rowLeft}>
              <Text style={styles.deadline}>{item.deadline}</Text>
              <DaysLeft deadline={item.deadline} />
            </View>
            <Text style={styles.finding} numberOfLines={2}>
              {item.finding ?? item.criteria}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function DaysLeft({ deadline }: { deadline: string }) {
  const today = new Date().toISOString().slice(0, 10);
  const diff  = Math.ceil(
    (new Date(deadline).getTime() - new Date(today).getTime()) / 86_400_000,
  );
  const color = diff <= 2 ? '#dc2626' : diff <= 5 ? '#f59e0b' : '#16a34a';
  return (
    <Text style={[styles.daysLeft, { color }]}>
      {diff === 0 ? 'اليوم' : diff === 1 ? 'غداً' : `${diff} أيام`}
    </Text>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  titleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 10, justifyContent: 'flex-end',
  },
  title: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9',
  },
  rowLeft: { alignItems: 'center', minWidth: 56 },
  deadline: { fontSize: 11, color: '#64748b' },
  daysLeft: { fontSize: 13, fontWeight: '800' },
  finding: { flex: 1, fontSize: 13, color: '#1e293b', textAlign: 'right', marginLeft: 12 },
});

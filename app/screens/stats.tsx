import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants';
import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import { SettingsRepository } from '../../src/repositories/SettingsRepository';
import { computeStats, StatsCache } from '../../src/utils/statsUtils';

export default function StatsScreen() {
  const [stats, setStats] = useState<StatsCache | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [topViolations, setTopViolations] = useState<{ criteria: string; count: number }[]>([]);

  const loadStats = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const { statsCache } = await SettingsRepository.get();
        if (statsCache) {
          setStats(statsCache);
          setLoading(false);
          return;
        }
      }
      const all = await InspectionRepository.getCompleted();
      const computed = computeStats(all);
      setStats(computed);
      const violations = all
        .flatMap(i => i.items.filter(it => it.complianceStatus === 'non-compliant'))
        .reduce((acc: Record<string, number>, item) => {
          acc[item.criteria] = (acc[item.criteria] || 0) + 1;
          return acc;
        }, {});
      setTopViolations(
        Object.entries(violations)
          .map(([criteria, count]) => ({ criteria, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      );
    } catch (error) {
      console.error('Error loading stats', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadStats(); }, []));

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStats(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>الإحصائيات العامة</Text>
          <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
            <FontAwesome
              name="refresh"
              size={20}
              color={refreshing ? Colors.border : Colors.primary}
            />
          </TouchableOpacity>
        </View>

        {stats && (
          <>
            <View style={styles.row}>
              <StatCard label="إجمالي التفتيشات" value={stats.totalInspections} />
              <StatCard label="المطابقة" value={stats.compliantCount} color={Colors.success} />
              <StatCard label="غير المطابقة" value={stats.nonCompliantCount} color={Colors.danger} />
            </View>
            <View style={styles.row}>
              <StatCard label="متوسط الدرجات" value={`${stats.averageScore?.toFixed(1) ?? 'N/A'}%`} />
              <StatCard label="بنود تم تقييمها" value={stats.totalItemsEvaluated} />
              <StatCard label="مخالفات" value={stats.totalNonCompliantItems} color={Colors.warning} />
            </View>

            {topViolations.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>أكثر المخالفات تكراراً</Text>
                {topViolations.map((v, i) => (
                  <View key={i} style={styles.violationRow}>
                    <Text style={styles.violationCount}>{v.count}×</Text>
                    <Text style={styles.violationText}>{v.criteria}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, color }: { label: string; value: any; color?: string }) {
  return (
    <View style={styles.card}>
      <Text style={[styles.cardValue, color ? { color } : { color: Colors.primary }]}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea:       { flex: 1 },
  centered:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content:        { padding: 16 },
  headerRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  pageTitle:      { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary },
  row:            { flexDirection: 'row', gap: 10, marginBottom: 10 },
  card: {
    flex: 1,
    backgroundColor: Colors.textInverse,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  cardValue:      { fontSize: 32, fontWeight: 'bold', marginBottom: 4 },
  cardLabel:      { fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },
  section:        { backgroundColor: Colors.textInverse, borderRadius: 10, padding: 14, marginTop: 10, elevation: 1 },
  sectionTitle:   { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginBottom: 10 },
  violationRow:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  violationCount: { fontSize: 14, fontWeight: 'bold', color: Colors.danger, marginRight: 8, minWidth: 32 },
  violationText:  { fontSize: 14, color: Colors.textSecondary, flex: 1 },
});

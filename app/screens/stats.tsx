import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/colors';
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
        // Fast path: use the cache written by InspectionRepository
        const { statsCache } = await SettingsRepository.get();
        if (statsCache) {
          setStats(statsCache);
          setLoading(false);
        }
      }

      if (forceRefresh) setRefreshing(true);

      // Always recompute from source — InspectionRepository.writeAll()
      // keeps the cache consistent; we never write it here.
      const completed = await InspectionRepository.getCompleted();
      if (completed.length > 0) {
        const freshStats = computeStats(completed);
        setStats(freshStats);

        // Top 5 most frequent non-compliant criteria
        const violationCount: { [key: string]: number } = {};
        completed.forEach(ins => {
          ins.items.forEach(item => {
            if (item.complianceStatus === 'non-compliant') {
              violationCount[item.criteria] = (violationCount[item.criteria] || 0) + 1;
            }
          });
        });
        const sorted = Object.entries(violationCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([criteria, count]) => ({ criteria, count }));
        setTopViolations(sorted);
      } else {
        setStats({
          total: 0,
          gradeCounts: { A: 0, B: 0, C: 0, D: 0 },
          averageScore: 'N/A',
          lastUpdated: Date.now(),
        });
        setTopViolations([]);
      }
    } catch (error) {
      console.error('Failed to load stats', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const handleRefresh = () => loadStats(true);

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'A': return '#27ae60';
      case 'B': return '#3498db';
      case 'C': return '#f39c12';
      case 'D': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  if (loading && !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.blue} />
        </View>
      </SafeAreaView>
    );
  }

  if (!stats) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>لوحة التحكم</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <FontAwesome name="refresh" size={20} color={Colors.blue} />
          </TouchableOpacity>
        </View>
        {refreshing && <Text style={styles.refreshText}>جاري التحديث...</Text>}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>إجمالي التفتيشات المكتملة</Text>
          <Text style={styles.cardValue}>{stats.total}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>متوسط النتيجة</Text>
          <Text style={styles.cardValue}>{stats.averageScore}%</Text>
        </View>

        <Text style={styles.subtitle}>التوزيع حسب الفئة</Text>
        <View style={styles.gradesContainer}>
          {(['A', 'B', 'C', 'D'] as const).map(grade => (
            <View key={grade} style={styles.gradeItem}>
              <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(grade) }]}>
                <Text style={styles.gradeBadgeText}>{grade}</Text>
              </View>
              <Text style={styles.gradeCount}>{stats.gradeCounts[grade]}</Text>
            </View>
          ))}
        </View>

        {stats.total > 0 && (
          <View style={styles.distribution}>
            <Text style={styles.subtitle}>نسبة التوزيع</Text>
            {(['A', 'B', 'C', 'D'] as const).map(grade => {
              const count = stats.gradeCounts[grade];
              const percentage = (count / stats.total * 100).toFixed(1);
              return (
                <View key={grade} style={styles.barContainer}>
                  <Text style={styles.barLabel}>{grade}</Text>
                  <View style={styles.barBackground}>
                    <View style={[styles.barFill, { width: `${percentage}%` as any, backgroundColor: getGradeColor(grade) }]} />
                  </View>
                  <Text style={styles.barPercent}>{percentage}%</Text>
                </View>
              );
            })}
          </View>
        )}

        {topViolations.length > 0 && (
          <View style={styles.violationsCard}>
            <Text style={styles.subtitle}>أكثر المخالفات شيوعاً</Text>
            {topViolations.map((item, idx) => (
              <View key={idx} style={styles.violationItem}>
                <Text style={styles.violationRank}>{idx + 1}</Text>
                <Text style={styles.violationCriteria}>{item.criteria}</Text>
                <Text style={styles.violationCount}>{item.count}</Text>
              </View>
            ))}
          </View>
        )}

        {stats.total === 0 && (
          <View style={styles.emptyContainer}>
            <FontAwesome name="file-text" size={50} color="#bdc3c7" />
            <Text style={styles.emptyText}>لا توجد تفتيشات مكتملة بعد</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, alignItems: 'center' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center', flex: 1 },
  refreshButton: { padding: 8 },
  refreshText: { fontSize: 12, color: '#7f8c8d', marginBottom: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, color: '#7f8c8d', marginBottom: 8 },
  cardValue: { fontSize: 32, fontWeight: 'bold', color: Colors.blue },
  subtitle: { fontSize: 18, fontWeight: '600', color: '#2c3e50', marginTop: 10, marginBottom: 15, alignSelf: 'flex-start' },
  gradesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  gradeItem: { alignItems: 'center' },
  gradeBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gradeBadgeText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  gradeCount: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  distribution: { width: '100%', marginTop: 10 },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  barLabel: {
    width: 30,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  barBackground: {
    flex: 1,
    height: 20,
    backgroundColor: '#ecf0f1',
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 10,
  },
  barPercent: {
    width: 50,
    fontSize: 14,
    color: '#7f8c8d',
  },
  violationsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  violationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  violationRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.blue,
    width: 40,
  },
  violationCriteria: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
    marginHorizontal: 8,
    textAlign: 'right',
  },
  violationCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e74c3c',
    width: 40,
    textAlign: 'center',
  },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 16, color: '#95a5a6', marginTop: 10 },
});

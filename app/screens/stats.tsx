// app/screens/stats.tsx
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../../constants';
import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';
import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import { SettingsRepository } from '../../src/repositories/SettingsRepository';
import { CapReportService } from '../../src/services/CapReportService';
import { CorrectiveAction } from '../../src/types';
import { computeStats, StatsCache } from '../../src/utils/statsUtils';

const GRADE_COLORS: Record<string, string> = {
  A: Colors.gradeA,
  B: Colors.gradeB,
  C: Colors.gradeC,
  D: Colors.gradeD,
};
const getGradeColor = (grade: string) => GRADE_COLORS[grade] ?? Colors.textTertiary;

// ─── CAP summary helpers ──────────────────────────────────────────────────────

interface CapSummary {
  open:       number;
  inProgress: number;
  overdue:    number;
  resolved:   number;
}

function buildCapSummary(items: CorrectiveAction[]): CapSummary {
  return items.reduce(
    (acc, item) => {
      if (item.status === 'open')             acc.open++;
      else if (item.status === 'in-progress') acc.inProgress++;
      else if (item.status === 'overdue')     acc.overdue++;
      else if (item.status === 'resolved')    acc.resolved++;
      return acc;
    },
    { open: 0, inProgress: 0, overdue: 0, resolved: 0 } as CapSummary,
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StatsScreen() {
  const router = useRouter();
  const [stats,         setStats]         = useState<StatsCache | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [exporting,     setExporting]     = useState(false);
  const [topViolations, setTopViolations] = useState<{ criteria: string; count: number }[]>([]);
  const [capSummary,    setCapSummary]    = useState<CapSummary>({ open: 0, inProgress: 0, overdue: 0, resolved: 0 });

  const loadStats = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const settings = await SettingsRepository.get();
        const cached = settings.statsCache as StatsCache | undefined;
        if (cached) {
          setStats(cached);
          setLoading(false);
        }
      }
      if (forceRefresh) setRefreshing(true);

      const [completed, allCap] = await Promise.all([
        InspectionRepository.getCompleted(),
        CorrectiveActionRepository.getAll(),
      ]);

      setCapSummary(buildCapSummary(allCap));

      if (completed.length > 0) {
        const freshStats = computeStats(completed);
        await SettingsRepository.set({ statsCache: freshStats as any });
        setStats(freshStats);

        const violationCount: Record<string, number> = {};
        completed.forEach(ins =>
          ins.items.forEach(item => {
            if (item.complianceStatus === 'non-compliant') {
              violationCount[item.criteria] = (violationCount[item.criteria] ?? 0) + 1;
            }
          })
        );
        setTopViolations(
          Object.entries(violationCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([criteria, count]) => ({ criteria, count }))
        );
      } else {
        setStats({ total: 0, gradeCounts: { A: 0, B: 0, C: 0, D: 0 }, averageScore: 'N/A', lastUpdated: Date.now() });
        setTopViolations([]);
      }
    } catch (error) {
      console.error('Failed to load stats', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadStats(); }, []));

  const handleExportCap = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      await CapReportService.export('open');
    } finally {
      setExporting(false);
    }
  };

  if (loading && !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!stats) return null;

  const totalCap = capSummary.open + capSummary.inProgress + capSummary.overdue + capSummary.resolved;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>لوحة التحكم</Text>
          <TouchableOpacity onPress={() => loadStats(true)} style={styles.refreshButton}>
            <FontAwesome name="refresh" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        {refreshing && <Text style={styles.refreshText}>جاري التحديث...</Text>}

        {/* KPI cards */}
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { flex: 1 }]}>
            <Text style={styles.kpiLabel}>إجمالي التفتيشات</Text>
            <Text style={styles.kpiValue}>{stats.total}</Text>
          </View>
          <View style={[styles.kpiCard, { flex: 1 }]}>
            <Text style={styles.kpiLabel}>متوسط النتيجة</Text>
            <Text style={styles.kpiValue}>{stats.averageScore}%</Text>
          </View>
        </View>

        {/* ── CAP Summary card ── */}
        <TouchableOpacity
          style={styles.capCard}
          onPress={() => router.push('/screens/cap')}
          activeOpacity={0.8}
        >
          <View style={styles.capHeader}>
            <Text style={styles.subtitle}>الإجراءات التصحيحية</Text>
            <FontAwesome name="chevron-left" size={14} color={Colors.textSecondary} />
          </View>

          <View style={styles.capRow}>
            <CapPill label="مفتوح"    value={capSummary.open}       color={Colors.warning} />
            <CapPill label="جارٍ"      value={capSummary.inProgress} color={Colors.primary} />
            <CapPill label="متأخر"    value={capSummary.overdue}    color={Colors.danger}  />
            <CapPill label="مُغلق"     value={capSummary.resolved}   color={Colors.success} />
          </View>

          {totalCap > 0 && (
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(capSummary.resolved / totalCap) * 100}%` as any },
                ]}
              />
            </View>
          )}
          {totalCap > 0 && (
            <Text style={styles.progressLabel}>
              {((capSummary.resolved / totalCap) * 100).toFixed(0)}% مكتمل
            </Text>
          )}
        </TouchableOpacity>

        {/* Export CAP button */}
        <TouchableOpacity
          style={styles.exportBtn}
          onPress={handleExportCap}
          disabled={exporting}
          activeOpacity={0.8}
        >
          {exporting
            ? <ActivityIndicator size="small" color={Colors.textInverse} />
            : <FontAwesome name="share" size={15} color={Colors.textInverse} />}
          <Text style={styles.exportBtnText}>
            {exporting ? 'جارٍ التصدير...' : 'تصدير تقرير CAP — PDF'}
          </Text>
        </TouchableOpacity>

        {/* Grade bubbles */}
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

        {/* Distribution bars */}
        {stats.total > 0 && (
          <View style={styles.distribution}>
            <Text style={styles.subtitle}>نسبة التوزيع</Text>
            {(['A', 'B', 'C', 'D'] as const).map(grade => {
              const pct = (stats.gradeCounts[grade] / stats.total * 100).toFixed(1);
              return (
                <View key={grade} style={styles.barContainer}>
                  <Text style={[styles.barLabel, { color: getGradeColor(grade) }]}>{grade}</Text>
                  <View style={styles.barBackground}>
                    <View style={[styles.barFill, { width: `${pct}%` as any, backgroundColor: getGradeColor(grade) }]} />
                  </View>
                  <Text style={styles.barPercent}>{pct}%</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Top violations */}
        {topViolations.length > 0 && (
          <View style={styles.violationsCard}>
            <Text style={styles.subtitle}>أكثر المخالفات شيوعاً</Text>
            {topViolations.map((item, idx) => (
              <View key={idx} style={[
                styles.violationItem,
                idx === topViolations.length - 1 && { borderBottomWidth: 0 },
              ]}>
                <Text style={styles.violationRank}>{idx + 1}</Text>
                <Text style={styles.violationCriteria}>{item.criteria}</Text>
                <Text style={styles.violationCount}>{item.count}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Empty state */}
        {stats.total === 0 && (
          <View style={styles.emptyContainer}>
            <FontAwesome name="bar-chart" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>لا توجد تفتيشات مكتملة بعد</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── CapPill sub-component ────────────────────────────────────────────────────
function CapPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={capStyles.pill}>
      <Text style={[capStyles.value, { color }]}>{value}</Text>
      <Text style={capStyles.label}>{label}</Text>
    </View>
  );
}

const capStyles = StyleSheet.create({
  pill:  { alignItems: 'center', flex: 1 },
  value: { fontSize: 22, fontWeight: 'bold' },
  label: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
});

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.background },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent:{ padding: Spacing.lg, alignItems: 'center' },
  headerRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: Spacing.lg },
  title:        { fontSize: FontSize.hero, fontWeight: 'bold', color: Colors.textPrimary, flex: 1, textAlign: 'center' },
  refreshButton:{ padding: Spacing.sm },
  refreshText:  { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  kpiRow:       { flexDirection: 'row', gap: Spacing.md, width: '100%', marginBottom: Spacing.lg },
  kpiCard:      { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center', ...Shadow.sm },
  kpiLabel:     { fontSize: FontSize.base, color: Colors.textSecondary, marginBottom: Spacing.sm, textAlign: 'center' },
  kpiValue:     { fontSize: 32, fontWeight: 'bold', color: Colors.primary },
  subtitle:     { fontSize: FontSize.xl, fontWeight: '600', color: Colors.textPrimary, marginTop: Spacing.sm, marginBottom: Spacing.md, alignSelf: 'flex-start' },
  // CAP card
  capCard:      { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, width: '100%', marginBottom: Spacing.md, ...Shadow.sm },
  capHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  capRow:       { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.md },
  progressBg:   { height: 8, backgroundColor: Colors.surfaceOffset, borderRadius: Radius.full, overflow: 'hidden', marginBottom: Spacing.sm },
  progressFill: { height: '100%', backgroundColor: Colors.success, borderRadius: Radius.full },
  progressLabel:{ fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },
  // Export button
  exportBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.danger, borderRadius: Radius.lg, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, width: '100%', marginBottom: Spacing.lg, ...Shadow.sm },
  exportBtnText:{ fontSize: FontSize.base, fontWeight: '600', color: Colors.textInverse },
  // Grade bubbles
  gradesContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: Spacing.lg },
  gradeItem:    { alignItems: 'center' },
  gradeBadge:   { width: 50, height: 50, borderRadius: Radius.full, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm },
  gradeBadgeText:{ color: Colors.textInverse, fontSize: FontSize.xl, fontWeight: 'bold' },
  gradeCount:   { fontSize: FontSize.xl, fontWeight: 'bold', color: Colors.textPrimary },
  distribution: { width: '100%', marginTop: Spacing.sm },
  barContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  barLabel:     { width: 28, fontSize: FontSize.lg, fontWeight: 'bold' },
  barBackground:{ flex: 1, height: 18, backgroundColor: Colors.surfaceOffset, borderRadius: Radius.full, overflow: 'hidden', marginHorizontal: Spacing.sm },
  barFill:      { height: '100%', borderRadius: Radius.full },
  barPercent:   { width: 48, fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'right' },
  violationsCard:{ backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, width: '100%', marginTop: Spacing.lg, marginBottom: Spacing.lg, ...Shadow.sm },
  violationItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  violationRank: { fontSize: FontSize.lg, fontWeight: 'bold', color: Colors.primary, width: 32 },
  violationCriteria: { fontSize: FontSize.base, color: Colors.textPrimary, flex: 1, marginHorizontal: Spacing.sm, textAlign: 'right' },
  violationCount:    { fontSize: FontSize.base, fontWeight: 'bold', color: Colors.danger, width: 36, textAlign: 'center' },
  emptyContainer:    { alignItems: 'center', marginTop: Spacing.xxl },
  emptyText:         { fontSize: FontSize.lg, color: Colors.textTertiary, marginTop: Spacing.md },
});

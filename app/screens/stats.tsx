// app/screens/stats.tsx
// Enriched Statistics Dashboard (FR-076→082)
// KPIs, grade distribution, top violations, monthly trend, facility breakdown.
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity, I18nManager,
} from 'react-native';
import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';
import { SavedInspection } from '../../src/types';
import { ApprovalRepository } from '../../src/repositories/ApprovalRepository';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants';

I18nManager.forceRTL(true);

const GRADE_COLOR: Record<string, string> = {
  A: Colors.success,
  B: Colors.primary,
  C: Colors.warning,
  D: Colors.danger,
};

function gradeToNum(g?: string): number {
  return g === 'A' ? 4 : g === 'B' ? 3 : g === 'C' ? 2 : g === 'D' ? 1 : 0;
}

function thisWeekRange(): [Date, Date] {
  const now = new Date();
  const day = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return [start, end];
}

function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7); // YYYY-MM
}

function last6Months(): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return keys;
}

interface Stats {
  totalCompleted: number;
  thisWeek: number;
  avgScore: number;
  avgGrade: string;
  openCAPs: number;
  pendingApprovals: number;
  complianceRate: number;
  gradeDistribution: Record<string, number>;
  topViolations: { criteria: string; count: number }[];
  monthlyTrend: { month: string; count: number }[];
  facilityBreakdown: { name: string; grade?: string; score?: number; date: string }[];
}

async function computeStats(): Promise<Stats> {
  const [completed, openCAPs, approvalQueue] = await Promise.all([
    InspectionRepository.getCompleted(),
    CorrectiveActionRepository.getOpen(),
    ApprovalRepository.getPending(),
  ]);

  const [weekStart, weekEnd] = thisWeekRange();
  const thisWeek = completed.filter(i => {
    const d = new Date(i.date);
    return d >= weekStart && d < weekEnd;
  }).length;

  const scores = completed.map(i => i.score ?? 0).filter(s => s > 0);
  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;
  const avgGrade = avgScore >= 90 ? 'A' : avgScore >= 75 ? 'B' : avgScore >= 60 ? 'C' : avgScore > 0 ? 'D' : '—';

  // Compliance rate
  const complianceRate = completed.length
    ? Math.round(
        completed.filter(i => (i.score ?? 0) >= 75).length / completed.length * 100
      )
    : 0;

  // Grade distribution
  const gradeDistribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  completed.forEach(i => {
    const s = i.score ?? 0;
    const g = s >= 90 ? 'A' : s >= 75 ? 'B' : s >= 60 ? 'C' : s > 0 ? 'D' : null;
    if (g) gradeDistribution[g]++;
  });

  // Top violations (non-compliant criteria)
  const violationMap: Record<string, number> = {};
  completed.forEach(insp => {
    (insp.items ?? []).forEach(item => {
      if (item.status === 'non-compliant') {
        violationMap[item.criteria] = (violationMap[item.criteria] ?? 0) + 1;
      }
    });
  });
  const topViolations = Object.entries(violationMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([criteria, count]) => ({ criteria, count }));

  // Monthly trend (last 6 months)
  const months = last6Months();
  const monthlyTrend = months.map(month => ({
    month,
    count: completed.filter(i => monthKey(i.date) === month).length,
  }));

  // Facility breakdown (last 10)
  const facilityBreakdown = [...completed]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
    .map(i => ({
      name: i.facilityName,
      grade: i.grade,
      score: i.score,
      date: i.date,
    }));

  return {
    totalCompleted: completed.length,
    thisWeek,
    avgScore,
    avgGrade,
    openCAPs: openCAPs.length,
    pendingApprovals: approvalQueue.length,
    complianceRate,
    gradeDistribution,
    topViolations,
    monthlyTrend,
    facilityBreakdown,
  };
}

export default function StatsScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'trend' | 'violations' | 'facilities'>('overview');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const s = await computeStats();
      setStats(s);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!stats) return null;

  const TABS = [
    { key: 'overview',   label: 'نظرة عامة' },
    { key: 'trend',      label: 'الاتجاه' },
    { key: 'violations', label: 'المخالفات' },
    { key: 'facilities', label: 'المنشآت' },
  ] as const;

  const maxTrend = Math.max(...stats.monthlyTrend.map(m => m.count), 1);
  const maxViol  = Math.max(...stats.topViolations.map(v => v.count), 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ── Tabs ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Overview ── */}
      {activeTab === 'overview' && (
        <View style={styles.section}>
          {/* KPI row 1 */}
          <View style={styles.kpiRow}>
            <View style={[styles.kpiCard, { borderTopColor: Colors.primary }]}>
              <Text style={styles.kpiValue}>{stats.totalCompleted}</Text>
              <Text style={styles.kpiLabel}>تفتيش مكتمل</Text>
            </View>
            <View style={[styles.kpiCard, { borderTopColor: Colors.success }]}>
              <Text style={styles.kpiValue}>{stats.thisWeek}</Text>
              <Text style={styles.kpiLabel}>هذا الأسبوع</Text>
            </View>
          </View>
          {/* KPI row 2 */}
          <View style={styles.kpiRow}>
            <View style={[styles.kpiCard, { borderTopColor: Colors.warning }]}>
              <Text style={styles.kpiValue}>{stats.openCAPs}</Text>
              <Text style={styles.kpiLabel}>إجراءات مفتوحة</Text>
            </View>
            <View style={[styles.kpiCard, { borderTopColor: Colors.danger }]}>
              <Text style={styles.kpiValue}>{stats.pendingApprovals}</Text>
              <Text style={styles.kpiLabel}>في انتظار الموافقة</Text>
            </View>
          </View>
          {/* Avg score */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>متوسط النتيجة</Text>
            <View style={styles.scoreRow}>
              <Text style={[styles.bigGrade, { color: GRADE_COLOR[stats.avgGrade] ?? Colors.textSecondary }]}>
                {stats.avgGrade}
              </Text>
              <Text style={styles.bigScore}>{stats.avgScore}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, {
                width: `${stats.avgScore}%` as any,
                backgroundColor: GRADE_COLOR[stats.avgGrade] ?? Colors.primary,
              }]} />
            </View>
          </View>
          {/* Compliance */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>معدل الامتثال</Text>
            <Text style={[styles.bigScore, { color: stats.complianceRate >= 75 ? Colors.success : Colors.danger }]}>
              {stats.complianceRate}%
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, {
                width: `${stats.complianceRate}%` as any,
                backgroundColor: stats.complianceRate >= 75 ? Colors.success : Colors.danger,
              }]} />
            </View>
          </View>
          {/* Grade distribution */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>توزيع الدرجات</Text>
            {(['A','B','C','D'] as const).map(g => (
              <View key={g} style={styles.gradeRow}>
                <Text style={[styles.gradeLabel, { color: GRADE_COLOR[g] }]}>{g}</Text>
                <View style={styles.gradeTrack}>
                  <View style={[styles.gradeFill, {
                    width: stats.totalCompleted
                      ? `${Math.round(stats.gradeDistribution[g] / stats.totalCompleted * 100)}%` as any
                      : '0%' as any,
                    backgroundColor: GRADE_COLOR[g],
                  }]} />
                </View>
                <Text style={styles.gradeCount}>{stats.gradeDistribution[g]}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── Monthly trend ── */}
      {activeTab === 'trend' && (
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>التفتيشات الشهرية (آخر 6 أشهر)</Text>
            {stats.monthlyTrend.map(({ month, count }) => (
              <View key={month} style={styles.barRow}>
                <Text style={styles.barLabel}>{month.slice(5)}/{month.slice(2,4)}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, {
                    width: `${Math.round(count / maxTrend * 100)}%` as any,
                    backgroundColor: Colors.primary,
                  }]} />
                </View>
                <Text style={styles.barCount}>{count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── Top violations ── */}
      {activeTab === 'violations' && (
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>أكثر المعايير مخالفةً</Text>
            {stats.topViolations.length === 0 ? (
              <Text style={styles.emptyNote}>لا توجد مخالفات مسجّلة 🎉</Text>
            ) : stats.topViolations.map(({ criteria, count }, i) => (
              <View key={i} style={styles.violRow}>
                <Text style={styles.violRank}>#{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.violCriteria} numberOfLines={2}>{criteria}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, {
                      width: `${Math.round(count / maxViol * 100)}%` as any,
                      backgroundColor: Colors.danger,
                    }]} />
                  </View>
                </View>
                <Text style={styles.violCount}>{count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── Facility breakdown ── */}
      {activeTab === 'facilities' && (
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>آخر 10 منشآت تم تفتيشها</Text>
            {stats.facilityBreakdown.map((f, i) => (
              <View key={i} style={styles.facilityRow}>
                <View style={[styles.gradeChip, { backgroundColor: GRADE_COLOR[f.grade ?? ''] ?? Colors.border }]}>
                  <Text style={styles.gradeChipText}>{f.grade ?? '—'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.facilityName} numberOfLines={1}>{f.name}</Text>
                  <Text style={styles.facilityDate}>{f.date?.slice(0, 10)}</Text>
                </View>
                <Text style={[styles.facilityScore, { color: GRADE_COLOR[f.grade ?? ''] ?? Colors.textSecondary }]}>
                  {f.score ? `${f.score}%` : '—'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content:   { paddingBottom: Spacing.xxl },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center' },

  tabBar: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab:    { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText:   { fontSize: FontSize.sm, color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary, fontWeight: FontWeight.semibold },

  section: { padding: Spacing.md, gap: Spacing.md },
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, gap: Spacing.sm, ...Shadow.sm,
  },
  cardTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'right' },

  kpiRow:  { flexDirection: 'row', gap: Spacing.md },
  kpiCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, alignItems: 'center',
    borderTopWidth: 3, ...Shadow.sm,
  },
  kpiValue: { fontSize: 28, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  kpiLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.xs },

  scoreRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl, justifyContent: 'center' },
  bigGrade:  { fontSize: 56, fontWeight: FontWeight.bold },
  bigScore:  { fontSize: 36, fontWeight: FontWeight.bold, color: Colors.textPrimary },

  progressTrack: { height: 10, backgroundColor: Colors.border, borderRadius: Radius.full, overflow: 'hidden', marginTop: Spacing.sm },
  progressFill:  { height: '100%', borderRadius: Radius.full },

  gradeRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  gradeLabel: { width: 20, fontSize: FontSize.base, fontWeight: FontWeight.bold, textAlign: 'center' },
  gradeTrack: { flex: 1, height: 8, backgroundColor: Colors.border, borderRadius: Radius.full, overflow: 'hidden' },
  gradeFill:  { height: '100%', borderRadius: Radius.full },
  gradeCount: { width: 28, fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right' },

  barRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  barLabel: { width: 40, fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'right' },
  barTrack: { flex: 1, height: 8, backgroundColor: Colors.border, borderRadius: Radius.full, overflow: 'hidden' },
  barFill:  { height: '100%', borderRadius: Radius.full },
  barCount: { width: 24, fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'right' },

  violRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  violRank:     { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textSecondary, width: 24 },
  violCriteria: { fontSize: FontSize.sm, color: Colors.textPrimary, textAlign: 'right', marginBottom: Spacing.xs },
  violCount:    { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.danger, width: 24, textAlign: 'right' },
  emptyNote:    { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', padding: Spacing.lg },

  facilityRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs, borderBottomWidth: 1, borderBottomColor: Colors.border },
  gradeChip:    { width: 32, height: 32, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  gradeChipText:{ fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textInverse },
  facilityName: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textPrimary, textAlign: 'right' },
  facilityDate: { fontSize: FontSize.xs, color: Colors.textSecondary },
  facilityScore:{ fontSize: FontSize.base, fontWeight: FontWeight.bold },
});

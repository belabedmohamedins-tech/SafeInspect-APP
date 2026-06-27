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

I18nManager.forceRTL(true);

const GRADE_COLOR: Record<string, string> = {
  A: '#16a34a', B: '#2563eb', C: '#d97706', D: '#dc2626',
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

  const scores = completed.filter(i => i.score !== undefined).map(i => i.score!);
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const grades = completed.filter(i => i.grade).map(i => i.grade!);
  const avgGradeNum = grades.length
    ? grades.reduce((a, g) => a + gradeToNum(g), 0) / grades.length
    : 0;
  const avgGrade = avgGradeNum >= 3.5 ? 'A' : avgGradeNum >= 2.5 ? 'B' : avgGradeNum >= 1.5 ? 'C' : grades.length ? 'D' : '—';

  const gradeDistribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  grades.forEach(g => { if (g in gradeDistribution) gradeDistribution[g]++; });

  // Compliance rate: compliant items / evaluated items across all inspections
  let totalEval = 0, totalCompliant = 0;
  completed.forEach(ins => {
    ins.items.forEach(item => {
      if (item.complianceStatus === 'compliant' || item.complianceStatus === 'non-compliant') {
        totalEval++;
        if (item.complianceStatus === 'compliant') totalCompliant++;
      }
    });
  });
  const complianceRate = totalEval > 0 ? Math.round((totalCompliant / totalEval) * 100) : 0;

  // Top violations
  const violationMap: Record<string, number> = {};
  completed.forEach(ins => {
    ins.items.forEach(item => {
      if (item.complianceStatus === 'non-compliant') {
        const key = item.criteria.slice(0, 60);
        violationMap[key] = (violationMap[key] ?? 0) + 1;
      }
    });
  });
  const topViolations = Object.entries(violationMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([criteria, count]) => ({ criteria, count }));

  // Monthly trend
  const months = last6Months();
  const monthlyMap: Record<string, number> = {};
  months.forEach(m => { monthlyMap[m] = 0; });
  completed.forEach(i => {
    const mk = monthKey(i.date);
    if (mk in monthlyMap) monthlyMap[mk]++;
  });
  const monthlyTrend = months.map(m => ({ month: m, count: monthlyMap[m] }));

  // Facility breakdown (last 5 unique facilities inspected)
  const seen = new Set<string>();
  const facilityBreakdown: Stats['facilityBreakdown'] = [];
  const sorted = [...completed].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  for (const ins of sorted) {
    if (!seen.has(ins.facilityId)) {
      seen.add(ins.facilityId);
      facilityBreakdown.push({ name: ins.facilityName, grade: ins.grade, score: ins.score, date: ins.date });
    }
    if (facilityBreakdown.length >= 5) break;
  }

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

  const load = useCallback(async () => {
    setLoading(true);
    try { setStats(await computeStats()); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1e40af" /></View>;
  }

  if (!stats) return null;

  const maxGradeDist = Math.max(...Object.values(stats.gradeDistribution), 1);
  const maxMonthly  = Math.max(...stats.monthlyTrend.map(m => m.count), 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>لوحة الإحصاءيات</Text>
        <TouchableOpacity onPress={load}>
          <Text style={styles.refreshBtn}>↻ تحديث</Text>
        </TouchableOpacity>
      </View>

      {/* KPI Row */}
      <View style={styles.kpiRow}>
        <KPI label="الإجمالي" value={String(stats.totalCompleted)} />
        <KPI label="هذا الأسبوع" value={String(stats.thisWeek)} />
        <KPI label="متوسط الدرجة" value={stats.avgGrade}
          valueColor={GRADE_COLOR[stats.avgGrade] ?? '#374151'} />
        <KPI label="نسبة الامتثال" value={`${stats.complianceRate}%`} />
      </View>
      <View style={styles.kpiRow}>
        <KPI label="إجراءات مفتوحة" value={String(stats.openCAPs)} valueColor="#dc2626" />
        <KPI label="بانتظار الاعتماد" value={String(stats.pendingApprovals)} valueColor="#d97706" />
        <KPI label="متوسط النتيجة" value={`${stats.avgScore}%`} />
        <View style={{ flex: 1 }} />
      </View>

      {/* Grade Distribution */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>توزيع الدرجات</Text>
        <View style={styles.barChart}>
          {['A', 'B', 'C', 'D'].map(g => (
            <View key={g} style={styles.barCol}>
              <Text style={styles.barValue}>{stats.gradeDistribution[g]}</Text>
              <View style={styles.barTrack}>
                <View style={[
                  styles.barFill,
                  {
                    height: `${(stats.gradeDistribution[g] / maxGradeDist) * 100}%`,
                    backgroundColor: GRADE_COLOR[g],
                  }
                ]} />
              </View>
              <Text style={[styles.barLabel, { color: GRADE_COLOR[g] }]}>{g}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Monthly Trend */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>الترند الشهري (6 أشهر)</Text>
        <View style={styles.trendChart}>
          {stats.monthlyTrend.map(m => (
            <View key={m.month} style={styles.trendCol}>
              <Text style={styles.trendValue}>{m.count}</Text>
              <View style={styles.trendTrack}>
                <View style={[
                  styles.trendFill,
                  { height: `${(m.count / maxMonthly) * 100}%` }
                ]} />
              </View>
              <Text style={styles.trendLabel}>{m.month.slice(5)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Top Violations */}
      {stats.topViolations.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>أكثر المخالفات تكراراً</Text>
          {stats.topViolations.map((v, i) => (
            <View key={i} style={styles.violationRow}>
              <View style={styles.violationBar}>
                <View style={[
                  styles.violationFill,
                  { width: `${(v.count / stats.topViolations[0].count) * 100}%` }
                ]} />
              </View>
              <View style={styles.violationText}>
                <Text style={styles.violationCriteria} numberOfLines={1}>{v.criteria}</Text>
                <Text style={styles.violationCount}>{v.count} مرة</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Facility Breakdown */}
      {stats.facilityBreakdown.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>آخر المنشآت المفتشة</Text>
          {stats.facilityBreakdown.map((f, i) => (
            <View key={i} style={styles.facilityRow}>
              <Text style={[styles.facilityGrade, { color: GRADE_COLOR[f.grade ?? ''] ?? '#374151' }]}>
                {f.grade ?? '—'}
              </Text>
              <View style={styles.facilityInfo}>
                <Text style={styles.facilityName} numberOfLines={1}>{f.name}</Text>
                <Text style={styles.facilityMeta}>{f.date}{f.score !== undefined ? ` • ${f.score}%` : ''}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function KPI({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.kpi}>
      <Text style={[styles.kpiValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#1e40af', borderRadius: 12, padding: 16,
    marginBottom: 16, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  refreshBtn: { color: '#bfdbfe', fontSize: 14 },
  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  kpi: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  kpiValue: { fontSize: 22, fontWeight: '800', color: '#1e293b' },
  kpiLabel: { fontSize: 11, color: '#64748b', marginTop: 2, textAlign: 'center' },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', textAlign: 'right', marginBottom: 16 },
  // Grade distribution bar chart
  barChart: { flexDirection: 'row', gap: 12, height: 120, alignItems: 'flex-end' },
  barCol: { flex: 1, alignItems: 'center' },
  barValue: { fontSize: 12, color: '#374151', marginBottom: 4 },
  barTrack: { width: '100%', height: 80, backgroundColor: '#f1f5f9', borderRadius: 6, justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 6, minHeight: 4 },
  barLabel: { fontSize: 16, fontWeight: '800', marginTop: 4 },
  // Monthly trend
  trendChart: { flexDirection: 'row', gap: 6, height: 100, alignItems: 'flex-end' },
  trendCol: { flex: 1, alignItems: 'center' },
  trendValue: { fontSize: 11, color: '#374151', marginBottom: 2 },
  trendTrack: { width: '100%', height: 70, backgroundColor: '#f1f5f9', borderRadius: 4, justifyContent: 'flex-end' },
  trendFill: { width: '100%', backgroundColor: '#1e40af', borderRadius: 4, minHeight: 4 },
  trendLabel: { fontSize: 10, color: '#64748b', marginTop: 3 },
  // Top violations
  violationRow: { marginBottom: 10 },
  violationBar: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  violationFill: { height: '100%', backgroundColor: '#dc2626', borderRadius: 4 },
  violationText: { flexDirection: 'row', justifyContent: 'space-between' },
  violationCriteria: { fontSize: 12, color: '#374151', flex: 1 },
  violationCount: { fontSize: 12, color: '#64748b', marginStart: 8 },
  // Facility breakdown
  facilityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  facilityGrade: { fontSize: 24, fontWeight: '800', width: 32, textAlign: 'center' },
  facilityInfo: { flex: 1 },
  facilityName: { fontSize: 13, fontWeight: '600', color: '#1e293b', textAlign: 'right' },
  facilityMeta: { fontSize: 11, color: '#64748b', textAlign: 'right' },
});

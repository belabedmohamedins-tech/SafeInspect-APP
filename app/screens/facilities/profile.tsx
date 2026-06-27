// app/screens/facilities/profile.tsx
// ملف المنشأة — Facility Dossier
// Shows: meta info, KPI row, score trend bars, inspection history,
//        open CAP items, and quick-action buttons.
import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../../constants';
import { CorrectiveActionRepository } from '../../../src/repositories/CorrectiveActionRepository';
import { FacilityRepository } from '../../../src/repositories/FacilityRepository';
import { InspectionRepository } from '../../../src/repositories/InspectionRepository';
import { CorrectiveAction, Facility, SavedInspection } from '../../../src/types';

// ─── helpers ─────────────────────────────────────────────────────────────────────

function gradeColor(grade?: string): string {
  switch (grade) {
    case 'A': return Colors.gradeA;
    case 'B': return Colors.gradeB;
    case 'C': return Colors.gradeC;
    case 'D': return Colors.gradeD;
    default:  return Colors.textTertiary;
  }
}

function scoreBarColor(score: number): string {
  if (score >= 85) return Colors.gradeA;
  if (score >= 70) return Colors.gradeB;
  if (score >= 50) return Colors.gradeC;
  return Colors.gradeD;
}

const STATUS_LABEL: Record<CorrectiveAction['status'], string> = {
  open:          'مفتوح',
  'in-progress': 'جارٍ',
  resolved:      'محلول',
  overdue:       'متأخر',
};
const STATUS_COLOR: Record<CorrectiveAction['status'], string> = {
  open:          Colors.warning,
  'in-progress': Colors.primary,
  resolved:      Colors.success,
  overdue:       Colors.danger,
};

const SEVERITY_LABEL: Record<CorrectiveAction['severity'], string> = {
  low: 'منخفض', medium: 'متوسط', high: 'عالٍ', critical: 'حرج',
};
const SEVERITY_COLOR: Record<CorrectiveAction['severity'], string> = {
  low: Colors.success, medium: Colors.warning, high: Colors.danger, critical: '#8e44ad',
};

// ─── component ─────────────────────────────────────────────────────────────────────

export default function FacilityProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [facility,     setFacility]     = useState<Facility | null>(null);
  const [inspections,  setInspections]  = useState<SavedInspection[]>([]);
  const [caps,         setCaps]         = useState<CorrectiveAction[]>([]);
  const [loading,      setLoading]      = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [fac, allInsp, allCap] = await Promise.all([
      FacilityRepository.getById(id),
      InspectionRepository.getCompleted(),
      CorrectiveActionRepository.getAll(),
    ]);
    setFacility(fac ?? null);
    const facInsp = allInsp
      .filter(i => i.facilityId === id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setInspections(facInsp);
    setCaps(allCap.filter(c => c.facilityId === id && c.status !== 'resolved'));
    setLoading(false);
  }, [id]);

  useFocusEffect(load);

  // ── derived stats ──────────────────────────────────────────────────────────
  const scores  = inspections.map(i => i.score ?? 0).filter(s => s > 0);
  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;
  const lastInsp = inspections[0];
  const openCapCount = caps.length;
  const overdueCount = caps.filter(c => c.status === 'overdue').length;

  // last 6 inspections for the trend bar chart (chronological order)
  const trendData = [...inspections].reverse().slice(-6);

  const openMapApp = () => {
    if (!facility?.lat || !facility?.lng) return;
    const url = `https://maps.google.com/?q=${facility.lat},${facility.lng}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('خطأ', 'تعذّر فتح تطبيق الخرائط.')
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!facility) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.center}>
          <FontAwesome name="exclamation-circle" size={40} color={Colors.danger} />
          <Text style={s.emptyTitle}>لم يتم العثور على المنشأة</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <FontAwesome name="arrow-right" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{facility.projectName}</Text>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/screens/facilities/edit', params: { id } })}
          style={s.editBtn}
        >
          <FontAwesome name="pencil" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Hero / Meta card ── */}
        <View style={s.metaCard}>
          <View style={s.metaIconRow}>
            <View style={s.facilityIcon}>
              <FontAwesome name="building" size={28} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.facilityName}>{facility.projectName}</Text>
              <Text style={s.facilityActivity}>{facility.activity}</Text>
            </View>
          </View>

          <View style={s.divider} />

          <MetaRow icon="user"        label="صاحب المشروع" value={facility.ownerName} />
          <MetaRow icon="map-marker" label="العنوان"         value={facility.address} />
          {facility.licenseType && (
            <MetaRow icon="id-card" label="نوع الرخصة" value={facility.licenseType} />
          )}
          {facility.notes && (
            <MetaRow icon="sticky-note" label="ملاحظات" value={facility.notes} />
          )}

          {/* Map button if coordinates exist */}
          {facility.lat && facility.lng ? (
            <TouchableOpacity style={s.mapBtn} onPress={openMapApp}>
              <FontAwesome name="map" size={14} color={Colors.primary} />
              <Text style={s.mapBtnText}>عرض على الخريطة</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* ── KPI row ── */}
        <View style={s.kpiRow}>
          <KpiCard
            label="إجمالي التفتيشات"
            value={String(inspections.length)}
            color={Colors.primary}
          />
          <KpiCard
            label="متوسط النتيجة"
            value={avgScore !== null ? `${avgScore}%` : '—'}
            color={avgScore !== null ? scoreBarColor(avgScore) : Colors.textTertiary}
          />
          <KpiCard
            label="إجراءات مفتوحة"
            value={String(openCapCount)}
            color={overdueCount > 0 ? Colors.danger : Colors.warning}
          />
        </View>

        {/* ── Last inspection badge ── */}
        {lastInsp && (
          <View style={s.lastInspCard}>
            <Text style={s.sectionTitle}>آخر تفتيش</Text>
            <View style={s.lastInspRow}>
              <View style={[s.gradeBubble, { backgroundColor: gradeColor(lastInsp.grade) }]}>
                <Text style={s.gradeBubbleText}>{lastInsp.grade ?? '?'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.lastInspDate}>
                  {new Date(lastInsp.date).toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
                <Text style={s.lastInspScore}>
                  {lastInsp.score !== undefined ? `${lastInsp.score}%` : '—'}
                  {lastInsp.inspectorName ? `  ·  ${lastInsp.inspectorName}` : ''}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/screens/reports', params: { highlightId: lastInsp.id } })}
                style={s.viewBtn}
              >
                <Text style={s.viewBtnText}>عرض</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Score trend ── */}
        {trendData.length > 1 && (
          <View style={s.card}>
            <Text style={s.sectionTitle}>مسار النتائج</Text>
            <View style={s.trendBars}>
              {trendData.map((ins, idx) => {
                const sc = ins.score ?? 0;
                const barH = Math.max(4, (sc / 100) * 80);
                return (
                  <View key={ins.id} style={s.trendCol}>
                    <Text style={s.trendScore}>{sc > 0 ? `${sc}` : ''}</Text>
                    <View style={s.trendBarBg}>
                      <View
                        style={[
                          s.trendBarFill,
                          { height: barH, backgroundColor: scoreBarColor(sc) },
                        ]}
                      />
                    </View>
                    <Text style={s.trendLabel}>
                      {new Date(ins.date).toLocaleDateString('ar-DZ', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Open CAP items ── */}
        {caps.length > 0 && (
          <View style={s.card}>
            <View style={s.sectionHeaderRow}>
              <Text style={s.sectionTitle}>إجراءات تصحيحية مفتوحة</Text>
              <TouchableOpacity onPress={() => router.push('/screens/cap')}>
                <Text style={s.seeAll}>عرض الكل</Text>
              </TouchableOpacity>
            </View>
            {caps.slice(0, 5).map(cap => (
              <View key={cap.id} style={s.capRow}>
                <View style={[s.severityDot, { backgroundColor: SEVERITY_COLOR[cap.severity] }]} />
                <Text style={s.capCriteria} numberOfLines={2}>{cap.criteria}</Text>
                <View style={[s.statusChip, { borderColor: STATUS_COLOR[cap.status] }]}>
                  <Text style={[s.statusChipText, { color: STATUS_COLOR[cap.status] }]}>
                    {STATUS_LABEL[cap.status]}
                  </Text>
                </View>
              </View>
            ))}
            {caps.length > 5 && (
              <Text style={s.moreText}>+{caps.length - 5} أخرى...</Text>
            )}
          </View>
        )}

        {/* ── Inspection history ── */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>سجل التفتيشات</Text>
          {inspections.length === 0 ? (
            <View style={s.emptyState}>
              <FontAwesome name="clipboard" size={32} color={Colors.border} />
              <Text style={s.emptyStateText}>لا توجد تفتيشات مكتملة لهذه المنشأة</Text>
            </View>
          ) : (
            inspections.map((ins, idx) => (
              <View
                key={ins.id}
                style={[
                  s.historyRow,
                  idx === inspections.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View style={[s.historyGrade, { backgroundColor: gradeColor(ins.grade) + '22', borderColor: gradeColor(ins.grade) }]}>
                  <Text style={[s.historyGradeText, { color: gradeColor(ins.grade) }]}>{ins.grade ?? '?'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.historyDate}>
                    {new Date(ins.date).toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </Text>
                  <Text style={s.historyMeta}>
                    {ins.score !== undefined ? `${ins.score}%` : ''}
                    {ins.inspectorName ? `  ·  ${ins.inspectorName}` : ''}
                  </Text>
                </View>
                {ins.score !== undefined && (
                  <View style={s.miniBarWrap}>
                    <View style={[s.miniBar, { width: `${ins.score}%` as any, backgroundColor: scoreBarColor(ins.score) }]} />
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* ── Quick actions ── */}
        <View style={s.actionsRow}>
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: Colors.primary }]}
            onPress={() => router.push({ pathname: '/(tabs)/inspection', params: { facilityId: id, facilityName: facility.projectName } })}
          >
            <FontAwesome name="plus" size={15} color="#fff" />
            <Text style={s.actionBtnText}>تفتيش جديد</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border }]}
            onPress={() => router.push('/screens/cap')}
          >
            <FontAwesome name="tasks" size={15} color={Colors.primary} />
            <Text style={[s.actionBtnText, { color: Colors.primary }]}>إجراءات</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────────────

function MetaRow({ icon, label, value }: { icon: string; label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={meta.row}>
      <FontAwesome name={icon as any} size={13} color={Colors.textSecondary} style={meta.icon} />
      <Text style={meta.label}>{label}:</Text>
      <Text style={meta.value}>{value}</Text>
    </View>
  );
}

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={kpi.card}>
      <Text style={[kpi.value, { color }]}>{value}</Text>
      <Text style={kpi.label}>{label}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.background },
  center:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  header:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn:    { padding: Spacing.xs },
  headerTitle:{ flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'right' },
  editBtn:    { padding: Spacing.xs },

  scroll: { padding: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.md },

  // Meta card
  metaCard:       { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.sm, ...Shadow.sm },
  metaIconRow:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xs },
  facilityIcon:   { width: 52, height: 52, borderRadius: Radius.lg, backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
  facilityName:   { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'right' },
  facilityActivity:{ fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right' },
  divider:        { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  mapBtn:         { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm, alignSelf: 'flex-end', paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md, borderRadius: Radius.full, backgroundColor: Colors.primary + '12', borderWidth: 1, borderColor: Colors.primary + '40' },
  mapBtnText:     { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },

  // KPI
  kpiRow: { flexDirection: 'row', gap: Spacing.sm },

  // Last inspection
  lastInspCard:  { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, ...Shadow.sm },
  lastInspRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: Spacing.sm },
  gradeBubble:   { width: 48, height: 48, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  gradeBubbleText:{ fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: '#fff' },
  lastInspDate:  { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textPrimary, textAlign: 'right' },
  lastInspScore: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right' },
  viewBtn:       { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md, borderRadius: Radius.full, backgroundColor: Colors.primary + '15', borderWidth: 1, borderColor: Colors.primary + '40' },
  viewBtnText:   { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },

  // Generic card
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, ...Shadow.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'right', marginBottom: Spacing.md },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary },

  // Trend bars
  trendBars:   { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm, justifyContent: 'center', height: 100 },
  trendCol:    { alignItems: 'center', flex: 1 },
  trendScore:  { fontSize: 10, color: Colors.textSecondary, marginBottom: 2 },
  trendBarBg:  { width: 24, backgroundColor: Colors.surfaceOffset, borderRadius: Radius.sm, height: 80, justifyContent: 'flex-end', overflow: 'hidden' },
  trendBarFill:{ width: '100%', borderRadius: Radius.sm },
  trendLabel:  { fontSize: 9, color: Colors.textTertiary, marginTop: 4, textAlign: 'center' },

  // CAP rows
  capRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  severityDot:  { width: 10, height: 10, borderRadius: Radius.full, flexShrink: 0 },
  capCriteria:  { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary, textAlign: 'right' },
  statusChip:   { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1 },
  statusChipText:{ fontSize: 10, fontWeight: FontWeight.medium },
  moreText:     { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm },

  // History rows
  historyRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  historyGrade: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  historyGradeText: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  historyDate:  { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textPrimary, textAlign: 'right' },
  historyMeta:  { fontSize: 11, color: Colors.textSecondary, textAlign: 'right' },
  miniBarWrap:  { width: 50, height: 6, backgroundColor: Colors.surfaceOffset, borderRadius: Radius.full, overflow: 'hidden' },
  miniBar:      { height: '100%', borderRadius: Radius.full },

  // Actions
  actionsRow:   { flexDirection: 'row', gap: Spacing.md },
  actionBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, borderRadius: Radius.lg, ...Shadow.sm },
  actionBtnText:{ fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: '#fff' },

  // Empty
  emptyTitle:     { fontSize: FontSize.lg, color: Colors.textPrimary, fontWeight: FontWeight.bold },
  emptyState:     { alignItems: 'center', paddingVertical: Spacing.lg, gap: Spacing.sm },
  emptyStateText: { fontSize: FontSize.sm, color: Colors.textSecondary },
});

const meta = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, justifyContent: 'flex-end' },
  icon:  { marginTop: 2, width: 16 },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary, flexShrink: 0 },
  value: { fontSize: FontSize.sm, color: Colors.textPrimary, textAlign: 'right', flex: 1 },
});

const kpi = StyleSheet.create({
  card:  { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', ...Shadow.sm },
  value: { fontSize: 24, fontWeight: FontWeight.bold },
  label: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center', marginTop: 2 },
});

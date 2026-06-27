// app/preview/index.tsx
// Full printable preview of a completed inspection.
//
// Navigated from:
//   • app/reports/[id].tsx          → { inspectionId: '<real-id>', title }
//   • app/screens/checklists.tsx     → { inspectionId: '__preview__', title }
//
// When inspectionId === '__preview__' the screen loads from CriteriaPreviewStore
// (an in-memory fake inspection) instead of InspectionRepository, so the
// checklists screen can show a raw criteria list without saving anything.

import { FontAwesome } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IntegrityBadge from '../../components/inspection/IntegrityBadge';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants';
import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';
import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import { exportInspectionPDF } from '../../src/services/pdfService';
import { CriteriaPreviewStore } from '../../src/stores/CriteriaPreviewStore';
import { CorrectiveAction, InspectionItem, SavedInspection } from '../../src/types';
import { formatDateLong, formatDateShort } from '../../src/utils/dateUtils';
import { computeScoreAndGrade } from '../../src/utils/scoringUtils';
import { getStatusColor, getStatusText } from '../../src/utils/statusUtils';

const PREVIEW_ID = '__preview__';

// ─────────────────────── helpers ───────────────────────
const GRADE_COLORS: Record<string, string> = {
  A: Colors.gradeA,
  B: Colors.gradeB,
  C: Colors.gradeC,
  D: Colors.gradeD,
};
const gradeColor = (g?: string) => (g && GRADE_COLORS[g]) || Colors.textTertiary;

const SEVERITY_LABEL: Record<string, string> = {
  critical: 'حرج',
  major:    'رئيسي',
  minor:    'بسيط',
};
const SEVERITY_COLOR: Record<string, string> = {
  critical: Colors.danger,
  major:    Colors.warning,
  minor:    Colors.info ?? Colors.textTertiary,
};
const CAP_STATUS_LABEL: Record<string, string> = {
  open:        'مفتوح',
  in_progress: 'قيد التنفيذ',
  resolved:    'محلول',
  overdue:     'متأخر',
};
const CAP_STATUS_COLOR: Record<string, string> = {
  open:        Colors.warning,
  in_progress: Colors.primary,
  resolved:    Colors.success ?? Colors.gradeA,
  overdue:     Colors.danger,
};

// ─────────────────────── types ───────────────────────
type SectionGroup = { axis: string; items: InspectionItem[] };

// ─────────────────────── sub-components ─────────────────────
function MetaRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <View style={s.metaRow}>
      <Text style={s.metaLabel}>{label}</Text>
      <Text style={s.metaValue}>{value}</Text>
    </View>
  );
}

function ScoreGaugeCard({ score, grade }: { score: number; grade: string }) {
  const filled = Math.round(score / 10);
  return (
    <View style={s.gaugeCard}>
      <View style={[s.gradeBubble, { backgroundColor: gradeColor(grade) }]}>
        <Text style={s.gradeLetter}>{grade}</Text>
      </View>
      <View style={s.gaugeBars}>
        {Array.from({ length: 10 }).map((_, i) => (
          <View key={i} style={[s.gaugeBar, { backgroundColor: i < filled ? gradeColor(grade) : Colors.border }]} />
        ))}
      </View>
      <Text style={s.gaugeScore}>{score}%</Text>
    </View>
  );
}

function SectionAxisHeader({ axis, count, nonCompliant }: { axis: string; count: number; nonCompliant: number }) {
  return (
    <View style={s.axisHeader}>
      <Text style={s.axisTitle}>{axis}</Text>
      <View style={s.axisStats}>
        <Text style={s.axisCount}>{count} بند</Text>
        {nonCompliant > 0 && (
          <View style={s.axisAlert}>
            <Text style={s.axisAlertText}>{nonCompliant} غير مطابق</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function ItemCard({ item }: { item: InspectionItem }) {
  const nc = item.complianceStatus === 'non_compliant';
  return (
    <View style={[s.itemCard, nc && s.itemCardNc]}>
      <View style={s.itemTop}>
        <View style={[s.statusDot, { backgroundColor: getStatusColor(item.complianceStatus) }]} />
        <Text style={s.itemCriteria} numberOfLines={4}>{item.criteria}</Text>
        <View style={[s.statusChip, { backgroundColor: getStatusColor(item.complianceStatus) }]}>
          <Text style={s.statusChipText}>{getStatusText(item.complianceStatus)}</Text>
        </View>
      </View>
      {item.category && (
        <View style={s.categoryChip}>
          <Text style={s.categoryText}>{item.category}</Text>
        </View>
      )}
      {item.legalReference ? <Text style={s.legalRef}>{item.legalReference}</Text> : null}
      {item.comment ? (
        <View style={s.commentBox}>
          <FontAwesome name="comment-o" size={11} color={Colors.warning} />
          <Text style={s.commentText}>{item.comment}</Text>
        </View>
      ) : null}
      {item.photoUri ? <Image source={{ uri: item.photoUri }} style={s.photo} resizeMode="cover" /> : null}
    </View>
  );
}

function CapCard({ action }: { action: CorrectiveAction }) {
  return (
    <View style={s.capCard}>
      <View style={s.capTop}>
        <View style={[s.severityDot, { backgroundColor: SEVERITY_COLOR[action.severity] ?? Colors.textTertiary }]} />
        <Text style={s.capDescription} numberOfLines={3}>{action.description}</Text>
        <View style={[s.capStatusChip, { backgroundColor: CAP_STATUS_COLOR[action.status] ?? Colors.textTertiary }]}>
          <Text style={s.capStatusText}>{CAP_STATUS_LABEL[action.status] ?? action.status}</Text>
        </View>
      </View>
      <View style={s.capMeta}>
        <Text style={s.capSeverity}>{SEVERITY_LABEL[action.severity] ?? action.severity}</Text>
        {action.deadline ? <Text style={s.capDeadline}>الموعد النهائي: {formatDateShort(action.deadline)}</Text> : null}
        {action.assignedTo ? <Text style={s.capAssigned}>المسؤول: {action.assignedTo}</Text> : null}
      </View>
      {action.notes ? <Text style={s.capNotes}>{action.notes}</Text> : null}
    </View>
  );
}

// ─────────────────────── screen ───────────────────────
export default function InspectionPreviewScreen() {
  const { inspectionId, title } = useLocalSearchParams<{ inspectionId: string; title: string }>();
  const router = useRouter();

  const [inspection, setInspection] = useState<SavedInspection | null>(null);
  const [caps,       setCaps]       = useState<CorrectiveAction[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [exporting,  setExporting]  = useState(false);

  const isPreviewMode = inspectionId === PREVIEW_ID;

  const load = useCallback(async () => {
    try {
      if (isPreviewMode) {
        // Raw checklist preview — load fake inspection from in-memory store.
        // No CAPs for a preview.
        const stored = CriteriaPreviewStore.getInspection();
        setInspection(stored);
        setCaps([]);
      } else {
        if (!inspectionId) { setLoading(false); return; }
        const [ins, allCaps] = await Promise.all([
          InspectionRepository.getById(inspectionId),
          CorrectiveActionRepository.getAll(),
        ]);
        setInspection(ins);
        setCaps(allCaps.filter(c => c.inspectionId === inspectionId));
      }
    } catch (e) {
      console.error('PreviewScreen load error', e);
    } finally {
      setLoading(false);
    }
  }, [inspectionId, isPreviewMode]);

  useEffect(() => { load(); }, [load]);

  const sections = useMemo((): SectionGroup[] => {
    if (!inspection) return [];
    const map: Record<string, InspectionItem[]> = {};
    inspection.items.forEach(item => {
      const key = item.axis || 'أخرى';
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });
    return Object.entries(map).map(([axis, items]) => ({ axis, items }));
  }, [inspection]);

  const { score, grade } = useMemo(() => {
    if (!inspection) return { score: undefined, grade: undefined };
    if (inspection.score !== undefined) return { score: inspection.score, grade: inspection.grade };
    return computeScoreAndGrade(inspection.items);
  }, [inspection]);

  const nonCompliantCount = useMemo(
    () => inspection?.items.filter(i => i.complianceStatus === 'non_compliant').length ?? 0,
    [inspection]
  );
  const compliantCount = useMemo(
    () => inspection?.items.filter(i => i.complianceStatus === 'compliant').length ?? 0,
    [inspection]
  );
  const naCount = useMemo(
    () => inspection?.items.filter(i => i.complianceStatus === 'not_applicable').length ?? 0,
    [inspection]
  );
  const openCaps    = caps.filter(c => c.status === 'open' || c.status === 'in_progress').length;
  const resolvedCaps = caps.filter(c => c.status === 'resolved').length;

  const handleExportPDF = async () => {
    if (!inspection) return;
    setExporting(true);
    try {
      await exportInspectionPDF(inspection);
    } catch {
      Alert.alert('خطأ', 'فشل تصدير التقرير');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={s.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={s.loadingText}>جارٍ تحميل التقرير…</Text>
      </SafeAreaView>
    );
  }

  if (!inspection) {
    return (
      <SafeAreaView style={s.centered}>
        <FontAwesome name="exclamation-circle" size={48} color={Colors.danger} />
        <Text style={s.errorText}>التفتيش غير موجود</Text>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backBtnText}>رجوع</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safeArea}>
      <Stack.Screen
        options={{
          title: title ?? 'معاينة التفتيش',
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                onPress={handleExportPDF}
                style={s.headerBtn}
                disabled={exporting}
                accessibilityLabel="تصدير PDF"
              >
                {exporting
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <FontAwesome name="file-pdf-o" size={20} color="#fff" />}
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* 1. FACILITY HEADER */}
        <View style={s.facilityCard}>
          {inspection.officeName ? <Text style={s.officeName}>{inspection.officeName}</Text> : null}
          <Text style={s.facilityName}>{inspection.facilityName}</Text>
          {inspection.facilityAddress ? (
            <View style={s.addressRow}>
              <FontAwesome name="map-marker" size={12} color={Colors.textSecondary} />
              <Text style={s.addressText}>{inspection.facilityAddress}</Text>
            </View>
          ) : null}
          <View style={s.metaDivider} />
          <MetaRow label="التاريخ"          value={formatDateLong(inspection.date)} />
          <MetaRow label="المحرر"            value={inspection.inspectorName} />
          <MetaRow label="سبب التفتيش"       value={inspection.inspectionCause ?? ''} />
          <MetaRow label="مرجع المستند"     value={inspection.referenceDocument ?? ''} />
          {(inspection.committeeMembers ?? []).length > 0 && (
            <View style={s.committeeBox}>
              <Text style={s.committeeLabel}>أعضاء اللجنة:</Text>
              {inspection.committeeMembers!.map((m, i) => (
                <Text key={i} style={s.committeeMember}>• {m}</Text>
              ))}
            </View>
          )}
          {inspection.coordinates && (
            <View style={s.coordRow}>
              <FontAwesome name="crosshairs" size={11} color={Colors.textTertiary} />
              <Text style={s.coordText}>
                {inspection.coordinates.latitude.toFixed(6)}° ,{' '}
                {inspection.coordinates.longitude.toFixed(6)}°
              </Text>
            </View>
          )}
        </View>

        {/* 2. INTEGRITY BADGE (skip for raw preview) */}
        {!isPreviewMode && <IntegrityBadge inspection={inspection} />}

        {/* 3. SCORE + GRADE (skip for raw preview — all items are not-evaluated) */}
        {!isPreviewMode && score !== undefined && grade && (
          <ScoreGaugeCard score={score} grade={grade} />
        )}

        {/* 4. KPI SUMMARY */}
        <View style={s.kpiRow}>
          <View style={s.kpiBox}>
            <Text style={s.kpiValue}>{inspection.items.length}</Text>
            <Text style={s.kpiLabel}>إجمالي البنود</Text>
          </View>
          {!isPreviewMode && (
            <>
              <View style={[s.kpiBox, { borderColor: Colors.gradeA }]}>
                <Text style={[s.kpiValue, { color: Colors.gradeA }]}>{compliantCount}</Text>
                <Text style={s.kpiLabel}>مطابق</Text>
              </View>
              <View style={[s.kpiBox, { borderColor: Colors.danger }]}>
                <Text style={[s.kpiValue, { color: Colors.danger }]}>{nonCompliantCount}</Text>
                <Text style={s.kpiLabel}>غير مطابق</Text>
              </View>
              <View style={[s.kpiBox, { borderColor: Colors.textTertiary }]}>
                <Text style={[s.kpiValue, { color: Colors.textTertiary }]}>{naCount}</Text>
                <Text style={s.kpiLabel}>لا ينطبق</Text>
              </View>
            </>
          )}
        </View>

        {/* 5. CAP SUMMARY */}
        {caps.length > 0 && (
          <View style={s.capSummaryCard}>
            <Text style={s.sectionHeading}>ملخص خطة الإجراءات التصحيحية</Text>
            <View style={s.capSummaryRow}>
              <View style={s.capSummaryItem}>
                <Text style={[s.capSummaryNum, { color: Colors.warning }]}>{openCaps}</Text>
                <Text style={s.capSummaryLabel}>مفتوح</Text>
              </View>
              <View style={s.capSummaryItem}>
                <Text style={[s.capSummaryNum, { color: Colors.gradeA }]}>{resolvedCaps}</Text>
                <Text style={s.capSummaryLabel}>محلول</Text>
              </View>
              <View style={s.capSummaryItem}>
                <Text style={s.capSummaryNum}>{caps.length}</Text>
                <Text style={s.capSummaryLabel}>الإجمالي</Text>
              </View>
            </View>
            {caps.map(c => <CapCard key={c.id} action={c} />)}
          </View>
        )}

        {/* 6. INSPECTION ITEMS BY AXIS */}
        {sections.map(({ axis, items }) => {
          const nc = items.filter(i => i.complianceStatus === 'non_compliant').length;
          return (
            <View key={axis} style={s.axisSection}>
              <SectionAxisHeader axis={axis} count={items.length} nonCompliant={nc} />
              {items.map(item => <ItemCard key={item.id} item={item} />)}
            </View>
          );
        })}

        {/* 7. SIGNATURE */}
        {inspection.signature && (
          <View style={s.signatureCard}>
            <Text style={s.sectionHeading}>التوقيع</Text>
            <Image source={{ uri: inspection.signature }} style={s.signatureImage} resizeMode="contain" />
          </View>
        )}

        {/* 8. EXPORT FOOTER */}
        <TouchableOpacity
          style={[s.exportBtn, exporting && s.exportBtnDisabled]}
          onPress={handleExportPDF}
          disabled={exporting}
          activeOpacity={0.8}
        >
          {exporting
            ? <ActivityIndicator size="small" color="#fff" />
            : <FontAwesome name="file-pdf-o" size={18} color="#fff" />}
          <Text style={s.exportBtnText}>{exporting ? 'جارٍ التصدير…' : 'تصدير كـ PDF'}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────── styles ───────────────────────
const s = StyleSheet.create({
  safeArea:          { flex: 1, backgroundColor: Colors.background },
  scroll:            { flex: 1 },
  scrollContent:     { padding: Spacing.base, paddingBottom: Spacing.xxxl ?? 48 },
  centered:          { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  loadingText:       { marginTop: Spacing.sm, fontSize: FontSize.base, color: Colors.textSecondary },
  errorText:         { fontSize: FontSize.lg, color: Colors.danger, marginTop: Spacing.sm },
  backBtn:           { marginTop: Spacing.md, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, backgroundColor: Colors.primary, borderRadius: Radius.md },
  backBtnText:       { color: '#fff', fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  headerBtn:         { marginRight: Spacing.md },
  facilityCard:      { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.base, ...Shadow.md },
  officeName:        { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary, marginBottom: 2, textAlign: 'right' },
  facilityName:      { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'right', marginBottom: Spacing.xs },
  addressRow:        { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginBottom: Spacing.xs },
  addressText:       { fontSize: FontSize.sm, color: Colors.textSecondary },
  metaDivider:       { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  metaRow:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  metaLabel:         { fontSize: FontSize.sm, color: Colors.textTertiary, flex: 1, textAlign: 'right' },
  metaValue:         { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium, flex: 2, textAlign: 'right' },
  committeeBox:      { marginTop: Spacing.xs },
  committeeLabel:    { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, textAlign: 'right', marginBottom: 2 },
  committeeMember:   { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right' },
  coordRow:          { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: Spacing.xs },
  coordText:         { fontSize: FontSize.xs, color: Colors.textTertiary },
  gaugeCard:         { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.base, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, ...Shadow.sm },
  gradeBubble:       { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  gradeLetter:       { fontSize: FontSize.xxxl ?? 32, fontWeight: FontWeight.bold, color: '#fff' },
  gaugeBars:         { flex: 1, flexDirection: 'row', gap: 3 },
  gaugeBar:          { flex: 1, height: 16, borderRadius: 3 },
  gaugeScore:        { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, minWidth: 48, textAlign: 'right' },
  kpiRow:            { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.base },
  kpiBox:            { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border, ...Shadow.xs ?? Shadow.sm },
  kpiValue:          { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  kpiLabel:          { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', marginTop: 2 },
  sectionHeading:    { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'right', marginBottom: Spacing.sm },
  axisSection:       { marginBottom: Spacing.lg },
  axisHeader:        { backgroundColor: Colors.primary + '18', borderRadius: Radius.md, padding: Spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  axisTitle:         { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary, flex: 1, textAlign: 'right' },
  axisStats:         { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  axisCount:         { fontSize: FontSize.xs, color: Colors.textSecondary },
  axisAlert:         { backgroundColor: Colors.danger, borderRadius: Radius.sm, paddingHorizontal: Spacing.xs, paddingVertical: 2 },
  axisAlertText:     { fontSize: FontSize.xs, color: '#fff', fontWeight: FontWeight.semibold },
  itemCard:          { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadow.sm },
  itemCardNc:        { borderLeftWidth: 3, borderLeftColor: Colors.danger },
  itemTop:           { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs, marginBottom: Spacing.xs },
  statusDot:         { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  itemCriteria:      { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary, textAlign: 'right', lineHeight: 20 },
  statusChip:        { paddingHorizontal: Spacing.xs, paddingVertical: 2, borderRadius: Radius.sm },
  statusChipText:    { fontSize: FontSize.xs, color: '#fff', fontWeight: FontWeight.semibold },
  categoryChip:      { alignSelf: 'flex-end', backgroundColor: Colors.primary + '20', paddingHorizontal: Spacing.xs, paddingVertical: 2, borderRadius: Radius.sm, marginBottom: 4 },
  categoryText:      { fontSize: FontSize.xs, color: Colors.primary },
  legalRef:          { fontSize: FontSize.xs, color: Colors.textTertiary, textAlign: 'right', marginBottom: 4 },
  commentBox:        { flexDirection: 'row', alignItems: 'flex-start', gap: 4, backgroundColor: Colors.warning + '18', borderRadius: Radius.sm, padding: Spacing.xs, marginTop: 4 },
  commentText:       { fontSize: FontSize.xs, color: Colors.warning, flex: 1, textAlign: 'right' },
  photo:             { width: '100%', height: 160, borderRadius: Radius.sm, marginTop: Spacing.sm },
  capSummaryCard:    { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.base, ...Shadow.sm },
  capSummaryRow:     { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.md },
  capSummaryItem:    { alignItems: 'center' },
  capSummaryNum:     { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  capSummaryLabel:   { fontSize: FontSize.xs, color: Colors.textSecondary },
  capCard:           { backgroundColor: Colors.surfaceOffset ?? Colors.background, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm },
  capTop:            { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs, marginBottom: Spacing.xs },
  severityDot:       { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  capDescription:    { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary, textAlign: 'right', lineHeight: 20 },
  capStatusChip:     { paddingHorizontal: Spacing.xs, paddingVertical: 2, borderRadius: Radius.sm },
  capStatusText:     { fontSize: FontSize.xs, color: '#fff', fontWeight: FontWeight.semibold },
  capMeta:           { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'flex-end', marginBottom: 2 },
  capSeverity:       { fontSize: FontSize.xs, color: Colors.textSecondary },
  capDeadline:       { fontSize: FontSize.xs, color: Colors.textSecondary },
  capAssigned:       { fontSize: FontSize.xs, color: Colors.textSecondary },
  capNotes:          { fontSize: FontSize.xs, color: Colors.textTertiary, textAlign: 'right', fontStyle: 'italic' },
  signatureCard:     { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.base, alignItems: 'center', ...Shadow.sm },
  signatureImage:    { width: 260, height: 120, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, backgroundColor: Colors.background },
  exportBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: Spacing.md, marginTop: Spacing.sm },
  exportBtnDisabled: { opacity: 0.6 },
  exportBtnText:     { color: '#fff', fontSize: FontSize.base, fontWeight: FontWeight.semibold },
});

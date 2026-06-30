import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants';
import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';
import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import {
  exportInspectionCSV,
  exportInspectionPDF,
  exportNonConformityNoticePDF,
} from '../../src/services/pdfService';
import { InspectionItem, SavedInspection, Severity } from '../../src/types';
import { formatDateForCard } from '../../src/utils/dateUtils';
import { getComplianceSummary } from '../../src/utils/statusUtils';
import CapFollowUpSheet from '../../components/reports/CapFollowUpSheet';

// ── Phase-9 filter type ─────────────────────────────────────────────────────
type FilterStatus = 'all' | 'compliant' | 'non-compliant' | 'violations';
const FILTER_LABELS: Record<FilterStatus, string> = {
  all:             'الكل',
  compliant:       'مطابق',
  'non-compliant': 'غير مطابق',
  violations:      '⚠️ مخالفات',
};

// ── Phase-10 ViolationsSummaryBanner ─────────────────────────────────────────
interface BannerProps {
  inspectionsWithViolations: SavedInspection[];
  totalViolationCount: number;
  onExportAll: () => void;
  exporting: boolean;
}
function ViolationsSummaryBanner({ inspectionsWithViolations, totalViolationCount, onExportAll, exporting }: BannerProps) {
  if (inspectionsWithViolations.length === 0) return null;
  return (
    <View style={bannerStyles.container}>
      <View style={bannerStyles.left}>
        <FontAwesome name="exclamation-triangle" size={18} color="#e65100" />
        <View style={bannerStyles.textBlock}>
          <Text style={bannerStyles.headline}>{inspectionsWithViolations.length} تفتيشات تحتوي على مخالفات</Text>
          <Text style={bannerStyles.sub}>{totalViolationCount} بند غير مطابق إجمالاً</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[bannerStyles.exportBtn, exporting && bannerStyles.exportBtnDisabled]}
        onPress={onExportAll}
        disabled={exporting}
      >
        {exporting
          ? <ActivityIndicator size="small" color="#fff" />
          : <><FontAwesome name="files-o" size={14} color="#fff" /><Text style={bannerStyles.exportBtnText}>تصدير الكل</Text></>
        }
      </TouchableOpacity>
    </View>
  );
}
const bannerStyles = StyleSheet.create({
  container:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff3e0', borderColor: '#e65100', borderWidth: 1, borderRadius: 10, marginHorizontal: 10, marginBottom: 8, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  left:              { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  textBlock:         { flex: 1 },
  headline:          { fontSize: 13, fontWeight: '700', color: '#bf360c' },
  sub:               { fontSize: 12, color: '#e65100', marginTop: 2 },
  exportBtn:         { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#e65100', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8 },
  exportBtnDisabled: { opacity: 0.6 },
  exportBtnText:     { color: '#fff', fontSize: 12, fontWeight: '700' },
});

// ────────────────────────────────────────────────────────────────────────────────
export default function ReportsScreen() {
  const [inspections,     setInspections]     = useState<SavedInspection[]>([]);
  const [searchQuery,     setSearchQuery]     = useState('');
  const [filterStatus,    setFilterStatus]    = useState<FilterStatus>('all');
  const [batchExporting,  setBatchExporting]  = useState(false);
  // Phase-11 sheet state
  const [sheetInspection, setSheetInspection] = useState<SavedInspection | null>(null);
  const [sheetVisible,    setSheetVisible]    = useState(false);
  // Phase-12: track which inspectionItemIds already have a CAP task
  const [existingCapIds,  setExistingCapIds]  = useState<Set<string>>(new Set());

  const router = useRouter();

  const loadInspections = async () => {
    try {
      const completed = await InspectionRepository.getCompleted();
      setInspections(completed);
    } catch (error) {
      console.error('Failed to load inspections', error);
    }
  };

  // Phase-12: load existing CAP item-ids so '+' buttons show as already created
  const loadExistingCaps = async () => {
    try {
      const all = await CorrectiveActionRepository.getAll();
      setExistingCapIds(new Set(all.map(a => a.inspectionItemId)));
    } catch { /* non-fatal */ }
  };

  useFocusEffect(useCallback(() => {
    loadInspections();
    loadExistingCaps();
  }, []));

  // ── Handlers ─────────────────────────────────────────────────────────

  const deleteInspection = async (id: string) => {
    Alert.alert('تأكيد الحذف', 'هل أنت متأكد من حذف هذا التفتيش؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive',
        onPress: async () => {
          try {
            await InspectionRepository.delete(id);
            await loadInspections();
          } catch (error) {
            console.error('Error deleting inspection', error);
            Alert.alert('خطأ', 'حدث خطأ أثناء الحذف');
          }
        },
      },
    ]);
  };

  const handlePreview = (inspection: SavedInspection) => {
    router.push({ pathname: '/preview', params: { inspectionId: inspection.id, title: inspection.facilityName } });
  };

  const handleExportNotice = (item: SavedInspection) => {
    const count = item.items.filter(i => i.complianceStatus === 'non-compliant').length;
    if (count === 0) { Alert.alert('لا توجد مخالفات', 'هذا التفتيش مطابق بالكامل.'); return; }
    exportNonConformityNoticePDF(item);
  };

  const handleExportAllNotices = async (withViolations: SavedInspection[]) => {
    if (withViolations.length === 0) return;
    Alert.alert('تصدير جميع المحاضر', `سيتم تصدير ${withViolations.length} محضراً تباعاً. هل تريد المتابعة؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'تصدير',
        onPress: async () => {
          setBatchExporting(true);
          try {
            for (const ins of withViolations) {
              await exportNonConformityNoticePDF(ins);
              await new Promise(resolve => setTimeout(resolve, 600));
            }
          } finally { setBatchExporting(false); }
        },
      },
    ]);
  };

  const handleOpenSheet = (item: SavedInspection) => {
    setSheetInspection(item);
    setSheetVisible(true);
  };

  // Phase-12: create a CAP task from a deadline row
  const handleCreateCap = async (
    item: InspectionItem,
    isoDeadline: string,
    inspection: SavedInspection,
  ) => {
    try {
      await CorrectiveActionRepository.save({
        inspectionId:     inspection.id,
        inspectionItemId: item.id,
        facilityId:       inspection.facilityId,
        facilityName:     inspection.facilityName,
        criteria:         item.criteria,
        severity:         (item.severity ?? 'medium') as Severity,
        deadline:         isoDeadline,
        assignedTo:       inspection.inspectorName ?? '',
        status:           'open',
        notes:            item.legalReference ?? '',
      });
      // Mark as created in local state without re-fetching all
      setExistingCapIds(prev => new Set([...prev, item.id]));
      Alert.alert('تم الإنشاء ✅', `تم إنشاء مهمة إجراء تصحيحي\nالموعد: ${new Date(isoDeadline).toLocaleDateString('ar-DZ', { day: 'numeric', month: 'long', year: 'numeric' })}`);
    } catch (e) {
      Alert.alert('خطأ', 'تعذّر حفظ المهمة');
    }
  };

  // ── Derived data ───────────────────────────────────────────────────────
  const { filteredInspections, inspectionsWithViolations, totalViolationCount } = useMemo(() => {
    const filtered = inspections.filter(inspection => {
      const matchesSearch = inspection.facilityName.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (filterStatus === 'all') return true;
      const summary = getComplianceSummary(inspection.items);
      if (filterStatus === 'compliant')      return summary.nonCompliant === 0;
      if (filterStatus === 'non-compliant')  return summary.nonCompliant > 0;
      if (filterStatus === 'violations')     return summary.nonCompliant > 0;
      return true;
    });
    const withViolations = filtered.filter(ins => ins.items.some(i => i.complianceStatus === 'non-compliant'));
    const totalViolations = withViolations.reduce((acc, ins) => acc + ins.items.filter(i => i.complianceStatus === 'non-compliant').length, 0);
    return { filteredInspections: filtered, inspectionsWithViolations: withViolations, totalViolationCount: totalViolations };
  }, [inspections, searchQuery, filterStatus]);

  // ── Render ─────────────────────────────────────────────────────────────────

  const renderRightActions = (id: string) => (
    <TouchableOpacity style={styles.deleteButton} onPress={() => deleteInspection(id)}>
      <FontAwesome name="trash" size={24} color="#fff" />
      <Text style={styles.deleteText}>حذف</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: SavedInspection }) => {
    const summary       = getComplianceSummary(item.items);
    const isCompliant   = summary.nonCompliant === 0;
    const hasViolations = summary.nonCompliant > 0;
    return (
      <Swipeable renderRightActions={() => renderRightActions(item.id)}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push({ pathname: '/reports/[id]', params: { id: item.id } })}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.facilityName}>{item.facilityName}</Text>
            <View style={[styles.statusBadge, { backgroundColor: isCompliant ? Colors.green : Colors.red }]}>
              <Text style={styles.statusBadgeText}>{isCompliant ? 'مطابق' : 'غير مطابق'}</Text>
            </View>
          </View>
          <Text style={styles.date}>{formatDateForCard(item.date)}</Text>
          <Text style={styles.inspector}>{item.inspectorName}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statItem}>✅ {summary.compliant}</Text>
            <Text style={styles.statItem}>❌ {summary.nonCompliant}</Text>
            <Text style={styles.statItem}>➖ {summary.na}</Text>
          </View>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handlePreview(item)}>
              <FontAwesome name="eye" size={16} color={Colors.blue} />
              <Text style={[styles.actionBtnText, { color: Colors.blue }]}>معاينة</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => exportInspectionPDF(item)}>
              <FontAwesome name="file-pdf-o" size={16} color={Colors.red} />
              <Text style={[styles.actionBtnText, { color: Colors.red }]}>PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => exportInspectionCSV(item)}>
              <FontAwesome name="file-excel-o" size={16} color={Colors.green} />
              <Text style={[styles.actionBtnText, { color: Colors.green }]}>Excel</Text>
            </TouchableOpacity>
            {hasViolations && (
              <>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleExportNotice(item)}>
                  <FontAwesome name="file-text-o" size={16} color="#e65100" />
                  <Text style={[styles.actionBtnText, { color: '#e65100' }]}>محضر</Text>
                </TouchableOpacity>
                {/* Phase-11/12: CAP deadline sheet */}
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleOpenSheet(item)}>
                  <FontAwesome name="clock-o" size={16} color="#7b1fa2" />
                  <Text style={[styles.actionBtnText, { color: '#7b1fa2' }]}>مواعيد</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TextInput
        style={styles.searchInput}
        placeholder="بحث..."
        placeholderTextColor={Colors.textTertiary}
        value={searchQuery}
        onChangeText={setSearchQuery}
        textAlign="right"
      />
      <View style={styles.filterRow}>
        {(Object.keys(FILTER_LABELS) as FilterStatus[]).map(f => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterBtn,
              filterStatus === f && (f === 'violations' ? styles.filterBtnViolations : styles.filterBtnActive),
            ]}
            onPress={() => setFilterStatus(f)}
          >
            <Text style={[
              styles.filterBtnText,
              filterStatus === f && (f === 'violations' ? styles.filterBtnTextViolations : styles.filterBtnTextActive),
            ]}>
              {FILTER_LABELS[f]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ViolationsSummaryBanner
        inspectionsWithViolations={inspectionsWithViolations}
        totalViolationCount={totalViolationCount}
        onExportAll={() => handleExportAllNotices(inspectionsWithViolations)}
        exporting={batchExporting}
      />
      <FlatList
        data={filteredInspections}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="file-text-o" size={50} color={Colors.light} />
            <Text style={styles.emptyText}>لا توجد تقارير</Text>
          </View>
        }
      />
      {/* Phase-11/12: CAP deadline sheet */}
      <CapFollowUpSheet
        inspection={sheetInspection}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onCreateCap={handleCreateCap}
        existingCapItemIds={existingCapIds}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:                { flex: 1, backgroundColor: Colors.background },
  searchInput:             { margin: 10, padding: 10, backgroundColor: Colors.white, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, textAlign: 'right', color: Colors.dark },
  filterRow:               { flexDirection: 'row', paddingHorizontal: 10, marginBottom: 6, gap: 8, flexWrap: 'wrap' },
  filterBtn:               { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: Colors.background },
  filterBtnActive:         { backgroundColor: Colors.blue },
  filterBtnViolations:     { backgroundColor: '#e65100' },
  filterBtnText:           { fontSize: 13, color: Colors.mid },
  filterBtnTextActive:     { color: Colors.white },
  filterBtnTextViolations: { color: Colors.white, fontWeight: '700' },
  list:                    { padding: 10 },
  card:                    { backgroundColor: Colors.white, borderRadius: 10, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2 },
  cardHeader:              { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  facilityName:            { fontSize: 16, fontWeight: 'bold', color: Colors.dark, flex: 1, marginRight: 8 },
  statusBadge:             { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  statusBadgeText:         { color: Colors.white, fontSize: 11, fontWeight: 'bold' },
  date:                    { fontSize: 13, color: Colors.mid, marginBottom: 2 },
  inspector:               { fontSize: 13, color: Colors.blue, marginBottom: 8 },
  statsRow:                { flexDirection: 'row', gap: 12, marginBottom: 10 },
  statItem:                { fontSize: 13, color: Colors.dark },
  actionsRow:              { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  actionBtn:               { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionBtnText:           { fontSize: 13 },
  deleteButton:            { backgroundColor: Colors.red, justifyContent: 'center', alignItems: 'center', width: 72, borderRadius: 10, marginBottom: 10 },
  deleteText:              { color: Colors.white, fontSize: 12, marginTop: 4 },
  emptyContainer:          { alignItems: 'center', padding: 40 },
  emptyText:               { fontSize: 16, color: Colors.mid, marginTop: 10 },
});

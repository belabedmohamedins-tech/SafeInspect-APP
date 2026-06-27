// app/reports/[id].tsx
import { FontAwesome } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../../constants';
import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import { exportInspectionCSV, exportInspectionPDF } from '../../src/services/pdfService';
import { InspectionItem, SavedInspection } from '../../src/types';
import { formatDateLong } from '../../src/utils/dateUtils';
import { computeScoreAndGrade } from '../../src/utils/scoringUtils';
import { getStatusColor, getStatusText } from '../../src/utils/statusUtils';

const GRADE_COLORS: Record<string, string> = {
  A: Colors.gradeA,
  B: Colors.gradeB,
  C: Colors.gradeC,
  D: Colors.gradeD,
};
const getGradeColor = (grade?: string) => (grade ? GRADE_COLORS[grade] : undefined) ?? Colors.textTertiary;

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams();
  const router  = useRouter();
  const [inspection, setInspection] = useState<SavedInspection | null>(null);
  const [loading,    setLoading]    = useState(true);
  const inspectionId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    (async () => {
      if (!inspectionId) { setLoading(false); return; }
      try {
        setInspection(await InspectionRepository.getById(inspectionId));
      } catch (e) {
        console.error('Failed to load inspection', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [inspectionId]);

  const deleteInspection = () => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذا التفتيش؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف', style: 'destructive',
          onPress: async () => {
            try {
              if (inspectionId) { await InspectionRepository.delete(inspectionId); router.back(); }
            } catch { Alert.alert('خطأ', 'حدث خطأ أثناء الحذف'); }
          },
        },
      ]
    );
  };

  // FIX #1: pass ALL metadata fields so the checklist can re-save correctly
  const reopenInspection = () => {
    if (!inspection) return;
    router.push({
      pathname: '/(tabs)/inspection/checklist',
      params: {
        draftId:          inspection.id,
        facilityId:       inspection.facilityId,
        facilityName:     inspection.facilityName,
        facilityAddress:  inspection.facilityAddress ?? '',
        cause:            inspection.inspectionCause ?? '',
        reference:        inspection.referenceDocument ?? '',
        committeeMembers: JSON.stringify(inspection.committeeMembers ?? []),
        writer:           inspection.inspectorName ?? '',
        lat:              inspection.coordinates?.latitude  ?? '',
        lng:              inspection.coordinates?.longitude ?? '',
      },
    });
  };

  const handlePreview = () => {
    if (!inspection) return;
    router.push({
      pathname: '/preview',
      params: { inspectionId: inspection.id, title: inspection.facilityName },
    });
  };

  const sections = useMemo(() => {
    if (!inspection) return [];
    const groups: Record<string, InspectionItem[]> = {};
    inspection.items.forEach(item => {
      const axis = item.axis || 'أخرى';
      if (!groups[axis]) groups[axis] = [];
      groups[axis].push(item);
    });
    return Object.entries(groups).map(([title, data]) => ({ title, data }));
  }, [inspection]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!inspection) {
    return (
      <SafeAreaView style={styles.centered}>
        <FontAwesome name="exclamation-circle" size={40} color={Colors.danger} style={{ marginBottom: Spacing.md }} />
        <Text style={styles.errorText}>التفتيش غير موجود</Text>
      </SafeAreaView>
    );
  }

  let scoreDisplay = inspection.score;
  let gradeDisplay = inspection.grade;
  if (scoreDisplay === undefined) {
    const result = computeScoreAndGrade(inspection.items);
    if (result.score !== undefined) { scoreDisplay = result.score; gradeDisplay = result.grade; }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: 'تفاصيل التفتيش',
          headerStyle: { backgroundColor: Colors.textPrimary },
          headerTintColor: Colors.textInverse,
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handlePreview} style={styles.headerBtn}>
                <FontAwesome name="eye" size={20} color={Colors.textInverse} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => exportInspectionPDF(inspection)} style={styles.headerBtn}>
                <FontAwesome name="file-pdf-o" size={20} color={Colors.textInverse} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => exportInspectionCSV(inspection)} style={styles.headerBtn}>
                <FontAwesome name="file-excel-o" size={20} color={Colors.textInverse} />
              </TouchableOpacity>
              <TouchableOpacity onPress={reopenInspection} style={styles.headerBtn}>
                <FontAwesome name="pencil" size={20} color={Colors.textInverse} />
              </TouchableOpacity>
              <TouchableOpacity onPress={deleteInspection} style={styles.headerBtn}>
                <FontAwesome name="trash" size={20} color={Colors.textInverse} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <View style={styles.header}>
        {inspection.officeName && <Text style={styles.officeName}>{inspection.officeName}</Text>}
        <Text style={styles.facilityName}>{inspection.facilityName}</Text>
        <Text style={styles.address}>{inspection.facilityAddress || 'بدون عنوان'}</Text>
        <Text style={styles.date}>{formatDateLong(inspection.date)}</Text>
        <Text style={styles.inspector}>المحرر: {inspection.inspectorName}</Text>
        <Text style={styles.metaLine}>سبب التفتيش: {inspection.inspectionCause || 'غير محدد'}</Text>
        {inspection.referenceDocument && (
          <Text style={styles.metaLine}>مرجع المستند: {inspection.referenceDocument}</Text>
        )}
        {(inspection.committeeMembers ?? []).length > 0 && (
          <View style={styles.committeeContainer}>
            <Text style={styles.committeeLabel}>أعضاء اللجنة:</Text>
            {inspection.committeeMembers!.map((m, i) => (
              <Text key={i} style={styles.committeeMember}>• {m}</Text>
            ))}
          </View>
        )}
        {inspection.coordinates && (
          <Text style={styles.coordinates}>
            الموقع: {inspection.coordinates.latitude.toFixed(6)}° , {inspection.coordinates.longitude.toFixed(6)}°
          </Text>
        )}
        {scoreDisplay !== undefined && (
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>النتيجة:</Text>
            <Text style={styles.scoreValue}>{scoreDisplay}%</Text>
            <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(gradeDisplay) }]}>
              <Text style={styles.gradeText}>{gradeDisplay}</Text>
            </View>
          </View>
        )}
        {inspection.signature && (
          <View style={styles.signatureContainer}>
            <Text style={styles.signatureLabel}>التوقيع:</Text>
            <Image source={{ uri: inspection.signature }} style={styles.signatureImage} />
          </View>
        )}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.headerRow}>
              <View style={styles.badgeContainer}>
                {item.category && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                  </View>
                )}
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.complianceStatus) }]}>
                <Text style={styles.statusText}>{getStatusText(item.complianceStatus)}</Text>
              </View>
            </View>
            <Text style={styles.criteria}>{item.criteria}</Text>
            <Text style={styles.referenceText}>{item.legalReference}</Text>
            {item.comment && <Text style={styles.comment}>📝 {item.comment}</Text>}
            {item.photoUri && <Image source={{ uri: item.photoUri }} style={styles.thumbnail} />}
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:          { flex: 1, backgroundColor: Colors.background },
  centered:          { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText:         { fontSize: FontSize.lg, color: Colors.danger },
  headerActions:     { flexDirection: 'row' },
  headerBtn:         { marginRight: Spacing.md },
  header:            { backgroundColor: Colors.surface, padding: Spacing.base, marginBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  officeName:        { fontSize: FontSize.base, fontWeight: 'bold', color: Colors.primary, marginBottom: 4 },
  facilityName:      { fontSize: FontSize.xxl, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 4 },
  address:           { fontSize: FontSize.base, color: Colors.textSecondary, marginBottom: 4 },
  date:              { fontSize: FontSize.sm + 1, color: Colors.textTertiary, marginBottom: 2 },
  inspector:         { fontSize: FontSize.sm + 1, color: Colors.primary, marginBottom: 2 },
  metaLine:          { fontSize: FontSize.sm + 1, color: Colors.textPrimary, marginBottom: 2 },
  committeeContainer:{ marginVertical: 4 },
  committeeLabel:    { fontSize: FontSize.sm + 1, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 2 },
  committeeMember:   { fontSize: FontSize.sm + 1, color: Colors.textSecondary, marginLeft: Spacing.sm },
  coordinates:       { fontSize: FontSize.xs + 1, color: Colors.textSecondary, marginTop: 4 },
  scoreRow:          { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  scoreLabel:        { fontSize: FontSize.base, fontWeight: 'bold', color: Colors.textPrimary, marginRight: Spacing.sm },
  scoreValue:        { fontSize: FontSize.base, color: Colors.textPrimary, marginRight: Spacing.sm },
  gradeBadge:        { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.sm },
  gradeText:         { color: Colors.textInverse, fontSize: FontSize.sm, fontWeight: 'bold' },
  signatureContainer:{ marginTop: Spacing.sm, alignItems: 'center' },
  signatureLabel:    { fontSize: FontSize.base, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 4 },
  signatureImage:    { width: 200, height: 100, resizeMode: 'contain', borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, backgroundColor: Colors.surface },
  list:              { padding: Spacing.sm + 2 },
  sectionHeader:     { backgroundColor: Colors.surfaceOffset, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, marginTop: Spacing.sm, borderRadius: Radius.sm },
  sectionTitle:      { fontSize: FontSize.lg, fontWeight: 'bold', color: Colors.textPrimary, textAlign: 'right' },
  itemCard:          { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadow.sm },
  headerRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  badgeContainer:    { flexDirection: 'row', flexWrap: 'wrap', flex: 1 },
  categoryBadge:     { backgroundColor: Colors.primary + '20', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.sm, marginRight: 4, marginBottom: 4 },
  categoryText:      { fontSize: FontSize.xs + 1, color: Colors.primary },
  statusBadge:       { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.sm },
  statusText:        { color: Colors.textInverse, fontSize: FontSize.xs + 1, fontWeight: 'bold' },
  criteria:          { fontSize: FontSize.md, fontWeight: '500', color: Colors.textPrimary, marginBottom: 4 },
  referenceText:     { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4 },
  comment:           { fontSize: FontSize.sm + 1, color: Colors.warning, marginTop: 4 },
  thumbnail:         { width: 80, height: 80, marginTop: Spacing.sm, borderRadius: Radius.sm },
});

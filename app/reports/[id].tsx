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
import { Colors } from '../../constants';
import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import { exportInspectionCSV, exportInspectionPDF } from '../../src/services/pdfService';
import { InspectionItem, SavedInspection } from '../../src/types';
import { formatDateLong } from '../../src/utils/dateUtils';
import { groupByAxis } from '../../src/utils/inspectionUtils';
import { computeScoreAndGrade } from '../../src/utils/scoringUtils';
import { getStatusColor, getStatusText } from '../../src/utils/statusUtils';

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [inspection, setInspection] = useState<SavedInspection | null>(null);
  const [loading, setLoading] = useState(true);
  const inspectionId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    const loadInspection = async () => {
      if (!inspectionId) {
        setInspection(null);
        setLoading(false);
        return;
      }
      try {
        const found = await InspectionRepository.getById(inspectionId);
        setInspection(found);
      } catch (error) {
        console.error('Failed to load inspection', error);
      } finally {
        setLoading(false);
      }
    };
    loadInspection();
  }, [inspectionId]);

  const deleteInspection = async () => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذا التفتيش؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              if (inspectionId) {
                await InspectionRepository.delete(inspectionId);
                router.back();
              }
            } catch (error) {
              console.error('Error deleting inspection', error);
              Alert.alert('خطأ', 'حدث خطأ أثناء الحذف');
            }
          },
        },
      ]
    );
  };

  const reopenInspection = () => {
    if (inspection) {
      router.push({
        pathname: '/(tabs)/inspection/checklist',
        params: {
          draftId: inspection.id,
          facilityId: inspection.facilityId,
          facilityName: inspection.facilityName,
          facilityAddress: inspection.facilityAddress,
        },
      });
    }
  };

  const handlePreview = () => {
    if (inspection) {
      router.push({
        pathname: '/preview',
        params: {
          inspectionId: inspection.id,
          title: inspection.facilityName,
        },
      });
    }
  };

  const sections = useMemo(
    () => (inspection ? groupByAxis(inspection.items) : []),
    [inspection]
  );

  const handleExportPDF = async () => {
    if (inspection) await exportInspectionPDF(inspection);
  };

  const handleExportExcel = async () => {
    if (inspection) await exportInspectionCSV(inspection);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#2c3e50" />
      </SafeAreaView>
    );
  }

  if (!inspection) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>التفتيش غير موجود</Text>
      </SafeAreaView>
    );
  }

  let scoreDisplay = inspection.score;
  let gradeDisplay = inspection.grade;
  if (scoreDisplay === undefined) {
    const result = computeScoreAndGrade(inspection.items);
    if (result.score !== undefined) {
      scoreDisplay = result.score;
      gradeDisplay = result.grade;
    }
  }

  const getGradeColor = (grade?: string): string => {
    switch (grade) {
      case 'A': return Colors.gradeA;
      case 'B': return Colors.gradeB;
      case 'C': return Colors.gradeC;
      case 'D': return Colors.gradeD;
      default:  return Colors.notEvaluated;
    }
  };

  const renderItem = ({ item }: { item: InspectionItem }) => (
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
  );

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: 'تفاصيل التفتيش',
          headerStyle: { backgroundColor: Colors.textPrimary },
          headerTintColor: Colors.textInverse,
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={handleExportPDF} style={{ marginRight: 15 }}>
                <FontAwesome name="file-pdf-o" size={22} color={Colors.textInverse} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleExportExcel} style={{ marginRight: 15 }}>
                <FontAwesome name="file-excel-o" size={22} color={Colors.textInverse} />
              </TouchableOpacity>
              <TouchableOpacity onPress={reopenInspection} style={{ marginRight: 15 }}>
                <FontAwesome name="pencil" size={22} color={Colors.textInverse} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePreview} style={{ marginRight: 15 }}>
                <FontAwesome name="eye" size={22} color={Colors.textInverse} />
              </TouchableOpacity>
              <TouchableOpacity onPress={deleteInspection} style={{ marginRight: 15 }}>
                <FontAwesome name="trash" size={22} color={Colors.textInverse} />
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
        <Text style={styles.cause}>سبب التفتيش: {inspection.inspectionCause || 'غير محدد'}</Text>
        {inspection.referenceDocument && <Text style={styles.reference}>مرجع المستند: {inspection.referenceDocument}</Text>}
        {inspection.committeeMembers && inspection.committeeMembers.length > 0 && (
          <View style={styles.committeeContainer}>
            <Text style={styles.committeeLabel}>أعضاء اللجنة:</Text>
            {inspection.committeeMembers.map((member, idx) => (
              <Text key={idx} style={styles.committeeMember}>• {member}</Text>
            ))}
          </View>
        )}
        {inspection.coordinates && (
          <Text style={styles.coordinates}>
            الموقع: {inspection.coordinates.latitude.toFixed(6)} , {inspection.coordinates.longitude.toFixed(6)}
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
            <Image
              source={{ uri: inspection.signature }}
              style={styles.signatureImage}
            />
          </View>
        )}
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: 'transparent' },
  centered:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: Colors.danger },
  header: {
    backgroundColor: Colors.surface,
    padding: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  officeName:      { fontSize: 14, fontWeight: 'bold', color: Colors.primary, marginBottom: 4 },
  facilityName:    { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 4 },
  address:         { fontSize: 14, color: Colors.textSecondary, marginBottom: 4 },
  date:            { fontSize: 13, color: Colors.textTertiary, marginBottom: 2 },
  inspector:       { fontSize: 13, color: Colors.primary, marginBottom: 2 },
  cause:           { fontSize: 13, color: Colors.textPrimary, marginBottom: 2 },
  reference:       { fontSize: 13, color: Colors.textPrimary, marginBottom: 2 },
  committeeContainer: { marginVertical: 4 },
  committeeLabel:  { fontSize: 13, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 2 },
  committeeMember: { fontSize: 13, color: Colors.textPrimary, marginLeft: 8 },
  coordinates:     { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  scoreRow:   { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  scoreLabel: { fontSize: 14, fontWeight: 'bold', color: Colors.textPrimary, marginRight: 8 },
  scoreValue: { fontSize: 14, color: Colors.textPrimary, marginRight: 8 },
  gradeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  gradeText:  { color: Colors.textInverse, fontSize: 12, fontWeight: 'bold' },
  signatureContainer: { marginTop: 8, alignItems: 'center' },
  signatureLabel: { fontSize: 14, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 4 },
  signatureImage: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 4,
    backgroundColor: Colors.surface,
  },
  list:          { padding: 10 },
  sectionHeader: {
    backgroundColor: Colors.surfaceOffset,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    borderRadius: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary, textAlign: 'right' },
  itemCard: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  headerRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badgeContainer: { flexDirection: 'row', flexWrap: 'wrap', flex: 1 },
  categoryBadge:  {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  categoryText: { fontSize: 11, color: Colors.primary },
  statusBadge:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  statusText:   { color: Colors.textInverse, fontSize: 11, fontWeight: 'bold' },
  criteria:      { fontSize: 15, fontWeight: '500', color: Colors.textPrimary, marginBottom: 4 },
  referenceText: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  comment:       { fontSize: 13, color: Colors.warning, marginTop: 4 },
  thumbnail:     { width: 80, height: 80, marginTop: 8, borderRadius: 4 },
});

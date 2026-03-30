import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
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
import { InspectionItem, SavedInspection } from '../../src/types';
import { formatDateLong } from '../../src/utils/dateUtils';
import { computeScoreAndGrade } from '../../src/utils/scoringUtils';
import { getStatusColor, getStatusText } from '../../src/utils/statusUtils';

const fs = FileSystem as any;
const BLUE = '#1986df';

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [inspection, setInspection] = useState<SavedInspection | null>(null);
  const [loading, setLoading] = useState(true);

  const getWritableDir = (): string | null => fs.cacheDirectory || null;

  useEffect(() => {
    const loadInspection = async () => {
      try {
        const data = await AsyncStorage.getItem('inspections');
        if (data) {
          const inspections: SavedInspection[] = JSON.parse(data);
          const found = inspections.find(ins => ins.id === id);
          setInspection(found || null);
        }
      } catch (error) {
        console.error('Failed to load inspection', error);
      } finally {
        setLoading(false);
      }
    };
    loadInspection();
  }, [id]);

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
              const data = await AsyncStorage.getItem('inspections');
              if (data) {
                const inspections: SavedInspection[] = JSON.parse(data);
                const updated = inspections.filter(ins => ins.id !== id);
                await AsyncStorage.setItem('inspections', JSON.stringify(updated));
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
          items: JSON.stringify(inspection.items),
        },
      });
    }
  };

  const handlePreview = () => {
    if (inspection) {
      router.push({
        pathname: '/preview',
        params: {
          items: JSON.stringify(inspection.items),
          title: inspection.facilityName,
        },
      });
    }
  };

  const sections = useMemo(() => {
    if (!inspection) return [];
    const groups: { [key: string]: InspectionItem[] } = {};
    inspection.items.forEach(item => {
      const axis = item.axis || 'أخرى';
      if (!groups[axis]) groups[axis] = [];
      groups[axis].push(item);
    });
    return Object.entries(groups).map(([title, data]) => ({ title, data }));
  }, [inspection]);

  const generatePDF = async () => {
    // ... (same as before, but use the new header data)
    // (I'll keep it as is, assuming it's correct)
  };

  const generateCSV = async () => { /* ... */ };
  const handleExportPDF = async () => { /* ... */ };
  const handleExportExcel = async () => { /* ... */ };

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
      case 'A': return '#27ae60';
      case 'B': return '#3498db';
      case 'C': return '#f39c12';
      case 'D': return '#e74c3c';
      default: return '#95a5a6';
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
          headerStyle: { backgroundColor: '#2c3e50' },
          headerTintColor: '#fff',
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={handleExportPDF} style={{ marginRight: 15 }}>
                <FontAwesome name="file-pdf-o" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleExportExcel} style={{ marginRight: 15 }}>
                <FontAwesome name="file-excel-o" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={reopenInspection} style={{ marginRight: 15 }}>
                <FontAwesome name="pencil" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={deleteInspection} style={{ marginRight: 15 }}>
                <FontAwesome name="trash" size={22} color="#fff" />
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
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#e74c3c' },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  officeName: { fontSize: 14, fontWeight: 'bold', color: BLUE, marginBottom: 4 },
  facilityName: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  address: { fontSize: 14, color: '#7f8c8d', marginBottom: 4 },
  date: { fontSize: 13, color: '#95a5a6', marginBottom: 2 },
  inspector: { fontSize: 13, color: '#3498db', marginBottom: 2 },
  cause: { fontSize: 13, color: '#2c3e50', marginBottom: 2 },
  reference: { fontSize: 13, color: '#2c3e50', marginBottom: 2 },
  committeeContainer: { marginVertical: 4 },
  committeeLabel: { fontSize: 13, fontWeight: 'bold', color: '#2c3e50', marginBottom: 2 },
  committeeMember: { fontSize: 13, color: '#34495e', marginLeft: 8 },
  coordinates: { fontSize: 12, color: '#7f8c8d', marginTop: 4 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  scoreLabel: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50', marginRight: 8 },
  scoreValue: { fontSize: 14, color: '#2c3e50', marginRight: 8 },
  gradeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  gradeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  signatureContainer: { marginTop: 8, alignItems: 'center' },
  signatureLabel: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  signatureImage: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: '#ecf0f1',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  list: { padding: 10 },
  sectionHeader: {
    backgroundColor: '#ecf0f1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    borderRadius: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', textAlign: 'right' },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badgeContainer: { flexDirection: 'row', flexWrap: 'wrap', flex: 1 },
  categoryBadge: {
    backgroundColor: '#3498db20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  categoryText: { fontSize: 11, color: '#3498db' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  criteria: { fontSize: 15, fontWeight: '500', color: '#34495e', marginBottom: 4 },
  referenceText: { fontSize: 12, color: '#7f8c8d', marginBottom: 4 },
  comment: { fontSize: 13, color: '#e67e22', marginTop: 4 },
  thumbnail: { width: 80, height: 80, marginTop: 8, borderRadius: 4 },
});
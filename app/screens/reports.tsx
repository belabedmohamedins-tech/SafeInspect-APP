import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
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
import { Colors } from '../../src/constants/colors';
import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import { exportInspectionCSV, exportInspectionPDF } from '../../src/services/pdfService';
import { SavedInspection } from '../../src/types';
import { formatDateForCard } from '../../src/utils/dateUtils';
import { getComplianceSummary } from '../../src/utils/statusUtils';

export default function ReportsScreen() {
  const [inspections, setInspections] = useState<SavedInspection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'compliant' | 'non-compliant'>('all');
  const router = useRouter();

  const loadInspections = async () => {
    try {
      const completed = await InspectionRepository.getCompleted();
      setInspections(completed);
    } catch (error) {
      console.error('Failed to load inspections', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadInspections();
    }, [])
  );

  const deleteInspection = async (id: string) => {
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
              await InspectionRepository.delete(id);
              await loadInspections();
            } catch (error) {
              console.error('Error deleting inspection', error);
              Alert.alert('خطأ', 'حدث خطأ أثناء الحذف');
            }
          },
        },
      ]
    );
  };

  const handlePreview = (inspection: SavedInspection) => {
    router.push({
      pathname: '/preview',
      params: {
        inspectionId: inspection.id,
        title: inspection.facilityName,
      },
    });
  };

  const filteredInspections = useMemo(() => {
    return inspections.filter(inspection => {
      const matchesSearch = inspection.facilityName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (filterStatus === 'all') return true;
      const summary = getComplianceSummary(inspection.items);
      if (filterStatus === 'compliant') return summary.nonCompliant === 0;
      if (filterStatus === 'non-compliant') return summary.nonCompliant > 0;
      return true;
    });
  }, [inspections, searchQuery, filterStatus]);

  const renderRightActions = (id: string) => (
    <TouchableOpacity style={styles.deleteButton} onPress={() => deleteInspection(id)}>
      <FontAwesome name="trash" size={24} color="#fff" />
      <Text style={styles.deleteText}>حذف</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: SavedInspection }) => {
    const summary = getComplianceSummary(item.items);
    const isCompliant = summary.nonCompliant === 0;
    return (
      <Swipeable renderRightActions={() => renderRightActions(item.id)}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push({ pathname: '/reports/[id]', params: { id: item.id } })}>
          <View style={styles.cardHeader}>
            <Text style={styles.facilityName}>{item.facilityName}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isCompliant ? Colors.green : Colors.red },
              ]}>
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
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View style={styles.filterRow}>
        {(['all', 'compliant', 'non-compliant'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filterStatus === f && styles.filterBtnActive]}
            onPress={() => setFilterStatus(f)}>
            <Text style={[styles.filterBtnText, filterStatus === f && styles.filterBtnTextActive]}>
              {f === 'all' ? 'الكل' : f === 'compliant' ? 'مطابق' : 'غير مطابق'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  searchInput: {
    margin: 10,
    padding: 10,
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterRow: { flexDirection: 'row', paddingHorizontal: 10, marginBottom: 6, gap: 8 },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.background,
  },
  filterBtnActive: { backgroundColor: Colors.blue },
  filterBtnText: { fontSize: 13, color: Colors.mid },
  filterBtnTextActive: { color: Colors.white },
  list: { padding: 10 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  facilityName: { fontSize: 16, fontWeight: 'bold', color: Colors.dark, flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  statusBadgeText: { color: Colors.white, fontSize: 11, fontWeight: 'bold' },
  date: { fontSize: 13, color: Colors.mid, marginBottom: 2 },
  inspector: { fontSize: 13, color: Colors.blue, marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  statItem: { fontSize: 13, color: Colors.dark },
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionBtnText: { fontSize: 13 },
  deleteButton: {
    backgroundColor: Colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
    borderRadius: 10,
    marginBottom: 10,
  },
  deleteText: { color: Colors.white, fontSize: 12, marginTop: 4 },
  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: Colors.mid, marginTop: 10 },
});

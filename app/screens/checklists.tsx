// app/screens/checklists.tsx
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants';
import { criteriaByActivity } from '../../src/criteriaData';
import { exportBlankChecklistPDF, exportInspectionCSV } from '../../src/services/pdfService';
import { CriteriaPreviewStore } from '../../src/stores/CriteriaPreviewStore';
import { SavedInspection } from '../../src/types';

/** Stable fake id used so preview/index.tsx knows to read from the store. */
const PREVIEW_ID = '__preview__';

export default function ChecklistsScreen() {
  const router = useRouter();
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [modalVisible, setModalVisible]         = useState(false);
  const [searchQuery,   setSearchQuery]          = useState('');

  const activities         = Object.keys(criteriaByActivity).filter(k => k !== 'default');
  const filteredActivities = activities.filter(a =>
    a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /** Build a fake SavedInspection from raw criteria so preview & CSV export work. */
  const buildPayload = (): SavedInspection | null => {
    if (!selectedActivity) return null;
    const criteria = criteriaByActivity[selectedActivity] || [];
    return {
      id:               PREVIEW_ID,
      facilityId:       selectedActivity,
      facilityName:     selectedActivity,
      facilityAddress:  '',
      date:             new Date().toISOString(),
      inspectorName:    '',
      inspectionCause:  '',
      status:           'completed',
      items: criteria.map((item, idx) => ({
        ...item,
        id:                `${selectedActivity}-${idx}`,
        complianceStatus:  'not-evaluated' as const,
        comment:           '',
      })),
    } as SavedInspection;
  };

  const handlePreview = () => {
    if (!selectedActivity) {
      Alert.alert('تنبيه', 'الرجاء اختيار نوع المنشأة');
      return;
    }
    const payload = buildPayload();
    if (!payload) return;

    CriteriaPreviewStore.setInspection(payload);

    router.push({
      pathname: '/preview',
      params: { inspectionId: PREVIEW_ID, title: selectedActivity },
    });
  };

  // PDF → blank printable checklist (no scores, no statuses, ready for offline filling)
  const handlePDF = async () => {
    if (!selectedActivity) {
      Alert.alert('تنبيه', 'الرجاء اختيار نوع المنشأة');
      return;
    }
    const criteria = criteriaByActivity[selectedActivity] || [];
    const items = criteria.map((item, idx) => ({
      ...item,
      id: `${selectedActivity}-${idx}`,
      complianceStatus: 'not-evaluated' as const,
      comment: '',
    }));
    await exportBlankChecklistPDF(selectedActivity, items);
  };

  const handleExcel = async () => {
    const payload = buildPayload();
    if (!payload) { Alert.alert('تنبيه', 'الرجاء اختيار نوع المنشأة'); return; }
    await exportInspectionCSV(payload);
  };

  const selectActivity = (activity: string) => {
    setSelectedActivity(activity);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.label}>اختر نوع المنشأة:</Text>

        <TouchableOpacity style={styles.pickerButton} onPress={() => setModalVisible(true)}>
          <Text style={selectedActivity ? styles.pickerButtonText : styles.placeholderText}>
            {selectedActivity || 'انقر لاختيار نوع المنشأة...'}
          </Text>
          <FontAwesome name="chevron-down" size={16} color={Colors.mid} />
        </TouchableOpacity>

        {selectedActivity && (
          <TouchableOpacity
            style={[styles.previewButton, { backgroundColor: Colors.blue }]}
            onPress={handlePreview}
          >
            <FontAwesome name="eye" size={20} color={Colors.white} />
            <Text style={styles.previewButtonText}>معاينة القائمة</Text>
          </TouchableOpacity>
        )}

        <View style={styles.buttonsRow}>
          <TouchableOpacity style={[styles.actionButton, styles.pdfButton]} onPress={handlePDF}>
            <FontAwesome name="file-pdf-o" size={20} color={Colors.white} />
            <Text style={styles.actionButtonText}>PDF للطباعة</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.excelButton]} onPress={handleExcel}>
            <FontAwesome name="file-excel-o" size={20} color={Colors.white} />
            <Text style={styles.actionButtonText}>Excel</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.note}>
          زر PDF يُصدر نموذجاً فارغاً جاهزاً للطباعة والتعبئة اليدوية.
        </Text>
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>اختر نوع المنشأة</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome name="close" size={24} color={Colors.dark} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchContainer}>
              <FontAwesome name="search" size={16} color={Colors.mid} style={styles.modalSearchIcon} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="بحث..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={Colors.mid}
                textAlign="right"
              />
            </View>

            <FlatList
              data={filteredActivities}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => selectActivity(item)}>
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.modalList}
              ListEmptyComponent={
                <View style={styles.modalEmpty}>
                  <Text style={styles.modalEmptyText}>لا توجد نتائج</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:         { flex: 1, backgroundColor: Colors.background },
  container:        { padding: 20 },
  label:            { fontSize: 16, fontWeight: 'bold', color: Colors.dark, marginBottom: 8 },
  pickerButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.light,
    borderRadius: 6,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerButtonText:  { fontSize: 14, color: Colors.dark },
  placeholderText:   { fontSize: 14, color: Colors.mid },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
  },
  previewButtonText: { color: Colors.white, fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  buttonsRow:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  pdfButton:         { backgroundColor: Colors.red },
  excelButton:       { backgroundColor: Colors.green },
  actionButtonText:  { color: Colors.white, fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  note:              { fontSize: 12, color: Colors.mid, textAlign: 'center' },
  modalOverlay:      { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent:      { backgroundColor: Colors.white, borderRadius: 8, width: '90%', maxHeight: '80%', padding: 16 },
  modalHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle:        { fontSize: 18, fontWeight: 'bold', color: Colors.dark },
  modalSearchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 6, paddingHorizontal: 8, marginBottom: 12 },
  modalSearchIcon:   { marginRight: 6 },
  modalSearchInput:  { flex: 1, height: 40, fontSize: 14, color: Colors.dark, textAlign: 'right' },
  modalList:         { paddingBottom: 16 },
  modalItem:         { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.background },
  modalItemText:     { fontSize: 14, color: Colors.dark },
  modalEmpty:        { alignItems: 'center', padding: 20 },
  modalEmptyText:    { color: Colors.mid, fontSize: 14 },
});

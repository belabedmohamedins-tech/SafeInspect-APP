import { FontAwesome } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Colors } from '../../../constants';
import {
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addUserFacility } from '../../../src/facilitiesService';
import { facilityCategories, getCategoryLabels } from '../../../src/facilityCategories';

export default function AddFacilityScreen() {
  const router = useRouter();
  const categoryLabels = getCategoryLabels();
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [address, setAddress] = useState('');
  const [licenseType, setLicenseType] = useState('');
  const [licenseDetails, setLicenseDetails] = useState('');
  const [year, setYear] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');

  const filteredCategories = facilityCategories.filter((item) => {
    const fullLabel = `${item.rubrique} - ${item.label} (${item.regime})`;
    return fullLabel.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSelectCategory = (index: number) => {
    setSelectedCategoryIndex(index);
    setModalVisible(false);
    setSearchQuery('');
  };

  const handleSave = async () => {
    if (!projectName.trim() || !ownerName.trim()) {
      Alert.alert('تنبيه', 'الرجاء إدخال اسم المشروع وصاحب المشروع');
      return;
    }
    if (selectedCategoryIndex === null) {
      Alert.alert('تنبيه', 'الرجاء اختيار نوع النشاط');
      return;
    }
    try {
      const selected = facilityCategories[selectedCategoryIndex];
      const activityDisplay = `${selected.rubrique} - ${selected.label} (${selected.regime})`;
      await addUserFacility({
        id: '',
        projectName,
        ownerName,
        activity: activityDisplay,
        address,
        licenseType,
        licenseDetails,
        year,
        category,
        notes,
      });
      Alert.alert('نجاح', 'تمت إضافة المنشأة بنجاح');
      router.back();
    } catch (error) {
      console.error('Error adding facility', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ');
    }
  };

  const selectedLabel = selectedCategoryIndex !== null
    ? `${facilityCategories[selectedCategoryIndex].rubrique} - ${facilityCategories[selectedCategoryIndex].label}`
    : '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: 'إضافة منشأة مصنفة',
          headerStyle: { backgroundColor: Colors.blue },
          headerTintColor: '#fff',
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>نوع النشاط (حسب القانون 07-144)</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={selectedCategoryIndex !== null ? styles.pickerButtonText : styles.placeholderText}>
            {selectedCategoryIndex !== null ? selectedLabel : 'اختر النشاط...'}
          </Text>
          <FontAwesome name="chevron-down" size={16} color="#7f8c8d" />
        </TouchableOpacity>

        <Text style={styles.label}>اسم المشروع</Text>
        <TextInput style={styles.input} value={projectName} onChangeText={setProjectName} />

        <Text style={styles.label}>صاحب المشروع</Text>
        <TextInput style={styles.input} value={ownerName} onChangeText={setOwnerName} />

        <Text style={styles.label}>العنوان</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} />

        <Text style={styles.label}>نوع الرخصة</Text>
        <TextInput style={styles.input} value={licenseType} onChangeText={setLicenseType} placeholder="رخصة / تصريح / بدون" />

        <Text style={styles.label}>تفاصيل الرخصة</Text>
        <TextInput style={styles.input} value={licenseDetails} onChangeText={setLicenseDetails} />

        <Text style={styles.label}>سنة الإنشاء</Text>
        <TextInput style={styles.input} value={year} onChangeText={setYear} keyboardType="numeric" />

        <Text style={styles.label}>الفئة (اختياري)</Text>
        <TextInput style={styles.input} value={category} onChangeText={setCategory} />

        <Text style={styles.label}>ملاحظات</Text>
        <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} multiline numberOfLines={4} />

        <TouchableOpacity style={[styles.saveButton, { backgroundColor: Colors.blue }]} onPress={handleSave}>
          <Text style={styles.saveButtonText}>حفظ المنشأة</Text>
        </TouchableOpacity>
        <View style={styles.bottomSpace} />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>اختر النشاط</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchContainer}>
              <FontAwesome name="search" size={16} color="#7f8c8d" style={styles.modalSearchIcon} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="بحث..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#95a5a6"
              />
            </View>

            <FlatList
              data={filteredCategories}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectCategory(facilityCategories.indexOf(item))}
                >
                  <Text style={[styles.modalItemRubrique, { color: Colors.blue }]}>{item.rubrique}</Text>
                  <Text style={styles.modalItemLabel}>{item.label}</Text>
                  <Text style={styles.modalItemRegime}>({item.regime})</Text>
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
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  container: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#34495e', marginTop: 10, marginBottom: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#bdc3c7', borderRadius: 6, padding: 12, fontSize: 14 },
  pickerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 6,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: { fontSize: 14, color: '#2c3e50' },
  placeholderText: { fontSize: 14, color: '#95a5a6' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  saveButton: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  bottomSpace: { height: 20 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', borderRadius: 8, width: '90%', maxHeight: '80%', padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  modalSearchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 6, paddingHorizontal: 8, marginBottom: 12 },
  modalSearchIcon: { marginRight: 6 },
  modalSearchInput: { flex: 1, height: 40, fontSize: 14, color: '#2c3e50' },
  modalList: { paddingBottom: 16 },
  modalItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
  modalItemRubrique: { fontSize: 12, fontWeight: 'bold' },
  modalItemLabel: { fontSize: 14, color: '#2c3e50' },
  modalItemRegime: { fontSize: 12, color: '#7f8c8d' },
  modalEmpty: { alignItems: 'center', padding: 20 },
  modalEmptyText: { color: '#95a5a6', fontSize: 14 },
});

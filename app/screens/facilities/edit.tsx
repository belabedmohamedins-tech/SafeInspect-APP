// app/screens/facilities/edit.tsx
// Pre-fills all editable fields from the existing user facility and saves
// via FacilityRepository.update().
import { FontAwesome } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { Colors, Spacing } from '../../../constants';
import { FacilityRepository } from '../../../src/repositories';
import { facilityCategories } from '../../../src/facilityCategories';
import { Facility } from '../../../src/types';

export default function EditFacilityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [facility, setFacility]       = useState<Facility | null>(null);

  // Form state
  const [projectName, setProjectName] = useState('');
  const [ownerName, setOwnerName]     = useState('');
  const [address, setAddress]         = useState('');
  const [licenseType, setLicenseType] = useState('');
  const [licenseDetails, setLicenseDetails] = useState('');
  const [year, setYear]               = useState('');
  const [notes, setNotes]             = useState('');

  // Activity picker
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const filteredCategories = facilityCategories.filter(item => {
    const label = `${item.rubrique} - ${item.label} (${item.regime})`;
    return label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  useEffect(() => {
    (async () => {
      if (!id) { router.back(); return; }
      const f = await FacilityRepository.getById(id);
      if (!f) {
        Alert.alert('خطأ', 'لم يتم العثور على المنشأة');
        router.back();
        return;
      }
      setFacility(f);
      setProjectName(f.projectName);
      setOwnerName(f.ownerName);
      setAddress(f.address ?? '');
      setLicenseType(f.licenseType ?? '');
      setLicenseDetails(f.licenseDetails ?? '');
      setYear(f.year ?? '');
      setNotes(f.notes ?? '');
      // Pre-select activity category
      const idx = facilityCategories.findIndex(c => {
        const label = `${c.rubrique} - ${c.label} (${c.regime})`;
        return f.activity === label || f.activity?.startsWith(`${c.rubrique} - ${c.label}`);
      });
      if (idx !== -1) setSelectedCategoryIndex(idx);
      setLoading(false);
    })();
  }, [id]);

  const selectedLabel = selectedCategoryIndex !== null
    ? `${facilityCategories[selectedCategoryIndex].rubrique} - ${facilityCategories[selectedCategoryIndex].label}`
    : '';

  const handleSave = async () => {
    if (!projectName.trim() || !ownerName.trim()) {
      Alert.alert('تنبيه', 'الرجاء إدخال اسم المشروع وصاحب المشروع');
      return;
    }
    if (selectedCategoryIndex === null) {
      Alert.alert('تنبيه', 'الرجاء اختيار نوع النشاط');
      return;
    }
    setSaving(true);
    try {
      const selected = facilityCategories[selectedCategoryIndex];
      const activityDisplay = `${selected.rubrique} - ${selected.label} (${selected.regime})`;
      await FacilityRepository.update(id!, {
        projectName,
        ownerName,
        address,
        activity: activityDisplay,
        licenseType,
        licenseDetails,
        year,
        notes,
      });
      Alert.alert('نجاح', 'تم تحديث بيانات المنشأة');
      router.back();
    } catch (e) {
      console.error('EditFacility save error:', e);
      Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: 'تعديل منشأة',
          headerStyle: { backgroundColor: Colors.warning ?? '#e67e22' },
          headerTintColor: '#fff',
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>نوع النشاط</Text>
        <TouchableOpacity style={styles.pickerButton} onPress={() => setModalVisible(true)}>
          <Text style={selectedCategoryIndex !== null ? styles.pickerText : styles.placeholder}>
            {selectedCategoryIndex !== null ? selectedLabel : 'اختر النشاط...'}
          </Text>
          <FontAwesome name="chevron-down" size={14} color="#7f8c8d" />
        </TouchableOpacity>

        <Text style={styles.label}>اسم المشروع</Text>
        <TextInput style={styles.input} value={projectName} onChangeText={setProjectName} />

        <Text style={styles.label}>صاحب المشروع</Text>
        <TextInput style={styles.input} value={ownerName} onChangeText={setOwnerName} />

        <Text style={styles.label}>العنوان</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} />

        <Text style={styles.label}>نوع الرخصة</Text>
        <TextInput style={styles.input} value={licenseType} onChangeText={setLicenseType} />

        <Text style={styles.label}>تفاصيل الرخصة</Text>
        <TextInput style={styles.input} value={licenseDetails} onChangeText={setLicenseDetails} />

        <Text style={styles.label}>سنة الإنشاء</Text>
        <TextInput style={styles.input} value={year} onChangeText={setYear} keyboardType="numeric" />

        <Text style={styles.label}>ملاحظات</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: Colors.warning ?? '#e67e22', opacity: saving ? 0.6 : 1 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>حفظ التعديلات</Text>
          }
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Activity picker modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>اختر النشاط</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome name="close" size={22} color="#2c3e50" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalSearch}>
              <FontAwesome name="search" size={14} color="#7f8c8d" style={{ marginRight: 6 }} />
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
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCategoryIndex(facilityCategories.indexOf(item));
                    setModalVisible(false);
                    setSearchQuery('');
                  }}
                >
                  <Text style={[styles.rubrique, { color: Colors.blue }]}>{item.rubrique}</Text>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <Text style={styles.regime}>({item.regime})</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingBottom: 16 }}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={{ color: '#95a5a6' }}>لا توجد نتائج</Text>
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
  safeArea:  { flex: 1 },
  centered:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: Spacing.base, paddingBottom: 40 },
  label:     { fontSize: 13, fontWeight: '600', color: '#34495e', marginTop: Spacing.base, marginBottom: 4 },
  input:     { backgroundColor: '#fff', borderWidth: 1, borderColor: '#bdc3c7', borderRadius: 6, padding: 11, fontSize: 14 },
  pickerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 6,
    padding: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText:  { fontSize: 14, color: '#2c3e50' },
  placeholder: { fontSize: 14, color: '#95a5a6' },
  textArea:    { minHeight: 80, textAlignVertical: 'top' },
  saveBtn:     { padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 28 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox:   { backgroundColor: '#fff', borderRadius: 8, width: '90%', maxHeight: '80%', padding: 16 },
  modalHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: '#2c3e50' },
  modalSearch:{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 6, paddingHorizontal: 8, marginBottom: 10 },
  modalSearchInput: { flex: 1, height: 38, fontSize: 14, color: '#2c3e50' },
  modalItem:  { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
  rubrique:   { fontSize: 11, fontWeight: 'bold' },
  itemLabel:  { fontSize: 14, color: '#2c3e50' },
  regime:     { fontSize: 11, color: '#7f8c8d' },
  empty:      { alignItems: 'center', padding: 20 },
});

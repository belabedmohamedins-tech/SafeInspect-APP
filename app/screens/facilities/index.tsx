// app/screens/facilities/index.tsx
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    FlatList,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../../constants';
import { getAllFacilities } from '../../../src/facilitiesService';
import { Facility } from '../../../src/types';

export default function FacilitiesScreen() {
  const router = useRouter();
  const [facilitiesList, setFacilitiesList] = useState<Facility[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadFacilities = async () => {
    const all = await getAllFacilities();
    setFacilitiesList(all);
  };

  useFocusEffect(
    useCallback(() => {
      loadFacilities();
    }, [])
  );

  // derive filtered list reactively — no separate state needed
  const filteredFacilities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return facilitiesList.filter(
      f =>
        f.projectName.toLowerCase().includes(q) ||
        (f.ownerName ?? '').toLowerCase().includes(q) ||
        (f.address  ?? '').toLowerCase().includes(q)
    );
  }, [facilitiesList, searchQuery]);

  const handleFacilityPress = (facility: Facility) => {
    setSelectedFacility(facility);
    setModalVisible(true);
  };

  const renderFacility = ({ item }: { item: Facility }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleFacilityPress(item)}>
      <Text style={styles.projectName}>{item.projectName}</Text>
      <Text style={styles.owner}>{item.ownerName}</Text>
      <Text style={styles.address}>{item.address || 'بدون عنوان'}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* زر إضافة منشأة */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/facilities/add' as any)}
      >
        <FontAwesome name="plus-circle" size={24} color={Colors.textInverse} />
        <Text style={styles.addButtonText}>إضافة منشأة جديدة</Text>
      </TouchableOpacity>

      {/* شريط البحث */}
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن منشأة..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.textTertiary}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <FontAwesome name="times-circle" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* نتائج البحث */}
      {searchQuery !== '' && (
        <FlatList
          data={filteredFacilities}
          keyExtractor={(item) => item.id}
          renderItem={renderFacility}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>لا توجد منشآت تطابق البحث</Text>
            </View>
          }
        />
      )}

      {/* مودال البطاقة التقنية */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedFacility && (
              <>
                <Text style={styles.modalTitle}>{selectedFacility.projectName}</Text>
                <DetailRow label="صاحب المشروع" value={selectedFacility.ownerName} />
                <DetailRow label="النشاط"          value={selectedFacility.activity} />
                <DetailRow label="العنوان"          value={selectedFacility.address || 'غير محدد'} />
                <DetailRow label="نوع الترخيص"     value={selectedFacility.licenseType || 'غير محدد'} />
                <DetailRow label="رقم الترخيص"     value={selectedFacility.licenseNumber || 'غير محدد'} />
                <DetailRow label="انتهاء الترخيص"   value={selectedFacility.licenseExpiry || 'غير محدد'} />

                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCloseBtnText}>إغلاق</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.modalRow}>
      <Text style={styles.modalValue}>{value}</Text>
      <Text style={styles.modalLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea:         { flex: 1, backgroundColor: Colors.background },
  addButton:        {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    margin: 10,
    padding: 12,
    borderRadius: 8,
  },
  addButtonText:    { color: Colors.textInverse, fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  searchContainer:  { flexDirection: 'row', alignItems: 'center', margin: 10, backgroundColor: Colors.textInverse, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 10 },
  searchIcon:       { marginRight: 6 },
  searchInput:      { flex: 1, paddingVertical: 10, fontSize: 15, color: Colors.textPrimary, textAlign: 'right' },
  list:             { paddingHorizontal: 10 },
  card: {
    backgroundColor: Colors.textInverse,
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
  },
  projectName:      { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
  owner:            { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  address:          { fontSize: 13, color: Colors.textTertiary, marginTop: 2 },
  empty:            { alignItems: 'center', padding: 30 },
  emptyText:        { color: Colors.textSecondary, fontSize: 15 },
  modalOverlay:     { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)' },
  modalContent:     { backgroundColor: Colors.textInverse, borderRadius: 14, width: '90%', padding: 20 },
  modalTitle:       { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 14, textAlign: 'right' },
  modalRow:         { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalLabel:       { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  modalValue:       { fontSize: 14, color: Colors.textPrimary, flex: 1, textAlign: 'right', marginLeft: 8 },
  modalCloseBtn:    { backgroundColor: Colors.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 14 },
  modalCloseBtnText:{ color: Colors.textInverse, fontWeight: 'bold', fontSize: 16 },
});

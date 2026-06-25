// app/screens/facilities/index.tsx
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Colors } from '../../../constants';
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
import { getAllFacilities, searchFacilities } from '../../../src/facilitiesService';
import { Facility } from '../../../src/types';

export default function FacilitiesScreen() {
  const router = useRouter();
  const [facilitiesList, setFacilitiesList] = useState<Facility[]>([]);
  const [searchResults, setSearchResults] = useState<Facility[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadFacilities = async () => {
    const all = await getAllFacilities();
    setFacilitiesList(all);
    setSearchResults([]);
    setSearchQuery('');
  };

  useFocusEffect(
    useCallback(() => {
      loadFacilities();
    }, [])
  );

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setSearchResults([]);
    } else {
      // Use service-layer search: multi-field, diacritic-insensitive
      const results = await searchFacilities(text);
      setSearchResults(results);
    }
  };

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
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: Colors.blue }]}
        onPress={() => router.push('/facilities/add')}
      >
        <FontAwesome name="plus-circle" size={24} color="#fff" />
        <Text style={styles.addButtonText}>إضافة منشأة جديدة</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={18} color="#7f8c8d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن منشأة..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#95a5a6"
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <FontAwesome name="times-circle" size={18} color="#7f8c8d" />
          </TouchableOpacity>
        )}
      </View>

      {searchQuery !== '' && (
        <FlatList
          data={searchResults}
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedFacility && (
              <>
                <Text style={styles.modalTitle}>{selectedFacility.projectName}</Text>
                <View style={styles.modalRow}>
                  <Text style={styles.modalValue}>{selectedFacility.ownerName}</Text>
                  <Text style={styles.modalLabel}>صاحب المشروع</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalValue}>{selectedFacility.activity}</Text>
                  <Text style={styles.modalLabel}>النشاط</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalValue}>{selectedFacility.address || 'غير محدد'}</Text>
                  <Text style={styles.modalLabel}>العنوان</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalValue}>{selectedFacility.licenseType || 'غير محدد'}</Text>
                  <Text style={styles.modalLabel}>نوع الرخصة</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalValue}>{selectedFacility.licenseDetails || 'لا يوجد'}</Text>
                  <Text style={styles.modalLabel}>تفاصيل الرخصة</Text>
                </View>
                {selectedFacility.notes && (
                  <View style={styles.modalRow}>
                    <Text style={styles.modalValue}>{selectedFacility.notes}</Text>
                    <Text style={styles.modalLabel}>ملاحظات</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.modalCloseButton, { backgroundColor: Colors.blue }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCloseText}>إغلاق</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  addButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 15, margin: 10, marginBottom: 5, borderRadius: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    margin: 10, marginTop: 5, paddingHorizontal: 10, borderRadius: 8,
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 45, fontSize: 16, textAlign: 'right', color: '#2c3e50' },
  list: { padding: 10 },
  card: {
    backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  projectName: { fontSize: 16, fontWeight: 'bold', color: '#34495e', textAlign: 'right' },
  owner: { fontSize: 14, color: '#7f8c8d', marginTop: 4, textAlign: 'right' },
  address: { fontSize: 13, color: '#95a5a6', marginTop: 2, textAlign: 'right' },
  empty: { alignItems: 'center', padding: 20 },
  emptyText: { color: '#95a5a6', fontSize: 16 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', borderRadius: 8, padding: 20, width: '80%', maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50', marginBottom: 15, textAlign: 'center' },
  modalRow: { flexDirection: 'row', marginBottom: 10, justifyContent: 'space-between' },
  modalLabel: { fontSize: 14, fontWeight: 'bold', color: '#34495e', textAlign: 'left', flex: 1, marginLeft: 10 },
  modalValue: { fontSize: 14, color: '#7f8c8d', textAlign: 'right', flex: 2 },
  modalCloseButton: { padding: 10, borderRadius: 6, alignItems: 'center', marginTop: 20 },
  modalCloseText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

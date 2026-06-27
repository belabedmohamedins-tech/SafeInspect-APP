// app/screens/facilities/index.tsx
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../../constants';
import { getAllFacilities, searchFacilities } from '../../../src/facilitiesService';
import { Facility } from '../../../src/types';

export default function FacilitiesScreen() {
  const router = useRouter();
  const [allFacilities, setAllFacilities]     = useState<Facility[]>([]);
  const [displayList, setDisplayList]         = useState<Facility[]>([]);
  const [searchQuery, setSearchQuery]         = useState('');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [modalVisible, setModalVisible]       = useState(false);

  const load = async () => {
    const all = await getAllFacilities();
    setAllFacilities(all);
    setDisplayList(all);
    setSearchQuery('');
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setDisplayList(allFacilities);
    } else {
      setDisplayList(await searchFacilities(text));
    }
  };

  const openModal = (facility: Facility) => {
    setSelectedFacility(facility);
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const startInspection = () => {
    if (!selectedFacility) return;
    closeModal();
    router.push({
      pathname: '/(tabs)/inspection/start',
      params: {
        facilityId:      selectedFacility.id,
        facilityName:    selectedFacility.projectName,
        facilityAddress: selectedFacility.address,
        activity:        selectedFacility.activity,
      },
    });
  };

  const renderFacility = ({ item }: { item: Facility }) => (
    <TouchableOpacity style={styles.card} onPress={() => openModal(item)}>
      <View style={styles.cardBadge}>
        <Text style={styles.cardBadgeText} numberOfLines={1}>{item.activity}</Text>
      </View>
      <Text style={styles.projectName}>{item.projectName}</Text>
      <Text style={styles.owner}>{item.ownerName}</Text>
      <Text style={styles.address} numberOfLines={1}>{item.address || 'بدون عنوان'}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Add button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: Colors.blue }]}
        onPress={() => router.push('/screens/facilities/add')}
      >
        <FontAwesome name="plus-circle" size={22} color="#fff" />
        <Text style={styles.addButtonText}>إضافة منشأة جديدة</Text>
      </TouchableOpacity>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={16} color="#7f8c8d" style={styles.searchIcon} />
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

      {/* Count */}
      <Text style={styles.countLabel}>
        {searchQuery
          ? `${displayList.length} نتيجة`
          : `إجمالي المنشآت: ${allFacilities.length}`
        }
      </Text>

      {/* Always-visible list */}
      <FlatList
        data={displayList}
        keyExtractor={item => item.id}
        renderItem={renderFacility}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <FontAwesome name="building" size={44} color="#bdc3c7" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'لا توجد منشآت تطابق البحث' : 'لا توجد منشآت'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={[styles.emptyAction, { backgroundColor: Colors.blue }]}
                onPress={() => router.push('/screens/facilities/add')}
              >
                <Text style={styles.emptyActionText}>+ إضافة منشأة</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Detail / action modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            {selectedFacility && (
              <>
                <Text style={styles.modalTitle}>{selectedFacility.projectName}</Text>

                <InfoRow label="صاحب المشروع" value={selectedFacility.ownerName} />
                <InfoRow label="النشاط"       value={selectedFacility.activity} />
                <InfoRow label="العنوان"       value={selectedFacility.address || 'غير محدد'} />
                <InfoRow label="نوع الرخصة"   value={selectedFacility.licenseType || 'غير محدد'} />
                {selectedFacility.licenseDetails ? (
                  <InfoRow label="تفاصيل الرخصة" value={selectedFacility.licenseDetails} />
                ) : null}
                {selectedFacility.notes ? (
                  <InfoRow label="ملاحظات" value={selectedFacility.notes} />
                ) : null}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: Colors.primary ?? Colors.blue }]}
                    onPress={startInspection}
                  >
                    <FontAwesome name="clipboard" size={15} color="#fff" />
                    <Text style={styles.modalBtnText}>بدء تفتيش</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnSecondary]}
                    onPress={closeModal}
                  >
                    <Text style={[styles.modalBtnText, { color: '#34495e' }]}>إغلاق</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  addButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: Spacing.base, margin: Spacing.sm, borderRadius: 8,
    elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 4,
  },
  addButtonText: { color: '#fff', fontSize: 15, fontWeight: '700', marginLeft: Spacing.sm },

  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    marginHorizontal: Spacing.sm, marginBottom: 4,
    paddingHorizontal: Spacing.sm, borderRadius: 8,
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  searchIcon:  { marginRight: Spacing.sm },
  searchInput: { flex: 1, height: 44, fontSize: 15, textAlign: 'right', color: '#2c3e50' },

  countLabel: {
    fontSize: 12, color: '#95a5a6', textAlign: 'right',
    marginHorizontal: Spacing.base, marginBottom: 4,
  },

  list: { padding: Spacing.sm, paddingBottom: Spacing.xl },
  card: {
    backgroundColor: '#fff', padding: Spacing.base, borderRadius: 8, marginBottom: Spacing.sm,
    elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 2,
  },
  cardBadge: {
    alignSelf: 'flex-end', backgroundColor: '#eaf4fb',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginBottom: 4,
  },
  cardBadgeText: { fontSize: 11, color: Colors.blue, fontWeight: '600' },
  projectName:   { fontSize: 15, fontWeight: '700', color: '#34495e', textAlign: 'right' },
  owner:         { fontSize: 13, color: '#7f8c8d', marginTop: 3, textAlign: 'right' },
  address:       { fontSize: 12, color: '#95a5a6', marginTop: 2, textAlign: 'right' },

  empty: { alignItems: 'center', padding: 48, gap: Spacing.md },
  emptyText:       { color: '#95a5a6', fontSize: 15 },
  emptyAction:     { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, borderRadius: 8 },
  emptyActionText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modal:   { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '88%', maxHeight: '82%' },
  modalTitle:  { fontSize: 18, fontWeight: '700', color: '#2c3e50', marginBottom: 14, textAlign: 'center' },
  infoRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9, gap: Spacing.sm },
  infoLabel:   { fontSize: 13, fontWeight: '600', color: '#34495e', flex: 1 },
  infoValue:   { fontSize: 13, color: '#7f8c8d', textAlign: 'right', flex: 2 },
  modalActions:     { flexDirection: 'row', gap: Spacing.sm, marginTop: 18 },
  modalBtn:         { flex: 1, flexDirection: 'row', gap: 6, padding: Spacing.sm, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  modalBtnSecondary:{ backgroundColor: '#ecf0f1' },
  modalBtnText:     { color: '#fff', fontSize: 14, fontWeight: '600' },
});

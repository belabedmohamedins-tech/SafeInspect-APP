import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { facilities } from '../../../src/facilitiesData';
import { Facility, SavedInspection } from '../../../src/types';

const BLUE = '#1986df';

export default function InspectionHome() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'inspections' | 'facilities'>('inspections');
  const [drafts, setDrafts] = useState<SavedInspection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>(facilities);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Load drafts
const loadDrafts = async () => {
  try {
    const data = await AsyncStorage.getItem('inspections');
    console.log('Raw data from AsyncStorage:', data); // تحقق من البيانات الخام
    if (data) {
      const all: SavedInspection[] = JSON.parse(data);
      console.log('All inspections with status:', all.map(i => ({ id: i.id, status: i.status }))); // عرض جميع التفتيشات مع حالتها
      const inProgress = all.filter(ins => ins.status === 'in-progress');
      console.log('In-progress drafts:', inProgress.map(i => i.id)); // عرض معرفات المسودات فقط
      setDrafts(inProgress);
    } else {
      setDrafts([]);
    }
  } catch (error) {
    console.error('Failed to load drafts', error);
  }
};

useFocusEffect(
  useCallback(() => {
    loadDrafts();
  }, [])
);

  // Filter facilities based on search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFacilities(facilities);
    } else {
      const filtered = facilities.filter(f =>
        f.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.activity.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFacilities(filtered);
    }
  }, [searchQuery]);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const resumeDraft = (draft: SavedInspection) => {
    router.push({
      pathname: '/(tabs)/inspection/checklist',
      params: {
        draftId: draft.id,
        facilityId: draft.facilityId,
        facilityName: draft.facilityName,
        facilityAddress: draft.facilityAddress,
        items: JSON.stringify(draft.items),
      },
    });
  };

  const confirmDeleteDraft = (id: string) => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذا التفتيش الجاري؟',
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
                loadDrafts();
              }
            } catch (error) {
              console.error('Error deleting draft', error);
              Alert.alert('خطأ', 'حدث خطأ أثناء الحذف');
            }
          },
        },
      ]
    );
  };

  const handleFacilityPress = (facility: Facility) => {
    setSelectedFacility(facility);
    setModalVisible(true);
  };

  const renderDraft = ({ item }: { item: SavedInspection }) => (
    <TouchableOpacity style={styles.draftCard} onPress={() => resumeDraft(item)}>
      <View style={styles.draftHeader}>
        <Text style={styles.facilityName}>{item.facilityName}</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => resumeDraft(item)} style={{ marginRight: 10 }}>
            <FontAwesome name="refresh" size={16} color="#f39c12" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => confirmDeleteDraft(item.id)}>
            <FontAwesome name="trash" size={16} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.date}>{formatDate(item.date)}</Text>
      <Text style={styles.address}>{item.facilityAddress}</Text>
    </TouchableOpacity>
  );

  const renderFacilityItem = ({ item }: { item: Facility }) => (
    <TouchableOpacity style={styles.facilityCard} onPress={() => handleFacilityPress(item)}>
      <Text style={styles.facilityName}>{item.projectName}</Text>
      <Text style={styles.owner}>{item.ownerName}</Text>
      <Text style={styles.activity}>{item.activity}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'inspections' && styles.activeTab]}
          onPress={() => setActiveTab('inspections')}
        >
          <Text style={[styles.tabText, activeTab === 'inspections' && styles.activeTabText]}>
            التفتيشات
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'facilities' && styles.activeTab]}
          onPress={() => setActiveTab('facilities')}
        >
          <Text style={[styles.tabText, activeTab === 'facilities' && styles.activeTabText]}>
            المنشآت
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'inspections' ? (
        <View style={styles.inspectionsContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>التفتيشات الجارية</Text>
            {drafts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>لا توجد تفتيشات جارية</Text>
              </View>
            ) : (
              <FlatList
                data={drafts}
                keyExtractor={(item) => item.id}
                renderItem={renderDraft}
                contentContainerStyle={styles.list}
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>بدء تفتيش جديد</Text>
            <TouchableOpacity
              style={styles.newButton}
              onPress={() => router.push('/(tabs)/inspection/start')}
            >
              <FontAwesome name="plus-circle" size={24} color="#fff" />
              <Text style={styles.newButtonText}>تفتيش جديد</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.facilitiesContainer}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <FontAwesome name="search" size={18} color="#95a5a6" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="ابحث عن منشأة..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#95a5a6"
            />
          </View>

          <FlatList
            data={filteredFacilities}
            keyExtractor={(item) => item.id}
            renderItem={renderFacilityItem}
            contentContainerStyle={styles.facilitiesList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>لا توجد منشآت مطابقة</Text>
              </View>
            }
          />
        </View>
      )}

      {/* Facility Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              {selectedFacility && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>بطاقة المنشأة</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <FontAwesome name="close" size={24} color="#2c3e50" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalBody}>
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>اسم المنشأة:</Text>
                      <Text style={styles.modalValue}>{selectedFacility.projectName}</Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>صاحب المشروع:</Text>
                      <Text style={styles.modalValue}>{selectedFacility.ownerName}</Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>النشاط:</Text>
                      <Text style={styles.modalValue}>{selectedFacility.activity}</Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>العنوان:</Text>
                      <Text style={styles.modalValue}>{selectedFacility.address || 'غير محدد'}</Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>الرخصة:</Text>
                      <Text style={styles.modalValue}>{selectedFacility.licenseType || 'غير محدد'}</Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>تفاصيل الرخصة:</Text>
                      <Text style={styles.modalValue}>{selectedFacility.licenseDetails || 'غير محدد'}</Text>
                    </View>
                    {selectedFacility.category && (
                      <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>الفئة:</Text>
                        <Text style={styles.modalValue}>{selectedFacility.category}</Text>
                      </View>
                    )}
                    {selectedFacility.notes && (
                      <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>ملاحظات:</Text>
                        <Text style={styles.modalValue}>{selectedFacility.notes}</Text>
                      </View>
                    )}
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2c3e50',
  },
  tabText: {
    fontSize: 16,
    color: '#95a5a6',
  },
  activeTabText: {
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  inspectionsContainer: {
    flex: 1,
    padding: 16,
  },
  facilitiesContainer: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  list: {
    paddingBottom: 16,
  },
  draftCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  draftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  facilityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495e',
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  address: {
    fontSize: 13,
    color: '#95a5a6',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#95a5a6',
    fontSize: 14,
  },
  newButton: {
    backgroundColor: '#1986df',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  newButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    textAlign: 'right',
  },
  facilitiesList: {
    paddingBottom: 16,
  },
  facilityCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  owner: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  activity: {
    fontSize: 13,
    color: '#95a5a6',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalBody: {
    paddingVertical: 10,
  },
  modalRow: {
    marginBottom: 15,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
    color: '#34495e',
  },
});
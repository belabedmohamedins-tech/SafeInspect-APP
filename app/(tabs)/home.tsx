import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { facilities } from '../../src/facilitiesData';
import { AgendaItem, Facility, SavedInspection } from '../../src/types';
import { formatDateForAgenda } from '../../src/utils/dateUtils';
import { getComplianceSummary } from '../../src/utils/statusUtils';

const BLUE = '#1986df';

export default function HomeScreen() {
  const router = useRouter();
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [completedInspections, setCompletedInspections] = useState<SavedInspection[]>([]);
  const [inProgressInspections, setInProgressInspections] = useState<SavedInspection[]>([]);
  const [recentFacilities, setRecentFacilities] = useState<Facility[]>([]);
  const [fabModalVisible, setFabModalVisible] = useState(false);
  const [officeName, setOfficeName] = useState('');

  useEffect(() => {
    const loadOffice = async () => {
      const name = await AsyncStorage.getItem('officeName');
      if (name) setOfficeName(name);
    };
    loadOffice();
  }, []);

  const loadData = async () => {
    try {
      const agendaData = await AsyncStorage.getItem('agenda');
      if (agendaData) {
        const all: AgendaItem[] = JSON.parse(agendaData);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = all
          .filter(item => {
            if (item.completed) return false;
            const itemDate = new Date(item.date);
            itemDate.setHours(0, 0, 0, 0);
            return itemDate >= today;
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3);
        setAgendaItems(upcoming);
      } else {
        setAgendaItems([]);
      }

      const inspectionsData = await AsyncStorage.getItem('inspections');
      if (inspectionsData) {
        const all: SavedInspection[] = JSON.parse(inspectionsData);
        const completed = all.filter(ins => ins.status === 'completed');
        const inProgress = all.filter(ins => ins.status === 'in-progress');
        setCompletedInspections(completed.slice(-3).reverse());
        setInProgressInspections(inProgress.slice(-3).reverse());
      } else {
        setCompletedInspections([]);
        setInProgressInspections([]);
      }

      const userFacilitiesJson = await AsyncStorage.getItem('userFacilities');
      if (userFacilitiesJson) {
        const userFacilities: Facility[] = JSON.parse(userFacilitiesJson);
        setRecentFacilities(userFacilities.slice(-3).reverse());
      } else {
        setRecentFacilities([]);
      }
    } catch (error) {
      console.error('Failed to load data', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleAgendaPress = (item: AgendaItem) => {
    const facility = facilities.find(f => f.id === item.facilityId);
    if (facility) {
      router.push({
        pathname: '/(tabs)/inspection/checklist',
        params: {
          facilityId: facility.id,
          facilityName: facility.projectName,
          facilityAddress: facility.address,
          activity: facility.activity,
          agendaId: item.id,
        },
      });
    } else {
      Alert.alert('تنبيه', 'لم يتم العثور على المنشأة المرتبطة بهذه المهمة');
    }
  };

  const handleInspectionPress = (inspection: SavedInspection) => {
    router.push(`/reports/${inspection.id}`);
  };

  const handleDraftPress = (draft: SavedInspection) => {
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

  const handleFABPress = () => setFabModalVisible(true);
  const handleNewInspection = () => {
    setFabModalVisible(false);
    router.push('/(tabs)/inspection/start');
  };
  const handleNewAgenda = () => {
    setFabModalVisible(false);
    router.push('/agenda/add');
  };

  const stats = useMemo(() => {
    let totalCompleted = completedInspections.length;
    let totalDrafts = inProgressInspections.length;
    let nonCompliantFacilities = 0;
    completedInspections.forEach(ins => {
      const summary = getComplianceSummary(ins.items);
      if (summary.nonCompliant > 0) nonCompliantFacilities++;
    });
    return { totalCompleted, totalDrafts, nonCompliantFacilities };
  }, [completedInspections, inProgressInspections]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={BLUE} />

      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>{officeName || 'الهيكل البلدي لحفظ الصحة'}</Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('ar-DZ', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <FontAwesome name="clipboard" size={24} color={BLUE} />
            <Text style={styles.statNumber}>{stats.totalCompleted}</Text>
            <Text style={styles.statLabel}>تفتيش مكتمل</Text>
          </View>
          <View style={styles.statCard}>
            <FontAwesome name="pencil-square-o" size={24} color={BLUE} />
            <Text style={styles.statNumber}>{stats.totalDrafts}</Text>
            <Text style={styles.statLabel}>مسودة</Text>
          </View>
          <View style={styles.statCard}>
            <FontAwesome name="exclamation-triangle" size={24} color={BLUE} />
            <Text style={styles.statNumber}>{stats.nonCompliantFacilities}</Text>
            <Text style={styles.statLabel}>منشأة غير مطابقة</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>المهام القادمة</Text>
            <TouchableOpacity onPress={() => router.push('/agenda')}>
              <Text style={styles.viewAllLink}>عرض الكل</Text>
            </TouchableOpacity>
          </View>

          {agendaItems.length === 0 ? (
            <View style={styles.emptyCard}>
              <FontAwesome name="calendar-check-o" size={40} color="#bdc3c7" />
              <Text style={styles.emptyText}>لا توجد مهام مجدولة</Text>
              <TouchableOpacity style={styles.smallButton} onPress={handleNewAgenda}>
                <Text style={styles.smallButtonText}>+ إضافة مهمة</Text>
              </TouchableOpacity>
            </View>
          ) : (
            agendaItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.agendaCard}
                onPress={() => handleAgendaPress(item)}
              >
                <View style={styles.agendaHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.agendaFacility}>{item.facilityName}</Text>
                    <View style={styles.agendaDateRow}>
                      <FontAwesome name="calendar" size={12} color="#7f8c8d" />
                      <Text style={styles.agendaDate}>{formatDateForAgenda(item.date)}</Text>
                    </View>
                    {item.notes ? <Text style={styles.agendaNotes}>{item.notes}</Text> : null}
                  </View>
                  <FontAwesome name="chevron-left" size={16} color={BLUE} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>آخر التفتيشات المكتملة</Text>
            <TouchableOpacity onPress={() => router.push('/screens/reports')}>
              <Text style={styles.viewAllLink}>عرض الكل</Text>
            </TouchableOpacity>
          </View>

          {completedInspections.length === 0 ? (
            <View style={styles.emptyCard}>
              <FontAwesome name="file-text" size={40} color="#bdc3c7" />
              <Text style={styles.emptyText}>لا توجد تفتيشات مكتملة</Text>
              <TouchableOpacity style={styles.smallButton} onPress={handleNewInspection}>
                <Text style={styles.smallButtonText}>+ بدء تفتيش</Text>
              </TouchableOpacity>
            </View>
          ) : (
            completedInspections.map((ins) => (
              <TouchableOpacity
                key={ins.id}
                style={styles.inspectionCard}
                onPress={() => handleInspectionPress(ins)}
              >
                <View style={styles.inspectionHeader}>
                  <Text style={styles.inspectionName}>{ins.facilityName}</Text>
                  <Text style={styles.inspectionDate}>{formatDateForAgenda(ins.date)}</Text>
                </View>
                <Text style={styles.inspectionAddress}>{ins.facilityAddress}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>مسودات جارية</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/inspection')}>
              <Text style={styles.viewAllLink}>عرض الكل</Text>
            </TouchableOpacity>
          </View>

          {inProgressInspections.length === 0 ? (
            <View style={styles.emptyCard}>
              <FontAwesome name="pencil" size={40} color="#bdc3c7" />
              <Text style={styles.emptyText}>لا توجد مسودات</Text>
            </View>
          ) : (
            inProgressInspections.map((draft) => (
              <TouchableOpacity
                key={draft.id}
                style={styles.inspectionCard}
                onPress={() => handleDraftPress(draft)}
              >
                <View style={styles.inspectionHeader}>
                  <Text style={styles.inspectionName}>{draft.facilityName}</Text>
                  <Text style={styles.inspectionDate}>{formatDateForAgenda(draft.date)}</Text>
                </View>
                <Text style={styles.inspectionAddress}>{draft.facilityAddress}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {recentFacilities.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>آخر المنشآت المضافة</Text>
              <TouchableOpacity onPress={() => router.push('/screens/facilities')}>
                <Text style={styles.viewAllLink}>عرض الكل</Text>
              </TouchableOpacity>
            </View>
            {recentFacilities.map((fac) => (
              <TouchableOpacity
                key={fac.id}
                style={styles.facilityCard}
                onPress={() => router.push('/screens/facilities')}
              >
                <Text style={styles.facilityName}>{fac.projectName}</Text>
                <Text style={styles.facilityOwner}>{fac.ownerName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleFABPress}>
        <FontAwesome name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={fabModalVisible}
        onRequestClose={() => setFabModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFabModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalItem} onPress={handleNewInspection}>
              <FontAwesome name="plus-circle" size={24} color={BLUE} />
              <Text style={[styles.modalItemText, { color: BLUE }]}>بدء تفتيش جديد</Text>
            </TouchableOpacity>
            <View style={styles.modalDivider} />
            <TouchableOpacity style={styles.modalItem} onPress={handleNewAgenda}>
              <FontAwesome name="calendar-plus-o" size={24} color="#f39c12" />
              <Text style={[styles.modalItemText, { color: '#f39c12' }]}>برمجة خرجة ميدانية</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fcff' },
  header: {
    backgroundColor: '#f8f9ff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: BLUE,
  },
  welcomeText: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50', marginBottom: 2 },
  dateText: { fontSize: 12, color: '#95a5a6' },
  container: { flex: 1 },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  statCard: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', marginTop: 4 },
  statLabel: { fontSize: 12, color: '#7f8c8d', marginTop: 2 },
  section: {
    backgroundColor: '#fff',
    marginTop: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#2c3e50' },
  viewAllLink: { color: BLUE, fontSize: 14, fontWeight: '500' },
  emptyCard: {
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  emptyText: { fontSize: 14, color: '#7f8c8d', marginTop: 8 },
  smallButton: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: BLUE,
    borderRadius: 4,
  },
  smallButtonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  agendaCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  agendaHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  agendaFacility: { fontSize: 15, fontWeight: '500', color: '#2c3e50', marginBottom: 4 },
  agendaDateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  agendaDate: { fontSize: 12, color: '#7f8c8d', marginLeft: 4 },
  agendaNotes: { fontSize: 13, color: '#34495e', marginTop: 2 },
  inspectionCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  inspectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  inspectionName: { fontSize: 15, fontWeight: '500', color: '#2c3e50' },
  inspectionDate: { fontSize: 11, color: '#7f8c8d' },
  inspectionAddress: { fontSize: 12, color: '#95a5a6' },
  facilityCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  facilityName: { fontSize: 15, fontWeight: '500', color: '#2c3e50' },
  facilityOwner: { fontSize: 12, color: '#7f8c8d', marginTop: 2 },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  modalItemText: {
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 15,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#ecf0f1',
    marginVertical: 5,
  },
});
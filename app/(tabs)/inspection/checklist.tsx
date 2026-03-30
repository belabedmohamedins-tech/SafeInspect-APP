// app/(tabs)/inspection/checklist.tsx
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import { SafeAreaView } from 'react-native-safe-area-context';
import Signature from 'react-native-signature-canvas';
import InspectionItem from '../../../components/InspectionItem';
import { criteriaByActivity } from '../../../src/criteriaData';
import {
  AgendaItem,
  ComplianceStatus,
  InspectionItem as InspectionItemType,
  SavedInspection,
} from '../../../src/types';
import { getEvaluatedCount, groupByAxis } from '../../../src/utils/inspectionUtils';
import { computeScoreAndGrade } from '../../../src/utils/scoringUtils';
import { computeStats } from '../../../src/utils/statsUtils';

const BLUE = '#1986df';

export default function ChecklistScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();

  const draftId = params.draftId as string | undefined;
  const facilityId = params.facilityId as string;
  const facilityName = params.facilityName as string;
  const facilityAddress = params.facilityAddress as string;
  const activity = params.activity as string | undefined;
  const agendaId = params.agendaId as string | undefined;

  // New preliminary fields
  const cause = params.cause as string;
  const reference = params.reference as string;
  const committeeMembers = params.committeeMembers ? JSON.parse(params.committeeMembers as string) : [];
  const writer = params.writer as string;
  const lat = params.lat ? parseFloat(params.lat as string) : undefined;
  const lng = params.lng ? parseFloat(params.lng as string) : undefined;

  const [data, setData] = useState<InspectionItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inspectionId, setInspectionId] = useState(draftId || '');
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({});
  const [isFinishing, setIsFinishing] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [signature, setSignature] = useState<string | undefined>();

  // Update stats cache after saving
  const updateStatsCache = async () => {
    try {
      const data = await AsyncStorage.getItem('inspections');
      if (data) {
        const all: SavedInspection[] = JSON.parse(data);
        const completed = all.filter(ins => ins.status === 'completed');
        const stats = computeStats(completed);
        await AsyncStorage.setItem('statsCache', JSON.stringify(stats));
      }
    } catch (error) {
      console.error('Failed to update stats cache', error);
    }
  };

  const saveInspection = useCallback(async (status: 'completed' | 'in-progress') => {
    try {
      const officeName = await AsyncStorage.getItem('officeName') || '';
      const inspection: SavedInspection = {
        id: inspectionId,
        facilityId,
        facilityName,
        facilityAddress,
        date: new Date().toISOString(),
        inspectorName: writer || 'المفتش (اسم افتراضي)',
        items: data,
        status,
        officeName,
        inspectionCause: cause,
        referenceDocument: reference,
        committeeMembers,
        coordinates: lat && lng ? { latitude: lat, longitude: lng } : undefined,
      };

      if (status === 'completed') {
        const result = computeScoreAndGrade(data);
        if (result.score !== undefined) {
          inspection.score = result.score;
          inspection.grade = result.grade;
        }
        if (signature) {
          inspection.signature = signature;
        }
      }

      const existing = await AsyncStorage.getItem('inspections');
      let inspections: SavedInspection[] = existing ? JSON.parse(existing) : [];

      inspections = inspections.filter((ins) => ins.id !== inspectionId);
      inspections.push(inspection);

      await AsyncStorage.setItem('inspections', JSON.stringify(inspections));
      return true;
    } catch (error) {
      console.error('Error saving inspection:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ');
      return false;
    }
  }, [inspectionId, facilityId, facilityName, facilityAddress, data, signature, cause, reference, committeeMembers, writer, lat, lng]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (draftId && params.items) {
        const items = JSON.parse(params.items as string);
        setData(items);
        setInspectionId(draftId);
      } else {
        const criteria =
          activity && criteriaByActivity[activity]
            ? criteriaByActivity[activity]
            : criteriaByActivity.default;
        const initial = criteria.map((item) => ({
          ...item,
          complianceStatus: 'not-evaluated' as ComplianceStatus,
          comment: '',
          photoUri: undefined,
        }));
        setData(initial);
        const newId = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
        setInspectionId(newId);
      }
      setIsLoading(false);
    };
    loadData();
  }, [draftId, params.items, activity]);

  // Auto-save as draft when leaving, unless we are finishing
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', async (e) => {
      if (isFinishing) {
        return;
      }
      e.preventDefault();
      await saveInspection('in-progress');
      navigation.dispatch(e.data.action);
    });
    return unsubscribe;
  }, [navigation, data, isFinishing, saveInspection]);

  // Handlers
  const handleStatusChange = useCallback((id: string, status: ComplianceStatus) => {
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, complianceStatus: status } : item))
    );
  }, []);

  const handleCommentChange = useCallback((id: string, comment: string) => {
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, comment } : item))
    );
  }, []);

  const handlePhotoTake = useCallback((id: string, uri: string) => {
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, photoUri: uri } : item))
    );
  }, []);

  const handleSignature = useCallback((sig: string) => {
    setSignature(sig);
    setShowSignature(false);
  }, []);

  const handleFinish = useCallback(async () => {
    setIsFinishing(true);
    const saved = await saveInspection('completed');
    if (saved && agendaId) {
      try {
        const agendaData = await AsyncStorage.getItem('agenda');
        if (agendaData) {
          const agenda: AgendaItem[] = JSON.parse(agendaData);
          const updatedAgenda = agenda.map(item =>
            item.id === agendaId ? { ...item, completed: true } : item
          );
          await AsyncStorage.setItem('agenda', JSON.stringify(updatedAgenda));
        }
      } catch (error) {
        console.error('Error updating agenda item', error);
      }
      Alert.alert('نجاح', 'تم حفظ التفتيش وتحديث المهمة كمكتملة');
      await updateStatsCache();
      router.replace('/(tabs)/inspection');
    } else if (saved) {
      Alert.alert('نجاح', 'تم حفظ التفتيش بنجاح');
      await updateStatsCache();
      router.replace('/(tabs)/inspection');
    }
  }, [saveInspection, agendaId, router]);

  const handleCancel = useCallback(() => {
    Alert.alert(
      'تأكيد الإلغاء',
      'هل أنت متأكد من إلغاء التفتيش؟ سيتم فقدان أي تغييرات غير محفوظة.',
      [
        { text: 'استمرار التفتيش', style: 'cancel' },
        {
          text: 'إلغاء التفتيش',
          style: 'destructive',
          onPress: () => {
            router.replace('/(tabs)/inspection');
          },
        },
      ]
    );
  }, [router]);

  // Memoized values
  const sections = useMemo(() => groupByAxis(data), [data]);
  const totalItems = useMemo(() => data.length, [data]);
  const evaluatedItems = useMemo(() => getEvaluatedCount(data), [data]);
  const progressPercent = useMemo(
    () => (totalItems > 0 ? (evaluatedItems / totalItems) * 100 : 0),
    [totalItems, evaluatedItems]
  );

  const getSectionProgress = useCallback((items: InspectionItemType[]) => {
    const total = items.length;
    const evaluated = items.filter(
      item => item.complianceStatus !== 'not-evaluated'
    ).length;
    return `${evaluated}/${total}`;
  }, []);

  const toggleSection = useCallback((title: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  }, []);

  // Initialize collapsed sections: only add new sections, preserve existing state
  useEffect(() => {
    const currentTitles = new Set(Object.keys(collapsedSections));
    const newTitles = sections.map(s => s.title);
    const added = newTitles.filter(title => !currentTitles.has(title));
    if (added.length > 0) {
      setCollapsedSections(prev => {
        const updated = { ...prev };
        added.forEach(title => { updated[title] = true; });
        return updated;
      });
    }
  }, [sections, collapsedSections]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>جاري التحميل...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.header, { backgroundColor: BLUE }]}>
        <Text style={styles.headerTitle}>
          {facilityName ? `تفتيش: ${facilityName}` : 'التفتيش البيئي'}
        </Text>
        {facilityAddress ? <Text style={styles.headerSubtitle}>{facilityAddress}</Text> : null}
      </View>

      {/* Overall progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {evaluatedItems}/{totalItems} ({progressPercent.toFixed(1)}%)
        </Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item, section }) => (
          <Collapsible collapsed={collapsedSections[section.title] ?? true}>
            <InspectionItem
              item={item}
              onStatusChange={handleStatusChange}
              onCommentChange={handleCommentChange}
              onPhotoTake={handlePhotoTake}
            />
          </Collapsible>
        )}
        renderSectionHeader={({ section: { title, data } }) => (
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection(title)}
          >
            <View style={styles.sectionHeaderLeft}>
              <FontAwesome
                name={collapsedSections[title] ? 'chevron-left' : 'chevron-down'}
                size={16}
                color="#2c3e50"
              />
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            <Text style={styles.sectionProgress}>{getSectionProgress(data)}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        ListFooterComponent={
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.signatureButton} onPress={() => setShowSignature(true)}>
              <FontAwesome name="pencil" size={18} color="#fff" />
              <Text style={styles.signatureButtonText}>توقيع</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
              <Text style={styles.finishButtonText}>إنهاء وحفظ التفتيش</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Signature Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSignature}
        onRequestClose={() => setShowSignature(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.signatureModal}>
            <Text style={styles.signatureTitle}>التوقيع</Text>
            <Signature
              onOK={handleSignature}
              onEmpty={() => {}}
              descriptionText="وقع هنا"
              clearText="مسح"
              confirmText="حفظ"
              webStyle={`
                .m-signature-pad {
                  box-shadow: none;
                  border: 1px solid #bdc3c7;
                  border-radius: 8px;
                }
                .m-signature-pad--body {
                  border: none;
                }
                .m-signature-pad--footer {
                  display: none;
                }
                .m-signature-pad--body canvas {
                  width: 100%;
                  height: 100%;
                }
              `}
            />
            <TouchableOpacity style={styles.signatureClose} onPress={() => setShowSignature(false)}>
              <Text style={styles.signatureCloseText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: '#bdc3c7' },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    marginRight: 10,
  },
  progressFill: {
    height: 8,
    backgroundColor: '#27ae60',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  list: { paddingBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#d0d7dd',
    borderBottomWidth: 1,
    borderBottomColor: '#d0d7dd',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8,
  },
  sectionProgress: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginVertical: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signatureButton: {
    flex: 1,
    backgroundColor: '#f39c12',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signatureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  finishButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  finishButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  signatureModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 16,
  },
  signatureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#2c3e50',
  },
  signatureClose: {
    backgroundColor: '#95a5a6',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  signatureCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
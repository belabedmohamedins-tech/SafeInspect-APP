// src/hooks/useChecklistData.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { criteriaByActivity } from '../criteriaData';
import {
    AgendaItem,
    ComplianceStatus,
    InspectionItem,
    SavedInspection,
} from '../types';
import { getEvaluatedCount, groupByAxis } from '../utils/inspectionUtils';
import { computeScoreAndGrade } from '../utils/scoringUtils';
import { computeStats } from '../utils/statsUtils';

interface ChecklistParams {
  draftId?: string;
  facilityId: string;
  facilityName: string;
  facilityAddress: string;
  activity?: string;
  agendaId?: string;
  cause: string;
  reference: string;
  committeeMembers: string[];
  writer: string;
  lat?: number;
  lng?: number;
}

export function useChecklistData(params: ChecklistParams, signature?: string) {
  const router = useRouter();
  const navigation = useNavigation();

  const [data, setData] = useState<InspectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inspectionId, setInspectionId] = useState(params.draftId || '');
  const [isFinishing, setIsFinishing] = useState(false);

  // ─── Load ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (params.draftId) {
        // Phase 4 fix: load from storage by ID, not from URL params
        const raw = await AsyncStorage.getItem('inspections');
        const all: SavedInspection[] = raw ? JSON.parse(raw) : [];
        const draft = all.find(i => i.id === params.draftId);
        if (draft) {
          setData(draft.items);
          setInspectionId(draft.id);
        }
      } else {
        const criteria =
          params.activity && criteriaByActivity[params.activity]
            ? criteriaByActivity[params.activity]
            : criteriaByActivity.default;
        const initial = criteria.map(item => ({
          ...item,
          complianceStatus: 'not-evaluated' as ComplianceStatus,
          comment: '',
          photoUri: undefined,
        }));
        setData(initial);
        // Phase 1 fix: use crypto.randomUUID()
        setInspectionId(crypto.randomUUID());
      }
      setIsLoading(false);
    };
    load();
  }, []);  // intentionally empty — runs once on mount

  // ─── Save ────────────────────────────────────────────────────────────────
  const saveInspection = useCallback(
    async (status: 'completed' | 'in-progress') => {
      try {
        const officeName = await AsyncStorage.getItem('officeName') || '';
        const inspection: SavedInspection = {
          id: inspectionId,
          facilityId: params.facilityId,
          facilityName: params.facilityName,
          facilityAddress: params.facilityAddress,
          date: new Date().toISOString(),
          inspectorName: params.writer || 'المفتش (اسم افتراضي)',
          items: data,
          status,
          officeName,
          inspectionCause: params.cause,
          referenceDocument: params.reference,
          committeeMembers: params.committeeMembers,
          coordinates:
            params.lat && params.lng
              ? { latitude: params.lat, longitude: params.lng }
              : undefined,
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
        inspections = inspections.filter(i => i.id !== inspectionId);
        inspections.push(inspection);
        await AsyncStorage.setItem('inspections', JSON.stringify(inspections));
        return true;
      } catch (error) {
        console.error('Error saving inspection:', error);
        Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ');
        return false;
      }
    },
    [inspectionId, data, signature, params]
  );

  // ─── Stats cache ─────────────────────────────────────────────────────────
  const updateStatsCache = useCallback(async () => {
    const raw = await AsyncStorage.getItem('inspections');
    if (raw) {
      const all: SavedInspection[] = JSON.parse(raw);
      const completed = all.filter(i => i.status === 'completed');
      const stats = computeStats(completed);
      await AsyncStorage.setItem('statsCache', JSON.stringify(stats));
    }
  }, []);

  // ─── Auto-save on back ───────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', async (e: any) => {
      if (isFinishing) return;
      e.preventDefault();
      await saveInspection('in-progress');
      navigation.dispatch(e.data.action);
    });
    return unsubscribe;
  }, [navigation, isFinishing, saveInspection]);

  // ─── Item handlers ───────────────────────────────────────────────────────
  const handleStatusChange = useCallback((id: string, status: ComplianceStatus) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, complianceStatus: status } : item));
  }, []);

  const handleCommentChange = useCallback((id: string, comment: string) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, comment } : item));
  }, []);

  const handlePhotoTake = useCallback((id: string, uri: string) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, photoUri: uri } : item));
  }, []);

  // ─── Finish ──────────────────────────────────────────────────────────────
  const handleFinish = useCallback(async () => {
    setIsFinishing(true);
    const saved = await saveInspection('completed');
    if (!saved) return;

    if (params.agendaId) {
      try {
        const agendaData = await AsyncStorage.getItem('agenda');
        if (agendaData) {
          const agenda: AgendaItem[] = JSON.parse(agendaData);
          const updated = agenda.map(item =>
            item.id === params.agendaId ? { ...item, completed: true } : item
          );
          await AsyncStorage.setItem('agenda', JSON.stringify(updated));
        }
      } catch (e) {
        console.error('Error updating agenda:', e);
      }
      Alert.alert('نجاح', 'تم حفظ التفتيش وتحديث المهمة كمكتملة');
    } else {
      Alert.alert('نجاح', 'تم حفظ التفتيش بنجاح');
    }

    await updateStatsCache();
    router.replace('/(tabs)/inspection');
  }, [saveInspection, params.agendaId, router, updateStatsCache]);

  // ─── Derived values ──────────────────────────────────────────────────────
  const sections = useMemo(() => groupByAxis(data), [data]);
  const totalItems = useMemo(() => data.length, [data]);
  const evaluatedItems = useMemo(() => getEvaluatedCount(data), [data]);
  const progressPercent = useMemo(
    () => (totalItems > 0 ? (evaluatedItems / totalItems) * 100 : 0),
    [totalItems, evaluatedItems]
  );

  return {
    data,
    isLoading,
    sections,
    totalItems,
    evaluatedItems,
    progressPercent,
    handleStatusChange,
    handleCommentChange,
    handlePhotoTake,
    handleFinish,
  };
}
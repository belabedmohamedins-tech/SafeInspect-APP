// src/hooks/useChecklistData.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

  // Stable refs for params that change every render — prevents saveInspection
  // from being recreated on every render and the beforeRemove listener from
  // re-subscribing on every render.
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const signatureRef = useRef(signature);
  signatureRef.current = signature;

  // ─── Load ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const p = paramsRef.current;
      if (p.draftId) {
        const raw = await AsyncStorage.getItem('inspections');
        const all: SavedInspection[] = raw ? JSON.parse(raw) : [];
        const draft = all.find(i => i.id === p.draftId);
        if (draft) {
          setData(draft.items);
          setInspectionId(draft.id);
        }
      } else {
        const criteria =
          p.activity && criteriaByActivity[p.activity]
            ? criteriaByActivity[p.activity]
            : criteriaByActivity.default;
        const initial = criteria.map(item => ({
          ...item,
          complianceStatus: 'not-evaluated' as ComplianceStatus,
          comment: '',
          photoUri: undefined,
        }));
        setData(initial);
        setInspectionId(Crypto.randomUUID());
      }
      setIsLoading(false);
    };
    load();
  }, []); // intentionally empty — runs once on mount

  // ─── Save ─────────────────────────────────────────────────────────────────────────
  const saveInspection = useCallback(
    async (status: 'completed' | 'in-progress') => {
      const p = paramsRef.current;
      const sig = signatureRef.current;
      try {
        const officeName = (await AsyncStorage.getItem('officeName')) || '';
        const inspection: SavedInspection = {
          id: inspectionId,
          facilityId: p.facilityId,
          facilityName: p.facilityName,
          facilityAddress: p.facilityAddress,
          date: new Date().toISOString(),
          inspectorName: p.writer || 'المفتش (اسم افتراضي)',
          items: data,
          status,
          officeName,
          inspectionCause: p.cause,
          referenceDocument: p.reference,
          committeeMembers: p.committeeMembers,
          coordinates:
            p.lat && p.lng
              ? { latitude: p.lat, longitude: p.lng }
              : undefined,
        };

        if (status === 'completed') {
          const result = computeScoreAndGrade(data);
          if (result.score !== undefined) {
            inspection.score = result.score;
            inspection.grade = result.grade;
          }
          if (sig) {
            inspection.signature = sig;
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
    [inspectionId, data] // params and signature read via refs — stable deps
  );

  // ─── Stats cache ────────────────────────────────────────────────────────────────
  const updateStatsCache = useCallback(async () => {
    const raw = await AsyncStorage.getItem('inspections');
    if (raw) {
      const all: SavedInspection[] = JSON.parse(raw);
      const completed = all.filter(i => i.status === 'completed');
      const stats = computeStats(completed);
      await AsyncStorage.setItem('statsCache', JSON.stringify(stats));
    }
  }, []);

  // ─── Auto-save on back ───────────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', async (e: any) => {
      if (isFinishing) return;
      e.preventDefault();
      await saveInspection('in-progress');
      navigation.dispatch(e.data.action);
    });
    return unsubscribe;
  }, [navigation, isFinishing, saveInspection]);

  // ─── Item handlers ───────────────────────────────────────────────────────────────
  const handleStatusChange = useCallback((id: string, status: ComplianceStatus) => {
    setData(prev =>
      prev.map(item => (item.id === id ? { ...item, complianceStatus: status } : item))
    );
  }, []);

  const handleCommentChange = useCallback((id: string, comment: string) => {
    setData(prev =>
      prev.map(item => (item.id === id ? { ...item, comment } : item))
    );
  }, []);

  const handlePhotoTake = useCallback((id: string, uri: string) => {
    setData(prev =>
      prev.map(item => (item.id === id ? { ...item, photoUri: uri } : item))
    );
  }, []);

  // ─── Finish ──────────────────────────────────────────────────────────────────────
  const handleFinish = useCallback(async () => {
    setIsFinishing(true);
    const saved = await saveInspection('completed');
    if (!saved) return;

    const agendaId = paramsRef.current.agendaId;
    if (agendaId) {
      try {
        const agendaData = await AsyncStorage.getItem('agenda');
        if (agendaData) {
          const agenda: AgendaItem[] = JSON.parse(agendaData);
          const updated = agenda.map(item =>
            item.id === agendaId ? { ...item, completed: true } : item
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
  }, [saveInspection, router, updateStatsCache]);

  // ─── Derived values ──────────────────────────────────────────────────────────────
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

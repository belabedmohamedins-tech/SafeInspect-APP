// src/hooks/useChecklistData.ts
import * as Crypto from 'expo-crypto';
import { useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { criteriaByActivity } from '../criteriaData';
import { AgendaRepository } from '../repositories/AgendaRepository';
import { InspectionRepository } from '../repositories/InspectionRepository';
import { SettingsRepository } from '../repositories/SettingsRepository';
import {
  AgendaItem,
  ComplianceStatus,
  InspectionItem,
  SavedInspection,
} from '../types';
import { getEvaluatedCount, groupByAxis } from '../utils/inspectionUtils';
import {
  computeScoreAndGrade,
  getHighSeverityItemsMissingPhoto,
} from '../utils/scoringUtils';

/** Minimum fraction of applicable items that must be evaluated before finish. */
const COMPLETION_GATE = 0.85;

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

  const paramsRef = useRef(params);
  paramsRef.current = params;
  const signatureRef = useRef(signature);
  signatureRef.current = signature;

  // ─── Load ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const p = paramsRef.current;
      if (p.draftId) {
        const draft = await InspectionRepository.getById(p.draftId);
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
          photos: [],
        }));
        setData(initial);
        setInspectionId(Crypto.randomUUID());
      }
      setIsLoading(false);
    };
    load();
  }, []); // intentionally empty — runs once on mount

  // ─── Save ──────────────────────────────────────────────────────────────
  const saveInspection = useCallback(
    async (status: 'completed' | 'in-progress') => {
      const p = paramsRef.current;
      const sig = signatureRef.current;
      try {
        // fixed: was SettingsRepository.get() with no key — always returned
        // undefined, crashing on settings.inspectorName / settings.officeName
        // and silently preventing the inspection from being saved.
        const settings = await SettingsRepository.getAll();
        const s = settings ?? {};

        const inspection: SavedInspection = {
          id: inspectionId,
          facilityId: p.facilityId,
          facilityName: p.facilityName,
          facilityAddress: p.facilityAddress,
          date: new Date().toISOString(),
          inspectorName: p.writer || String(s.inspectorName ?? '') || 'المفتش',
          items: data,
          status,
          officeName: String(s.officeName ?? ''),
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
          if (sig) inspection.signature = sig;
        }

        await InspectionRepository.save(inspection);
        return true;
      } catch (error) {
        console.error('Error saving inspection:', error);
        Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ');
        return false;
      }
    },
    [inspectionId, data]
  );

  // ─── Auto-save on back ─────────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', async (e: any) => {
      if (isFinishing) return;
      e.preventDefault();
      await saveInspection('in-progress');
      navigation.dispatch(e.data.action);
    });
    return unsubscribe;
  }, [navigation, isFinishing, saveInspection]);

  // ─── Item handlers ───────────────────────────────────────────────────────────
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
      prev.map(item => {
        if (item.id !== id) return item;
        const existingPhotos = item.photos ?? (item.photoUri ? [item.photoUri] : []);
        return {
          ...item,
          photoUri: item.photoUri ?? uri,
          photos: [...existingPhotos, uri],
        };
      })
    );
  }, []);

  // ─── Finish (with validation gates) ──────────────────────────────────────────────
  const handleFinish = useCallback(async () => {
    // Gate 1: 85% completion requirement
    const applicable = data.filter(item => item.complianceStatus !== 'na');
    const evaluated  = applicable.filter(
      item => item.complianceStatus !== 'not-evaluated'
    );
    const completionRate =
      applicable.length > 0 ? evaluated.length / applicable.length : 1;

    if (completionRate < COMPLETION_GATE) {
      const remaining = applicable.length - evaluated.length;
      Alert.alert(
        'لم يكتمل التفتيش',
        `يجب تقييم 85٪ على الأقل من البنود قبل الإنهاء.\nتبقى ${remaining} بند غير مقيّم.`,
        [{ text: 'حسناً' }]
      );
      return;
    }

    // Gate 2: High-severity non-compliant items must have photo
    const missingPhotos = getHighSeverityItemsMissingPhoto(data);
    if (missingPhotos.length > 0) {
      const names = missingPhotos.map(item => `• ${item.criteria}`).join('\n');
      Alert.alert(
        'صور مطلوبة',
        `البنود الحرجة التالية تحتاج صورة دليل قبل الإنهاء:\n\n${names}`,
        [{ text: 'حسناً' }]
      );
      return;
    }

    setIsFinishing(true);
    const saved = await saveInspection('completed');
    if (!saved) {
      setIsFinishing(false);
      return;
    }

    const agendaId = paramsRef.current.agendaId;
    if (agendaId) {
      try {
        await AgendaRepository.updateInspectionLink(agendaId, inspectionId);
      } catch (e) {
        console.error('Error updating agenda:', e);
      }
      Alert.alert('نجاح', 'تم حفظ التفتيش وتحديث المهمة كمكتملة');
    } else {
      Alert.alert('نجاح', 'تم حفظ التفتيش بنجاح');
    }

    router.replace('/(tabs)/inspection');
  }, [data, saveInspection, inspectionId, router]);

  // ─── Derived values ───────────────────────────────────────────────────────────
  const sections       = useMemo(() => groupByAxis(data), [data]);
  const totalItems     = useMemo(() => data.length, [data]);
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

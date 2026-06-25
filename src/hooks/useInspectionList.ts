// src/hooks/useInspectionList.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { SavedInspection } from '../types';
import { computeStats } from '../utils/statsUtils';

export function useInspectionList() {
  const [inspections, setInspections] = useState<SavedInspection[]>([]);
  const [searchQuery, setSearchQuery]   = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'completed' | 'in-progress'>('all');

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem('inspections');
      setInspections(raw ? JSON.parse(raw) : []);
    } catch (e) {
      console.error('useInspectionList load error:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const run = async () => {
        try {
          const raw = await AsyncStorage.getItem('inspections');
          if (isActive) {
            setInspections(raw ? JSON.parse(raw) : []);
          }
        } catch (e) {
          console.error('useInspectionList load error:', e);
        }
      };

      run();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const deleteInspection = useCallback(async (id: string) => {
    Alert.alert('تأكيد الحذف', 'هل أنت متأكد من حذف هذا التفتيش؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive',
        onPress: async () => {
          try {
            const raw = await AsyncStorage.getItem('inspections');
            const all: SavedInspection[] = raw ? JSON.parse(raw) : [];
            const updated = all.filter(i => i.id !== id);
            await AsyncStorage.setItem('inspections', JSON.stringify(updated));

            // Keep statsCache consistent — fixes medium-severity bug from Phase 1
            const completed = updated.filter(i => i.status === 'completed');
            await AsyncStorage.setItem('statsCache', JSON.stringify(computeStats(completed)));

            setInspections(updated);
          } catch (e) {
            console.error('Delete error:', e);
          }
        },
      },
    ]);
  }, []);

  const filtered = useMemo(() => {
    return inspections
      .filter(i => activeFilter === 'all' || i.status === activeFilter)
      .filter(i => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          i.facilityName?.toLowerCase().includes(q) ||
          i.facilityAddress?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [inspections, activeFilter, searchQuery]);

  return {
    filtered,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    deleteInspection,
    totalCount: inspections.length,
  };
}
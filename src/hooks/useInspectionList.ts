// src/hooks/useInspectionList.ts
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { InspectionRepository } from '../repositories/InspectionRepository';
import { SavedInspection } from '../types';

export function useInspectionList() {
  const [inspections, setInspections] = useState<SavedInspection[]>([]);
  const [searchQuery, setSearchQuery]   = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'completed' | 'in-progress'>('all');

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const run = async () => {
        try {
          const all = await InspectionRepository.getAll();
          if (isActive) setInspections(all);
        } catch (e) {
          console.error('useInspectionList load error:', e);
        }
      };
      run();
      return () => { isActive = false; };
    }, [])
  );

  const deleteInspection = useCallback(async (id: string) => {
    Alert.alert('تأكيد الحذف', 'هل أنت متأكد من حذف هذا التفتيش؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive',
        onPress: async () => {
          try {
            await InspectionRepository.delete(id);
            setInspections(prev => prev.filter(i => i.id !== id));
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
    filtered, searchQuery, setSearchQuery,
    activeFilter, setActiveFilter, deleteInspection,
    totalCount: inspections.length,
  };
}

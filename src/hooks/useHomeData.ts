// src/hooks/useHomeData.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { facilities } from '../facilitiesData';
import { AgendaItem, Facility, SavedInspection } from '../types';
import { getComplianceSummary } from '../utils/statusUtils';

export function useHomeData() {
  const [agendaItems, setAgendaItems]                   = useState<AgendaItem[]>([]);
  const [completedInspections, setCompletedInspections] = useState<SavedInspection[]>([]);
  const [inProgressInspections, setInProgress]          = useState<SavedInspection[]>([]);
  const [recentFacilities, setRecentFacilities]         = useState<Facility[]>([]);
  const [officeName, setOfficeName]                     = useState('');

  const load = useCallback(async () => {
    try {
      // Office name
      const name = await AsyncStorage.getItem('officeName');
      if (name) setOfficeName(name);

      // Agenda — upcoming, non-completed, max 3
      const agendaRaw = await AsyncStorage.getItem('agenda');
      if (agendaRaw) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = (JSON.parse(agendaRaw) as AgendaItem[])
          .filter(item => {
            if (item.completed) return false;
            const d = new Date(item.date);
            d.setHours(0, 0, 0, 0);
            return d >= today;
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3);
        setAgendaItems(upcoming);
      } else {
        setAgendaItems([]);
      }

      // Inspections
      const inspRaw = await AsyncStorage.getItem('inspections');
      if (inspRaw) {
        const all = JSON.parse(inspRaw) as SavedInspection[];
        setCompletedInspections(all.filter(i => i.status === 'completed').slice(-3).reverse());
        setInProgress(all.filter(i => i.status === 'in-progress').slice(-3).reverse());
      } else {
        setCompletedInspections([]);
        setInProgress([]);
      }

      // User-added facilities
      const facRaw = await AsyncStorage.getItem('userFacilities');
      if (facRaw) {
        setRecentFacilities((JSON.parse(facRaw) as Facility[]).slice(-3).reverse());
      } else {
        setRecentFacilities([]);
      }
    } catch (e) {
      console.error('useHomeData load error:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const run = async () => {
        try {
          // Office name
          const name = await AsyncStorage.getItem('officeName');
          if (name && isActive) setOfficeName(name);

          // Agenda — upcoming, non-completed, max 3
          const agendaRaw = await AsyncStorage.getItem('agenda');
          if (agendaRaw && isActive) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const upcoming = (JSON.parse(agendaRaw) as AgendaItem[])
              .filter(item => {
                if (item.completed) return false;
                const d = new Date(item.date);
                d.setHours(0, 0, 0, 0);
                return d >= today;
              })
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 3);
            setAgendaItems(upcoming);
          } else if (isActive) {
            setAgendaItems([]);
          }

          // Inspections
          const inspRaw = await AsyncStorage.getItem('inspections');
          if (inspRaw && isActive) {
            const all = JSON.parse(inspRaw) as SavedInspection[];
            setCompletedInspections(all.filter(i => i.status === 'completed').slice(-3).reverse());
            setInProgress(all.filter(i => i.status === 'in-progress').slice(-3).reverse());
          } else if (isActive) {
            setCompletedInspections([]);
            setInProgress([]);
          }

          // User-added facilities
          const facRaw = await AsyncStorage.getItem('userFacilities');
          if (facRaw && isActive) {
            setRecentFacilities((JSON.parse(facRaw) as Facility[]).slice(-3).reverse());
          } else if (isActive) {
            setRecentFacilities([]);
          }
        } catch (e) {
          console.error('useHomeData load error:', e);
        }
      };

      run();

      return () => {
        isActive = false;
      };
    }, [])
  );

  // Derived stats
  const stats = useMemo(() => {
    let nonCompliant = 0;
    completedInspections.forEach(ins => {
      if (getComplianceSummary(ins.items).nonCompliant > 0) nonCompliant++;
    });
    return {
      totalCompleted: completedInspections.length,
      totalDrafts:    inProgressInspections.length,
      nonCompliantFacilities: nonCompliant,
    };
  }, [completedInspections, inProgressInspections]);

  // Facility lookup helper used by handleAgendaPress in screen
  const getFacilityForAgenda = useCallback(
    (item: AgendaItem) => facilities.find(f => f.id === item.facilityId),
    []
  );

  return {
    officeName,
    agendaItems,
    completedInspections,
    inProgressInspections,
    recentFacilities,
    stats,
    getFacilityForAgenda,
  };
}
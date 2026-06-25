// src/hooks/useHomeData.ts
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { getUserFacilities } from '../facilitiesService';
import { facilities } from '../facilitiesData';
import { AgendaRepository } from '../repositories/AgendaRepository';
import { InspectionRepository } from '../repositories/InspectionRepository';
import { SettingsRepository } from '../repositories/SettingsRepository';
import { AgendaItem, Facility, SavedInspection } from '../types';
import { getComplianceSummary } from '../utils/statusUtils';

export function useHomeData() {
  const [agendaItems, setAgendaItems]                   = useState<AgendaItem[]>([]);
  const [completedInspections, setCompletedInspections] = useState<SavedInspection[]>([]);
  const [inProgressInspections, setInProgress]          = useState<SavedInspection[]>([]);
  const [recentFacilities, setRecentFacilities]         = useState<Facility[]>([]);
  const [officeName, setOfficeName]                     = useState('');

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const run = async () => {
        try {
          // Settings
          const { officeName: name } = await SettingsRepository.get();
          if (isActive) setOfficeName(name);

          // Agenda — upcoming, non-completed, max 3
          const allAgenda = await AgendaRepository.getAll();
          if (isActive) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const upcoming = allAgenda
              .filter(item => {
                // Use status field as the single source of truth
                if (item.status !== 'pending') return false;
                const d = new Date(item.date);
                d.setHours(0, 0, 0, 0);
                return d >= today;
              })
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 3);
            setAgendaItems(upcoming);
          }

          // Inspections
          const completed = await InspectionRepository.getCompleted();
          const drafts    = await InspectionRepository.getDrafts();
          if (isActive) {
            setCompletedInspections(completed.slice(-3).reverse());
            setInProgress(drafts.slice(-3).reverse());
          }

          // User-added facilities (most recent 3)
          const userFacilities = await getUserFacilities();
          if (isActive) {
            setRecentFacilities(userFacilities.slice(-3).reverse());
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

// src/hooks/useHomeData.ts
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
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
          const settings = await SettingsRepository.get();
          if (isActive) setOfficeName(settings.officeName || '');

          const allAgenda = await AgendaRepository.getAll();
          if (isActive) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const upcoming = allAgenda
              .filter(item => {
                if (item.completed) return false;
                const d = new Date(item.date);
                d.setHours(0, 0, 0, 0);
                return d >= today;
              })
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 3);
            setAgendaItems(upcoming);
          }

          const all = await InspectionRepository.getAll();
          if (isActive) {
            setCompletedInspections(all.filter(i => i.status === 'completed').slice(-3).reverse());
            setInProgress(all.filter(i => i.status === 'in-progress').slice(-3).reverse());
          }

          const facilities = await SettingsRepository.getUserFacilities();
          if (isActive) {
            setRecentFacilities((facilities as Facility[]).slice(-3).reverse());
          }
        } catch (e) {
          console.error('useHomeData load error:', e);
          if (isActive) {
            setAgendaItems([]);
            setCompletedInspections([]);
            setInProgress([]);
            setRecentFacilities([]);
          }
        }
      };
      run();
      return () => { isActive = false; };
    }, [])
  );

  const stats = useMemo(() => {
    let nonCompliant = 0;
    completedInspections.forEach(ins => {
      if (getComplianceSummary(ins.items).nonCompliant > 0) nonCompliant++;
    });
    return {
      totalCompleted: completedInspections.length,
      totalDrafts: inProgressInspections.length,
      nonCompliantFacilities: nonCompliant,
    };
  }, [completedInspections, inProgressInspections]);

  const getFacilityForAgenda = useCallback(
    (item: AgendaItem) =>
      recentFacilities.find((f: Facility) => f.id === item.facilityId),
    [recentFacilities]
  );

  return {
    officeName, agendaItems, completedInspections,
    inProgressInspections, recentFacilities, stats, getFacilityForAgenda,
  };
}

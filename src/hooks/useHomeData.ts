// src/hooks/useHomeData.ts
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { facilities as hardcodedFacilities } from '../facilitiesData';
import { AgendaRepository } from '../repositories/AgendaRepository';
import { InspectionRepository } from '../repositories/InspectionRepository';
import { SettingsRepository } from '../repositories/SettingsRepository';
import { getUserFacilities } from '../facilitiesService';
import { AgendaItem, Facility, SavedInspection } from '../types';
import { getComplianceSummary } from '../utils/statusUtils';

export function useHomeData() {
  const [agendaItems, setAgendaItems]                   = useState<AgendaItem[]>([]);
  const [completedInspections, setCompletedInspections] = useState<SavedInspection[]>([]);
  const [inProgressInspections, setInProgress]          = useState<SavedInspection[]>([]);
  const [recentFacilities, setRecentFacilities]         = useState<Facility[]>([]);
  const [officeName, setOfficeName]                     = useState('');
  const [userFacilities, setUserFacilities]             = useState<Facility[]>([]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const run = async () => {
        try {
          // ── Settings ─────────────────────────────────────────────
          const settings = await SettingsRepository.get();
          if (isActive) setOfficeName(settings.officeName || '');

          // ── Agenda ──────────────────────────────────────────────
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

          // ── Inspections ──────────────────────────────────────────
          const completed  = await InspectionRepository.getCompleted();
          const drafts     = await InspectionRepository.getDrafts();

          if (isActive) {
            const recentCompleted  = completed.slice(-3).reverse();
            const recentDrafts     = drafts.slice(-3).reverse();
            setCompletedInspections(recentCompleted);
            setInProgress(recentDrafts);
          }

          // ── User facilities ───────────────────────────────────────
          const userFacs = await getUserFacilities();
          if (isActive) {
            setUserFacilities(userFacs);
            setRecentFacilities(userFacs.slice(-3).reverse());
          }
        } catch (e) {
          console.error('useHomeData load error:', e);
          if (isActive) {
            setAgendaItems([]);
            setCompletedInspections([]);
            setInProgress([]);
            setRecentFacilities([]);
            setUserFacilities([]);
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
      totalCompleted:         completedInspections.length,
      totalDrafts:            inProgressInspections.length,
      nonCompliantFacilities: nonCompliant,
    };
  }, [completedInspections, inProgressInspections]);

  /**
   * Finds the matching facility for an agenda item.
   * Searches hardcoded list first, then user-added facilities.
   */
  const getFacilityForAgenda = useCallback(
    (item: AgendaItem): Facility | undefined => {
      return (
        hardcodedFacilities.find((f: Facility) => f.id === item.facilityId) ??
        userFacilities.find((f: Facility) => f.id === item.facilityId)
      );
    },
    [userFacilities]
  );

  return {
    officeName, agendaItems, completedInspections,
    inProgressInspections, recentFacilities, stats, getFacilityForAgenda,
  };
}

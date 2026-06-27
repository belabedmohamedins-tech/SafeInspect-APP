// src/hooks/useHomeData.ts
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { AgendaRepository } from '../repositories/AgendaRepository';
import { InspectionRepository } from '../repositories/InspectionRepository';
import { SettingsRepository } from '../repositories/SettingsRepository';
import { AgendaItem, Facility, SavedInspection } from '../types';
import { getComplianceSummary } from '../utils/statusUtils';

/**
 * Derives a deduplicated list of recently-inspected facilities from
 * SavedInspection records (no separate FacilityRepository needed).
 * Returns up to `limit` entries, most-recent first.
 */
function recentFacilitiesFromInspections(
  inspections: SavedInspection[],
  limit = 3,
): Facility[] {
  const seen = new Set<string>();
  const result: Facility[] = [];
  // inspections are already sorted newest-first after the .reverse() below
  for (const ins of inspections) {
    if (seen.has(ins.facilityId)) continue;
    seen.add(ins.facilityId);
    result.push({
      id:          ins.facilityId,
      projectName: ins.facilityName,
      ownerName:   '',
      activity:    '',
      address:     ins.facilityAddress ?? '',
    });
    if (result.length >= limit) break;
  }
  return result;
}

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
          const all = await InspectionRepository.getAll();
          if (isActive) {
            const completed    = all.filter(i => i.status === 'completed').slice(-5).reverse();
            const inProgress   = all.filter(i => i.status === 'in-progress' || i.status === 'draft').slice(-5).reverse();
            const allCompleted = all.filter(i => i.status === 'completed').slice().reverse();

            setCompletedInspections(completed);
            setInProgress(inProgress);

            // Derive recent facilities from completed inspections —
            // no separate repository needed.
            setRecentFacilities(recentFacilitiesFromInspections(allCompleted, 3));
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
      totalCompleted:          completedInspections.length,
      totalDrafts:             inProgressInspections.length,
      nonCompliantFacilities:  nonCompliant,
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

// src/utils/loadHomeData.ts
// Pure async function — no React, no hooks. Easy to unit-test.
import { facilities as hardcodedFacilities } from '../facilitiesData';
import { AgendaRepository } from '../repositories/AgendaRepository';
import { CorrectiveActionRepository } from '../repositories/CorrectiveActionRepository';
import { InspectionRepository } from '../repositories/InspectionRepository';
import { SettingsRepository } from '../repositories/SettingsRepository';
import { getUserFacilities } from '../facilitiesService';
import { getComplianceSummary } from './statusUtils';
import { AgendaItem, Facility, SavedInspection } from '../types';

export interface HomeData {
  officeName:             string;
  agendaItems:            AgendaItem[];
  completedInspections:   SavedInspection[];
  inProgressInspections:  SavedInspection[];
  recentFacilities:       Facility[];
  userFacilities:         Facility[];
  stats: {
    totalCompleted:         number;
    totalDrafts:            number;
    /** Count of completed inspections with at least one non-compliant item.
     *  W71 FIX: was computed over completedInspections.slice(-3) — wrong denominator.
     *  Now computed over ALL completed inspections. */
    nonCompliantFacilities: number;
    openCapCount:           number;
    /** Count of completed inspections with riskLevel >= 3 OR grade 'D'.
     *  These are the highest-priority facilities to reinspect. */
    highRiskCount:          number;
  };
}

export function getFacilityForAgenda(
  item: AgendaItem,
  userFacilities: Facility[]
): Facility | undefined {
  return (
    hardcodedFacilities.find((f: Facility) => f.id === item.facilityId) ??
    userFacilities.find((f: Facility) => f.id === item.facilityId)
  );
}

export async function loadHomeData(): Promise<HomeData> {
  const [settings, allAgenda, completed, drafts, userFacs, openCap] = await Promise.all([
    SettingsRepository.get(),
    AgendaRepository.getAll(),
    InspectionRepository.getCompleted(),
    InspectionRepository.getDrafts(),
    getUserFacilities(),
    CorrectiveActionRepository.getOpen(),
  ]);

  // Null-safe: get() returns defaults on first run (no data saved yet)
  const s = settings ?? {};

  // ── Agenda ──────────────────────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const agendaItems = allAgenda
    .filter(item => {
      // Use status field — AgendaItem has no .completed boolean
      if (item.status === 'completed') return false;
      const d = new Date(item.date);
      d.setHours(0, 0, 0, 0);
      return d >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // ── Inspections ─────────────────────────────────────────────────────────
  const completedInspections  = completed.slice(-3).reverse();
  const inProgressInspections = drafts.slice(-3).reverse();

  // ── Stats ────────────────────────────────────────────────────────────────
  // W71 FIX: both counters computed over ALL completed inspections,
  // not just the 3 displayed on the home screen.
  let nonCompliant = 0;
  let highRiskCount = 0;

  completed.forEach(ins => {
    if (getComplianceSummary(ins.items).nonCompliant > 0) nonCompliant++;
    if ((ins.riskLevel !== undefined && ins.riskLevel >= 3) || ins.grade === 'D') {
      highRiskCount++;
    }
  });

  return {
    officeName:            String(s.officeName ?? ''),
    agendaItems,
    completedInspections,
    inProgressInspections,
    recentFacilities:      userFacs.slice(-3).reverse(),
    userFacilities:        userFacs,
    stats: {
      totalCompleted:         completed.length,
      totalDrafts:            drafts.length,
      nonCompliantFacilities: nonCompliant,
      openCapCount:           openCap.length,
      highRiskCount,
    },
  };
}

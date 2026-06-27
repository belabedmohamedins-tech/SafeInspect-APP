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
    nonCompliantFacilities: number;
    openCapCount:           number;
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
    SettingsRepository.getAll(),   // fixed: was .get() with no key — always returned undefined
    AgendaRepository.getAll(),
    InspectionRepository.getCompleted(),
    InspectionRepository.getDrafts(),
    getUserFacilities(),
    CorrectiveActionRepository.getOpen(),
  ]);

  // Null-safe: getAll() returns {} on first run (no data saved yet)
  const s = settings ?? {};

  // ── Agenda ──────────────────────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const agendaItems = allAgenda
    .filter(item => {
      if (item.completed) return false;
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
  let nonCompliant = 0;
  completedInspections.forEach(ins => {
    if (getComplianceSummary(ins.items).nonCompliant > 0) nonCompliant++;
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
    },
  };
}

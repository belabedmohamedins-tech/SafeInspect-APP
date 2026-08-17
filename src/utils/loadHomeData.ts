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

export interface PriorityFacility {
  facilityId:     string;
  facilityName:   string;
  grade:          string;
  highViolations: number;
  lastDate:       string;
}

export interface HomeData {
  officeName:             string;
  agendaItems:            AgendaItem[];
  completedInspections:   SavedInspection[];
  inProgressInspections:  SavedInspection[];
  recentFacilities:       Facility[];
  userFacilities:         Facility[];
  priorityFacilities:     PriorityFacility[];
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

/** Score used to rank facilities by reinspection urgency.
 *  Grade D = 40, C = 20, B = 5, A = 0  +  high violations count.
 */
function priorityScore(ins: SavedInspection): number {
  const gradeWeight: Record<string, number> = { D: 40, C: 20, B: 5, A: 0 };
  return (gradeWeight[ins.grade ?? ''] ?? 0) + (ins.violations?.high ?? 0);
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

  const s = settings ?? {};

  // ── Agenda ──────────────────────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const agendaItems = allAgenda
    .filter(item => {
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

  // ── Stats — denominator is ALL completed, not the display slice ──────────
  // W71 FIX: was computed over completedInspections (slice of 3). Now uses
  // the full `completed` array so the KPI reflects the real population.
  let nonCompliant = 0;
  completed.forEach(ins => {
    if (getComplianceSummary(ins.items).nonCompliant > 0) nonCompliant++;
  });

  // ── Priority facilities — top 5 by reinspection urgency ─────────────────
  // Deduplicate: keep only the most recent inspection per facility.
  const latestPerFacility = new Map<string, SavedInspection>();
  completed.forEach(ins => {
    const existing = latestPerFacility.get(ins.facilityId);
    if (!existing || new Date(ins.date) > new Date(existing.date)) {
      latestPerFacility.set(ins.facilityId, ins);
    }
  });

  const priorityFacilities: PriorityFacility[] = Array.from(latestPerFacility.values())
    .filter(ins =>
      ins.grade === 'C' || ins.grade === 'D' ||
      (ins.violations?.high ?? 0) >= 3
    )
    .sort((a, b) => priorityScore(b) - priorityScore(a))
    .slice(0, 5)
    .map(ins => ({
      facilityId:     ins.facilityId,
      facilityName:   ins.facilityName,
      grade:          ins.grade ?? '?',
      highViolations: ins.violations?.high ?? 0,
      lastDate:       ins.date,
    }));

  return {
    officeName:            String(s.officeName ?? ''),
    agendaItems,
    completedInspections,
    inProgressInspections,
    recentFacilities:      userFacs.slice(-3).reverse(),
    userFacilities:        userFacs,
    priorityFacilities,
    stats: {
      totalCompleted:         completed.length,
      totalDrafts:            drafts.length,
      nonCompliantFacilities: nonCompliant,
      openCapCount:           openCap.length,
    },
  };
}

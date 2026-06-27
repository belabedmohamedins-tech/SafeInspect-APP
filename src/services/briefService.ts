// src/services/briefService.ts
import { InspectionRepository } from '../repositories/InspectionRepository';
import { SavedInspection, InspectionItem } from '../types';

export interface BriefData {
  lastInspection: SavedInspection | null;
  topViolations: InspectionItem[];
  previousGrade: string | null;
  previousScore: number | null;
  previousDate: string | null;
  previousInspectorName: string | null;
}

export async function buildBrief(facilityId: string): Promise<BriefData> {
  const all = await InspectionRepository.getCompleted();
  const facilityInspections = all
    .filter(i => i.facilityId === facilityId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const last = facilityInspections[0] ?? null;

  if (!last) {
    return {
      lastInspection: null,
      topViolations: [],
      previousGrade: null,
      previousScore: null,
      previousDate: null,
      previousInspectorName: null,
    };
  }

  const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const topViolations = last.items
    .filter(item => item.complianceStatus === 'non-compliant')
    .sort((a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3))
    .slice(0, 3);

  return {
    lastInspection: last,
    topViolations,
    previousGrade: last.grade ?? null,
    previousScore: last.score ?? null,
    previousDate: last.date,
    previousInspectorName: last.inspectorName,
  };
}

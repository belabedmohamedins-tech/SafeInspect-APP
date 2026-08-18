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

  // W86: critical must be 0 (highest priority). Without it, critical items
  // received ?? 3 and sorted last — the opposite of correct behaviour.
  const severityOrder: Record<string, number> = {
    critical: 0,
    high:     1,
    medium:   2,
    low:      3,
  };

  const topViolations = last.items
    .filter(item => item.complianceStatus === 'non-compliant')
    .sort((a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4))
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

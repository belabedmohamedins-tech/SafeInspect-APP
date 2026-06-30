// src/services/violationHistory.ts
//
// Phase-2: Repeat-violation detection.
//
// Provides three pure functions:
//
//   getPriorCompletedInspection   — finds the most-recent completed
//                                   inspection for a facility.
//
//   getPriorItemStatus            — returns the ComplianceStatus a specific
//                                   criterion had in that prior inspection.
//
//   annotateRepeatViolations      — mutates a copy of the current item list,
//                                   stamping isRepeatViolation and
//                                   priorInspectionStatus on each item.
//
// All functions are pure async; they do NOT write to storage.
// InspectionRepository.save() calls annotateRepeatViolations and persists
// the annotated items before computing the integrity hash.
//
// ── Circular-dependency fix ───────────────────────────────────────────────────
// This file used to import InspectionRepository directly, which created a
// require cycle:
//   InspectionRepository → violationHistory → InspectionRepository
//
// The fix: instead of importing the repository, callers inject the two
// data-access functions this service needs via a DataAccessors object.
// InspectionRepository.save() passes its own methods; nothing else changes.

import { ComplianceStatus, InspectionItem, SavedInspection } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Injected data accessors (replaces direct InspectionRepository import)
// ─────────────────────────────────────────────────────────────────────────────

export interface ViolationHistoryAccessors {
  getAll: () => Promise<SavedInspection[]>;
  getById: (id: string) => Promise<SavedInspection | null>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

async function getCompletedForFacility(
  accessors: ViolationHistoryAccessors,
  facilityId: string,
  excludeId?: string,
): Promise<SavedInspection[]> {
  const all = await accessors.getAll();
  return all
    .filter(
      i =>
        i.facilityId === facilityId &&
        i.status === 'completed' &&
        i.id !== excludeId,
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export async function getPriorCompletedInspection(
  accessors: ViolationHistoryAccessors,
  facilityId: string,
  excludeId?: string,
  priorInspectionId?: string,
): Promise<SavedInspection | null> {
  if (priorInspectionId) {
    const specific = await accessors.getById(priorInspectionId);
    if (specific && specific.status === 'completed' && specific.facilityId === facilityId) {
      return specific;
    }
  }
  const sorted = await getCompletedForFacility(accessors, facilityId, excludeId);
  return sorted[0] ?? null;
}

export async function getPriorItemStatus(
  accessors: ViolationHistoryAccessors,
  facilityId: string,
  criterionId: string,
  excludeId?: string,
): Promise<ComplianceStatus | undefined> {
  const prior = await getPriorCompletedInspection(accessors, facilityId, excludeId);
  if (!prior) return undefined;
  const item = prior.items.find(i => i.id === criterionId);
  return item?.complianceStatus;
}

export async function annotateRepeatViolations(
  accessors: ViolationHistoryAccessors,
  currentItems: InspectionItem[],
  facilityId: string,
  currentInspId: string,
  priorInspectionId?: string,
): Promise<InspectionItem[]> {
  const prior = await getPriorCompletedInspection(
    accessors,
    facilityId,
    currentInspId,
    priorInspectionId,
  );

  if (!prior) {
    return currentItems.map(item => ({
      ...item,
      isRepeatViolation: false,
      priorInspectionStatus: undefined,
    }));
  }

  const priorStatusMap = new Map<string, ComplianceStatus>();
  for (const priorItem of prior.items) {
    priorStatusMap.set(priorItem.id, priorItem.complianceStatus);
  }

  return currentItems.map(item => {
    const priorStatus = priorStatusMap.get(item.id);
    const isRepeat =
      item.complianceStatus === 'non-compliant' &&
      priorStatus === 'non-compliant';

    return {
      ...item,
      priorInspectionStatus: priorStatus,
      isRepeatViolation: isRepeat,
    };
  });
}

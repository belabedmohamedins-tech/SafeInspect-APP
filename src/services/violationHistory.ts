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

import { InspectionRepository } from '../repositories/InspectionRepository';
import { ComplianceStatus, InspectionItem, SavedInspection } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all completed inspections for a facility, newest-first.
 * Optionally excludes one ID (used to exclude the current inspection
 * being saved so we don't compare it with itself).
 */
async function getCompletedForFacility(
  facilityId: string,
  excludeId?: string,
): Promise<SavedInspection[]> {
  const all = await InspectionRepository.getAll();
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

/**
 * Returns the most-recent completed inspection for the given facility,
 * excluding the inspection currently being saved (pass its ID as excludeId).
 *
 * Returns null when:
 *  - there are no prior completed inspections for this facility, or
 *  - priorInspectionId is supplied AND that inspection does not exist / is
 *    not completed.
 *
 * @param facilityId       ID of the facility.
 * @param excludeId        ID of the current inspection (to avoid self-compare).
 * @param priorInspectionId If set, we look up this specific inspection instead
 *                          of the latest one. Useful when inspectionType ===
 *                          'follow-up' and priorInspectionId is explicit.
 */
export async function getPriorCompletedInspection(
  facilityId: string,
  excludeId?: string,
  priorInspectionId?: string,
): Promise<SavedInspection | null> {
  if (priorInspectionId) {
    const specific = await InspectionRepository.getById(priorInspectionId);
    if (specific && specific.status === 'completed' && specific.facilityId === facilityId) {
      return specific;
    }
    // Explicit ID given but not found / not completed — fall back to latest
  }
  const sorted = await getCompletedForFacility(facilityId, excludeId);
  return sorted[0] ?? null;
}

/**
 * Returns the compliance status a criterion had in the most-recent prior
 * completed inspection for this facility.
 *
 * Returns undefined when:
 *  - there is no prior inspection, or
 *  - the criterion does not appear in the prior inspection.
 *
 * @param facilityId   ID of the facility.
 * @param criterionId  The InspectionItem.id of the criterion to look up.
 * @param excludeId    ID of the current inspection (avoid self-compare).
 */
export async function getPriorItemStatus(
  facilityId: string,
  criterionId: string,
  excludeId?: string,
): Promise<ComplianceStatus | undefined> {
  const prior = await getPriorCompletedInspection(facilityId, excludeId);
  if (!prior) return undefined;
  const item = prior.items.find(i => i.id === criterionId);
  return item?.complianceStatus;
}

/**
 * Annotates a copy of `currentItems` with repeat-violation information
 * by comparing against the prior completed inspection for `facilityId`.
 *
 * For each item:
 *  - `priorInspectionStatus` is set to the status it had in the prior
 *    inspection (or left undefined if it was not evaluated before).
 *  - `isRepeatViolation` is set to true only when:
 *      • current status is 'non-compliant', AND
 *      • prior status was also 'non-compliant'.
 *
 * Items that were not present in the prior inspection are left unchanged
 * (isRepeatViolation stays false/undefined, priorInspectionStatus stays
 * undefined — this is correct for new criteria added to the checklist).
 *
 * @param currentItems      The InspectionItems to annotate (not mutated).
 * @param facilityId        Facility being inspected.
 * @param currentInspId     ID of the inspection being saved (excluded from
 *                          the prior-inspection lookup).
 * @param priorInspectionId Optional explicit prior inspection ID (from
 *                          SavedInspection.priorInspectionId).
 * @returns                 A new array of InspectionItems with annotations.
 */
export async function annotateRepeatViolations(
  currentItems: InspectionItem[],
  facilityId: string,
  currentInspId: string,
  priorInspectionId?: string,
): Promise<InspectionItem[]> {
  const prior = await getPriorCompletedInspection(
    facilityId,
    currentInspId,
    priorInspectionId,
  );

  if (!prior) {
    // No prior inspection — clear any stale annotation flags and return.
    return currentItems.map(item => ({
      ...item,
      isRepeatViolation: false,
      priorInspectionStatus: undefined,
    }));
  }

  // Build a lookup map: criterionId → priorStatus
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

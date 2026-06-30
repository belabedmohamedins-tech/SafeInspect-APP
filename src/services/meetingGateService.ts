// src/services/meetingGateService.ts
// Phase-5: thin helper to persist meeting gate flags onto a SavedInspection.

import { InspectionRepository } from '../repositories/InspectionRepository';

/**
 * Mark openingMeetingDone = true on the stored inspection.
 * Safe to call multiple times (idempotent).
 */
export async function persistOpeningMeetingDone(inspectionId: string): Promise<void> {
  const inspection = await InspectionRepository.getById(inspectionId);
  if (!inspection) return;
  await InspectionRepository.save({ ...inspection, openingMeetingDone: true });
}

/**
 * Mark closingMeetingDone = true on the stored inspection.
 * Safe to call multiple times (idempotent).
 */
export async function persistClosingMeetingDone(inspectionId: string): Promise<void> {
  const inspection = await InspectionRepository.getById(inspectionId);
  if (!inspection) return;
  await InspectionRepository.save({ ...inspection, closingMeetingDone: true });
}

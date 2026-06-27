// src/services/followUpService.ts
// Auto follow-up agenda creation (FR-025)
// Called by InspectionRepository.save() when an inspection is completed.
import { SavedInspection } from '../types';
import { AgendaRepository } from '../repositories/AgendaRepository';
import { CorrectiveActionRepository } from '../repositories/CorrectiveActionRepository';

/** Add 30 days to a YYYY-MM-DD date string. */
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/**
 * Creates a follow-up agenda item 30 days after the inspection date if:
 *  - The inspection grade is 'D', OR
 *  - There is at least one open CAP item for this inspection.
 *
 * Idempotent: only creates one follow-up per inspection (checks by inspectionId note tag).
 */
export async function createFollowUpIfNeeded(inspection: SavedInspection): Promise<void> {
  if (inspection.status !== 'completed') return;

  const needsFollowUp =
    inspection.grade === 'D' ||
    (await CorrectiveActionRepository.getByInspection(inspection.id)).length > 0;

  if (!needsFollowUp) return;

  // Idempotency: check if a follow-up already exists for this inspection
  const existing = await AgendaRepository.getAll();
  const alreadyExists = existing.some(
    item =>
      item.facilityId === inspection.facilityId &&
      item.notes.includes(`[follow-up:${inspection.id}]`)
  );
  if (alreadyExists) return;

  const followUpDate = addDays(inspection.date, 30);
  const gradeReason = inspection.grade === 'D' ? 'درجة D' : 'إجراءات تصحيحية مفتوحة';

  await AgendaRepository.save({
    id: `followup-${inspection.id}-${Date.now()}`,
    facilityId: inspection.facilityId,
    facilityName: inspection.facilityName,
    facilityAddress: inspection.facilityAddress,
    date: followUpDate,
    notes: `متابعة تلقائية بسبب ${gradeReason} [follow-up:${inspection.id}]`,
    status: 'pending',
  });
}

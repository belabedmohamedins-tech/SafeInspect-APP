// src/services/capFactory.ts
//
// Phase-4: auto-create CorrectiveAction items from a completed inspection.
// Called by checklist.tsx immediately after the inspection is saved as
// 'completed'.  Skips any item that already has an open / in-progress /
// overdue CAP entry so re-opening a draft does not create duplicates.

import { CorrectiveActionRepository } from '../repositories/CorrectiveActionRepository';
import { CorrectiveAction, SavedInspection } from '../types';

function defaultDeadlineDays(severity: CorrectiveAction['severity']): number {
  switch (severity) {
    case 'critical': return 7;
    case 'high':     return 14;
    case 'medium':   return 30;
    default:         return 45;
  }
}

function deadlineFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function createCapItemsFromInspection(
  inspection: SavedInspection,
): Promise<void> {
  // Fetch existing open/overdue CAPs for this inspection so we don't
  // create duplicates on re-open.
  const existing = await CorrectiveActionRepository.getByInspection(inspection.id);
  const activeItemIds = new Set(
    existing
      .filter(a => a.status !== 'resolved')
      .map(a => a.inspectionItemId),
  );

  const nonCompliant = inspection.items.filter(
    item => item.complianceStatus === 'non-compliant',
  );

  for (const item of nonCompliant) {
    if (activeItemIds.has(item.id)) continue; // already tracked

    // Map InspectionItem severity ('low'|'medium'|'high') to CAP severity.
    // CorrectiveAction.severity also accepts 'critical' — we reserve that
    // for items marked with sanctionTier === 'court-referral'.
    const severity: CorrectiveAction['severity'] =
      item.sanctionTier === 'court-referral'
        ? 'critical'
        : (item.severity as CorrectiveAction['severity']);

    await CorrectiveActionRepository.save({
      inspectionId:     inspection.id,
      inspectionItemId: item.id,
      facilityId:       inspection.facilityId,
      facilityName:     inspection.facilityName,
      criteria:         item.criteria,
      severity,
      deadline:         deadlineFromToday(defaultDeadlineDays(severity)),
      assignedTo:       '',
      status:           'open',
      notes:            item.comment ?? '',
    });
  }
}

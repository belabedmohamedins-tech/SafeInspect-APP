// src/__tests__/repositories/InspectionRepository.extended.test.ts
//
// Targets uncovered line in InspectionRepository.ts:
//   line 64 — try { await createFollowUpIfNeeded(toSave); } catch { /* non-fatal */ }
//
// Strategy: mock followUpService to throw so the catch block is exercised.
// All other side-effects (AuditLog, CorrectiveAction, Approval, IntegrityService,
// violationHistory) are mocked to no-ops so the test is isolated.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { InspectionRepository } from '../../repositories/InspectionRepository';
import type { SavedInspection } from '../../types';

// ─── L4 mocks ────────────────────────────────────────────────────────────────

jest.mock('../../services/followUpService', () => ({
  createFollowUpIfNeeded: jest.fn().mockRejectedValue(new Error('follow-up error')),
}));

jest.mock('../../services/IntegrityService', () => ({
  IntegrityService: { computeHash: jest.fn().mockResolvedValue('mock-hash-abc') },
}));

jest.mock('../../services/violationHistory', () => ({
  annotateRepeatViolations: jest.fn().mockResolvedValue([]),
}));

jest.mock('../../repositories/AuditLogRepository', () => ({
  AuditLogRepository: { append: jest.fn().mockResolvedValue(undefined) },
}));

jest.mock('../../repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: { createFromInspection: jest.fn().mockResolvedValue(undefined) },
}));

jest.mock('../../repositories/ApprovalRepository', () => ({
  ApprovalRepository: { enqueue: jest.fn().mockResolvedValue(undefined) },
}));

// ─── Setup ───────────────────────────────────────────────────────────────────

const { __resetStore } = AsyncStorage as any;
beforeEach(() => { __resetStore(); jest.clearAllMocks(); });

const makeInspection = (overrides: Partial<SavedInspection> = {}): SavedInspection => ({
  id:             'ins-ext-1',
  facilityId:     'fac-1',
  facilityName:   'Test Facility',
  inspectorName:  'Tester',
  status:         'completed',
  date:           new Date().toISOString(),
  items:          [],
  score:          100,
  grade:          'A',
  ...overrides,
} as SavedInspection);

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('InspectionRepository — followUp non-fatal catch (line 64)', () => {
  it('saves successfully even when createFollowUpIfNeeded throws', async () => {
    const inspection = makeInspection();
    // Should NOT throw — the catch block on line 64 swallows the error
    await expect(InspectionRepository.save(inspection)).resolves.not.toThrow();

    const saved = await InspectionRepository.getById('ins-ext-1');
    expect(saved).not.toBeNull();
    expect(saved?.status).toBe('completed');
  });

  it('still records the audit log even when followUp throws', async () => {
    const { AuditLogRepository } = require('../../repositories/AuditLogRepository');
    const inspection = makeInspection({ id: 'ins-ext-2' });
    await InspectionRepository.save(inspection);
    expect(AuditLogRepository.append).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'INSPECTION_SAVED', inspectionId: 'ins-ext-2' })
    );
  });

  it('does not save the same completion twice (idx !== -1 branch)', async () => {
    const inspection = makeInspection({ id: 'ins-ext-3' });
    await InspectionRepository.save(inspection);
    // Second save of the same already-completed inspection — isNewCompletion = false
    await expect(InspectionRepository.save(inspection)).resolves.not.toThrow();
    // Should still have exactly one record
    const all = await InspectionRepository.getAll();
    expect(all.filter(i => i.id === 'ins-ext-3')).toHaveLength(1);
  });
});

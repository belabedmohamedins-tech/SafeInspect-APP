// src/__tests__/repositories/InspectionRepository.extended.test.ts
// Targets:
//   line 64  — catch block when annotateRepeatViolations throws
//   idx !== -1 branch in save()

import AsyncStorage from '@react-native-async-storage/async-storage';
import { InspectionRepository } from '../../repositories/InspectionRepository';
import type { SavedInspection } from '../../types';

jest.mock('../../services/violationHistory', () => ({
  annotateRepeatViolations: jest.fn(),
}));
jest.mock('../../services/followUpService', () => ({
  createFollowUpIfNeeded: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../repositories/AuditLogRepository', () => ({
  AuditLogRepository: { append: jest.fn().mockResolvedValue(undefined) },
}));
// G17c fix: source calls createCapItemsFromInspection from capFactory, not CorrectiveActionRepository
jest.mock('../../services/capFactory', () => ({
  createCapItemsFromInspection: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../repositories/ApprovalRepository', () => ({
  ApprovalRepository: { enqueue: jest.fn().mockResolvedValue(undefined) },
}));
jest.mock('../../services/IntegrityService', () => ({
  IntegrityService: { computeHash: jest.fn().mockResolvedValue('hash-abc') },
}));

import { annotateRepeatViolations } from '../../services/violationHistory';

const { __resetStore } = AsyncStorage as any;
beforeEach(() => { __resetStore(); jest.clearAllMocks(); });

function makeInspection(overrides: Partial<SavedInspection> = {}): SavedInspection {
  return {
    id: 'ins-test-1',
    facilityId: 'fac-1',
    facilityName: 'Test Facility',
    inspectorName: 'Ahmed',
    date: '2026-01-01',
    status: 'completed',
    items: [],
    score: 100,
    grade: 'A',
    ...overrides,
  } as SavedInspection;
}

describe('InspectionRepository.save — annotation catch (line 64)', () => {
  it('still saves when annotateRepeatViolations throws (non-fatal catch)', async () => {
    (annotateRepeatViolations as jest.Mock).mockRejectedValueOnce(new Error('annotation failed'));
    const ins = makeInspection();
    await expect(InspectionRepository.save(ins)).resolves.not.toThrow();
    const all = await InspectionRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('ins-test-1');
  });

  it('updates existing inspection (idx !== -1 branch)', async () => {
    (annotateRepeatViolations as jest.Mock).mockResolvedValue([]);
    const ins = makeInspection({ status: 'in-progress' });
    await InspectionRepository.save(ins);
    const updated = makeInspection({ status: 'in-progress', score: 80 });
    await InspectionRepository.save(updated);
    const all = await InspectionRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].score).toBe(80);
  });
});

// src/__tests__/repositories/InspectionRepository.test.ts
//
// LAZY-IMPORT MOCKS — WHY jest.requireMock + mockResolvedValue IN beforeEach
// ─────────────────────────────────────────────────────────────────────────────
// InspectionRepository.save() calls two modules via await import():
//
//   const { createFollowUpIfNeeded } = await import('../services/followUpService');
//   const { ApprovalRepository }     = await import('./ApprovalRepository');
//
// Babel transforms await import(path) → Promise.resolve().then(() => require(path)).
// The require(path) hits the Jest module registry using the RESOLVED absolute path.
// jest.mock() registers the mock under that same resolved key — so the mock IS
// returned by require(). This part works.
//
// The problem is jest.clearAllMocks(): it resets all mock implementations to
// jest.fn() with no return value. The lazy imports then call a function that
// returns undefined, not a Promise. Inside the source:
//
//   try {
//     await createFollowUpIfNeeded(toSave);  // returns undefined → await ok
//   } catch { /* non-fatal */ }              // but if it throws, swallowed
//
// If the mock returns undefined (not a Promise), await undefined resolves
// immediately — the call IS recorded. But if clearAllMocks wipes the mock
// reference entirely (replaces the jest.fn() object), the reference held by
// mockCreateFollowUp is stale and no longer the same function the module calls.
//
// SOLUTION: retrieve handles via jest.requireMock() — same registry instance —
// and call .mockResolvedValue(undefined) INSIDE beforeEach, AFTER clearAllMocks,
// to re-bind the implementation on the live object every test.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../../repositories/keys';
import { SavedInspection } from '../../types';

// ─── mock factories — jest.fn() INSIDE the factory (never outside) ────────────

jest.mock('../../services/IntegrityService', () => ({
  IntegrityService: {
    computeHash:      jest.fn(() => 'mock-hash-abc123'),
    verifyInspection: jest.fn(() => Promise.resolve({ ok: true, computedHash: 'mock-hash-abc123' })),
  },
}));

jest.mock('../../repositories/AuditLogRepository', () => ({
  AuditLogRepository: { append: jest.fn(() => Promise.resolve()) },
}));

jest.mock('../../repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: { createFromInspection: jest.fn(() => Promise.resolve()) },
}));

jest.mock('../../services/followUpService', () => ({
  createFollowUpIfNeeded: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../repositories/ApprovalRepository', () => ({
  ApprovalRepository: { enqueue: jest.fn().mockResolvedValue(undefined) },
}));

// ─── module under test ────────────────────────────────────────────────────────

import { InspectionRepository } from '../../repositories/InspectionRepository';
import { IntegrityService } from '../../services/IntegrityService';
import { AuditLogRepository } from '../../repositories/AuditLogRepository';
import { CorrectiveActionRepository } from '../../repositories/CorrectiveActionRepository';

const mockComputeHash          = IntegrityService.computeHash                        as jest.Mock;
const mockAuditAppend          = AuditLogRepository.append                           as jest.Mock;
const mockCreateFromInspection = CorrectiveActionRepository.createFromInspection     as jest.Mock;

// Lazy-import handles — retrieved via requireMock to guarantee the same
// registry instance that await import() resolves to inside the source file.
const mockCreateFollowUp = (jest.requireMock('../../services/followUpService') as {
  createFollowUpIfNeeded: jest.Mock;
}).createFollowUpIfNeeded;

const mockEnqueue = (jest.requireMock('../../repositories/ApprovalRepository') as {
  ApprovalRepository: { enqueue: jest.Mock };
}).ApprovalRepository.enqueue;

// ─── setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  (AsyncStorage as any).__resetStore();
  jest.clearAllMocks();
  // Re-apply Promise-returning implementations after clearAllMocks wipes them.
  // Without this, the source's try/catch may swallow a "not a function" throw
  // or await undefined without recording the call on the mock we hold a ref to.
  mockCreateFollowUp.mockResolvedValue(undefined);
  mockEnqueue.mockResolvedValue(undefined);
  mockAuditAppend.mockResolvedValue(undefined);
  mockCreateFromInspection.mockResolvedValue(undefined);
  mockComputeHash.mockReturnValue('mock-hash-abc123');
});

function makeInspection(overrides: Partial<SavedInspection> = {}): SavedInspection {
  return {
    id:                'insp-1',
    facilityId:        'fac-1',
    facilityName:      'Test Facility',
    facilityAddress:   '123 Test St',
    date:              '2025-01-15T09:00:00.000Z',
    inspectorName:     'Inspector A',
    officeName:        'HQ',
    status:            'completed',
    items:             [],
    inspectionCause:   '',
    referenceDocument: '',
    committeeMembers:  [],
    signature:         '',
    ...overrides,
  } as SavedInspection;
}

// ─── corrupt storage ──────────────────────────────────────────────────────────

describe('InspectionRepository — corrupt storage', () => {
  it('getAll returns [] when stored JSON is corrupt', async () => {
    await AsyncStorage.setItem(StorageKeys.INSPECTIONS, 'CORRUPT{{{');
    expect(await InspectionRepository.getAll()).toEqual([]);
  });
});

// ─── getAll ───────────────────────────────────────────────────────────────────

describe('InspectionRepository.getAll', () => {
  it('returns [] when storage is empty', async () => {
    expect(await InspectionRepository.getAll()).toEqual([]);
  });

  it('returns all stored inspections', async () => {
    await AsyncStorage.setItem(StorageKeys.INSPECTIONS, JSON.stringify([makeInspection()]));
    const result = await InspectionRepository.getAll();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('insp-1');
  });
});

// ─── getById ──────────────────────────────────────────────────────────────────

describe('InspectionRepository.getById', () => {
  it('returns the matching inspection', async () => {
    await InspectionRepository.save(makeInspection({ id: 'x1', status: 'in-progress' }));
    expect((await InspectionRepository.getById('x1'))?.id).toBe('x1');
  });

  it('returns null when id is not found', async () => {
    expect(await InspectionRepository.getById('ghost')).toBeNull();
  });
});

// ─── getCompleted ─────────────────────────────────────────────────────────────

describe('InspectionRepository.getCompleted', () => {
  it('returns only completed inspections', async () => {
    await InspectionRepository.save(makeInspection({ id: '1', status: 'completed' }));
    await InspectionRepository.save(makeInspection({ id: '2', status: 'in-progress' }));
    const result = await InspectionRepository.getCompleted();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });
});

// ─── getDrafts ────────────────────────────────────────────────────────────────

describe('InspectionRepository.getDrafts', () => {
  it('returns in-progress inspections', async () => {
    await InspectionRepository.save(makeInspection({ id: '1', status: 'completed' }));
    await InspectionRepository.save(makeInspection({ id: '2', status: 'in-progress' }));
    const result = await InspectionRepository.getDrafts();
    expect(result.map((i: any) => i.id)).toContain('2');
    expect(result.map((i: any) => i.id)).not.toContain('1');
  });

  it('returns inspections with status "draft"', async () => {
    await AsyncStorage.setItem(
      StorageKeys.INSPECTIONS,
      JSON.stringify([makeInspection({ id: 'd1', status: 'draft' as any })])
    );
    const result = await InspectionRepository.getDrafts();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('d1');
  });
});

// ─── save ─────────────────────────────────────────────────────────────────────

describe('InspectionRepository.save', () => {
  it('persists a new inspection', async () => {
    await InspectionRepository.save(makeInspection());
    const stored = JSON.parse((await AsyncStorage.getItem(StorageKeys.INSPECTIONS))!);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('insp-1');
  });

  it('replaces an existing inspection with the same id', async () => {
    await InspectionRepository.save(makeInspection({ facilityName: 'Old Name' }));
    await InspectionRepository.save(makeInspection({ facilityName: 'New Name' }));
    const stored = JSON.parse((await AsyncStorage.getItem(StorageKeys.INSPECTIONS))!);
    expect(stored).toHaveLength(1);
    expect(stored[0].facilityName).toBe('New Name');
  });

  it('triggers AuditLog + CAP on first completion', async () => {
    await InspectionRepository.save(makeInspection({ id: 'new-c', status: 'completed' }));
    expect(mockAuditAppend.mock.calls.some((c: any[]) => c[0]?.action === 'INSPECTION_SAVED')).toBe(true);
    expect(mockCreateFromInspection).toHaveBeenCalled();
  });

  it('calls followUpService and ApprovalRepository on completion (lazy import paths)', async () => {
    await InspectionRepository.save(makeInspection({ id: 'lazy-1', status: 'completed' }));
    expect(mockCreateFollowUp).toHaveBeenCalled();
    expect(mockEnqueue).toHaveBeenCalled();
  });

  it('does NOT trigger side-effects when saving an in-progress inspection', async () => {
    await InspectionRepository.save(makeInspection({ id: 'draft-x', status: 'in-progress' }));
    expect(mockAuditAppend).not.toHaveBeenCalled();
    expect(mockCreateFromInspection).not.toHaveBeenCalled();
    expect(mockCreateFollowUp).not.toHaveBeenCalled();
    expect(mockEnqueue).not.toHaveBeenCalled();
  });

  it('embeds the computed hash on completion', async () => {
    await InspectionRepository.save(makeInspection({ id: 'h1', status: 'completed' }));
    expect(mockComputeHash).toHaveBeenCalled();
    const stored = JSON.parse((await AsyncStorage.getItem(StorageKeys.INSPECTIONS))!);
    expect(stored[0].integrityHash).toBe('mock-hash-abc123');
  });
});

// ─── delete ───────────────────────────────────────────────────────────────────

describe('InspectionRepository.delete', () => {
  it('removes the inspection by id', async () => {
    await InspectionRepository.save(makeInspection());
    await InspectionRepository.delete('insp-1');
    const stored = JSON.parse((await AsyncStorage.getItem(StorageKeys.INSPECTIONS)) ?? '[]');
    expect(stored).toHaveLength(0);
  });

  it('is a no-op when id does not exist', async () => {
    await InspectionRepository.delete('nonexistent');
    expect(JSON.parse((await AsyncStorage.getItem(StorageKeys.INSPECTIONS)) ?? '[]')).toHaveLength(0);
  });
});

// ─── deleteMany ───────────────────────────────────────────────────────────────

describe('InspectionRepository.deleteMany', () => {
  it('removes all inspections whose ids are in the list', async () => {
    await InspectionRepository.save(makeInspection({ id: 'a1', status: 'in-progress' }));
    await InspectionRepository.save(makeInspection({ id: 'a2', status: 'in-progress' }));
    await InspectionRepository.save(makeInspection({ id: 'a3', status: 'in-progress' }));
    await InspectionRepository.deleteMany(['a1', 'a3']);
    const stored = JSON.parse((await AsyncStorage.getItem(StorageKeys.INSPECTIONS))!);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('a2');
  });

  it('appends a INSPECTION_BULK_DELETED audit entry', async () => {
    await InspectionRepository.deleteMany(['x1', 'x2']);
    expect(mockAuditAppend.mock.calls.some((c: any[]) => c[0]?.action === 'INSPECTION_BULK_DELETED')).toBe(true);
  });

  it('is a no-op when the id list is empty', async () => {
    await InspectionRepository.save(makeInspection({ id: 'keep-1', status: 'in-progress' }));
    await InspectionRepository.deleteMany([]);
    const stored = JSON.parse((await AsyncStorage.getItem(StorageKeys.INSPECTIONS))!);
    expect(stored).toHaveLength(1);
  });
});

// src/__tests__/repositories/InspectionRepository.test.ts
//
// WHY THIS FILE DOES NOT USE jest.resetModules() / jest.doMock()
// ───────────────────────────────────────────────────────────────
// resetModules() clears the entire module registry — including AsyncStorage.
// After reset, InspectionRepository loads a FRESH AsyncStorage instance
// with an empty in-memory store, while the top-level import in this test
// file still holds a reference to the OLD instance. Every setItem/getItem
// call in test setup goes to the old instance; every read inside
// InspectionRepository goes to the new one. They never see each other's data.
//
// SOLUTION: Keep the static jest.mock() declarations at the top of the file
// (hoisted by Babel, applied to the single shared registry for the whole
// suite). AsyncStorage mock is provided by moduleNameMapper (Layer 2 in the
// jest.config.js architecture). Call __resetStore() in beforeEach to wipe
// in-memory state between tests — this works on the shared instance.
//
// LAZY IMPORTS (followUpService, ApprovalRepository)
// ───────────────────────────────────────────────────
// InspectionRepository.save() uses await import() for these two modules.
// Static jest.mock() at the top of the file registers the mock in the
// module registry BEFORE any module loads. When Babel transforms
// await import(path) → Promise.resolve(require(path)) at runtime, the
// path hits the same jest registry and returns the mock factory's exports.
// This works as long as resetModules() is NOT called (which would wipe
// the registry and un-register the mocks).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../../repositories/keys';
import { SavedInspection } from '../../types';

// ─── static mocks (hoisted by Babel) ─────────────────────────────────────────

const mockComputeHash      = jest.fn(() => 'mock-hash-abc123');
const mockVerifyInspection = jest.fn(() => true);
jest.mock('../../services/IntegrityService', () => ({
  IntegrityService: {
    computeHash:      mockComputeHash,
    verifyInspection: mockVerifyInspection,
  },
}));

const mockAuditAppend = jest.fn(() => Promise.resolve());
jest.mock('../../repositories/AuditLogRepository', () => ({
  AuditLogRepository: { append: mockAuditAppend },
}));

const mockCreateFromInspection = jest.fn(() => Promise.resolve());
jest.mock('../../repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: { createFromInspection: mockCreateFromInspection },
}));

// Lazy-imported modules — registered here so await import() resolves the mock.
const mockCreateFollowUpIfNeeded = jest.fn(() => Promise.resolve());
jest.mock('../../services/followUpService', () => ({
  createFollowUpIfNeeded: mockCreateFollowUpIfNeeded,
}));

const mockEnqueue = jest.fn(() => Promise.resolve());
jest.mock('../../repositories/ApprovalRepository', () => ({
  ApprovalRepository: { enqueue: mockEnqueue },
}));

// ─── module under test (loaded AFTER all jest.mock declarations) ──────────────

import { InspectionRepository } from '../../repositories/InspectionRepository';

// ─── helpers ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  // Wipe in-memory AsyncStorage state between tests.
  (AsyncStorage as any).__resetStore();
  // Clear call history on all mocks.
  jest.clearAllMocks();
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
    expect(
      mockAuditAppend.mock.calls.some((c: any[]) => c[0]?.action === 'INSPECTION_SAVED')
    ).toBe(true);
    expect(mockCreateFromInspection).toHaveBeenCalled();
  });

  it('calls followUpService and ApprovalRepository on first completion (lazy import paths)', async () => {
    await InspectionRepository.save(makeInspection({ id: 'lazy-1', status: 'completed' }));
    expect(mockCreateFollowUpIfNeeded).toHaveBeenCalled();
    expect(mockEnqueue).toHaveBeenCalled();
  });

  it('does NOT trigger side-effects when saving an in-progress inspection', async () => {
    await InspectionRepository.save(makeInspection({ id: 'draft-x', status: 'in-progress' }));
    expect(mockAuditAppend).not.toHaveBeenCalled();
    expect(mockCreateFromInspection).not.toHaveBeenCalled();
    expect(mockCreateFollowUpIfNeeded).not.toHaveBeenCalled();
    expect(mockEnqueue).not.toHaveBeenCalled();
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
    expect(
      mockAuditAppend.mock.calls.some((c: any[]) => c[0]?.action === 'INSPECTION_BULK_DELETED')
    ).toBe(true);
  });

  it('is a no-op when the id list is empty', async () => {
    await InspectionRepository.save(makeInspection({ id: 'keep-1', status: 'in-progress' }));
    await InspectionRepository.deleteMany([]);
    const stored = JSON.parse((await AsyncStorage.getItem(StorageKeys.INSPECTIONS))!);
    expect(stored).toHaveLength(1);
  });
});

// src/__tests__/repositories/InspectionRepository.test.ts
//
// LAZY IMPORT PROBLEM — ROOT CAUSE
// ─────────────────────────────────
// InspectionRepository.save() uses `await import('../services/followUpService')`
// and `await import('./ApprovalRepository')` inside try/catch blocks.
//
// jest.mock() + static top-level import work perfectly for direct calls.
// But for dynamic import() there is a known jest-expo / Babel interop issue:
// the dynamic import can bypass jest.mock() and resolve the REAL module,
// because Babel transforms dynamic import() into require() AFTER jest.mock()
// hoisting has already locked in the registry for static imports.
//
// SOLUTION: jest.resetModules() + jest.doMock() (not jest.mock).
//   - jest.resetModules() clears the module registry before each test so
//     subsequent require/import calls re-resolve from scratch.
//   - jest.doMock() (unlike jest.mock) is NOT hoisted — it runs in place,
//     AFTER resetModules, so it registers the mock into the freshly cleared
//     registry BEFORE any module loads.
//   - We then load InspectionRepository with require() AFTER doMock so it
//     gets the mocked versions when it executes its own import().
//
// All other mocks (IntegrityService, AuditLogRepository, etc.) that are used
// via static import inside InspectionRepository are also re-registered via
// doMock so the fresh registry is fully populated.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../../repositories/keys';
import { SavedInspection } from '../../types';

// These are declared at module scope so every describe/it can access them.
// They are re-assigned in beforeEach after resetModules.
let InspectionRepository: any;
let AuditLogRepository: any;
let CorrectiveActionRepository: any;
let createFollowUpIfNeeded: jest.Mock;
let enqueue: jest.Mock;

beforeEach(() => {
  jest.resetModules();
  (AsyncStorage as any).__resetStore();

  // --- register all mocks into the fresh registry ---

  jest.doMock('../../services/IntegrityService', () => ({
    IntegrityService: {
      computeHash:      jest.fn(() => 'mock-hash-abc123'),
      verifyInspection: jest.fn(() => true),
    },
  }));

  jest.doMock('../../repositories/AuditLogRepository', () => ({
    AuditLogRepository: { append: jest.fn(() => Promise.resolve()) },
  }));

  jest.doMock('../../repositories/CorrectiveActionRepository', () => ({
    CorrectiveActionRepository: { createFromInspection: jest.fn(() => Promise.resolve()) },
  }));

  createFollowUpIfNeeded = jest.fn(() => Promise.resolve());
  enqueue               = jest.fn(() => Promise.resolve());

  jest.doMock('../../services/followUpService', () => ({
    createFollowUpIfNeeded,
  }));

  jest.doMock('../../repositories/ApprovalRepository', () => ({
    ApprovalRepository: { enqueue },
  }));

  // Load AFTER all doMocks so the module sees the mocked deps on first require()
  InspectionRepository      = require('../../repositories/InspectionRepository').InspectionRepository;
  AuditLogRepository        = require('../../repositories/AuditLogRepository').AuditLogRepository;
  CorrectiveActionRepository = require('../../repositories/CorrectiveActionRepository').CorrectiveActionRepository;
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

describe('InspectionRepository \u2014 corrupt storage', () => {
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
      (AuditLogRepository.append as jest.Mock).mock.calls.some(
        (c: any[]) => c[0]?.action === 'INSPECTION_SAVED'
      )
    ).toBe(true);
    expect(CorrectiveActionRepository.createFromInspection).toHaveBeenCalled();
  });

  it('calls followUpService and ApprovalRepository on first completion (lazy import paths)', async () => {
    // createFollowUpIfNeeded and enqueue are the exact jest.fn() instances
    // registered via doMock in beforeEach. Because resetModules cleared the
    // registry and doMock re-registered them BEFORE InspectionRepository was
    // loaded, the dynamic import() inside save() resolves the same instances.
    await InspectionRepository.save(makeInspection({ id: 'lazy-1', status: 'completed' }));
    expect(createFollowUpIfNeeded).toHaveBeenCalled();
    expect(enqueue).toHaveBeenCalled();
  });

  it('does NOT trigger side-effects when saving an in-progress inspection', async () => {
    await InspectionRepository.save(makeInspection({ id: 'draft-x', status: 'in-progress' }));
    expect(AuditLogRepository.append).not.toHaveBeenCalled();
    expect(CorrectiveActionRepository.createFromInspection).not.toHaveBeenCalled();
    expect(createFollowUpIfNeeded).not.toHaveBeenCalled();
    expect(enqueue).not.toHaveBeenCalled();
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
      (AuditLogRepository.append as jest.Mock).mock.calls.some(
        (c: any[]) => c[0]?.action === 'INSPECTION_BULK_DELETED'
      )
    ).toBe(true);
  });

  it('is a no-op when the id list is empty', async () => {
    await InspectionRepository.save(makeInspection({ id: 'keep-1', status: 'in-progress' }));
    await InspectionRepository.deleteMany([]);
    const stored = JSON.parse((await AsyncStorage.getItem(StorageKeys.INSPECTIONS))!);
    expect(stored).toHaveLength(1);
  });
});

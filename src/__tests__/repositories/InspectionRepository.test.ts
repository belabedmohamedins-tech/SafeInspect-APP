// src/__tests__/repositories/InspectionRepository.test.ts
//
// WHY MOCK FACTORIES USE jest.fn() INLINE — NOT OUTER const REFS
// ───────────────────────────────────────────────────────────────
// Babel hoists jest.mock() calls to the TOP of the file, before any variable
// declarations. If you write:
//
//   const mockFn = jest.fn();          // ← declared here
//   jest.mock('...', () => ({ fn: mockFn }));  // ← hoisted ABOVE the const
//
// …the hoisted factory runs while mockFn is still in the Temporal Dead Zone.
// The factory receives `undefined`, not the jest.fn() instance. Every call
// from the source module then throws "is not a function".
//
// SOLUTION: declare jest.fn() INSIDE the factory:
//
//   jest.mock('...', () => ({ fn: jest.fn() }));
//
// Then retrieve the live instance AFTER the module loads:
//
//   const mockFn = jest.requireMock('...').fn;
//
// WHY LAZY-IMPORT MOCKS USE jest.requireMock — NOT STATIC IMPORTS
// ────────────────────────────────────────────────────────────────
// InspectionRepository.save() uses await import() for followUpService and
// ApprovalRepository. Babel transforms await import(path) to
// Promise.resolve().then(() => require(path)), which hits the Jest module
// registry keyed on the RESOLVED absolute path of the source file.
//
// When the test file does a static import of those modules, TypeScript/Babel
// may resolve the path to a different registry key than what the source
// file's require() uses. jest.requireMock(path) resolves from the TEST
// file's location — giving the exact same key Jest used when registering
// the mock — guaranteeing the same instance.
//
// Using jest.requireMock() instead of a static import is the only safe
// approach when the mocked module is also lazy-imported by the source.

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

// Lazy-import mocks — must use jest.requireMock() to retrieve handles (see header)
jest.mock('../../services/followUpService', () => ({
  createFollowUpIfNeeded: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../repositories/ApprovalRepository', () => ({
  ApprovalRepository: { enqueue: jest.fn(() => Promise.resolve()) },
}));

// ─── module under test (imported AFTER all jest.mock declarations) ─────────────

import { InspectionRepository } from '../../repositories/InspectionRepository';
import { IntegrityService } from '../../services/IntegrityService';
import { AuditLogRepository } from '../../repositories/AuditLogRepository';
import { CorrectiveActionRepository } from '../../repositories/CorrectiveActionRepository';

// Typed handles — static imports safe here (no TDZ, factories already hoisted)
const mockComputeHash           = IntegrityService.computeHash           as jest.Mock;
const mockAuditAppend           = AuditLogRepository.append              as jest.Mock;
const mockCreateFromInspection  = CorrectiveActionRepository.createFromInspection as jest.Mock;

// Lazy-import handles — retrieved via requireMock to match the registry key
// the source file's await import() will resolve to at runtime.
const mockCreateFollowUp = (jest.requireMock('../../services/followUpService') as any).createFollowUpIfNeeded as jest.Mock;
const mockEnqueue        = (jest.requireMock('../../repositories/ApprovalRepository') as any).ApprovalRepository.enqueue as jest.Mock;

// ─── setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  (AsyncStorage as any).__resetStore();
  jest.clearAllMocks();
  // Re-apply implementations cleared by jest.clearAllMocks()
  mockCreateFollowUp.mockResolvedValue(undefined);
  mockEnqueue.mockResolvedValue(undefined);
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

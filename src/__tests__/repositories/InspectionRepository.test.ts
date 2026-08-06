// src/__tests__/repositories/InspectionRepository.test.ts
//
// WHY MOCK FACTORIES USE jest.fn() INLINE — NOT OUTER const REFS
// ───────────────────────────────────────────────────────────────
// Babel hoists jest.mock() to the top of the file before any const/let.
// Declaring jest.fn() outside the factory puts it in the Temporal Dead Zone
// when the factory runs — the factory receives undefined, not a jest.Mock.
// All jest.fn() calls must live INSIDE the factory.
// Handles are retrieved AFTER module load via static import or requireMock.
//
// WHY followUpService AND ApprovalRepository USE STATIC IMPORTS IN SOURCE
// ───────────────────────────────────────────────────────────────────────
// The source uses static top-level imports for these two modules. Jest
// intercepts static imports deterministically via its module registry.
//
// W1 REWRITE: Removed all AsyncStorage.setItem/getItem seeding/assertion
// patterns. InspectionRepository now writes ONLY to SQLite, so:
//   - Seeding uses InspectionRepository.save()
//   - Assertions use InspectionRepository.getAll() / getById()
//   - Corrupt-storage test removed (not meaningful with SQLite backend)
//   - 'draft' status test migrated to save() pattern
//   - deleteMany assertions rewritten to use getAll()
//
// Z13: removed jest.resetModules() from beforeEach.
//   jest.mock() factories execute at parse time and register mocks into the
//   module registry. Calling jest.resetModules() inside beforeEach tears the
//   registry down, so the next require/import of IntegrityService returns the
//   REAL module (which has no hashAndStore in the test environment) instead
//   of the mock. SQLiteMock.__resetAll() is sufficient to isolate tests.

import { SavedInspection } from '../../types';

// ─── mock factories — jest.fn() INSIDE the factory (never outside) ────────────

jest.mock('../../services/IntegrityService', () => ({
  IntegrityService: {
    computeHash:      jest.fn(() => 'mock-hash-abc123'),
    hashAndStore:     jest.fn(() => Promise.resolve('mock-hash-abc123')),
    verifyInspection: jest.fn(() => Promise.resolve({ ok: true, computedHash: 'mock-hash-abc123' })),
  },
}));

jest.mock('../../repositories/AuditLogRepository', () => ({
  AuditLogRepository: { append: jest.fn(() => Promise.resolve()) },
}));

jest.mock('../../services/capFactory', () => ({
  createCapItemsFromInspection: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../services/followUpService', () => ({
  createFollowUpIfNeeded: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../repositories/ApprovalRepository', () => ({
  ApprovalRepository: { enqueue: jest.fn(() => Promise.resolve()) },
}));

jest.mock('../../services/violationHistory', () => ({
  annotateRepeatViolations: jest.fn((_accessors: any, items: any) => Promise.resolve(items)),
}));

// ─── module under test (imported AFTER all jest.mock declarations) ─────────────

import { InspectionRepository } from '../../repositories/InspectionRepository';
import { IntegrityService } from '../../services/IntegrityService';
import { AuditLogRepository } from '../../repositories/AuditLogRepository';
import { createCapItemsFromInspection } from '../../services/capFactory';
import { createFollowUpIfNeeded } from '../../services/followUpService';
import { ApprovalRepository } from '../../repositories/ApprovalRepository';

// Typed handles — retrieved after module load, safe from TDZ.
const mockHashAndStore       = IntegrityService.hashAndStore           as jest.Mock;
const mockAuditAppend        = AuditLogRepository.append               as jest.Mock;
const mockCreateCapItems     = createCapItemsFromInspection            as jest.Mock;
const mockCreateFollowUp     = createFollowUpIfNeeded                  as jest.Mock;
const mockEnqueue            = ApprovalRepository.enqueue              as jest.Mock;

// ─── setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  // Reset the in-memory SQLite store between tests.
  const SQLiteMock = jest.requireMock('expo-sqlite') as any;
  if (typeof SQLiteMock.__resetAll === 'function') SQLiteMock.__resetAll();
  // NOTE: jest.resetModules() was intentionally removed here.
  // It would tear down the mock registry, causing subsequent requires of
  // IntegrityService to return the real module (no hashAndStore in tests).
  jest.clearAllMocks();
  // Re-apply Promise-returning implementations after clearAllMocks resets them.
  mockHashAndStore.mockResolvedValue('mock-hash-abc123');
  mockAuditAppend.mockResolvedValue(undefined);
  mockCreateCapItems.mockResolvedValue(undefined);
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

// ─── getAll ───────────────────────────────────────────────────────────────────

describe('InspectionRepository.getAll', () => {
  it('returns [] when storage is empty', async () => {
    expect(await InspectionRepository.getAll()).toEqual([]);
  });

  it('returns all stored inspections', async () => {
    await InspectionRepository.save(makeInspection());
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
    await InspectionRepository.save(makeInspection({ id: 'd1', status: 'draft' as any }));
    const result = await InspectionRepository.getDrafts();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('d1');
  });
});

// ─── save ─────────────────────────────────────────────────────────────────────

describe('InspectionRepository.save', () => {
  it('persists a new inspection', async () => {
    await InspectionRepository.save(makeInspection());
    const all = await InspectionRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('insp-1');
  });

  it('replaces an existing inspection with the same id', async () => {
    await InspectionRepository.save(makeInspection({ facilityName: 'Old Name' }));
    await InspectionRepository.save(makeInspection({ facilityName: 'New Name' }));
    const all = await InspectionRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].facilityName).toBe('New Name');
  });

  it('triggers AuditLog + capFactory on first completion', async () => {
    await InspectionRepository.save(makeInspection({ id: 'new-c', status: 'completed' }));
    expect(mockAuditAppend.mock.calls.some((c: any[]) => c[0] === 'INSPECTION_SAVED')).toBe(true);
    expect(mockCreateCapItems).toHaveBeenCalled();
  });

  it('calls followUpService and ApprovalRepository on completion', async () => {
    await InspectionRepository.save(makeInspection({ id: 'lazy-1', status: 'completed' }));
    expect(mockCreateFollowUp).toHaveBeenCalled();
    expect(mockEnqueue).toHaveBeenCalled();
  });

  it('does NOT trigger side-effects when saving an in-progress inspection', async () => {
    await InspectionRepository.save(makeInspection({ id: 'draft-x', status: 'in-progress' }));
    expect(mockAuditAppend).not.toHaveBeenCalled();
    expect(mockCreateCapItems).not.toHaveBeenCalled();
    expect(mockCreateFollowUp).not.toHaveBeenCalled();
    expect(mockEnqueue).not.toHaveBeenCalled();
  });

  it('embeds the computed hash on completion', async () => {
    await InspectionRepository.save(makeInspection({ id: 'h1', status: 'completed' }));
    expect(mockHashAndStore).toHaveBeenCalled();
    const saved = await InspectionRepository.getById('h1');
    expect(saved?.integrityHash).toBe('mock-hash-abc123');
  });

  it('does NOT trigger side-effects on re-save of already-completed inspection', async () => {
    await InspectionRepository.save(makeInspection({ id: 'rc-1', status: 'completed' }));
    jest.clearAllMocks();
    mockCreateCapItems.mockResolvedValue(undefined);
    mockAuditAppend.mockResolvedValue(undefined);
    await InspectionRepository.save(makeInspection({ id: 'rc-1', status: 'completed' }));
    expect(mockCreateCapItems).not.toHaveBeenCalled();
  });
});

// ─── delete ───────────────────────────────────────────────────────────────────

describe('InspectionRepository.delete', () => {
  it('removes the inspection by id', async () => {
    await InspectionRepository.save(makeInspection());
    await InspectionRepository.delete('insp-1');
    expect(await InspectionRepository.getAll()).toHaveLength(0);
  });

  it('is a no-op when id does not exist', async () => {
    await InspectionRepository.delete('nonexistent');
    expect(await InspectionRepository.getAll()).toHaveLength(0);
  });

  it('does NOT append audit log when deleting non-existent id', async () => {
    await InspectionRepository.delete('ghost-id');
    expect(mockAuditAppend).not.toHaveBeenCalledWith(
      'INSPECTION_DELETED',
      expect.anything(),
      expect.anything(),
    );
  });
});

// ─── deleteMany ───────────────────────────────────────────────────────────────

describe('InspectionRepository.deleteMany', () => {
  it('removes all inspections whose ids are in the list', async () => {
    await InspectionRepository.save(makeInspection({ id: 'a1', status: 'in-progress' }));
    await InspectionRepository.save(makeInspection({ id: 'a2', status: 'in-progress' }));
    await InspectionRepository.save(makeInspection({ id: 'a3', status: 'in-progress' }));
    await InspectionRepository.deleteMany(['a1', 'a3']);
    const all = await InspectionRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('a2');
  });

  it('appends a INSPECTION_BULK_DELETED audit entry', async () => {
    await InspectionRepository.deleteMany(['x1', 'x2']);
    expect(
      mockAuditAppend.mock.calls.some((c: any[]) => c[0] === 'INSPECTION_BULK_DELETED'),
    ).toBe(true);
  });

  it('is a no-op when the id list is empty', async () => {
    await InspectionRepository.save(makeInspection({ id: 'keep-1', status: 'in-progress' }));
    await InspectionRepository.deleteMany([]);
    expect(await InspectionRepository.getAll()).toHaveLength(1);
  });
});

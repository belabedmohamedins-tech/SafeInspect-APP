// __tests__/repositories/InspectionRepository.test.ts
import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import { StorageKeys } from '../../src/repositories/keys';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedInspection } from '../../src/types';

// ─── Mock AsyncStorage with an in-memory Map ──────────────────────────────────

const mockStore = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem:    jest.fn((key: string) => Promise.resolve(mockStore.get(key) ?? null)),
  setItem:    jest.fn((key: string, value: string) => { mockStore.set(key, value); return Promise.resolve(); }),
  removeItem: jest.fn((key: string) => { mockStore.delete(key); return Promise.resolve(); }),
}));

// ─── Mock IntegrityService ────────────────────────────────────────────────────

jest.mock('../../src/services/IntegrityService', () => ({
  IntegrityService: {
    computeHash:      jest.fn(() => 'mock-hash-abc123'),
    verifyInspection: jest.fn(() => true),
  },
}));

// ─── Mock AuditLogRepository ──────────────────────────────────────────────────

jest.mock('../../src/repositories/AuditLogRepository', () => ({
  AuditLogRepository: {
    append: jest.fn(() => Promise.resolve()),
  },
}));

// ─── Mock CorrectiveActionRepository ─────────────────────────────────────────

jest.mock('../../src/repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: {
    createFromInspection: jest.fn(() => Promise.resolve()),
  },
}));

// ─── Mock followUpService ─────────────────────────────────────────────────────

jest.mock('../../src/services/followUpService', () => ({
  createFollowUpIfNeeded: jest.fn(() => Promise.resolve()),
}));

// ─── Mock ApprovalRepository ──────────────────────────────────────────────────

jest.mock('../../src/repositories/ApprovalRepository', () => ({
  ApprovalRepository: {
    enqueue: jest.fn(() => Promise.resolve()),
  },
}));

// ─── Mock violationHistory ────────────────────────────────────────────────────

jest.mock('../../src/services/violationHistory', () => ({
  annotateRepeatViolations: jest.fn((_accessors: unknown, items: unknown[]) => Promise.resolve(items)),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeInspection(overrides: Partial<SavedInspection> & { id: string; status: SavedInspection['status'] }): SavedInspection {
  return {
    facilityId:      'FAC-01',
    facilityName:    'Test',
    facilityAddress: '123 Main St',
    date:            '2026-01-01T10:00:00.000Z',
    inspectorName:   'Inspector',
    items:           [],
    ...overrides,
  };
}

beforeEach(() => mockStore.clear());

// ─── getAll ───────────────────────────────────────────────────────────────────

describe('InspectionRepository.getAll', () => {
  it('returns empty array when storage is empty', async () => {
    expect(await InspectionRepository.getAll()).toEqual([]);
  });

  it('returns parsed inspections from storage', async () => {
    const data = [makeInspection({ id: '1', status: 'completed' })];
    mockStore.set(StorageKeys.INSPECTIONS, JSON.stringify(data));
    expect(await InspectionRepository.getAll()).toHaveLength(1);
  });

  it('returns empty array on JSON parse error (graceful)', async () => {
    mockStore.set(StorageKeys.INSPECTIONS, 'NOT_JSON');
    expect(await InspectionRepository.getAll()).toEqual([]);
  });
});

// ─── getCompleted ─────────────────────────────────────────────────────────────

describe('InspectionRepository.getCompleted', () => {
  it('returns only completed inspections', async () => {
    const data = [
      makeInspection({ id: '1', status: 'completed' }),
      makeInspection({ id: '2', status: 'in-progress' }),
      makeInspection({ id: '3', status: 'draft' }),
    ];
    mockStore.set(StorageKeys.INSPECTIONS, JSON.stringify(data));
    const result = await InspectionRepository.getCompleted();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });
});

// ─── getDrafts ────────────────────────────────────────────────────────────────

describe('InspectionRepository.getDrafts', () => {
  it('returns in-progress and draft inspections', async () => {
    const data = [
      makeInspection({ id: '1', status: 'completed' }),
      makeInspection({ id: '2', status: 'in-progress' }),
      makeInspection({ id: '3', status: 'draft' }),
    ];
    mockStore.set(StorageKeys.INSPECTIONS, JSON.stringify(data));
    const result = await InspectionRepository.getDrafts();
    expect(result).toHaveLength(2);
    expect(result.map(r => r.id)).toEqual(expect.arrayContaining(['2', '3']));
  });

  it('returns empty array when there are no drafts', async () => {
    const data = [makeInspection({ id: '1', status: 'completed' })];
    mockStore.set(StorageKeys.INSPECTIONS, JSON.stringify(data));
    expect(await InspectionRepository.getDrafts()).toEqual([]);
  });
});

// ─── getById ──────────────────────────────────────────────────────────────────

describe('InspectionRepository.getById', () => {
  it('returns the matching inspection', async () => {
    const data = [makeInspection({ id: 'abc', status: 'completed' })];
    mockStore.set(StorageKeys.INSPECTIONS, JSON.stringify(data));
    const result = await InspectionRepository.getById('abc');
    expect(result?.id).toBe('abc');
  });

  it('returns null when id is not found', async () => {
    expect(await InspectionRepository.getById('missing')).toBeNull();
  });
});

// ─── save ─────────────────────────────────────────────────────────────────────

describe('InspectionRepository.save', () => {
  it('inserts a new inspection', async () => {
    await InspectionRepository.save(makeInspection({ id: 'new', status: 'draft' }));
    const all = await InspectionRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('new');
  });

  it('updates an existing inspection in-place', async () => {
    await InspectionRepository.save(makeInspection({ id: 'x', status: 'draft' }));
    await InspectionRepository.save(makeInspection({ id: 'x', status: 'completed' }));
    const all = await InspectionRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].status).toBe('completed');
  });

  it('invalidates stats cache on save', async () => {
    mockStore.set(StorageKeys.STATS_CACHE, 'stale');
    await InspectionRepository.save(makeInspection({ id: 'y', status: 'completed' }));
    expect(mockStore.has(StorageKeys.STATS_CACHE)).toBe(false);
  });

  it('runs full completion path: annotates, hashes, audits, CAP, followUp, approval', async () => {
    // new completion — triggers full isNewCompletion path
    const insp = makeInspection({ id: 'comp-1', status: 'completed', approvalStatus: 'pending' });
    await InspectionRepository.save(insp);
    const all = await InspectionRepository.getAll();
    expect(all[0].integrityHash).toBe('mock-hash-abc123');
    expect(all[0].approvalStatus).toBe('pending');
  });

  it('handles annotateRepeatViolations failure gracefully', async () => {
    const { annotateRepeatViolations } = require('../../src/services/violationHistory');
    (annotateRepeatViolations as jest.Mock).mockRejectedValueOnce(new Error('annotate fail'));
    const insp = makeInspection({ id: 'comp-2', status: 'completed' });
    // should not throw — catch block swallows the error
    await expect(InspectionRepository.save(insp)).resolves.toBeUndefined();
    // restore
    (annotateRepeatViolations as jest.Mock).mockImplementation((_a: unknown, items: unknown[]) => Promise.resolve(items));
  });
});

// ─── delete ───────────────────────────────────────────────────────────────────

describe('InspectionRepository.delete', () => {
  it('removes the inspection with the given id', async () => {
    const data = [
      makeInspection({ id: '1', status: 'completed' }),
      makeInspection({ id: '2', status: 'completed' }),
    ];
    mockStore.set(StorageKeys.INSPECTIONS, JSON.stringify(data));
    await InspectionRepository.delete('1');
    const all = await InspectionRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('2');
  });

  it('is a no-op for an unknown id', async () => {
    const data = [makeInspection({ id: '1', status: 'completed' })];
    mockStore.set(StorageKeys.INSPECTIONS, JSON.stringify(data));
    await InspectionRepository.delete('missing');
    expect(await InspectionRepository.getAll()).toHaveLength(1);
  });
});

// ─── deleteMany ───────────────────────────────────────────────────────────────

describe('InspectionRepository.deleteMany', () => {
  it('removes all inspections whose ids are in the set', async () => {
    const data = [
      makeInspection({ id: '1', status: 'completed' }),
      makeInspection({ id: '2', status: 'completed' }),
      makeInspection({ id: '3', status: 'completed' }),
    ];
    mockStore.set(StorageKeys.INSPECTIONS, JSON.stringify(data));
    await InspectionRepository.deleteMany(['1', '3']);
    const all = await InspectionRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('2');
  });

  it('handles empty ids array gracefully', async () => {
    const data = [makeInspection({ id: '1', status: 'completed' })];
    mockStore.set(StorageKeys.INSPECTIONS, JSON.stringify(data));
    await InspectionRepository.deleteMany([]);
    expect(await InspectionRepository.getAll()).toHaveLength(1);
  });
});

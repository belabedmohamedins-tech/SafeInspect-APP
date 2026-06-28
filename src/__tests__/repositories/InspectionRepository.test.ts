// src/__tests__/repositories/InspectionRepository.test.ts
//
// Layer-2 contract: @react-native-async-storage/async-storage is mocked
// globally via moduleNameMapper. Do NOT add an inline jest.mock() factory
// for it here. Use AsyncStorage.__resetStore() in beforeEach.

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../services/IntegrityService', () => ({
  IntegrityService: {
    computeHash:      jest.fn(() => 'mock-hash-abc123'),
    verifyInspection: jest.fn(() => true),
  },
}));

jest.mock('../repositories/AuditLogRepository', () => ({
  AuditLogRepository: {
    append: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('../repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: {
    createFromInspection: jest.fn(() => Promise.resolve()),
  },
}));

// ─── Imports ──────────────────────────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';
import { InspectionRepository } from '../repositories/InspectionRepository';
import { StorageKeys }          from '../repositories/keys';
import { SavedInspection }      from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeInspection(
  overrides: Partial<SavedInspection> & { id: string; status: SavedInspection['status'] },
): SavedInspection {
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

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  (AsyncStorage as any).__resetStore();
});

// ─── getAll ───────────────────────────────────────────────────────────────────

describe('InspectionRepository.getAll', () => {
  it('returns empty array when storage is empty', async () => {
    expect(await InspectionRepository.getAll()).toEqual([]);
  });

  it('returns parsed inspections from storage', async () => {
    const data = [makeInspection({ id: '1', status: 'completed' })];
    await (AsyncStorage as any).setItem(StorageKeys.INSPECTIONS, JSON.stringify(data));
    expect(await InspectionRepository.getAll()).toHaveLength(1);
  });

  it('returns empty array on JSON parse error (graceful)', async () => {
    await (AsyncStorage as any).setItem(StorageKeys.INSPECTIONS, 'NOT_JSON');
    expect(await InspectionRepository.getAll()).toEqual([]);
  });
});

// ─── getCompleted ──────────────────────────────────────────────────────────────

describe('InspectionRepository.getCompleted', () => {
  it('returns only completed inspections', async () => {
    const data = [
      makeInspection({ id: '1', status: 'completed' }),
      makeInspection({ id: '2', status: 'in-progress' }),
      makeInspection({ id: '3', status: 'draft' }),
    ];
    await (AsyncStorage as any).setItem(StorageKeys.INSPECTIONS, JSON.stringify(data));
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
    await (AsyncStorage as any).setItem(StorageKeys.INSPECTIONS, JSON.stringify(data));
    const result = await InspectionRepository.getDrafts();
    expect(result).toHaveLength(2);
    expect(result.map(r => r.id)).toEqual(expect.arrayContaining(['2', '3']));
  });

  it('returns empty array when there are no drafts', async () => {
    const data = [makeInspection({ id: '1', status: 'completed' })];
    await (AsyncStorage as any).setItem(StorageKeys.INSPECTIONS, JSON.stringify(data));
    expect(await InspectionRepository.getDrafts()).toEqual([]);
  });
});

// ─── getById ──────────────────────────────────────────────────────────────────

describe('InspectionRepository.getById', () => {
  it('returns the matching inspection', async () => {
    const data = [makeInspection({ id: 'abc', status: 'completed' })];
    await (AsyncStorage as any).setItem(StorageKeys.INSPECTIONS, JSON.stringify(data));
    expect((await InspectionRepository.getById('abc'))?.id).toBe('abc');
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
    await (AsyncStorage as any).setItem(StorageKeys.STATS_CACHE, 'stale');
    await InspectionRepository.save(makeInspection({ id: 'y', status: 'completed' }));
    expect(
      await (AsyncStorage as any).getItem(StorageKeys.STATS_CACHE),
    ).toBeNull();
  });
});

// ─── delete ───────────────────────────────────────────────────────────────────

describe('InspectionRepository.delete', () => {
  it('removes the inspection with the given id', async () => {
    const data = [
      makeInspection({ id: '1', status: 'completed' }),
      makeInspection({ id: '2', status: 'completed' }),
    ];
    await (AsyncStorage as any).setItem(StorageKeys.INSPECTIONS, JSON.stringify(data));
    await InspectionRepository.delete('1');
    const all = await InspectionRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('2');
  });

  it('is a no-op for an unknown id', async () => {
    const data = [makeInspection({ id: '1', status: 'completed' })];
    await (AsyncStorage as any).setItem(StorageKeys.INSPECTIONS, JSON.stringify(data));
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
    await (AsyncStorage as any).setItem(StorageKeys.INSPECTIONS, JSON.stringify(data));
    await InspectionRepository.deleteMany(['1', '3']);
    const all = await InspectionRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('2');
  });

  it('handles empty ids array gracefully', async () => {
    const data = [makeInspection({ id: '1', status: 'completed' })];
    await (AsyncStorage as any).setItem(StorageKeys.INSPECTIONS, JSON.stringify(data));
    await InspectionRepository.deleteMany([]);
    expect(await InspectionRepository.getAll()).toHaveLength(1);
  });
});

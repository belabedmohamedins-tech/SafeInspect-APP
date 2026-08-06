/**
 * __tests__/repositories/CorrectiveActionRepository.test.ts
 * Contract tests for CorrectiveActionRepository — SQLite contract.
 * Fixture aligned with CorrectiveAction shape in src/types.ts.
 */
import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';
import type { CorrectiveAction } from '../../src/types';

const SQLite = require('expo-sqlite');

const makeAction = (overrides: Partial<Omit<CorrectiveAction, 'id' | 'createdAt' | 'updatedAt'>> = {}) =>
  ({
    inspectionId: 'insp-1',
    inspectionItemId: 'item-1',
    facilityId: 'fac-1',
    facilityName: 'Test Facility',
    criteria: 'Test criterion',
    severity: 'high' as const,
    deadline: '2026-12-01',
    assignedTo: 'Ahmed',
    status: 'open' as const,
    ...overrides,
  } as Omit<CorrectiveAction, 'id' | 'createdAt' | 'updatedAt'>);

beforeEach(() => {
  SQLite.__resetAll();
});

describe('CorrectiveActionRepository.getAll', () => {
  it('returns empty array when no items', async () => {
    expect(await CorrectiveActionRepository.getAll()).toEqual([]);
  });

  it('returns all stored corrective actions', async () => {
    await CorrectiveActionRepository.add(makeAction());
    await CorrectiveActionRepository.add(makeAction({ inspectionItemId: 'item-2' }));
    expect(await CorrectiveActionRepository.getAll()).toHaveLength(2);
  });
});

describe('CorrectiveActionRepository.getByInspection', () => {
  it('filters by inspectionId', async () => {
    await CorrectiveActionRepository.add(makeAction({ inspectionId: 'insp-A' }));
    await CorrectiveActionRepository.add(makeAction({ inspectionId: 'insp-A', inspectionItemId: 'item-2' }));
    await CorrectiveActionRepository.add(makeAction({ inspectionId: 'insp-B' }));
    const result = await CorrectiveActionRepository.getByInspection('insp-A');
    expect(result).toHaveLength(2);
  });

  it('returns empty for unknown inspectionId', async () => {
    expect(await CorrectiveActionRepository.getByInspection('no-such')).toEqual([]);
  });
});

describe('CorrectiveActionRepository.add', () => {
  it('creates a new corrective action with generated id', async () => {
    await CorrectiveActionRepository.add(makeAction());
    const all = await CorrectiveActionRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBeDefined();
  });
});

describe('CorrectiveActionRepository.updateStatus', () => {
  it('updates the status of an existing action', async () => {
    await CorrectiveActionRepository.add(makeAction());
    const all = await CorrectiveActionRepository.getAll();
    const id = all[0].id;
    await CorrectiveActionRepository.updateStatus(id, 'resolved');
    const updated = await CorrectiveActionRepository.getAll();
    expect(updated[0].status).toBe('resolved');
  });
});

describe('CorrectiveActionRepository.delete', () => {
  it('removes the item', async () => {
    await CorrectiveActionRepository.add(makeAction());
    const all = await CorrectiveActionRepository.getAll();
    const id = all[0].id;
    await CorrectiveActionRepository.delete(id);
    expect(await CorrectiveActionRepository.getAll()).toHaveLength(0);
  });
});

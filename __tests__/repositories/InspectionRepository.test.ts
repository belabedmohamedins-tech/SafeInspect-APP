/**
 * __tests__/repositories/InspectionRepository.test.ts
 * Contract tests for InspectionRepository — SQLite contract.
 * Fixture aligned with SavedInspection shape in src/types.ts.
 */
import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import type { SavedInspection } from '../../src/types';

const SQLite = require('expo-sqlite');

const baseInspection: SavedInspection = {
  id: 'insp-1',
  facilityId: 'fac-1',
  facilityName: 'Test Facility',
  facilityAddress: '123 Main St',
  date: '2026-09-01',
  inspectorName: 'Ahmed',
  status: 'completed',
  items: [],
};

const makeInspection = (overrides: Partial<SavedInspection> = {}): SavedInspection => ({
  ...baseInspection,
  ...overrides,
});

beforeEach(() => {
  SQLite.__resetAll();
});

describe('InspectionRepository.getAll', () => {
  it('returns empty array when no items', async () => {
    expect(await InspectionRepository.getAll()).toEqual([]);
  });

  it('returns all stored inspections', async () => {
    await InspectionRepository.save(makeInspection({ id: 'i1' }));
    await InspectionRepository.save(makeInspection({ id: 'i2' }));
    expect(await InspectionRepository.getAll()).toHaveLength(2);
  });
});

describe('InspectionRepository.getById', () => {
  it('returns null when not found', async () => {
    expect(await InspectionRepository.getById('missing')).toBeNull();
  });

  it('returns the matching inspection', async () => {
    await InspectionRepository.save(makeInspection({ id: 'abc' }));
    const result = await InspectionRepository.getById('abc');
    expect(result?.id).toBe('abc');
  });
});

describe('InspectionRepository.save', () => {
  it('persists a new inspection', async () => {
    await InspectionRepository.save(makeInspection({ id: 'new-1' }));
    expect(await InspectionRepository.getAll()).toHaveLength(1);
  });

  it('upserts (replaces) existing inspection with same id', async () => {
    await InspectionRepository.save(makeInspection({ id: 'u1', inspectorName: 'Old' }));
    await InspectionRepository.save(makeInspection({ id: 'u1', inspectorName: 'New' }));
    const all = await InspectionRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].inspectorName).toBe('New');
  });
});

describe('InspectionRepository.delete', () => {
  it('removes the inspection', async () => {
    await InspectionRepository.save(makeInspection({ id: 'i1' }));
    await InspectionRepository.save(makeInspection({ id: 'i2' }));
    await InspectionRepository.delete('i1');
    expect(await InspectionRepository.getAll()).toHaveLength(1);
  });
});

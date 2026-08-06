/**
 * __tests__/repositories/FacilityRepository.test.ts
 * Contract tests for FacilityRepository — SQLite contract.
 * Fixture aligned with Facility shape in src/types.ts.
 * API: add(), update(), remove(), getAll(), getById(), clear()
 */
import { FacilityRepository } from '../../src/repositories/FacilityRepository';
import type { Facility } from '../../src/types';

const SQLite = require('expo-sqlite');

const makeFacility = (overrides: Partial<Omit<Facility, 'id'>> = {}) =>
  ({
    projectName: 'Test Project',
    ownerName: 'Owner',
    activity: 'Restaurant',
    address: '123 Main St',
    ...overrides,
  } as Omit<Facility, 'id'>);

beforeEach(() => {
  SQLite.__resetAll();
});

describe('FacilityRepository.getAll', () => {
  it('returns empty array when no items', async () => {
    expect(await FacilityRepository.getAll()).toEqual([]);
  });

  it('returns all stored facilities', async () => {
    await FacilityRepository.add(makeFacility());
    await FacilityRepository.add(makeFacility({ activity: 'Bakery' }));
    expect(await FacilityRepository.getAll()).toHaveLength(2);
  });

  it('returns empty array on empty DB', async () => {
    const all = await FacilityRepository.getAll();
    expect(Array.isArray(all)).toBe(true);
  });
});

describe('FacilityRepository.getById', () => {
  it('returns null when not found', async () => {
    expect(await FacilityRepository.getById('missing')).toBeNull();
  });

  it('returns the matching facility', async () => {
    await FacilityRepository.add(makeFacility());
    const all = await FacilityRepository.getAll();
    const id = all[0].id;
    const result = await FacilityRepository.getById(id);
    expect(result?.id).toBe(id);
  });
});

describe('FacilityRepository.add + update', () => {
  it('upserts: add then update', async () => {
    await FacilityRepository.add(makeFacility({ projectName: 'Old' }));
    const all = await FacilityRepository.getAll();
    const id = all[0].id;
    await FacilityRepository.update(id, { projectName: 'New' });
    const updated = await FacilityRepository.getAll();
    expect(updated).toHaveLength(1);
    expect(updated[0].projectName).toBe('New');
  });
});

describe('FacilityRepository.remove', () => {
  it('removes the facility with the given id', async () => {
    await FacilityRepository.add(makeFacility());
    await FacilityRepository.add(makeFacility({ activity: 'Bakery' }));
    const all = await FacilityRepository.getAll();
    await FacilityRepository.remove(all[0].id);
    expect(await FacilityRepository.getAll()).toHaveLength(1);
  });

  it('is a no-op for an unknown id', async () => {
    await FacilityRepository.add(makeFacility());
    await FacilityRepository.remove('no-such');
    expect(await FacilityRepository.getAll()).toHaveLength(1);
  });
});

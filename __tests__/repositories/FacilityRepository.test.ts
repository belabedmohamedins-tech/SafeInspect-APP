/**
 * __tests__/repositories/FacilityRepository.test.ts
 * Contract tests for FacilityRepository — SQLite contract (rewritten).
 */
import { FacilityRepository } from '../../src/repositories/FacilityRepository';

const SQLite = require('expo-sqlite');

const makeFacility = (overrides: Record<string, unknown> = {}) => ({
  id: 'fac-1',
  name: 'Test Facility',
  type: 'restaurant',
  wilaya: 'Alger',
  commune: 'Bab El Oued',
  address: '1 Rue Test',
  status: 'active',
  ...overrides,
});

beforeEach(() => {
  SQLite.__resetAll();
});

describe('FacilityRepository.getAll', () => {
  it('returns empty array when no facilities', async () => {
    expect(await FacilityRepository.getAll()).toEqual([]);
  });

  it('returns all stored facilities', async () => {
    await FacilityRepository.save(makeFacility({ id: '1' }));
    await FacilityRepository.save(makeFacility({ id: '2' }));
    expect(await FacilityRepository.getAll()).toHaveLength(2);
  });
});

describe('FacilityRepository.getById', () => {
  it('returns null when not found', async () => {
    expect(await FacilityRepository.getById('missing')).toBeNull();
  });

  it('returns the matching facility', async () => {
    await FacilityRepository.save(makeFacility({ id: 'abc' }));
    const result = await FacilityRepository.getById('abc');
    expect(result?.id).toBe('abc');
  });
});

describe('FacilityRepository.save', () => {
  it('persists a new facility', async () => {
    await FacilityRepository.save(makeFacility());
    expect(await FacilityRepository.getAll()).toHaveLength(1);
  });

  it('upserts existing facility with same id', async () => {
    await FacilityRepository.save(makeFacility({ id: 'upsert-1', name: 'Old' }));
    await FacilityRepository.save(makeFacility({ id: 'upsert-1', name: 'New' }));
    const all = await FacilityRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe('New');
  });
});

describe('FacilityRepository.delete', () => {
  it('removes the facility with the given id', async () => {
    await FacilityRepository.save(makeFacility({ id: '1' }));
    await FacilityRepository.save(makeFacility({ id: '2' }));
    await FacilityRepository.delete('1');
    const all = await FacilityRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('2');
  });
});

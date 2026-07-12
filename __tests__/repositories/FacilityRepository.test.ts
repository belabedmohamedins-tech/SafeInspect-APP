// __tests__/repositories/FacilityRepository.test.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FacilityRepository } from '../../src/repositories/FacilityRepository';

beforeEach(() => {
  AsyncStorage.clear();
});

const facilityData = { name: 'Factory A', type: 'industrial' as const, city: 'Algiers', region: 'North' };

describe('FacilityRepository.getAll', () => {
  it('returns empty array when nothing stored', async () => {
    expect(await FacilityRepository.getAll()).toEqual([]);
  });

  it('returns stored facilities', async () => {
    const f = await FacilityRepository.add(facilityData);
    const all = await FacilityRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(f.id);
  });
});

describe('FacilityRepository.getById', () => {
  it('returns null for unknown id', async () => {
    expect(await FacilityRepository.getById('NOPE')).toBeNull();
  });

  it('returns correct facility', async () => {
    const f = await FacilityRepository.add(facilityData);
    const found = await FacilityRepository.getById(f.id);
    expect(found?.id).toBe(f.id);
  });
});

describe('FacilityRepository.add', () => {
  it('generates a U-prefixed id', async () => {
    const f = await FacilityRepository.add(facilityData);
    expect(f.id).toMatch(/^U/);
  });

  it('sanitizes valid lat/lng', async () => {
    const f = await FacilityRepository.add({ ...facilityData, lat: 36.7, lng: 3.0 });
    expect(f.lat).toBe(36.7);
    expect(f.lng).toBe(3.0);
  });

  it('rejects out-of-range lat', async () => {
    const f = await FacilityRepository.add({ ...facilityData, lat: 200 });
    expect(f.lat).toBeUndefined();
  });

  it('rejects out-of-range lng', async () => {
    const f = await FacilityRepository.add({ ...facilityData, lng: 999 });
    expect(f.lng).toBeUndefined();
  });

  it('coerces string lat/lng to numbers', async () => {
    const f = await FacilityRepository.add({ ...facilityData, lat: '36.5' as any, lng: '2.9' as any });
    expect(f.lat).toBe(36.5);
    expect(f.lng).toBe(2.9);
  });

  it('returns undefined for empty string coord', async () => {
    const f = await FacilityRepository.add({ ...facilityData, lat: '' as any });
    expect(f.lat).toBeUndefined();
  });

  it('returns undefined for NaN coord', async () => {
    const f = await FacilityRepository.add({ ...facilityData, lat: NaN });
    expect(f.lat).toBeUndefined();
  });
});

describe('FacilityRepository.update', () => {
  it('returns null for unknown id', async () => {
    expect(await FacilityRepository.update('NOPE', { name: 'X' })).toBeNull();
  });

  it('merges updatedData', async () => {
    const f = await FacilityRepository.add(facilityData);
    const updated = await FacilityRepository.update(f.id, { name: 'Factory B' });
    expect(updated?.name).toBe('Factory B');
  });

  it('sanitizes lat/lng on update', async () => {
    const f = await FacilityRepository.add(facilityData);
    const updated = await FacilityRepository.update(f.id, { lat: -91 });
    expect(updated?.lat).toBeUndefined();
  });
});

describe('FacilityRepository.remove', () => {
  it('returns false for unknown id', async () => {
    expect(await FacilityRepository.remove('NOPE')).toBe(false);
  });

  it('removes and returns true', async () => {
    const f = await FacilityRepository.add(facilityData);
    expect(await FacilityRepository.remove(f.id)).toBe(true);
    expect(await FacilityRepository.getById(f.id)).toBeNull();
  });
});

describe('FacilityRepository.clear', () => {
  it('removes all facilities', async () => {
    await FacilityRepository.add(facilityData);
    await FacilityRepository.clear();
    expect(await FacilityRepository.getAll()).toEqual([]);
  });
});

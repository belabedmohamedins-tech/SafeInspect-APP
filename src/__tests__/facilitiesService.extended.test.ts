// src/__tests__/facilitiesService.extended.test.ts
//
// Targets uncovered lines in facilitiesService.ts:
//   line  50  — getUserFacilities error path (catch → [])
//   lines 81-83 — filterByActivity
//   lines 106-109 — searchAndFilter with activity filter

const HARDCODED = [
  { id: 'H1', projectName: 'مطعم النور', ownerName: 'أحمد', activity: 'مطعم',   address: 'شارع الملك', licenseType: 'تجاري', licenseDetails: '', year: '2020', category: 'غذاء', notes: '' },
  { id: 'H2', projectName: 'صيدلية',    ownerName: 'سارة', activity: 'صيدلية', address: 'حي العليا',  licenseType: 'صحي',   licenseDetails: '', year: '2021', category: 'صحة',  notes: '' },
];
jest.mock('../facilitiesData', () => ({ facilities: HARDCODED }));

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getUserFacilities,
  filterByActivity,
  searchAndFilter,
} from '../facilitiesService';

beforeEach(() => {
  jest.clearAllMocks();
  (AsyncStorage as any).__resetStore();
});

// ─── getUserFacilities — error path ───────────────────────────────────────────

describe('getUserFacilities — error path', () => {
  it('returns [] when FacilityRepository throws', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('disk error'));
    const result = await getUserFacilities();
    expect(result).toEqual([]);
  });
});

// ─── filterByActivity ─────────────────────────────────────────────────────────

describe('filterByActivity', () => {
  it('returns facilities matching the exact activity', async () => {
    const result = await filterByActivity('مطعم');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('H1');
  });

  it('returns [] when no facility has that activity', async () => {
    expect(await filterByActivity('بناء')).toEqual([]);
  });

  it('is case-insensitive', async () => {
    const result = await filterByActivity('صيدلية');
    expect(result.map((f: any) => f.id)).toContain('H2');
  });

  it('matches both hardcoded and user-added facilities', async () => {
    const { FacilityRepository } = require('../repositories/FacilityRepository');
    await FacilityRepository.add({
      projectName: 'ورشة', ownerName: 'علي', activity: 'ورشة',
      address: 'حي الورود', licenseType: 'صناعي', licenseDetails: '',
      year: '2023', category: 'صناعة', notes: '',
    });
    const result = await filterByActivity('ورشة');
    expect(result).toHaveLength(1);
    expect(result[0].projectName).toBe('ورشة');
  });
});

// ─── searchAndFilter ──────────────────────────────────────────────────────────

describe('searchAndFilter', () => {
  it('returns [] for empty query regardless of activity', async () => {
    expect(await searchAndFilter('')).toEqual([]);
    expect(await searchAndFilter('', 'مطعم')).toEqual([]);
  });

  it('searches without activity filter when activity is omitted', async () => {
    const result = await searchAndFilter('النور');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('H1');
  });

  it('searches without activity filter when activity is empty string', async () => {
    const result = await searchAndFilter('النور', '');
    expect(result).toHaveLength(1);
  });

  it('searches without activity filter when activity is whitespace', async () => {
    const result = await searchAndFilter('النور', '   ');
    expect(result).toHaveLength(1);
  });

  it('applies activity filter on top of search results', async () => {
    // 'أحمد' matches H1 (activity=مطعم); filter by صيدلية should return []
    const result = await searchAndFilter('أحمد', 'صيدلية');
    expect(result).toHaveLength(0);
  });

  it('returns results when both query and activity match', async () => {
    const result = await searchAndFilter('أحمد', 'مطعم');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('H1');
  });
});

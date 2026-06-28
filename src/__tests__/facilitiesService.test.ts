// src/__tests__/facilitiesService.test.ts
//
// Migrated from __tests__/facilitiesService.test.ts.
// Layer-2 contract: AsyncStorage is mocked globally. Do NOT add inline factory.
// Use AsyncStorage.__resetStore() in beforeEach.

// ─── Mocks ────────────────────────────────────────────────────────────────────

const HARDCODED = [
  { id: 'H1', projectName: 'مطعم النور',    ownerName: 'أحمد', activity: 'مطعم',    address: 'شارع الملك', licenseType: 'تجاري', licenseDetails: '', year: '2020', category: 'غذاء', notes: '' },
  { id: 'H2', projectName: 'صيدلية الشفاء', ownerName: 'سارة', activity: 'صيدلية',  address: 'حي العليا',  licenseType: 'صحي',   licenseDetails: '', year: '2021', category: 'صحة',  notes: '' },
];

jest.mock('../facilitiesData', () => ({ facilities: HARDCODED }));

// ─── Imports ──────────────────────────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../repositories/keys';
import {
  getAllFacilities,
  getUserFacilities,
  getFacilityById,
  addUserFacility,
  updateUserFacility,
  deleteUserFacility,
  clearAllUserFacilities,
  searchFacilities,
  filterFacilitiesByCategory,
} from '../facilitiesService';
import { Facility } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeUserFacility(overrides: Partial<Facility> = {}): Omit<Facility, 'id'> {
  return {
    projectName:    'بقالة التقوى',
    ownerName:      'محمد',
    activity:       'بقالة',
    address:        'حي الروضة',
    licenseType:    'تجاري',
    licenseDetails: '',
    year:           '2022',
    category:       'غذاء',
    notes:          '',
    ...overrides,
  };
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  (AsyncStorage as any).__resetStore();
});

// ─── getAllFacilities ─────────────────────────────────────────────────────────

describe('getAllFacilities', () => {
  it('returns only hardcoded facilities when user list is empty', async () => {
    const all = await getAllFacilities();
    expect(all).toHaveLength(2);
    expect(all[0].id).toBe('H1');
  });

  it('appends user facilities after hardcoded ones', async () => {
    await (AsyncStorage as any).setItem(
      StorageKeys.USER_FACILITIES,
      JSON.stringify([{ ...makeUserFacility(), id: 'U1' }]),
    );
    const all = await getAllFacilities();
    expect(all).toHaveLength(3);
    expect(all[2].id).toBe('U1');
  });

  it('returns hardcoded list when stored JSON is corrupt (graceful)', async () => {
    await (AsyncStorage as any).setItem(StorageKeys.USER_FACILITIES, 'NOT_JSON');
    expect(await getAllFacilities()).toHaveLength(2);
  });
});

// ─── getUserFacilities ────────────────────────────────────────────────────────

describe('getUserFacilities', () => {
  it('returns empty array when there are no user facilities', async () => {
    expect(await getUserFacilities()).toEqual([]);
  });

  it('returns only user-added facilities', async () => {
    await (AsyncStorage as any).setItem(
      StorageKeys.USER_FACILITIES,
      JSON.stringify([{ ...makeUserFacility(), id: 'U1' }]),
    );
    const result = await getUserFacilities();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('U1');
  });
});

// ─── getFacilityById ──────────────────────────────────────────────────────────

describe('getFacilityById', () => {
  it('finds a hardcoded facility', async () => {
    expect((await getFacilityById('H1'))?.id).toBe('H1');
  });

  it('finds a user-added facility', async () => {
    await (AsyncStorage as any).setItem(
      StorageKeys.USER_FACILITIES,
      JSON.stringify([{ ...makeUserFacility(), id: 'U99' }]),
    );
    expect((await getFacilityById('U99'))?.id).toBe('U99');
  });

  it('returns null for an unknown id', async () => {
    expect(await getFacilityById('GHOST')).toBeNull();
  });
});

// ─── addUserFacility ──────────────────────────────────────────────────────────

describe('addUserFacility', () => {
  it('saves the facility and returns it with a generated id', async () => {
    const saved = await addUserFacility(makeUserFacility());
    expect(saved.id).toMatch(/^U\d+/);
    expect(saved.projectName).toBe('بقالة التقوى');
  });

  it('appends without overwriting existing user facilities', async () => {
    await addUserFacility(makeUserFacility());
    await addUserFacility(makeUserFacility({ projectName: 'ثاني' }));
    expect(await getUserFacilities()).toHaveLength(2);
  });

  it('each call generates a unique id', async () => {
    const a = await addUserFacility(makeUserFacility());
    const b = await addUserFacility(makeUserFacility());
    expect(a.id).not.toBe(b.id);
  });
});

// ─── updateUserFacility ───────────────────────────────────────────────────────

describe('updateUserFacility', () => {
  it('updates specified fields and returns true', async () => {
    const saved = await addUserFacility(makeUserFacility());
    expect(await updateUserFacility(saved.id, { notes: 'ملاحظة جديدة' })).toBe(true);
    expect((await getFacilityById(saved.id))?.notes).toBe('ملاحظة جديدة');
  });

  it('returns false for a hardcoded facility id', async () => {
    expect(await updateUserFacility('H1', { notes: 'hack' })).toBe(false);
  });

  it('returns false for an unknown id', async () => {
    expect(await updateUserFacility('GHOST', { notes: 'x' })).toBe(false);
  });

  it('does not affect other facilities', async () => {
    const a = await addUserFacility(makeUserFacility({ projectName: 'A' }));
    const b = await addUserFacility(makeUserFacility({ projectName: 'B' }));
    await updateUserFacility(a.id, { notes: 'changed' });
    expect((await getFacilityById(b.id))?.notes).toBe('');
  });
});

// ─── deleteUserFacility ───────────────────────────────────────────────────────

describe('deleteUserFacility', () => {
  it('removes the facility and returns true', async () => {
    const saved = await addUserFacility(makeUserFacility());
    expect(await deleteUserFacility(saved.id)).toBe(true);
    expect(await getFacilityById(saved.id)).toBeNull();
  });

  it('returns false for an unknown id', async () => {
    expect(await deleteUserFacility('GHOST')).toBe(false);
  });

  it('returns false for a hardcoded facility id', async () => {
    expect(await deleteUserFacility('H1')).toBe(false);
  });
});

// ─── clearAllUserFacilities ───────────────────────────────────────────────────

describe('clearAllUserFacilities', () => {
  it('removes all user facilities from storage', async () => {
    await addUserFacility(makeUserFacility());
    await addUserFacility(makeUserFacility());
    await clearAllUserFacilities();
    expect(await getUserFacilities()).toEqual([]);
  });
});

// ─── searchFacilities ─────────────────────────────────────────────────────────

describe('searchFacilities', () => {
  it('returns [] for empty query',             async () => expect(await searchFacilities('')).toEqual([]));
  it('returns [] for whitespace-only query',   async () => expect(await searchFacilities('   ')).toEqual([]));

  it('finds a hardcoded facility by projectName', async () => {
    const results = await searchFacilities('النور');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('H1');
  });

  it('finds by activity field', async () => {
    expect((await searchFacilities('صيدلية')).map(r => r.id)).toContain('H2');
  });

  it('finds a user-added facility', async () => {
    await addUserFacility(makeUserFacility({ projectName: 'مستودع الأمل' }));
    const results = await searchFacilities('الأمل');
    expect(results[0].projectName).toBe('مستودع الأمل');
  });

  it('is case-insensitive for Latin characters', async () => {
    await addUserFacility(makeUserFacility({ projectName: 'Clinic Alpha' }));
    expect((await searchFacilities('clinic')).length).toBeGreaterThan(0);
  });

  it('returns [] when no facility matches', async () => {
    expect(await searchFacilities('xyznotfound')).toEqual([]);
  });
});

// ─── filterFacilitiesByCategory ───────────────────────────────────────────────

describe('filterFacilitiesByCategory', () => {
  it('returns all facilities for empty category string', async () => {
    expect(await filterFacilitiesByCategory('')).toHaveLength(2);
  });

  it('filters by category correctly', async () => {
    const health = await filterFacilitiesByCategory('صحة');
    expect(health).toHaveLength(1);
    expect(health[0].id).toBe('H2');
  });

  it('includes user-added facilities in filter results', async () => {
    await addUserFacility(makeUserFacility({ category: 'صحة' }));
    expect(await filterFacilitiesByCategory('صحة')).toHaveLength(2);
  });

  it('returns [] when no facility matches the category', async () => {
    expect(await filterFacilitiesByCategory('نقل')).toEqual([]);
  });
});

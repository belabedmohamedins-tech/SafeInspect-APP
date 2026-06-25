/**
 * Integration tests for src/facilitiesService.ts
 *
 * Strategy: use an in-memory Map as the AsyncStorage backing store so every
 * test is fully isolated and deterministic without any real I/O.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    addUserFacility,
    clearAllUserFacilities,
    deleteUserFacility,
    filterFacilitiesByCategory,
    getAllFacilities,
    getFacilityById,
    getUserFacilities,
    searchFacilities,
    updateUserFacility,
} from '../facilitiesService';
import { facilities as hardcodedFacilities } from '../facilitiesData';
import { StorageKeys } from '../repositories/keys';
import { Facility } from '../types';

// ---- AsyncStorage mock -------------------------------------------------------

const store = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem:    jest.fn((key: string)          => Promise.resolve(store.get(key) ?? null)),
  setItem:    jest.fn((key: string, val: string) => { store.set(key, val); return Promise.resolve(); }),
  removeItem: jest.fn((key: string)          => { store.delete(key); return Promise.resolve(); }),
}));

beforeEach(() => store.clear());

// ---- Helpers -----------------------------------------------------------------

const USER_KEY = StorageKeys.USER_FACILITIES;

const makeUserFacility = (overrides: Partial<Facility> = {}): Omit<Facility, 'id'> => ({
  projectName:    'مطعم الأمل',
  ownerName:      'كريم بلال',
  activity:       'مطعم',
  address:        'شارع الاستقلال',
  licenseType:    'تصريح',
  licenseDetails: '',
  year:           '2025',
  category:       'الفئة الرابعة',
  notes:          '',
  ...overrides,
});

function seedUserFacilities(items: Facility[]) {
  store.set(USER_KEY, JSON.stringify(items));
}

// =============================================================================
// getAllFacilities
// =============================================================================

describe('getAllFacilities', () => {
  it('returns at least the hardcoded facilities when storage is empty', async () => {
    const all = await getAllFacilities();
    expect(all.length).toBeGreaterThanOrEqual(hardcodedFacilities.length);
    hardcodedFacilities.forEach(hf => {
      expect(all.some(f => f.id === hf.id)).toBe(true);
    });
  });

  it('appends user-added facilities after the hardcoded ones', async () => {
    const userFac: Facility = { ...makeUserFacility(), id: 'U-test-1' } as Facility;
    seedUserFacilities([userFac]);
    const all = await getAllFacilities();
    const ids = all.map(f => f.id);
    // hardcoded come first, user-added at the end
    expect(ids.indexOf(hardcodedFacilities[0].id)).toBeLessThan(ids.indexOf('U-test-1'));
  });

  it('survives corrupt JSON in storage and falls back to hardcoded only', async () => {
    store.set(USER_KEY, 'NOT_VALID_JSON');
    const all = await getAllFacilities();
    expect(all).toEqual(hardcodedFacilities);
  });
});

// =============================================================================
// getUserFacilities
// =============================================================================

describe('getUserFacilities', () => {
  it('returns empty array when storage is empty', async () => {
    await expect(getUserFacilities()).resolves.toEqual([]);
  });

  it('returns stored user facilities', async () => {
    const items: Facility[] = [
      { ...makeUserFacility(), id: 'U-1' } as Facility,
      { ...makeUserFacility({ projectName: 'صيدلية النور' }), id: 'U-2' } as Facility,
    ];
    seedUserFacilities(items);
    const result = await getUserFacilities();
    expect(result).toHaveLength(2);
    expect(result.map(f => f.id)).toEqual(['U-1', 'U-2']);
  });

  it('returns [] on corrupt JSON without throwing', async () => {
    store.set(USER_KEY, '{{{bad');
    await expect(getUserFacilities()).resolves.toEqual([]);
  });
});

// =============================================================================
// getFacilityById
// =============================================================================

describe('getFacilityById', () => {
  it('finds a hardcoded facility by id', async () => {
    const target = hardcodedFacilities[0];
    const result = await getFacilityById(target.id);
    expect(result).toEqual(target);
  });

  it('finds a user-added facility when not in hardcoded list', async () => {
    const userFac: Facility = { ...makeUserFacility(), id: 'U-xyz' } as Facility;
    seedUserFacilities([userFac]);
    const result = await getFacilityById('U-xyz');
    expect(result).toEqual(userFac);
  });

  it('returns null for an unknown id', async () => {
    await expect(getFacilityById('does-not-exist')).resolves.toBeNull();
  });
});

// =============================================================================
// searchFacilities
// =============================================================================

describe('searchFacilities', () => {
  it('returns [] for a blank query', async () => {
    await expect(searchFacilities('')).resolves.toEqual([]);
  });

  it('returns [] for a whitespace-only query', async () => {
    await expect(searchFacilities('   ')).resolves.toEqual([]);
  });

  it('matches on projectName', async () => {
    const results = await searchFacilities('مخبزة');
    expect(results.length).toBeGreaterThan(0);
    results.forEach(f => expect(f.projectName).toMatch(/مخبزة/));
  });

  it('matches on ownerName', async () => {
    const target = hardcodedFacilities[0];
    const results = await searchFacilities(target.ownerName.slice(0, 5));
    expect(results.some(f => f.id === target.id)).toBe(true);
  });

  it('matches on activity', async () => {
    // 'غسل' appears in the activity field of car-wash facilities
    const results = await searchFacilities('غسل');
    expect(results.length).toBeGreaterThan(0);
    results.forEach(f => {
      const combined = [f.projectName, f.ownerName, f.activity, f.address, f.notes].join(' ');
      expect(combined).toMatch(/غسل/);
    });
  });

  it('returns [] when no facilities match', async () => {
    await expect(searchFacilities('ZZZNOMATCH_XYZ')).resolves.toEqual([]);
  });

  it('is case-insensitive for latin characters', async () => {
    // user-added facility with latin letters in projectName
    const fac: Facility = {
      ...makeUserFacility({ projectName: 'ABC Bakery' }),
      id: 'U-latin',
    } as Facility;
    seedUserFacilities([fac]);
    const lower = await searchFacilities('abc bakery');
    const upper = await searchFacilities('ABC BAKERY');
    expect(lower.some(f => f.id === 'U-latin')).toBe(true);
    expect(upper.some(f => f.id === 'U-latin')).toBe(true);
  });

  it('also finds user-added facilities', async () => {
    const fac: Facility = {
      ...makeUserFacility({ projectName: 'ورشة حدادة الحديد' }),
      id: 'U-search',
    } as Facility;
    seedUserFacilities([fac]);
    const results = await searchFacilities('حدادة');
    expect(results.some(f => f.id === 'U-search')).toBe(true);
  });
});

// =============================================================================
// filterFacilitiesByCategory
// =============================================================================

describe('filterFacilitiesByCategory', () => {
  it('returns all facilities for an empty string', async () => {
    const all = await getAllFacilities();
    const filtered = await filterFacilitiesByCategory('');
    expect(filtered).toEqual(all);
  });

  it('returns only facilities matching the given category', async () => {
    const category = hardcodedFacilities[0].category;
    const results = await filterFacilitiesByCategory(category);
    expect(results.length).toBeGreaterThan(0);
    results.forEach(f => expect(f.category).toBe(category));
  });

  it('returns [] for an unknown category', async () => {
    await expect(filterFacilitiesByCategory('NO_SUCH_CATEGORY_XYZ')).resolves.toEqual([]);
  });

  it('includes user-added facilities in filter results', async () => {
    const fac: Facility = {
      ...makeUserFacility({ category: 'فئة خاصة' }),
      id: 'U-cat',
    } as Facility;
    seedUserFacilities([fac]);
    const results = await filterFacilitiesByCategory('فئة خاصة');
    expect(results.some(f => f.id === 'U-cat')).toBe(true);
  });
});

// =============================================================================
// addUserFacility
// =============================================================================

describe('addUserFacility', () => {
  it('returns the saved facility with a generated id', async () => {
    const input = makeUserFacility();
    const saved = await addUserFacility(input);
    expect(saved.id).toBeDefined();
    expect(saved.id.length).toBeGreaterThan(0);
    expect(saved.projectName).toBe(input.projectName);
  });

  it('persists the new facility so getUserFacilities returns it', async () => {
    const saved = await addUserFacility(makeUserFacility());
    const list = await getUserFacilities();
    expect(list.some(f => f.id === saved.id)).toBe(true);
  });

  it('appends to existing user facilities without overwriting', async () => {
    const first  = await addUserFacility(makeUserFacility({ projectName: 'أولى' }));
    const second = await addUserFacility(makeUserFacility({ projectName: 'ثانية' }));
    const list = await getUserFacilities();
    expect(list.some(f => f.id === first.id)).toBe(true);
    expect(list.some(f => f.id === second.id)).toBe(true);
  });

  it('generates unique ids for consecutive adds', async () => {
    const a = await addUserFacility(makeUserFacility());
    const b = await addUserFacility(makeUserFacility());
    expect(a.id).not.toBe(b.id);
  });
});

// =============================================================================
// updateUserFacility
// =============================================================================

describe('updateUserFacility', () => {
  it('updates a field and returns true', async () => {
    const saved = await addUserFacility(makeUserFacility());
    const ok = await updateUserFacility(saved.id, { projectName: 'اسم جديد' });
    expect(ok).toBe(true);
    const list = await getUserFacilities();
    const updated = list.find(f => f.id === saved.id);
    expect(updated?.projectName).toBe('اسم جديد');
  });

  it('returns false for an unknown id', async () => {
    await expect(updateUserFacility('unknown-xyz', { projectName: 'X' })).resolves.toBe(false);
  });

  it('returns false for a hardcoded facility id (immutable)', async () => {
    const hardcodedId = hardcodedFacilities[0].id;
    await expect(updateUserFacility(hardcodedId, { projectName: 'Hack' })).resolves.toBe(false);
  });
});

// =============================================================================
// deleteUserFacility
// =============================================================================

describe('deleteUserFacility', () => {
  it('removes the facility and returns true', async () => {
    const saved = await addUserFacility(makeUserFacility());
    const ok = await deleteUserFacility(saved.id);
    expect(ok).toBe(true);
    const list = await getUserFacilities();
    expect(list.some(f => f.id === saved.id)).toBe(false);
  });

  it('returns false for an unknown id', async () => {
    await expect(deleteUserFacility('nope')).resolves.toBe(false);
  });

  it('does not remove hardcoded facilities (they are not in user storage)', async () => {
    const hardcodedId = hardcodedFacilities[0].id;
    await expect(deleteUserFacility(hardcodedId)).resolves.toBe(false);
    const all = await getAllFacilities();
    expect(all.some(f => f.id === hardcodedId)).toBe(true);
  });
});

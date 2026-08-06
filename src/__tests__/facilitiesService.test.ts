// src/__tests__/facilitiesService.test.ts
//
// Tests for facilitiesService — which now delegates all user-facility I/O
// to FacilityRepository (expo-sqlite). The global expo-sqlite mock is used;
// call SQLite.__resetAll() in beforeEach for test isolation.

// ─── Mocks ────────────────────────────────────────────────────────────────────

const HARDCODED = [
  { id: 'H1', projectName: 'مطعم النور',    ownerName: 'أحمد', activity: 'مطعم',    address: 'شارع الملك', licenseType: 'تجاري', licenseDetails: '', year: '2020', category: 'غذاء', notes: '' },
  { id: 'H2', projectName: 'صيدلية الشفاء', ownerName: 'سارة', activity: 'صيدلية',  address: 'حي العليا',  licenseType: 'صحي',   licenseDetails: '', year: '2021', category: 'صحة',  notes: '' },
];

jest.mock('../facilitiesData', () => ({ facilities: HARDCODED }));

// ─── Imports ──────────────────────────────────────────────────────────────────

import * as SQLite from 'expo-sqlite';
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
  (SQLite as any).__resetAll();
});

// ─── getAllFacilities ─────────────────────────────────────────────────────────

describe('getAllFacilities', () => {
  it('returns only hardcoded facilities when user list is empty', async () => {
    const all = await getAllFacilities();
    expect(all).toHaveLength(2);
    expect(all[0].id).toBe('H1');
  });

  it('appends user facilities after hardcoded ones', async () => {
    await addUserFacility({ ...makeUserFacility(), id: 'U1' } as Omit<Facility, 'id'>);
    const all = await getAllFacilities();
    expect(all).toHaveLength(3);
    // user facility is at the end (hardcoded first)
    expect(all.some(f => f.projectName === 'بقالة التقوى')).toBe(true);
  });

  it('returns hardcoded list when repository is empty (graceful)', async () => {
    const all = await getAllFacilities();
    expect(all).toHaveLength(2);
  });
});

// ─── getUserFacilities ────────────────────────────────────────────────────────

describe('getUserFacilities', () => {
  it('returns empty array when there are no user facilities', async () => {
    expect(await getUserFacilities()).toEqual([]);
  });

  it('returns only user-added facilities', async () => {
    await addUserFacility(makeUserFacility());
    const result = await getUserFacilities();
    expect(result).toHaveLength(1);
    expect(result[0].projectName).toBe('بقالة التقوى');
  });
});

// ─── getFacilityById ──────────────────────────────────────────────────────────

describe('getFacilityById', () => {
  it('finds a hardcoded facility', async () => {
    expect((await getFacilityById('H1'))?.id).toBe('H1');
  });

  it('finds a user-added facility', async () => {
    const saved = await addUserFacility(makeUserFacility());
    expect((await getFacilityById(saved.id))?.id).toBe(saved.id);
  });

  it('returns null for an unknown id', async () => {
    expect(await getFacilityById('GHOST')).toBeNull();
  });
});

// ─── addUserFacility ──────────────────────────────────────────────────────────

describe('addUserFacility', () => {
  it('saves the facility and returns it with a generated id', async () => {
    const saved = await addUserFacility(makeUserFacility());
    expect(saved.id).toMatch(/^U/);
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
  it('returns [] for empty query',           async () => expect(await searchFacilities('')).toEqual([]));
  it('returns [] for whitespace-only query', async () => expect(await searchFacilities('   ')).toEqual([]));

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

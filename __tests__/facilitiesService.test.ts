// __tests__/facilitiesService.test.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../src/repositories/keys';
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
} from '../src/facilitiesService';
import { Facility } from '../src/types';

// ─── Mock AsyncStorage ────────────────────────────────────────────────────────

let mockStore = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem:    jest.fn((key: string) => Promise.resolve(mockStore.get(key) ?? null)),
  setItem:    jest.fn((key: string, value: string) => { mockStore.set(key, value); return Promise.resolve(); }),
  removeItem: jest.fn((key: string) => { mockStore.delete(key); return Promise.resolve(); }),
}));

// ─── Mock hardcoded facilities ────────────────────────────────────────────────
// Keep the mock small and deterministic so tests don't depend on real data.

const HARDCODED: Facility[] = [
  { id: 'H1', projectName: 'مطعم النور', ownerName: 'أحمد', activity: 'مطعم', address: 'شارع الملك', licenseType: 'تجاري', licenseDetails: '', year: '2020', category: 'غذاء', notes: '' },
  { id: 'H2', projectName: 'صيدلية الشفاء', ownerName: 'سارة', activity: 'صيدلية', address: 'حي العليا', licenseType: 'صحي', licenseDetails: '', year: '2021', category: 'صحة', notes: '' },
];

jest.mock('../src/facilitiesData', () => ({ facilities: HARDCODED }));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeUserFacility(overrides: Partial<Facility> = {}): Omit<Facility, 'id'> {
  return {
    projectName: 'بقالة التقوى',
    ownerName: 'محمد',
    activity: 'بقالة',
    address: 'حي الروضة',
    licenseType: 'تجاري',
    licenseDetails: '',
    year: '2022',
    category: 'غذاء',
    notes: '',
    ...overrides,
  };
}

beforeEach(() => {
  mockStore = new Map();
  jest.clearAllMocks();
});

// ─── getAllFacilities ─────────────────────────────────────────────────────────

describe('getAllFacilities', () => {
  it('returns only hardcoded facilities when user list is empty', async () => {
    const all = await getAllFacilities();
    expect(all).toHaveLength(2);
    expect(all[0].id).toBe('H1');
  });

  it('appends user facilities after hardcoded ones', async () => {
    mockStore.set(StorageKeys.USER_FACILITIES, JSON.stringify([{ ...makeUserFacility(), id: 'U1' }]));
    const all = await getAllFacilities();
    expect(all).toHaveLength(3);
    expect(all[2].id).toBe('U1');
  });

  it('returns hardcoded list when stored JSON is corrupt (graceful)', async () => {
    mockStore.set(StorageKeys.USER_FACILITIES, 'NOT_JSON');
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
    mockStore.set(StorageKeys.USER_FACILITIES, JSON.stringify([{ ...makeUserFacility(), id: 'U1' }]));
    const result = await getUserFacilities();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('U1');
  });
});

// ─── getFacilityById ──────────────────────────────────────────────────────────

describe('getFacilityById', () => {
  it('finds a hardcoded facility without touching storage', async () => {
    const result = await getFacilityById('H1');
    expect(result?.id).toBe('H1');
    expect(AsyncStorage.getItem).not.toHaveBeenCalled();
  });

  it('finds a user-added facility', async () => {
    mockStore.set(StorageKeys.USER_FACILITIES, JSON.stringify([{ ...makeUserFacility(), id: 'U99' }]));
    const result = await getFacilityById('U99');
    expect(result?.id).toBe('U99');
  });

  it('returns null for an unknown id', async () => {
    expect(await getFacilityById('GHOST')).toBeNull();
  });
});

// ─── addUserFacility ──────────────────────────────────────────────────────────

describe('addUserFacility', () => {
  it('saves the facility and returns it with a generated id', async () => {
    const input = makeUserFacility();
    const saved = await addUserFacility(input);
    expect(saved.id).toMatch(/^U\d+/);
    expect(saved.projectName).toBe(input.projectName);
  });

  it('does NOT mutate the caller\'s input object', async () => {
    const input = makeUserFacility() as Facility;
    const originalId = (input as Facility).id;
    await addUserFacility(input);
    expect((input as Facility).id).toBe(originalId); // unchanged
  });

  it('appends without overwriting existing user facilities', async () => {
    await addUserFacility(makeUserFacility());
    await addUserFacility(makeUserFacility({ projectName: 'ثاني' }));
    const all = await getUserFacilities();
    expect(all).toHaveLength(2);
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
    const ok = await updateUserFacility(saved.id, { notes: 'ملاحظة جديدة' });
    expect(ok).toBe(true);
    const updated = await getFacilityById(saved.id);
    expect(updated?.notes).toBe('ملاحظة جديدة');
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
    const bAfter = await getFacilityById(b.id);
    expect(bAfter?.notes).toBe('');
  });
});

// ─── deleteUserFacility ───────────────────────────────────────────────────────

describe('deleteUserFacility', () => {
  it('removes the facility and returns true', async () => {
    const saved = await addUserFacility(makeUserFacility());
    const ok = await deleteUserFacility(saved.id);
    expect(ok).toBe(true);
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
  it('returns [] for empty query', async () => {
    expect(await searchFacilities('')).toEqual([]);
  });

  it('returns [] for whitespace-only query', async () => {
    expect(await searchFacilities('   ')).toEqual([]);
  });

  it('finds a hardcoded facility by projectName', async () => {
    const results = await searchFacilities('النور');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('H1');
  });

  it('finds by activity field', async () => {
    const results = await searchFacilities('صيدلية');
    expect(results.map(r => r.id)).toContain('H2');
  });

  it('finds a user-added facility', async () => {
    await addUserFacility(makeUserFacility({ projectName: 'مستودع الأمل' }));
    const results = await searchFacilities('الأمل');
    expect(results).toHaveLength(1);
    expect(results[0].projectName).toBe('مستودع الأمل');
  });

  it('is case-insensitive for Latin characters', async () => {
    await addUserFacility(makeUserFacility({ projectName: 'Clinic Alpha' }));
    const results = await searchFacilities('clinic');
    expect(results.length).toBeGreaterThan(0);
  });

  it('returns [] when no facility matches', async () => {
    expect(await searchFacilities('xyznotfound')).toEqual([]);
  });
});

// ─── filterFacilitiesByCategory ───────────────────────────────────────────────

describe('filterFacilitiesByCategory', () => {
  it('returns all facilities for empty category string', async () => {
    const all = await filterFacilitiesByCategory('');
    expect(all).toHaveLength(2);
  });

  it('filters by category correctly', async () => {
    const health = await filterFacilitiesByCategory('صحة');
    expect(health).toHaveLength(1);
    expect(health[0].id).toBe('H2');
  });

  it('includes user-added facilities in filter results', async () => {
    await addUserFacility(makeUserFacility({ category: 'صحة' }));
    const health = await filterFacilitiesByCategory('صحة');
    expect(health).toHaveLength(2); // H2 + the user-added one
  });

  it('returns [] when no facility matches the category', async () => {
    expect(await filterFacilitiesByCategory('نقل')).toEqual([]);
  });
});

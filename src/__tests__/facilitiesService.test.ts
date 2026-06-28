// src/__tests__/facilitiesService.test.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addUserFacility,
  clearAllUserFacilities,
  deleteUserFacility,
  filterByActivity,
  getAllFacilities,
  getFacilityById,
  getUserFacilities,
  searchAndFilter,
  searchFacilities,
  updateUserFacility,
} from '../facilitiesService';
import { facilities as hardcoded } from '../facilitiesData';
import { Facility } from '../types';

// ─── Mock AsyncStorage with an in-memory Map ────────────────────────────────────────────
let mockStore = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem:    jest.fn((k: string)             => Promise.resolve(mockStore.get(k) ?? null)),
  setItem:    jest.fn((k: string, v: string)  => { mockStore.set(k, v); return Promise.resolve(); }),
  removeItem: jest.fn((k: string)             => { mockStore.delete(k); return Promise.resolve(); }),
}));

// The repository uses StorageKeys.USER_FACILITIES which resolves to 'FACILITIES'
const KEY = 'FACILITIES';

const makeUserFacility = (partial: Partial<Omit<Facility, 'id'>> = {}): Omit<Facility, 'id'> => ({
  projectName: 'مطعم الأمل',
  ownerName: 'محمد الأمين',
  activity: 'مطاعم',
  address: 'شارع الفتح',
  licenseType: 'A',
  licenseDetails: '',
  year: '2023',
  category: 'غذائي',
  notes: '',
  ...partial,
});

beforeEach(() => {
  mockStore = new Map();
  jest.clearAllMocks();
});

// ─── getAllFacilities ──────────────────────────────────────────────────
describe('getAllFacilities', () => {
  it('returns at least the hardcoded facilities when storage is empty', async () => {
    const result = await getAllFacilities();
    expect(result.length).toBeGreaterThanOrEqual(hardcoded.length);
    expect(result[0]).toMatchObject(hardcoded[0]);
  });

  it('appends user-added facilities after hardcoded ones', async () => {
    await addUserFacility(makeUserFacility());
    const result = await getAllFacilities();
    expect(result.length).toBe(hardcoded.length + 1);
    expect(result[hardcoded.length].projectName).toBe('مطعم الأمل');
  });
});

// ─── getFacilityById ──────────────────────────────────────────────────
describe('getFacilityById', () => {
  it('finds a hardcoded facility by id', async () => {
    const first = hardcoded[0];
    const result = await getFacilityById(first.id);
    expect(result).toMatchObject(first);
  });

  it('finds a user-added facility by id', async () => {
    const saved = await addUserFacility(makeUserFacility({ projectName: 'مخبز الفجر' }));
    const result = await getFacilityById(saved.id);
    expect(result).not.toBeNull();
    expect(result!.projectName).toBe('مخبز الفجر');
  });

  it('returns null for an unknown id', async () => {
    expect(await getFacilityById('DOES_NOT_EXIST')).toBeNull();
  });
});

// ─── searchFacilities ───────────────────────────────────────────────────
describe('searchFacilities', () => {
  beforeEach(async () => {
    await addUserFacility(makeUserFacility({ projectName: 'صيدلية النور', ownerName: 'أحمد كريم', activity: 'صيدليات' }));
    await addUserFacility(makeUserFacility({ projectName: 'مخبز الصباح', ownerName: 'سامي بلال', activity: 'مخابز' }));
  });

  // searchFacilities('') intentionally returns [] per service contract
  // (empty query = no search intent).  Use getAllFacilities() to list all.
  it('returns empty array on empty query (use getAllFacilities for full listing)', async () => {
    const result = await searchFacilities('');
    expect(result).toHaveLength(0);
  });

  it('returns empty array on whitespace-only query', async () => {
    const result = await searchFacilities('   ');
    expect(result).toHaveLength(0);
  });

  it('getAllFacilities returns all hardcoded + user facilities', async () => {
    const result = await getAllFacilities();
    expect(result.length).toBe(hardcoded.length + 2);
  });

  it('finds a user facility by projectName substring', async () => {
    const result = await searchFacilities('صيدلية');
    expect(result.some(f => f.projectName === 'صيدلية النور')).toBe(true);
  });

  it('finds a user facility by ownerName substring', async () => {
    const result = await searchFacilities('سامي');
    expect(result.some(f => f.ownerName === 'سامي بلال')).toBe(true);
  });

  it('is case-insensitive (Latin characters)', async () => {
    await addUserFacility(makeUserFacility({ projectName: 'Lab Alpha', activity: 'مختبرات' }));
    const result = await searchFacilities('lab');
    expect(result.some(f => f.projectName === 'Lab Alpha')).toBe(true);
  });

  it('strips Arabic diacritics before matching', async () => {
    await addUserFacility(makeUserFacility({ projectName: 'مَطْعَم النِعمَة', activity: 'مطاعم' }));
    const result = await searchFacilities('مطعم النعمة');
    expect(result.some(f => f.projectName === 'مَطْعَم النِعمَة')).toBe(true);
  });

  it('returns empty array when no match', async () => {
    const result = await searchFacilities('مستشفى فضائي');
    expect(result).toHaveLength(0);
  });
});

// ─── filterByActivity ──────────────────────────────────────────────────
describe('filterByActivity', () => {
  const ACTIVITY = 'صيدليات';

  it('returns only facilities matching the given activity', async () => {
    await addUserFacility(makeUserFacility({ activity: ACTIVITY }));
    await addUserFacility(makeUserFacility({ activity: 'مخابز' }));
    const result = await filterByActivity(ACTIVITY);
    expect(result.every(f => f.activity === ACTIVITY)).toBe(true);
    expect(result.some(f => f.activity === 'مخابز')).toBe(false);
  });

  it('includes user-added facilities in the results', async () => {
    await addUserFacility(makeUserFacility({ projectName: 'صيدلية ساحة المدينة', activity: ACTIVITY }));
    const result = await filterByActivity(ACTIVITY);
    expect(result.some(f => f.projectName === 'صيدلية ساحة المدينة')).toBe(true);
  });

  it('is diacritic-insensitive', async () => {
    await addUserFacility(makeUserFacility({ activity: 'صَيْدَلِيَات' }));
    const result = await filterByActivity(ACTIVITY);
    expect(result.some(f => f.activity === 'صَيْدَلِيَات')).toBe(true);
  });

  it('returns empty array when no facility matches', async () => {
    const result = await filterByActivity('نشاط غير موجود');
    expect(result).toHaveLength(0);
  });
});

// ─── searchAndFilter ───────────────────────────────────────────────────
describe('searchAndFilter', () => {
  // searchAndFilter delegates to searchFacilities which returns [] for empty query
  it('returns empty array when query is empty (searchFacilities contract)', async () => {
    const result = await searchAndFilter('');
    expect(result).toHaveLength(0);
  });

  it('getAllFacilities returns at least all hardcoded entries', async () => {
    const result = await getAllFacilities();
    expect(result.length).toBeGreaterThanOrEqual(hardcoded.length);
  });

  it('applies only text search when activity is omitted', async () => {
    await addUserFacility(makeUserFacility({ projectName: 'مخبز الفجر' }));
    const result = await searchAndFilter('فجر');
    expect(result.some(f => f.projectName === 'مخبز الفجر')).toBe(true);
  });

  it('applies both search and activity filter together', async () => {
    await addUserFacility(makeUserFacility({ projectName: 'صيدلية البركة', activity: 'صيدليات' }));
    await addUserFacility(makeUserFacility({ projectName: 'صيدلية البركة', activity: 'مخابز' }));
    const result = await searchAndFilter('بركة', 'صيدليات');
    expect(result.every(f => f.activity === 'صيدليات')).toBe(true);
    expect(result.some(f => f.activity === 'مخابز')).toBe(false);
  });

  it('returns empty when text matches but activity does not', async () => {
    await addUserFacility(makeUserFacility({ projectName: 'مطعم النخيل', activity: 'مطاعم' }));
    const result = await searchAndFilter('نخيل', 'صيدليات');
    expect(result).toHaveLength(0);
  });
});

// ─── addUserFacility ───────────────────────────────────────────────────
describe('addUserFacility', () => {
  it('assigns a unique id prefixed with U', async () => {
    const saved = await addUserFacility(makeUserFacility());
    expect(saved.id).toMatch(/^U/);
  });

  it('persists the facility in storage', async () => {
    await addUserFacility(makeUserFacility({ projectName: 'مطعم الوطن' }));
    const raw = mockStore.get(KEY);
    expect(raw).not.toBeNull();
    const saved: Facility[] = JSON.parse(raw!);
    expect(saved.some(f => f.projectName === 'مطعم الوطن')).toBe(true);
  });

  it('appends without overwriting previous entries', async () => {
    await addUserFacility(makeUserFacility({ projectName: 'A' }));
    await addUserFacility(makeUserFacility({ projectName: 'B' }));
    const users = await getUserFacilities();
    expect(users).toHaveLength(2);
  });
});

// ─── updateUserFacility ──────────────────────────────────────────────────
describe('updateUserFacility', () => {
  it('updates a field on a user facility', async () => {
    const saved = await addUserFacility(makeUserFacility());
    const ok = await updateUserFacility(saved.id, { projectName: 'مطعم السعادة' });
    expect(ok).toBe(true);
    const updated = await getFacilityById(saved.id);
    expect(updated!.projectName).toBe('مطعم السعادة');
  });

  it('returns false for a hardcoded facility id', async () => {
    const ok = await updateUserFacility(hardcoded[0].id, { notes: 'changed' });
    expect(ok).toBe(false);
  });

  it('returns false when storage is empty', async () => {
    const ok = await updateUserFacility('U-FAKE', { notes: 'x' });
    expect(ok).toBe(false);
  });
});

// ─── deleteUserFacility ──────────────────────────────────────────────────
describe('deleteUserFacility', () => {
  it('removes a user facility by id', async () => {
    const saved = await addUserFacility(makeUserFacility());
    const ok = await deleteUserFacility(saved.id);
    expect(ok).toBe(true);
    expect(await getFacilityById(saved.id)).toBeNull();
  });

  it('returns false when id does not exist', async () => {
    expect(await deleteUserFacility('U-UNKNOWN')).toBe(false);
  });

  it('returns false when storage is empty', async () => {
    expect(await deleteUserFacility('U-ANYTHING')).toBe(false);
  });
});

// ─── clearAllUserFacilities ─────────────────────────────────────────────────
describe('clearAllUserFacilities', () => {
  it('removes all user-added facilities from storage', async () => {
    await addUserFacility(makeUserFacility({ projectName: 'A' }));
    await addUserFacility(makeUserFacility({ projectName: 'B' }));
    await clearAllUserFacilities();
    const users = await getUserFacilities();
    expect(users).toHaveLength(0);
  });

  it('does not affect hardcoded facilities', async () => {
    await clearAllUserFacilities();
    const all = await getAllFacilities();
    expect(all.length).toBe(hardcoded.length);
  });
});

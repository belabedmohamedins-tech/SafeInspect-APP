// src/__tests__/repositories/FacilityRepository.test.ts
//
// Layer-2 contract: @react-native-async-storage/async-storage is mocked
// globally via moduleNameMapper → __mocks__/@react-native-async-storage/
// async-storage.js. Do NOT add an inline jest.mock() factory for it here.
// Call AsyncStorage.__resetStore() in beforeEach to wipe the in-memory store.
//
// FacilityRepository manages user-created facilities only.
// It stores them as a JSON array under StorageKeys.USER_FACILITIES.
// The hardcoded facilities in facilitiesData.ts are NOT involved here.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FacilityRepository } from '../../repositories/FacilityRepository';
import { StorageKeys }         from '../../repositories/keys';
import { Facility }            from '../../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeFacility(overrides: Partial<Facility> = {}): Omit<Facility, 'id'> {
  return {
    projectName:    'Test Project',
    ownerName:      'Owner One',
    activity:       'Industrial',
    address:        '123 Main St',
    ...overrides,
  };
}

async function storedFacilities(): Promise<Facility[]> {
  const json = await AsyncStorage.getItem(StorageKeys.USER_FACILITIES);
  return json ? JSON.parse(json) : [];
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  (AsyncStorage as any).__resetStore();
});

// ─── getAll ───────────────────────────────────────────────────────────────────

describe('FacilityRepository.getAll', () => {
  it('returns [] when storage is empty', async () => {
    const result = await FacilityRepository.getAll();
    expect(result).toEqual([]);
  });

  it('returns stored facilities', async () => {
    const f = await FacilityRepository.add(makeFacility());
    const result = await FacilityRepository.getAll();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(f.id);
  });

  it('returns all facilities when multiple are stored', async () => {
    await FacilityRepository.add(makeFacility({ projectName: 'A' }));
    await FacilityRepository.add(makeFacility({ projectName: 'B' }));
    const result = await FacilityRepository.getAll();
    expect(result).toHaveLength(2);
  });
});

// ─── getById ──────────────────────────────────────────────────────────────────

describe('FacilityRepository.getById', () => {
  it('returns the matching facility', async () => {
    const f = await FacilityRepository.add(makeFacility({ projectName: 'Target' }));
    const result = await FacilityRepository.getById(f.id);
    expect(result).not.toBeNull();
    expect(result!.projectName).toBe('Target');
  });

  it('returns null when id does not exist', async () => {
    await FacilityRepository.add(makeFacility());
    const result = await FacilityRepository.getById('nonexistent-id');
    expect(result).toBeNull();
  });

  it('returns null when storage is empty', async () => {
    const result = await FacilityRepository.getById('any-id');
    expect(result).toBeNull();
  });
});

// ─── add ──────────────────────────────────────────────────────────────────────

describe('FacilityRepository.add', () => {
  it('persists the facility and returns it with an id', async () => {
    const input = makeFacility({ projectName: 'New Facility' });
    const result = await FacilityRepository.add(input);

    expect(result.id).toBeTruthy();
    expect(result.projectName).toBe('New Facility');

    const stored = await storedFacilities();
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(result.id);
  });

  it('generated id is prefixed with "U"', async () => {
    const result = await FacilityRepository.add(makeFacility());
    expect(result.id.startsWith('U')).toBe(true);
  });

  it('generated ids are unique across multiple adds', async () => {
    const a = await FacilityRepository.add(makeFacility());
    const b = await FacilityRepository.add(makeFacility());
    expect(a.id).not.toBe(b.id);
  });

  it('appends to existing facilities without overwriting them', async () => {
    const a = await FacilityRepository.add(makeFacility({ projectName: 'A' }));
    const b = await FacilityRepository.add(makeFacility({ projectName: 'B' }));

    const stored = await storedFacilities();
    expect(stored).toHaveLength(2);
    expect(stored.map(f => f.id)).toContain(a.id);
    expect(stored.map(f => f.id)).toContain(b.id);
  });

  it('preserves optional fields when provided', async () => {
    const result = await FacilityRepository.add(
      makeFacility({ lat: 24.7, lng: 46.7, notes: 'a note', category: 'health' }),
    );
    expect(result.lat).toBe(24.7);
    expect(result.lng).toBe(46.7);
    expect(result.notes).toBe('a note');
    expect(result.category).toBe('health');
  });
});

// ─── update ───────────────────────────────────────────────────────────────────

describe('FacilityRepository.update', () => {
  it('merges the partial update and returns the updated facility', async () => {
    const f = await FacilityRepository.add(makeFacility({ projectName: 'Old Name' }));
    const result = await FacilityRepository.update(f.id, { projectName: 'New Name' });

    expect(result).not.toBeNull();
    expect(result!.projectName).toBe('New Name');
    // Untouched field is preserved
    expect(result!.ownerName).toBe('Owner One');
  });

  it('persists the update to storage', async () => {
    const f = await FacilityRepository.add(makeFacility({ address: 'Old Address' }));
    await FacilityRepository.update(f.id, { address: 'New Address' });

    const stored = await storedFacilities();
    expect(stored[0].address).toBe('New Address');
  });

  it('returns null when the id does not exist', async () => {
    await FacilityRepository.add(makeFacility());
    const result = await FacilityRepository.update('ghost-id', { projectName: 'X' });
    expect(result).toBeNull();
  });

  it('does not alter other facilities when updating one', async () => {
    const a = await FacilityRepository.add(makeFacility({ projectName: 'A' }));
    const b = await FacilityRepository.add(makeFacility({ projectName: 'B' }));

    await FacilityRepository.update(a.id, { projectName: 'A-updated' });

    const stored = await storedFacilities();
    const bStored = stored.find(f => f.id === b.id);
    expect(bStored!.projectName).toBe('B');
  });
});

// ─── remove ───────────────────────────────────────────────────────────────────

describe('FacilityRepository.remove', () => {
  it('removes the facility and returns true', async () => {
    const f = await FacilityRepository.add(makeFacility());
    const result = await FacilityRepository.remove(f.id);

    expect(result).toBe(true);
    const stored = await storedFacilities();
    expect(stored).toHaveLength(0);
  });

  it('returns false when the id does not exist', async () => {
    await FacilityRepository.add(makeFacility());
    const result = await FacilityRepository.remove('nonexistent-id');
    expect(result).toBe(false);
  });

  it('leaves other facilities intact after removal', async () => {
    const a = await FacilityRepository.add(makeFacility({ projectName: 'A' }));
    const b = await FacilityRepository.add(makeFacility({ projectName: 'B' }));

    await FacilityRepository.remove(a.id);

    const stored = await storedFacilities();
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(b.id);
  });

  it('returns false when storage is empty', async () => {
    const result = await FacilityRepository.remove('any-id');
    expect(result).toBe(false);
  });
});

// ─── clear ────────────────────────────────────────────────────────────────────

describe('FacilityRepository.clear', () => {
  it('removes all facilities from storage', async () => {
    await FacilityRepository.add(makeFacility({ projectName: 'A' }));
    await FacilityRepository.add(makeFacility({ projectName: 'B' }));

    await FacilityRepository.clear();

    const stored = await storedFacilities();
    expect(stored).toHaveLength(0);
  });

  it('calls AsyncStorage.removeItem with the correct key', async () => {
    const removeItemSpy = jest.spyOn(AsyncStorage, 'removeItem');
    await FacilityRepository.clear();
    expect(removeItemSpy).toHaveBeenCalledWith(StorageKeys.USER_FACILITIES);
    removeItemSpy.mockRestore();
  });

  it('is a no-op when storage is already empty (does not throw)', async () => {
    await expect(FacilityRepository.clear()).resolves.toBeUndefined();
  });
});

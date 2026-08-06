/**
 * src/__tests__/repositories/FacilityRepository.test.ts
 *
 * Unit tests for FacilityRepository using the in-memory expo-sqlite mock.
 *
 * CONTRACT: FacilityRepository.add() returns Promise<string> — the id of the
 * newly stored facility — NOT the full Facility object.  If callers need the
 * full object they must call getById() immediately after.  These tests reflect
 * the current production API (Z5 SQLite migration).
 */

import { FacilityRepository } from '../../repositories/FacilityRepository';
import SQLite from 'expo-sqlite';

// Static require — dynamic import() is not supported under Babel/CommonJS Jest.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const schema = require('../../db/schema') as {
  __resetDb: () => void;
  initializeDatabase: () => Promise<void>;
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeFacility(overrides: Record<string, unknown> = {}) {
  return {
    projectName: 'Test Project',
    ownerName:   'Owner One',
    activity:    'Industrial',
    address:     '123 Main St',
    ...overrides,
  };
}

async function storedFacilities() {
  return FacilityRepository.getAll();
}

// ─── setup / teardown ─────────────────────────────────────────────────────────

beforeEach(async () => {
  // Reset in-memory DB and reinitialise schema.
  (SQLite as any).__resetAll?.();
  schema.__resetDb();
  await schema.initializeDatabase();
});

// ─── getAll ───────────────────────────────────────────────────────────────────

describe('FacilityRepository.getAll', () => {
  it('returns an empty array when nothing is stored', async () => {
    const result = await FacilityRepository.getAll();
    expect(result).toEqual([]);
  });

  it('returns stored facilities', async () => {
    // add() returns the id string.
    const fId = await FacilityRepository.add(makeFacility());
    const result = await FacilityRepository.getAll();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(fId);
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
  it('returns null when the id does not exist', async () => {
    const result = await FacilityRepository.getById('nonexistent-id');
    expect(result).toBeNull();
  });

  it('returns the matching facility', async () => {
    const fId   = await FacilityRepository.add(makeFacility({ projectName: 'Target' }));
    const result = await FacilityRepository.getById(fId);
    expect(result).not.toBeNull();
    expect(result!.projectName).toBe('Target');
  });
});

// ─── add ──────────────────────────────────────────────────────────────────────

describe('FacilityRepository.add', () => {
  it('persists the facility and returns an id string', async () => {
    const input  = makeFacility({ projectName: 'New Facility' });
    const id     = await FacilityRepository.add(input);

    expect(typeof id).toBe('string');
    expect(id).toBeTruthy();

    // Verify the record is stored and retrievable.
    const stored = await storedFacilities();
    expect(stored).toHaveLength(1);
    expect(stored[0].projectName).toBe('New Facility');
    expect(stored[0].id).toBe(id);
  });

  it('generated id is prefixed with "U"', async () => {
    const id = await FacilityRepository.add(makeFacility());
    expect(id.startsWith('U')).toBe(true);
  });

  it('generated ids are unique across multiple adds', async () => {
    const a = await FacilityRepository.add(makeFacility());
    const b = await FacilityRepository.add(makeFacility());
    expect(a).not.toBe(b);
  });

  it('appends to existing facilities without overwriting them', async () => {
    const a = await FacilityRepository.add(makeFacility({ projectName: 'A' }));
    const b = await FacilityRepository.add(makeFacility({ projectName: 'B' }));
    const stored = await storedFacilities();
    expect(stored).toHaveLength(2);
    expect(stored.map(f => f.id)).toContain(a);
    expect(stored.map(f => f.id)).toContain(b);
  });

  it('preserves optional fields when provided', async () => {
    const id     = await FacilityRepository.add(
      makeFacility({ lat: 24.7, lng: 46.7, notes: 'a note', category: 'health' }),
    );
    const result = await FacilityRepository.getById(id);
    expect(result).not.toBeNull();
    expect(result!.lat).toBe(24.7);
    expect(result!.lng).toBe(46.7);
    expect(result!.notes).toBe('a note');
    expect(result!.category).toBe('health');
  });
});

// ─── update ───────────────────────────────────────────────────────────────────

describe('FacilityRepository.update', () => {
  it('merges the partial update and returns the updated facility', async () => {
    const fId    = await FacilityRepository.add(makeFacility({ ownerName: 'Owner One' }));
    const result = await FacilityRepository.update(fId, { projectName: 'New Name' });

    expect(result).not.toBeNull();
    expect(result!.projectName).toBe('New Name');
    expect(result!.ownerName).toBe('Owner One');
  });

  it('persists the update to storage', async () => {
    const fId = await FacilityRepository.add(makeFacility({ address: 'Old Address' }));
    await FacilityRepository.update(fId, { address: 'New Address' });

    const stored = await storedFacilities();
    expect(stored[0].address).toBe('New Address');
  });

  it('returns null when the id does not exist', async () => {
    const result = await FacilityRepository.update('no-such-id', { projectName: 'X' });
    expect(result).toBeNull();
  });

  it('does not alter other facilities when updating one', async () => {
    const aId = await FacilityRepository.add(makeFacility({ projectName: 'A' }));
    const bId = await FacilityRepository.add(makeFacility({ projectName: 'B' }));
    await FacilityRepository.update(aId, { projectName: 'A Updated' });

    const stored  = await storedFacilities();
    const bStored = stored.find(f => f.id === bId);
    expect(bStored!.projectName).toBe('B');
  });
});

// ─── remove ───────────────────────────────────────────────────────────────────

describe('FacilityRepository.remove', () => {
  it('removes the facility and returns true', async () => {
    const fId    = await FacilityRepository.add(makeFacility());
    const result = await FacilityRepository.remove(fId);

    expect(result).toBe(true);
    const stored = await storedFacilities();
    expect(stored).toHaveLength(0);
  });

  it('returns false when the id does not exist', async () => {
    const result = await FacilityRepository.remove('no-such-id');
    expect(result).toBe(false);
  });

  it('leaves other facilities intact after removal', async () => {
    const aId = await FacilityRepository.add(makeFacility({ projectName: 'A' }));
    const bId = await FacilityRepository.add(makeFacility({ projectName: 'B' }));
    await FacilityRepository.remove(aId);

    const stored = await storedFacilities();
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(bId);
  });
});

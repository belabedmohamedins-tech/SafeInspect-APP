// __tests__/repositories/AgendaRepository.test.ts
import { AgendaRepository } from '../../src/repositories/AgendaRepository';
import { StorageKeys } from '../../src/repositories/keys';
import { AgendaItem } from '../../src/types';

// ─── Mock AsyncStorage with an in-memory Map ─────────────────────────────────

const mockStore = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem:    jest.fn((key: string) => Promise.resolve(mockStore.get(key) ?? null)),
  setItem:    jest.fn((key: string, value: string) => { mockStore.set(key, value); return Promise.resolve(); }),
  removeItem: jest.fn((key: string) => { mockStore.delete(key); return Promise.resolve(); }),
}));

function makeAgendaItem(overrides: Partial<AgendaItem> & { id: string }): AgendaItem {
  return {
    facilityId:   'FAC-01',
    facilityName: 'Test Facility',
    date:         '2026-03-01T09:00:00.000Z',
    notes:        '',
    status:       'pending',
    ...overrides,
  };
}

beforeEach(() => mockStore.clear());

// ─── getAll ───────────────────────────────────────────────────────────────────

describe('AgendaRepository.getAll', () => {
  it('returns empty array when storage is empty', async () => {
    expect(await AgendaRepository.getAll()).toEqual([]);
  });

  it('returns all stored agenda items', async () => {
    const data = [makeAgendaItem({ id: '1' }), makeAgendaItem({ id: '2' })];
    mockStore.set(StorageKeys.AGENDA, JSON.stringify(data));
    expect(await AgendaRepository.getAll()).toHaveLength(2);
  });

  it('returns empty array on corrupt JSON (graceful)', async () => {
    mockStore.set(StorageKeys.AGENDA, 'BAD_JSON');
    expect(await AgendaRepository.getAll()).toEqual([]);
  });
});

// ─── getById ──────────────────────────────────────────────────────────────────

describe('AgendaRepository.getById', () => {
  it('returns the matching item', async () => {
    mockStore.set(StorageKeys.AGENDA, JSON.stringify([makeAgendaItem({ id: 'abc' })]));
    const result = await AgendaRepository.getById('abc');
    expect(result?.id).toBe('abc');
  });

  it('returns null for an unknown id', async () => {
    expect(await AgendaRepository.getById('nope')).toBeNull();
  });
});

// ─── save ──────────────────────────────────────────────────────────────────────

describe('AgendaRepository.save', () => {
  it('inserts a new item', async () => {
    await AgendaRepository.save(makeAgendaItem({ id: 'new' }));
    expect(await AgendaRepository.getAll()).toHaveLength(1);
  });

  it('updates an existing item in-place', async () => {
    await AgendaRepository.save(makeAgendaItem({ id: 'x', notes: 'old' }));
    await AgendaRepository.save(makeAgendaItem({ id: 'x', notes: 'updated' }));
    const all = await AgendaRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].notes).toBe('updated');
  });
});

// ─── delete ───────────────────────────────────────────────────────────────────

describe('AgendaRepository.delete', () => {
  it('removes the item with the given id', async () => {
    const data = [makeAgendaItem({ id: '1' }), makeAgendaItem({ id: '2' })];
    mockStore.set(StorageKeys.AGENDA, JSON.stringify(data));
    await AgendaRepository.delete('1');
    const all = await AgendaRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('2');
  });
});

// ─── updateInspectionLink ─────────────────────────────────────────────────────

describe('AgendaRepository.updateInspectionLink', () => {
  it('links an inspection id and marks the item completed', async () => {
    await AgendaRepository.save(makeAgendaItem({ id: 'agenda-1', status: 'pending' }));
    await AgendaRepository.updateInspectionLink('agenda-1', 'inspection-99');
    const updated = await AgendaRepository.getById('agenda-1');
    expect(updated?.inspectionId).toBe('inspection-99');
    expect((updated as any)?.completed).toBe(true);
    expect(updated?.status).toBe('completed');
  });

  it('is a no-op when the agenda id does not exist', async () => {
    // Should not throw
    await expect(
      AgendaRepository.updateInspectionLink('ghost', 'inspection-1')
    ).resolves.toBeUndefined();
  });

  it('does not modify other agenda items', async () => {
    const data = [makeAgendaItem({ id: 'a' }), makeAgendaItem({ id: 'b' })];
    mockStore.set(StorageKeys.AGENDA, JSON.stringify(data));
    await AgendaRepository.updateInspectionLink('a', 'ins-001');
    const b = await AgendaRepository.getById('b');
    expect(b?.inspectionId).toBeUndefined();
    expect((b as any)?.completed).toBeUndefined();
  });
});

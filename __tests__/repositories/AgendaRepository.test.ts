/**
 * __tests__/repositories/AgendaRepository.test.ts
 * Contract tests for AgendaRepository — SQLite contract.
 * Fixtures aligned with AgendaItem shape in src/types.ts.
 */
import { AgendaRepository } from '../../src/repositories/AgendaRepository';

const SQLite = require('expo-sqlite');

const makeAgendaItem = (overrides: Record<string, unknown> = {}) => ({
  id: 'agenda-1',
  facilityId: 'fac-1',
  facilityName: 'Test Facility',
  date: '2026-09-01',
  notes: '',
  status: 'pending' as const,
  ...overrides,
});

beforeEach(() => {
  SQLite.__resetAll();
});

describe('AgendaRepository.getAll', () => {
  it('returns empty array when no items', async () => {
    expect(await AgendaRepository.getAll()).toEqual([]);
  });

  it('returns all stored agenda items', async () => {
    await AgendaRepository.save(makeAgendaItem({ id: '1' }));
    await AgendaRepository.save(makeAgendaItem({ id: '2' }));
    expect(await AgendaRepository.getAll()).toHaveLength(2);
  });

  it('returns empty array on empty DB (graceful)', async () => {
    const all = await AgendaRepository.getAll();
    expect(Array.isArray(all)).toBe(true);
  });
});

describe('AgendaRepository.getById', () => {
  it('returns null when not found', async () => {
    expect(await AgendaRepository.getById('missing')).toBeNull();
  });

  it('returns the matching item', async () => {
    await AgendaRepository.save(makeAgendaItem({ id: 'abc' }));
    const result = await AgendaRepository.getById('abc');
    expect(result?.id).toBe('abc');
  });
});

describe('AgendaRepository.save', () => {
  it('persists a new item', async () => {
    await AgendaRepository.save(makeAgendaItem({ id: 'new-1' }));
    expect(await AgendaRepository.getAll()).toHaveLength(1);
  });

  it('upserts (replaces) existing item with same id', async () => {
    await AgendaRepository.save(makeAgendaItem({ id: 'upsert-1', notes: 'Old' }));
    await AgendaRepository.save(makeAgendaItem({ id: 'upsert-1', notes: 'New' }));
    const all = await AgendaRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].notes).toBe('New');
  });
});

describe('AgendaRepository.delete', () => {
  it('removes the item with the given id', async () => {
    await AgendaRepository.save(makeAgendaItem({ id: '1' }));
    await AgendaRepository.save(makeAgendaItem({ id: '2' }));
    await AgendaRepository.delete('1');
    const all = await AgendaRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('2');
  });

  it('is a no-op for an unknown id', async () => {
    await AgendaRepository.save(makeAgendaItem({ id: '1' }));
    await AgendaRepository.delete('missing');
    expect(await AgendaRepository.getAll()).toHaveLength(1);
  });
});

describe('AgendaRepository.updateInspectionLink', () => {
  it('links an inspection id and marks the item completed', async () => {
    await AgendaRepository.save(makeAgendaItem({ id: 'agenda-1', status: 'pending' }));
    await AgendaRepository.updateInspectionLink('agenda-1', 'inspection-99');
    const updated = await AgendaRepository.getById('agenda-1');
    expect(updated?.inspectionId).toBe('inspection-99');
    expect(updated?.status).toBe('completed');
  });

  it('is a no-op for unknown id', async () => {
    await AgendaRepository.updateInspectionLink('no-such', 'insp-x');
    // should not throw
  });
});

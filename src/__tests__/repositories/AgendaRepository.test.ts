/**
 * src/__tests__/repositories/AgendaRepository.test.ts
 * Mirror of __tests__/repositories/AgendaRepository.test.ts.
 * Fixture aligned with AgendaItem shape in src/types.ts.
 */
import { AgendaRepository } from '../../repositories/AgendaRepository';

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
});

describe('AgendaRepository.getById', () => {
  it('returns null when not found', async () => {
    expect(await AgendaRepository.getById('missing')).toBeNull();
  });

  it('returns the matching item', async () => {
    await AgendaRepository.save(makeAgendaItem({ id: 'u1' }));
    const result = await AgendaRepository.getById('u1');
    expect(result?.id).toBe('u1');
  });

  it('upserts (replaces) existing item with same id', async () => {
    await AgendaRepository.save(makeAgendaItem({ id: 'u1', notes: 'Old' }));
    await AgendaRepository.save(makeAgendaItem({ id: 'u1', notes: 'New' }));
    const all = await AgendaRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].notes).toBe('New');
  });
});

describe('AgendaRepository.delete', () => {
  it('removes the item with the given id', async () => {
    await AgendaRepository.save(makeAgendaItem({ id: 'd1' }));
    await AgendaRepository.delete('d1');
    expect(await AgendaRepository.getAll()).toHaveLength(0);
  });
});

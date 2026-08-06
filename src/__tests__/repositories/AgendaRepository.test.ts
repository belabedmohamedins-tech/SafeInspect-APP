/**
 * src/__tests__/repositories/AgendaRepository.test.ts
 * Mirrors __tests__/repositories/AgendaRepository.test.ts — named import fix.
 */
import { AgendaRepository } from '../../repositories/AgendaRepository';

const SQLite = require('expo-sqlite');

const makeAgendaItem = (overrides: Record<string, unknown> = {}) => ({
  id: 'agenda-1',
  title: 'Test Meeting',
  scheduledDate: '2026-09-01',
  status: 'scheduled',
  facilityId: 'fac-1',
  facilityName: 'Test Facility',
  inspectorId: 'insp-1',
  inspectorName: 'Ahmed',
  notes: '',
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

describe('AgendaRepository.save', () => {
  it('persists and upserts', async () => {
    await AgendaRepository.save(makeAgendaItem({ id: 'u1', title: 'Old' }));
    await AgendaRepository.save(makeAgendaItem({ id: 'u1', title: 'New' }));
    const all = await AgendaRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].title).toBe('New');
  });
});

describe('AgendaRepository.delete', () => {
  it('removes the item', async () => {
    await AgendaRepository.save(makeAgendaItem({ id: 'd1' }));
    await AgendaRepository.delete('d1');
    expect(await AgendaRepository.getAll()).toHaveLength(0);
  });
});

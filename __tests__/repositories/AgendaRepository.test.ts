/**
 * __tests__/repositories/AgendaRepository.test.ts
 * Z6-TSC: aligned with AgendaItem type (date, not scheduledDate/title).
 */
import { AgendaRepository } from '../../src/repositories/AgendaRepository';
import type { AgendaItem } from '../../src/types';

function makeAgendaItem(overrides: Partial<AgendaItem> = {}): AgendaItem {
  return {
    id: 'agenda-default',
    facilityId: 'fac-1',
    facilityName: 'Test Facility',
    date: '2026-08-01',
    notes: '',
    status: 'pending',
    ...overrides,
  };
}

beforeEach(async () => {
  await AgendaRepository.clear();
});

describe('AgendaRepository', () => {
  it('saves and retrieves all items', async () => {
    await AgendaRepository.save(makeAgendaItem({ id: '1' }));
    await AgendaRepository.save(makeAgendaItem({ id: '2' }));
    const all = await AgendaRepository.getAll();
    expect(all).toHaveLength(2);
  });

  it('retrieves by id', async () => {
    await AgendaRepository.save(makeAgendaItem({ id: 'abc' }));
    const found = await AgendaRepository.getById('abc');
    expect(found).not.toBeNull();
    expect(found?.id).toBe('abc');
  });

  it('upserts correctly (save twice = update)', async () => {
    await AgendaRepository.save(makeAgendaItem({ id: 'upsert-1', facilityName: 'Old' }));
    await AgendaRepository.save(makeAgendaItem({ id: 'upsert-1', facilityName: 'New' }));
    const all = await AgendaRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].facilityName).toBe('New');
  });

  it('deletes an item', async () => {
    await AgendaRepository.save(makeAgendaItem({ id: 'new-1' }));
    await AgendaRepository.delete('new-1');
    const all = await AgendaRepository.getAll();
    expect(all).toHaveLength(0);
  });

  it('returns null for unknown id', async () => {
    const result = await AgendaRepository.getById('nonexistent');
    expect(result).toBeNull();
  });

  it('filters by status', async () => {
    await AgendaRepository.save(makeAgendaItem({ id: '1' }));
    await AgendaRepository.save(makeAgendaItem({ id: '2' }));
    const pending = await AgendaRepository.getByStatus('pending');
    expect(pending.length).toBeGreaterThanOrEqual(2);
  });

  it('getByFacility returns matching items', async () => {
    await AgendaRepository.save(makeAgendaItem({ id: '1', facilityId: 'fac-A' }));
    await AgendaRepository.save(makeAgendaItem({ id: '2', facilityId: 'fac-B' }));
    const result = await AgendaRepository.getByFacility('fac-A');
    expect(result).toHaveLength(1);
    expect(result[0].facilityId).toBe('fac-A');
  });

  it('clears all items', async () => {
    await AgendaRepository.save(makeAgendaItem({ id: 'agenda-1', status: 'pending' }));
    await AgendaRepository.clear();
    const all = await AgendaRepository.getAll();
    expect(all).toHaveLength(0);
  });
});

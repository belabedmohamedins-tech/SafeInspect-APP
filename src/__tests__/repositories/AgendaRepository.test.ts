/**
 * src/__tests__/repositories/AgendaRepository.test.ts
 * Z6-TSC: aligned with AgendaItem type (date, not scheduledDate/title).
 */
import { AgendaRepository } from '../../repositories/AgendaRepository';
import type { AgendaItem } from '../../types';

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

describe('AgendaRepository (src)', () => {
  it('saves and retrieves all items', async () => {
    await AgendaRepository.save(makeAgendaItem({ id: '1' }));
    await AgendaRepository.save(makeAgendaItem({ id: '2' }));
    const all = await AgendaRepository.getAll();
    expect(all).toHaveLength(2);
  });

  it('upserts correctly', async () => {
    await AgendaRepository.save(makeAgendaItem({ id: 'u1', facilityName: 'Old' }));
    await AgendaRepository.save(makeAgendaItem({ id: 'u1', facilityName: 'New' }));
    const all = await AgendaRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].facilityName).toBe('New');
  });

  it('deletes an item', async () => {
    await AgendaRepository.save(makeAgendaItem({ id: 'd1' }));
    await AgendaRepository.delete('d1');
    const all = await AgendaRepository.getAll();
    expect(all).toHaveLength(0);
  });
});

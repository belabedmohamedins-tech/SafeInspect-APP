// src/__tests__/repositories/AgendaRepository.test.ts
import { AgendaRepository } from '../../repositories/AgendaRepository';
import { AgendaItem } from '../../types';

const tomorrow = () => new Date(Date.now() + 86_400_000).toISOString();

const makeItem = (overrides: Partial<AgendaItem> = {}): AgendaItem => ({
  id: 'agenda-1',
  facilityId: 'fac-1',
  facilityName: 'Test Facility',
  date: tomorrow(),
  notes: '',
  status: 'pending',
  ...overrides,
});

describe('AgendaRepository', () => {
  beforeEach(async () => {
    const all = await AgendaRepository.getAll();
    for (const a of all) await AgendaRepository.delete(a.id);
  });

  it('saves and retrieves an agenda item', async () => {
    await AgendaRepository.save(makeItem());
    const all = await AgendaRepository.getAll();
    expect(all.length).toBeGreaterThan(0);
    expect(all[0].facilityName).toBe('Test Facility');
  });

  it('updates status', async () => {
    const item = makeItem();
    await AgendaRepository.save(item);
    await AgendaRepository.save({ ...item, status: 'done' } as AgendaItem);
    const all = await AgendaRepository.getAll();
    const found = all.find(a => a.id === item.id);
    expect(found?.status).toBe('done');
  });
});

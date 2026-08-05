// src/__tests__/repositories/AgendaRepository.test.ts
import { AgendaRepository } from '../../repositories/AgendaRepository';
import { AgendaItem } from '../../types';

const tomorrow = () => new Date(Date.now() + 86400000).toISOString();

const makeItem = (overrides: Partial<AgendaItem> = {}): Omit<AgendaItem, 'id'> => ({
  facilityId:      'fac-1',
  facilityName:    'Test Facility',
  date:            tomorrow(),
  notes:           '',
  status:          'pending',
  ...overrides,
});

describe('AgendaRepository', () => {
  beforeEach(async () => {
    const all = await AgendaRepository.getAll();
    for (const a of all) { await AgendaRepository.delete(a.id); }
  });

  it('saves and retrieves an agenda item', async () => {
    const saved = await AgendaRepository.save(makeItem() as AgendaItem);
    expect(saved.facilityName).toBe('Test Facility');
    expect(saved.status).toBe('pending');
  });

  it('updates status', async () => {
    const first = await AgendaRepository.save(makeItem() as AgendaItem);
    const updated = await AgendaRepository.save({ ...first, status: 'done' } as AgendaItem);
    expect(updated.status).toBe('done');
  });
});

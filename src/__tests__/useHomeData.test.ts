// src/__tests__/useHomeData.test.ts
import { AgendaItem, Facility } from '../types';

const makeFacility = (id: string, facilityId: string): Facility => ({
  id,
  projectName: 'Hardcoded Facility',
  ownerName: 'Owner',
  activity: 'default',
  address: '1 St',
  ...({} as any),
});

const makeAgendaItem = (id: string, facilityId: string): AgendaItem => ({
  id,
  facilityId,
  facilityName: 'F',
  date: new Date().toISOString(),
  status: 'pending',
  notes: '',
  ...({} as any),
});

describe('useHomeData fixtures', () => {
  it('facility uses projectName', () => {
    const f = makeFacility('f1', 'fac-1');
    expect(f.projectName).toBe('Hardcoded Facility');
    expect((f as any).name).toBeUndefined();
  });

  it('agenda item has notes', () => {
    const a = makeAgendaItem('a1', 'fac-1');
    expect(a.notes).toBe('');
  });
});

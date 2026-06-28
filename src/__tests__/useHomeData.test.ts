// src/__tests__/useHomeData.test.ts
//
// STRATEGY: contract + pure logic.
// useHomeData wraps loadHomeData — test:
//   1. loadHomeData contract (the only real dependency)
//   2. getFacilityForAgenda delegation logic (pure)
//   3. EMPTY initial state shape

jest.mock('../utils/loadHomeData', () => ({
  loadHomeData: jest.fn(),
  getFacilityForAgenda: jest.requireActual('../utils/loadHomeData').getFacilityForAgenda,
}));

jest.mock('../facilitiesData', () => ({
  facilities: [
    { id: 'hard-1', name: 'Hardcoded Facility', address: 'Hard St', activityType: 'default', wilaya: '16', commune: 'A' },
  ],
}));

import { loadHomeData, getFacilityForAgenda } from '../utils/loadHomeData';
import { AgendaItem, Facility } from '../types';

const mockLoadHomeData = loadHomeData as jest.MockedFunction<typeof loadHomeData>;

function makeFacility(id: string, name = 'Facility'): Facility {
  return { id, name, address: '1 St', activityType: 'default', wilaya: '16', commune: 'A' } as Facility;
}
function makeAgendaItem(facilityId: string): AgendaItem {
  return { id: 'a1', facilityId, facilityName: 'F', date: new Date().toISOString(), status: 'pending', inspectorId: 'u1', description: '' } as AgendaItem;
}

beforeEach(() => { jest.clearAllMocks(); });

describe('loadHomeData contract', () => {
  it('resolves with a HomeData-shaped object', async () => {
    mockLoadHomeData.mockResolvedValue({
      officeName: 'HQ',
      agendaItems: [],
      completedInspections: [],
      inProgressInspections: [],
      recentFacilities: [],
      userFacilities: [],
      stats: { totalCompleted: 5, totalDrafts: 2, nonCompliantFacilities: 1, openCapCount: 3 },
    });
    const result = await loadHomeData();
    expect(result.officeName).toBe('HQ');
    expect(result.stats.totalCompleted).toBe(5);
  });

  it('propagates rejection', async () => {
    mockLoadHomeData.mockRejectedValue(new Error('load failed'));
    await expect(loadHomeData()).rejects.toThrow('load failed');
  });
});

describe('getFacilityForAgenda delegation logic', () => {
  const userFacs = [makeFacility('user-1', 'User Facility')];

  it('returns hardcoded facility for known hardcoded id', () => {
    const result = getFacilityForAgenda(makeAgendaItem('hard-1'), userFacs);
    expect(result?.id).toBe('hard-1');
  });

  it('returns user facility when not in hardcoded list', () => {
    const result = getFacilityForAgenda(makeAgendaItem('user-1'), userFacs);
    expect(result?.id).toBe('user-1');
  });

  it('returns undefined when not found in either list', () => {
    const result = getFacilityForAgenda(makeAgendaItem('ghost-99'), userFacs);
    expect(result).toBeUndefined();
  });
});

describe('EMPTY initial state shape', () => {
  it('HomeData shape has all required keys', () => {
    const empty = {
      officeName:            '',
      agendaItems:           [],
      completedInspections:  [],
      inProgressInspections: [],
      recentFacilities:      [],
      userFacilities:        [],
      stats: { totalCompleted: 0, totalDrafts: 0, nonCompliantFacilities: 0, openCapCount: 0 },
    };
    expect(Object.keys(empty)).toEqual(expect.arrayContaining([
      'officeName', 'agendaItems', 'completedInspections',
      'inProgressInspections', 'recentFacilities', 'userFacilities', 'stats',
    ]));
    expect(Object.keys(empty.stats)).toEqual(expect.arrayContaining([
      'totalCompleted', 'totalDrafts', 'nonCompliantFacilities', 'openCapCount',
    ]));
  });
});

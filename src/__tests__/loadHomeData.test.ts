// src/__tests__/loadHomeData.test.ts
//
// STRATEGY: contract + pure logic.
// loadHomeData is a plain async function (no React) — call it directly.
// getFacilityForAgenda is a pure function — test inline.

jest.mock('../repositories/SettingsRepository', () => ({
  SettingsRepository: { get: jest.fn() },
}));
jest.mock('../repositories/AgendaRepository', () => ({
  AgendaRepository: { getAll: jest.fn() },
}));
jest.mock('../repositories/InspectionRepository', () => ({
  InspectionRepository: { getCompleted: jest.fn(), getDrafts: jest.fn() },
}));
jest.mock('../repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: { getOpen: jest.fn() },
}));
jest.mock('../facilitiesService', () => ({
  getUserFacilities: jest.fn(),
}));
jest.mock('../facilitiesData', () => ({
  facilities: [
    { id: 'hard-1', name: 'Hardcoded Facility', address: 'Hard St', activityType: 'default', wilaya: '16', commune: 'A' },
  ],
}));

import { SettingsRepository } from '../repositories/SettingsRepository';
import { AgendaRepository } from '../repositories/AgendaRepository';
import { InspectionRepository } from '../repositories/InspectionRepository';
import { CorrectiveActionRepository } from '../repositories/CorrectiveActionRepository';
import { getUserFacilities } from '../facilitiesService';
import { loadHomeData, getFacilityForAgenda } from '../utils/loadHomeData';
import { AgendaItem, Facility, SavedInspection } from '../types';

const mockGet              = SettingsRepository.get              as jest.MockedFunction<any>;
const mockGetAllAgenda     = AgendaRepository.getAll             as jest.MockedFunction<any>;
const mockGetCompleted     = InspectionRepository.getCompleted   as jest.MockedFunction<any>;
const mockGetDrafts        = InspectionRepository.getDrafts      as jest.MockedFunction<any>;
const mockGetOpen          = CorrectiveActionRepository.getOpen  as jest.MockedFunction<any>;
const mockGetUserFacilities = getUserFacilities                  as jest.MockedFunction<any>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeFacility(id: string, name = 'Facility'): Facility {
  return { id, name, address: '1 St', activityType: 'default', wilaya: '16', commune: 'A' } as Facility;
}

function makeInspection(overrides: Partial<SavedInspection> = {}): SavedInspection {
  return {
    id: 'i1', facilityId: 'f1', facilityName: 'F', facilityAddress: 'A',
    date: new Date().toISOString(), inspectorName: 'X', officeName: 'O',
    status: 'completed', items: [], inspectionCause: '', referenceDocument: '', committeeMembers: [],
    ...overrides,
  } as SavedInspection;
}

function makeAgendaItem(overrides: Partial<AgendaItem> = {}): AgendaItem {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return {
    id: 'a1', facilityId: 'f1', facilityName: 'F', date: tomorrow.toISOString(),
    status: 'pending', inspectorId: 'u1', description: '',
    ...overrides,
  } as AgendaItem;
}

function setDefaults() {
  mockGet.mockResolvedValue({ officeName: 'Test Office' });
  mockGetAllAgenda.mockResolvedValue([]);
  mockGetCompleted.mockResolvedValue([]);
  mockGetDrafts.mockResolvedValue([]);
  mockGetOpen.mockResolvedValue([]);
  mockGetUserFacilities.mockResolvedValue([]);
}

beforeEach(() => {
  jest.clearAllMocks();
  setDefaults();
});

// ─── Repository contracts ────────────────────────────────────────────────────────
describe('repository contracts', () => {
  it('calls all 6 dependencies once per load', async () => {
    await loadHomeData();
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGetAllAgenda).toHaveBeenCalledTimes(1);
    expect(mockGetCompleted).toHaveBeenCalledTimes(1);
    expect(mockGetDrafts).toHaveBeenCalledTimes(1);
    expect(mockGetOpen).toHaveBeenCalledTimes(1);
    expect(mockGetUserFacilities).toHaveBeenCalledTimes(1);
  });

  it('resolves even when settings returns null', async () => {
    mockGet.mockResolvedValue(null);
    const result = await loadHomeData();
    expect(result.officeName).toBe('');
  });

  it('propagates rejection when a repository throws', async () => {
    mockGetCompleted.mockRejectedValue(new Error('db error'));
    await expect(loadHomeData()).rejects.toThrow('db error');
  });
});

// ─── officeName ───────────────────────────────────────────────────────────────────────
describe('officeName', () => {
  it('returns officeName from settings', async () => {
    mockGet.mockResolvedValue({ officeName: 'Central Office' });
    const result = await loadHomeData();
    expect(result.officeName).toBe('Central Office');
  });

  it('returns empty string when officeName is undefined', async () => {
    mockGet.mockResolvedValue({});
    const result = await loadHomeData();
    expect(result.officeName).toBe('');
  });
});

// ─── Agenda filtering ─────────────────────────────────────────────────────────────────
describe('agenda filtering', () => {
  it('excludes completed agenda items', async () => {
    mockGetAllAgenda.mockResolvedValue([
      makeAgendaItem({ id: 'done', status: 'completed' }),
      makeAgendaItem({ id: 'pend', status: 'pending' }),
    ]);
    const result = await loadHomeData();
    expect(result.agendaItems.find(i => i.id === 'done')).toBeUndefined();
    expect(result.agendaItems.find(i => i.id === 'pend')).toBeDefined();
  });

  it('excludes past agenda items', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    mockGetAllAgenda.mockResolvedValue([
      makeAgendaItem({ id: 'past', date: yesterday.toISOString(), status: 'pending' }),
    ]);
    const result = await loadHomeData();
    expect(result.agendaItems).toHaveLength(0);
  });

  it('includes today\'s agenda items', async () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    mockGetAllAgenda.mockResolvedValue([
      makeAgendaItem({ id: 'today', date: today.toISOString(), status: 'pending' }),
    ]);
    const result = await loadHomeData();
    expect(result.agendaItems).toHaveLength(1);
  });

  it('returns at most 3 agenda items', async () => {
    const items = Array.from({ length: 5 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i + 1);
      return makeAgendaItem({ id: `a${i}`, date: d.toISOString() });
    });
    mockGetAllAgenda.mockResolvedValue(items);
    const result = await loadHomeData();
    expect(result.agendaItems).toHaveLength(3);
  });

  it('sorts agenda items ascending by date', async () => {
    const d1 = new Date(); d1.setDate(d1.getDate() + 3);
    const d2 = new Date(); d2.setDate(d2.getDate() + 1);
    const d3 = new Date(); d3.setDate(d3.getDate() + 2);
    mockGetAllAgenda.mockResolvedValue([
      makeAgendaItem({ id: 'far',  date: d1.toISOString() }),
      makeAgendaItem({ id: 'near', date: d2.toISOString() }),
      makeAgendaItem({ id: 'mid',  date: d3.toISOString() }),
    ]);
    const result = await loadHomeData();
    expect(result.agendaItems[0].id).toBe('near');
    expect(result.agendaItems[1].id).toBe('mid');
    expect(result.agendaItems[2].id).toBe('far');
  });

  it('returns empty agendaItems when all are filtered out', async () => {
    mockGetAllAgenda.mockResolvedValue([]);
    const result = await loadHomeData();
    expect(result.agendaItems).toEqual([]);
  });
});

// ─── Stats computation ────────────────────────────────────────────────────────────────
describe('stats computation', () => {
  it('totalCompleted reflects full completed list length', async () => {
    mockGetCompleted.mockResolvedValue([
      makeInspection({ id: 'c1' }),
      makeInspection({ id: 'c2' }),
      makeInspection({ id: 'c3' }),
      makeInspection({ id: 'c4' }),
    ]);
    const result = await loadHomeData();
    expect(result.stats.totalCompleted).toBe(4);
  });

  it('totalDrafts reflects full drafts list length', async () => {
    mockGetDrafts.mockResolvedValue([
      makeInspection({ id: 'd1', status: 'in-progress' }),
      makeInspection({ id: 'd2', status: 'in-progress' }),
    ]);
    const result = await loadHomeData();
    expect(result.stats.totalDrafts).toBe(2);
  });

  it('openCapCount reflects getOpen length', async () => {
    mockGetOpen.mockResolvedValue([{ id: 'cap1' }, { id: 'cap2' }, { id: 'cap3' }]);
    const result = await loadHomeData();
    expect(result.stats.openCapCount).toBe(3);
  });

  it('nonCompliantFacilities counts completed inspections with non-compliant items', async () => {
    const nonCompliantInspection = makeInspection({
      id: 'nc1',
      items: [{ id: 'i1', criteria: 'C', legalReference: 'R', severity: 'high', axis: 'A', complianceStatus: 'non-compliant', comment: '', photos: [] }],
    });
    const compliantInspection = makeInspection({
      id: 'ok1',
      items: [{ id: 'i2', criteria: 'C', legalReference: 'R', severity: 'low',  axis: 'A', complianceStatus: 'compliant',     comment: '', photos: [] }],
    });
    // Only the last 3 reversed are checked — provide exactly these 2
    mockGetCompleted.mockResolvedValue([compliantInspection, nonCompliantInspection]);
    const result = await loadHomeData();
    expect(result.stats.nonCompliantFacilities).toBe(1);
  });

  it('nonCompliantFacilities is 0 when all inspections are compliant', async () => {
    mockGetCompleted.mockResolvedValue([
      makeInspection({ items: [{ id: 'i1', criteria: 'C', legalReference: 'R', severity: 'low', axis: 'A', complianceStatus: 'compliant', comment: '', photos: [] }] }),
    ]);
    const result = await loadHomeData();
    expect(result.stats.nonCompliantFacilities).toBe(0);
  });
});

// ─── Inspection slicing ────────────────────────────────────────────────────────────────
describe('inspection slicing', () => {
  it('completedInspections returns at most 3, most recent first', async () => {
    const items = Array.from({ length: 5 }, (_, i) => makeInspection({ id: `c${i}` }));
    mockGetCompleted.mockResolvedValue(items);
    const result = await loadHomeData();
    expect(result.completedInspections).toHaveLength(3);
    // last 3 reversed: indices 4, 3, 2
    expect(result.completedInspections[0].id).toBe('c4');
    expect(result.completedInspections[2].id).toBe('c2');
  });

  it('inProgressInspections returns at most 3, most recent first', async () => {
    const items = Array.from({ length: 4 }, (_, i) => makeInspection({ id: `d${i}`, status: 'in-progress' }));
    mockGetDrafts.mockResolvedValue(items);
    const result = await loadHomeData();
    expect(result.inProgressInspections).toHaveLength(3);
    expect(result.inProgressInspections[0].id).toBe('d3');
  });
});

// ─── Recent facilities ─────────────────────────────────────────────────────────────────
describe('recent facilities', () => {
  it('returns at most 3 recent facilities, most recent first', async () => {
    const facs = Array.from({ length: 5 }, (_, i) => makeFacility(`f${i}`, `Fac ${i}`));
    mockGetUserFacilities.mockResolvedValue(facs);
    const result = await loadHomeData();
    expect(result.recentFacilities).toHaveLength(3);
    expect(result.recentFacilities[0].id).toBe('f4');
  });

  it('userFacilities contains the full list', async () => {
    const facs = [makeFacility('f1'), makeFacility('f2')];
    mockGetUserFacilities.mockResolvedValue(facs);
    const result = await loadHomeData();
    expect(result.userFacilities).toHaveLength(2);
  });
});

// ─── getFacilityForAgenda pure logic ──────────────────────────────────────────────────
describe('getFacilityForAgenda', () => {
  const userFacs = [makeFacility('user-1', 'User Facility')];

  it('returns hardcoded facility when facilityId matches hardcoded list', () => {
    const item = makeAgendaItem({ facilityId: 'hard-1' });
    const result = getFacilityForAgenda(item, userFacs);
    expect(result?.id).toBe('hard-1');
    expect(result?.name).toBe('Hardcoded Facility');
  });

  it('falls back to userFacilities when not in hardcoded list', () => {
    const item = makeAgendaItem({ facilityId: 'user-1' });
    const result = getFacilityForAgenda(item, userFacs);
    expect(result?.id).toBe('user-1');
    expect(result?.name).toBe('User Facility');
  });

  it('returns undefined when facility not found in either list', () => {
    const item = makeAgendaItem({ facilityId: 'unknown-99' });
    const result = getFacilityForAgenda(item, userFacs);
    expect(result).toBeUndefined();
  });

  it('prefers hardcoded over userFacilities when both match same id', () => {
    const userWithSameId = [makeFacility('hard-1', 'User Version')];
    const item = makeAgendaItem({ facilityId: 'hard-1' });
    const result = getFacilityForAgenda(item, userWithSameId);
    expect(result?.name).toBe('Hardcoded Facility');
  });
});

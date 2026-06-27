// src/__tests__/useHomeData.test.ts
// Tests the pure loadHomeData() function directly — no React, no hooks, no timeouts.
import { loadHomeData, getFacilityForAgenda } from '../utils/loadHomeData';
import { AgendaItem, Facility, SavedInspection } from '../types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockSettingsGet      = jest.fn().mockResolvedValue({ officeName: 'مكتب التجربة' });
const mockAgendaGetAll     = jest.fn().mockResolvedValue([]);
const mockGetCompleted     = jest.fn().mockResolvedValue([]);
const mockGetDrafts        = jest.fn().mockResolvedValue([]);
const mockGetUserFacilities = jest.fn().mockResolvedValue([]);

jest.mock('../repositories/SettingsRepository', () => ({
  SettingsRepository: { get: () => mockSettingsGet() },
}));
jest.mock('../repositories/AgendaRepository', () => ({
  AgendaRepository: { getAll: () => mockAgendaGetAll() },
}));
jest.mock('../repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getCompleted: () => mockGetCompleted(),
    getDrafts:    () => mockGetDrafts(),
  },
}));
jest.mock('../facilitiesService', () => ({
  getUserFacilities: () => mockGetUserFacilities(),
}));

const FAKE_FACILITY: Facility = {
  id: 'fac-1',
  projectName: 'منشأة التجربة',
  ownerName: 'مالك',
  activity: 'مخبز',
  address: '',
};
jest.mock('../facilitiesData', () => ({ facilities: [FAKE_FACILITY] }));
jest.mock('./statusUtils', () => ({
  getComplianceSummary: (items: any[]) => ({
    nonCompliant: items.filter((i: any) => i.complianceStatus === 'non-compliant').length,
  }),
}), { virtual: true });

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeAgenda = (id: string, date: string, completed = false): AgendaItem => ({
  id,
  facilityId: 'fac-1',
  facilityName: 'منشأة',
  date,
  notes: '',
  status: completed ? 'completed' : 'pending',
});

const makeInsp = (
  id: string,
  status: 'completed' | 'in-progress',
  nonCompliant = 0
): SavedInspection => ({
  id, facilityId: 'f1', facilityName: 'منشأة', facilityAddress: '',
  date: '2026-05-01T00:00:00Z',
  inspectorName: '', status, officeName: '', inspectionCause: '',
  referenceDocument: '', committeeMembers: [],
  items: Array.from({ length: nonCompliant }, (_, i) => ({
    id: `item-${i}`,
    criteria: '',
    legalReference: '',
    severity: 'low' as const,
    axis: '',
    complianceStatus: 'non-compliant' as const,
    comment: '',
  })),
});

beforeEach(() => {
  jest.clearAllMocks();
  mockSettingsGet.mockResolvedValue({ officeName: 'مكتب التجربة' });
  mockAgendaGetAll.mockResolvedValue([]);
  mockGetCompleted.mockResolvedValue([]);
  mockGetDrafts.mockResolvedValue([]);
  mockGetUserFacilities.mockResolvedValue([]);
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('loadHomeData — settings', () => {
  it('loads officeName', async () => {
    mockSettingsGet.mockResolvedValue({ officeName: 'مكتب الجهوية' });
    const data = await loadHomeData();
    expect(data.officeName).toBe('مكتب الجهوية');
  });

  it('defaults officeName to empty string when missing', async () => {
    mockSettingsGet.mockResolvedValue({});
    const data = await loadHomeData();
    expect(data.officeName).toBe('');
  });
});

describe('loadHomeData — agenda filtering', () => {
  const FUTURE = '2099-12-31T00:00:00Z';
  const PAST   = '2000-01-01T00:00:00Z';

  it('excludes completed agenda items', async () => {
    mockAgendaGetAll.mockResolvedValue([makeAgenda('done', FUTURE, true)]);
    const data = await loadHomeData();
    expect(data.agendaItems).toHaveLength(0);
  });

  it('excludes past agenda items', async () => {
    mockAgendaGetAll.mockResolvedValue([makeAgenda('old', PAST)]);
    const data = await loadHomeData();
    expect(data.agendaItems).toHaveLength(0);
  });

  it('sorts upcoming items chronologically and limits to 3', async () => {
    mockAgendaGetAll.mockResolvedValue([
      makeAgenda('a4', '2099-04-01T00:00:00Z'),
      makeAgenda('a2', '2099-02-01T00:00:00Z'),
      makeAgenda('a1', '2099-01-01T00:00:00Z'),
      makeAgenda('a3', '2099-03-01T00:00:00Z'),
    ]);
    const data = await loadHomeData();
    expect(data.agendaItems).toHaveLength(3);
    expect(data.agendaItems[0].id).toBe('a1');
    expect(data.agendaItems[1].id).toBe('a2');
    expect(data.agendaItems[2].id).toBe('a3');
  });
});

describe('loadHomeData — inspections', () => {
  it('returns at most 3 most-recent completed inspections (reversed)', async () => {
    mockGetCompleted.mockResolvedValue([
      makeInsp('c1', 'completed'), makeInsp('c2', 'completed'),
      makeInsp('c3', 'completed'), makeInsp('c4', 'completed'),
    ]);
    const data = await loadHomeData();
    expect(data.completedInspections).toHaveLength(3);
    expect(data.completedInspections[0].id).toBe('c4');
  });

  it('returns at most 3 most-recent drafts (reversed)', async () => {
    mockGetDrafts.mockResolvedValue([
      makeInsp('d1', 'in-progress'), makeInsp('d2', 'in-progress'),
      makeInsp('d3', 'in-progress'), makeInsp('d4', 'in-progress'),
    ]);
    const data = await loadHomeData();
    expect(data.inProgressInspections).toHaveLength(3);
    expect(data.inProgressInspections[0].id).toBe('d4');
  });
});

describe('loadHomeData — facilities', () => {
  it('returns at most 3 most-recent user facilities (reversed)', async () => {
    const facs = ['f1', 'f2', 'f3', 'f4'].map(id => ({ ...FAKE_FACILITY, id }));
    mockGetUserFacilities.mockResolvedValue(facs);
    const data = await loadHomeData();
    expect(data.recentFacilities).toHaveLength(3);
    expect(data.recentFacilities[0].id).toBe('f4');
  });
});

describe('loadHomeData — stats', () => {
  it('counts inspections with >0 non-compliant items', async () => {
    mockGetCompleted.mockResolvedValue([
      makeInsp('ok',  'completed', 0),
      makeInsp('bad', 'completed', 2),
    ]);
    const data = await loadHomeData();
    expect(data.stats.nonCompliantFacilities).toBe(1);
  });

  it('totalCompleted and totalDrafts reflect loaded counts', async () => {
    mockGetCompleted.mockResolvedValue([makeInsp('c1', 'completed'), makeInsp('c2', 'completed')]);
    mockGetDrafts.mockResolvedValue([makeInsp('d1', 'in-progress')]);
    const data = await loadHomeData();
    expect(data.stats.totalCompleted).toBe(2);
    expect(data.stats.totalDrafts).toBe(1);
  });
});

describe('getFacilityForAgenda', () => {
  it('returns matching facility from hardcoded list', () => {
    const agenda = makeAgenda('a1', '2099-01-01T00:00:00Z');
    expect(getFacilityForAgenda(agenda, [])).toEqual(FAKE_FACILITY);
  });

  it('returns matching facility from user list if not in hardcoded', () => {
    const userFac = { ...FAKE_FACILITY, id: 'user-fac' };
    const agenda  = { ...makeAgenda('a1', '2099-01-01T00:00:00Z'), facilityId: 'user-fac' };
    expect(getFacilityForAgenda(agenda, [userFac])).toEqual(userFac);
  });

  it('returns undefined for unknown facilityId', () => {
    const agenda = { ...makeAgenda('a1', '2099-01-01T00:00:00Z'), facilityId: 'unknown' };
    expect(getFacilityForAgenda(agenda, [])).toBeUndefined();
  });
});

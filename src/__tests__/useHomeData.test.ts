/**
 * Unit tests for src/hooks/useHomeData.ts
 */
import { act, renderHook } from '@testing-library/react-hooks';
import { useHomeData } from '../hooks/useHomeData';
import { SavedInspection, AgendaItem, Facility } from '../types';

// ─── Flush all pending promises ──────────────────────────────────────
const flushPromises = () => new Promise(resolve => setImmediate(resolve));

// ─── Mocks ──────────────────────────────────────────────────────────

jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => () => void) => { cb(); },
}));

const mockSettingsGet   = jest.fn().mockResolvedValue({ officeName: 'مكتب التجربة' });
jest.mock('../repositories/SettingsRepository', () => ({
  SettingsRepository: { get: () => mockSettingsGet() },
}));

const mockAgendaGetAll   = jest.fn().mockResolvedValue([]);
jest.mock('../repositories/AgendaRepository', () => ({
  AgendaRepository: { getAll: () => mockAgendaGetAll() },
}));

const mockGetCompleted = jest.fn().mockResolvedValue([]);
const mockGetDrafts    = jest.fn().mockResolvedValue([]);
jest.mock('../repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getCompleted: () => mockGetCompleted(),
    getDrafts:    () => mockGetDrafts(),
  },
}));

const mockGetUserFacilities = jest.fn().mockResolvedValue([]);
jest.mock('../facilitiesService', () => ({
  getUserFacilities: () => mockGetUserFacilities(),
}));

// facilitiesData is used by getFacilityForAgenda — provide a stub
const FAKE_FACILITY: Facility = {
  id: 'fac-hardcoded',
  projectName: 'منشأة التجربة',
  ownerName: 'مالك',
  activity: 'مخبز',
  address: '',
  category: '',
  phone: '',
  registrationNumber: '',
};
jest.mock('../facilitiesData', () => ({
  facilities: [FAKE_FACILITY],
}));

// ─── Helpers ──────────────────────────────────────────────────────────

const makeAgenda = (id: string, date: string, completed = false): AgendaItem => ({
  id, facilityId: 'fac-hardcoded', facilityName: 'منشأة',
  date, completed, cause: '', reference: '', notes: '',
  committeeMembers: [], writer: '',
});

const makeInsp = (
  id: string,
  status: 'completed' | 'in-progress',
  nonCompliant = 0
): SavedInspection => ({
  id, facilityId: 'f1', facilityName: 'منشأة', facilityAddress: '', date: '2026-05-01T00:00:00Z',
  inspectorName: '', status, officeName: '', inspectionCause: '',
  referenceDocument: '', committeeMembers: [],
  items: Array.from({ length: nonCompliant }, (_, i) => ({
    id: `item-${i}`, criteria: '', legalReference: '', axis: '',
    complianceStatus: 'non-compliant' as const, comment: '',
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

// ─── Helper: render hook and wait for async state updates ────────────
async function renderAndWait() {
  const hook = renderHook(() => useHomeData());
  await act(async () => { await flushPromises(); });
  return hook;
}

// ─── Tests ──────────────────────────────────────────────────────────

describe('useHomeData — settings', () => {
  it('loads officeName from SettingsRepository', async () => {
    mockSettingsGet.mockResolvedValue({ officeName: 'مكتب التجربة الجهوية' });
    const { result } = await renderAndWait();
    expect(result.current.officeName).toBe('مكتب التجربة الجهوية');
  });
});

describe('useHomeData — agenda filtering', () => {
  const FUTURE  = '2099-12-31T00:00:00Z';
  const PAST    = '2000-01-01T00:00:00Z';

  it('excludes completed agenda items', async () => {
    mockAgendaGetAll.mockResolvedValue([makeAgenda('done', FUTURE, true)]);
    const { result } = await renderAndWait();
    expect(result.current.agendaItems).toHaveLength(0);
  });

  it('excludes past (before today) agenda items', async () => {
    mockAgendaGetAll.mockResolvedValue([makeAgenda('old', PAST)]);
    const { result } = await renderAndWait();
    expect(result.current.agendaItems).toHaveLength(0);
  });

  it('sorts upcoming items chronologically and limits to 3', async () => {
    mockAgendaGetAll.mockResolvedValue([
      makeAgenda('a4', '2099-04-01T00:00:00Z'),
      makeAgenda('a2', '2099-02-01T00:00:00Z'),
      makeAgenda('a1', '2099-01-01T00:00:00Z'),
      makeAgenda('a3', '2099-03-01T00:00:00Z'),
    ]);
    const { result } = await renderAndWait();
    expect(result.current.agendaItems).toHaveLength(3);
    expect(result.current.agendaItems[0].id).toBe('a1');
    expect(result.current.agendaItems[1].id).toBe('a2');
    expect(result.current.agendaItems[2].id).toBe('a3');
  });
});

describe('useHomeData — inspections', () => {
  it('loads at most 3 most-recent completed inspections (reversed)', async () => {
    mockGetCompleted.mockResolvedValue([
      makeInsp('c1', 'completed'), makeInsp('c2', 'completed'),
      makeInsp('c3', 'completed'), makeInsp('c4', 'completed'),
    ]);
    const { result } = await renderAndWait();
    expect(result.current.completedInspections).toHaveLength(3);
    // slice(-3) gives c2,c3,c4 → reversed: c4,c3,c2
    expect(result.current.completedInspections[0].id).toBe('c4');
  });

  it('loads at most 3 most-recent drafts (reversed)', async () => {
    mockGetDrafts.mockResolvedValue([
      makeInsp('d1', 'in-progress'), makeInsp('d2', 'in-progress'),
      makeInsp('d3', 'in-progress'), makeInsp('d4', 'in-progress'),
    ]);
    const { result } = await renderAndWait();
    expect(result.current.inProgressInspections).toHaveLength(3);
    expect(result.current.inProgressInspections[0].id).toBe('d4');
  });
});

describe('useHomeData — facilities', () => {
  it('loads at most 3 most-recent user facilities (reversed)', async () => {
    const facs = ['f1','f2','f3','f4'].map(id => ({ ...FAKE_FACILITY, id }));
    mockGetUserFacilities.mockResolvedValue(facs);
    const { result } = await renderAndWait();
    expect(result.current.recentFacilities).toHaveLength(3);
    expect(result.current.recentFacilities[0].id).toBe('f4');
  });
});

describe('useHomeData — derived stats', () => {
  it('stats.nonCompliantFacilities counts inspections with >0 non-compliant items', async () => {
    mockGetCompleted.mockResolvedValue([
      makeInsp('ok',  'completed', 0),
      makeInsp('bad', 'completed', 2),
    ]);
    const { result } = await renderAndWait();
    expect(result.current.stats.nonCompliantFacilities).toBe(1);
  });

  it('stats.totalCompleted and totalDrafts reflect loaded counts', async () => {
    mockGetCompleted.mockResolvedValue([makeInsp('c1','completed'), makeInsp('c2','completed')]);
    mockGetDrafts.mockResolvedValue([makeInsp('d1','in-progress')]);
    const { result } = await renderAndWait();
    expect(result.current.stats.totalCompleted).toBe(2);
    expect(result.current.stats.totalDrafts).toBe(1);
  });
});

describe('useHomeData — getFacilityForAgenda', () => {
  it('returns the matching facility from the hardcoded list', async () => {
    const { result } = await renderAndWait();
    const agenda = makeAgenda('a1', '2099-01-01T00:00:00Z');
    const facility = result.current.getFacilityForAgenda(agenda);
    expect(facility).toEqual(FAKE_FACILITY);
  });

  it('returns undefined for an unknown facilityId', async () => {
    const { result } = await renderAndWait();
    const agenda = { ...makeAgenda('a1', '2099-01-01T00:00:00Z'), facilityId: 'unknown' };
    expect(result.current.getFacilityForAgenda(agenda)).toBeUndefined();
  });
});

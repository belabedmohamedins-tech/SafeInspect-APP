// __tests__/utils/loadHomeData.test.ts
import { getFacilityForAgenda, loadHomeData } from '../../src/utils/loadHomeData';
import { AgendaItem, Facility, SavedInspection } from '../../src/types';

// ── Mocks ─────────────────────────────────────────────────────────────────────
jest.mock('../../src/facilitiesData', () => ({
  facilities: [
    { id: 'hardcoded-1', name: 'Hardcoded Facility 1' },
    { id: 'hardcoded-2', name: 'Hardcoded Facility 2' },
  ] as Facility[],
}));

jest.mock('../../src/facilitiesService', () => ({
  getUserFacilities: jest.fn(),
}));

jest.mock('../../src/repositories/AgendaRepository', () => ({
  AgendaRepository: { getAll: jest.fn() },
}));

jest.mock('../../src/repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: { getOpen: jest.fn() },
}));

jest.mock('../../src/repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getCompleted: jest.fn(),
    getDrafts: jest.fn(),
  },
}));

jest.mock('../../src/repositories/SettingsRepository', () => ({
  SettingsRepository: { get: jest.fn() },
}));

// ── Import mocked modules after jest.mock ─────────────────────────────────────
import { getUserFacilities } from '../../src/facilitiesService';
import { AgendaRepository } from '../../src/repositories/AgendaRepository';
import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';
import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import { SettingsRepository } from '../../src/repositories/SettingsRepository';

const mockGetUserFacilities     = getUserFacilities as jest.Mock;
const mockAgendaGetAll          = AgendaRepository.getAll as jest.Mock;
const mockCapGetOpen            = CorrectiveActionRepository.getOpen as jest.Mock;
const mockInspGetCompleted      = InspectionRepository.getCompleted as jest.Mock;
const mockInspGetDrafts         = InspectionRepository.getDrafts as jest.Mock;
const mockSettingsGet           = SettingsRepository.get as jest.Mock;

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeFacility = (id: string): Facility =>
  ({ id, name: `Facility ${id}`, type: 'restaurant' } as unknown as Facility);

const makeInspection = (id: string, nonCompliant = false): SavedInspection =>
  ({
    id,
    facilityId: 'f1',
    date: '2026-01-01',
    items: nonCompliant
      ? [{ complianceStatus: 'non-compliant' }]
      : [{ complianceStatus: 'compliant' }],
  } as unknown as SavedInspection);

const futureDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  return d.toISOString();
};

const pastDate = () => {
  const d = new Date();
  d.setDate(d.getDate() - 5);
  return d.toISOString();
};

const makeAgendaItem = (id: string, date: string, status: AgendaItem['status'] = 'scheduled'): AgendaItem =>
  ({ id, facilityId: 'f1', date, status, title: 'Visite' } as unknown as AgendaItem);

// ── getFacilityForAgenda ──────────────────────────────────────────────────────
describe('getFacilityForAgenda', () => {
  const userFacilities: Facility[] = [
    makeFacility('user-1'),
    makeFacility('user-2'),
  ];

  it('finds facility in hardcoded list first', () => {
    const agenda = makeAgendaItem('a1', futureDate());
    (agenda as any).facilityId = 'hardcoded-1';
    const result = getFacilityForAgenda(agenda, userFacilities);
    expect(result).toBeDefined();
    expect(result!.id).toBe('hardcoded-1');
  });

  it('falls back to userFacilities when not in hardcoded list', () => {
    const agenda = makeAgendaItem('a1', futureDate());
    (agenda as any).facilityId = 'user-1';
    const result = getFacilityForAgenda(agenda, userFacilities);
    expect(result).toBeDefined();
    expect(result!.id).toBe('user-1');
  });

  it('returns undefined when not found in either list', () => {
    const agenda = makeAgendaItem('a1', futureDate());
    (agenda as any).facilityId = 'nonexistent-id';
    const result = getFacilityForAgenda(agenda, userFacilities);
    expect(result).toBeUndefined();
  });

  it('hardcoded takes priority over userFacilities for same id', () => {
    // Both lists have 'hardcoded-1' — hardcoded wins (via ?? logic)
    const withOverlap: Facility[] = [{ ...makeFacility('hardcoded-1'), name: 'User Copy' }];
    const agenda = makeAgendaItem('a1', futureDate());
    (agenda as any).facilityId = 'hardcoded-1';
    const result = getFacilityForAgenda(agenda, withOverlap);
    expect(result!.name).toBe('Hardcoded Facility 1');
  });
});

// ── loadHomeData ──────────────────────────────────────────────────────────────
describe('loadHomeData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSettingsGet.mockResolvedValue({ officeName: 'DPSPE Tlemcen' });
    mockAgendaGetAll.mockResolvedValue([]);
    mockInspGetCompleted.mockResolvedValue([]);
    mockInspGetDrafts.mockResolvedValue([]);
    mockGetUserFacilities.mockResolvedValue([]);
    mockCapGetOpen.mockResolvedValue([]);
  });

  it('returns correct shape on empty data', async () => {
    const data = await loadHomeData();
    expect(data).toMatchObject({
      officeName: 'DPSPE Tlemcen',
      agendaItems: [],
      completedInspections: [],
      inProgressInspections: [],
      recentFacilities: [],
      userFacilities: [],
      stats: {
        totalCompleted: 0,
        totalDrafts: 0,
        nonCompliantFacilities: 0,
        openCapCount: 0,
      },
    });
  });

  it('officeName defaults to empty string when settings.officeName is absent', async () => {
    mockSettingsGet.mockResolvedValue({});
    const data = await loadHomeData();
    expect(data.officeName).toBe('');
  });

  it('officeName defaults to empty string when settings is null', async () => {
    mockSettingsGet.mockResolvedValue(null);
    const data = await loadHomeData();
    expect(data.officeName).toBe('');
  });

  it('agenda: filters out past items', async () => {
    mockAgendaGetAll.mockResolvedValue([
      makeAgendaItem('past',   pastDate()),
      makeAgendaItem('future', futureDate()),
    ]);
    const data = await loadHomeData();
    expect(data.agendaItems).toHaveLength(1);
    expect(data.agendaItems[0].id).toBe('future');
  });

  it('agenda: filters out completed items', async () => {
    mockAgendaGetAll.mockResolvedValue([
      makeAgendaItem('done', futureDate(), 'completed'),
      makeAgendaItem('open', futureDate(), 'scheduled'),
    ]);
    const data = await loadHomeData();
    expect(data.agendaItems).toHaveLength(1);
    expect(data.agendaItems[0].id).toBe('open');
  });

  it('agenda: returns max 3 items sorted ascending by date', async () => {
    const d1 = new Date(); d1.setDate(d1.getDate() + 1);
    const d2 = new Date(); d2.setDate(d2.getDate() + 2);
    const d3 = new Date(); d3.setDate(d3.getDate() + 3);
    const d4 = new Date(); d4.setDate(d4.getDate() + 4);
    mockAgendaGetAll.mockResolvedValue([
      makeAgendaItem('d4', d4.toISOString()),
      makeAgendaItem('d2', d2.toISOString()),
      makeAgendaItem('d1', d1.toISOString()),
      makeAgendaItem('d3', d3.toISOString()),
    ]);
    const data = await loadHomeData();
    expect(data.agendaItems).toHaveLength(3);
    expect(data.agendaItems[0].id).toBe('d1');
    expect(data.agendaItems[1].id).toBe('d2');
    expect(data.agendaItems[2].id).toBe('d3');
  });

  it('completedInspections: last 3 reversed', async () => {
    const ins = Array.from({ length: 5 }, (_, i) => makeInspection(`i${i}`));
    mockInspGetCompleted.mockResolvedValue(ins);
    const data = await loadHomeData();
    // slice(-3) = [i2, i3, i4] → reverse → [i4, i3, i2]
    expect(data.completedInspections).toHaveLength(3);
    expect(data.completedInspections[0].id).toBe('i4');
    expect(data.completedInspections[2].id).toBe('i2');
  });

  it('inProgressInspections: last 3 reversed from drafts', async () => {
    const drafts = Array.from({ length: 4 }, (_, i) => makeInspection(`d${i}`));
    mockInspGetDrafts.mockResolvedValue(drafts);
    const data = await loadHomeData();
    expect(data.inProgressInspections).toHaveLength(3);
    expect(data.inProgressInspections[0].id).toBe('d3');
  });

  it('stats.totalCompleted = completed.length', async () => {
    mockInspGetCompleted.mockResolvedValue([
      makeInspection('a'), makeInspection('b'), makeInspection('c'),
    ]);
    const data = await loadHomeData();
    expect(data.stats.totalCompleted).toBe(3);
  });

  it('stats.totalDrafts = drafts.length', async () => {
    mockInspGetDrafts.mockResolvedValue([makeInspection('x'), makeInspection('y')]);
    const data = await loadHomeData();
    expect(data.stats.totalDrafts).toBe(2);
  });

  it('stats.openCapCount = openCap.length', async () => {
    mockCapGetOpen.mockResolvedValue([{}, {}, {}]);
    const data = await loadHomeData();
    expect(data.stats.openCapCount).toBe(3);
  });

  it('stats.nonCompliantFacilities counts last-3 completed with nonCompliant > 0', async () => {
    // 5 completed, last 3 = [i2,i3,i4] reversed = [i4,i3,i2]
    // i4 non-compliant, i3 compliant, i2 non-compliant → count = 2
    const inspections = [
      makeInspection('i0', false),
      makeInspection('i1', false),
      makeInspection('i2', true),   // non-compliant
      makeInspection('i3', false),
      makeInspection('i4', true),   // non-compliant
    ];
    mockInspGetCompleted.mockResolvedValue(inspections);
    const data = await loadHomeData();
    expect(data.stats.nonCompliantFacilities).toBe(2);
  });

  it('recentFacilities: last 3 user facilities reversed', async () => {
    const facs = Array.from({ length: 5 }, (_, i) => makeFacility(`f${i}`));
    mockGetUserFacilities.mockResolvedValue(facs);
    const data = await loadHomeData();
    expect(data.recentFacilities).toHaveLength(3);
    expect(data.recentFacilities[0].id).toBe('f4');
    expect(data.recentFacilities[2].id).toBe('f2');
  });

  it('userFacilities: full list returned', async () => {
    const facs = Array.from({ length: 7 }, (_, i) => makeFacility(`f${i}`));
    mockGetUserFacilities.mockResolvedValue(facs);
    const data = await loadHomeData();
    expect(data.userFacilities).toHaveLength(7);
  });
});

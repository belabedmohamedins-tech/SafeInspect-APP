// __tests__/utils/loadHomeData.test.ts
//
// Full coverage for src/utils/loadHomeData.ts
// Covers: loadHomeData (all branches), getFacilityForAgenda (hardcoded vs user)
//
// Mock strategy (L4 — domain-specific):
//   All repository calls are mocked here. facilitiesData and facilitiesService
//   are also mocked so no AsyncStorage or native modules are touched.

import {
  loadHomeData,
  getFacilityForAgenda,
} from '../../src/utils/loadHomeData';
import { AgendaItem, Facility, SavedInspection } from '../../src/types';

// ── Mock all external dependencies ─────────────────────────────────────────

jest.mock('../../src/repositories/SettingsRepository', () => ({
  SettingsRepository: { get: jest.fn() },
}));
jest.mock('../../src/repositories/AgendaRepository', () => ({
  AgendaRepository: { getAll: jest.fn() },
}));
jest.mock('../../src/repositories/InspectionRepository', () => ({
  InspectionRepository: { getCompleted: jest.fn(), getDrafts: jest.fn() },
}));
jest.mock('../../src/repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: { getOpen: jest.fn() },
}));
jest.mock('../../src/facilitiesService', () => ({
  getUserFacilities: jest.fn(),
}));
// facilitiesData is imported for getFacilityForAgenda hardcoded lookup
jest.mock('../../src/facilitiesData', () => ({
  facilities: [
    { id: 'hard-1', projectName: 'Bakery A', ownerName: 'Owner A', activity: 'bakery', address: 'Addr A' },
  ],
}));
// statusUtils is real (pure TS) — no mock needed
// Colors is already handled by L2 moduleNameMapper

import { SettingsRepository } from '../../src/repositories/SettingsRepository';
import { AgendaRepository } from '../../src/repositories/AgendaRepository';
import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';
import { getUserFacilities } from '../../src/facilitiesService';

// ── Typed mock helpers ────────────────────────────────────────────────────────

const mockSettings   = SettingsRepository.get as jest.Mock;
const mockAgenda     = AgendaRepository.getAll as jest.Mock;
const mockCompleted  = InspectionRepository.getCompleted as jest.Mock;
const mockDrafts     = InspectionRepository.getDrafts as jest.Mock;
const mockOpenCap    = CorrectiveActionRepository.getOpen as jest.Mock;
const mockUserFacs   = getUserFacilities as jest.Mock;

// ── Fixture builders ─────────────────────────────────────────────────────────

function makeAgendaItem(
  id: string,
  date: string,
  status: AgendaItem['status'] = 'pending',
): AgendaItem {
  return {
    id,
    facilityId: `fac-${id}`,
    facilityName: `Facility ${id}`,
    date,
    notes: '',
    status,
  };
}

function makeInspection(
  id: string,
  nonCompliantCount = 0,
): SavedInspection {
  const items = [
    ...Array(nonCompliantCount).fill(null).map((_, i) => ({
      id: `nc-${id}-${i}`,
      criteria: 'x',
      legalReference: 'x',
      severity: 'medium' as const,
      complianceStatus: 'non-compliant' as const,
    })),
  ];
  return {
    id,
    facilityId: 'fac-1',
    facilityName: 'Facility 1',
    facilityAddress: 'Addr 1',
    date: '2026-07-01',
    inspectorName: 'Inspector',
    items,
    status: 'completed',
  };
}

function makeFacility(id: string): Facility {
  return { id, projectName: `Proj ${id}`, ownerName: 'O', activity: 'A', address: 'Addr' };
}

// ── beforeEach: sensible defaults ────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockSettings.mockResolvedValue({ officeName: 'Direction de Tlemcen' });
  mockAgenda.mockResolvedValue([]);
  mockCompleted.mockResolvedValue([]);
  mockDrafts.mockResolvedValue([]);
  mockOpenCap.mockResolvedValue([]);
  mockUserFacs.mockResolvedValue([]);
});

// ── loadHomeData ─────────────────────────────────────────────────────────────

describe('loadHomeData', () => {
  it('returns correct officeName from settings', async () => {
    const data = await loadHomeData();
    expect(data.officeName).toBe('Direction de Tlemcen');
  });

  it('falls back to empty string when settings is null (first run)', async () => {
    mockSettings.mockResolvedValue(null);
    const data = await loadHomeData();
    expect(data.officeName).toBe('');
  });

  it('falls back to empty string when officeName is missing from settings', async () => {
    mockSettings.mockResolvedValue({});
    const data = await loadHomeData();
    expect(data.officeName).toBe('');
  });

  // ── agenda filtering ────────────────────────────────────────────────────

  it('excludes completed agenda items', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    mockAgenda.mockResolvedValue([
      makeAgendaItem('a1', tomorrow.toISOString(), 'completed'),
      makeAgendaItem('a2', tomorrow.toISOString(), 'pending'),
    ]);
    const data = await loadHomeData();
    expect(data.agendaItems).toHaveLength(1);
    expect(data.agendaItems[0].id).toBe('a2');
  });

  it('excludes past agenda items', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    mockAgenda.mockResolvedValue([
      makeAgendaItem('past', yesterday.toISOString(), 'pending'),
      makeAgendaItem('future', tomorrow.toISOString(), 'pending'),
    ]);
    const data = await loadHomeData();
    expect(data.agendaItems).toHaveLength(1);
    expect(data.agendaItems[0].id).toBe('future');
  });

  it('includes agenda items scheduled for today', async () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0); // midday today
    mockAgenda.mockResolvedValue([
      makeAgendaItem('today', today.toISOString(), 'pending'),
    ]);
    const data = await loadHomeData();
    expect(data.agendaItems).toHaveLength(1);
  });

  it('caps agenda at 3 items and sorts ascending by date', async () => {
    const base = new Date();
    base.setDate(base.getDate() + 1);
    const items = [3, 1, 4, 2].map(offset => {
      const d = new Date(base);
      d.setDate(d.getDate() + offset);
      return makeAgendaItem(`a${offset}`, d.toISOString(), 'pending');
    });
    mockAgenda.mockResolvedValue(items);
    const data = await loadHomeData();
    expect(data.agendaItems).toHaveLength(3);
    // Should be sorted ascending (soonest first)
    const dates = data.agendaItems.map(i => new Date(i.date).getTime());
    expect(dates[0]).toBeLessThanOrEqual(dates[1]);
    expect(dates[1]).toBeLessThanOrEqual(dates[2]);
  });

  // ── inspections slicing ─────────────────────────────────────────────────

  it('returns last 3 completed inspections in reverse order', async () => {
    const inspections = ['i1', 'i2', 'i3', 'i4', 'i5'].map(id => makeInspection(id));
    mockCompleted.mockResolvedValue(inspections);
    const data = await loadHomeData();
    // slice(-3) = [i3,i4,i5], reversed = [i5,i4,i3]
    expect(data.completedInspections.map(i => i.id)).toEqual(['i5', 'i4', 'i3']);
  });

  it('returns last 3 draft inspections in reverse order', async () => {
    const drafts = ['d1', 'd2', 'd3', 'd4'].map(id => makeInspection(id));
    mockDrafts.mockResolvedValue(drafts);
    const data = await loadHomeData();
    // slice(-3) = [d2,d3,d4], reversed = [d4,d3,d2]
    expect(data.inProgressInspections.map(i => i.id)).toEqual(['d4', 'd3', 'd2']);
  });

  it('handles fewer than 3 completed inspections', async () => {
    mockCompleted.mockResolvedValue([makeInspection('only')]);
    const data = await loadHomeData();
    expect(data.completedInspections).toHaveLength(1);
  });

  // ── stats ────────────────────────────────────────────────────────────────

  it('counts totalCompleted and totalDrafts correctly', async () => {
    mockCompleted.mockResolvedValue([makeInspection('c1'), makeInspection('c2')]);
    mockDrafts.mockResolvedValue([makeInspection('d1')]);
    const data = await loadHomeData();
    expect(data.stats.totalCompleted).toBe(2);
    expect(data.stats.totalDrafts).toBe(1);
  });

  it('counts nonCompliantFacilities among the 3 most recent completed', async () => {
    // i3,i4,i5 are the last 3 — only i4 has non-compliant items
    mockCompleted.mockResolvedValue([
      makeInspection('i1', 0),
      makeInspection('i2', 0),
      makeInspection('i3', 0),
      makeInspection('i4', 1), // 1 non-compliant item
      makeInspection('i5', 0),
    ]);
    const data = await loadHomeData();
    expect(data.stats.nonCompliantFacilities).toBe(1);
  });

  it('counts openCapCount from CorrectiveActionRepository.getOpen', async () => {
    mockOpenCap.mockResolvedValue([{}, {}, {}]); // 3 open CAPs
    const data = await loadHomeData();
    expect(data.stats.openCapCount).toBe(3);
  });

  it('stats are zero when everything is empty', async () => {
    const data = await loadHomeData();
    expect(data.stats).toEqual({
      totalCompleted: 0,
      totalDrafts: 0,
      nonCompliantFacilities: 0,
      openCapCount: 0,
    });
  });

  // ── facilities ──────────────────────────────────────────────────────────

  it('returns last 3 user facilities as recentFacilities in reverse order', async () => {
    const facs = ['f1', 'f2', 'f3', 'f4', 'f5'].map(makeFacility);
    mockUserFacs.mockResolvedValue(facs);
    const data = await loadHomeData();
    // slice(-3) = [f3,f4,f5], reversed = [f5,f4,f3]
    expect(data.recentFacilities.map(f => f.id)).toEqual(['f5', 'f4', 'f3']);
  });

  it('exposes full userFacilities array', async () => {
    const facs = ['f1', 'f2'].map(makeFacility);
    mockUserFacs.mockResolvedValue(facs);
    const data = await loadHomeData();
    expect(data.userFacilities).toHaveLength(2);
  });
});

// ── getFacilityForAgenda ──────────────────────────────────────────────────────

describe('getFacilityForAgenda', () => {
  const userFacs: Facility[] = [
    makeFacility('user-1'),
    makeFacility('user-2'),
  ];

  it('finds a hardcoded facility by facilityId', () => {
    const item = makeAgendaItem('a', '2026-07-15');
    item.facilityId = 'hard-1'; // exists in mocked facilitiesData
    const result = getFacilityForAgenda(item, userFacs);
    expect(result).toBeDefined();
    expect(result!.id).toBe('hard-1');
  });

  it('falls back to userFacilities when not in hardcoded list', () => {
    const item = makeAgendaItem('a', '2026-07-15');
    item.facilityId = 'user-1';
    const result = getFacilityForAgenda(item, userFacs);
    expect(result).toBeDefined();
    expect(result!.id).toBe('user-1');
  });

  it('returns undefined when facilityId not found in either list', () => {
    const item = makeAgendaItem('a', '2026-07-15');
    item.facilityId = 'unknown-999';
    const result = getFacilityForAgenda(item, userFacs);
    expect(result).toBeUndefined();
  });

  it('hardcoded list takes precedence over userFacilities', () => {
    // Same id in both — hardcoded should win (?? short-circuit)
    const item = makeAgendaItem('a', '2026-07-15');
    item.facilityId = 'hard-1';
    const userFacsWithSameId: Facility[] = [
      { id: 'hard-1', projectName: 'User version', ownerName: 'U', activity: 'A', address: 'X' },
    ];
    const result = getFacilityForAgenda(item, userFacsWithSameId);
    // hardcoded returns 'Bakery A', user version returns 'User version'
    expect(result!.projectName).toBe('Bakery A');
  });
});

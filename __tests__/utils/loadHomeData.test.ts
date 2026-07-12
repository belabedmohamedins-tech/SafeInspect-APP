// __tests__/utils/loadHomeData.test.ts
jest.mock('../../src/facilitiesData', () => ({ facilities: [
  { id: 'hf1', name: 'Hardcoded Facility' },
] }));
jest.mock('../../src/facilitiesService', () => ({ getUserFacilities: jest.fn() }));
jest.mock('../../src/repositories/AgendaRepository', () => ({
  AgendaRepository: { getAll: jest.fn() },
}));
jest.mock('../../src/repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: { getOpen: jest.fn() },
}));
jest.mock('../../src/repositories/InspectionRepository', () => ({
  InspectionRepository: { getCompleted: jest.fn(), getDrafts: jest.fn() },
}));
jest.mock('../../src/repositories/SettingsRepository', () => ({
  SettingsRepository: { get: jest.fn() },
}));
jest.mock('../../src/utils/statusUtils', () => ({
  getComplianceSummary: jest.fn(),
}));

import { loadHomeData, getFacilityForAgenda } from '../../src/utils/loadHomeData';
import { getUserFacilities } from '../../src/facilitiesService';
import { AgendaRepository } from '../../src/repositories/AgendaRepository';
import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';
import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import { SettingsRepository } from '../../src/repositories/SettingsRepository';
import { getComplianceSummary } from '../../src/utils/statusUtils';

const mockGetUserFacilities = getUserFacilities as jest.Mock;
const mockGetAllAgenda      = AgendaRepository.getAll as jest.Mock;
const mockGetOpen           = CorrectiveActionRepository.getOpen as jest.Mock;
const mockGetCompleted      = InspectionRepository.getCompleted as jest.Mock;
const mockGetDrafts         = InspectionRepository.getDrafts as jest.Mock;
const mockSettingsGet       = SettingsRepository.get as jest.Mock;
const mockGetComplianceSummary = getComplianceSummary as jest.Mock;

const today = new Date();
today.setHours(0, 0, 0, 0);
const futureDate = new Date(today);
futureDate.setDate(futureDate.getDate() + 1);
const pastDate = new Date(today);
pastDate.setDate(pastDate.getDate() - 1);

beforeEach(() => {
  jest.clearAllMocks();
  mockGetUserFacilities.mockResolvedValue([]);
  mockGetAllAgenda.mockResolvedValue([]);
  mockGetOpen.mockResolvedValue([]);
  mockGetCompleted.mockResolvedValue([]);
  mockGetDrafts.mockResolvedValue([]);
  mockSettingsGet.mockResolvedValue({ officeName: 'Test Office' });
  mockGetComplianceSummary.mockReturnValue({ nonCompliant: 0 });
});

describe('loadHomeData', () => {
  it('returns officeName from settings', async () => {
    const data = await loadHomeData();
    expect(data.officeName).toBe('Test Office');
  });

  it('officeName defaults to empty string when settings null', async () => {
    mockSettingsGet.mockResolvedValue(null);
    const data = await loadHomeData();
    expect(data.officeName).toBe('');
  });

  it('filters out past and completed agenda items', async () => {
    mockGetAllAgenda.mockResolvedValue([
      { id: 'a1', facilityId: 'f1', date: futureDate.toISOString(), status: 'pending' },
      { id: 'a2', facilityId: 'f1', date: pastDate.toISOString(), status: 'pending' },
      { id: 'a3', facilityId: 'f1', date: futureDate.toISOString(), status: 'completed' },
    ]);
    const data = await loadHomeData();
    expect(data.agendaItems.length).toBe(1);
    expect(data.agendaItems[0].id).toBe('a1');
  });

  it('returns max 3 agenda items sorted by date', async () => {
    const items = [1, 2, 3, 4].map(n => ({
      id: `a${n}`,
      facilityId: 'f1',
      date: new Date(today.getTime() + n * 86400000).toISOString(),
      status: 'pending',
    }));
    mockGetAllAgenda.mockResolvedValue(items);
    const data = await loadHomeData();
    expect(data.agendaItems.length).toBe(3);
    expect(data.agendaItems[0].id).toBe('a1');
  });

  it('returns last 3 completed reversed', async () => {
    const completed = [1, 2, 3, 4].map(n => ({ id: `c${n}`, items: [] }));
    mockGetCompleted.mockResolvedValue(completed);
    mockGetComplianceSummary.mockReturnValue({ nonCompliant: 0 });
    const data = await loadHomeData();
    expect(data.completedInspections.length).toBe(3);
    expect(data.completedInspections[0].id).toBe('c4');
  });

  it('stats: totalCompleted and totalDrafts', async () => {
    mockGetCompleted.mockResolvedValue([{}, {}, {}].map((_, i) => ({ id: `c${i}`, items: [] })));
    mockGetDrafts.mockResolvedValue([{}, {}].map((_, i) => ({ id: `d${i}`, items: [] })));
    mockGetComplianceSummary.mockReturnValue({ nonCompliant: 0 });
    const data = await loadHomeData();
    expect(data.stats.totalCompleted).toBe(3);
    expect(data.stats.totalDrafts).toBe(2);
  });

  it('stats: nonCompliantFacilities counts inspections with nonCompliant > 0', async () => {
    mockGetCompleted.mockResolvedValue([
      { id: 'c1', items: [{}] },
      { id: 'c2', items: [{}] },
      { id: 'c3', items: [{}] },
    ]);
    mockGetComplianceSummary
      .mockReturnValueOnce({ nonCompliant: 2 })
      .mockReturnValueOnce({ nonCompliant: 0 })
      .mockReturnValueOnce({ nonCompliant: 1 });
    const data = await loadHomeData();
    expect(data.stats.nonCompliantFacilities).toBe(2);
  });

  it('stats: openCapCount from CorrectiveActionRepository', async () => {
    mockGetOpen.mockResolvedValue([{}, {}, {}, {}]);
    const data = await loadHomeData();
    expect(data.stats.openCapCount).toBe(4);
  });

  it('recentFacilities = last 3 of userFacilities reversed', async () => {
    mockGetUserFacilities.mockResolvedValue(
      [1, 2, 3, 4].map(n => ({ id: `f${n}` }))
    );
    const data = await loadHomeData();
    expect(data.recentFacilities.length).toBe(3);
    expect(data.recentFacilities[0].id).toBe('f4');
  });
});

describe('getFacilityForAgenda', () => {
  it('finds facility in hardcoded list first', () => {
    const f = getFacilityForAgenda({ facilityId: 'hf1' } as any, []);
    expect(f?.id).toBe('hf1');
  });

  it('falls back to userFacilities', () => {
    const f = getFacilityForAgenda({ facilityId: 'uf1' } as any, [{ id: 'uf1' } as any]);
    expect(f?.id).toBe('uf1');
  });

  it('returns undefined when not found anywhere', () => {
    const f = getFacilityForAgenda({ facilityId: 'x99' } as any, []);
    expect(f).toBeUndefined();
  });
});

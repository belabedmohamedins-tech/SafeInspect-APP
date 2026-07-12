// __tests__/utils/loadHomeData.test.ts
import { getFacilityForAgenda, loadHomeData } from '../../src/utils/loadHomeData';
import { AgendaItem, Facility } from '../../src/types';

// Mock all repository and service dependencies
jest.mock('../../src/repositories/AgendaRepository', () => ({
  AgendaRepository: { getAll: jest.fn() },
}));
jest.mock('../../src/repositories/InspectionRepository', () => ({
  InspectionRepository: { getCompleted: jest.fn(), getDrafts: jest.fn() },
}));
jest.mock('../../src/repositories/SettingsRepository', () => ({
  SettingsRepository: { get: jest.fn() },
}));
jest.mock('../../src/repositories/CorrectiveActionRepository', () => ({
  CorrectiveActionRepository: { getOpen: jest.fn() },
}));
jest.mock('../../src/facilitiesService', () => ({
  getUserFacilities: jest.fn(),
}));
jest.mock('../../src/facilitiesData', () => ({
  facilities: [
    { id: 'f1', name: 'Hardcoded Facility' },
  ],
}));

import { AgendaRepository } from '../../src/repositories/AgendaRepository';
import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import { SettingsRepository } from '../../src/repositories/SettingsRepository';
import { CorrectiveActionRepository } from '../../src/repositories/CorrectiveActionRepository';
import { getUserFacilities } from '../../src/facilitiesService';

const mockAgenda = AgendaRepository.getAll as jest.Mock;
const mockCompleted = InspectionRepository.getCompleted as jest.Mock;
const mockDrafts = InspectionRepository.getDrafts as jest.Mock;
const mockSettings = SettingsRepository.get as jest.Mock;
const mockOpenCap = CorrectiveActionRepository.getOpen as jest.Mock;
const mockUserFacs = getUserFacilities as jest.Mock;

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowISO = tomorrow.toISOString();

beforeEach(() => {
  jest.clearAllMocks();
  mockSettings.mockResolvedValue({ officeName: 'Test Office' });
  mockAgenda.mockResolvedValue([]);
  mockCompleted.mockResolvedValue([]);
  mockDrafts.mockResolvedValue([]);
  mockUserFacs.mockResolvedValue([]);
  mockOpenCap.mockResolvedValue([]);
});

describe('getFacilityForAgenda', () => {
  it('finds facility from hardcoded list first', () => {
    const item = { facilityId: 'f1' } as AgendaItem;
    const result = getFacilityForAgenda(item, []);
    expect(result?.name).toBe('Hardcoded Facility');
  });

  it('falls back to userFacilities when not in hardcoded list', () => {
    const item = { facilityId: 'f99' } as AgendaItem;
    const userFacs: Facility[] = [{ id: 'f99', name: 'User Fac' } as any];
    const result = getFacilityForAgenda(item, userFacs);
    expect(result?.name).toBe('User Fac');
  });

  it('returns undefined when not found anywhere', () => {
    const item = { facilityId: 'unknown' } as AgendaItem;
    expect(getFacilityForAgenda(item, [])).toBeUndefined();
  });
});

describe('loadHomeData', () => {
  it('returns officeName from settings', async () => {
    const r = await loadHomeData();
    expect(r.officeName).toBe('Test Office');
  });

  it('handles null settings gracefully', async () => {
    mockSettings.mockResolvedValue(null);
    const r = await loadHomeData();
    expect(r.officeName).toBe('');
  });

  it('filters out completed agenda items', async () => {
    mockAgenda.mockResolvedValue([
      { id: 'a1', status: 'completed', date: tomorrowISO },
      { id: 'a2', status: 'pending', date: tomorrowISO },
    ]);
    const r = await loadHomeData();
    expect(r.agendaItems).toHaveLength(1);
    expect(r.agendaItems[0].id).toBe('a2');
  });

  it('filters out past agenda items', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    mockAgenda.mockResolvedValue([
      { id: 'old', status: 'pending', date: yesterday.toISOString() },
      { id: 'new', status: 'pending', date: tomorrowISO },
    ]);
    const r = await loadHomeData();
    expect(r.agendaItems.every(i => i.id !== 'old')).toBe(true);
  });

  it('limits agendaItems to 3', async () => {
    const items = Array.from({ length: 10 }, (_, i) => ({
      id: `a${i}`, status: 'pending', date: tomorrowISO,
    }));
    mockAgenda.mockResolvedValue(items);
    const r = await loadHomeData();
    expect(r.agendaItems.length).toBeLessThanOrEqual(3);
  });

  it('returns stats with correct counts', async () => {
    mockCompleted.mockResolvedValue([{ id: 'c1', items: [] }, { id: 'c2', items: [] }]);
    mockDrafts.mockResolvedValue([{ id: 'd1', items: [] }]);
    mockOpenCap.mockResolvedValue([{}, {}]);
    const r = await loadHomeData();
    expect(r.stats.totalCompleted).toBe(2);
    expect(r.stats.totalDrafts).toBe(1);
    expect(r.stats.openCapCount).toBe(2);
  });

  it('returns recentFacilities as last 3 reversed', async () => {
    const facs = Array.from({ length: 5 }, (_, i) => ({ id: `f${i}` } as any));
    mockUserFacs.mockResolvedValue(facs);
    const r = await loadHomeData();
    expect(r.recentFacilities).toHaveLength(3);
    // last 3 reversed: f4, f3, f2
    expect(r.recentFacilities[0].id).toBe('f4');
  });
});

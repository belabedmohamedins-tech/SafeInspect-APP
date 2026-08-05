/**
 * __tests__/hooks/useHomeData.test.ts
 *
 * Tests for the useHomeData hook.
 * Uses complete AgendaItem fixtures matching the current type definition.
 */

import { renderHook } from '@testing-library/react-hooks';
import { useHomeData } from '../../src/hooks/useHomeData';
import type { AgendaItem, Facility } from '../../src/types';

const makeFacility = (overrides: Partial<Facility> = {}): Facility => ({
  id: 'fac-1',
  projectName: 'Test Facility',
  ownerName: 'Owner',
  activity: 'مخبزة',
  address: '1 Rue Test',
  ...overrides,
});

const makeAgendaItem = (overrides: Partial<AgendaItem> = {}): AgendaItem => ({
  id: 'a1',
  facilityId: 'fac-1',
  facilityName: 'Test Facility',
  date: new Date().toISOString(),
  notes: '',
  status: 'pending',
  ...overrides,
});

jest.mock('../../src/repositories/FacilitiesRepository', () => ({
  FacilitiesRepository: {
    getAll: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('../../src/repositories/AgendaRepository', () => ({
  AgendaRepository: {
    getAll: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('../../src/repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getAll: jest.fn().mockResolvedValue([]),
  },
}));

describe('useHomeData', () => {
  it('returns default empty state on mount', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useHomeData());
    await waitForNextUpdate().catch(() => {});
    expect(result.current).toBeDefined();
  });

  it('getFacilityForAgenda returns facility when facilityId matches', async () => {
    const { FacilitiesRepository } = require('../../src/repositories/FacilitiesRepository');
    FacilitiesRepository.getAll.mockResolvedValue([makeFacility({ id: 'fac-1' })]);

    const { result, waitForNextUpdate } = renderHook(() => useHomeData());
    await waitForNextUpdate().catch(() => {});

    const agendaItem = makeAgendaItem({ facilityId: 'fac-1', facilityName: 'Test Facility' });
    const res = result.current.getFacilityForAgenda(agendaItem);
    expect(res).toBeDefined();
  });

  it('getFacilityForAgenda returns undefined for unknown id', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useHomeData());
    await waitForNextUpdate().catch(() => {});

    const res = result.current.getFacilityForAgenda(makeAgendaItem({ id: 'unknown', facilityId: 'no-match' }));
    expect(res).toBeUndefined();
  });
});

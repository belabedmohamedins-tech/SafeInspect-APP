// src/__tests__/useHomeData.test.ts

jest.mock('../utils/loadHomeData', () => ({
  loadHomeData: jest.fn(),
  getFacilityForAgenda: jest.requireActual('../utils/loadHomeData').getFacilityForAgenda,
}));

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn((cb: () => void) => { cb(); }),
}));

import { renderHook, act } from '@testing-library/react-hooks';
import { useFocusEffect } from 'expo-router';
import { loadHomeData } from '../utils/loadHomeData';
import { useHomeData } from '../hooks/useHomeData';
import { HomeData } from '../utils/loadHomeData';
import { AgendaItem, Facility } from '../types';

const mockLoad = jest.mocked(loadHomeData);
const mockFocus = jest.mocked(useFocusEffect);

const EMPTY_DATA: HomeData = {
  officeName: '',
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
};

const SAMPLE_DATA: HomeData = {
  officeName: 'مكتب الصحة',
  agendaItems: [{ id: 'ag-1', facilityId: 'fac-1', date: '2027-01-01', status: 'pending' } as AgendaItem],
  completedInspections: [],
  inProgressInspections: [],
  recentFacilities: [],
  userFacilities: [{ id: 'fac-1', name: 'Test Facility' } as Facility],
  stats: { totalCompleted: 5, totalDrafts: 2, nonCompliantFacilities: 1, openCapCount: 3 },
};

// Make useFocusEffect actually invoke the callback synchronously
beforeEach(() => {
  jest.clearAllMocks();
  mockFocus.mockImplementation((cb) => { cb(); });
  mockLoad.mockResolvedValue(EMPTY_DATA);
});

describe('useHomeData', () => {
  it('starts with empty data before loadHomeData resolves', () => {
    mockLoad.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useHomeData());
    expect(result.current.officeName).toBe('');
    expect(result.current.agendaItems).toEqual([]);
    expect(result.current.stats.totalCompleted).toBe(0);
  });

  it('populates data after loadHomeData resolves', async () => {
    mockLoad.mockResolvedValue(SAMPLE_DATA);
    const { result, waitForNextUpdate } = renderHook(() => useHomeData());
    await waitForNextUpdate();
    expect(result.current.officeName).toBe('مكتب الصحة');
    expect(result.current.stats.totalCompleted).toBe(5);
    expect(result.current.stats.openCapCount).toBe(3);
    expect(result.current.agendaItems).toHaveLength(1);
  });

  it('falls back to empty data when loadHomeData rejects', async () => {
    mockLoad.mockRejectedValue(new Error('network error'));
    const { result, waitForNextUpdate } = renderHook(() => useHomeData());
    await waitForNextUpdate();
    expect(result.current.officeName).toBe('');
    expect(result.current.agendaItems).toEqual([]);
  });

  it('re-fetches data on each focus event', async () => {
    mockLoad.mockResolvedValue(SAMPLE_DATA);
    const { waitForNextUpdate } = renderHook(() => useHomeData());
    await waitForNextUpdate();
    // Focus fires again
    act(() => { mockFocus.mock.calls[0][0](); });
    await waitForNextUpdate();
    expect(mockLoad).toHaveBeenCalledTimes(2);
  });

  describe('getFacilityForAgenda', () => {
    it('returns the matching facility from userFacilities', async () => {
      mockLoad.mockResolvedValue(SAMPLE_DATA);
      const { result, waitForNextUpdate } = renderHook(() => useHomeData());
      await waitForNextUpdate();
      const item = SAMPLE_DATA.agendaItems[0];
      const facility = result.current.getFacilityForAgenda(item);
      // fac-1 is not in hardcoded facilities so returns from userFacilities
      expect(facility?.id).toBe('fac-1');
    });

    it('returns undefined when facility is not found', async () => {
      mockLoad.mockResolvedValue(SAMPLE_DATA);
      const { result, waitForNextUpdate } = renderHook(() => useHomeData());
      await waitForNextUpdate();
      const unknownItem = { id: 'ag-x', facilityId: 'unknown-999' } as AgendaItem;
      const facility = result.current.getFacilityForAgenda(unknownItem);
      expect(facility).toBeUndefined();
    });
  });
});

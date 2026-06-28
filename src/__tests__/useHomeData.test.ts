// src/__tests__/useHomeData.test.ts
//
// WHY useFocusEffect is mocked the way it is:
//
// useFocusEffect(cb) in the real expo-router requires a navigation context
// (a Navigator tree) to be mounted. Without it the hook throws on render,
// React catches it, and result.current is never populated.
//
// We cannot call React.useEffect() inside a jest.mock() factory — that runs
// in module scope, outside any React fiber, and React throws "Invalid hook
// call" which crashes the mount just as silently.
//
// The correct pattern is to alias useFocusEffect → React.useEffect directly.
// When renderHook renders the hook, React.useEffect is a valid call inside
// that fiber context. The callback fires once on mount (empty dep array),
// matching real useFocusEffect semantics, with no navigation context needed
// and no infinite re-render loop.

jest.mock('../utils/loadHomeData', () => ({
  loadHomeData: jest.fn(),
  getFacilityForAgenda: jest.requireActual('../utils/loadHomeData').getFacilityForAgenda,
}));

jest.mock('expo-router', () => {
  // require inside the factory is safe — this executes at module-load time,
  // before any test runs, so React is already available.
  const { useEffect } = require('react');
  return {
    // Alias: useFocusEffect(cb) becomes useEffect(() => cb(), []).
    // cb is the useCallback-wrapped async loader — calling it returns the
    // cleanup function (or undefined). The empty dep array ensures it fires
    // exactly once per mount, never on re-renders caused by setState.
    useFocusEffect: jest.fn((cb: () => void | (() => void)) => {
      useEffect(cb, []); // eslint-disable-line react-hooks/exhaustive-deps
    }),
  };
});

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useFocusEffect } from 'expo-router';
import { loadHomeData, HomeData } from '../utils/loadHomeData';
import { useHomeData } from '../hooks/useHomeData';
import { AgendaItem, Facility } from '../types';

const mockLoad  = loadHomeData as jest.MockedFunction<typeof loadHomeData>;
const mockFocus = useFocusEffect as jest.MockedFunction<typeof useFocusEffect>;

// Required by jest.setup.ts contract: configure({ defaultWrapper }) was removed
// because it corrupts result.current. Each hook test passes its own wrapper.
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);

const EMPTY_DATA: HomeData = {
  officeName: '',
  agendaItems: [],
  completedInspections: [],
  inProgressInspections: [],
  recentFacilities: [],
  userFacilities: [],
  stats: { totalCompleted: 0, totalDrafts: 0, nonCompliantFacilities: 0, openCapCount: 0 },
};

const SAMPLE_DATA: HomeData = {
  officeName: '\u0645\u0643\u062a\u0628 \u0627\u0644\u0635\u062d\u0629',
  agendaItems: [{ id: 'ag-1', facilityId: 'fac-1', date: '2027-01-01', status: 'pending' } as AgendaItem],
  completedInspections: [],
  inProgressInspections: [],
  recentFacilities: [],
  userFacilities: [{ id: 'fac-1', name: 'Test Facility' } as Facility],
  stats: { totalCompleted: 5, totalDrafts: 2, nonCompliantFacilities: 1, openCapCount: 3 },
};

beforeEach(() => {
  jest.clearAllMocks();
  // Re-apply the useEffect alias after clearAllMocks() wipes the spy.
  const { useEffect } = require('react');
  mockFocus.mockImplementation((cb: () => void | (() => void)) => {
    useEffect(cb, []); // eslint-disable-line react-hooks/exhaustive-deps
  });
  mockLoad.mockResolvedValue(EMPTY_DATA);
});

describe('useHomeData', () => {
  it('starts with empty data before loadHomeData resolves', async () => {
    mockLoad.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useHomeData(), { wrapper });
    expect(result.current).toBeDefined();
    expect(result.current.officeName).toBe('');
    expect(result.current.agendaItems).toEqual([]);
    expect(result.current.stats.totalCompleted).toBe(0);
  });

  it('populates data after loadHomeData resolves', async () => {
    mockLoad.mockResolvedValue(SAMPLE_DATA);
    const { result } = renderHook(() => useHomeData(), { wrapper });
    await waitFor(() => expect(result.current.officeName).toBe('\u0645\u0643\u062a\u0628 \u0627\u0644\u0635\u062d\u0629'));
    expect(result.current.stats.totalCompleted).toBe(5);
    expect(result.current.stats.openCapCount).toBe(3);
    expect(result.current.agendaItems).toHaveLength(1);
  });

  it('falls back to empty data when loadHomeData rejects', async () => {
    mockLoad.mockRejectedValue(new Error('network error'));
    const { result } = renderHook(() => useHomeData(), { wrapper });
    await waitFor(() => expect(mockLoad).toHaveBeenCalled());
    expect(result.current.officeName).toBe('');
    expect(result.current.agendaItems).toEqual([]);
  });

  it('re-fetches data on each focus event', async () => {
    mockLoad.mockResolvedValue(SAMPLE_DATA);
    const { result } = renderHook(() => useHomeData(), { wrapper });
    await waitFor(() => expect(mockLoad).toHaveBeenCalled());
    const callsAfterMount = mockLoad.mock.calls.length;
    act(() => { mockFocus.mock.calls[0][0](); });
    await waitFor(() => expect(mockLoad).toHaveBeenCalledTimes(callsAfterMount + 1));
  });

  describe('getFacilityForAgenda', () => {
    it('returns the matching facility from userFacilities', async () => {
      mockLoad.mockResolvedValue(SAMPLE_DATA);
      const { result } = renderHook(() => useHomeData(), { wrapper });
      await waitFor(() => expect(result.current.userFacilities).toHaveLength(1));
      const facility = result.current.getFacilityForAgenda(SAMPLE_DATA.agendaItems[0]);
      expect(facility?.id).toBe('fac-1');
    });

    it('returns undefined when facility is not found', async () => {
      mockLoad.mockResolvedValue(SAMPLE_DATA);
      const { result } = renderHook(() => useHomeData(), { wrapper });
      await waitFor(() => expect(result.current.userFacilities).toHaveLength(1));
      const facility = result.current.getFacilityForAgenda({ id: 'ax', facilityId: 'unknown-999' } as AgendaItem);
      expect(facility).toBeUndefined();
    });
  });
});

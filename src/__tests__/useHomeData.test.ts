// src/__tests__/useHomeData.test.ts
//
// WHY useFocusEffect IS MOCKED AS useEffect:
//
// useFocusEffect normally requires a full React Navigation context tree.
// Any stub that calls cb() synchronously during the initial render (e.g. via
// useRef gate or direct call) causes renderHook to silently fail in
// React 19 + RTLRN 14 — result.current stays undefined.
//
// The only pattern that works is mocking useFocusEffect to delegate to
// React.useEffect inside the mock factory. Jest hoists jest.mock() before
// imports, so React is available. The returned function calls useEffect(cb, [])
// which runs inside renderHook's React fiber — a valid hook call site.
// This gives identical mount/unmount semantics to the real useFocusEffect
// without needing any Navigation context.

jest.mock('../utils/loadHomeData', () => ({
  loadHomeData: jest.fn(),
  getFacilityForAgenda: jest.requireActual('../utils/loadHomeData').getFacilityForAgenda,
}));

jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useFocusEffect: (cb: () => void | (() => void)) => React.useEffect(cb, []),
  };
});

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { loadHomeData, HomeData } from '../utils/loadHomeData';
import { useHomeData } from '../hooks/useHomeData';
import { AgendaItem, Facility } from '../types';

const mockLoad = loadHomeData as jest.MockedFunction<typeof loadHomeData>;

// jest.setup.ts contract: each hook test file passes its own wrapper.
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
  mockLoad.mockResolvedValue(EMPTY_DATA);
});

describe('useHomeData', () => {
  it('starts with empty data before loadHomeData resolves', () => {
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

  it('calls loadHomeData on mount', async () => {
    mockLoad.mockResolvedValue(SAMPLE_DATA);
    renderHook(() => useHomeData(), { wrapper });
    await waitFor(() => expect(mockLoad).toHaveBeenCalledTimes(1));
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
      const facility = result.current.getFacilityForAgenda(
        { id: 'ax', facilityId: 'unknown-999' } as AgendaItem
      );
      expect(facility).toBeUndefined();
    });
  });
});

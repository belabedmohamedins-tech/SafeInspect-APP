// src/__tests__/useHomeData.test.ts
//
// WHY focusEffect is injected rather than mocked at the module level:
//
// useFocusEffect (expo-router) requires a full React Navigation context tree.
// Any jest.mock('expo-router') approach in RTLRN v14 + React 19 silently
// crashes renderHook — result.current stays undefined — because the mock hook
// call path hits a React internal invariant that is swallowed by the test
// renderer before it can surface as a readable error.
//
// The correct pattern: accept the hook as an injectable parameter with a
// production default (see useHomeData.ts). Tests pass a plain useEffect-based
// stub directly — no module mock needed, no navigation context needed.

jest.mock('../utils/loadHomeData', () => ({
  loadHomeData: jest.fn(),
  getFacilityForAgenda: jest.requireActual('../utils/loadHomeData').getFacilityForAgenda,
}));

import React, { useEffect, useCallback } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { loadHomeData, HomeData } from '../utils/loadHomeData';
import { useHomeData } from '../hooks/useHomeData';
import { AgendaItem, Facility } from '../types';

const mockLoad = loadHomeData as jest.MockedFunction<typeof loadHomeData>;

// A plain useEffect-based stub: fires the callback once on mount,
// respects the cleanup return value — no navigation context required.
const stubFocusEffect = (cb: () => void | (() => void)) => {
  // useEffect is a valid hook here because stubFocusEffect is only ever called
  // from inside useHomeData, which is rendered by renderHook inside a React fiber.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(cb, []);
};

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
  mockLoad.mockResolvedValue(EMPTY_DATA);
});

describe('useHomeData', () => {
  it('starts with empty data before loadHomeData resolves', async () => {
    mockLoad.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useHomeData(stubFocusEffect), { wrapper });
    expect(result.current).toBeDefined();
    expect(result.current.officeName).toBe('');
    expect(result.current.agendaItems).toEqual([]);
    expect(result.current.stats.totalCompleted).toBe(0);
  });

  it('populates data after loadHomeData resolves', async () => {
    mockLoad.mockResolvedValue(SAMPLE_DATA);
    const { result } = renderHook(() => useHomeData(stubFocusEffect), { wrapper });
    await waitFor(() => expect(result.current.officeName).toBe('\u0645\u0643\u062a\u0628 \u0627\u0644\u0635\u062d\u0629'));
    expect(result.current.stats.totalCompleted).toBe(5);
    expect(result.current.stats.openCapCount).toBe(3);
    expect(result.current.agendaItems).toHaveLength(1);
  });

  it('falls back to empty data when loadHomeData rejects', async () => {
    mockLoad.mockRejectedValue(new Error('network error'));
    const { result } = renderHook(() => useHomeData(stubFocusEffect), { wrapper });
    await waitFor(() => expect(mockLoad).toHaveBeenCalled());
    expect(result.current.officeName).toBe('');
    expect(result.current.agendaItems).toEqual([]);
  });

  it('re-fetches data on each focus event', async () => {
    // For this test we need manual control over when the callback fires,
    // so we use a spy-based stub instead of the useEffect alias.
    const focusCbs: Array<() => void | (() => void)> = [];
    const spyFocusEffect = jest.fn((cb: () => void | (() => void)) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => { focusCbs.push(cb); cb(); }, []);
    });

    mockLoad.mockResolvedValue(SAMPLE_DATA);
    renderHook(() => useHomeData(spyFocusEffect), { wrapper });
    await waitFor(() => expect(mockLoad).toHaveBeenCalled());
    const callsAfterMount = mockLoad.mock.calls.length;

    // Simulate a second focus event (e.g. user navigates away and back)
    act(() => { focusCbs[focusCbs.length - 1]?.(); });
    await waitFor(() => expect(mockLoad).toHaveBeenCalledTimes(callsAfterMount + 1));
  });

  describe('getFacilityForAgenda', () => {
    it('returns the matching facility from userFacilities', async () => {
      mockLoad.mockResolvedValue(SAMPLE_DATA);
      const { result } = renderHook(() => useHomeData(stubFocusEffect), { wrapper });
      await waitFor(() => expect(result.current.userFacilities).toHaveLength(1));
      const facility = result.current.getFacilityForAgenda(SAMPLE_DATA.agendaItems[0]);
      expect(facility?.id).toBe('fac-1');
    });

    it('returns undefined when facility is not found', async () => {
      mockLoad.mockResolvedValue(SAMPLE_DATA);
      const { result } = renderHook(() => useHomeData(stubFocusEffect), { wrapper });
      await waitFor(() => expect(result.current.userFacilities).toHaveLength(1));
      const facility = result.current.getFacilityForAgenda({ id: 'ax', facilityId: 'unknown-999' } as AgendaItem);
      expect(facility).toBeUndefined();
    });
  });
});

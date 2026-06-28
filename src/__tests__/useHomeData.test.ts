// src/__tests__/useHomeData.test.ts
//
// TESTING STRATEGY — why focusEffect is injected:
//
// useFocusEffect (expo-router) needs a full React Navigation context tree.
// In RTLRN v14 + React 19, any jest.mock approach that calls useEffect inside
// the mock silently crashes renderHook (result.current stays undefined) due to
// a React dispatcher invariant hit outside a real fiber.
//
// Solution: useHomeData accepts focusEffect as an injectable parameter with
// _useFocusEffect as its default (see useHomeData.ts). Tests pass stubFocusEffect
// — a plain function that calls useEffect(cb, []) — directly to renderHook.
// The stub is valid because it is called from inside renderHook's own fiber.
//
// jest.mock('expo-router') is still required here: useHomeData.ts imports from
// expo-router at the top level, and without a mock that entire import chain
// runs (Navigator → Screen → useNavigation → utils → useColorScheme …) and
// may throw on other unstubbed natives. The mock only needs to be a no-op
// because the injected stub overrides useFocusEffect in every test anyway.

jest.mock('../utils/loadHomeData', () => ({
  loadHomeData: jest.fn(),
  getFacilityForAgenda: jest.requireActual('../utils/loadHomeData').getFacilityForAgenda,
}));

// Minimal no-op mock — prevents the real expo-router import chain from running.
// useFocusEffect is never called via this mock in tests; the injected
// stubFocusEffect is used instead.
jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(), // no-op; overridden by injection in every renderHook call
}));

import React, { useEffect } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { loadHomeData, HomeData } from '../utils/loadHomeData';
import { useHomeData } from '../hooks/useHomeData';
import { AgendaItem, Facility } from '../types';

const mockLoad = loadHomeData as jest.MockedFunction<typeof loadHomeData>;

// stubFocusEffect: fires cb() exactly once on mount via useEffect.
// Valid hook call — runs inside renderHook's React fiber, not in module scope.
// eslint-disable-next-line react-hooks/rules-of-hooks
const stubFocusEffect = (cb: () => void | (() => void)) => useEffect(cb, []);

// Required by jest.setup.ts contract: each hook test passes its own wrapper.
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
    // Capture the cb so we can call it manually to simulate a second focus.
    let capturedCb: (() => void | (() => void)) | undefined;
    const spyFocusEffect = (cb: () => void | (() => void)) => {
      capturedCb = cb;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(cb, []);
    };

    mockLoad.mockResolvedValue(SAMPLE_DATA);
    renderHook(() => useHomeData(spyFocusEffect), { wrapper });
    await waitFor(() => expect(mockLoad).toHaveBeenCalled());
    const callsAfterMount = mockLoad.mock.calls.length;

    // Simulate re-focus (user navigates away and back)
    act(() => { capturedCb?.(); });
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

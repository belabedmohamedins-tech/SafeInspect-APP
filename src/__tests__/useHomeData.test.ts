// src/__tests__/useHomeData.test.ts
//
// TESTING STRATEGY — why focusEffect is injected and why the stub uses useRef:
//
// 1. useFocusEffect (expo-router) requires a full React Navigation context tree.
//    Passing it as an injectable parameter (with production default) lets tests
//    supply a lightweight stub — no navigation context needed.
//
// 2. The stub MUST NOT call useEffect() from a module-scope function.
//    useEffect called outside a component call-stack violates React's dispatcher
//    invariant, which is silently swallowed by renderHook and leaves
//    result.current undefined.
//
// 3. stubFocusEffect uses useRef as a once-gate instead. useRef is a valid hook
//    inside renderHook's fiber. The ref prevents the callback from running more
//    than once on the initial render, matching useFocusEffect mount semantics.

jest.mock('../utils/loadHomeData', () => ({
  loadHomeData: jest.fn(),
  getFacilityForAgenda: jest.requireActual('../utils/loadHomeData').getFacilityForAgenda,
}));

// Minimal firewall — stops the real expo-router import chain from loading.
// useFocusEffect is never called through this mock; the injected stub is used.
jest.mock('expo-router', () => ({ useFocusEffect: jest.fn() }));

import React, { useRef } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { loadHomeData, HomeData } from '../utils/loadHomeData';
import { useHomeData } from '../hooks/useHomeData';
import { AgendaItem, Facility } from '../types';

const mockLoad = loadHomeData as jest.MockedFunction<typeof loadHomeData>;

/**
 * stubFocusEffect — fires cb() exactly once on the initial render.
 *
 * Uses useRef (a valid hook inside renderHook's fiber) as a once-gate.
 * Does NOT use useEffect to avoid the dispatcher-invariant crash that occurs
 * when useEffect is called from a module-scope function (outside a component).
 */
function stubFocusEffect(cb: () => void | (() => void)) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const called = useRef(false);
  if (!called.current) {
    called.current = true;
    cb();
  }
}

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
    // spyFocusEffect: stores cb so we can call it manually to simulate re-focus.
    let capturedCb: (() => void | (() => void)) | undefined;
    function spyFocusEffect(cb: () => void | (() => void)) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const called = useRef(false);
      if (!called.current) {
        called.current = true;
        capturedCb = cb;
        cb();
      }
    }

    mockLoad.mockResolvedValue(SAMPLE_DATA);
    renderHook(() => useHomeData(spyFocusEffect), { wrapper });
    await waitFor(() => expect(mockLoad).toHaveBeenCalled());
    const callsAfterMount = mockLoad.mock.calls.length;

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
      const facility = result.current.getFacilityForAgenda(
        { id: 'ax', facilityId: 'unknown-999' } as AgendaItem
      );
      expect(facility).toBeUndefined();
    });
  });
});

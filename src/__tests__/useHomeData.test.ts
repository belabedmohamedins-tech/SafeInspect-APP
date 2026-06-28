// src/__tests__/useHomeData.test.ts
//
// STRATEGY: renderHook — useFocusEffect is mocked globally in jest.setup.ts
// to fire the callback directly on mount (cb() call), so result.current is
// populated correctly.
//
// IMPORTANT — @testing-library/react-native v14 renderHook() is ASYNC.
// Every renderHook() call MUST be awaited, otherwise { result } is
// destructured from a Promise and result.current is always undefined.
//
// wrapper: named function component returning React.createElement(
//   React.Fragment, null, children). React.Fragment is valid here.

jest.mock('../utils/loadHomeData', () => ({
  loadHomeData: jest.fn(),
  getFacilityForAgenda: jest.requireActual('../utils/loadHomeData').getFacilityForAgenda,
}));

jest.mock('../facilitiesData', () => ({
  facilities: [
    { id: 'hard-1', name: 'Hardcoded Facility', address: 'Hard St', activityType: 'default', wilaya: '16', commune: 'A' },
  ],
}));

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useHomeData } from '../hooks/useHomeData';
import { loadHomeData } from '../utils/loadHomeData';
import { AgendaItem } from '../types';

const mockLoadHomeData = loadHomeData as jest.MockedFunction<typeof loadHomeData>;

function Wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}

const FULL_DATA = {
  officeName:            'HQ',
  agendaItems:           [],
  completedInspections:  [],
  inProgressInspections: [],
  recentFacilities:      [],
  userFacilities:        [{ id: 'user-1', name: 'User Fac', address: 'A', activityType: 'default', wilaya: '16', commune: 'A' }],
  stats: { totalCompleted: 5, totalDrafts: 2, nonCompliantFacilities: 1, openCapCount: 3 },
};

function makeAgendaItem(facilityId: string): AgendaItem {
  return { id: 'a1', facilityId, facilityName: 'F', date: new Date().toISOString(), status: 'pending', inspectorId: 'u1', description: '' } as AgendaItem;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockLoadHomeData.mockResolvedValue(FULL_DATA as any);
});

describe('useHomeData — initial EMPTY state', () => {
  it('starts with empty arrays and zero stats before load resolves', async () => {
    mockLoadHomeData.mockReturnValue(new Promise(() => {}));
    const { result } = await renderHook(() => useHomeData(), { wrapper: Wrapper });
    expect(result.current.officeName).toBe('');
    expect(result.current.agendaItems).toEqual([]);
    expect(result.current.stats.totalCompleted).toBe(0);
  });
});

describe('useHomeData — data load on mount', () => {
  it('populates data after loadHomeData resolves', async () => {
    const { result } = await renderHook(() => useHomeData(), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current.officeName).toBe('HQ');
    });
    expect(result.current.stats.totalCompleted).toBe(5);
    expect(result.current.stats.openCapCount).toBe(3);
  });

  it('stays on EMPTY when loadHomeData rejects', async () => {
    mockLoadHomeData.mockRejectedValue(new Error('load failed'));
    const { result } = await renderHook(() => useHomeData(), { wrapper: Wrapper });
    await waitFor(() => {
      expect(mockLoadHomeData).toHaveBeenCalled();
    });
    expect(result.current.officeName).toBe('');
  });

  // ── lines 29-32: isActive cleanup branch ──────────────────────────────────
  // Unmounting before the promise resolves must NOT call setData.
  // If it did, React would log a "state update on unmounted component" warning
  // and the test would fail on the post-unmount assertion.
  it('does not update state after unmount (isActive guard)', async () => {
    let resolveLoad!: (v: any) => void;
    mockLoadHomeData.mockReturnValue(
      new Promise(res => { resolveLoad = res; }),
    );
    const { result, unmount } = await renderHook(() => useHomeData(), { wrapper: Wrapper });
    // Unmount before the promise settles
    unmount();
    // Now resolve — isActive is false, setData must NOT be called
    act(() => { resolveLoad(FULL_DATA); });
    // State stays at EMPTY (the hook is unmounted, result.current is frozen)
    expect(result.current.officeName).toBe('');
  });
});

describe('useHomeData — getFacilityForAgenda', () => {
  it('returns user facility from loaded userFacilities', async () => {
    const { result } = await renderHook(() => useHomeData(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.officeName).toBe('HQ'));
    const facility = result.current.getFacilityForAgenda(makeAgendaItem('user-1'));
    expect(facility?.id).toBe('user-1');
  });

  it('returns hardcoded facility when facilityId is in hardcoded list', async () => {
    const { result } = await renderHook(() => useHomeData(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.officeName).toBe('HQ'));
    const facility = result.current.getFacilityForAgenda(makeAgendaItem('hard-1'));
    expect(facility?.name).toBe('Hardcoded Facility');
  });

  it('returns undefined when facilityId not found anywhere', async () => {
    const { result } = await renderHook(() => useHomeData(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.officeName).toBe('HQ'));
    const facility = result.current.getFacilityForAgenda(makeAgendaItem('ghost-99'));
    expect(facility).toBeUndefined();
  });
});

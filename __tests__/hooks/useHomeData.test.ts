// __tests__/hooks/useHomeData.test.ts
//
// Covers src/hooks/useHomeData.ts
// Key gaps closed:
//   lines 29-32 — .catch error path (console.error + setData(EMPTY) when isActive)
//   line 32      — isActive=false guard (cleanup before resolve)
//   line 33      — getFacilityForAgenda delegation

import { renderHook, act } from '@testing-library/react-native';

// ── L4 mocks ──────────────────────────────────────────────────────────────────

const mockLoadHomeData = jest.fn();
const mockGetFacilityForAgenda = jest.fn();

jest.mock('../../src/utils/loadHomeData', () => ({
  loadHomeData: (...args: any[]) => mockLoadHomeData(...args),
  getFacilityForAgenda: (...args: any[]) => mockGetFacilityForAgenda(...args),
}));

// useFocusEffect executes the callback immediately in tests
jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => () => void) => {
    const cleanup = cb();
    return cleanup;
  },
}));

import { useHomeData } from '../../src/hooks/useHomeData';

const EMPTY_DATA = {
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

const FULL_DATA = {
  officeName: 'مديرية تلمسان',
  agendaItems: [{ id: 'a1', facilityId: 'f1', date: '2026-07-12', type: 'inspection' }],
  completedInspections: [{ id: 'i1' }],
  inProgressInspections: [],
  recentFacilities: [{ id: 'f1', name: 'مصنع أ' }],
  userFacilities: [{ id: 'f1', name: 'مصنع أ' }],
  stats: { totalCompleted: 1, totalDrafts: 0, nonCompliantFacilities: 0, openCapCount: 0 },
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  (console.error as jest.Mock).mockRestore();
});

// ── happy path ───────────────────────────────────────────────────────────────

describe('useHomeData — happy path', () => {
  it('populates state with loaded data on success', async () => {
    mockLoadHomeData.mockResolvedValue(FULL_DATA);

    let hook: any;
    await act(async () => {
      hook = renderHook(() => useHomeData());
    });

    expect(hook.result.current.officeName).toBe('مديرية تلمسان');
    expect(hook.result.current.completedInspections).toHaveLength(1);
  });

  it('starts with empty EMPTY state before resolve', () => {
    // Never resolves during render
    mockLoadHomeData.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useHomeData());
    expect(result.current.officeName).toBe('');
    expect(result.current.agendaItems).toEqual([]);
  });
});

// ── error path (lines 29-32) ──────────────────────────────────────────────────

describe('useHomeData — error path', () => {
  it('falls back to EMPTY and logs error when loadHomeData rejects', async () => {
    const err = new Error('DB failure');
    mockLoadHomeData.mockRejectedValue(err);

    let hook: any;
    await act(async () => {
      hook = renderHook(() => useHomeData());
    });

    expect(console.error).toHaveBeenCalledWith('useHomeData load error:', err);
    // State should reset to EMPTY structure
    expect(hook.result.current.officeName).toBe('');
    expect(hook.result.current.agendaItems).toEqual([]);
  });

  it('does NOT call setData if component unmounts before error resolves', async () => {
    let rejectFn!: (e: Error) => void;
    mockLoadHomeData.mockReturnValue(
      new Promise((_, rej) => { rejectFn = rej; }),
    );

    const { result, unmount } = renderHook(() => useHomeData());
    unmount(); // isActive = false

    await act(async () => { rejectFn(new Error('too late')); });

    // State should remain empty — setData never called after unmount
    expect(result.current.officeName).toBe('');
  });

  it('does NOT call setData if component unmounts before success resolves', async () => {
    let resolveFn!: (d: any) => void;
    mockLoadHomeData.mockReturnValue(
      new Promise(res => { resolveFn = res; }),
    );

    const { result, unmount } = renderHook(() => useHomeData());
    unmount(); // isActive = false

    await act(async () => { resolveFn(FULL_DATA); });

    expect(result.current.officeName).toBe('');
  });
});

// ── getFacilityForAgenda delegation ───────────────────────────────────────────

describe('useHomeData — getFacilityForAgenda', () => {
  it('delegates to _getFacility with the agenda item and userFacilities', async () => {
    mockLoadHomeData.mockResolvedValue(FULL_DATA);
    const facility = { id: 'f1', name: 'مصنع أ' };
    mockGetFacilityForAgenda.mockReturnValue(facility);

    let hook: any;
    await act(async () => {
      hook = renderHook(() => useHomeData());
    });

    const agendaItem = FULL_DATA.agendaItems[0];
    const result = hook.result.current.getFacilityForAgenda(agendaItem);

    expect(mockGetFacilityForAgenda).toHaveBeenCalledWith(
      agendaItem,
      FULL_DATA.userFacilities,
    );
    expect(result).toBe(facility);
  });

  it('returns undefined when facility not found', async () => {
    mockLoadHomeData.mockResolvedValue(FULL_DATA);
    mockGetFacilityForAgenda.mockReturnValue(undefined);

    let hook: any;
    await act(async () => {
      hook = renderHook(() => useHomeData());
    });

    const result = hook.result.current.getFacilityForAgenda({ id: 'unknown' });
    expect(result).toBeUndefined();
  });
});

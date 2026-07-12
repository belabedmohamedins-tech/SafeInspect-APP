// __tests__/hooks/useHomeData.test.ts
import { renderHook, act } from '@testing-library/react-native';

const mockLoadHomeData = jest.fn();
const mockGetFacilityForAgenda = jest.fn();

jest.mock('../../src/utils/loadHomeData', () => ({
  loadHomeData: (...args: any[]) => mockLoadHomeData(...args),
  getFacilityForAgenda: (...args: any[]) => mockGetFacilityForAgenda(...args),
}));

// Fire only once per hook instance
jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => () => void) => {
    const { useRef, useEffect } = require('react');
    const fired = useRef(false);
    useEffect(() => {
      if (!fired.current) {
        fired.current = true;
        const cleanup = cb();
        return cleanup;
      }
    }, []);
  },
}));

import { useHomeData } from '../../src/hooks/useHomeData';

const FULL_DATA = {
  officeName: '\u0645\u062f\u064a\u0631\u064a\u0629 \u062a\u0644\u0645\u0633\u0627\u0646',
  agendaItems: [{ id: 'a1', facilityId: 'f1', date: '2026-07-12', type: 'inspection' }],
  completedInspections: [{ id: 'i1' }],
  inProgressInspections: [],
  recentFacilities: [{ id: 'f1', name: '\u0645\u0635\u0646\u0639 \u0623' }],
  userFacilities: [{ id: 'f1', name: '\u0645\u0635\u0646\u0639 \u0623' }],
  stats: { totalCompleted: 1, totalDrafts: 0, nonCompliantFacilities: 0, openCapCount: 0 },
};

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
});

describe('useHomeData \u2014 happy path', () => {
  it('populates state with loaded data on success', async () => {
    mockLoadHomeData.mockResolvedValue(FULL_DATA);
    const { result } = renderHook(() => useHomeData());
    await act(async () => {});
    expect(result.current.officeName).toBe('\u0645\u062f\u064a\u0631\u064a\u0629 \u062a\u0644\u0645\u0633\u0627\u0646');
    expect(result.current.completedInspections).toHaveLength(1);
  });

  it('starts with empty state before resolve', () => {
    mockLoadHomeData.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useHomeData());
    expect(result.current.officeName).toBe('');
    expect(result.current.agendaItems).toEqual([]);
  });
});

describe('useHomeData \u2014 error path', () => {
  it('falls back to EMPTY and logs error when loadHomeData rejects', async () => {
    const err = new Error('DB failure');
    mockLoadHomeData.mockRejectedValue(err);
    const { result } = renderHook(() => useHomeData());
    await act(async () => {});
    expect(consoleErrorSpy).toHaveBeenCalledWith('useHomeData load error:', err);
    expect(result.current.officeName).toBe('');
    expect(result.current.agendaItems).toEqual([]);
  });

  it('does NOT call setData if component unmounts before error resolves', async () => {
    let rejectFn!: (e: Error) => void;
    mockLoadHomeData.mockReturnValue(new Promise((_, rej) => { rejectFn = rej; }));
    const { result, unmount } = renderHook(() => useHomeData());
    unmount();
    await act(async () => { rejectFn(new Error('too late')); });
    expect(result.current.officeName).toBe('');
  });

  it('does NOT call setData if component unmounts before success resolves', async () => {
    let resolveFn!: (d: any) => void;
    mockLoadHomeData.mockReturnValue(new Promise(res => { resolveFn = res; }));
    const { result, unmount } = renderHook(() => useHomeData());
    unmount();
    await act(async () => { resolveFn(FULL_DATA); });
    expect(result.current.officeName).toBe('');
  });
});

describe('useHomeData \u2014 getFacilityForAgenda', () => {
  it('delegates to _getFacility with the agenda item and userFacilities', async () => {
    mockLoadHomeData.mockResolvedValue(FULL_DATA);
    const facility = { id: 'f1', name: '\u0645\u0635\u0646\u0639 \u0623' };
    mockGetFacilityForAgenda.mockReturnValue(facility);
    const { result } = renderHook(() => useHomeData());
    await act(async () => {});
    const agendaItem = FULL_DATA.agendaItems[0];
    const res = result.current.getFacilityForAgenda(agendaItem);
    expect(mockGetFacilityForAgenda).toHaveBeenCalledWith(agendaItem, FULL_DATA.userFacilities);
    expect(res).toBe(facility);
  });

  it('returns undefined when facility not found', async () => {
    mockLoadHomeData.mockResolvedValue(FULL_DATA);
    mockGetFacilityForAgenda.mockReturnValue(undefined);
    const { result } = renderHook(() => useHomeData());
    await act(async () => {});
    const res = result.current.getFacilityForAgenda({ id: 'unknown' });
    expect(res).toBeUndefined();
  });
});

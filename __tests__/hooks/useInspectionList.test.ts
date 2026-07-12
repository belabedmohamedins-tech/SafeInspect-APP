// __tests__/hooks/useInspectionList.test.ts
//
// Covers src/hooks/useInspectionList.ts
// Key gaps closed:
//   line 39 — catch block in useFocusEffect load (console.error)
//   deleteInspection — Alert.alert dispatch, success + error paths
//   filtered — activeFilter, searchQuery, sort

import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';

// ── L4 mocks ──────────────────────────────────────────────────────────────────

const mockGetAll = jest.fn();
const mockDelete = jest.fn();

jest.mock('../../src/repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getAll: (...args: any[]) => mockGetAll(...args),
    delete: (...args: any[]) => mockDelete(...args),
  },
}));

jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => () => void) => { cb(); },
}));

import { useInspectionList } from '../../src/hooks/useInspectionList';

const makeInspection = (overrides: Record<string, any> = {}) => ({
  id: 'i1',
  status: 'completed',
  date: '2026-07-10T10:00:00Z',
  facilityName: 'مصنع الأمل',
  facilityAddress: 'تلمسان',
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  (console.error as jest.Mock).mockRestore();
});

// ── load — happy path ─────────────────────────────────────────────────────────

describe('useInspectionList — load', () => {
  it('loads and exposes all inspections on mount', async () => {
    const data = [makeInspection({ id: 'i1' }), makeInspection({ id: 'i2', status: 'in-progress' })];
    mockGetAll.mockResolvedValue(data);

    let hook: any;
    await act(async () => { hook = renderHook(() => useInspectionList()); });

    expect(hook.result.current.totalCount).toBe(2);
  });

  it('initialises with empty list before load resolves', () => {
    mockGetAll.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useInspectionList());
    expect(result.current.totalCount).toBe(0);
  });
});

// ── load error path (line 39) ─────────────────────────────────────────────────

describe('useInspectionList — load error path', () => {
  it('logs error and keeps empty state when getAll rejects', async () => {
    const err = new Error('DB read failed');
    mockGetAll.mockRejectedValue(err);

    let hook: any;
    await act(async () => { hook = renderHook(() => useInspectionList()); });

    expect(console.error).toHaveBeenCalledWith('useInspectionList load error:', err);
    expect(hook.result.current.totalCount).toBe(0);
  });
});

// ── filtering ─────────────────────────────────────────────────────────────────

describe('useInspectionList — filtered', () => {
  const data = [
    makeInspection({ id: 'i1', status: 'completed',   date: '2026-07-10T10:00:00Z', facilityName: 'مصنع الأمل',    facilityAddress: 'تلمسان' }),
    makeInspection({ id: 'i2', status: 'in-progress', date: '2026-07-11T10:00:00Z', facilityName: 'مستودع البركة',  facilityAddress: 'وهران'  }),
    makeInspection({ id: 'i3', status: 'completed',   date: '2026-07-09T10:00:00Z', facilityName: 'مطعم الفاروق', facilityAddress: 'سيدي بلعباس' }),
  ];

  beforeEach(() => { mockGetAll.mockResolvedValue(data); });

  it('returns all inspections when filter is "all"', async () => {
    let hook: any;
    await act(async () => { hook = renderHook(() => useInspectionList()); });
    expect(hook.result.current.filtered).toHaveLength(3);
  });

  it('filters by status "completed"', async () => {
    let hook: any;
    await act(async () => { hook = renderHook(() => useInspectionList()); });
    act(() => { hook.result.current.setActiveFilter('completed'); });
    expect(hook.result.current.filtered).toHaveLength(2);
    hook.result.current.filtered.forEach((i: any) => expect(i.status).toBe('completed'));
  });

  it('filters by status "in-progress"', async () => {
    let hook: any;
    await act(async () => { hook = renderHook(() => useInspectionList()); });
    act(() => { hook.result.current.setActiveFilter('in-progress'); });
    expect(hook.result.current.filtered).toHaveLength(1);
    expect(hook.result.current.filtered[0].id).toBe('i2');
  });

  it('filters by facilityName search query', async () => {
    let hook: any;
    await act(async () => { hook = renderHook(() => useInspectionList()); });
    act(() => { hook.result.current.setSearchQuery('أمل'); });
    expect(hook.result.current.filtered).toHaveLength(1);
    expect(hook.result.current.filtered[0].id).toBe('i1');
  });

  it('filters by facilityAddress search query', async () => {
    let hook: any;
    await act(async () => { hook = renderHook(() => useInspectionList()); });
    act(() => { hook.result.current.setSearchQuery('وهران'); });
    expect(hook.result.current.filtered).toHaveLength(1);
    expect(hook.result.current.filtered[0].id).toBe('i2');
  });

  it('returns all when searchQuery is empty string', async () => {
    let hook: any;
    await act(async () => { hook = renderHook(() => useInspectionList()); });
    act(() => { hook.result.current.setSearchQuery(''); });
    expect(hook.result.current.filtered).toHaveLength(3);
  });

  it('sorts by date descending', async () => {
    let hook: any;
    await act(async () => { hook = renderHook(() => useInspectionList()); });
    const ids = hook.result.current.filtered.map((i: any) => i.id);
    expect(ids).toEqual(['i2', 'i1', 'i3']);
  });
});

// ── deleteInspection ──────────────────────────────────────────────────────────

describe('useInspectionList — deleteInspection', () => {
  beforeEach(() => {
    mockGetAll.mockResolvedValue([makeInspection({ id: 'i1' })]);
  });

  it('calls Alert.alert with correct title and message', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    let hook: any;
    await act(async () => { hook = renderHook(() => useInspectionList()); });
    await act(async () => { hook.result.current.deleteInspection('i1'); });

    expect(alertSpy).toHaveBeenCalledWith(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذا التفتيش؟',
      expect.any(Array),
    );
    alertSpy.mockRestore();
  });

  it('removes the inspection from state when onPress (destructive) is called', async () => {
    mockDelete.mockResolvedValue(undefined);
    let capturedButtons: any[];
    jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons) => {
      capturedButtons = buttons!;
    });

    let hook: any;
    await act(async () => { hook = renderHook(() => useInspectionList()); });
    await act(async () => { hook.result.current.deleteInspection('i1'); });
    await act(async () => { await capturedButtons[1].onPress(); });

    expect(mockDelete).toHaveBeenCalledWith('i1');
    expect(hook.result.current.totalCount).toBe(0);

    jest.restoreAllMocks();
  });

  it('logs error when InspectionRepository.delete rejects', async () => {
    const err = new Error('delete failed');
    mockDelete.mockRejectedValue(err);
    let capturedButtons: any[];
    jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons) => {
      capturedButtons = buttons!;
    });

    let hook: any;
    await act(async () => { hook = renderHook(() => useInspectionList()); });
    await act(async () => { hook.result.current.deleteInspection('i1'); });
    await act(async () => { await capturedButtons[1].onPress(); });

    expect(console.error).toHaveBeenCalledWith('Delete error:', err);
    jest.restoreAllMocks();
  });

  it('does nothing on cancel button press', async () => {
    let capturedButtons: any[];
    jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons) => {
      capturedButtons = buttons!;
    });

    let hook: any;
    await act(async () => { hook = renderHook(() => useInspectionList()); });
    await act(async () => { hook.result.current.deleteInspection('i1'); });

    // Cancel button has no onPress
    expect(capturedButtons[0].text).toBe('إلغاء');
    expect(capturedButtons[0].onPress).toBeUndefined();
    jest.restoreAllMocks();
  });
});

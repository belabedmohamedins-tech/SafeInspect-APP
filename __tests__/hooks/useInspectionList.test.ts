// __tests__/hooks/useInspectionList.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';

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

describe('useInspectionList — load', () => {
  it('loads and exposes all inspections on mount', async () => {
    mockGetAll.mockResolvedValue([makeInspection({ id: 'i1' }), makeInspection({ id: 'i2', status: 'in-progress' })]);
    const { result } = renderHook(() => useInspectionList());
    await act(async () => {});
    expect(result.current.totalCount).toBe(2);
  });

  it('initialises with empty list before load resolves', () => {
    mockGetAll.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useInspectionList());
    expect(result.current.totalCount).toBe(0);
  });
});

describe('useInspectionList — load error path', () => {
  it('logs error and keeps empty state when getAll rejects', async () => {
    const err = new Error('DB read failed');
    mockGetAll.mockRejectedValue(err);
    const { result } = renderHook(() => useInspectionList());
    await act(async () => {});
    expect(console.error).toHaveBeenCalledWith('useInspectionList load error:', err);
    expect(result.current.totalCount).toBe(0);
  });
});

describe('useInspectionList — filtered', () => {
  const data = [
    makeInspection({ id: 'i1', status: 'completed',   date: '2026-07-10T10:00:00Z', facilityName: 'مصنع الأمل',    facilityAddress: 'تلمسان' }),
    makeInspection({ id: 'i2', status: 'in-progress', date: '2026-07-11T10:00:00Z', facilityName: 'مستودع البركة', facilityAddress: 'وهران' }),
    makeInspection({ id: 'i3', status: 'completed',   date: '2026-07-09T10:00:00Z', facilityName: 'مطعم الفاروق', facilityAddress: 'سيدي بلعباس' }),
  ];

  beforeEach(() => { mockGetAll.mockResolvedValue(data); });

  it('returns all inspections when filter is "all"', async () => {
    const { result } = renderHook(() => useInspectionList());
    await act(async () => {});
    expect(result.current.filtered).toHaveLength(3);
  });

  it('filters by status "completed"', async () => {
    const { result } = renderHook(() => useInspectionList());
    await act(async () => {});
    act(() => { result.current.setActiveFilter('completed'); });
    expect(result.current.filtered).toHaveLength(2);
    result.current.filtered.forEach((i: any) => expect(i.status).toBe('completed'));
  });

  it('filters by status "in-progress"', async () => {
    const { result } = renderHook(() => useInspectionList());
    await act(async () => {});
    act(() => { result.current.setActiveFilter('in-progress'); });
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].id).toBe('i2');
  });

  it('filters by facilityName search query', async () => {
    const { result } = renderHook(() => useInspectionList());
    await act(async () => {});
    act(() => { result.current.setSearchQuery('أمل'); });
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].id).toBe('i1');
  });

  it('filters by facilityAddress search query', async () => {
    const { result } = renderHook(() => useInspectionList());
    await act(async () => {});
    act(() => { result.current.setSearchQuery('وهران'); });
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].id).toBe('i2');
  });

  it('returns all when searchQuery is empty string', async () => {
    const { result } = renderHook(() => useInspectionList());
    await act(async () => {});
    act(() => { result.current.setSearchQuery(''); });
    expect(result.current.filtered).toHaveLength(3);
  });

  it('sorts by date descending', async () => {
    const { result } = renderHook(() => useInspectionList());
    await act(async () => {});
    const ids = result.current.filtered.map((i: any) => i.id);
    expect(ids).toEqual(['i2', 'i1', 'i3']);
  });
});

describe('useInspectionList — deleteInspection', () => {
  beforeEach(() => {
    mockGetAll.mockResolvedValue([makeInspection({ id: 'i1' })]);
  });

  it('calls Alert.alert with correct title and message', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { result } = renderHook(() => useInspectionList());
    await act(async () => {});
    act(() => { result.current.deleteInspection('i1'); });
    expect(alertSpy).toHaveBeenCalledWith('تأكيد الحذف', 'هل أنت متأكد من حذف هذا التفتيش؟', expect.any(Array));
    alertSpy.mockRestore();
  });

  it('removes the inspection from state when onPress (destructive) is called', async () => {
    mockDelete.mockResolvedValue(undefined);
    let capturedButtons: any[];
    jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons) => { capturedButtons = buttons!; });
    const { result } = renderHook(() => useInspectionList());
    await act(async () => {});
    act(() => { result.current.deleteInspection('i1'); });
    await act(async () => { await capturedButtons[1].onPress(); });
    expect(mockDelete).toHaveBeenCalledWith('i1');
    expect(result.current.totalCount).toBe(0);
    jest.restoreAllMocks();
  });

  it('logs error when InspectionRepository.delete rejects', async () => {
    const err = new Error('delete failed');
    mockDelete.mockRejectedValue(err);
    let capturedButtons: any[];
    jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons) => { capturedButtons = buttons!; });
    const { result } = renderHook(() => useInspectionList());
    await act(async () => {});
    act(() => { result.current.deleteInspection('i1'); });
    await act(async () => { await capturedButtons[1].onPress(); });
    expect(console.error).toHaveBeenCalledWith('Delete error:', err);
    jest.restoreAllMocks();
  });

  it('does nothing on cancel button press', async () => {
    let capturedButtons: any[];
    jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons) => { capturedButtons = buttons!; });
    const { result } = renderHook(() => useInspectionList());
    await act(async () => {});
    act(() => { result.current.deleteInspection('i1'); });
    expect(capturedButtons[0].text).toBe('إلغاء');
    expect(capturedButtons[0].onPress).toBeUndefined();
    jest.restoreAllMocks();
  });
});

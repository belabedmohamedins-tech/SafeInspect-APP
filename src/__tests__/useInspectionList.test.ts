/**
 * Unit tests for src/hooks/useInspectionList.ts
 */
import { act, renderHook } from '@testing-library/react-hooks';
import { Alert } from 'react-native';
import { useInspectionList } from '../hooks/useInspectionList';
import { SavedInspection } from '../types';

// ─── Mocks ───────────────────────────────────────────────────────────

// useFocusEffect: immediately invoke the callback on mount
jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => () => void) => { cb(); },
}));

const mockGetAll  = jest.fn();
const mockDelete  = jest.fn().mockResolvedValue(undefined);
jest.mock('../repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getAll:  (...a: any[]) => mockGetAll(...a),
    delete:  (...a: any[]) => mockDelete(...a),
  },
}));

jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

// ─── Helpers ───────────────────────────────────────────────────────────

const makeInsp = (id: string, status: 'completed' | 'in-progress', date: string,
  facilityName = 'منشأة', facilityAddress = 'عنوان'): SavedInspection => ({
  id, facilityId: 'f1', facilityName, facilityAddress, date,
  inspectorName: '', status, officeName: '', inspectionCause: '',
  referenceDocument: '', committeeMembers: [], items: [],
});

beforeEach(() => {
  jest.clearAllMocks();
  mockGetAll.mockResolvedValue([]);
});

// ─── Tests ───────────────────────────────────────────────────────────

describe('useInspectionList — loading', () => {
  it('loads all inspections on focus', async () => {
    const data = [makeInsp('i1', 'completed', '2026-05-01T00:00:00Z')];
    mockGetAll.mockResolvedValue(data);
    const { result, waitForNextUpdate } = renderHook(() => useInspectionList());
    await waitForNextUpdate();
    expect(result.current.totalCount).toBe(1);
  });

  it('filtered is sorted by date descending by default', async () => {
    mockGetAll.mockResolvedValue([
      makeInsp('old', 'completed', '2026-01-01T00:00:00Z'),
      makeInsp('new', 'completed', '2026-06-01T00:00:00Z'),
    ]);
    const { result, waitForNextUpdate } = renderHook(() => useInspectionList());
    await waitForNextUpdate();
    expect(result.current.filtered[0].id).toBe('new');
    expect(result.current.filtered[1].id).toBe('old');
  });
});

describe('useInspectionList — filtering', () => {
  async function setup() {
    mockGetAll.mockResolvedValue([
      makeInsp('c1', 'completed',   '2026-06-01T00:00:00Z', 'مخبزة الصدى',  'شارع رقم 1'),
      makeInsp('c2', 'completed',   '2026-05-01T00:00:00Z', 'مطعم التوفيق', 'حي السلام'),
      makeInsp('d1', 'in-progress', '2026-04-01T00:00:00Z', 'صيدلية النور',  'شارع رقم 2'),
    ]);
    const hook = renderHook(() => useInspectionList());
    await hook.waitForNextUpdate();
    return hook.result;
  }

  it('activeFilter="completed" shows only completed inspections', async () => {
    const result = await setup();
    act(() => result.current.setActiveFilter('completed'));
    expect(result.current.filtered.every(i => i.status === 'completed')).toBe(true);
    expect(result.current.filtered).toHaveLength(2);
  });

  it('activeFilter="in-progress" shows only drafts', async () => {
    const result = await setup();
    act(() => result.current.setActiveFilter('in-progress'));
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].id).toBe('d1');
  });

  it('searchQuery filters by facilityName (case-insensitive)', async () => {
    const result = await setup();
    act(() => result.current.setSearchQuery('مخبز'));
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].id).toBe('c1');
  });

  it('searchQuery filters by facilityAddress', async () => {
    const result = await setup();
    act(() => result.current.setSearchQuery('حي السلام'));
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].id).toBe('c2');
  });

  it('searchQuery + activeFilter combine correctly', async () => {
    const result = await setup();
    act(() => {
      result.current.setActiveFilter('completed');
      result.current.setSearchQuery('مطعم');
    });
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].id).toBe('c2');
  });

  it('empty searchQuery shows all items for the active filter', async () => {
    const result = await setup();
    act(() => result.current.setSearchQuery(''));
    expect(result.current.filtered).toHaveLength(3);
  });

  it('totalCount always reflects the unfiltered list', async () => {
    const result = await setup();
    act(() => result.current.setActiveFilter('completed'));
    expect(result.current.totalCount).toBe(3); // not 2
  });
});

describe('useInspectionList — setters', () => {
  it('setSearchQuery updates searchQuery', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useInspectionList());
    await waitForNextUpdate();
    act(() => result.current.setSearchQuery('بحث'));
    expect(result.current.searchQuery).toBe('بحث');
  });

  it('setActiveFilter updates activeFilter', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useInspectionList());
    await waitForNextUpdate();
    act(() => result.current.setActiveFilter('completed'));
    expect(result.current.activeFilter).toBe('completed');
  });
});

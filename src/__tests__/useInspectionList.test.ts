// src/__tests__/useInspectionList.test.ts
//
// STRATEGY: renderHook — useFocusEffect is mocked globally in jest.setup.ts
// to fire via useEffect on mount, so result.current is populated correctly.

jest.mock('../repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getAll:   jest.fn(),
    delete:   jest.fn(),
  },
}));

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useInspectionList } from '../hooks/useInspectionList';
import { InspectionRepository } from '../repositories/InspectionRepository';
import { SavedInspection } from '../types';

const mockGetAll = InspectionRepository.getAll as jest.MockedFunction<any>;
const mockDelete = InspectionRepository.delete as jest.MockedFunction<any>;

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);

function makeInspection(overrides: Partial<SavedInspection> = {}): SavedInspection {
  return {
    id: 'i1', facilityId: 'f1', facilityName: 'Alpha Facility',
    facilityAddress: '10 Main St', date: new Date().toISOString(),
    inspectorName: 'X', officeName: 'O', status: 'completed',
    items: [], inspectionCause: '', referenceDocument: '', committeeMembers: [],
    ...overrides,
  } as SavedInspection;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetAll.mockResolvedValue([]);
  mockDelete.mockResolvedValue(undefined);
});

describe('useInspectionList — initial state', () => {
  it('starts with empty filtered list and zero totalCount', () => {
    mockGetAll.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useInspectionList(), { wrapper });
    expect(result.current.filtered).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.searchQuery).toBe('');
    expect(result.current.activeFilter).toBe('all');
  });
});

describe('useInspectionList — data load on mount', () => {
  it('loads inspections via useFocusEffect on mount', async () => {
    mockGetAll.mockResolvedValue([
      makeInspection({ id: 'i1' }),
      makeInspection({ id: 'i2', status: 'in-progress' }),
    ]);
    const { result } = renderHook(() => useInspectionList(), { wrapper });
    await waitFor(() => expect(result.current.totalCount).toBe(2));
    expect(result.current.filtered).toHaveLength(2);
  });

  it('stays empty when InspectionRepository.getAll rejects', async () => {
    mockGetAll.mockRejectedValue(new Error('db error'));
    const { result } = renderHook(() => useInspectionList(), { wrapper });
    await waitFor(() => expect(mockGetAll).toHaveBeenCalled());
    expect(result.current.totalCount).toBe(0);
  });
});

describe('useInspectionList — filter by status', () => {
  beforeEach(() => {
    mockGetAll.mockResolvedValue([
      makeInspection({ id: 'c1', status: 'completed' }),
      makeInspection({ id: 'c2', status: 'completed' }),
      makeInspection({ id: 'd1', status: 'in-progress' }),
    ]);
  });

  it('filter "all" returns everything', async () => {
    const { result } = renderHook(() => useInspectionList(), { wrapper });
    await waitFor(() => expect(result.current.totalCount).toBe(3));
    expect(result.current.filtered).toHaveLength(3);
  });

  it('filter "completed" returns only completed', async () => {
    const { result } = renderHook(() => useInspectionList(), { wrapper });
    await waitFor(() => expect(result.current.totalCount).toBe(3));
    act(() => result.current.setActiveFilter('completed'));
    expect(result.current.filtered).toHaveLength(2);
    expect(result.current.filtered.every(i => i.status === 'completed')).toBe(true);
  });

  it('filter "in-progress" returns only drafts', async () => {
    const { result } = renderHook(() => useInspectionList(), { wrapper });
    await waitFor(() => expect(result.current.totalCount).toBe(3));
    act(() => result.current.setActiveFilter('in-progress'));
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].id).toBe('d1');
  });
});

describe('useInspectionList — search', () => {
  beforeEach(() => {
    mockGetAll.mockResolvedValue([
      makeInspection({ id: 'i1', facilityName: 'Alpha Facility',  facilityAddress: '10 Main St' }),
      makeInspection({ id: 'i2', facilityName: 'Beta Corp',       facilityAddress: '20 Side Ave' }),
      makeInspection({ id: 'i3', facilityName: 'Gamma Industries', facilityAddress: '10 Main St' }),
    ]);
  });

  it('empty query returns all items', async () => {
    const { result } = renderHook(() => useInspectionList(), { wrapper });
    await waitFor(() => expect(result.current.totalCount).toBe(3));
    expect(result.current.filtered).toHaveLength(3);
  });

  it('query matches facilityName case-insensitively', async () => {
    const { result } = renderHook(() => useInspectionList(), { wrapper });
    await waitFor(() => expect(result.current.totalCount).toBe(3));
    act(() => result.current.setSearchQuery('alpha'));
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].id).toBe('i1');
  });

  it('query matches facilityAddress case-insensitively', async () => {
    const { result } = renderHook(() => useInspectionList(), { wrapper });
    await waitFor(() => expect(result.current.totalCount).toBe(3));
    act(() => result.current.setSearchQuery('main'));
    expect(result.current.filtered).toHaveLength(2);
  });

  it('query with no match returns empty array', async () => {
    const { result } = renderHook(() => useInspectionList(), { wrapper });
    await waitFor(() => expect(result.current.totalCount).toBe(3));
    act(() => result.current.setSearchQuery('zzznomatch'));
    expect(result.current.filtered).toHaveLength(0);
  });
});

describe('useInspectionList — sort order', () => {
  it('filtered list is sorted descending by date', async () => {
    const d1 = new Date('2024-01-01').toISOString();
    const d2 = new Date('2024-06-15').toISOString();
    const d3 = new Date('2024-03-10').toISOString();
    mockGetAll.mockResolvedValue([
      makeInspection({ id: 'old',  date: d1 }),
      makeInspection({ id: 'new',  date: d2 }),
      makeInspection({ id: 'mid',  date: d3 }),
    ]);
    const { result } = renderHook(() => useInspectionList(), { wrapper });
    await waitFor(() => expect(result.current.totalCount).toBe(3));
    expect(result.current.filtered[0].id).toBe('new');
    expect(result.current.filtered[2].id).toBe('old');
  });
});

describe('useInspectionList — deleteInspection', () => {
  it('calls Alert.alert with the confirmation message', async () => {
    mockGetAll.mockResolvedValue([makeInspection({ id: 'del-1' })]);
    const { result } = renderHook(() => useInspectionList(), { wrapper });
    await waitFor(() => expect(result.current.totalCount).toBe(1));
    await act(async () => {
      await result.current.deleteInspection('del-1');
    });
    expect(Alert.alert).toHaveBeenCalledWith(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذا التفتيش؟',
      expect.any(Array)
    );
  });

  it('removes inspection from list after onPress confirm', async () => {
    mockGetAll.mockResolvedValue([makeInspection({ id: 'del-1' })]);
    const { result } = renderHook(() => useInspectionList(), { wrapper });
    await waitFor(() => expect(result.current.totalCount).toBe(1));

    // Capture the Alert call and invoke the destructive button's onPress
    let alertButtons: any[] = [];
    (Alert.alert as jest.Mock).mockImplementation((_t, _m, buttons) => {
      alertButtons = buttons;
    });

    await act(async () => { result.current.deleteInspection('del-1'); });
    await act(async () => { await alertButtons[1].onPress(); });

    expect(mockDelete).toHaveBeenCalledWith('del-1');
    expect(result.current.filtered).toHaveLength(0);
  });
});

// src/__tests__/useInspectionList.test.ts
//
// ARCHITECTURE:
//   useFocusEffect is mocked globally (jest.setup.ts) to call cb() directly
//   on mount — no useEffect, no hook violation. The callback contains an
//   async run() that calls InspectionRepository.getAll(). Because getAll is
//   mocked with mockResolvedValue(), the Promise settles as a microtask after
//   renderHook returns. We use waitFor() to wait for totalCount to update.
//
// IMPORTANT — RTLRN v14 renderHook() is async → always await it.
//
// IMPORTANT — act() wrapping state setter calls must be:
//   await act(async () => { setter(...) })
//   Plain act(() => setter()) does not guarantee the update is committed in
//   RTLRN v14 before the next assertion runs.
//
// MOCK SCOPING RULE:
//   Only the outer beforeEach calls jest.clearAllMocks(). Nested beforeEach
//   blocks only call mockGetAll.mockResolvedValue() — they must NOT call
//   jest.clearAllMocks() or jest.resetAllMocks(), as that wipes useNavigation
//   and useRouter stubs set by jest.setup.ts, causing renderHook to throw
//   and result.current to be null for every subsequent test.

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

function Wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}

function makeInspection(overrides: Partial<SavedInspection> = {}): SavedInspection {
  return {
    id: 'i1',
    facilityId: 'f1',
    facilityName: 'Alpha Facility',
    facilityAddress: '10 Main St',
    date: new Date().toISOString(),
    inspectorName: 'X',
    officeName: 'O',
    status: 'completed',
    items: [],
    inspectionCause: '',
    referenceDocument: '',
    committeeMembers: [],
    ...overrides,
  } as SavedInspection;
}

// Outer beforeEach — runs before EVERY test. Resets all mocks cleanly.
beforeEach(() => {
  jest.clearAllMocks();
  mockGetAll.mockResolvedValue([]);
  mockDelete.mockResolvedValue(undefined);
});

// ─── initial state ───────────────────────────────────────────────────────────
describe('useInspectionList — initial state', () => {
  it('starts with empty filtered list and zero totalCount before load resolves', async () => {
    mockGetAll.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = await renderHook(() => useInspectionList(), { wrapper: Wrapper });
    expect(result.current.filtered).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.searchQuery).toBe('');
    expect(result.current.activeFilter).toBe('all');
  });
});

// ─── data load on mount ───────────────────────────────────────────────────────
describe('useInspectionList — data load on mount', () => {
  it('loads inspections via useFocusEffect on mount', async () => {
    mockGetAll.mockResolvedValue([
      makeInspection({ id: 'i1' }),
      makeInspection({ id: 'i2', status: 'in-progress' }),
    ]);
    const { result } = await renderHook(() => useInspectionList(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.totalCount).toBe(2));
    expect(result.current.filtered).toHaveLength(2);
  });

  it('stays empty when InspectionRepository.getAll rejects', async () => {
    mockGetAll.mockRejectedValue(new Error('db error'));
    const { result } = await renderHook(() => useInspectionList(), { wrapper: Wrapper });
    await waitFor(() => expect(mockGetAll).toHaveBeenCalled());
    expect(result.current.totalCount).toBe(0);
  });
});

// ─── filter by status ─────────────────────────────────────────────────────────
// NOTE: nested beforeEach here does NOT call jest.clearAllMocks().
// It only overrides mockGetAll for this describe block.
describe('useInspectionList — filter by status', () => {
  beforeEach(() => {
    mockGetAll.mockResolvedValue([
      makeInspection({ id: 'c1', status: 'completed' }),
      makeInspection({ id: 'c2', status: 'completed' }),
      makeInspection({ id: 'd1', status: 'in-progress' }),
    ]);
  });

  it('filter "all" returns everything', async () => {
    const { result } = await renderHook(() => useInspectionList(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.totalCount).toBe(3));
    expect(result.current.filtered).toHaveLength(3);
  });

  it('filter "completed" returns only completed', async () => {
    const { result } = await renderHook(() => useInspectionList(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.totalCount).toBe(3));
    await act(async () => { result.current.setActiveFilter('completed'); });
    expect(result.current.filtered).toHaveLength(2);
    expect(result.current.filtered.every(i => i.status === 'completed')).toBe(true);
  });

  it('filter "in-progress" returns only drafts', async () => {
    const { result } = await renderHook(() => useInspectionList(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.totalCount).toBe(3));
    await act(async () => { result.current.setActiveFilter('in-progress'); });
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].id).toBe('d1');
  });
});

// ─── search ───────────────────────────────────────────────────────────────────
describe('useInspectionList — search', () => {
  beforeEach(() => {
    mockGetAll.mockResolvedValue([
      makeInspection({ id: 'i1', facilityName: 'Alpha Facility',   facilityAddress: '10 Main St' }),
      makeInspection({ id: 'i2', facilityName: 'Beta Corp',        facilityAddress: '20 Side Ave' }),
      makeInspection({ id: 'i3', facilityName: 'Gamma Industries', facilityAddress: '10 Main St' }),
    ]);
  });

  it('empty query returns all items', async () => {
    const { result } = await renderHook(() => useInspectionList(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.totalCount).toBe(3));
    expect(result.current.filtered).toHaveLength(3);
  });

  it('query matches facilityName case-insensitively', async () => {
    const { result } = await renderHook(() => useInspectionList(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.totalCount).toBe(3));
    await act(async () => { result.current.setSearchQuery('alpha'); });
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].id).toBe('i1');
  });

  it('query matches facilityAddress case-insensitively', async () => {
    const { result } = await renderHook(() => useInspectionList(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.totalCount).toBe(3));
    await act(async () => { result.current.setSearchQuery('main'); });
    expect(result.current.filtered).toHaveLength(2);
  });

  it('query with no match returns empty array', async () => {
    const { result } = await renderHook(() => useInspectionList(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.totalCount).toBe(3));
    await act(async () => { result.current.setSearchQuery('zzznomatch'); });
    expect(result.current.filtered).toHaveLength(0);
  });
});

// ─── sort order ───────────────────────────────────────────────────────────────
describe('useInspectionList — sort order', () => {
  it('filtered list is sorted descending by date', async () => {
    mockGetAll.mockResolvedValue([
      makeInspection({ id: 'old', date: new Date('2024-01-01').toISOString() }),
      makeInspection({ id: 'new', date: new Date('2024-06-15').toISOString() }),
      makeInspection({ id: 'mid', date: new Date('2024-03-10').toISOString() }),
    ]);
    const { result } = await renderHook(() => useInspectionList(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.totalCount).toBe(3));
    expect(result.current.filtered[0].id).toBe('new');
    expect(result.current.filtered[2].id).toBe('old');
  });
});

// ─── deleteInspection ─────────────────────────────────────────────────────────
describe('useInspectionList — deleteInspection', () => {
  it('calls Alert.alert with the confirmation message', async () => {
    mockGetAll.mockResolvedValue([makeInspection({ id: 'del-1' })]);
    const { result } = await renderHook(() => useInspectionList(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.totalCount).toBe(1));
    await act(async () => {
      await result.current.deleteInspection('del-1');
    });
    expect(Alert.alert).toHaveBeenCalledWith(
      '\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u062d\u0630\u0641',
      '\u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u062d\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u062a\u0641\u062a\u064a\u0634\u061f',
      expect.any(Array)
    );
  });

  it('removes inspection from list after onPress confirm', async () => {
    mockGetAll.mockResolvedValue([makeInspection({ id: 'del-1' })]);
    const { result } = await renderHook(() => useInspectionList(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.totalCount).toBe(1));

    // CRITICAL: install the capturing mock BEFORE calling deleteInspection.
    // Alert.alert fires synchronously inside deleteInspection — if the mock
    // is installed after the call, alertButtons stays [] and onPress() is
    // never invoked, so the item is never removed from the list.
    let alertButtons: any[] = [];
    (Alert.alert as jest.Mock).mockImplementation((_t, _m, buttons) => {
      alertButtons = buttons;
    });

    // Trigger the delete — Alert.alert fires here, alertButtons is now populated
    await act(async () => { result.current.deleteInspection('del-1'); });

    // Simulate user pressing the confirm button (index 1 = 'حذف')
    await act(async () => { await alertButtons[1].onPress(); });

    // Wait for React to commit the setInspections state update
    await waitFor(() => expect(result.current.filtered).toHaveLength(0));

    expect(mockDelete).toHaveBeenCalledWith('del-1');
  });
});

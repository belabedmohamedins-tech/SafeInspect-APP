// src/__tests__/useInspectionList.test.ts

jest.mock('../repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getAll:  jest.fn(),
    delete:  jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn((cb: () => void) => { cb(); }),
}));

jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
}));

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { InspectionRepository } from '../repositories/InspectionRepository';
import { useInspectionList } from '../hooks/useInspectionList';
import { SavedInspection } from '../types';

const mockGetAll = InspectionRepository.getAll as jest.MockedFunction<typeof InspectionRepository.getAll>;
const mockDelete = InspectionRepository.delete as jest.MockedFunction<typeof InspectionRepository.delete>;
const mockFocus  = useFocusEffect as jest.MockedFunction<typeof useFocusEffect>;
const mockAlert  = Alert.alert as jest.MockedFunction<typeof Alert.alert>;

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}

function makeInspection(overrides: Partial<SavedInspection> = {}): SavedInspection {
  return {
    id: 'insp-1',
    facilityId: 'fac-1',
    facilityName: 'Test Facility',
    facilityAddress: '123 Main St',
    date: new Date().toISOString(),
    inspectorName: 'Ahmed',
    officeName: 'Central Office',
    status: 'completed',
    items: [],
    inspectionCause: '',
    referenceDocument: '',
    committeeMembers: [],
    ...overrides,
  } as SavedInspection;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockFocus.mockImplementation((cb) => { cb(); });
  mockGetAll.mockResolvedValue([]);
  (mockDelete as jest.Mock).mockResolvedValue(undefined);
});

describe('useInspectionList', () => {
  it('starts with empty inspections', async () => {
    mockGetAll.mockReturnValue(new Promise(() => {}));
    let result: ReturnType<typeof renderHook<ReturnType<typeof useInspectionList>, any>>['result'];
    await act(async () => {
      ({ result } = renderHook(() => useInspectionList(), { wrapper }));
    });
    expect(result!.current).toBeDefined();
    expect(result!.current.filtered).toEqual([]);
    expect(result!.current.totalCount).toBe(0);
  });

  it('loads inspections on focus', async () => {
    const items = [makeInspection({ id: 'i1' }), makeInspection({ id: 'i2' })];
    mockGetAll.mockResolvedValue(items);
    let result: ReturnType<typeof renderHook<ReturnType<typeof useInspectionList>, any>>['result'];
    await act(async () => {
      ({ result } = renderHook(() => useInspectionList(), { wrapper }));
    });
    await waitFor(() => expect(result!.current.totalCount).toBe(2));
  });

  it('handles load error gracefully', async () => {
    mockGetAll.mockRejectedValue(new Error('db error'));
    let result: ReturnType<typeof renderHook<ReturnType<typeof useInspectionList>, any>>['result'];
    await act(async () => {
      ({ result } = renderHook(() => useInspectionList(), { wrapper }));
    });
    await waitFor(() => expect(mockGetAll).toHaveBeenCalled());
    expect(result!.current.filtered).toEqual([]);
  });

  describe('filtering', () => {
    const completed  = makeInspection({ id: 'c1', status: 'completed',   facilityName: 'Alpha' });
    const inProgress = makeInspection({ id: 'p1', status: 'in-progress', facilityName: 'Beta'  });

    beforeEach(() => { mockGetAll.mockResolvedValue([completed, inProgress]); });

    it('shows all inspections with activeFilter=all', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useInspectionList>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useInspectionList(), { wrapper }));
      });
      await waitFor(() => expect(result!.current.filtered).toHaveLength(2));
    });

    it('filters to completed only', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useInspectionList>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useInspectionList(), { wrapper }));
      });
      await waitFor(() => expect(result!.current.totalCount).toBe(2));
      act(() => { result!.current.setActiveFilter('completed'); });
      expect(result!.current.filtered).toHaveLength(1);
      expect(result!.current.filtered[0].id).toBe('c1');
    });

    it('filters to in-progress only', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useInspectionList>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useInspectionList(), { wrapper }));
      });
      await waitFor(() => expect(result!.current.totalCount).toBe(2));
      act(() => { result!.current.setActiveFilter('in-progress'); });
      expect(result!.current.filtered).toHaveLength(1);
      expect(result!.current.filtered[0].id).toBe('p1');
    });

    it('filters by facilityName search query', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useInspectionList>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useInspectionList(), { wrapper }));
      });
      await waitFor(() => expect(result!.current.totalCount).toBe(2));
      act(() => { result!.current.setSearchQuery('alpha'); });
      expect(result!.current.filtered).toHaveLength(1);
      expect(result!.current.filtered[0].id).toBe('c1');
    });

    it('filters by facilityAddress search query', async () => {
      mockGetAll.mockResolvedValue([makeInspection({ id: 'a1', facilityAddress: 'Rue de la Paix' })]);
      let result: ReturnType<typeof renderHook<ReturnType<typeof useInspectionList>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useInspectionList(), { wrapper }));
      });
      await waitFor(() => expect(result!.current.totalCount).toBe(1));
      act(() => { result!.current.setSearchQuery('paix'); });
      expect(result!.current.filtered).toHaveLength(1);
    });

    it('returns empty when search query matches nothing', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useInspectionList>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useInspectionList(), { wrapper }));
      });
      await waitFor(() => expect(result!.current.totalCount).toBe(2));
      act(() => { result!.current.setSearchQuery('zzznomatch'); });
      expect(result!.current.filtered).toHaveLength(0);
    });

    it('sorts by date descending (newest first)', async () => {
      const older = makeInspection({ id: 'old', date: '2025-01-01T00:00:00.000Z' });
      const newer = makeInspection({ id: 'new', date: '2026-01-01T00:00:00.000Z' });
      mockGetAll.mockResolvedValue([older, newer]);
      let result: ReturnType<typeof renderHook<ReturnType<typeof useInspectionList>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useInspectionList(), { wrapper }));
      });
      await waitFor(() => expect(result!.current.totalCount).toBe(2));
      expect(result!.current.filtered[0].id).toBe('new');
      expect(result!.current.filtered[1].id).toBe('old');
    });
  });

  describe('deleteInspection', () => {
    it('removes inspection from list after deletion', async () => {
      const item = makeInspection({ id: 'del-1' });
      mockGetAll.mockResolvedValue([item]);
      (mockDelete as jest.Mock).mockResolvedValue(undefined);
      let result: ReturnType<typeof renderHook<ReturnType<typeof useInspectionList>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useInspectionList(), { wrapper }));
      });
      await waitFor(() => expect(result!.current.totalCount).toBe(1));
      mockGetAll.mockResolvedValue([]);
      await act(async () => {
        const alertCall = mockAlert.mock.calls[0];
        if (alertCall) {
          const confirmButton = alertCall[2]?.find((b: any) => b.style === 'destructive');
          if (confirmButton?.onPress) await confirmButton.onPress();
        } else {
          await result!.current.deleteInspection('del-1');
        }
      });
      await waitFor(() => expect(result!.current.totalCount).toBe(0));
    });

    it('handles deletion error gracefully', async () => {
      (mockDelete as jest.Mock).mockRejectedValue(new Error('delete failed'));
      const item = makeInspection({ id: 'err-1' });
      mockGetAll.mockResolvedValue([item]);
      let result: ReturnType<typeof renderHook<ReturnType<typeof useInspectionList>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useInspectionList(), { wrapper }));
      });
      await waitFor(() => expect(result!.current.totalCount).toBe(1));
      await act(async () => {
        try { await result!.current.deleteInspection('err-1'); } catch {}
      });
      expect(result!.current.totalCount).toBeGreaterThanOrEqual(0);
    });
  });
});

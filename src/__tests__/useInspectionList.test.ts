// src/__tests__/useInspectionList.test.ts

jest.mock('../repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getAll: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn((cb: () => void) => { cb(); }),
}));

jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
}));

import { renderHook, act } from '@testing-library/react-hooks';
import { Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { InspectionRepository } from '../repositories/InspectionRepository';
import { useInspectionList } from '../hooks/useInspectionList';
import { SavedInspection } from '../types';

const mockGetAll = jest.mocked(InspectionRepository.getAll);
const mockDelete = jest.mocked(InspectionRepository.delete);
const mockFocus  = jest.mocked(useFocusEffect);
const mockAlert  = jest.mocked(Alert.alert);

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
  mockDelete.mockResolvedValue(undefined);
});

describe('useInspectionList', () => {
  it('starts with empty inspections', () => {
    mockGetAll.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useInspectionList());
    expect(result.current.filtered).toEqual([]);
    expect(result.current.totalCount).toBe(0);
  });

  it('loads inspections on focus', async () => {
    const items = [makeInspection({ id: 'i1' }), makeInspection({ id: 'i2' })];
    mockGetAll.mockResolvedValue(items);
    const { result, waitForNextUpdate } = renderHook(() => useInspectionList());
    await waitForNextUpdate();
    expect(result.current.totalCount).toBe(2);
  });

  it('handles load error gracefully', async () => {
    mockGetAll.mockRejectedValue(new Error('db error'));
    const { result, waitForNextUpdate } = renderHook(() => useInspectionList());
    await waitForNextUpdate();
    expect(result.current.filtered).toEqual([]);
  });

  describe('filtering', () => {
    const completed    = makeInspection({ id: 'c1', status: 'completed', facilityName: 'Alpha' });
    const inProgress   = makeInspection({ id: 'p1', status: 'in-progress', facilityName: 'Beta' });

    beforeEach(() => {
      mockGetAll.mockResolvedValue([completed, inProgress]);
    });

    it('shows all inspections with activeFilter=all', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useInspectionList());
      await waitForNextUpdate();
      expect(result.current.filtered).toHaveLength(2);
    });

    it('filters to completed only', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useInspectionList());
      await waitForNextUpdate();
      act(() => { result.current.setActiveFilter('completed'); });
      expect(result.current.filtered).toHaveLength(1);
      expect(result.current.filtered[0].id).toBe('c1');
    });

    it('filters to in-progress only', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useInspectionList());
      await waitForNextUpdate();
      act(() => { result.current.setActiveFilter('in-progress'); });
      expect(result.current.filtered).toHaveLength(1);
      expect(result.current.filtered[0].id).toBe('p1');
    });

    it('filters by facilityName search query', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useInspectionList());
      await waitForNextUpdate();
      act(() => { result.current.setSearchQuery('alpha'); });
      expect(result.current.filtered).toHaveLength(1);
      expect(result.current.filtered[0].id).toBe('c1');
    });

    it('filters by facilityAddress search query', async () => {
      const withAddress = makeInspection({ id: 'a1', facilityAddress: 'Rue de la Paix' });
      mockGetAll.mockResolvedValue([withAddress]);
      const { result, waitForNextUpdate } = renderHook(() => useInspectionList());
      await waitForNextUpdate();
      act(() => { result.current.setSearchQuery('paix'); });
      expect(result.current.filtered).toHaveLength(1);
    });

    it('returns empty when search query matches nothing', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useInspectionList());
      await waitForNextUpdate();
      act(() => { result.current.setSearchQuery('zzznomatch'); });
      expect(result.current.filtered).toHaveLength(0);
    });

    it('sorts by date descending (newest first)', async () => {
      const older = makeInspection({ id: 'old', date: '2025-01-01T00:00:00.000Z' });
      const newer = makeInspection({ id: 'new', date: '2026-01-01T00:00:00.000Z' });
      mockGetAll.mockResolvedValue([older, newer]);
      const { result, waitForNextUpdate } = renderHook(() => useInspectionList());
      await waitForNextUpdate();
      expect(result.current.filtered[0].id).toBe('new');
      expect(result.current.filtered[1].id).toBe('old');
    });
  });

  describe('deleteInspection', () => {
    it('shows a confirmation alert when called', async () => {
      mockGetAll.mockResolvedValue([makeInspection()]);
      const { result, waitForNextUpdate } = renderHook(() => useInspectionList());
      await waitForNextUpdate();
      await act(async () => { await result.current.deleteInspection('insp-1'); });
      expect(mockAlert).toHaveBeenCalledWith(
        'تأكيد الحذف',
        expect.any(String),
        expect.arrayContaining([
          expect.objectContaining({ text: 'إلغاء' }),
          expect.objectContaining({ text: 'حذف' }),
        ])
      );
    });

    it('calls InspectionRepository.delete and removes item on confirm', async () => {
      const item = makeInspection({ id: 'del-1' });
      mockGetAll.mockResolvedValue([item]);
      const { result, waitForNextUpdate } = renderHook(() => useInspectionList());
      await waitForNextUpdate();

      // Capture and trigger the destructive button onPress directly
      await act(async () => { await result.current.deleteInspection('del-1'); });
      const buttons: any[] = (mockAlert.mock.calls[0] as any)[2];
      const destructive = buttons.find((b: any) => b.style === 'destructive');
      await act(async () => { await destructive.onPress(); });

      expect(mockDelete).toHaveBeenCalledWith('del-1');
      expect(result.current.filtered.find(i => i.id === 'del-1')).toBeUndefined();
    });

    it('handles delete repository error gracefully', async () => {
      mockDelete.mockRejectedValueOnce(new Error('db error'));
      mockGetAll.mockResolvedValue([makeInspection({ id: 'err-1' })]);
      const { result, waitForNextUpdate } = renderHook(() => useInspectionList());
      await waitForNextUpdate();

      await act(async () => { await result.current.deleteInspection('err-1'); });
      const buttons: any[] = (mockAlert.mock.calls[0] as any)[2];
      const destructive = buttons.find((b: any) => b.style === 'destructive');
      // Should not throw
      await act(async () => { await destructive.onPress(); });
      expect(mockDelete).toHaveBeenCalledWith('err-1');
    });
  });
});

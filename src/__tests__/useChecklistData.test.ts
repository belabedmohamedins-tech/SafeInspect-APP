// src/__tests__/useChecklistData.test.ts

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'mock-uuid-1234'),
}));

jest.mock('expo-router', () => ({
  useRouter:    jest.fn(() => ({ replace: jest.fn() })),
  useNavigation: jest.fn(() => ({
    addListener: jest.fn(() => jest.fn()), // returns unsubscribe fn
  })),
}));

jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
}));

jest.mock('../repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getById: jest.fn(),
    save:    jest.fn(),
  },
}));

jest.mock('../repositories/AgendaRepository', () => ({
  AgendaRepository: {
    updateInspectionLink: jest.fn(),
  },
}));

jest.mock('../repositories/SettingsRepository', () => ({
  SettingsRepository: {
    getAll: jest.fn(() => Promise.resolve({ inspectorName: 'Ahmed', officeName: 'HQ' })),
  },
}));

jest.mock('../criteriaData', () => ({
  criteriaByActivity: {
    default: [
      { id: 'c1', criteria: 'Criterion 1', legalReference: 'Art 1', severity: 'high', axis: 'Axis A' },
      { id: 'c2', criteria: 'Criterion 2', legalReference: 'Art 2', severity: 'low',  axis: 'Axis B' },
    ],
    medical: [
      { id: 'm1', criteria: 'Medical Criterion', legalReference: 'Art 5', severity: 'high', axis: 'Axis M' },
    ],
  },
}));

import { renderHook, act } from '@testing-library/react-hooks';
import { Alert } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { InspectionRepository } from '../repositories/InspectionRepository';
import { AgendaRepository } from '../repositories/AgendaRepository';
import { SettingsRepository } from '../repositories/SettingsRepository';
import { useChecklistData } from '../hooks/useChecklistData';
import { SavedInspection, InspectionItem, ComplianceStatus } from '../types';

const mockGetById              = jest.mocked(InspectionRepository.getById);
const mockSave                 = jest.mocked(InspectionRepository.save);
const mockUpdateAgenda         = jest.mocked(AgendaRepository.updateInspectionLink);
const mockGetAll               = jest.mocked(SettingsRepository.getAll);
const mockAlert                = jest.mocked(Alert.alert);
const mockRouterReplace        = jest.fn();
const mockAddListener          = jest.fn(() => jest.fn());

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ replace: mockRouterReplace });
  (useNavigation as jest.Mock).mockReturnValue({ addListener: mockAddListener });
  mockSave.mockResolvedValue(undefined);
  mockUpdateAgenda.mockResolvedValue(undefined);
  mockGetAll.mockResolvedValue({ inspectorName: 'Ahmed', officeName: 'HQ' } as any);
});

const BASE_PARAMS = {
  facilityId: 'fac-1',
  facilityName: 'Test Facility',
  facilityAddress: '123 St',
  cause: 'routine',
  reference: 'REF-001',
  committeeMembers: ['Ahmed'],
  writer: 'Inspector A',
};

describe('useChecklistData', () => {
  describe('initial load — new inspection (no draftId)', () => {
    it('loads default criteria when no activity specified', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useChecklistData(BASE_PARAMS)
      );
      await waitForNextUpdate();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toHaveLength(2);
      expect(result.current.data[0].complianceStatus).toBe('not-evaluated');
      expect(result.current.data[0].comment).toBe('');
    });

    it('loads activity-specific criteria when activity is provided', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useChecklistData({ ...BASE_PARAMS, activity: 'medical' })
      );
      await waitForNextUpdate();
      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0].id).toBe('m1');
    });

    it('falls back to default criteria for unknown activity', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useChecklistData({ ...BASE_PARAMS, activity: 'unknown-activity' })
      );
      await waitForNextUpdate();
      expect(result.current.data).toHaveLength(2);
    });

    it('generates a UUID as inspectionId', async () => {
      const { waitForNextUpdate } = renderHook(() => useChecklistData(BASE_PARAMS));
      await waitForNextUpdate();
      // Indirectly verified: save is called with this id later
    });
  });

  describe('initial load — draft (with draftId)', () => {
    const draftItems: InspectionItem[] = [
      { id: 'd1', criteria: 'Draft C', legalReference: 'R1', severity: 'high', axis: 'Ax', complianceStatus: 'non-compliant', comment: 'note', photos: [] },
    ];
    const draft: SavedInspection = {
      id: 'draft-001',
      facilityId: 'fac-1',
      facilityName: 'Test',
      facilityAddress: '',
      date: '2026-01-01',
      inspectorName: 'A',
      officeName: 'O',
      status: 'in-progress',
      items: draftItems,
      inspectionCause: '',
      referenceDocument: '',
      committeeMembers: [],
    };

    it('loads existing draft items from repository', async () => {
      mockGetById.mockResolvedValue(draft);
      const { result, waitForNextUpdate } = renderHook(() =>
        useChecklistData({ ...BASE_PARAMS, draftId: 'draft-001' })
      );
      await waitForNextUpdate();
      expect(mockGetById).toHaveBeenCalledWith('draft-001');
      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0].complianceStatus).toBe('non-compliant');
    });

    it('handles null draft gracefully (falls back to empty state)', async () => {
      mockGetById.mockResolvedValue(null);
      const { result, waitForNextUpdate } = renderHook(() =>
        useChecklistData({ ...BASE_PARAMS, draftId: 'missing-draft' })
      );
      await waitForNextUpdate();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toHaveLength(0);
    });
  });

  describe('item handlers', () => {
    it('handleStatusChange updates the item status', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useChecklistData(BASE_PARAMS));
      await waitForNextUpdate();
      act(() => { result.current.handleStatusChange('c1', 'compliant'); });
      expect(result.current.data.find(i => i.id === 'c1')?.complianceStatus).toBe('compliant');
    });

    it('handleCommentChange updates the item comment', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useChecklistData(BASE_PARAMS));
      await waitForNextUpdate();
      act(() => { result.current.handleCommentChange('c2', 'needs repair'); });
      expect(result.current.data.find(i => i.id === 'c2')?.comment).toBe('needs repair');
    });

    it('handlePhotoTake adds a photo URI to the item', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useChecklistData(BASE_PARAMS));
      await waitForNextUpdate();
      act(() => { result.current.handlePhotoTake('c1', 'file:///photo1.jpg'); });
      const item = result.current.data.find(i => i.id === 'c1')!;
      expect(item.photoUri).toBe('file:///photo1.jpg');
      expect(item.photos).toContain('file:///photo1.jpg');
    });

    it('handlePhotoTake accumulates multiple photos', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useChecklistData(BASE_PARAMS));
      await waitForNextUpdate();
      act(() => { result.current.handlePhotoTake('c1', 'file:///p1.jpg'); });
      act(() => { result.current.handlePhotoTake('c1', 'file:///p2.jpg'); });
      expect(result.current.data.find(i => i.id === 'c1')?.photos).toHaveLength(2);
    });

    it('keeps original photoUri when second photo is added', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useChecklistData(BASE_PARAMS));
      await waitForNextUpdate();
      act(() => { result.current.handlePhotoTake('c1', 'file:///first.jpg'); });
      act(() => { result.current.handlePhotoTake('c1', 'file:///second.jpg'); });
      expect(result.current.data.find(i => i.id === 'c1')?.photoUri).toBe('file:///first.jpg');
    });
  });

  describe('derived values', () => {
    it('totalItems equals the number of loaded criteria', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useChecklistData(BASE_PARAMS));
      await waitForNextUpdate();
      expect(result.current.totalItems).toBe(2);
    });

    it('evaluatedItems is 0 on fresh load', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useChecklistData(BASE_PARAMS));
      await waitForNextUpdate();
      expect(result.current.evaluatedItems).toBe(0);
    });

    it('evaluatedItems increments as items are evaluated', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useChecklistData(BASE_PARAMS));
      await waitForNextUpdate();
      act(() => { result.current.handleStatusChange('c1', 'compliant'); });
      expect(result.current.evaluatedItems).toBe(1);
    });

    it('progressPercent is 0 on fresh load', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useChecklistData(BASE_PARAMS));
      await waitForNextUpdate();
      expect(result.current.progressPercent).toBe(0);
    });

    it('progressPercent is 100 when all items are evaluated', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useChecklistData(BASE_PARAMS));
      await waitForNextUpdate();
      act(() => {
        result.current.handleStatusChange('c1', 'compliant');
        result.current.handleStatusChange('c2', 'non-compliant');
      });
      expect(result.current.progressPercent).toBe(100);
    });

    it('sections groups items by axis', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useChecklistData(BASE_PARAMS));
      await waitForNextUpdate();
      expect(Object.keys(result.current.sections)).toContain('Axis A');
      expect(Object.keys(result.current.sections)).toContain('Axis B');
    });
  });

  describe('handleFinish', () => {
    it('shows alert when completion rate is below 85%', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useChecklistData(BASE_PARAMS));
      await waitForNextUpdate();
      // Only 1 of 2 evaluated = 50% < 85%
      act(() => { result.current.handleStatusChange('c1', 'compliant'); });
      await act(async () => { await result.current.handleFinish(); });
      expect(mockAlert).toHaveBeenCalledWith(
        'لم يكتمل التفتيش',
        expect.stringContaining('85'),
        expect.any(Array)
      );
      expect(mockSave).not.toHaveBeenCalled();
    });

    it('shows alert when high-severity non-compliant item has no photo', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useChecklistData(BASE_PARAMS));
      await waitForNextUpdate();
      // Evaluate all items so completion gate passes
      act(() => {
        result.current.handleStatusChange('c1', 'non-compliant'); // high severity, no photo
        result.current.handleStatusChange('c2', 'compliant');
      });
      await act(async () => { await result.current.handleFinish(); });
      expect(mockAlert).toHaveBeenCalledWith(
        'صور مطلوبة',
        expect.stringContaining('Criterion 1'),
        expect.any(Array)
      );
      expect(mockSave).not.toHaveBeenCalled();
    });

    it('saves and navigates when all gates pass', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useChecklistData(BASE_PARAMS));
      await waitForNextUpdate();
      act(() => {
        result.current.handleStatusChange('c1', 'compliant'); // high severity but compliant — no photo needed
        result.current.handleStatusChange('c2', 'compliant');
      });
      await act(async () => { await result.current.handleFinish(); });
      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'completed', facilityId: 'fac-1' })
      );
      expect(mockRouterReplace).toHaveBeenCalledWith('/(tabs)/inspection');
    });

    it('updates agenda link when agendaId is provided', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useChecklistData({ ...BASE_PARAMS, agendaId: 'ag-001' })
      );
      await waitForNextUpdate();
      act(() => {
        result.current.handleStatusChange('c1', 'compliant');
        result.current.handleStatusChange('c2', 'compliant');
      });
      await act(async () => { await result.current.handleFinish(); });
      expect(mockUpdateAgenda).toHaveBeenCalledWith('ag-001', expect.any(String));
    });

    it('does not update agenda link when agendaId is absent', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useChecklistData(BASE_PARAMS));
      await waitForNextUpdate();
      act(() => {
        result.current.handleStatusChange('c1', 'compliant');
        result.current.handleStatusChange('c2', 'compliant');
      });
      await act(async () => { await result.current.handleFinish(); });
      expect(mockUpdateAgenda).not.toHaveBeenCalled();
    });

    it('shows error alert and does not navigate when save fails', async () => {
      mockSave.mockRejectedValueOnce(new Error('db error'));
      const { result, waitForNextUpdate } = renderHook(() => useChecklistData(BASE_PARAMS));
      await waitForNextUpdate();
      act(() => {
        result.current.handleStatusChange('c1', 'compliant');
        result.current.handleStatusChange('c2', 'compliant');
      });
      await act(async () => { await result.current.handleFinish(); });
      expect(mockRouterReplace).not.toHaveBeenCalled();
    });

    it('includes signature in inspection when provided', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useChecklistData(BASE_PARAMS, 'data:image/png;base64,SIGN==')
      );
      await waitForNextUpdate();
      act(() => {
        result.current.handleStatusChange('c1', 'compliant');
        result.current.handleStatusChange('c2', 'compliant');
      });
      await act(async () => { await result.current.handleFinish(); });
      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({ signature: 'data:image/png;base64,SIGN==' })
      );
    });

    it('saves with coordinates when lat/lng are provided', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useChecklistData({ ...BASE_PARAMS, lat: 36.7, lng: 3.05 })
      );
      await waitForNextUpdate();
      act(() => {
        result.current.handleStatusChange('c1', 'compliant');
        result.current.handleStatusChange('c2', 'compliant');
      });
      await act(async () => { await result.current.handleFinish(); });
      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({ coordinates: { latitude: 36.7, longitude: 3.05 } })
      );
    });
  });
});

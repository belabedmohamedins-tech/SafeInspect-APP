// src/__tests__/useChecklistData.test.ts

jest.mock('expo-crypto', () => ({ randomUUID: jest.fn(() => 'mock-uuid-1234') }));

jest.mock('expo-router', () => ({
  useRouter:     jest.fn(() => ({ replace: jest.fn() })),
  useNavigation: jest.fn(() => ({ addListener: jest.fn(() => jest.fn()) })),
}));

jest.mock('react-native', () => ({ Alert: { alert: jest.fn() } }));

jest.mock('../repositories/InspectionRepository', () => ({
  InspectionRepository: { getById: jest.fn(), save: jest.fn() },
}));

jest.mock('../repositories/AgendaRepository', () => ({
  AgendaRepository: { updateInspectionLink: jest.fn() },
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

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { InspectionRepository } from '../repositories/InspectionRepository';
import { AgendaRepository } from '../repositories/AgendaRepository';
import { useChecklistData } from '../hooks/useChecklistData';
import { SavedInspection, InspectionItem } from '../types';

const mockGetById      = InspectionRepository.getById as jest.MockedFunction<any>;
const mockSave         = InspectionRepository.save    as jest.MockedFunction<any>;
const mockUpdateAgenda = AgendaRepository.updateInspectionLink as jest.MockedFunction<any>;
const mockAlert        = Alert.alert as jest.MockedFunction<typeof Alert.alert>;
const mockRouterReplace = jest.fn();
const mockAddListener   = jest.fn(() => jest.fn());

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ replace: mockRouterReplace });
  (useNavigation as jest.Mock).mockReturnValue({ addListener: mockAddListener });
  mockSave.mockResolvedValue(undefined);
  mockUpdateAgenda.mockResolvedValue(undefined);
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
  describe('initial load \u2014 new inspection (no draftId)', () => {
    it('loads default criteria when no activity specified', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useChecklistData>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useChecklistData(BASE_PARAMS), { wrapper }));
      });
      await waitFor(() => expect(result!.current.isLoading).toBe(false));
      expect(result!.current.data).toHaveLength(2);
      expect(result!.current.data[0].complianceStatus).toBe('not-evaluated');
    });

    it('loads activity-specific criteria when activity is provided', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useChecklistData>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useChecklistData({ ...BASE_PARAMS, activity: 'medical' }), { wrapper }));
      });
      await waitFor(() => expect(result!.current.isLoading).toBe(false));
      expect(result!.current.data).toHaveLength(1);
      expect(result!.current.data[0].id).toBe('m1');
    });

    it('falls back to default criteria for unknown activity', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useChecklistData>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useChecklistData({ ...BASE_PARAMS, activity: 'unknown-x' }), { wrapper }));
      });
      await waitFor(() => expect(result!.current.isLoading).toBe(false));
      expect(result!.current.data).toHaveLength(2);
    });
  });

  describe('initial load \u2014 draft (with draftId)', () => {
    const draftItems: InspectionItem[] = [
      { id: 'd1', criteria: 'Draft C', legalReference: 'R1', severity: 'high', axis: 'Ax', complianceStatus: 'non-compliant', comment: 'note', photos: [] },
    ];
    const draft: SavedInspection = {
      id: 'draft-001', facilityId: 'fac-1', facilityName: 'Test', facilityAddress: '',
      date: '2026-01-01', inspectorName: 'A', officeName: 'O', status: 'in-progress',
      items: draftItems, inspectionCause: '', referenceDocument: '', committeeMembers: [],
    };

    it('loads existing draft items from repository', async () => {
      mockGetById.mockResolvedValue(draft);
      let result: ReturnType<typeof renderHook<ReturnType<typeof useChecklistData>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useChecklistData({ ...BASE_PARAMS, draftId: 'draft-001' }), { wrapper }));
      });
      await waitFor(() => expect(result!.current.isLoading).toBe(false));
      expect(mockGetById).toHaveBeenCalledWith('draft-001');
      expect(result!.current.data).toHaveLength(1);
      expect(result!.current.data[0].complianceStatus).toBe('non-compliant');
    });

    it('handles null draft gracefully', async () => {
      mockGetById.mockResolvedValue(null);
      let result: ReturnType<typeof renderHook<ReturnType<typeof useChecklistData>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useChecklistData({ ...BASE_PARAMS, draftId: 'missing' }), { wrapper }));
      });
      await waitFor(() => expect(result!.current.isLoading).toBe(false));
      expect(result!.current.data).toHaveLength(0);
    });
  });

  describe('item handlers', () => {
    it('handleStatusChange updates the item status', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useChecklistData>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useChecklistData(BASE_PARAMS), { wrapper }));
      });
      await waitFor(() => expect(result!.current.isLoading).toBe(false));
      act(() => { result!.current.handleStatusChange('c1', 'compliant'); });
      expect(result!.current.data.find(i => i.id === 'c1')?.complianceStatus).toBe('compliant');
    });

    it('handleCommentChange updates the item comment', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useChecklistData>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useChecklistData(BASE_PARAMS), { wrapper }));
      });
      await waitFor(() => expect(result!.current.isLoading).toBe(false));
      act(() => { result!.current.handleCommentChange('c2', 'needs repair'); });
      expect(result!.current.data.find(i => i.id === 'c2')?.comment).toBe('needs repair');
    });

    it('handlePhotoTake adds a photo URI to the item', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useChecklistData>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useChecklistData(BASE_PARAMS), { wrapper }));
      });
      await waitFor(() => expect(result!.current.isLoading).toBe(false));
      act(() => { result!.current.handlePhotoTake('c1', 'file:///photo1.jpg'); });
      const item = result!.current.data.find(i => i.id === 'c1')!;
      expect(item.photoUri).toBe('file:///photo1.jpg');
      expect(item.photos).toContain('file:///photo1.jpg');
    });

    it('handlePhotoTake accumulates multiple photos', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useChecklistData>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useChecklistData(BASE_PARAMS), { wrapper }));
      });
      await waitFor(() => expect(result!.current.isLoading).toBe(false));
      act(() => { result!.current.handlePhotoTake('c1', 'file:///p1.jpg'); });
      act(() => { result!.current.handlePhotoTake('c1', 'file:///p2.jpg'); });
      expect(result!.current.data.find(i => i.id === 'c1')?.photos).toHaveLength(2);
    });

    it('keeps original photoUri when second photo is added', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useChecklistData>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useChecklistData(BASE_PARAMS), { wrapper }));
      });
      await waitFor(() => expect(result!.current.isLoading).toBe(false));
      act(() => { result!.current.handlePhotoTake('c1', 'file:///first.jpg'); });
      act(() => { result!.current.handlePhotoTake('c1', 'file:///second.jpg'); });
      expect(result!.current.data.find(i => i.id === 'c1')?.photoUri).toBe('file:///first.jpg');
    });
  });

  describe('derived values', () => {
    it('totalItems equals the number of loaded criteria', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useChecklistData>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useChecklistData(BASE_PARAMS), { wrapper }));
      });
      await waitFor(() => expect(result!.current.isLoading).toBe(false));
      expect(result!.current.totalItems).toBe(2);
    });

    it('evaluatedItems is 0 on fresh load', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useChecklistData>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useChecklistData(BASE_PARAMS), { wrapper }));
      });
      await waitFor(() => expect(result!.current.isLoading).toBe(false));
      expect(result!.current.evaluatedItems).toBe(0);
    });

    it('evaluatedItems increments as items are evaluated', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useChecklistData>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useChecklistData(BASE_PARAMS), { wrapper }));
      });
      await waitFor(() => expect(result!.current.isLoading).toBe(false));
      act(() => { result!.current.handleStatusChange('c1', 'compliant'); });
      expect(result!.current.evaluatedItems).toBe(1);
    });

    it('progressPercent is 0 on fresh load', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useChecklistData>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useChecklistData(BASE_PARAMS), { wrapper }));
      });
      await waitFor(() => expect(result!.current.isLoading).toBe(false));
      expect(result!.current.progressPercent).toBe(0);
    });

    it('progressPercent is 100 when all items are evaluated', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useChecklistData>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useChecklistData(BASE_PARAMS), { wrapper }));
      });
      await waitFor(() => expect(result!.current.isLoading).toBe(false));
      act(() => {
        result!.current.handleStatusChange('c1', 'compliant');
        result!.current.handleStatusChange('c2', 'non-compliant');
      });
      expect(result!.current.progressPercent).toBe(100);
    });

    it('sections groups items by axis', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useChecklistData>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useChecklistData(BASE_PARAMS), { wrapper }));
      });
      await waitFor(() => expect(result!.current.isLoading).toBe(false));
      expect(Object.keys(result!.current.sections)).toContain('Axis A');
      expect(Object.keys(result!.current.sections)).toContain('Axis B');
    });
  });

  describe('handleFinish', () => {
    it('shows alert when completion rate is below 85%', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useChecklistData>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useChecklistData(BASE_PARAMS), { wrapper }));
      });
      await waitFor(() => expect(result!.current.isLoading).toBe(false));
      act(() => { result!.current.handleStatusChange('c1', 'compliant'); }); // 1/2 = 50%
      await act(async () => { await result!.current.handleFinish(); });
      expect(mockAlert).toHaveBeenCalledWith('\u0644\u0645 \u064a\u0643\u062a\u0645\u0644 \u0627\u0644\u062a\u0641\u062a\u064a\u0634', expect.stringContaining('85'), expect.any(Array));
      expect(mockSave).not.toHaveBeenCalled();
    });

    it('shows alert when high-severity non-compliant item has no photo', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useChecklistData>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useChecklistData(BASE_PARAMS), { wrapper }));
      });
      await waitFor(() => expect(result!.current.isLoading).toBe(false));
      act(() => {
        result!.current.handleStatusChange('c1', 'non-compliant'); // high severity, no photo
        result!.current.handleStatusChange('c2', 'compliant');
      });
      await act(async () => { await result!.current.handleFinish(); });
      expect(mockAlert).toHaveBeenCalledWith('\u0635\u0648\u0631 \u0645\u0637\u0644\u0648\u0628\u0629', expect.stringContaining('Criterion 1'), expect.any(Array));
      expect(mockSave).not.toHaveBeenCalled();
    });

    it('saves and navigates when all gates pass', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useChecklistData>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useChecklistData(BASE_PARAMS), { wrapper }));
      });
      await waitFor(() => expect(result!.current.isLoading).toBe(false));
      act(() => {
        result!.current.handleStatusChange('c1', 'compliant');
        result!.current.handleStatusChange('c2', 'compliant');
      });
      await act(async () => { await result!.current.handleFinish(); });
      expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ status: 'completed', facilityId: 'fac-1' }));
      expect(mockRouterReplace).toHaveBeenCalledWith('/(tabs)/inspection');
    });

    it('updates agenda link when agendaId is provided', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useChecklistData>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useChecklistData({ ...BASE_PARAMS, agendaId: 'ag-001' }), { wrapper }));
      });
      await waitFor(() => expect(result!.current.isLoading).toBe(false));
      act(() => {
        result!.current.handleStatusChange('c1', 'compliant');
        result!.current.handleStatusChange('c2', 'compliant');
      });
      await act(async () => { await result!.current.handleFinish(); });
      expect(mockUpdateAgenda).toHaveBeenCalledWith('ag-001', expect.any(String));
    });

    it('does not update agenda link when agendaId is absent', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useChecklistData>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useChecklistData(BASE_PARAMS), { wrapper }));
      });
      await waitFor(() => expect(result!.current.isLoading).toBe(false));
      act(() => {
        result!.current.handleStatusChange('c1', 'compliant');
        result!.current.handleStatusChange('c2', 'compliant');
      });
      await act(async () => { await result!.current.handleFinish(); });
      expect(mockUpdateAgenda).not.toHaveBeenCalled();
    });

    it('shows error alert and does not navigate when save fails', async () => {
      mockSave.mockRejectedValueOnce(new Error('db error'));
      let result: ReturnType<typeof renderHook<ReturnType<typeof useChecklistData>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useChecklistData(BASE_PARAMS), { wrapper }));
      });
      await waitFor(() => expect(result!.current.isLoading).toBe(false));
      act(() => {
        result!.current.handleStatusChange('c1', 'compliant');
        result!.current.handleStatusChange('c2', 'compliant');
      });
      await act(async () => { await result!.current.handleFinish(); });
      expect(mockRouterReplace).not.toHaveBeenCalled();
    });

    it('includes signature in inspection when provided', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useChecklistData>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useChecklistData(BASE_PARAMS, 'data:image/png;base64,SIGN=='), { wrapper }));
      });
      await waitFor(() => expect(result!.current.isLoading).toBe(false));
      act(() => {
        result!.current.handleStatusChange('c1', 'compliant');
        result!.current.handleStatusChange('c2', 'compliant');
      });
      await act(async () => { await result!.current.handleFinish(); });
      expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ signature: 'data:image/png;base64,SIGN==' }));
    });

    it('saves with coordinates when lat/lng are provided', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useChecklistData>, any>>['result'];
      await act(async () => {
        ({ result } = renderHook(() => useChecklistData({ ...BASE_PARAMS, lat: 36.7, lng: 3.05 }), { wrapper }));
      });
      await waitFor(() => expect(result!.current.isLoading).toBe(false));
      act(() => {
        result!.current.handleStatusChange('c1', 'compliant');
        result!.current.handleStatusChange('c2', 'compliant');
      });
      await act(async () => { await result!.current.handleFinish(); });
      expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ coordinates: { latitude: 36.7, longitude: 3.05 } }));
    });
  });
});

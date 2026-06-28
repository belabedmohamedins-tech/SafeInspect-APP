// src/__tests__/useChecklistData.test.ts
//
// STRATEGY: renderHook.
// useChecklistData uses useEffect (not useFocusEffect), useNavigation,
// useRouter, Alert, expo-crypto. All are mocked below or globally.
//
// expo-router (useNavigation, useRouter) — mocked globally in jest.setup.ts.
// Alert — mocked globally in jest.setup.ts via react-native stub.
// expo-crypto — mocked at Layer 4 below.
// criteriaData — mocked at Layer 4 to control item shapes.
// Repositories — mocked at Layer 4.
//
// IMPORTANT — @testing-library/react-native v14 renderHook() is ASYNC.
// Every renderHook() call MUST be awaited, otherwise { result } is
// destructured from a Promise and result.current is always undefined.
//
// wrapper: named function component returning React.createElement(
//   React.Fragment, null, children).

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'test-uuid-1234'),
}));

jest.mock('../criteriaData', () => ({
  criteriaByActivity: {
    default: [
      { id: 'c1', criteria: 'Check A', legalReference: 'R1', severity: 'low',  axis: 'Axis 1' },
      { id: 'c2', criteria: 'Check B', legalReference: 'R2', severity: 'high', axis: 'Axis 1' },
      { id: 'c3', criteria: 'Check C', legalReference: 'R3', severity: 'low',  axis: 'Axis 2' },
    ],
    food: [
      { id: 'f1', criteria: 'Food Check', legalReference: 'FR1', severity: 'low', axis: 'Axis F' },
    ],
  },
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
    getAll: jest.fn(),
  },
}));

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useChecklistData } from '../hooks/useChecklistData';
import { InspectionRepository } from '../repositories/InspectionRepository';
import { AgendaRepository } from '../repositories/AgendaRepository';
import { SettingsRepository } from '../repositories/SettingsRepository';
import { InspectionItem } from '../types';

const mockGetById              = InspectionRepository.getById              as jest.MockedFunction<any>;
const mockSave                 = InspectionRepository.save                 as jest.MockedFunction<any>;
const mockUpdateInspectionLink = AgendaRepository.updateInspectionLink     as jest.MockedFunction<any>;
const mockGetAll               = SettingsRepository.getAll                 as jest.MockedFunction<any>;

function Wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}

const BASE_PARAMS = {
  facilityId:       'fac-1',
  facilityName:     'Test Facility',
  facilityAddress:  '1 Test St',
  cause:            'Routine',
  reference:        'REF-001',
  committeeMembers: [],
  writer:           'Inspector A',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetById.mockResolvedValue(null);
  mockSave.mockResolvedValue(undefined);
  mockUpdateInspectionLink.mockResolvedValue(undefined);
  mockGetAll.mockResolvedValue({ officeName: 'HQ', inspectorName: 'Inspector A' });
});

// ─── Load ───────────────────────────────────────────────────────────────────────────
describe('useChecklistData — load from scratch', () => {
  it('loads default criteria when no draftId and no activity', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.totalItems).toBe(3);
    expect(result.current.data.every(i => i.complianceStatus === 'not-evaluated')).toBe(true);
  });

  it('loads activity-specific criteria when activity is provided', async () => {
    const { result } = await renderHook(
      () => useChecklistData({ ...BASE_PARAMS, activity: 'food' }),
      { wrapper: Wrapper }
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.totalItems).toBe(1);
    expect(result.current.data[0].id).toBe('f1');
  });

  it('sets a new UUID as inspectionId', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    mockGetAll.mockResolvedValue({});
    await act(async () => {
      result.current.data.forEach(item => {
        result.current.handleStatusChange(item.id, 'compliant');
      });
    });
    expect(require('expo-crypto').randomUUID).toHaveBeenCalled();
  });
});

describe('useChecklistData — load from draft', () => {
  it('loads existing draft items when draftId is provided', async () => {
    const draftItems: InspectionItem[] = [
      { id: 'd1', criteria: 'Draft Check', legalReference: 'DR1', severity: 'low', axis: 'A', complianceStatus: 'compliant', comment: 'ok', photos: [] },
    ];
    mockGetById.mockResolvedValue({
      id: 'draft-id-1',
      items: draftItems,
      facilityId: 'fac-1', facilityName: 'F', facilityAddress: 'A',
      date: new Date().toISOString(), inspectorName: 'X', officeName: 'O',
      status: 'in-progress', inspectionCause: '', referenceDocument: '', committeeMembers: [],
    });
    const { result } = await renderHook(
      () => useChecklistData({ ...BASE_PARAMS, draftId: 'draft-id-1' }),
      { wrapper: Wrapper }
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.totalItems).toBe(1);
    expect(result.current.data[0].id).toBe('d1');
    expect(mockGetById).toHaveBeenCalledWith('draft-id-1');
  });
});

// ─── Item handlers ────────────────────────────────────────────────────────────────
describe('useChecklistData — handleStatusChange', () => {
  it('updates complianceStatus for the target item', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.handleStatusChange('c1', 'compliant'));
    expect(result.current.data.find(i => i.id === 'c1')?.complianceStatus).toBe('compliant');
    expect(result.current.data.find(i => i.id === 'c2')?.complianceStatus).toBe('not-evaluated');
  });

  it('does not mutate other items', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.handleStatusChange('c1', 'non-compliant'));
    const others = result.current.data.filter(i => i.id !== 'c1');
    expect(others.every(i => i.complianceStatus === 'not-evaluated')).toBe(true);
  });
});

describe('useChecklistData — handleCommentChange', () => {
  it('updates comment for the target item', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.handleCommentChange('c2', 'needs attention'));
    expect(result.current.data.find(i => i.id === 'c2')?.comment).toBe('needs attention');
  });
});

describe('useChecklistData — handlePhotoTake', () => {
  it('adds photo uri to the target item photos array', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.handlePhotoTake('c1', 'file:///photo1.jpg'));
    const item = result.current.data.find(i => i.id === 'c1')!;
    expect(item.photos).toContain('file:///photo1.jpg');
    expect(item.photoUri).toBe('file:///photo1.jpg');
  });

  it('appends additional photos without overwriting photoUri', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.handlePhotoTake('c1', 'file:///photo1.jpg'));
    act(() => result.current.handlePhotoTake('c1', 'file:///photo2.jpg'));
    const item = result.current.data.find(i => i.id === 'c1')!;
    expect(item.photos).toHaveLength(2);
    expect(item.photoUri).toBe('file:///photo1.jpg');
  });
});

// ─── handleFinish — validation gates ───────────────────────────────────────────────
describe('useChecklistData — handleFinish Gate 1 (<85% evaluated)', () => {
  it('shows Alert and does not save when completion < 85%', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.handleStatusChange('c1', 'compliant'));
    await act(async () => { await result.current.handleFinish(); });
    expect(Alert.alert).toHaveBeenCalledWith(
      'لم يكتمل التفتيش',
      expect.stringContaining('85'),
      expect.any(Array)
    );
    expect(mockSave).not.toHaveBeenCalled();
  });
});

describe('useChecklistData — handleFinish Gate 2 (high-severity missing photo)', () => {
  it('shows Alert and does not save when high-severity item has no photo', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => {
      result.current.handleStatusChange('c1', 'compliant');
      result.current.handleStatusChange('c2', 'non-compliant');
      result.current.handleStatusChange('c3', 'compliant');
    });
    await act(async () => { await result.current.handleFinish(); });
    expect(Alert.alert).toHaveBeenCalledWith(
      'صور مطلوبة',
      expect.any(String),
      expect.any(Array)
    );
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('passes Gate 2 when high-severity non-compliant item has a photo', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => {
      result.current.handleStatusChange('c1', 'compliant');
      result.current.handleStatusChange('c2', 'non-compliant');
      result.current.handleStatusChange('c3', 'compliant');
      result.current.handlePhotoTake('c2', 'file:///evidence.jpg');
    });
    await act(async () => { await result.current.handleFinish(); });
    expect(mockSave).toHaveBeenCalledTimes(1);
  });
});

// ─── handleFinish success ─────────────────────────────────────────────────────────────
function evaluateAll(result: any) {
  result.current.data.forEach((item: any) => {
    result.current.handleStatusChange(item.id, 'compliant');
  });
}

describe('useChecklistData — handleFinish success', () => {
  it('calls InspectionRepository.save with status "completed"', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => evaluateAll(result));
    await act(async () => { await result.current.handleFinish(); });
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'completed' })
    );
  });

  it('calls router.replace after successful save', async () => {
    const mockReplace = jest.fn();
    const { useRouter } = require('expo-router');
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace, push: jest.fn(), back: jest.fn() });
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => evaluateAll(result));
    await act(async () => { await result.current.handleFinish(); });
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/inspection');
  });

  it('calls AgendaRepository.updateInspectionLink when agendaId is set', async () => {
    const { result } = await renderHook(
      () => useChecklistData({ ...BASE_PARAMS, agendaId: 'agenda-1' }),
      { wrapper: Wrapper }
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => evaluateAll(result));
    await act(async () => { await result.current.handleFinish(); });
    expect(mockUpdateInspectionLink).toHaveBeenCalledWith('agenda-1', expect.any(String));
  });

  it('does NOT call AgendaRepository when no agendaId', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => evaluateAll(result));
    await act(async () => { await result.current.handleFinish(); });
    expect(mockUpdateInspectionLink).not.toHaveBeenCalled();
  });
});

// ─── Derived values ─────────────────────────────────────────────────────────────────────
describe('useChecklistData — derived values', () => {
  it('evaluatedItems updates as items are marked', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.evaluatedItems).toBe(0);
    act(() => result.current.handleStatusChange('c1', 'compliant'));
    expect(result.current.evaluatedItems).toBe(1);
  });

  it('progressPercent is 0 initially and increases as items are evaluated', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.progressPercent).toBe(0);
    act(() => {
      result.current.handleStatusChange('c1', 'compliant');
      result.current.handleStatusChange('c2', 'compliant');
    });
    expect(result.current.progressPercent).toBeCloseTo(66.67, 0);
  });

  it('sections groups items by axis', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.sections).toHaveLength(2);
  });
});

// ─── saveInspection error path ──────────────────────────────────────────────────────────
describe('useChecklistData — saveInspection error path', () => {
  it('calls Alert when save throws', async () => {
    mockSave.mockRejectedValue(new Error('disk full'));
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => {
      result.current.handleStatusChange('c1', 'compliant');
      result.current.handleStatusChange('c2', 'compliant');
      result.current.handleStatusChange('c3', 'compliant');
    });
    await act(async () => { await result.current.handleFinish(); });
    expect(Alert.alert).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('disk full'),
      expect.any(Array)
    );
  });
});

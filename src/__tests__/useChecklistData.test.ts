// src/__tests__/useChecklistData.test.ts
//
// ARCHITECTURE:
//   useChecklistData uses useEffect (not useFocusEffect) to load data.
//   useEffect fires synchronously inside renderHook in the RTLRN v14
//   test environment, but the async load() inside it settles as a
//   microtask. We use waitFor(() => isLoading === false) to wait.
//
// IMPORTANT — RTLRN v14 renderHook() is async → always await it.
//
// IMPORTANT — ALL act() calls that wrap state setters must be:
//   await act(async () => { setter(...) })
//   Plain synchronous act(() => setter()) does not guarantee the React
//   update is committed before the next assertion in RTLRN v14.
//
// MOCK SCOPING RULE:
//   Only the outer beforeEach calls jest.clearAllMocks(). No nested
//   beforeEach block should call clearAllMocks/resetAllMocks — doing so
//   wipes the useNavigation/useRouter stubs from jest.setup.ts and causes
//   renderHook to throw, making result.current null for the entire suite.

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
const mockSettingsGetAll       = SettingsRepository.getAll                 as jest.MockedFunction<any>;

function Wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}

const BASE_PARAMS = {
  facilityId:       'fac-1',
  facilityName:     'Test Facility',
  facilityAddress:  '1 Test St',
  cause:            'Routine',
  reference:        'REF-001',
  committeeMembers: [] as string[],
  writer:           'Inspector A',
};

// Outer beforeEach — resets ALL mocks once before every test.
beforeEach(() => {
  jest.clearAllMocks();
  mockGetById.mockResolvedValue(null);
  mockSave.mockResolvedValue(undefined);
  mockUpdateInspectionLink.mockResolvedValue(undefined);
  mockSettingsGetAll.mockResolvedValue({ officeName: 'HQ', inspectorName: 'Inspector A' });
});

// Helper — wait for loading to finish
async function waitLoaded(result: any) {
  await waitFor(() => expect(result.current.isLoading).toBe(false));
}

// ─── Load from scratch ─────────────────────────────────────────────────────
describe('useChecklistData — load from scratch', () => {
  it('loads default criteria when no draftId and no activity', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    expect(result.current.totalItems).toBe(3);
    expect(result.current.data.every((i: any) => i.complianceStatus === 'not-evaluated')).toBe(true);
  });

  it('loads activity-specific criteria when activity is provided', async () => {
    const { result } = await renderHook(
      () => useChecklistData({ ...BASE_PARAMS, activity: 'food' }),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.data[0].id).toBe('f1');
  });

  it('generates a UUID as inspectionId on fresh load', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    expect(require('expo-crypto').randomUUID).toHaveBeenCalled();
  });
});

// ─── Load from draft ───────────────────────────────────────────────────────
describe('useChecklistData — load from draft', () => {
  it('loads existing draft items when draftId is provided', async () => {
    const draftItems: InspectionItem[] = [
      {
        id: 'd1', criteria: 'Draft Check', legalReference: 'DR1',
        severity: 'low', axis: 'A', complianceStatus: 'compliant',
        comment: 'ok', photos: [],
      },
    ];
    mockGetById.mockResolvedValue({
      id: 'draft-id-1',
      items: draftItems,
      facilityId: 'fac-1', facilityName: 'F', facilityAddress: 'A',
      date: new Date().toISOString(), inspectorName: 'X', officeName: 'O',
      status: 'in-progress', inspectionCause: '', referenceDocument: '',
      committeeMembers: [],
    });
    const { result } = await renderHook(
      () => useChecklistData({ ...BASE_PARAMS, draftId: 'draft-id-1' }),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.data[0].id).toBe('d1');
    expect(mockGetById).toHaveBeenCalledWith('draft-id-1');
  });
});

// ─── handleStatusChange ────────────────────────────────────────────────────
describe('useChecklistData — handleStatusChange', () => {
  it('updates complianceStatus for the target item', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await act(async () => { result.current.handleStatusChange('c1', 'compliant'); });
    expect(result.current.data.find((i: any) => i.id === 'c1')?.complianceStatus).toBe('compliant');
    expect(result.current.data.find((i: any) => i.id === 'c2')?.complianceStatus).toBe('not-evaluated');
  });

  it('does not mutate other items', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await act(async () => { result.current.handleStatusChange('c1', 'non-compliant'); });
    const others = result.current.data.filter((i: any) => i.id !== 'c1');
    expect(others.every((i: any) => i.complianceStatus === 'not-evaluated')).toBe(true);
  });
});

// ─── handleCommentChange ───────────────────────────────────────────────────
describe('useChecklistData — handleCommentChange', () => {
  it('updates comment for the target item', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await act(async () => { result.current.handleCommentChange('c2', 'needs attention'); });
    expect(result.current.data.find((i: any) => i.id === 'c2')?.comment).toBe('needs attention');
  });
});

// ─── handlePhotoTake ───────────────────────────────────────────────────────
describe('useChecklistData — handlePhotoTake', () => {
  it('adds photo uri to the target item photos array', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await act(async () => { result.current.handlePhotoTake('c1', 'file:///photo1.jpg'); });
    const item = result.current.data.find((i: any) => i.id === 'c1')!;
    expect(item.photos).toContain('file:///photo1.jpg');
    expect(item.photoUri).toBe('file:///photo1.jpg');
  });

  it('appends additional photos without overwriting first photoUri', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await act(async () => { result.current.handlePhotoTake('c1', 'file:///photo1.jpg'); });
    await act(async () => { result.current.handlePhotoTake('c1', 'file:///photo2.jpg'); });
    const item = result.current.data.find((i: any) => i.id === 'c1')!;
    expect(item.photos).toHaveLength(2);
    expect(item.photoUri).toBe('file:///photo1.jpg');
  });
});

// ─── handleFinish — Gate 1: 85% completion ─────────────────────────────────
describe('useChecklistData — handleFinish Gate 1 (<85% evaluated)', () => {
  it('shows Alert and does not save when completion < 85%', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    // Only 1 of 3 items evaluated = 33% < 85%
    await act(async () => { result.current.handleStatusChange('c1', 'compliant'); });
    await act(async () => { await result.current.handleFinish(); });
    expect(Alert.alert).toHaveBeenCalledWith(
      '\u0644\u0645 \u064a\u0643\u062a\u0645\u0644 \u0627\u0644\u062a\u0641\u062a\u064a\u0634',
      expect.stringContaining('85'),
      expect.any(Array)
    );
    expect(mockSave).not.toHaveBeenCalled();
  });
});

// ─── handleFinish — Gate 2: high-severity photo ────────────────────────────
describe('useChecklistData — handleFinish Gate 2 (high-severity missing photo)', () => {
  it('shows Alert and does not save when high-severity non-compliant item has no photo', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    // All 3 items evaluated (100% ≥ 85%), but c2 is high-severity non-compliant with no photo
    await act(async () => {
      result.current.handleStatusChange('c1', 'compliant');
      result.current.handleStatusChange('c2', 'non-compliant');
      result.current.handleStatusChange('c3', 'compliant');
    });
    await act(async () => { await result.current.handleFinish(); });
    expect(Alert.alert).toHaveBeenCalledWith(
      '\u0635\u0648\u0631 \u0645\u0637\u0644\u0648\u0628\u0629',
      expect.any(String),
      expect.any(Array)
    );
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('passes Gate 2 and saves when high-severity non-compliant item has a photo', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await act(async () => {
      result.current.handleStatusChange('c1', 'compliant');
      result.current.handleStatusChange('c2', 'non-compliant');
      result.current.handleStatusChange('c3', 'compliant');
      result.current.handlePhotoTake('c2', 'file:///evidence.jpg');
    });
    await act(async () => { await result.current.handleFinish(); });
    expect(mockSave).toHaveBeenCalledTimes(1);
  });
});

// ─── handleFinish — success path ───────────────────────────────────────────
async function evaluateAll(result: any) {
  await act(async () => {
    result.current.data.forEach((item: any) => {
      result.current.handleStatusChange(item.id, 'compliant');
    });
  });
}

describe('useChecklistData — handleFinish success', () => {
  it('calls InspectionRepository.save with status "completed"', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await evaluateAll(result);
    await act(async () => { await result.current.handleFinish(); });
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'completed' })
    );
  });

  it('calls router.replace after successful save', async () => {
    const mockReplace = jest.fn();
    const { useRouter } = require('expo-router');
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace, push: jest.fn(), back: jest.fn(),
    });
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await evaluateAll(result);
    await act(async () => { await result.current.handleFinish(); });
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/inspection');
  });

  it('calls AgendaRepository.updateInspectionLink when agendaId is set', async () => {
    const { result } = await renderHook(
      () => useChecklistData({ ...BASE_PARAMS, agendaId: 'agenda-1' }),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await evaluateAll(result);
    await act(async () => { await result.current.handleFinish(); });
    expect(mockUpdateInspectionLink).toHaveBeenCalledWith('agenda-1', expect.any(String));
  });

  it('does NOT call AgendaRepository when no agendaId', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await evaluateAll(result);
    await act(async () => { await result.current.handleFinish(); });
    expect(mockUpdateInspectionLink).not.toHaveBeenCalled();
  });
});

// ─── Derived values ────────────────────────────────────────────────────────
describe('useChecklistData — derived values', () => {
  it('evaluatedItems updates as items are marked', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    expect(result.current.evaluatedItems).toBe(0);
    await act(async () => { result.current.handleStatusChange('c1', 'compliant'); });
    expect(result.current.evaluatedItems).toBe(1);
  });

  it('progressPercent is 0 initially and increases as items are evaluated', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    expect(result.current.progressPercent).toBe(0);
    await act(async () => {
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
    await waitLoaded(result);
    expect(result.current.sections).toHaveLength(2);
  });
});

// ─── saveInspection error path ─────────────────────────────────────────────
// NOTE: the hook catches save errors and calls:
//   Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ')
// It does NOT interpolate the thrown Error message into the alert body.
// Assert the exact Arabic strings the hook actually passes.
describe('useChecklistData — saveInspection error path', () => {
  it('calls Alert when save throws', async () => {
    mockSave.mockRejectedValue(new Error('disk full'));
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await evaluateAll(result);
    await act(async () => { await result.current.handleFinish(); });
    // The hook shows a fixed Arabic error message — it does not surface
    // the raw JS Error message to the user.
    expect(Alert.alert).toHaveBeenCalledWith(
      '\u062e\u0637\u0623',           // 'خطأ'
      '\u062d\u062f\u062b \u062e\u0637\u0623 \u0623\u062b\u0646\u0627\u0621 \u0627\u0644\u062d\u0641\u0638'  // 'حدث خطأ أثناء الحفظ'
    );
  });
});

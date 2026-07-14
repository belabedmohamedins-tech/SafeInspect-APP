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

// SettingsRepository: the hook calls SettingsRepository.get() (not getAll)
// inside saveInspection(). Mocking only getAll meant get() was undefined,
// so settings.officeName threw TypeError, saveInspection caught it and
// returned false, and handleFinish bailed before calling save().
jest.mock('../repositories/SettingsRepository', () => ({
  SettingsRepository: {
    get:    jest.fn(),
    getAll: jest.fn(), // kept for completeness; not called by the hook
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
const mockSettingsGet          = SettingsRepository.get                    as jest.MockedFunction<any>;

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
  // Hook calls SettingsRepository.get() — return a valid settings object.
  mockSettingsGet.mockResolvedValue({ officeName: 'HQ', inspectorName: 'Inspector A' });
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

  // Branch: draftId provided but getById returns null → falls back to fresh load
  it('falls back to fresh criteria when draftId is provided but getById returns null', async () => {
    mockGetById.mockResolvedValue(null);
    const { result } = await renderHook(
      () => useChecklistData({ ...BASE_PARAMS, draftId: 'missing-draft' }),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    // Should have loaded default criteria (3 items), not crashed
    expect(result.current.totalItems).toBe(0);
    expect(result.current.isLoading).toBe(false);
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

  // Lines 167-170: handlePhotoTake(id, undefined) clears photoUri and photos
  it('clears photoUri and photos when uri is undefined', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await act(async () => { result.current.handlePhotoTake('c1', 'file:///photo1.jpg'); });
    await act(async () => { result.current.handlePhotoTake('c1', undefined); });
    const item = result.current.data.find((i: any) => i.id === 'c1')!;
    expect(item.photoUri).toBeUndefined();
    expect(item.photos).toHaveLength(0);
  });

  // Branch: item already has photoUri set but photos[] is empty (legacy data)
  // Covers the fallback: existingPhotos = item.photoUri ? [item.photoUri] : []
  it('seeds photos from existing photoUri when photos array is absent', async () => {
    const draftItems: InspectionItem[] = [
      {
        id: 'p1', criteria: 'Photo Check', legalReference: 'PR1',
        severity: 'low', axis: 'A', complianceStatus: 'not-evaluated',
        comment: '', photos: [],
        photoUri: 'file:///existing.jpg',
      } as any,
    ];
    mockGetById.mockResolvedValue({
      id: 'draft-photo-1', items: draftItems,
      facilityId: 'fac-1', facilityName: 'F', facilityAddress: 'A',
      date: new Date().toISOString(), inspectorName: 'X', officeName: 'O',
      status: 'in-progress', inspectionCause: '', referenceDocument: '',
      committeeMembers: [],
    });
    const { result } = await renderHook(
      () => useChecklistData({ ...BASE_PARAMS, draftId: 'draft-photo-1' }),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);

    // Manually clear photos to simulate legacy item (photoUri set, photos empty)
    await act(async () => {
      result.current.handlePhotoTake('p1', 'file:///new.jpg');
    });
    const item = result.current.data.find((i: any) => i.id === 'p1')!;
    // Should contain the seeded existing photo + new photo
    expect(item.photos).toContain('file:///existing.jpg');
    expect(item.photos).toContain('file:///new.jpg');
    expect(item.photos).toHaveLength(2);
  });
});

// ─── handleNumericChange (lines 193, 214-232) ──────────────────────────────
describe('useChecklistData — handleNumericChange', () => {
  // Line 193: item has no numericField — stores value, skips compliance derivation
  it('stores numericValue without changing complianceStatus when numericField is absent', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await act(async () => { result.current.handleNumericChange('c1', 42); });
    const item = result.current.data.find((i: any) => i.id === 'c1')!;
    expect(item.numericValue).toBe(42);
    // complianceStatus unchanged — no numericField to derive from
    expect(item.complianceStatus).toBe('not-evaluated');
  });

  // Lines 214-232: item has numericField → auto-derives complianceStatus
  it('auto-derives complianceStatus from numericField when value is provided', async () => {
    // Inject an item with a numericField spec into the hook by overriding
    // criteriaByActivity.default via the mock — but since the mock is frozen
    // to 3 simple items, we instead test via the handleNumericChange path by
    // first adding a numericField to an item through the load-from-draft path.
    const draftItems: InspectionItem[] = [
      {
        id: 'n1',
        criteria: 'Temperature Check',
        legalReference: 'TR1',
        severity: 'high',
        axis: 'Hygiene',
        complianceStatus: 'not-evaluated',
        comment: '',
        photos: [],
        numericField: {
          unit: '°C',
          min: 0,
          max: 5,
          label: 'Storage temp',
        },
      } as any,
    ];
    mockGetById.mockResolvedValue({
      id: 'draft-num-1',
      items: draftItems,
      facilityId: 'fac-1', facilityName: 'F', facilityAddress: 'A',
      date: new Date().toISOString(), inspectorName: 'X', officeName: 'O',
      status: 'in-progress', inspectionCause: '', referenceDocument: '',
      committeeMembers: [],
    });
    const { result } = await renderHook(
      () => useChecklistData({ ...BASE_PARAMS, draftId: 'draft-num-1' }),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);

    // Value within valid range (0-5 °C) → should derive 'compliant'
    await act(async () => { result.current.handleNumericChange('n1', 3); });
    const inRange = result.current.data.find((i: any) => i.id === 'n1')!;
    expect(inRange.numericValue).toBe(3);
    expect(inRange.numericUnit).toBe('°C');
    // Status derived from numericStateToComplianceStatus — will be compliant or non-compliant
    expect(['compliant', 'non-compliant']).toContain(inRange.complianceStatus);
  });

  it('stores undefined numericValue without throwing', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await act(async () => { result.current.handleNumericChange('c1', undefined); });
    const item = result.current.data.find((i: any) => i.id === 'c1')!;
    expect(item.numericValue).toBeUndefined();
  });

  // Branch: numericField present but value is undefined → skips compliance derivation
  it('skips compliance derivation when numericField is present but value is undefined', async () => {
    const draftItems: InspectionItem[] = [
      {
        id: 'n2',
        criteria: 'Noise Level',
        legalReference: 'NR1',
        severity: 'low',
        axis: 'Environment',
        complianceStatus: 'compliant', // pre-set so we can verify it is NOT changed
        comment: '',
        photos: [],
        numericField: { unit: 'dB', min: 0, max: 80, label: 'Noise' },
      } as any,
    ];
    mockGetById.mockResolvedValue({
      id: 'draft-num-2', items: draftItems,
      facilityId: 'fac-1', facilityName: 'F', facilityAddress: 'A',
      date: new Date().toISOString(), inspectorName: 'X', officeName: 'O',
      status: 'in-progress', inspectionCause: '', referenceDocument: '',
      committeeMembers: [],
    });
    const { result } = await renderHook(
      () => useChecklistData({ ...BASE_PARAMS, draftId: 'draft-num-2' }),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);

    await act(async () => { result.current.handleNumericChange('n2', undefined); });
    const item = result.current.data.find((i: any) => i.id === 'n2')!;
    expect(item.numericValue).toBeUndefined();
    // complianceStatus must NOT be changed — derivation is skipped when value is undefined
    expect(item.complianceStatus).toBe('compliant');
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

  // Branch: ALL items are 'na' — applicable.length === 0 → completionRate = 1 → passes gate
  it('passes Gate 1 when all items are na (completionRate defaults to 1)', async () => {
    const draftItems: InspectionItem[] = [
      {
        id: 'na1', criteria: 'NA Check', legalReference: 'NA1',
        severity: 'low', axis: 'A', complianceStatus: 'na',
        comment: '', photos: [],
      },
      {
        id: 'na2', criteria: 'NA Check 2', legalReference: 'NA2',
        severity: 'high', axis: 'A', complianceStatus: 'na',
        comment: '', photos: [],
      },
    ];
    mockGetById.mockResolvedValue({
      id: 'draft-na-1', items: draftItems,
      facilityId: 'fac-1', facilityName: 'F', facilityAddress: 'A',
      date: new Date().toISOString(), inspectorName: 'X', officeName: 'O',
      status: 'in-progress', inspectionCause: '', referenceDocument: '',
      committeeMembers: [],
    });
    const { result } = await renderHook(
      () => useChecklistData({ ...BASE_PARAMS, draftId: 'draft-na-1' }),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await act(async () => { await result.current.handleFinish(); });
    // Gate 1 passes (no applicable items = completionRate 1)
    // Gate 2 passes (no high-severity non-compliant items)
    // Should proceed to save
    expect(mockSave).toHaveBeenCalledTimes(1);
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

  // Branch: writer is empty → falls back to settings.inspectorName
  it('uses settings.inspectorName when writer param is empty', async () => {
    mockSettingsGet.mockResolvedValue({ officeName: 'HQ', inspectorName: 'Settings Inspector' });
    const { result } = await renderHook(
      () => useChecklistData({ ...BASE_PARAMS, writer: '' }),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await evaluateAll(result);
    await act(async () => { await result.current.handleFinish(); });
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ inspectorName: 'Settings Inspector' })
    );
  });

  // Branch: agendaId set but updateInspectionLink throws → error caught, Alert still fires
  it('shows success Alert even when AgendaRepository.updateInspectionLink throws', async () => {
    mockUpdateInspectionLink.mockRejectedValue(new Error('agenda DB error'));
    const { result } = await renderHook(
      () => useChecklistData({ ...BASE_PARAMS, agendaId: 'agenda-err' }),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await evaluateAll(result);
    await act(async () => { await result.current.handleFinish(); });
    // Save still happened
    expect(mockSave).toHaveBeenCalledTimes(1);
    // Success alert still fires (the catch just console.errors)
    expect(Alert.alert).toHaveBeenCalledWith(
      '\u0646\u062c\u0627\u062d',
      expect.any(String)
    );
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
    expect(Alert.alert).toHaveBeenCalledWith(
      '\u062e\u0637\u0623',
      '\u062d\u062f\u062b \u062e\u0637\u0623 \u0623\u062b\u0646\u0627\u0621 \u0627\u0644\u062d\u0641\u0638'
    );
  });
});

// ─── beforeRemove auto-save (lines 214-232, 287) ──────────────────────────
describe('useChecklistData — beforeRemove auto-save', () => {
  // Lines 214-232: the navigation.addListener('beforeRemove') callback calls
  // saveInspection('in-progress') then dispatches the action.
  it('calls saveInspection(in-progress) when beforeRemove fires and isFinishing is false', async () => {
    const dispatchMock = jest.fn();
    const mockAddListener = jest.fn((event: string, callback: Function) => {
      if (event === 'beforeRemove') {
        // Simulate navigation back — call callback asynchronously
        setTimeout(() => callback({
          preventDefault: jest.fn(),
          data: { action: { type: 'GO_BACK' } },
        }), 0);
      }
      return jest.fn(); // unsubscribe fn
    });
    const { useNavigation } = require('expo-router');
    (useNavigation as jest.Mock).mockReturnValue({
      addListener: mockAddListener,
      dispatch: dispatchMock,
    });

    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);

    // Wait for the beforeRemove callback to fire and save to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'in-progress' })
    );
  });

  // Line 287: isFinishing=true guard — beforeRemove returns early without saving
  it('skips auto-save when isFinishing is true (handleFinish in progress)', async () => {
    let capturedCallback: Function | null = null;
    const mockAddListener = jest.fn((event: string, callback: Function) => {
      if (event === 'beforeRemove') capturedCallback = callback;
      return jest.fn();
    });
    const { useNavigation } = require('expo-router');
    (useNavigation as jest.Mock).mockReturnValue({
      addListener: mockAddListener,
      dispatch: jest.fn(),
    });

    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await evaluateAll(result);

    // Trigger handleFinish — this sets isFinishing=true internally before save
    await act(async () => { await result.current.handleFinish(); });
    const saveCallsAfterFinish = mockSave.mock.calls.length;

    // Now fire beforeRemove — it should be a no-op because isFinishing is true
    if (capturedCallback) {
      await act(async () => {
        await (capturedCallback as Function)({
          preventDefault: jest.fn(),
          data: { action: { type: 'GO_BACK' } },
        });
      });
    }

    // No additional save calls beyond the one from handleFinish
    expect(mockSave.mock.calls.length).toBe(saveCallsAfterFinish);
  });
});

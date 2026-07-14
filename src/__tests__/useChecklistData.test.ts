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

// Helper — mark all items compliant so both finish gates pass
async function evaluateAll(result: any) {
  await act(async () => {
    result.current.data.forEach((item: any) => {
      result.current.handleStatusChange(item.id, 'compliant');
    });
  });
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

  // Branch: activity key provided but NOT in criteriaByActivity → falls to default
  it('falls back to default criteria when activity key is not in criteriaByActivity', async () => {
    const { result } = await renderHook(
      () => useChecklistData({ ...BASE_PARAMS, activity: 'unknown-activity-xyz' }),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    // unknown-activity-xyz is not in the mock map → default (3 items)
    expect(result.current.totalItems).toBe(3);
  });

  it('generates a UUID as inspectionId on fresh load', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    expect(require('expo-crypto').randomUUID).toHaveBeenCalled();
  });

  // Branch: draftId provided but getById returns null → sets empty data, isLoading false
  it('sets empty data when draftId is provided but getById returns null', async () => {
    mockGetById.mockResolvedValue(null);
    const { result } = await renderHook(
      () => useChecklistData({ ...BASE_PARAMS, draftId: 'missing-draft' }),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.totalItems).toBe(0);
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

  // Branch: item.photos is null/undefined (legacy data without photos array)
  it('seeds existingPhotos from photoUri when photos field is null/undefined', async () => {
    const draftItems = [
      {
        id: 'p1', criteria: 'Photo Check', legalReference: 'PR1',
        severity: 'low', axis: 'A', complianceStatus: 'not-evaluated',
        comment: '',
        photos: undefined,
        photoUri: 'file:///existing.jpg',
      },
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
    await act(async () => { result.current.handlePhotoTake('p1', 'file:///new.jpg'); });
    const item = result.current.data.find((i: any) => i.id === 'p1')!;
    expect(item.photos).toContain('file:///existing.jpg');
    expect(item.photos).toContain('file:///new.jpg');
    expect(item.photos).toHaveLength(2);
    expect(item.photoUri).toBe('file:///existing.jpg');
  });
});

// ─── handleNumericChange ──────────────────────────────────────────────────
describe('useChecklistData — handleNumericChange', () => {
  it('stores numericValue without changing complianceStatus when numericField is absent', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await act(async () => { result.current.handleNumericChange('c1', 42); });
    const item = result.current.data.find((i: any) => i.id === 'c1')!;
    expect(item.numericValue).toBe(42);
    expect(item.complianceStatus).toBe('not-evaluated');
  });

  it('auto-derives complianceStatus from numericField when value is provided', async () => {
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
        numericField: { unit: '°C', min: 0, max: 5, label: 'Storage temp' },
      } as any,
    ];
    mockGetById.mockResolvedValue({
      id: 'draft-num-1', items: draftItems,
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
    await act(async () => { result.current.handleNumericChange('n1', 3); });
    const inRange = result.current.data.find((i: any) => i.id === 'n1')!;
    expect(inRange.numericValue).toBe(3);
    expect(inRange.numericUnit).toBe('°C');
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

  // numericField present but value undefined → skips compliance derivation
  it('skips compliance derivation when numericField is present but value is undefined', async () => {
    const draftItems: InspectionItem[] = [
      {
        id: 'n2',
        criteria: 'Noise Level',
        legalReference: 'NR1',
        severity: 'low',
        axis: 'Environment',
        complianceStatus: 'compliant',
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
    expect(item.complianceStatus).toBe('compliant');
  });

  // numericUnit falls back to item.numericUnit when numericField is absent
  it('uses item.numericUnit as fallback when numericField is absent', async () => {
    const draftItems: InspectionItem[] = [
      {
        id: 'n3',
        criteria: 'Weight',
        legalReference: 'WR1',
        severity: 'low',
        axis: 'Measures',
        complianceStatus: 'not-evaluated',
        comment: '',
        photos: [],
        numericUnit: 'kg',
      } as any,
    ];
    mockGetById.mockResolvedValue({
      id: 'draft-num-3', items: draftItems,
      facilityId: 'fac-1', facilityName: 'F', facilityAddress: 'A',
      date: new Date().toISOString(), inspectorName: 'X', officeName: 'O',
      status: 'in-progress', inspectionCause: '', referenceDocument: '',
      committeeMembers: [],
    });
    const { result } = await renderHook(
      () => useChecklistData({ ...BASE_PARAMS, draftId: 'draft-num-3' }),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await act(async () => { result.current.handleNumericChange('n3', 10); });
    const item = result.current.data.find((i: any) => i.id === 'n3')!;
    expect(item.numericValue).toBe(10);
    expect(item.numericUnit).toBe('kg');
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
    await act(async () => { result.current.handleStatusChange('c1', 'compliant'); });
    await act(async () => { await result.current.handleFinish(); });
    expect(Alert.alert).toHaveBeenCalledWith(
      'لم يكتمل التفتيش',
      expect.stringContaining('85'),
      expect.any(Array)
    );
    expect(mockSave).not.toHaveBeenCalled();
  });

  // applicable.length === 0 → completionRate = 1 → passes Gate 1
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
    await act(async () => {
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

  // Branch: high-severity non-compliant item has photoUri (legacy) but no photos array
  it('passes Gate 2 when item has photoUri but empty photos array', async () => {
    const draftItems: InspectionItem[] = [
      {
        id: 'h1', criteria: 'High Gate Check', legalReference: 'HG1',
        severity: 'high', axis: 'A', complianceStatus: 'non-compliant',
        comment: '', photos: [],
        photoUri: 'file:///legacy.jpg',  // legacy photoUri path
      },
      {
        id: 'h2', criteria: 'Other', legalReference: 'HG2',
        severity: 'low', axis: 'A', complianceStatus: 'compliant',
        comment: '', photos: [],
      },
    ];
    mockGetById.mockResolvedValue({
      id: 'draft-photoUri-gate', items: draftItems,
      facilityId: 'fac-1', facilityName: 'F', facilityAddress: 'A',
      date: new Date().toISOString(), inspectorName: 'X', officeName: 'O',
      status: 'in-progress', inspectionCause: '', referenceDocument: '',
      committeeMembers: [],
    });
    const { result } = await renderHook(
      () => useChecklistData({ ...BASE_PARAMS, draftId: 'draft-photoUri-gate' }),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await act(async () => { await result.current.handleFinish(); });
    // photoUri satisfies gate — save should be called
    expect(mockSave).toHaveBeenCalledTimes(1);
  });
});

// ─── handleFinish — success path ───────────────────────────────────────────
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

  it('persists score and grade fields when status is completed', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await evaluateAll(result);
    await act(async () => { await result.current.handleFinish(); });
    const savedPayload = mockSave.mock.calls[0][0];
    expect(savedPayload).toHaveProperty('score');
    expect(savedPayload).toHaveProperty('grade');
    expect(savedPayload).toHaveProperty('riskLevel');
  });

  it('persists signature when signature param is provided', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS, 'data:image/png;base64,sig=='),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await evaluateAll(result);
    await act(async () => { await result.current.handleFinish(); });
    const savedPayload = mockSave.mock.calls[0][0];
    expect(savedPayload.signature).toBe('data:image/png;base64,sig==');
  });

  // Branch: no signature → signature field must NOT appear in saved payload
  it('does not set signature field when no signature param is provided', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await evaluateAll(result);
    await act(async () => { await result.current.handleFinish(); });
    const savedPayload = mockSave.mock.calls[0][0];
    expect(savedPayload.signature).toBeUndefined();
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

  // Branch: writer empty AND settings.inspectorName empty → falls to hard-coded 'المفتش'
  it('falls back to hard-coded inspector name when writer and settings.inspectorName are both empty', async () => {
    mockSettingsGet.mockResolvedValue({ officeName: 'HQ', inspectorName: '' });
    const { result } = await renderHook(
      () => useChecklistData({ ...BASE_PARAMS, writer: '' }),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await evaluateAll(result);
    await act(async () => { await result.current.handleFinish(); });
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ inspectorName: 'المفتش' })
    );
  });

  it('shows success Alert even when AgendaRepository.updateInspectionLink throws', async () => {
    mockUpdateInspectionLink.mockRejectedValue(new Error('agenda DB error'));
    const { result } = await renderHook(
      () => useChecklistData({ ...BASE_PARAMS, agendaId: 'agenda-err' }),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await evaluateAll(result);
    await act(async () => { await result.current.handleFinish(); });
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(Alert.alert).toHaveBeenCalledWith('نجاح', expect.any(String));
  });

  // Branch: saveInspection returns false → setIsFinishing(false), no router.replace
  it('resets isFinishing and does not navigate when saveInspection returns false', async () => {
    mockSave.mockRejectedValue(new Error('disk full'));
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
    expect(mockReplace).not.toHaveBeenCalled();
  });
});

// ─── Phase-3/5/6 fields persisted on save ─────────────────────────────────
describe('useChecklistData — Phase-3/5/6 fields on save payload', () => {
  it('persists inspectionType on the saved payload', async () => {
    const { result } = await renderHook(
      () => useChecklistData({ ...BASE_PARAMS, inspectionType: 'follow-up' }),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await evaluateAll(result);
    await act(async () => { await result.current.handleFinish(); });
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ inspectionType: 'follow-up' })
    );
  });

  it('defaults inspectionType to "routine" when not provided', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await evaluateAll(result);
    await act(async () => { await result.current.handleFinish(); });
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ inspectionType: 'routine' })
    );
  });

  it('persists priorInspectionId when provided', async () => {
    const { result } = await renderHook(
      () => useChecklistData({ ...BASE_PARAMS, inspectionType: 'follow-up', priorInspectionId: 'prior-123' }),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await evaluateAll(result);
    await act(async () => { await result.current.handleFinish(); });
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ priorInspectionId: 'prior-123' })
    );
  });

  it('persists openingMeetingDone and closingMeetingDone flags (Phase-5)', async () => {
    const { result } = await renderHook(
      () => useChecklistData({ ...BASE_PARAMS, openingMeetingDone: true, closingMeetingDone: true }),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await evaluateAll(result);
    await act(async () => { await result.current.handleFinish(); });
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ openingMeetingDone: true, closingMeetingDone: true })
    );
  });

  it('defaults openingMeetingDone and closingMeetingDone to false when not provided', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await evaluateAll(result);
    await act(async () => { await result.current.handleFinish(); });
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ openingMeetingDone: false, closingMeetingDone: false })
    );
  });

  it('persists escalationOverrideReason when provided (Phase-6)', async () => {
    const { result } = await renderHook(
      () => useChecklistData({ ...BASE_PARAMS, escalationOverrideReason: 'inspector override' }),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await evaluateAll(result);
    await act(async () => { await result.current.handleFinish(); });
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ escalationOverrideReason: 'inspector override' })
    );
  });

  it('does not set escalationOverrideReason when not provided (Phase-6)', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await evaluateAll(result);
    await act(async () => { await result.current.handleFinish(); });
    const savedPayload = mockSave.mock.calls[0][0];
    expect(savedPayload.escalationOverrideReason).toBeUndefined();
  });
});

// ─── coordinates branch ────────────────────────────────────────────────────
describe('useChecklistData — coordinates on save payload', () => {
  it('persists coordinates when lat and lng are provided', async () => {
    const { result } = await renderHook(
      () => useChecklistData({ ...BASE_PARAMS, lat: 36.7, lng: 3.1 }),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await evaluateAll(result);
    await act(async () => { await result.current.handleFinish(); });
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({
        coordinates: { latitude: 36.7, longitude: 3.1 },
      })
    );
  });

  it('sets coordinates to undefined when lat/lng are not provided', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await evaluateAll(result);
    await act(async () => { await result.current.handleFinish(); });
    const savedPayload = mockSave.mock.calls[0][0];
    expect(savedPayload.coordinates).toBeUndefined();
  });
});

// ─── Derived values ─────────────────────────────────────────────────────────
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

  it('progressPercent is 100 when all items are evaluated', async () => {
    const { result } = await renderHook(
      () => useChecklistData(BASE_PARAMS),
      { wrapper: Wrapper }
    );
    await waitLoaded(result);
    await evaluateAll(result);
    expect(result.current.progressPercent).toBeCloseTo(100, 0);
  });
});

// ─── saveInspection error path ─────────────────────────────────────────────
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
      'خطأ',
      'حدث خطأ أثناء الحفظ'
    );
  });
});

// ─── beforeRemove auto-save ─────────────────────────────────────────────────
describe('useChecklistData — beforeRemove auto-save', () => {
  it('calls saveInspection(in-progress) when beforeRemove fires and isFinishing is false', async () => {
    const dispatchMock = jest.fn();
    const mockAddListener = jest.fn((event: string, callback: Function) => {
      if (event === 'beforeRemove') {
        setTimeout(() => callback({
          preventDefault: jest.fn(),
          data: { action: { type: 'GO_BACK' } },
        }), 0);
      }
      return jest.fn();
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
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'in-progress' })
    );
  });

  // isFinishing=true guard — beforeRemove returns early without saving
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
    await act(async () => { await result.current.handleFinish(); });
    const saveCallsAfterFinish = mockSave.mock.calls.length;
    if (capturedCallback) {
      await act(async () => {
        await (capturedCallback as Function)({
          preventDefault: jest.fn(),
          data: { action: { type: 'GO_BACK' } },
        });
      });
    }
    expect(mockSave.mock.calls.length).toBe(saveCallsAfterFinish);
  });
});

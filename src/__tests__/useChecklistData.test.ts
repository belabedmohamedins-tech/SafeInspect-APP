/**
 * Unit tests for src/hooks/useChecklistData.ts
 *
 * Approach:
 *  - Mock expo-crypto, expo-router, react-native Alert, and all repositories
 *    so the hook can run in a plain Node/Jest environment.
 *  - Use @testing-library/react-hooks for renderHook + act.
 */

import { act, renderHook, waitForNextUpdate } from '@testing-library/react-hooks';
import { Alert } from 'react-native';

// ─── Mocks ─────────────────────────────────────────────────────────────────────

const mockPush    = jest.fn();
const mockReplace = jest.fn();
const mockBack    = jest.fn();
const mockAddListener = jest.fn(() => jest.fn()); // returns unsubscribe fn

jest.mock('expo-router', () => ({
  useRouter:    () => ({ push: mockPush, replace: mockReplace, back: mockBack }),
  useNavigation: () => ({ addListener: mockAddListener }),
}));

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'mock-uuid-1234'),
}));

const mockSave   = jest.fn().mockResolvedValue(undefined);
const mockGetById = jest.fn();
jest.mock('../repositories/InspectionRepository', () => ({
  InspectionRepository: { save: (...a: any[]) => mockSave(...a), getById: (...a: any[]) => mockGetById(...a) },
}));

const mockSettingsGet = jest.fn().mockResolvedValue({ officeName: 'مكتب التجربة' });
jest.mock('../repositories/SettingsRepository', () => ({
  SettingsRepository: { get: () => mockSettingsGet() },
}));

const mockUpdateLink = jest.fn().mockResolvedValue(true);
jest.mock('../repositories/AgendaRepository', () => ({
  AgendaRepository: { updateInspectionLink: (...a: any[]) => mockUpdateLink(...a) },
}));

jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

// ─── Test data ────────────────────────────────────────────────────────────────

import { criteriaByActivity } from '../criteriaData';

const BASE_PARAMS = {
  facilityId:       'fac-01',
  facilityName:     'مخبزة الصدى',
  facilityAddress:  'شارع الاستقلال',
  cause:            'routine',
  reference:        '',
  committeeMembers: ['علي', 'سارة'],
  writer:           'محمد أمين',
};

import { useChecklistData } from '../hooks/useChecklistData';

beforeEach(() => {
  jest.clearAllMocks();
  mockSave.mockResolvedValue(undefined);
  mockSettingsGet.mockResolvedValue({ officeName: 'مكتب التجربة' });
  mockUpdateLink.mockResolvedValue(true);
});

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('useChecklistData — initial load', () => {
  it('loads criteria from criteriaByActivity for a known activity', async () => {
    const activity = Object.keys(criteriaByActivity).find(k => k !== 'default')!;
    const { result } = renderHook(() =>
      useChecklistData({ ...BASE_PARAMS, activity }, undefined)
    );
    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data.length).toBe(criteriaByActivity[activity].length);
  });

  it('falls back to default criteria for an unknown activity', async () => {
    const { result } = renderHook(() =>
      useChecklistData({ ...BASE_PARAMS, activity: '__UNKNOWN__' }, undefined)
    );
    await waitForNextUpdate();

    expect(result.current.data.length).toBe(criteriaByActivity.default.length);
  });

  it('all items start with complianceStatus = "not-evaluated"', async () => {
    const { result } = renderHook(() =>
      useChecklistData(BASE_PARAMS, undefined)
    );
    await waitForNextUpdate();

    result.current.data.forEach(item =>
      expect(item.complianceStatus).toBe('not-evaluated')
    );
  });

  it('loads draft items when draftId is provided', async () => {
    const draftItems = [{ id: 'd1', criteria: 'C1', axis: 'محور 1', legalReference: '', complianceStatus: 'compliant', comment: '' }];
    mockGetById.mockResolvedValueOnce({ id: 'draft-id', items: draftItems });

    const { result } = renderHook(() =>
      useChecklistData({ ...BASE_PARAMS, draftId: 'draft-id' }, undefined)
    );
    await waitForNextUpdate();

    expect(result.current.data).toEqual(draftItems);
  });
});

describe('useChecklistData — item handlers', () => {
  async function setup() {
    const { result } = renderHook(() =>
      useChecklistData(BASE_PARAMS, undefined)
    );
    await waitForNextUpdate();
    return result;
  }

  it('handleStatusChange updates the item\'s complianceStatus', async () => {
    const result = await setup();
    const firstId = result.current.data[0].id;
    act(() => result.current.handleStatusChange(firstId, 'compliant'));
    expect(result.current.data[0].complianceStatus).toBe('compliant');
  });

  it('handleCommentChange updates the item\'s comment', async () => {
    const result = await setup();
    const firstId = result.current.data[0].id;
    act(() => result.current.handleCommentChange(firstId, 'ملاحظة مهمة'));
    expect(result.current.data[0].comment).toBe('ملاحظة مهمة');
  });

  it('handlePhotoTake updates the item\'s photoUri', async () => {
    const result = await setup();
    const firstId = result.current.data[0].id;
    act(() => result.current.handlePhotoTake(firstId, 'file:///photo.jpg'));
    expect(result.current.data[0].photoUri).toBe('file:///photo.jpg');
  });

  it('handlers do not mutate other items', async () => {
    const result = await setup();
    if (result.current.data.length < 2) return; // skip if only 1 item
    const [id0, id1] = result.current.data.map(i => i.id);
    act(() => result.current.handleStatusChange(id0, 'non-compliant'));
    expect(result.current.data.find(i => i.id === id1)?.complianceStatus).toBe('not-evaluated');
  });
});

describe('useChecklistData — derived values', () => {
  it('progressPercent is 0 when nothing is evaluated', async () => {
    const { result } = renderHook(() => useChecklistData(BASE_PARAMS, undefined));
    await waitForNextUpdate();
    expect(result.current.progressPercent).toBe(0);
    expect(result.current.evaluatedItems).toBe(0);
  });

  it('progressPercent is 100 when all items are evaluated', async () => {
    const { result } = renderHook(() => useChecklistData(BASE_PARAMS, undefined));
    await waitForNextUpdate();

    act(() => {
      result.current.data.forEach(item =>
        result.current.handleStatusChange(item.id, 'compliant')
      );
    });
    expect(result.current.progressPercent).toBe(100);
    expect(result.current.evaluatedItems).toBe(result.current.totalItems);
  });

  it('sections groups items by axis', async () => {
    const { result } = renderHook(() => useChecklistData(BASE_PARAMS, undefined));
    await waitForNextUpdate();

    const allItems = result.current.data;
    const uniqueAxes = Array.from(new Set(allItems.map(i => i.axis || 'أخرى')));
    expect(result.current.sections.length).toBe(uniqueAxes.length);
  });
});

describe('useChecklistData — handleFinish', () => {
  it('calls InspectionRepository.save with status="completed" and navigates away', async () => {
    const { result } = renderHook(() => useChecklistData(BASE_PARAMS, undefined));
    await waitForNextUpdate();

    await act(async () => {
      await result.current.handleFinish();
    });

    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'completed' })
    );
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/inspection');
  });

  it('calls AgendaRepository.updateInspectionLink when agendaId is provided', async () => {
    const { result } = renderHook(() =>
      useChecklistData({ ...BASE_PARAMS, agendaId: 'agenda-99' }, undefined)
    );
    await waitForNextUpdate();

    await act(async () => {
      await result.current.handleFinish();
    });

    expect(mockUpdateLink).toHaveBeenCalledWith('agenda-99', expect.any(String));
  });

  it('attaches score and grade to the saved inspection', async () => {
    const { result } = renderHook(() => useChecklistData(BASE_PARAMS, undefined));
    await waitForNextUpdate();

    // evaluate all items so a score can be computed
    act(() => {
      result.current.data.forEach(item =>
        result.current.handleStatusChange(item.id, 'compliant')
      );
    });

    await act(async () => {
      await result.current.handleFinish();
    });

    const saved = mockSave.mock.calls[0][0];
    expect(saved).toHaveProperty('score');
    expect(saved).toHaveProperty('grade');
  });

  it('attaches the signature when one is provided', async () => {
    const sig = 'data:image/png;base64,FAKESIG';
    const { result } = renderHook(() =>
      useChecklistData(BASE_PARAMS, sig)
    );
    await waitForNextUpdate();

    await act(async () => {
      await result.current.handleFinish();
    });

    const saved = mockSave.mock.calls[0][0];
    expect(saved.signature).toBe(sig);
  });
});

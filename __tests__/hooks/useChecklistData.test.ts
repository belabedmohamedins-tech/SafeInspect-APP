// __tests__/hooks/useChecklistData.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';

// ── L4 mocks ──────────────────────────────────────────────────────────────────

const mockGetById    = jest.fn();
const mockSave       = jest.fn();
const mockGetSettings = jest.fn();
const mockUpdateLink  = jest.fn();
const mockRouterReplace = jest.fn();
const mockAddListener   = jest.fn(() => jest.fn()); // returns unsubscribe

jest.mock('../../src/repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getById: (...a: any[]) => mockGetById(...a),
    save:    (...a: any[]) => mockSave(...a),
  },
}));

jest.mock('../../src/repositories/SettingsRepository', () => ({
  SettingsRepository: {
    get: (...a: any[]) => mockGetSettings(...a),
  },
}));

jest.mock('../../src/repositories/AgendaRepository', () => ({
  AgendaRepository: {
    updateInspectionLink: (...a: any[]) => mockUpdateLink(...a),
  },
}));

jest.mock('expo-router', () => ({
  useRouter:     () => ({ replace: mockRouterReplace }),
  useNavigation: () => ({ addListener: mockAddListener }),
}));

jest.mock('expo-crypto', () => ({
  randomUUID: () => 'test-uuid-1234',
}));

// criteriaData — minimal stub
jest.mock('../../src/criteriaData', () => ({
  criteriaByActivity: {
    default: [
      { id: 'c1', title: 'Criterion 1', axis: 'Axis A', severity: 'medium', weight: 1 },
      { id: 'c2', title: 'Criterion 2', axis: 'Axis A', severity: 'high',   weight: 2 },
      { id: 'c3', title: 'Criterion 3', axis: 'Axis B', severity: 'low',    weight: 1 },
    ],
    food: [
      { id: 'f1', title: 'Food 1', axis: 'Hygiene', severity: 'high', weight: 2 },
    ],
  },
}));

import { useChecklistData } from '../../src/hooks/useChecklistData';

const BASE_PARAMS = {
  facilityId:       'fac1',
  facilityName:     '\u0645\u0635\u0646\u0639 \u0623',
  facilityAddress:  '\u062a\u0644\u0645\u0633\u0627\u0646',
  cause:            '\u0631\u0648\u062a\u064a\u0646',
  reference:        'REF-001',
  committeeMembers: ['\u0645\u0641\u062a\u0634 1'],
  writer:           '\u0645\u062d\u0645\u062f',
};

const DEFAULT_SETTINGS = { officeName: '\u0645\u062f\u064a\u0631\u064a\u0629', inspectorName: '\u0645\u0641\u062a\u0634' };

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  mockGetSettings.mockResolvedValue(DEFAULT_SETTINGS);
  mockSave.mockResolvedValue(undefined);
  mockUpdateLink.mockResolvedValue(undefined);
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
});

// ── load ──────────────────────────────────────────────────────────────────────

describe('useChecklistData \u2014 load', () => {
  it('loads default criteria when no draftId and no activity', async () => {
    const { result } = renderHook(() => useChecklistData(BASE_PARAMS));
    await act(async () => {});
    expect(result.current.isLoading).toBe(false);
    expect(result.current.totalItems).toBe(3);
    expect(result.current.data[0].complianceStatus).toBe('not-evaluated');
  });

  it('loads activity-specific criteria when activity matches', async () => {
    const { result } = renderHook(() =>
      useChecklistData({ ...BASE_PARAMS, activity: 'food' })
    );
    await act(async () => {});
    expect(result.current.totalItems).toBe(1);
  });

  it('loads draft when draftId is provided', async () => {
    const draftItems = [
      { id: 'c1', title: 'C1', axis: 'A', severity: 'medium', weight: 1, complianceStatus: 'compliant', comment: '', photos: [] },
    ];
    mockGetById.mockResolvedValue({ id: 'draft-1', items: draftItems });
    const { result } = renderHook(() =>
      useChecklistData({ ...BASE_PARAMS, draftId: 'draft-1' })
    );
    await act(async () => {});
    expect(mockGetById).toHaveBeenCalledWith('draft-1');
    expect(result.current.totalItems).toBe(1);
    expect(result.current.data[0].complianceStatus).toBe('compliant');
  });

  it('falls back gracefully when draft is not found', async () => {
    mockGetById.mockResolvedValue(null);
    const { result } = renderHook(() =>
      useChecklistData({ ...BASE_PARAMS, draftId: 'missing-draft' })
    );
    await act(async () => {});
    expect(result.current.isLoading).toBe(false);
    expect(result.current.totalItems).toBe(0);
  });
});

// ── item handlers ─────────────────────────────────────────────────────────────

describe('useChecklistData \u2014 item handlers', () => {
  it('handleStatusChange updates the item complianceStatus', async () => {
    const { result } = renderHook(() => useChecklistData(BASE_PARAMS));
    await act(async () => {});
    act(() => { result.current.handleStatusChange('c1', 'compliant'); });
    expect(result.current.data.find(i => i.id === 'c1')?.complianceStatus).toBe('compliant');
  });

  it('handleCommentChange updates the item comment', async () => {
    const { result } = renderHook(() => useChecklistData(BASE_PARAMS));
    await act(async () => {});
    act(() => { result.current.handleCommentChange('c1', 'test comment'); });
    expect(result.current.data.find(i => i.id === 'c1')?.comment).toBe('test comment');
  });

  it('handlePhotoTake adds a photo uri', async () => {
    const { result } = renderHook(() => useChecklistData(BASE_PARAMS));
    await act(async () => {});
    act(() => { result.current.handlePhotoTake('c1', 'file://photo1.jpg'); });
    const item = result.current.data.find(i => i.id === 'c1')!;
    expect(item.photos).toContain('file://photo1.jpg');
    expect(item.photoUri).toBe('file://photo1.jpg');
  });

  it('handlePhotoTake with undefined clears photos', async () => {
    const { result } = renderHook(() => useChecklistData(BASE_PARAMS));
    await act(async () => {});
    act(() => { result.current.handlePhotoTake('c1', 'file://photo1.jpg'); });
    act(() => { result.current.handlePhotoTake('c1', undefined); });
    const item = result.current.data.find(i => i.id === 'c1')!;
    expect(item.photos).toEqual([]);
    expect(item.photoUri).toBeUndefined();
  });

  it('handleNumericChange stores numericValue', async () => {
    const { result } = renderHook(() => useChecklistData(BASE_PARAMS));
    await act(async () => {});
    act(() => { result.current.handleNumericChange('c1', 42); });
    expect(result.current.data.find(i => i.id === 'c1')?.numericValue).toBe(42);
  });

  it('handleNumericChange with undefined clears value', async () => {
    const { result } = renderHook(() => useChecklistData(BASE_PARAMS));
    await act(async () => {});
    act(() => { result.current.handleNumericChange('c1', 42); });
    act(() => { result.current.handleNumericChange('c1', undefined); });
    expect(result.current.data.find(i => i.id === 'c1')?.numericValue).toBeUndefined();
  });
});

// ── derived values ────────────────────────────────────────────────────────────

describe('useChecklistData \u2014 derived values', () => {
  it('progressPercent starts at 0 with all items not-evaluated', async () => {
    const { result } = renderHook(() => useChecklistData(BASE_PARAMS));
    await act(async () => {});
    expect(result.current.progressPercent).toBe(0);
    expect(result.current.evaluatedItems).toBe(0);
  });

  it('progressPercent updates as items are evaluated', async () => {
    const { result } = renderHook(() => useChecklistData(BASE_PARAMS));
    await act(async () => {});
    act(() => { result.current.handleStatusChange('c1', 'compliant'); });
    act(() => { result.current.handleStatusChange('c2', 'non-compliant'); });
    expect(result.current.evaluatedItems).toBe(2);
    expect(result.current.progressPercent).toBeCloseTo(66.67, 1);
  });

  it('sections groups items by axis', async () => {
    const { result } = renderHook(() => useChecklistData(BASE_PARAMS));
    await act(async () => {});
    // sections is an array of { title, data } objects
    const titles = result.current.sections.map((s: { title: string }) => s.title);
    expect(titles).toContain('Axis A');
    expect(titles).toContain('Axis B');
  });
});

// ── saveInspection (via handleFinish) ─────────────────────────────────────────

describe('useChecklistData \u2014 handleFinish gates', () => {
  it('shows alert when completion rate < 85%', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { result } = renderHook(() => useChecklistData(BASE_PARAMS));
    await act(async () => {});
    act(() => { result.current.handleStatusChange('c1', 'compliant'); });
    await act(async () => { await result.current.handleFinish(); });
    expect(alertSpy).toHaveBeenCalledWith(
      '\u0644\u0645 \u064a\u0643\u062a\u0645\u0644 \u0627\u0644\u062a\u0641\u062a\u064a\u0634',
      expect.stringContaining('85'),
      expect.any(Array),
    );
    alertSpy.mockRestore();
  });

  it('shows photo-required alert when high-severity non-compliant has no photo', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { result } = renderHook(() => useChecklistData(BASE_PARAMS));
    await act(async () => {});
    act(() => {
      result.current.handleStatusChange('c1', 'compliant');
      result.current.handleStatusChange('c2', 'non-compliant'); // high severity, no photo
      result.current.handleStatusChange('c3', 'compliant');
    });
    await act(async () => { await result.current.handleFinish(); });
    expect(alertSpy).toHaveBeenCalledWith(
      '\u0635\u0648\u0631 \u0645\u0637\u0644\u0648\u0628\u0629',
      expect.stringContaining('1'),
      expect.any(Array),
    );
    alertSpy.mockRestore();
  });

  it('saves and navigates on successful finish', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { result } = renderHook(() => useChecklistData(BASE_PARAMS));
    await act(async () => {});
    act(() => {
      result.current.handleStatusChange('c1', 'compliant');
      result.current.handleStatusChange('c2', 'compliant');
      result.current.handleStatusChange('c3', 'compliant');
    });
    await act(async () => { await result.current.handleFinish(); });
    expect(mockSave).toHaveBeenCalled();
    expect(mockRouterReplace).toHaveBeenCalledWith('/(tabs)/inspection');
    alertSpy.mockRestore();
  });

  it('updates agenda link and shows success alert when agendaId provided', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { result } = renderHook(() =>
      useChecklistData({ ...BASE_PARAMS, agendaId: 'agenda-1' })
    );
    await act(async () => {});
    act(() => {
      result.current.handleStatusChange('c1', 'compliant');
      result.current.handleStatusChange('c2', 'compliant');
      result.current.handleStatusChange('c3', 'compliant');
    });
    await act(async () => { await result.current.handleFinish(); });
    expect(mockUpdateLink).toHaveBeenCalled();
    // actual message from source: 'تم حفظ التفتيش وتحديث المهمة كمكتملة'
    expect(alertSpy).toHaveBeenCalledWith(
      '\u0646\u062c\u0627\u062d',
      '\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u062a\u0641\u062a\u064a\u0634 \u0648\u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0645\u0647\u0645\u0629 \u0643\u0645\u0643\u062a\u0645\u0644\u0629',
    );
    alertSpy.mockRestore();
  });

  it('does not navigate when save fails', async () => {
    mockSave.mockRejectedValue(new Error('save error'));
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { result } = renderHook(() => useChecklistData(BASE_PARAMS));
    await act(async () => {});
    act(() => {
      result.current.handleStatusChange('c1', 'compliant');
      result.current.handleStatusChange('c2', 'compliant');
      result.current.handleStatusChange('c3', 'compliant');
    });
    await act(async () => { await result.current.handleFinish(); });
    expect(mockRouterReplace).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});

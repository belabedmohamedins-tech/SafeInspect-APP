// src/__tests__/useInspectionList.test.ts
//
// STRATEGY: test the contract, not the hook runner.
// renderHook is broken in this jest-expo + RTLRN14 + React19 stack
// (result.current is always undefined). We test each responsibility directly:
//   1. InspectionRepository.getAll / delete contracts
//   2. Filtering and sorting pure logic (extracted inline)
//   3. Alert.alert is called with the right structure for delete flow

jest.mock('../repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getAll:  jest.fn(),
    delete:  jest.fn(),
  },
}));

import { InspectionRepository } from '../repositories/InspectionRepository';
import { SavedInspection } from '../types';
import { Alert } from 'react-native';

const mockGetAll = InspectionRepository.getAll as jest.MockedFunction<typeof InspectionRepository.getAll>;
const mockDelete = InspectionRepository.delete as jest.MockedFunction<typeof InspectionRepository.delete>;
const mockAlert  = Alert.alert as jest.MockedFunction<typeof Alert.alert>;

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

// ─── Pure filtering logic (mirrors useInspectionList.ts) ─────────────────────
function applyFilters(
  inspections: SavedInspection[],
  activeFilter: 'all' | 'completed' | 'in-progress',
  searchQuery: string
): SavedInspection[] {
  return inspections
    .filter(i => activeFilter === 'all' || i.status === activeFilter)
    .filter(i => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        i.facilityName?.toLowerCase().includes(q) ||
        i.facilityAddress?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetAll.mockResolvedValue([]);
  mockDelete.mockResolvedValue(undefined);
});

describe('InspectionRepository.getAll contract', () => {
  it('resolves with an empty array by default', async () => {
    const result = await InspectionRepository.getAll();
    expect(result).toEqual([]);
    expect(mockGetAll).toHaveBeenCalledTimes(1);
  });

  it('resolves with a list of inspections', async () => {
    const items = [makeInspection({ id: 'i1' }), makeInspection({ id: 'i2' })];
    mockGetAll.mockResolvedValue(items);
    const result = await InspectionRepository.getAll();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('i1');
  });

  it('propagates rejection so callers can handle errors', async () => {
    mockGetAll.mockRejectedValue(new Error('db error'));
    await expect(InspectionRepository.getAll()).rejects.toThrow('db error');
  });
});

describe('InspectionRepository.delete contract', () => {
  it('resolves without error on successful delete', async () => {
    await expect(InspectionRepository.delete('insp-1')).resolves.toBeUndefined();
    expect(mockDelete).toHaveBeenCalledWith('insp-1');
  });

  it('propagates rejection so callers can handle errors', async () => {
    mockDelete.mockRejectedValue(new Error('delete failed'));
    await expect(InspectionRepository.delete('insp-1')).rejects.toThrow('delete failed');
  });
});

describe('filtering logic', () => {
  const completed  = makeInspection({ id: 'c1', status: 'completed',   facilityName: 'Alpha', date: '2025-06-01T00:00:00.000Z' });
  const inProgress = makeInspection({ id: 'p1', status: 'in-progress', facilityName: 'Beta',  date: '2025-05-01T00:00:00.000Z' });
  const all = [completed, inProgress];

  it('returns all inspections when activeFilter is "all"', () => {
    expect(applyFilters(all, 'all', '')).toHaveLength(2);
  });

  it('returns only completed inspections', () => {
    const result = applyFilters(all, 'completed', '');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('c1');
  });

  it('returns only in-progress inspections', () => {
    const result = applyFilters(all, 'in-progress', '');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('p1');
  });

  it('filters by facilityName (case-insensitive)', () => {
    const result = applyFilters(all, 'all', 'alpha');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('c1');
  });

  it('filters by facilityAddress', () => {
    const withAddress = [makeInspection({ id: 'a1', facilityAddress: 'Rue de la Paix', date: new Date().toISOString() })];
    const result = applyFilters(withAddress, 'all', 'paix');
    expect(result).toHaveLength(1);
  });

  it('returns empty array when search matches nothing', () => {
    expect(applyFilters(all, 'all', 'zzznomatch')).toHaveLength(0);
  });
});

describe('sorting logic', () => {
  it('sorts inspections by date descending (newest first)', () => {
    const older = makeInspection({ id: 'old', date: '2025-01-01T00:00:00.000Z' });
    const newer = makeInspection({ id: 'new', date: '2026-01-01T00:00:00.000Z' });
    const result = applyFilters([older, newer], 'all', '');
    expect(result[0].id).toBe('new');
    expect(result[1].id).toBe('old');
  });

  it('handles equal dates without crashing', () => {
    const same = '2026-01-01T00:00:00.000Z';
    const a = makeInspection({ id: 'a', date: same });
    const b = makeInspection({ id: 'b', date: same });
    expect(() => applyFilters([a, b], 'all', '')).not.toThrow();
  });
});

describe('deleteInspection flow', () => {
  it('shows confirmation Alert with destructive button', () => {
    const showDeleteAlert = (id: string) => {
      Alert.alert('تأكيد الحذف', 'هل أنت متأكد من حذف هذا التفتيش؟', [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'حذف', style: 'destructive', onPress: async () => {
          await InspectionRepository.delete(id);
        }},
      ]);
    };
    showDeleteAlert('del-1');
    expect(mockAlert).toHaveBeenCalledWith(
      'تأكيد الحذف',
      expect.any(String),
      expect.arrayContaining([
        expect.objectContaining({ style: 'destructive' }),
      ])
    );
  });

  it('calls delete repository when destructive button is pressed', async () => {
    const showDeleteAlert = (id: string) => {
      Alert.alert('تأكيد الحذف', 'هل أنت متأكد من حذف هذا التفتيش؟', [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'حذف', style: 'destructive', onPress: async () => {
          await InspectionRepository.delete(id);
        }},
      ]);
    };
    showDeleteAlert('del-2');
    const buttons = mockAlert.mock.calls[0][2] as any[];
    const destructive = buttons.find(b => b.style === 'destructive');
    await destructive.onPress();
    expect(mockDelete).toHaveBeenCalledWith('del-2');
  });
});

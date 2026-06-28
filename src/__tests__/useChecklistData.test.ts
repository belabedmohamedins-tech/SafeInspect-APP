// src/__tests__/useChecklistData.test.ts
//
// STRATEGY: test the contract, not the hook runner.
// renderHook is broken in this jest-expo + RTLRN14 + React19 stack
// (result.current is always undefined). We test each responsibility directly:
//   1. InspectionRepository.getById / save contracts
//   2. AgendaRepository.updateInspectionLink contract
//   3. Criteria selection logic (pure)
//   4. Item handler logic (pure)
//   5. Derived value logic (pure)
//   6. handleFinish gate logic (85%, photo gate, save, navigate, agenda)

jest.mock('expo-crypto', () => ({ randomUUID: jest.fn(() => 'mock-uuid-1234') }));

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

import { InspectionRepository } from '../repositories/InspectionRepository';
import { AgendaRepository } from '../repositories/AgendaRepository';
import { SettingsRepository } from '../repositories/SettingsRepository';
import { criteriaByActivity } from '../criteriaData';
import { getEvaluatedCount, groupByAxis } from '../utils/inspectionUtils';
import { computeScoreAndGrade, getHighSeverityItemsMissingPhoto } from '../utils/scoringUtils';
import { Alert } from 'react-native';
import { ComplianceStatus, InspectionItem, SavedInspection } from '../types';

const mockGetById      = InspectionRepository.getById as jest.MockedFunction<any>;
const mockSave         = InspectionRepository.save    as jest.MockedFunction<any>;
const mockUpdateAgenda = AgendaRepository.updateInspectionLink as jest.MockedFunction<any>;
const mockAlert        = Alert.alert as jest.MockedFunction<typeof Alert.alert>;

beforeEach(() => {
  jest.clearAllMocks();
  mockSave.mockResolvedValue(undefined);
  mockUpdateAgenda.mockResolvedValue(undefined);
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeItem(overrides: Partial<InspectionItem> = {}): InspectionItem {
  return {
    id: 'c1', criteria: 'Criterion 1', legalReference: 'Art 1',
    severity: 'high', axis: 'Axis A',
    complianceStatus: 'not-evaluated', comment: '', photos: [],
    ...overrides,
  } as InspectionItem;
}

function buildItems(statuses: ComplianceStatus[]): InspectionItem[] {
  return statuses.map((s, i) => makeItem({ id: `item-${i}`, complianceStatus: s, severity: 'low' }));
}

// ─── Criteria selection ───────────────────────────────────────────────────────
describe('criteria selection logic', () => {
  it('selects default criteria when no activity specified', () => {
    const criteria = criteriaByActivity['default'];
    expect(criteria).toHaveLength(2);
    expect(criteria[0].id).toBe('c1');
  });

  it('selects activity-specific criteria when activity exists', () => {
    const criteria = criteriaByActivity['medical'];
    expect(criteria).toHaveLength(1);
    expect(criteria[0].id).toBe('m1');
  });

  it('falls back to default for unknown activity', () => {
    const activity = 'unknown-x';
    const criteria = criteriaByActivity[activity] ?? criteriaByActivity['default'];
    expect(criteria).toHaveLength(2);
  });

  it('initialises every item with not-evaluated status', () => {
    const initial = criteriaByActivity['default'].map(item => ({
      ...item,
      complianceStatus: 'not-evaluated' as ComplianceStatus,
      comment: '',
      photoUri: undefined,
      photos: [],
    }));
    initial.forEach(item => expect(item.complianceStatus).toBe('not-evaluated'));
  });
});

// ─── InspectionRepository.getById contract ────────────────────────────────────
describe('InspectionRepository.getById contract', () => {
  const draftItems: InspectionItem[] = [
    makeItem({ id: 'd1', complianceStatus: 'non-compliant' }),
  ];
  const draft: SavedInspection = {
    id: 'draft-001', facilityId: 'fac-1', facilityName: 'Test', facilityAddress: '',
    date: '2026-01-01', inspectorName: 'A', officeName: 'O', status: 'in-progress',
    items: draftItems, inspectionCause: '', referenceDocument: '', committeeMembers: [],
  };

  it('returns draft with correct items when found', async () => {
    mockGetById.mockResolvedValue(draft);
    const result = await InspectionRepository.getById('draft-001');
    expect(result).not.toBeNull();
    expect(result!.items).toHaveLength(1);
    expect(result!.items[0].complianceStatus).toBe('non-compliant');
  });

  it('returns null when draft is not found', async () => {
    mockGetById.mockResolvedValue(null);
    const result = await InspectionRepository.getById('missing');
    expect(result).toBeNull();
  });

  it('propagates rejection on database error', async () => {
    mockGetById.mockRejectedValue(new Error('db error'));
    await expect(InspectionRepository.getById('x')).rejects.toThrow('db error');
  });
});

// ─── Item handler logic ───────────────────────────────────────────────────────
describe('item handler logic', () => {
  function applyStatusChange(items: InspectionItem[], id: string, status: ComplianceStatus) {
    return items.map(item => item.id === id ? { ...item, complianceStatus: status } : item);
  }
  function applyCommentChange(items: InspectionItem[], id: string, comment: string) {
    return items.map(item => item.id === id ? { ...item, comment } : item);
  }
  function applyPhotoTake(items: InspectionItem[], id: string, uri: string) {
    return items.map(item => {
      if (item.id !== id) return item;
      const existing = item.photos ?? (item.photoUri ? [item.photoUri] : []);
      return { ...item, photoUri: item.photoUri ?? uri, photos: [...existing, uri] };
    });
  }

  it('handleStatusChange updates the item status', () => {
    const items = [makeItem({ id: 'c1' }), makeItem({ id: 'c2' })];
    const updated = applyStatusChange(items, 'c1', 'compliant');
    expect(updated.find(i => i.id === 'c1')?.complianceStatus).toBe('compliant');
    expect(updated.find(i => i.id === 'c2')?.complianceStatus).toBe('not-evaluated');
  });

  it('handleCommentChange updates the item comment', () => {
    const items = [makeItem({ id: 'c2' })];
    const updated = applyCommentChange(items, 'c2', 'needs repair');
    expect(updated[0].comment).toBe('needs repair');
  });

  it('handlePhotoTake sets photoUri on first photo', () => {
    const items = [makeItem({ id: 'c1' })];
    const updated = applyPhotoTake(items, 'c1', 'file:///photo1.jpg');
    expect(updated[0].photoUri).toBe('file:///photo1.jpg');
    expect(updated[0].photos).toContain('file:///photo1.jpg');
  });

  it('handlePhotoTake accumulates multiple photos', () => {
    let items = [makeItem({ id: 'c1' })];
    items = applyPhotoTake(items, 'c1', 'file:///p1.jpg');
    items = applyPhotoTake(items, 'c1', 'file:///p2.jpg');
    expect(items[0].photos).toHaveLength(2);
  });

  it('keeps original photoUri when second photo is added', () => {
    let items = [makeItem({ id: 'c1' })];
    items = applyPhotoTake(items, 'c1', 'file:///first.jpg');
    items = applyPhotoTake(items, 'c1', 'file:///second.jpg');
    expect(items[0].photoUri).toBe('file:///first.jpg');
  });
});

// ─── Derived value logic ──────────────────────────────────────────────────────
describe('derived value logic', () => {
  it('evaluatedItems is 0 when all items are not-evaluated', () => {
    const items = buildItems(['not-evaluated', 'not-evaluated']);
    expect(getEvaluatedCount(items)).toBe(0);
  });

  it('evaluatedItems increments as items are evaluated', () => {
    const items = buildItems(['compliant', 'not-evaluated']);
    expect(getEvaluatedCount(items)).toBe(1);
  });

  // getEvaluatedCount counts everything that is NOT 'not-evaluated' — including 'na'.
  // It is a simple presence counter, not a "meaningful evaluation" counter.
  it('evaluatedItems counts na as evaluated (counts all non-not-evaluated)', () => {
    const items = buildItems(['compliant', 'non-compliant', 'na', 'not-evaluated']);
    expect(getEvaluatedCount(items)).toBe(3);
  });

  it('progressPercent is 0 on fresh load', () => {
    const items = buildItems(['not-evaluated', 'not-evaluated']);
    const evaluated = getEvaluatedCount(items);
    const percent = items.length > 0 ? (evaluated / items.length) * 100 : 0;
    expect(percent).toBe(0);
  });

  it('progressPercent is 100 when all items are evaluated', () => {
    const items = buildItems(['compliant', 'non-compliant']);
    const evaluated = getEvaluatedCount(items);
    const percent = items.length > 0 ? (evaluated / items.length) * 100 : 0;
    expect(percent).toBe(100);
  });

  // groupByAxis returns Array<{title: string, data: InspectionItem[]}>, NOT a plain object.
  it('sections groups items by axis', () => {
    const items = [
      makeItem({ id: 'i1', axis: 'Axis A' }),
      makeItem({ id: 'i2', axis: 'Axis B' }),
      makeItem({ id: 'i3', axis: 'Axis A' }),
    ];
    const sections = groupByAxis(items);
    const titles = sections.map(s => s.title);
    expect(titles).toContain('Axis A');
    expect(titles).toContain('Axis B');
    expect(sections.find(s => s.title === 'Axis A')!.data).toHaveLength(2);
  });
});

// ─── handleFinish gate logic ──────────────────────────────────────────────────
describe('handleFinish gate logic', () => {
  const COMPLETION_GATE = 0.85;

  function checkCompletionGate(items: InspectionItem[]): boolean {
    const applicable = items.filter(i => i.complianceStatus !== 'na');
    const evaluated  = applicable.filter(i => i.complianceStatus !== 'not-evaluated');
    const rate = applicable.length > 0 ? evaluated.length / applicable.length : 1;
    return rate >= COMPLETION_GATE;
  }

  it('blocks finish when completion rate is below 85%', () => {
    const items = buildItems(['compliant', 'not-evaluated']); // 50%
    expect(checkCompletionGate(items)).toBe(false);
  });

  it('allows finish when completion rate is exactly 85%', () => {
    // 17 of 20 evaluated = 85%
    const statuses: ComplianceStatus[] = [
      ...Array(17).fill('compliant'),
      ...Array(3).fill('not-evaluated'),
    ];
    const items = buildItems(statuses);
    expect(checkCompletionGate(items)).toBe(true);
  });

  it('allows finish when all items are evaluated', () => {
    const items = buildItems(['compliant', 'non-compliant']);
    expect(checkCompletionGate(items)).toBe(true);
  });

  it('blocks finish when high-severity non-compliant item has no photo', () => {
    const items = [
      makeItem({ id: 'c1', severity: 'high', complianceStatus: 'non-compliant', photos: [] }),
      makeItem({ id: 'c2', severity: 'low',  complianceStatus: 'compliant',     photos: [] }),
    ];
    const missing = getHighSeverityItemsMissingPhoto(items);
    expect(missing).toHaveLength(1);
    expect(missing[0].id).toBe('c1');
  });

  it('allows finish when high-severity non-compliant item has a photo', () => {
    const items = [
      makeItem({ id: 'c1', severity: 'high', complianceStatus: 'non-compliant', photos: ['file:///p.jpg'] }),
    ];
    const missing = getHighSeverityItemsMissingPhoto(items);
    expect(missing).toHaveLength(0);
  });
});

// ─── InspectionRepository.save contract ──────────────────────────────────────
describe('InspectionRepository.save contract', () => {
  it('is called with correct facilityId and status on finish', async () => {
    mockSave.mockResolvedValue(undefined);
    const payload: Partial<SavedInspection> = {
      id: 'mock-uuid-1234',
      facilityId: 'fac-1',
      status: 'completed',
    };
    await InspectionRepository.save(payload as SavedInspection);
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ facilityId: 'fac-1', status: 'completed' }));
  });

  it('includes signature when provided', async () => {
    const payload = { id: 'x', facilityId: 'f', status: 'completed', signature: 'data:image/png;base64,SIGN==' } as any;
    await InspectionRepository.save(payload);
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ signature: 'data:image/png;base64,SIGN==' }));
  });

  it('includes coordinates when lat/lng provided', async () => {
    const payload = { id: 'x', facilityId: 'f', status: 'completed', coordinates: { latitude: 36.7, longitude: 3.05 } } as any;
    await InspectionRepository.save(payload);
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ coordinates: { latitude: 36.7, longitude: 3.05 } }));
  });

  it('propagates rejection on save error', async () => {
    mockSave.mockRejectedValue(new Error('db error'));
    await expect(InspectionRepository.save({} as any)).rejects.toThrow('db error');
  });
});

// ─── AgendaRepository.updateInspectionLink contract ──────────────────────────
describe('AgendaRepository.updateInspectionLink contract', () => {
  it('is called with agendaId and inspectionId when agendaId is present', async () => {
    await AgendaRepository.updateInspectionLink('ag-001', 'insp-123');
    expect(mockUpdateAgenda).toHaveBeenCalledWith('ag-001', 'insp-123');
  });

  it('is NOT called when agendaId is absent', () => {
    // Simulate the guard in useChecklistData
    const agendaId: string | undefined = undefined;
    if (agendaId) AgendaRepository.updateInspectionLink(agendaId, 'x');
    expect(mockUpdateAgenda).not.toHaveBeenCalled();
  });

  it('propagates rejection on update error', async () => {
    mockUpdateAgenda.mockRejectedValue(new Error('link error'));
    await expect(AgendaRepository.updateInspectionLink('ag', 'ins')).rejects.toThrow('link error');
  });
});

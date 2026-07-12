// __tests__/services/briefService.test.ts
import { buildBrief } from '../../src/services/briefService';
import { SavedInspection, InspectionItem } from '../../src/types';

jest.mock('../../src/repositories/InspectionRepository', () => ({
  InspectionRepository: { getCompleted: jest.fn() },
}));

import { InspectionRepository } from '../../src/repositories/InspectionRepository';
const mockGetCompleted = InspectionRepository.getCompleted as jest.Mock;

// ── Helpers ──────────────────────────────────────────────────────────────────
const makeItem = (
  status: InspectionItem['complianceStatus'],
  severity: string = 'medium',
  id = Math.random().toString()
): InspectionItem =>
  ({ id, complianceStatus: status, severity, criteria: 'test' } as unknown as InspectionItem);

const makeInspection = (overrides: Partial<SavedInspection> = {}): SavedInspection =>
  ({
    id: 'insp-1',
    facilityId: 'fac-1',
    facilityName: 'Test Facility',
    facilityAddress: '',
    date: '2026-01-15',
    status: 'completed',
    inspectorName: 'Ahmed',
    grade: 'B',
    score: 80,
    items: [],
    ...overrides,
  } as unknown as SavedInspection);

beforeEach(() => jest.clearAllMocks());

// ── no inspections ────────────────────────────────────────────────────────────────
describe('buildBrief – no inspections', () => {
  it('returns null brief when repository is empty', async () => {
    mockGetCompleted.mockResolvedValue([]);
    const result = await buildBrief('fac-1');
    expect(result).toEqual({
      lastInspection: null,
      topViolations: [],
      previousGrade: null,
      previousScore: null,
      previousDate: null,
      previousInspectorName: null,
    });
  });

  it('returns null brief when no inspections match facilityId', async () => {
    mockGetCompleted.mockResolvedValue([makeInspection({ facilityId: 'other' })]);
    const result = await buildBrief('fac-1');
    expect(result.lastInspection).toBeNull();
    expect(result.topViolations).toHaveLength(0);
  });
});

// ── with inspection data ─────────────────────────────────────────────────────────
describe('buildBrief – with inspection data', () => {
  it('picks the most recent inspection (sorted by date desc)', async () => {
    const older = makeInspection({ id: 'old', date: '2025-01-01', grade: 'C', score: 60 });
    const newer = makeInspection({ id: 'new', date: '2026-06-01', grade: 'A', score: 95 });
    mockGetCompleted.mockResolvedValue([older, newer]);
    const result = await buildBrief('fac-1');
    expect(result.lastInspection!.id).toBe('new');
  });

  it('returns grade, score, date, inspectorName from last inspection', async () => {
    mockGetCompleted.mockResolvedValue([
      makeInspection({ grade: 'B', score: 75, date: '2026-03-10', inspectorName: 'Mohamed' }),
    ]);
    const result = await buildBrief('fac-1');
    expect(result.previousGrade).toBe('B');
    expect(result.previousScore).toBe(75);
    expect(result.previousDate).toBe('2026-03-10');
    expect(result.previousInspectorName).toBe('Mohamed');
  });

  it('grade/score are null when absent from inspection', async () => {
    const ins = makeInspection();
    delete (ins as any).grade;
    delete (ins as any).score;
    mockGetCompleted.mockResolvedValue([ins]);
    const result = await buildBrief('fac-1');
    expect(result.previousGrade).toBeNull();
    expect(result.previousScore).toBeNull();
  });

  it('topViolations: only non-compliant items, max 3, sorted by severity', async () => {
    const items: InspectionItem[] = [
      makeItem('compliant', 'high', 'c1'),
      makeItem('non-compliant', 'low',    'v1'),
      makeItem('non-compliant', 'high',   'v2'),
      makeItem('non-compliant', 'medium', 'v3'),
      makeItem('non-compliant', 'low',    'v4'),
    ];
    mockGetCompleted.mockResolvedValue([makeInspection({ items })]);
    const result = await buildBrief('fac-1');
    expect(result.topViolations).toHaveLength(3);
    // high(0) < medium(1) < low(2) — first should be high
    expect(result.topViolations[0].id).toBe('v2');
    expect(result.topViolations[1].id).toBe('v3');
  });

  it('topViolations: empty when no non-compliant items', async () => {
    const items = [makeItem('compliant'), makeItem('observation-only')];
    mockGetCompleted.mockResolvedValue([makeInspection({ items })]);
    const result = await buildBrief('fac-1');
    expect(result.topViolations).toHaveLength(0);
  });

  it('topViolations: unknown severity falls back to 3 (last)', async () => {
    const items = [
      makeItem('non-compliant', 'high',    'v1'),
      makeItem('non-compliant', 'unknown', 'v2'),
    ];
    mockGetCompleted.mockResolvedValue([makeInspection({ items })]);
    const result = await buildBrief('fac-1');
    expect(result.topViolations[0].id).toBe('v1'); // high goes first
  });

  it('only uses inspections matching facilityId', async () => {
    const fac1 = makeInspection({ facilityId: 'fac-1', grade: 'A' });
    const fac2 = makeInspection({ facilityId: 'fac-2', grade: 'D', id: 'other' });
    mockGetCompleted.mockResolvedValue([fac1, fac2]);
    const result = await buildBrief('fac-1');
    expect(result.previousGrade).toBe('A');
  });
});

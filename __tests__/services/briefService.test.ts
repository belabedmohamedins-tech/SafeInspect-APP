// __tests__/services/briefService.test.ts
jest.mock('../../src/repositories/InspectionRepository', () => ({
  InspectionRepository: { getCompleted: jest.fn() },
}));

import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import { buildBrief } from '../../src/services/briefService';
import { SavedInspection, InspectionItem } from '../../src/types';

const mockGetCompleted = InspectionRepository.getCompleted as jest.Mock;

function makeItem(id: string, status: 'compliant' | 'non-compliant', severity: string, sanctionTier?: string): InspectionItem {
  return { id, complianceStatus: status, severity, sanctionTier, criteria: `c-${id}` } as unknown as InspectionItem;
}

function makeInspection(overrides: Partial<SavedInspection> = {}): SavedInspection {
  return {
    id: 'insp-1',
    facilityId: 'f1',
    facilityName: 'Facility',
    date: '2026-01-01',
    score: 80,
    grade: 'B',
    status: 'completed',
    items: [],
    inspectorName: 'Inspector A',
    ...overrides,
  } as unknown as SavedInspection;
}

beforeEach(() => jest.clearAllMocks());

describe('buildBrief', () => {
  it('returns nulls when no inspections exist for facility', async () => {
    mockGetCompleted.mockResolvedValue([]);
    const result = await buildBrief('f1');
    expect(result.lastInspection).toBeNull();
    expect(result.topViolations).toEqual([]);
    expect(result.previousGrade).toBeNull();
    expect(result.previousScore).toBeNull();
    expect(result.previousDate).toBeNull();
    expect(result.previousInspectorName).toBeNull();
  });

  it('returns nulls when inspections exist for a different facility', async () => {
    mockGetCompleted.mockResolvedValue([makeInspection({ facilityId: 'f2' })]);
    const result = await buildBrief('f1');
    expect(result.lastInspection).toBeNull();
  });

  it('returns the most recent inspection as lastInspection', async () => {
    const old = makeInspection({ id: 'insp-old', date: '2025-01-01' });
    const recent = makeInspection({ id: 'insp-new', date: '2026-06-01' });
    mockGetCompleted.mockResolvedValue([old, recent]);
    const result = await buildBrief('f1');
    expect(result.lastInspection!.id).toBe('insp-new');
  });

  it('returns top 3 non-compliant items sorted by severity', async () => {
    const items = [
      makeItem('i1', 'non-compliant', 'low'),
      makeItem('i2', 'non-compliant', 'high'),
      makeItem('i3', 'non-compliant', 'medium'),
      makeItem('i4', 'non-compliant', 'low'),
      makeItem('i5', 'compliant', 'high'),
    ];
    mockGetCompleted.mockResolvedValue([makeInspection({ items })]);
    const result = await buildBrief('f1');
    expect(result.topViolations).toHaveLength(3);
    expect(result.topViolations[0].id).toBe('i2'); // high first
    expect(result.topViolations[1].id).toBe('i3'); // medium
  });

  it('excludes compliant items from topViolations', async () => {
    const items = [makeItem('i1', 'compliant', 'high'), makeItem('i2', 'compliant', 'medium')];
    mockGetCompleted.mockResolvedValue([makeInspection({ items })]);
    const result = await buildBrief('f1');
    expect(result.topViolations).toHaveLength(0);
  });

  it('maps previousGrade, previousScore, previousDate, previousInspectorName', async () => {
    mockGetCompleted.mockResolvedValue([makeInspection({ grade: 'A', score: 95, date: '2026-03-01', inspectorName: 'Ahmed' })]);
    const result = await buildBrief('f1');
    expect(result.previousGrade).toBe('A');
    expect(result.previousScore).toBe(95);
    expect(result.previousDate).toBe('2026-03-01');
    expect(result.previousInspectorName).toBe('Ahmed');
  });

  it('returns null grade/score when undefined on inspection', async () => {
    const insp = makeInspection();
    delete (insp as any).grade;
    delete (insp as any).score;
    mockGetCompleted.mockResolvedValue([insp]);
    const result = await buildBrief('f1');
    expect(result.previousGrade).toBeNull();
    expect(result.previousScore).toBeNull();
  });
});

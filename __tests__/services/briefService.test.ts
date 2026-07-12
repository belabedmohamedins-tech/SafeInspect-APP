// __tests__/services/briefService.test.ts
jest.mock('../../src/repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getCompleted: jest.fn(),
  },
}));

import { buildBrief } from '../../src/services/briefService';
import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import { SavedInspection, InspectionItem } from '../../src/types';

const mockGetCompleted = InspectionRepository.getCompleted as jest.Mock;

function makeItem(id: string, status: string, severity: string): InspectionItem {
  return { id, complianceStatus: status, severity, criteria: id } as InspectionItem;
}

function makeInspection(overrides: Partial<SavedInspection> = {}): SavedInspection {
  return {
    id: 'ins1', facilityId: 'f1', facilityName: 'F', date: '2026-01-01',
    grade: 'B', score: 75, items: [], status: 'completed',
    inspectorName: 'Ali', ...overrides,
  } as SavedInspection;
}

beforeEach(() => jest.clearAllMocks());

describe('buildBrief', () => {
  it('returns null brief when no inspections for facility', async () => {
    mockGetCompleted.mockResolvedValue([]);
    const r = await buildBrief('f1');
    expect(r.lastInspection).toBeNull();
    expect(r.topViolations).toHaveLength(0);
    expect(r.previousGrade).toBeNull();
    expect(r.previousScore).toBeNull();
  });

  it('returns latest inspection sorted by date desc', async () => {
    const old = makeInspection({ id: 'old', date: '2025-01-01', facilityId: 'f1' });
    const latest = makeInspection({ id: 'new', date: '2026-06-01', facilityId: 'f1' });
    mockGetCompleted.mockResolvedValue([old, latest]);
    const r = await buildBrief('f1');
    expect(r.lastInspection?.id).toBe('new');
    expect(r.previousDate).toBe('2026-06-01');
  });

  it('filters out other facilities', async () => {
    mockGetCompleted.mockResolvedValue([makeInspection({ facilityId: 'other' })]);
    const r = await buildBrief('f1');
    expect(r.lastInspection).toBeNull();
  });

  it('returns top 3 non-compliant items sorted by severity', async () => {
    const items = [
      makeItem('l1', 'non-compliant', 'low'),
      makeItem('h1', 'non-compliant', 'high'),
      makeItem('m1', 'non-compliant', 'medium'),
      makeItem('l2', 'non-compliant', 'low'),
      makeItem('ok', 'compliant', 'high'),
    ];
    mockGetCompleted.mockResolvedValue([makeInspection({ items, facilityId: 'f1' })]);
    const r = await buildBrief('f1');
    expect(r.topViolations).toHaveLength(3);
    expect(r.topViolations[0].severity).toBe('high');
    expect(r.topViolations[1].severity).toBe('medium');
  });

  it('exposes grade/score/inspectorName', async () => {
    mockGetCompleted.mockResolvedValue([
      makeInspection({ grade: 'A', score: 95, inspectorName: 'Omar', facilityId: 'f1' }),
    ]);
    const r = await buildBrief('f1');
    expect(r.previousGrade).toBe('A');
    expect(r.previousScore).toBe(95);
    expect(r.previousInspectorName).toBe('Omar');
  });

  // Cover the ?? null branches on lines 36-43
  it('previousGrade is null when grade is undefined', async () => {
    const ins = makeInspection({ facilityId: 'f1' });
    delete (ins as any).grade;
    mockGetCompleted.mockResolvedValue([ins]);
    const r = await buildBrief('f1');
    expect(r.previousGrade).toBeNull();
  });

  it('previousScore is null when score is undefined', async () => {
    const ins = makeInspection({ facilityId: 'f1' });
    delete (ins as any).score;
    mockGetCompleted.mockResolvedValue([ins]);
    const r = await buildBrief('f1');
    expect(r.previousScore).toBeNull();
  });
});

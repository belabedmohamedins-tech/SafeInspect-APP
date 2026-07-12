// __tests__/utils/statsUtils.test.ts
import { computeStats } from '../../src/utils/statsUtils';
import { SavedInspection } from '../../src/types';

function ins(overrides: Partial<SavedInspection> = {}): SavedInspection {
  return {
    id: 'i1', facilityId: 'f1', facilityName: 'F', date: '2025-01-01',
    items: [], grade: 'A', score: 100, riskLevel: 1, nextInspectionDays: 730,
    violations: { high: 0, medium: 0, low: 0, total: 0 },
    criticalOverride: false, rawGrade: 'A', disclaimer: '',
    evaluatedCount: 0, applicableCount: 0, completionRate: 1, incomplete: false,
    ...overrides,
  } as SavedInspection;
}

describe('computeStats', () => {
  it('empty list → all zeros and N/A', () => {
    const r = computeStats([]);
    expect(r.total).toBe(0);
    expect(r.averageScore).toBe('N/A');
    expect(r.gradeCounts).toEqual({ A: 0, B: 0, C: 0, D: 0 });
    expect(r.totalHighViolations).toBe(0);
    expect(r.criticalOverrideCount).toBe(0);
  });

  it('counts grades A B C D correctly', () => {
    const r = computeStats([
      ins({ grade: 'A' }), ins({ grade: 'B' }),
      ins({ grade: 'C' }), ins({ grade: 'D' }),
      ins({ grade: 'A' }),
    ]);
    expect(r.gradeCounts).toEqual({ A: 2, B: 1, C: 1, D: 1 });
    expect(r.total).toBe(5);
  });

  it('averageScore computed when scores present', () => {
    const r = computeStats([ins({ score: 80 }), ins({ score: 60 })]);
    expect(r.averageScore).toBe('70.0');
  });

  it('averageScore 0.0 when all scores are 0 (not N/A)', () => {
    const r = computeStats([ins({ score: 0 })]);
    expect(r.averageScore).toBe('0.0');
  });

  it('averageScore N/A when no numeric scores', () => {
    const r = computeStats([ins({ score: undefined as any })]);
    expect(r.averageScore).toBe('N/A');
  });

  it('sums totalHighViolations across inspections', () => {
    const r = computeStats([
      ins({ violations: { high: 2, medium: 0, low: 0, total: 2 } }),
      ins({ violations: { high: 3, medium: 1, low: 0, total: 4 } }),
    ]);
    expect(r.totalHighViolations).toBe(5);
  });

  it('violations undefined → no crash, count stays 0', () => {
    const r = computeStats([ins({ violations: undefined as any })]);
    expect(r.totalHighViolations).toBe(0);
  });

  it('counts criticalOverride inspections', () => {
    const r = computeStats([
      ins({ criticalOverride: true }),
      ins({ criticalOverride: false }),
      ins({ criticalOverride: true }),
    ]);
    expect(r.criticalOverrideCount).toBe(2);
  });

  it('lastUpdated is a recent timestamp', () => {
    const before = Date.now();
    const r = computeStats([ins()]);
    expect(r.lastUpdated).toBeGreaterThanOrEqual(before);
  });
});

// __tests__/utils/statsUtils.test.ts
import { computeStats } from '../../src/utils/statsUtils';
import { SavedInspection } from '../../src/types';

function makeInspection(overrides: Partial<SavedInspection> = {}): SavedInspection {
  return {
    id: 'i1',
    grade: 'A',
    score: 90,
    violations: { high: 0 },
    criticalOverride: false,
    ...overrides,
  } as unknown as SavedInspection;
}

describe('computeStats', () => {
  it('returns zeros for empty array', () => {
    const r = computeStats([]);
    expect(r.total).toBe(0);
    expect(r.gradeCounts).toEqual({ A: 0, B: 0, C: 0, D: 0 });
    expect(r.averageScore).toBe('N/A');
    expect(r.totalHighViolations).toBe(0);
    expect(r.criticalOverrideCount).toBe(0);
  });

  it('counts grades correctly', () => {
    const inspections = [
      makeInspection({ grade: 'A' }),
      makeInspection({ grade: 'A' }),
      makeInspection({ grade: 'B' }),
      makeInspection({ grade: 'C' }),
      makeInspection({ grade: 'D' }),
    ];
    const r = computeStats(inspections);
    expect(r.gradeCounts).toEqual({ A: 2, B: 1, C: 1, D: 1 });
    expect(r.total).toBe(5);
  });

  it('computes average score correctly', () => {
    const inspections = [
      makeInspection({ score: 80 }),
      makeInspection({ score: 100 }),
    ];
    const r = computeStats(inspections);
    expect(r.averageScore).toBe('90.0');
  });

  it('returns averageScore=N/A when no inspections have numeric score', () => {
    const r = computeStats([makeInspection({ score: undefined as any })]);
    expect(r.averageScore).toBe('N/A');
  });

  it('returns averageScore=0.0 when all scores are 0', () => {
    const r = computeStats([makeInspection({ score: 0 })]);
    expect(r.averageScore).toBe('0.0');
  });

  it('sums totalHighViolations across inspections', () => {
    const inspections = [
      makeInspection({ violations: { high: 2 } as any }),
      makeInspection({ violations: { high: 3 } as any }),
      makeInspection({ violations: undefined as any }),
    ];
    const r = computeStats(inspections);
    expect(r.totalHighViolations).toBe(5);
  });

  it('counts criticalOverrides', () => {
    const inspections = [
      makeInspection({ criticalOverride: true }),
      makeInspection({ criticalOverride: false }),
      makeInspection({ criticalOverride: true }),
    ];
    const r = computeStats(inspections);
    expect(r.criticalOverrideCount).toBe(2);
  });

  it('sets lastUpdated as a recent timestamp', () => {
    const before = Date.now();
    const r = computeStats([makeInspection()]);
    const after = Date.now();
    expect(r.lastUpdated).toBeGreaterThanOrEqual(before);
    expect(r.lastUpdated).toBeLessThanOrEqual(after);
  });

  it('ignores unknown grade values in grade counts', () => {
    const r = computeStats([makeInspection({ grade: 'X' as any })]);
    expect(r.gradeCounts).toEqual({ A: 0, B: 0, C: 0, D: 0 });
  });
});

// src/__tests__/statsUtils.test.ts
import { computeStats, StatsCache } from '../../src/utils/statsUtils';
import { SavedInspection } from '../../src/types';

function ins(overrides: Partial<SavedInspection> = {}): SavedInspection {
  return {
    id: 'i1', facilityId: 'f1', date: new Date().toISOString(),
    grade: 'A', score: 100, items: [], status: 'completed',
    violations: { high: 0, medium: 0, low: 0, total: 0 },
    criticalOverride: false,
    ...overrides,
  } as unknown as SavedInspection;
}

describe('computeStats', () => {
  it('returns zero stats for empty array', () => {
    const r = computeStats([]);
    expect(r.total).toBe(0);
    expect(r.gradeCounts).toEqual({ A: 0, B: 0, C: 0, D: 0 });
    expect(r.averageScore).toBe('N/A');
    expect(r.totalHighViolations).toBe(0);
    expect(r.criticalOverrideCount).toBe(0);
    expect(typeof r.lastUpdated).toBe('number');
  });

  it('counts grades correctly', () => {
    const data = [
      ins({ grade: 'A', score: 90 }),
      ins({ grade: 'A', score: 85 }),
      ins({ grade: 'B', score: 75 }),
      ins({ grade: 'C', score: 60 }),
      ins({ grade: 'D', score: 30 }),
    ];
    const r = computeStats(data);
    expect(r.gradeCounts).toEqual({ A: 2, B: 1, C: 1, D: 1 });
    expect(r.total).toBe(5);
  });

  it('averageScore is computed correctly', () => {
    const data = [ins({ score: 80 }), ins({ score: 60 })];
    const r = computeStats(data);
    expect(r.averageScore).toBe('70.0');
  });

  it('averageScore is N/A when no numeric scores', () => {
    const data = [ins({ score: undefined as any })];
    const r = computeStats(data);
    expect(r.averageScore).toBe('N/A');
  });

  it('averageScore shows 0.0 when all scores are 0', () => {
    const r = computeStats([ins({ score: 0 })]);
    expect(r.averageScore).toBe('0.0');
  });

  it('sums totalHighViolations across inspections', () => {
    const data = [
      ins({ violations: { high: 2, medium: 0, low: 0, total: 2 } }),
      ins({ violations: { high: 3, medium: 1, low: 0, total: 4 } }),
    ];
    const r = computeStats(data);
    expect(r.totalHighViolations).toBe(5);
  });

  it('counts criticalOverride inspections', () => {
    const data = [
      ins({ criticalOverride: true }),
      ins({ criticalOverride: false }),
      ins({ criticalOverride: true }),
    ];
    const r = computeStats(data);
    expect(r.criticalOverrideCount).toBe(2);
  });

  it('skips high violations when violations field is absent', () => {
    const data = [ins({ violations: undefined as any })];
    const r = computeStats(data);
    expect(r.totalHighViolations).toBe(0);
  });

  it('lastUpdated is close to Date.now()', () => {
    const before = Date.now();
    const r = computeStats([]);
    const after = Date.now();
    expect(r.lastUpdated).toBeGreaterThanOrEqual(before);
    expect(r.lastUpdated).toBeLessThanOrEqual(after);
  });
});

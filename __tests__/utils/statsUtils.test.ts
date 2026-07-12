// __tests__/utils/statsUtils.test.ts
import { computeStats } from '../../src/utils/statsUtils';
import { SavedInspection } from '../../src/types';

function ins(overrides: Partial<SavedInspection>): SavedInspection {
  return { id: 'i', facilityId: 'f', date: '2026-01-01', items: [], ...overrides } as SavedInspection;
}

describe('computeStats', () => {
  it('empty array → zeros and N/A', () => {
    const r = computeStats([]);
    expect(r.total).toBe(0);
    expect(r.averageScore).toBe('N/A');
    expect(r.totalHighViolations).toBe(0);
    expect(r.criticalOverrideCount).toBe(0);
    expect(r.gradeCounts).toEqual({ A: 0, B: 0, C: 0, D: 0 });
  });

  it('counts grades correctly', () => {
    const r = computeStats([
      ins({ grade: 'A' }), ins({ grade: 'A' }),
      ins({ grade: 'B' }),
      ins({ grade: 'C' }),
      ins({ grade: 'D' }),
    ]);
    expect(r.gradeCounts).toEqual({ A: 2, B: 1, C: 1, D: 1 });
    expect(r.total).toBe(5);
  });

  it('averageScore computed correctly', () => {
    const r = computeStats([ins({ score: 80 }), ins({ score: 60 })]);
    expect(r.averageScore).toBe('70.0');
  });

  it('score of 0 shows 0.0 not N/A', () => {
    const r = computeStats([ins({ score: 0 })]);
    expect(r.averageScore).toBe('0.0');
  });

  it('skips non-numeric scores', () => {
    const r = computeStats([ins({ score: undefined as any })]);
    expect(r.averageScore).toBe('N/A');
  });

  it('totalHighViolations summed across inspections', () => {
    const r = computeStats([
      ins({ violations: { high: 2 } as any }),
      ins({ violations: { high: 3 } as any }),
    ]);
    expect(r.totalHighViolations).toBe(5);
  });

  it('criticalOverrideCount counts truthy override flag', () => {
    const r = computeStats([
      ins({ criticalOverride: true } as any),
      ins({ criticalOverride: false } as any),
      ins({ criticalOverride: true } as any),
    ]);
    expect(r.criticalOverrideCount).toBe(2);
  });

  it('lastUpdated is a recent timestamp', () => {
    const before = Date.now();
    const r = computeStats([ins({ grade: 'A' })]);
    expect(r.lastUpdated).toBeGreaterThanOrEqual(before);
  });
});

// __tests__/utils/statsUtils.test.ts
import { computeStats, StatsCache } from '../../src/utils/statsUtils';
import { SavedInspection } from '../../src/types';

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeInspection = (
  id: string,
  grade: SavedInspection['grade'],
  score: number | undefined,
  highViolations = 0,
  criticalOverride = false,
): SavedInspection =>
  ({
    id,
    grade,
    score,
    violations: { high: highViolations, medium: 0, low: 0, total: highViolations },
    criticalOverride,
  } as unknown as SavedInspection);

// ── Empty input ───────────────────────────────────────────────────────────────
describe('computeStats – empty input', () => {
  it('returns zeros and N/A average for empty array', () => {
    const result = computeStats([]);
    expect(result.total).toBe(0);
    expect(result.gradeCounts).toEqual({ A: 0, B: 0, C: 0, D: 0 });
    expect(result.averageScore).toBe('N/A');
    expect(result.totalHighViolations).toBe(0);
    expect(result.criticalOverrideCount).toBe(0);
  });

  it('sets lastUpdated to a recent timestamp', () => {
    const before = Date.now();
    const result = computeStats([]);
    const after  = Date.now();
    expect(result.lastUpdated).toBeGreaterThanOrEqual(before);
    expect(result.lastUpdated).toBeLessThanOrEqual(after);
  });
});

// ── Grade counting ────────────────────────────────────────────────────────────
describe('computeStats – grade counting', () => {
  it('counts each grade correctly', () => {
    const inspections = [
      makeInspection('1', 'A', 90),
      makeInspection('2', 'A', 88),
      makeInspection('3', 'B', 75),
      makeInspection('4', 'C', 55),
      makeInspection('5', 'D', 30),
      makeInspection('6', 'D', 20),
    ];
    const result = computeStats(inspections);
    expect(result.gradeCounts.A).toBe(2);
    expect(result.gradeCounts.B).toBe(1);
    expect(result.gradeCounts.C).toBe(1);
    expect(result.gradeCounts.D).toBe(2);
    expect(result.total).toBe(6);
  });

  it('handles all same grade', () => {
    const inspections = [
      makeInspection('a', 'B', 72),
      makeInspection('b', 'B', 74),
      makeInspection('c', 'B', 78),
    ];
    const result = computeStats(inspections);
    expect(result.gradeCounts.B).toBe(3);
    expect(result.gradeCounts.A).toBe(0);
    expect(result.gradeCounts.C).toBe(0);
    expect(result.gradeCounts.D).toBe(0);
  });
});

// ── Average score ─────────────────────────────────────────────────────────────
describe('computeStats – averageScore', () => {
  it('returns formatted average when scores present', () => {
    const inspections = [
      makeInspection('1', 'A', 90),
      makeInspection('2', 'B', 70),
    ];
    const result = computeStats(inspections);
    expect(result.averageScore).toBe('80.0');
  });

  it('returns N/A when all scores are undefined', () => {
    const inspections = [
      makeInspection('1', 'A', undefined),
      makeInspection('2', 'B', undefined),
    ];
    const result = computeStats(inspections);
    expect(result.averageScore).toBe('N/A');
  });

  it('skips undefined scores when computing average', () => {
    const inspections = [
      makeInspection('1', 'A', 100),
      makeInspection('2', 'B', undefined),
      makeInspection('3', 'C', 60),
    ];
    const result = computeStats(inspections);
    // average of 100 and 60 only = 80.0
    expect(result.averageScore).toBe('80.0');
  });

  it('returns 0.0 when all scores are 0', () => {
    const inspections = [
      makeInspection('1', 'D', 0),
      makeInspection('2', 'D', 0),
    ];
    const result = computeStats(inspections);
    expect(result.averageScore).toBe('0.0');
  });
});

// ── High violations & critical override ──────────────────────────────────────
describe('computeStats – violations and criticalOverride', () => {
  it('sums totalHighViolations across all inspections', () => {
    const inspections = [
      makeInspection('1', 'D', 30, 3),
      makeInspection('2', 'C', 55, 1),
      makeInspection('3', 'A', 90, 0),
    ];
    const result = computeStats(inspections);
    expect(result.totalHighViolations).toBe(4);
  });

  it('counts criticalOverrideCount correctly', () => {
    const inspections = [
      makeInspection('1', 'D', 85, 3, true),
      makeInspection('2', 'C', 90, 1, true),
      makeInspection('3', 'A', 90, 0, false),
    ];
    const result = computeStats(inspections);
    expect(result.criticalOverrideCount).toBe(2);
  });

  it('returns 0 when no inspections have violations', () => {
    const inspections = [
      makeInspection('1', 'A', 95, 0),
      makeInspection('2', 'A', 88, 0),
    ];
    const result = computeStats(inspections);
    expect(result.totalHighViolations).toBe(0);
    expect(result.criticalOverrideCount).toBe(0);
  });

  it('handles missing violations object gracefully', () => {
    const ins = { id: 'x', grade: 'A', score: 90 } as unknown as SavedInspection;
    expect(() => computeStats([ins])).not.toThrow();
  });
});

// ── Return shape ──────────────────────────────────────────────────────────────
describe('computeStats – return shape', () => {
  it('always returns a valid StatsCache object', () => {
    const result = computeStats([makeInspection('1', 'A', 90)]);
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('gradeCounts');
    expect(result).toHaveProperty('averageScore');
    expect(result).toHaveProperty('totalHighViolations');
    expect(result).toHaveProperty('criticalOverrideCount');
    expect(result).toHaveProperty('lastUpdated');
  });
});

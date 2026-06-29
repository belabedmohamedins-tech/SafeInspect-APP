// src/__tests__/statsUtils.test.ts

import { SavedInspection } from '../types';
import { StatsCache, computeStats } from '../utils/statsUtils';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeInspection(
  overrides: Partial<SavedInspection> = {}
): SavedInspection {
  return {
    id: Math.random().toString(36).slice(2),
    facilityId: 'fac-1',
    facilityName: 'Test Facility',
    facilityAddress: '1 Test St',
    date: new Date().toISOString(),
    inspectorName: 'Inspector',
    items: [],
    status: 'completed',
    ...overrides,
  };
}

// ── Empty input ───────────────────────────────────────────────────────────────

describe('computeStats — empty input', () => {
  let result: StatsCache;
  beforeAll(() => { result = computeStats([]); });

  it('total is 0', () => expect(result.total).toBe(0));
  it('all gradeCounts are 0', () => {
    expect(result.gradeCounts).toEqual({ A: 0, B: 0, C: 0, D: 0 });
  });
  it('averageScore is N/A', () => expect(result.averageScore).toBe('N/A'));
  it('totalHighViolations is 0', () => expect(result.totalHighViolations).toBe(0));
  it('criticalOverrideCount is 0', () => expect(result.criticalOverrideCount).toBe(0));
  it('lastUpdated is a recent timestamp', () => {
    expect(result.lastUpdated).toBeGreaterThan(Date.now() - 1000);
  });
});

// ── Grade counts ──────────────────────────────────────────────────────────────

describe('computeStats — grade distribution', () => {
  it('counts each grade correctly', () => {
    const inspections = [
      makeInspection({ grade: 'A' }),
      makeInspection({ grade: 'A' }),
      makeInspection({ grade: 'B' }),
      makeInspection({ grade: 'C' }),
      makeInspection({ grade: 'C' }),
      makeInspection({ grade: 'C' }),
      makeInspection({ grade: 'D' }),
    ];
    const r = computeStats(inspections);
    expect(r.gradeCounts).toEqual({ A: 2, B: 1, C: 3, D: 1 });
    expect(r.total).toBe(7);
  });

  it('ignores inspections with no grade', () => {
    const r = computeStats([
      makeInspection({ grade: 'A' }),
      makeInspection({ grade: undefined }),
      makeInspection({ grade: undefined }),
    ]);
    expect(r.gradeCounts.A).toBe(1);
    expect(r.gradeCounts.B).toBe(0);
    expect(r.total).toBe(3);
  });
});

// ── Average score ─────────────────────────────────────────────────────────────

describe('computeStats — averageScore', () => {
  it('computes the average across scored inspections', () => {
    const r = computeStats([
      makeInspection({ score: 90 }),
      makeInspection({ score: 70 }),
      makeInspection({ score: 80 }),
    ]);
    expect(r.averageScore).toBe('80.0');
  });

  it('returns N/A when no inspection has a score', () => {
    const r = computeStats([
      makeInspection({ score: undefined }),
      makeInspection({ score: undefined }),
    ]);
    expect(r.averageScore).toBe('N/A');
  });

  it('includes only numeric scores — skips undefined', () => {
    const r = computeStats([
      makeInspection({ score: 100 }),
      makeInspection({ score: undefined }),
      makeInspection({ score: 60 }),
    ]);
    // avg of 100 and 60 = 80
    expect(r.averageScore).toBe('80.0');
  });

  it('displays 0.0 (not N/A) when genuine average is zero', () => {
    const r = computeStats([
      makeInspection({ score: 0 }),
      makeInspection({ score: 0 }),
    ]);
    expect(r.averageScore).toBe('0.0');
  });

  it('formats to 1 decimal place', () => {
    const r = computeStats([
      makeInspection({ score: 100 }),
      makeInspection({ score: 75 }),
    ]);
    expect(r.averageScore).toMatch(/^\d+\.\d$/);
  });
});

// ── totalHighViolations ───────────────────────────────────────────────────────

describe('computeStats — totalHighViolations', () => {
  it('sums high violations across all inspections', () => {
    const r = computeStats([
      makeInspection({ violations: { high: 2, medium: 1, low: 3, total: 6 } }),
      makeInspection({ violations: { high: 1, medium: 0, low: 0, total: 1 } }),
      makeInspection({ violations: { high: 0, medium: 4, low: 2, total: 6 } }),
    ]);
    expect(r.totalHighViolations).toBe(3);
  });

  it('is 0 when no inspections have violations', () => {
    const r = computeStats([
      makeInspection({ violations: undefined }),
      makeInspection({ violations: { high: 0, medium: 0, low: 0, total: 0 } }),
    ]);
    expect(r.totalHighViolations).toBe(0);
  });

  it('does not count medium or low violations toward totalHighViolations', () => {
    const r = computeStats([
      makeInspection({ violations: { high: 0, medium: 5, low: 10, total: 15 } }),
    ]);
    expect(r.totalHighViolations).toBe(0);
  });
});

// ── criticalOverrideCount ─────────────────────────────────────────────────────

describe('computeStats — criticalOverrideCount', () => {
  it('counts inspections where criticalOverride is true', () => {
    const r = computeStats([
      makeInspection({ criticalOverride: true }),
      makeInspection({ criticalOverride: true }),
      makeInspection({ criticalOverride: false }),
      makeInspection({ criticalOverride: undefined }),
    ]);
    expect(r.criticalOverrideCount).toBe(2);
  });

  it('is 0 when no inspections had an override', () => {
    const r = computeStats([
      makeInspection({ criticalOverride: false }),
      makeInspection({ criticalOverride: undefined }),
    ]);
    expect(r.criticalOverrideCount).toBe(0);
  });
});

// ── lastUpdated ───────────────────────────────────────────────────────────────

describe('computeStats — lastUpdated', () => {
  it('returns a timestamp close to now', () => {
    const before = Date.now();
    const r = computeStats([makeInspection()]);
    const after = Date.now();
    expect(r.lastUpdated).toBeGreaterThanOrEqual(before);
    expect(r.lastUpdated).toBeLessThanOrEqual(after);
  });
});

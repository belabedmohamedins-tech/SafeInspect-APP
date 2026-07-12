// __tests__/utils/statsUtils.test.ts
//
// Full coverage for src/utils/statsUtils.ts
// Pure TS — no mocks needed (Date.now() used only for lastUpdated, not asserted exactly).
// Covers: computeStats — all branches of grade, score, violations, criticalOverride.

import { computeStats } from '../../src/utils/statsUtils';
import { SavedInspection } from '../../src/types';

// ── Fixture builder ──────────────────────────────────────────────────────────

function makeInspection(
  id: string,
  overrides: Partial<SavedInspection> = {},
): SavedInspection {
  return {
    id,
    facilityId: 'fac-1',
    facilityName: 'Test Facility',
    facilityAddress: 'Addr',
    date: '2026-07-01',
    inspectorName: 'Inspector',
    items: [],
    status: 'completed',
    ...overrides,
  };
}

// ── computeStats ─────────────────────────────────────────────────────────────

describe('computeStats', () => {
  it('returns zero-state for empty array', () => {
    const result = computeStats([]);
    expect(result.total).toBe(0);
    expect(result.gradeCounts).toEqual({ A: 0, B: 0, C: 0, D: 0 });
    expect(result.averageScore).toBe('N/A');
    expect(result.totalHighViolations).toBe(0);
    expect(result.criticalOverrideCount).toBe(0);
  });

  // ── grade counting ──────────────────────────────────────────────────────

  it('counts grade A correctly', () => {
    const result = computeStats([makeInspection('1', { grade: 'A' })]);
    expect(result.gradeCounts.A).toBe(1);
    expect(result.gradeCounts.B).toBe(0);
  });

  it('counts grade B correctly', () => {
    const result = computeStats([makeInspection('1', { grade: 'B' })]);
    expect(result.gradeCounts.B).toBe(1);
  });

  it('counts grade C correctly', () => {
    const result = computeStats([makeInspection('1', { grade: 'C' })]);
    expect(result.gradeCounts.C).toBe(1);
  });

  it('counts grade D correctly', () => {
    const result = computeStats([makeInspection('1', { grade: 'D' })]);
    expect(result.gradeCounts.D).toBe(1);
  });

  it('ignores undefined/unknown grade', () => {
    const result = computeStats([makeInspection('1')]);
    expect(result.gradeCounts).toEqual({ A: 0, B: 0, C: 0, D: 0 });
  });

  it('counts mixed grades correctly', () => {
    const result = computeStats([
      makeInspection('1', { grade: 'A' }),
      makeInspection('2', { grade: 'A' }),
      makeInspection('3', { grade: 'B' }),
      makeInspection('4', { grade: 'D' }),
    ]);
    expect(result.gradeCounts).toEqual({ A: 2, B: 1, C: 0, D: 1 });
  });

  // ── averageScore ────────────────────────────────────────────────────────

  it('returns "N/A" when no inspection has a numeric score', () => {
    const result = computeStats([makeInspection('1')]);
    expect(result.averageScore).toBe('N/A');
  });

  it('returns correct average when all have scores', () => {
    const result = computeStats([
      makeInspection('1', { score: 80 }),
      makeInspection('2', { score: 100 }),
    ]);
    expect(result.averageScore).toBe('90.0');
  });

  it('returns "0.0" when score is 0 (not N/A)', () => {
    const result = computeStats([makeInspection('1', { score: 0 })]);
    expect(result.averageScore).toBe('0.0');
  });

  it('skips non-numeric score values', () => {
    const result = computeStats([
      makeInspection('1', { score: 60 }),
      makeInspection('2'), // no score
    ]);
    expect(result.averageScore).toBe('60.0');
  });

  it('returns averageScore as a string with one decimal place', () => {
    const result = computeStats([makeInspection('1', { score: 75.5 })]);
    expect(typeof result.averageScore).toBe('string');
    expect(result.averageScore).toMatch(/^\d+\.\d$/);
  });

  // ── totalHighViolations ─────────────────────────────────────────────────

  it('sums violations.high across inspections', () => {
    const result = computeStats([
      makeInspection('1', { violations: { high: 3, medium: 0, low: 0 } }),
      makeInspection('2', { violations: { high: 2, medium: 0, low: 0 } }),
    ]);
    expect(result.totalHighViolations).toBe(5);
  });

  it('ignores inspections without violations field', () => {
    const result = computeStats([makeInspection('1')]);
    expect(result.totalHighViolations).toBe(0);
  });

  it('handles violations.high = 0', () => {
    const result = computeStats([
      makeInspection('1', { violations: { high: 0, medium: 2, low: 1 } }),
    ]);
    expect(result.totalHighViolations).toBe(0);
  });

  // ── criticalOverrideCount ───────────────────────────────────────────────

  it('counts criticalOverride = true', () => {
    const result = computeStats([
      makeInspection('1', { criticalOverride: true }),
      makeInspection('2', { criticalOverride: false }),
      makeInspection('3', { criticalOverride: true }),
    ]);
    expect(result.criticalOverrideCount).toBe(2);
  });

  it('returns 0 when no criticalOverride is set', () => {
    const result = computeStats([makeInspection('1')]);
    expect(result.criticalOverrideCount).toBe(0);
  });

  // ── total & lastUpdated ─────────────────────────────────────────────────

  it('sets total to the number of inspections', () => {
    const result = computeStats([
      makeInspection('1'),
      makeInspection('2'),
      makeInspection('3'),
    ]);
    expect(result.total).toBe(3);
  });

  it('sets lastUpdated to a recent timestamp', () => {
    const before = Date.now();
    const result = computeStats([]);
    const after = Date.now();
    expect(result.lastUpdated).toBeGreaterThanOrEqual(before);
    expect(result.lastUpdated).toBeLessThanOrEqual(after);
  });
});

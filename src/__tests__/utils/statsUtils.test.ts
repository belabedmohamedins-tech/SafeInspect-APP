// src/__tests__/utils/statsUtils.test.ts
import { computeStats } from '../../utils/statsUtils';
import type { SavedInspection } from '../../types';

// ─── Fixtures ──────────────────────────────────────────────────────────────────────
const makeInspection = (overrides: Partial<SavedInspection> = {}): SavedInspection => ({
  id: 'ins-1',
  facilityId: 'fac-1',
  facilityName: 'Test Facility',
  facilityAddress: 'Test Address',
  inspectorName: 'Inspector',
  date: '2024-01-01',
  status: 'completed',
  items: [],
  grade: 'A',
  score: 90,
  ...overrides,
});

describe('computeStats', () => {
  describe('empty input', () => {
    it('returns zero total and N/A average for empty array', () => {
      const result = computeStats([]);
      expect(result.total).toBe(0);
      expect(result.averageScore).toBe('N/A');
      expect(result.gradeCounts).toEqual({ A: 0, B: 0, C: 0, D: 0 });
      expect(typeof result.lastUpdated).toBe('number');
    });
  });

  describe('grade counting', () => {
    it('counts each grade correctly', () => {
      const inspections = [
        makeInspection({ grade: 'A', score: 95 }),
        makeInspection({ grade: 'A', score: 90 }),
        makeInspection({ grade: 'B', score: 75 }),
        makeInspection({ grade: 'C', score: 55 }),
        makeInspection({ grade: 'D', score: 30 }),
      ];
      const result = computeStats(inspections);
      expect(result.gradeCounts).toEqual({ A: 2, B: 1, C: 1, D: 1 });
      expect(result.total).toBe(5);
    });

    it('ignores inspections with no recognised grade', () => {
      const inspections = [
        makeInspection({ grade: undefined, score: 50 }),
        makeInspection({ grade: 'A', score: 80 }),
      ];
      const result = computeStats(inspections);
      expect(result.gradeCounts.A).toBe(1);
      expect(result.total).toBe(2);
    });
  });

  describe('average score', () => {
    it('computes average to one decimal place', () => {
      const inspections = [
        makeInspection({ score: 90 }),
        makeInspection({ score: 80 }),
        makeInspection({ score: 70 }),
      ];
      expect(computeStats(inspections).averageScore).toBe('80.0');
    });

    it('returns N/A when no inspection has a numeric score', () => {
      const inspections = [
        makeInspection({ score: undefined }),
        makeInspection({ score: undefined }),
      ];
      expect(computeStats(inspections).averageScore).toBe('N/A');
    });

    it('returns 0.0 (not N/A) when the genuine average is zero', () => {
      const inspections = [makeInspection({ score: 0 })];
      expect(computeStats(inspections).averageScore).toBe('0.0');
    });

    it('skips non-numeric scores but averages the rest', () => {
      const inspections = [
        makeInspection({ score: 100 }),
        makeInspection({ score: undefined }),
        makeInspection({ score: 60 }),
      ];
      expect(computeStats(inspections).averageScore).toBe('80.0');
    });
  });

  describe('lastUpdated', () => {
    it('sets lastUpdated to a recent timestamp', () => {
      const before = Date.now();
      const result = computeStats([]);
      const after = Date.now();
      expect(result.lastUpdated).toBeGreaterThanOrEqual(before);
      expect(result.lastUpdated).toBeLessThanOrEqual(after);
    });
  });
});

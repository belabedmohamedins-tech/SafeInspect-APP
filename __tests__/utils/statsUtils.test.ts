// __tests__/utils/statsUtils.test.ts
import { computeStats } from '../../src/utils/statsUtils';
import { SavedInspection } from '../../src/types';

function makeInspection(
  overrides: Partial<SavedInspection> & { id: string }
): SavedInspection {
  return {
    facilityId: 'FAC-01',
    facilityName: 'Test Facility',
    activityType: 'مطعم',
    date: '2026-01-01T10:00:00.000Z',
    inspector: 'Test Inspector',
    items: [],
    status: 'completed',
    score: undefined,
    grade: undefined,
    ...overrides,
  };
}

describe('computeStats', () => {
  describe('empty input', () => {
    it('returns total = 0', () => {
      expect(computeStats([]).total).toBe(0);
    });

    it('returns all grade counts as 0', () => {
      const { gradeCounts } = computeStats([]);
      expect(gradeCounts).toEqual({ A: 0, B: 0, C: 0, D: 0 });
    });

    it('returns averageScore as "N/A" when no scored inspections', () => {
      expect(computeStats([]).averageScore).toBe('N/A');
    });

    it('sets lastUpdated close to Date.now()', () => {
      const before = Date.now();
      const { lastUpdated } = computeStats([]);
      const after = Date.now();
      expect(lastUpdated).toBeGreaterThanOrEqual(before);
      expect(lastUpdated).toBeLessThanOrEqual(after);
    });
  });

  describe('grade counting', () => {
    it('counts each grade correctly', () => {
      const inspections = [
        makeInspection({ id: '1', grade: 'A', score: 90 }),
        makeInspection({ id: '2', grade: 'A', score: 88 }),
        makeInspection({ id: '3', grade: 'B', score: 75 }),
        makeInspection({ id: '4', grade: 'C', score: 55 }),
        makeInspection({ id: '5', grade: 'D', score: 40 }),
      ];
      const { gradeCounts } = computeStats(inspections);
      expect(gradeCounts.A).toBe(2);
      expect(gradeCounts.B).toBe(1);
      expect(gradeCounts.C).toBe(1);
      expect(gradeCounts.D).toBe(1);
    });

    it('inspections with no grade are not counted in any grade bucket', () => {
      const inspections = [
        makeInspection({ id: '1', grade: undefined }),
        makeInspection({ id: '2', grade: undefined }),
      ];
      const { gradeCounts, total } = computeStats(inspections);
      expect(total).toBe(2);
      expect(gradeCounts.A + gradeCounts.B + gradeCounts.C + gradeCounts.D).toBe(0);
    });
  });

  describe('averageScore', () => {
    it('computes average of numeric scores to 1 decimal place', () => {
      const inspections = [
        makeInspection({ id: '1', score: 80, grade: 'A' }),
        makeInspection({ id: '2', score: 90, grade: 'A' }),
      ];
      expect(computeStats(inspections).averageScore).toBe('85.0');
    });

    it('ignores inspections with no numeric score', () => {
      const inspections = [
        makeInspection({ id: '1', score: 100, grade: 'A' }),
        makeInspection({ id: '2', score: undefined, grade: undefined }),
      ];
      expect(computeStats(inspections).averageScore).toBe('100.0');
    });

    it('returns "N/A" when no inspections have a numeric score', () => {
      const inspections = [
        makeInspection({ id: '1', score: undefined }),
        makeInspection({ id: '2', score: undefined }),
      ];
      expect(computeStats(inspections).averageScore).toBe('N/A');
    });

    it('handles single inspection correctly', () => {
      const inspections = [makeInspection({ id: '1', score: 73.5, grade: 'B' })];
      expect(computeStats(inspections).averageScore).toBe('73.5');
    });

    it('rounds to exactly 1 decimal place', () => {
      const inspections = [
        makeInspection({ id: '1', score: 80, grade: 'B' }),
        makeInspection({ id: '2', score: 70, grade: 'B' }),
        makeInspection({ id: '3', score: 63, grade: 'C' }),
      ];
      const avg = parseFloat(computeStats(inspections).averageScore as string);
      expect(avg.toFixed(1)).toBe((213 / 3).toFixed(1));
    });
  });

  describe('total count', () => {
    it('total equals number of inspections passed in', () => {
      const inspections = Array.from({ length: 7 }, (_, i) =>
        makeInspection({ id: String(i) })
      );
      expect(computeStats(inspections).total).toBe(7);
    });
  });
});

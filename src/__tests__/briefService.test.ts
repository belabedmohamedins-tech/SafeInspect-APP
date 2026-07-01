// src/__tests__/briefService.test.ts
//
// ROOT CAUSE REMINDER (see TESTING.md §Layer-4):
// jest.mock() is hoisted ABOVE every `const` by Babel.
// Any variable referenced inside the factory that is declared with `const`
// will be undefined at hoist time — UNLESS it is prefixed with `mock`.
//
// FIX USED HERE: inline jest.fn() directly inside the factory object,
// then retrieve the stub via jest.mocked() after the import.
// This is the safest pattern for repositories that re-export from an index.

import { buildBrief } from '../services/briefService';
import { InspectionRepository } from '../repositories/InspectionRepository';
import type { SavedInspection, InspectionItem } from '../types';

// ─── Mocks ──────────────────────────────────────────────────────────────────
jest.mock('../repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getCompleted: jest.fn(),
  },
}));

// Typed reference obtained AFTER the mock is registered.
const mockGetCompleted = jest.mocked(InspectionRepository.getCompleted);

beforeEach(() => {
  jest.clearAllMocks();
  mockGetCompleted.mockResolvedValue([]);
});

// ─── Fixtures ───────────────────────────────────────────────────────────────
const makeItem = (overrides: Partial<InspectionItem> = {}): InspectionItem => ({
  id: 'item-1', title: 'Test', axis: 'Hygiene',
  complianceStatus: 'compliant', severity: 'low', weight: 1, ...overrides,
});

const makeInspection = (overrides: Partial<SavedInspection> = {}): SavedInspection => ({
  id: 'ins-1', facilityId: 'fac-1', facilityName: 'Facility',
  facilityAddress: 'Address', inspectorName: 'Inspector',
  date: '2024-06-01', status: 'completed', items: [], grade: 'A', score: 90,
  ...overrides,
});

// ─── Tests ──────────────────────────────────────────────────────────────────
describe('buildBrief', () => {
  describe('no inspections for facility', () => {
    it('returns null lastInspection and empty violations when no matching inspections', async () => {
      mockGetCompleted.mockResolvedValue([makeInspection({ facilityId: 'other-fac' })]);
      const result = await buildBrief('fac-1');
      expect(result.lastInspection).toBeNull();
      expect(result.topViolations).toEqual([]);
      expect(result.previousGrade).toBeNull();
      expect(result.previousScore).toBeNull();
    });

    it('returns empty result when repository returns no inspections', async () => {
      mockGetCompleted.mockResolvedValue([]);
      const result = await buildBrief('fac-1');
      expect(result.lastInspection).toBeNull();
    });
  });

  describe('with matching inspections', () => {
    it('picks the most recent inspection for the facility', async () => {
      const older = makeInspection({ id: 'old', date: '2024-01-01', grade: 'B', score: 75 });
      const newer = makeInspection({ id: 'new', date: '2024-06-01', grade: 'A', score: 95 });
      mockGetCompleted.mockResolvedValue([older, newer]);
      const result = await buildBrief('fac-1');
      expect(result.lastInspection!.id).toBe('new');
      expect(result.previousGrade).toBe('A');
      expect(result.previousScore).toBe(95);
      expect(result.previousDate).toBe('2024-06-01');
    });

    it('returns top 3 non-compliant items sorted by severity (high first)', async () => {
      const items = [
        makeItem({ id: 'low-1',  complianceStatus: 'non-compliant', severity: 'low'    }),
        makeItem({ id: 'high-1', complianceStatus: 'non-compliant', severity: 'high'   }),
        makeItem({ id: 'med-1',  complianceStatus: 'non-compliant', severity: 'medium' }),
        makeItem({ id: 'high-2', complianceStatus: 'non-compliant', severity: 'high'   }),
        makeItem({ id: 'ok-1',   complianceStatus: 'compliant',     severity: 'high'   }),
      ];
      mockGetCompleted.mockResolvedValue([makeInspection({ items })]);
      const result = await buildBrief('fac-1');
      expect(result.topViolations).toHaveLength(3);
      expect(result.topViolations[0].severity).toBe('high');
    });

    it('returns empty topViolations when all items are compliant', async () => {
      const items = [makeItem({ complianceStatus: 'compliant' })];
      mockGetCompleted.mockResolvedValue([makeInspection({ items })]);
      const result = await buildBrief('fac-1');
      expect(result.topViolations).toEqual([]);
    });

    it('exposes previousInspectorName', async () => {
      mockGetCompleted.mockResolvedValue([makeInspection({ inspectorName: 'Ahmed' })]);
      const result = await buildBrief('fac-1');
      expect(result.previousInspectorName).toBe('Ahmed');
    });

    // ── Branch: grade/score are null (lines ~42-43) ──────────────────────────
    // Covers the `?? null` branches on last.grade and last.score
    it('returns null previousGrade and previousScore when inspection has no grade or score', async () => {
      const noGradeInspection = makeInspection({ grade: undefined, score: undefined });
      mockGetCompleted.mockResolvedValue([noGradeInspection]);
      const result = await buildBrief('fac-1');
      expect(result.previousGrade).toBeNull();
      expect(result.previousScore).toBeNull();
    });

    // ── Branch: unknown severity fallback (?? 3) (lines 36-38) ──────────────
    // An item with a severity value not in {high, medium, low} gets order 3
    // (sorted to the end). This covers the `?? 3` branch in the sort comparator.
    it('sorts items with unknown severity to the end', async () => {
      const items = [
        makeItem({ id: 'unknown-sev', complianceStatus: 'non-compliant', severity: 'critical' as any }),
        makeItem({ id: 'high-1',     complianceStatus: 'non-compliant', severity: 'high' }),
      ];
      mockGetCompleted.mockResolvedValue([makeInspection({ items })]);
      const result = await buildBrief('fac-1');
      // 'high' should come before unknown severity
      expect(result.topViolations[0].id).toBe('high-1');
      expect(result.topViolations[1].id).toBe('unknown-sev');
    });
  });
});

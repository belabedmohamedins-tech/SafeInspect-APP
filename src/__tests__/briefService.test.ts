// src/__tests__/briefService.test.ts
import { buildBrief } from '../services/briefService';
import { InspectionRepository } from '../repositories/InspectionRepository';
import type { SavedInspection, InspectionItem } from '../types';

// ─── Mocks ──────────────────────────────────────────────────────────────────────
const mockGetCompleted = jest.fn();

jest.mock('../repositories/InspectionRepository', () => ({
  InspectionRepository: { getCompleted: mockGetCompleted },
}));

beforeEach(() => { jest.clearAllMocks(); });

// ─── Fixtures ──────────────────────────────────────────────────────────────────────
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
  });
});

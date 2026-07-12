// __tests__/services/briefService.test.ts
const mockGetCompleted = jest.fn();

jest.mock('../../src/repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getCompleted: (...a: any[]) => mockGetCompleted(...a),
  },
}));

import { buildBrief } from '../../src/services/briefService';

const ITEM_HIGH = { id: 'i1', complianceStatus: 'non-compliant', severity: 'high',   criteria: 'H' };
const ITEM_MED  = { id: 'i2', complianceStatus: 'non-compliant', severity: 'medium', criteria: 'M' };
const ITEM_LOW  = { id: 'i3', complianceStatus: 'non-compliant', severity: 'low',    criteria: 'L' };
const ITEM_OK   = { id: 'i4', complianceStatus: 'compliant',     severity: 'medium', criteria: 'OK' };

const INSP_A = {
  id: 'a', facilityId: 'f1', date: '2026-06-01T00:00:00.000Z',
  grade: 'B', score: 75, inspectorName: 'Ahmed',
  items: [ITEM_HIGH, ITEM_MED, ITEM_LOW, ITEM_OK],
};
const INSP_B = {
  id: 'b', facilityId: 'f1', date: '2026-07-01T00:00:00.000Z',
  grade: 'A', score: 95, inspectorName: 'Sara',
  items: [ITEM_OK],
};

beforeEach(() => jest.clearAllMocks());

describe('buildBrief', () => {
  it('returns null fields when no inspections exist for the facility', async () => {
    mockGetCompleted.mockResolvedValue([]);
    const r = await buildBrief('f1');
    expect(r.lastInspection).toBeNull();
    expect(r.topViolations).toEqual([]);
    expect(r.previousGrade).toBeNull();
    expect(r.previousScore).toBeNull();
    expect(r.previousDate).toBeNull();
    expect(r.previousInspectorName).toBeNull();
  });

  it('ignores inspections from other facilities', async () => {
    mockGetCompleted.mockResolvedValue([{ ...INSP_A, facilityId: 'other' }]);
    const r = await buildBrief('f1');
    expect(r.lastInspection).toBeNull();
  });

  it('returns the most recent inspection as lastInspection', async () => {
    mockGetCompleted.mockResolvedValue([INSP_A, INSP_B]);
    const r = await buildBrief('f1');
    expect(r.lastInspection?.id).toBe('b'); // INSP_B is more recent
  });

  it('returns top 3 non-compliant items sorted high→medium→low', async () => {
    mockGetCompleted.mockResolvedValue([INSP_A]);
    const r = await buildBrief('f1');
    expect(r.topViolations).toHaveLength(3);
    expect(r.topViolations[0].severity).toBe('high');
    expect(r.topViolations[1].severity).toBe('medium');
    expect(r.topViolations[2].severity).toBe('low');
  });

  it('populates previousGrade, previousScore, previousDate, previousInspectorName', async () => {
    mockGetCompleted.mockResolvedValue([INSP_A]);
    const r = await buildBrief('f1');
    expect(r.previousGrade).toBe('B');
    expect(r.previousScore).toBe(75);
    expect(r.previousDate).toBe('2026-06-01T00:00:00.000Z');
    expect(r.previousInspectorName).toBe('Ahmed');
  });

  it('topViolations capped at 3 even when more violations exist', async () => {
    const manyViolations = Array.from({ length: 5 }, (_, i) => ({
      id: `v${i}`, complianceStatus: 'non-compliant', severity: 'medium', criteria: `C${i}`,
    }));
    mockGetCompleted.mockResolvedValue([{ ...INSP_A, items: manyViolations }]);
    const r = await buildBrief('f1');
    expect(r.topViolations).toHaveLength(3);
  });
});

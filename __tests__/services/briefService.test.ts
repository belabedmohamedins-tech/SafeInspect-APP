// __tests__/services/briefService.test.ts
const mockGetCompleted = jest.fn();
jest.mock('../../src/repositories/InspectionRepository', () => ({
  InspectionRepository: { getCompleted: () => mockGetCompleted() },
}));

import { buildBrief } from '../../src/services/briefService';

const makeItem = (overrides = {}) => ({
  id: 'item1', criteria: 'C1', severity: 'high', complianceStatus: 'non-compliant', ...overrides,
});

const makeInspection = (overrides = {}) => ({
  id: 'i1', facilityId: 'f1', facilityName: 'FAC', inspectorName: 'Ahmed',
  date: '2026-06-01T10:00:00.000Z', status: 'completed', grade: 'B', score: 75,
  items: [makeItem()],
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

describe('buildBrief', () => {
  it('returns nulls when no inspections for facility', async () => {
    mockGetCompleted.mockResolvedValue([]);
    const brief = await buildBrief('f1');
    expect(brief.lastInspection).toBeNull();
    expect(brief.topViolations).toEqual([]);
    expect(brief.previousGrade).toBeNull();
  });

  it('returns last inspection metadata', async () => {
    mockGetCompleted.mockResolvedValue([makeInspection()]);
    const brief = await buildBrief('f1');
    expect(brief.previousGrade).toBe('B');
    expect(brief.previousScore).toBe(75);
    expect(brief.previousInspectorName).toBe('Ahmed');
  });

  it('uses most recent inspection when multiple exist', async () => {
    const older = makeInspection({ id: 'i0', date: '2026-01-01T00:00:00.000Z', grade: 'C', score: 55 });
    const newer = makeInspection({ id: 'i1', date: '2026-06-01T00:00:00.000Z', grade: 'B', score: 75 });
    mockGetCompleted.mockResolvedValue([older, newer]);
    const brief = await buildBrief('f1');
    expect(brief.lastInspection!.id).toBe('i1');
  });

  it('filters to facility id', async () => {
    const other = makeInspection({ facilityId: 'f2' });
    mockGetCompleted.mockResolvedValue([other]);
    const brief = await buildBrief('f1');
    expect(brief.lastInspection).toBeNull();
  });

  it('returns top 3 violations sorted by severity', async () => {
    const items = [
      makeItem({ id: 'a', severity: 'low' }),
      makeItem({ id: 'b', severity: 'high' }),
      makeItem({ id: 'c', severity: 'medium' }),
      makeItem({ id: 'd', severity: 'high' }),
    ];
    mockGetCompleted.mockResolvedValue([makeInspection({ items })]);
    const brief = await buildBrief('f1');
    expect(brief.topViolations).toHaveLength(3);
    expect(brief.topViolations[0].severity).toBe('high');
  });

  it('excludes compliant items from violations', async () => {
    const items = [
      makeItem({ id: 'a', complianceStatus: 'compliant' }),
      makeItem({ id: 'b', complianceStatus: 'non-compliant', severity: 'low' }),
    ];
    mockGetCompleted.mockResolvedValue([makeInspection({ items })]);
    const brief = await buildBrief('f1');
    expect(brief.topViolations).toHaveLength(1);
  });
});

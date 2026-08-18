// src/__tests__/briefService.test.ts
import { buildBrief } from '../services/briefService';
import { InspectionRepository } from '../repositories/InspectionRepository';
import { SavedInspection } from '../types';

jest.mock('../repositories/InspectionRepository', () => ({
  InspectionRepository: {
    getCompleted: jest.fn(),
  },
}));

const mockGetCompleted = InspectionRepository.getCompleted as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockGetCompleted.mockResolvedValue([]);
});

describe('buildBrief', () => {
  it('is a callable function', () => {
    expect(typeof buildBrief).toBe('function');
  });

  it('returns nulls when no inspections exist for facility', async () => {
    const result = await buildBrief('fac-1');
    expect(result.lastInspection).toBeNull();
    expect(result.topViolations).toEqual([]);
  });

  it('returns the most recent inspection as lastInspection', async () => {
    const older: SavedInspection = { id: 'i1', facilityId: 'fac-1', date: '2026-01-01', items: [] } as any;
    const newer: SavedInspection = { id: 'i2', facilityId: 'fac-1', date: '2026-06-01', items: [] } as any;
    mockGetCompleted.mockResolvedValueOnce([older, newer]);
    const result = await buildBrief('fac-1');
    expect(result.lastInspection!.id).toBe('i2');
  });

  it('W86: critical violations sort before high, medium, low', async () => {
    const items = [
      { id: 'a', complianceStatus: 'non-compliant', severity: 'low' },
      { id: 'b', complianceStatus: 'non-compliant', severity: 'high' },
      { id: 'c', complianceStatus: 'non-compliant', severity: 'critical' },
      { id: 'd', complianceStatus: 'non-compliant', severity: 'medium' },
    ];
    const insp: SavedInspection = { id: 'i1', facilityId: 'fac-1', date: '2026-06-01', items } as any;
    mockGetCompleted.mockResolvedValueOnce([insp]);
    const result = await buildBrief('fac-1');
    expect(result.topViolations[0].id).toBe('c'); // critical first
    expect(result.topViolations[1].id).toBe('b'); // then high
    expect(result.topViolations[2].id).toBe('d'); // then medium
  });

  it('W86: unknown severity sorts after known severities (not before)', async () => {
    const items = [
      { id: 'a', complianceStatus: 'non-compliant', severity: 'unknown' },
      { id: 'b', complianceStatus: 'non-compliant', severity: 'critical' },
    ];
    const insp: SavedInspection = { id: 'i1', facilityId: 'fac-1', date: '2026-06-01', items } as any;
    mockGetCompleted.mockResolvedValueOnce([insp]);
    const result = await buildBrief('fac-1');
    expect(result.topViolations[0].id).toBe('b'); // critical before unknown
  });

  it('filters out compliant items from topViolations', async () => {
    const items = [
      { id: 'a', complianceStatus: 'compliant',     severity: 'critical' },
      { id: 'b', complianceStatus: 'non-compliant', severity: 'low' },
    ];
    const insp: SavedInspection = { id: 'i1', facilityId: 'fac-1', date: '2026-06-01', items } as any;
    mockGetCompleted.mockResolvedValueOnce([insp]);
    const result = await buildBrief('fac-1');
    expect(result.topViolations).toHaveLength(1);
    expect(result.topViolations[0].id).toBe('b');
  });

  it('caps topViolations at 3', async () => {
    const items = Array.from({ length: 6 }, (_, i) => ({
      id: `item-${i}`,
      complianceStatus: 'non-compliant',
      severity: 'high',
    }));
    const insp: SavedInspection = { id: 'i1', facilityId: 'fac-1', date: '2026-06-01', items } as any;
    mockGetCompleted.mockResolvedValueOnce([insp]);
    const result = await buildBrief('fac-1');
    expect(result.topViolations).toHaveLength(3);
  });
});

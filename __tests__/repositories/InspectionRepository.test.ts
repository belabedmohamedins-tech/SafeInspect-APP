/**
 * __tests__/repositories/InspectionRepository.test.ts
 * Z6-TSC: inspectorId does not exist on SavedInspection; use inspectorName.
 */
import { InspectionRepository } from '../../src/repositories/InspectionRepository';
import type { SavedInspection } from '../../src/types';

function makeInspection(overrides: Partial<SavedInspection> = {}): SavedInspection {
  return {
    id: 'insp-default',
    facilityId: 'fac-1',
    facilityName: 'Test Facility',
    facilityAddress: '1 Rue Test',
    date: '2026-08-01',
    inspectorName: 'Inspector A',
    items: [],
    status: 'completed',
    ...overrides,
  };
}

beforeEach(async () => {
  await InspectionRepository.clear();
});

describe('InspectionRepository', () => {
  it('saves and retrieves all inspections', async () => {
    await InspectionRepository.save(makeInspection({ id: '1' }));
    await InspectionRepository.save(makeInspection({ id: '2' }));
    const all = await InspectionRepository.getAll();
    expect(all).toHaveLength(2);
  });

  it('retrieves by id', async () => {
    await InspectionRepository.save(makeInspection({ id: 'abc' }));
    const found = await InspectionRepository.getById('abc');
    expect(found).not.toBeNull();
    expect(found?.id).toBe('abc');
  });

  it('deletes an inspection', async () => {
    await InspectionRepository.save(makeInspection({ id: 'del-1' }));
    await InspectionRepository.delete('del-1');
    const all = await InspectionRepository.getAll();
    expect(all.every(i => i.id !== 'del-1')).toBe(true);
  });

  it('filters by facilityId', async () => {
    await InspectionRepository.save(makeInspection({ id: '1', facilityId: 'A' }));
    await InspectionRepository.save(makeInspection({ id: '2', facilityId: 'B' }));
    const result = await InspectionRepository.getByFacility('A');
    expect(result.every(i => i.facilityId === 'A')).toBe(true);
  });

  it('clear empties all inspections', async () => {
    await InspectionRepository.save(makeInspection({ id: '1' }));
    await InspectionRepository.clear();
    expect(await InspectionRepository.getAll()).toHaveLength(0);
  });
});

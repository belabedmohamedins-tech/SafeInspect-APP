/**
 * __tests__/repositories/FacilityRepository.test.ts
 * Z6-TSC:
 *   - FacilityRepository has no save()/delete(); use add()/update()/remove().
 *   - Facility has no 'name' field; use projectName.
 *   - makeFacility now supplies all required Facility fields.
 */
import { FacilityRepository } from '../../src/repositories/FacilityRepository';
import type { Facility } from '../../src/types';

function makeFacility(overrides: Partial<Facility> = {}): Facility {
  return {
    id: 'fac-default',
    projectName: 'Test Project',
    ownerName: 'Test Owner',
    activity: 'restaurant',
    address: '1 Rue Principale, Alger',
    ...overrides,
  };
}

beforeEach(async () => {
  await FacilityRepository.clear();
});

describe('FacilityRepository', () => {
  it('adds and retrieves all facilities', async () => {
    await FacilityRepository.add(makeFacility({ id: '1' }));
    await FacilityRepository.add(makeFacility({ id: '2' }));
    const all = await FacilityRepository.getAll();
    expect(all).toHaveLength(2);
  });

  it('retrieves by id', async () => {
    await FacilityRepository.add(makeFacility({ id: 'abc' }));
    const found = await FacilityRepository.getById('abc');
    expect(found).not.toBeNull();
    expect(found?.id).toBe('abc');
  });

  it('updates a facility', async () => {
    await FacilityRepository.add(makeFacility({ id: 'upsert-1', projectName: 'Old' }));
    await FacilityRepository.update('upsert-1', { projectName: 'New' });
    const all = await FacilityRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].projectName).toBe('New');
  });

  it('adds a facility without explicit id (auto-generated)', async () => {
    const { id: _ignore, ...noId } = makeFacility();
    const newId = await FacilityRepository.add(noId as Omit<Facility, 'id'>);
    expect(typeof newId).toBe('string');
  });

  it('removes a facility', async () => {
    await FacilityRepository.add(makeFacility({ id: '1' }));
    await FacilityRepository.add(makeFacility({ id: '2' }));
    await FacilityRepository.remove('1');
    const all = await FacilityRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('2');
  });

  it('clear empties all records', async () => {
    await FacilityRepository.add(makeFacility({ id: '1' }));
    await FacilityRepository.clear();
    expect(await FacilityRepository.getAll()).toHaveLength(0);
  });
});

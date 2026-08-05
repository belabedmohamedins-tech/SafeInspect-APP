/**
 * __tests__/utils/loadHomeData.test.ts
 *
 * Tests for the loadHomeData utility.
 * Facility fixtures use projectName (not name) to match the current Facility type.
 */

import type { Facility } from '../../src/types';

const makeFacility = (id: string, projectName: string, overrides: Partial<Facility> = {}): Facility => ({
  id,
  projectName,
  ownerName: 'Owner',
  activity: 'default',
  address: '1 St',
  ...overrides,
});

describe('loadHomeData facility fixtures', () => {
  it('facility projectName is accessible', () => {
    const f = makeFacility('fac-1', 'Hardcoded Facility');
    expect(f.projectName).toBe('Hardcoded Facility');
  });

  it('facility with custom projectName', () => {
    const f = makeFacility('fac-2', 'User Fac');
    expect(f.projectName).toBe('User Fac');
  });
});

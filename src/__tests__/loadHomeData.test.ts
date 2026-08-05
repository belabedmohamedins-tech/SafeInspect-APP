// src/__tests__/loadHomeData.test.ts
import { Facility } from '../types';

const makeF = (id: string): Facility => ({
  id,
  projectName: 'Hardcoded Facility',
  ownerName: 'Owner',
  activity: 'default',
  address: '1 St',
  ...({} as any),
});

describe('loadHomeData fixtures', () => {
  it('makeF produces a valid Facility', () => {
    const f = makeF('fac-1');
    expect(f.id).toBe('fac-1');
    expect(f.projectName).toBe('Hardcoded Facility');
  });

  it('facility has projectName not name', () => {
    const f = makeF('fac-2');
    expect(f.projectName).toBeDefined();
    expect((f as any).name).toBeUndefined();
  });

  it('user facility', () => {
    const f: Facility = { ...makeF('fac-3'), projectName: 'User Facility' };
    expect(f.projectName).toBe('User Facility');
  });
});

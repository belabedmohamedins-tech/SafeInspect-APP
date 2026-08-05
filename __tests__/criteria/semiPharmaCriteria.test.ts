import { semiPharmaCriteria } from '../../src/criteria/semiPharmaCriteria';

describe('semiPharmaCriteria', () => {
  it('should have at least one criterion', () => {
    expect(semiPharmaCriteria.length).toBeGreaterThan(0);
  });

  it('every item has a non-empty id', () => {
    semiPharmaCriteria.forEach(item => {
      expect(item.id.trim().length).toBeGreaterThan(0);
    });
  });

  it('every item has a non-empty axis when provided', () => {
    semiPharmaCriteria.forEach(item => {
      if (item.axis !== undefined) {
        expect(item.axis.trim().length).toBeGreaterThan(0);
      }
    });
  });
});

import { slaughterhouseSmallCriteria } from '../../src/criteria/slaughterhouseSmallCriteria';

describe('slaughterhouseSmallCriteria', () => {
  it('should have at least one criterion', () => {
    expect(slaughterhouseSmallCriteria.length).toBeGreaterThan(0);
  });

  it('every item has a non-empty id', () => {
    slaughterhouseSmallCriteria.forEach(item => {
      expect(item.id.trim().length).toBeGreaterThan(0);
    });
  });

  it('every item has a non-empty axis when provided', () => {
    slaughterhouseSmallCriteria.forEach(item => {
      if (item.axis !== undefined) {
        expect(item.axis.trim().length).toBeGreaterThan(0);
      }
    });
  });
});

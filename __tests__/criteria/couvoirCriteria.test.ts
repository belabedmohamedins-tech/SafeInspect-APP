import { couvoirSpecificCriteria } from '../../src/criteria/couvoirCriteria';
import { InspectionItem } from '../../src/types';

describe('couvoirSpecificCriteria', () => {
  it('has exactly 22 items', () => {
    expect(couvoirSpecificCriteria).toHaveLength(22);
  });

  it('all IDs are unique', () => {
    const ids = couvoirSpecificCriteria.map((c: InspectionItem) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs follow COU-AXN-NN pattern', () => {
    couvoirSpecificCriteria.forEach((c: InspectionItem) => {
      expect(c.id).toMatch(/^COU-AX\d+-\d+$/);
    });
  });

  it('all items have required fields', () => {
    couvoirSpecificCriteria.forEach((c: InspectionItem) => {
      expect(c.id).toBeTruthy();
      expect(c.axis).toBeTruthy();
      expect(c.criteria).toBeTruthy();
      expect(c.severity).toBeTruthy();
      expect(c.controlType).toBeTruthy();
      expect(c.complianceStatus).toBe('not-evaluated');
    });
  });

  it('all items have valid severity', () => {
    const valid = ['low', 'medium', 'high'];
    couvoirSpecificCriteria.forEach((c: InspectionItem) => {
      expect(valid).toContain(c.severity);
    });
  });

  it('all items have a non-empty legalReference', () => {
    couvoirSpecificCriteria.forEach((c: InspectionItem) => {
      expect(c.legalReference.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items default to not-evaluated', () => {
    couvoirSpecificCriteria.forEach((c: InspectionItem) => {
      expect(c.complianceStatus).toBe('not-evaluated');
    });
  });

  it('covers التصنيف والترخيص axis', () => {
    const axes = new Set(couvoirSpecificCriteria.map((c: InspectionItem) => c.axis));
    expect(axes.has('الهوية والتصنيف')).toBe(true);
  });
});

import { uabSpecificCriteria } from '../../src/criteria/uabCriteria';
import { InspectionItem } from '../../src/types';

describe('uabSpecificCriteria – array-level contract', () => {
  it('has exactly 28 items', () => {
    expect(uabSpecificCriteria).toHaveLength(28);
  });

  it('all IDs are unique', () => {
    const ids = uabSpecificCriteria.map((c: InspectionItem) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs follow UAB-AXN-NN pattern', () => {
    uabSpecificCriteria.forEach((c: InspectionItem) => {
      expect(c.id).toMatch(/^UAB-AX\d+-\d+$/);
    });
  });

  it('all items have required fields', () => {
    uabSpecificCriteria.forEach((c: InspectionItem) => {
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
    uabSpecificCriteria.forEach((c: InspectionItem) => {
      expect(valid).toContain(c.severity);
    });
  });

  it('all items have a non-empty legalReference', () => {
    uabSpecificCriteria.forEach((c: InspectionItem) => {
      expect(c.legalReference.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items default to not-evaluated', () => {
    uabSpecificCriteria.forEach((c: InspectionItem) => {
      expect(c.complianceStatus).toBe('not-evaluated');
    });
  });

  it('covers التصنيف والترخيص البيئي axis', () => {
    const axes = new Set(uabSpecificCriteria.map((c: InspectionItem) => c.axis));
    expect(axes.has('التصنيف والترخيص البيئي')).toBe(true);
  });
});

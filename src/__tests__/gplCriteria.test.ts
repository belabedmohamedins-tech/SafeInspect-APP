import { gplCriteria } from '../criteria/gplCriteria';
import { InspectionItem } from '../types';

describe('gplCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(gplCriteria)).toBe(true);
  });

  it('contains exactly 10 criteria', () => {
    expect(gplCriteria).toHaveLength(10);
  });

  it('has no duplicate IDs', () => {
    const ids = gplCriteria.map((c: InspectionItem) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs follow the GPL-XX-XX pattern', () => {
    gplCriteria.forEach((c: InspectionItem) => {
      expect(c.id).toMatch(/^GPL-\d{2}-\d{2}$/);
    });
  });

  it('all items have a valid severity', () => {
    const valid = ['low', 'medium', 'high'];
    gplCriteria.forEach((c: InspectionItem) => {
      expect(valid).toContain(c.severity);
    });
  });

  it('all items have a non-empty legalReference', () => {
    gplCriteria.forEach((c: InspectionItem) => {
      expect(c.legalReference).toBeTruthy();
      expect(c.legalReference.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items have a non-empty criteria text', () => {
    gplCriteria.forEach((c: InspectionItem) => {
      expect(c.criteria).toBeTruthy();
      expect(c.criteria.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items have a non-empty axis', () => {
    gplCriteria.forEach((c: InspectionItem) => {
      expect(c.axis).toBeTruthy();
    });
  });

  it('all items default to not-evaluated', () => {
    gplCriteria.forEach((c: InspectionItem) => {
      expect(c.complianceStatus).toBe('not-evaluated');
    });
  });

  it('majority of items are high severity (gas explosion risk)', () => {
    const highCount = gplCriteria.filter((c: InspectionItem) => c.severity === 'high').length;
    expect(highCount).toBeGreaterThanOrEqual(7);
  });

  it('covers expected axes', () => {
    const axes = new Set(gplCriteria.map((c: InspectionItem) => c.axis));
    expect(axes).toContain('هوية المنشأة والوثائق');
    expect(axes).toContain('تخزين قوارير الغاز');
    expect(axes).toContain('الوقاية من الحريق والانفجار');
    expect(axes).toContain('أدوات العمل والمعدات');
  });

  it('fire prevention criterion GPL-03-02 requires CO2 extinguishers', () => {
    const item = gplCriteria.find((c: InspectionItem) => c.id === 'GPL-03-02');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
    expect(item!.controlType).toBe('visual');
  });

  it('emergency procedure criterion GPL-03-03 is a doc controlType', () => {
    const item = gplCriteria.find((c: InspectionItem) => c.id === 'GPL-03-03');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('licence criterion GPL-01-01 is category تنظيمية', () => {
    const item = gplCriteria.find((c: InspectionItem) => c.id === 'GPL-01-01');
    expect(item).toBeDefined();
    expect(item!.category).toBe('تنظيمية');
  });
});

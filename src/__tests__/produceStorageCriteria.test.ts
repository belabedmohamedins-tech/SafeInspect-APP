import { produceStorageCriteria } from '../criteria/produceStorageCriteria';
import { InspectionItem } from '../types';

describe('produceStorageCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(produceStorageCriteria)).toBe(true);
  });

  it('contains exactly 10 criteria', () => {
    expect(produceStorageCriteria).toHaveLength(10);
  });

  it('has no duplicate IDs', () => {
    const ids = produceStorageCriteria.map((c: InspectionItem) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs follow the PRD-XX-XX pattern', () => {
    produceStorageCriteria.forEach((c: InspectionItem) => {
      expect(c.id).toMatch(/^PRD-\d{2}-\d{2}$/);
    });
  });

  it('all items have a valid severity', () => {
    const valid = ['low', 'medium', 'high'];
    produceStorageCriteria.forEach((c: InspectionItem) => {
      expect(valid).toContain(c.severity);
    });
  });

  it('all items have a non-empty legalReference', () => {
    produceStorageCriteria.forEach((c: InspectionItem) => {
      expect(c.legalReference).toBeTruthy();
      expect(c.legalReference.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items have a non-empty criteria text', () => {
    produceStorageCriteria.forEach((c: InspectionItem) => {
      expect(c.criteria).toBeTruthy();
      expect(c.criteria.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items have a non-empty axis', () => {
    produceStorageCriteria.forEach((c: InspectionItem) => {
      expect(c.axis).toBeTruthy();
    });
  });

  it('all items default to not-evaluated', () => {
    produceStorageCriteria.forEach((c: InspectionItem) => {
      expect(c.complianceStatus).toBe('not-evaluated');
    });
  });

  it('majority of items are high or medium severity (food safety)', () => {
    const nonLow = produceStorageCriteria.filter(
      (c: InspectionItem) => c.severity === 'high' || c.severity === 'medium'
    ).length;
    expect(nonLow).toBeGreaterThanOrEqual(8);
  });

  it('covers expected axes', () => {
    const axes = new Set(produceStorageCriteria.map((c: InspectionItem) => c.axis));
    expect(axes).toContain('هوية المنشأة والوثائق');
    expect(axes).toContain('شروط التخزين');
    expect(axes).toContain('نظافة فضاءات التخزين');
    expect(axes).toContain('مكافحة الآفات');
    expect(axes).toContain('التتبعية');
  });

  it('temperature storage criterion PRD-02-01 is measurement controlType', () => {
    const item = produceStorageCriteria.find((c: InspectionItem) => c.id === 'PRD-02-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('measurement');
    expect(item!.severity).toBe('high');
  });

  it('traceability criterion PRD-05-02 is doc controlType', () => {
    const item = produceStorageCriteria.find((c: InspectionItem) => c.id === 'PRD-05-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
  });

  it('pest control program PRD-04-01 is high severity', () => {
    const item = produceStorageCriteria.find((c: InspectionItem) => c.id === 'PRD-04-01');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
  });
});

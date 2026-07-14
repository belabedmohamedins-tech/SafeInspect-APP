import { produceStorageCriteria } from '../produceStorageCriteria';
import { InspectionItem } from '../../types';

describe('produceStorageCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(produceStorageCriteria)).toBe(true);
    expect(produceStorageCriteria.length).toBeGreaterThan(0);
  });

  it('has exactly 7 items', () => {
    expect(produceStorageCriteria).toHaveLength(7);
  });

  it('all items have required InspectionItem fields', () => {
    produceStorageCriteria.forEach((item: InspectionItem) => {
      expect(item.id).toBeDefined();
      expect(item.axis).toBeDefined();
      expect(item.category).toBeDefined();
      expect(item.criteria).toBeDefined();
      expect(item.legalReference).toBeDefined();
      expect(item.severity).toBeDefined();
      expect(item.controlType).toBeDefined();
      expect(item.complianceStatus).toBeDefined();
    });
  });

  it('all IDs are unique', () => {
    const ids = produceStorageCriteria.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs follow PRD- prefix pattern', () => {
    produceStorageCriteria.forEach((item) => {
      expect(item.id).toMatch(/^PRD-/);
    });
  });

  it('severity values are valid', () => {
    const valid = ['low', 'medium', 'high'];
    produceStorageCriteria.forEach((item) => {
      expect(valid).toContain(item.severity);
    });
  });

  it('controlType values are valid', () => {
    const valid = ['doc', 'visual', 'measurement', 'test'];
    produceStorageCriteria.forEach((item) => {
      expect(valid).toContain(item.controlType);
    });
  });

  it('all items start with complianceStatus not-evaluated', () => {
    produceStorageCriteria.forEach((item) => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('contains PRD-01-01 (licence)', () => {
    const item = produceStorageCriteria.find((i) => i.id === 'PRD-01-01');
    expect(item).toBeDefined();
    expect(item!.category).toBe('تنظيمية');
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('contains PRD-02-01 (temperature/humidity storage)', () => {
    const item = produceStorageCriteria.find((i) => i.id === 'PRD-02-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('measurement');
    expect(item!.severity).toBe('high');
  });

  it('contains PRD-02-02 (raised off floor)', () => {
    const item = produceStorageCriteria.find((i) => i.id === 'PRD-02-02');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('medium');
    expect(item!.controlType).toBe('visual');
  });

  it('contains PRD-02-03 (product separation)', () => {
    const item = produceStorageCriteria.find((i) => i.id === 'PRD-02-03');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('medium');
    expect(item!.controlType).toBe('visual');
  });

  it('contains PRD-03-01 (storage space hygiene)', () => {
    const item = produceStorageCriteria.find((i) => i.id === 'PRD-03-01');
    expect(item).toBeDefined();
    expect(item!.category).toBe('نظافة');
    expect(item!.severity).toBe('high');
  });

  it('contains PRD-03-02 (cleaning programme)', () => {
    const item = produceStorageCriteria.find((i) => i.id === 'PRD-03-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('medium');
  });

  it('contains PRD-05-01 (spoiled produce removal)', () => {
    const item = produceStorageCriteria.find((i) => i.id === 'PRD-05-01');
    expect(item).toBeDefined();
    expect(item!.category).toBe('بيئية');
    expect(item!.severity).toBe('high');
    expect(item!.controlType).toBe('visual');
  });

  it('does NOT contain removed PRD-04-01 (pest dedup)', () => {
    expect(produceStorageCriteria.find((i) => i.id === 'PRD-04-01')).toBeUndefined();
  });

  it('does NOT contain removed PRD-04-02 (pest dedup)', () => {
    expect(produceStorageCriteria.find((i) => i.id === 'PRD-04-02')).toBeUndefined();
  });

  it('does NOT contain removed PRD-05-02 (traceability dedup)', () => {
    expect(produceStorageCriteria.find((i) => i.id === 'PRD-05-02')).toBeUndefined();
  });

  it('axes cover expected domains', () => {
    const axes = new Set(produceStorageCriteria.map((i) => i.axis));
    expect(axes.has('هوية المنشأة والوثائق')).toBe(true);
    expect(axes.has('شروط التخزين')).toBe(true);
    expect(axes.has('نظافة فضاءات التخزين')).toBe(true);
    expect(axes.has('المياه والتخلص من النفايات')).toBe(true);
  });
});

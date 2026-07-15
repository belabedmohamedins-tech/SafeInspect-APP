import { printingCriteria } from '../../src/criteria/printingCriteria';

describe('printingCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(printingCriteria)).toBe(true);
  });

  it('should contain exactly 11 items', () => {
    expect(printingCriteria).toHaveLength(11);
  });

  it('should have no duplicate IDs', () => {
    const ids = printingCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs follow PRT- prefix', () => {
    printingCriteria.forEach(item => expect(item.id).toMatch(/^PRT-/));
  });

  it('all items have required fields', () => {
    printingCriteria.forEach(item => {
      expect(item.id).toBeDefined();
      expect(item.axis).toBeDefined();
      expect(item.criteria).toBeDefined();
      expect(item.severity).toBeDefined();
      expect(item.controlType).toBeDefined();
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('PRT-01-01 removed — covered by BGN-01-01', () => {
    expect(printingCriteria.find(i => i.id === 'PRT-01-01')).toBeUndefined();
  });

  it('PRT-01-02 is commercial register doc high', () => {
    const item = printingCriteria.find(i => i.id === 'PRT-01-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('PRT-04-01 is paper waste low severity', () => {
    const item = printingCriteria.find(i => i.id === 'PRT-04-01');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('low');
  });

  it('axes cover expected domains', () => {
    const axes = new Set(printingCriteria.map(i => i.axis));
    expect(axes.has('هوية المنشأة والوثائق')).toBe(true);
    expect(axes.has('تسيير النفايات الكيميائية')).toBe(true);
    expect(axes.has('السلامة المهنية')).toBe(true);
  });
});

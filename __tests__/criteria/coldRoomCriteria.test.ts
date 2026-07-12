import { coldRoomSpecificCriteria } from '../../src/criteria/coldRoomCriteria';

describe('coldRoomSpecificCriteria', () => {
  it('should export an array', () => {
    expect(Array.isArray(coldRoomSpecificCriteria)).toBe(true);
  });

  it('should contain exactly 7 items', () => {
    expect(coldRoomSpecificCriteria).toHaveLength(7);
  });

  it('should have no duplicate IDs', () => {
    const ids = coldRoomSpecificCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs should match CLD-17-XX pattern', () => {
    coldRoomSpecificCriteria.forEach(item => {
      expect(item.id).toMatch(/^CLD-17-\d{2}$/);
    });
  });

  it('all items should have complianceStatus not-evaluated', () => {
    coldRoomSpecificCriteria.forEach(item => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('all items should have non-empty criteria, legalReference, and axis', () => {
    coldRoomSpecificCriteria.forEach(item => {
      expect(item.criteria.trim().length).toBeGreaterThan(0);
      expect(item.legalReference.trim().length).toBeGreaterThan(0);
      expect(item.axis.trim().length).toBeGreaterThan(0);
    });
  });

  it('severity should be valid for all items', () => {
    coldRoomSpecificCriteria.forEach(item => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('CLD-17-01 should be doc controlType for exploitation licence', () => {
    const item = coldRoomSpecificCriteria.find(i => i.id === 'CLD-17-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('CLD-17-03 thermometer should be test controlType', () => {
    const item = coldRoomSpecificCriteria.find(i => i.id === 'CLD-17-03');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('test');
    expect(item!.axis).toBe('التحكم الحراري');
  });

  it('CLD-17-04 temperature limits should be measurement controlType with numericField', () => {
    const item = coldRoomSpecificCriteria.find(i => i.id === 'CLD-17-04');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('measurement');
    expect(item!.numericField).toBeDefined();
    expect(item!.numericField!.unit).toBe('\u00b0C');
    expect(item!.numericField!.min).toBe(-100);
    expect(item!.numericField!.max).toBe(5);
    expect(item!.numericField!.warningMax).toBe(7);
    expect(item!.numericField!.upperLimit).toBe(true);
  });

  it('CLD-17-06 cleanliness should be medium severity', () => {
    const item = coldRoomSpecificCriteria.find(i => i.id === 'CLD-17-06');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('medium');
    expect(item!.controlType).toBe('visual');
  });

  it('CLD-17-07 should require full traceability records (doc)', () => {
    const item = coldRoomSpecificCriteria.find(i => i.id === 'CLD-17-07');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
    expect(item!.axis).toBe('هوية المنشأة والوثائق');
  });

  it('should cover all expected axes', () => {
    const axes = new Set(coldRoomSpecificCriteria.map(i => i.axis));
    expect(axes.has('هوية المنشأة والوثائق')).toBe(true);
    expect(axes.has('التحكم الحراري')).toBe(true);
    expect(axes.has('تنظيم التخزين')).toBe(true);
    expect(axes.has('النظافة ومكافحة النواقل')).toBe(true);
    expect(axes.has('المبنى والتهيئة')).toBe(true);
  });
});

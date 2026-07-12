import { produceStorageCriteria } from '../../src/criteria/produceStorageCriteria';

describe('produceStorageCriteria', () => {
  it('should export an array', () => {
    expect(Array.isArray(produceStorageCriteria)).toBe(true);
  });

  it('should contain exactly 10 items', () => {
    expect(produceStorageCriteria).toHaveLength(10);
  });

  it('should have no duplicate IDs', () => {
    const ids = produceStorageCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs should match PRD-XX-XX pattern', () => {
    produceStorageCriteria.forEach(item => {
      expect(item.id).toMatch(/^PRD-\d{2}-\d{2}$/);
    });
  });

  it('all items should have complianceStatus not-evaluated', () => {
    produceStorageCriteria.forEach(item => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('all items should have non-empty criteria, legalReference, and axis', () => {
    produceStorageCriteria.forEach(item => {
      expect(item.criteria.trim().length).toBeGreaterThan(0);
      expect(item.legalReference.trim().length).toBeGreaterThan(0);
      expect(item.axis.trim().length).toBeGreaterThan(0);
    });
  });

  it('severity should be valid for all items', () => {
    produceStorageCriteria.forEach(item => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('PRD-01-01 operating licence should be doc and high', () => {
    const item = produceStorageCriteria.find(i => i.id === 'PRD-01-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('PRD-02-01 temperature control should be measurement type', () => {
    const item = produceStorageCriteria.find(i => i.id === 'PRD-02-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('measurement');
    expect(item!.severity).toBe('high');
    expect(item!.axis).toBe('شروط التخزين');
  });

  it('PRD-02-02 off-floor storage should be medium severity', () => {
    const item = produceStorageCriteria.find(i => i.id === 'PRD-02-02');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('medium');
    expect(item!.controlType).toBe('visual');
  });

  it('PRD-02-03 product separation should be medium severity', () => {
    const item = produceStorageCriteria.find(i => i.id === 'PRD-02-03');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('medium');
  });

  it('PRD-03-02 cleaning programme should be doc medium', () => {
    const item = produceStorageCriteria.find(i => i.id === 'PRD-03-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('medium');
  });

  it('PRD-04-01 pest control programme should be doc high', () => {
    const item = produceStorageCriteria.find(i => i.id === 'PRD-04-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
    expect(item!.axis).toBe('مكافحة الآفات');
  });

  it('PRD-05-01 removal of spoiled produce should be visual high', () => {
    const item = produceStorageCriteria.find(i => i.id === 'PRD-05-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('PRD-05-02 traceability register should be doc medium', () => {
    const item = produceStorageCriteria.find(i => i.id === 'PRD-05-02');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('medium');
    expect(item!.axis).toBe('التتبعية');
  });

  it('should cover all expected axes', () => {
    const axes = new Set(produceStorageCriteria.map(i => i.axis));
    expect(axes.has('هوية المنشأة والوثائق')).toBe(true);
    expect(axes.has('شروط التخزين')).toBe(true);
    expect(axes.has('نظافة فضاءات التخزين')).toBe(true);
    expect(axes.has('مكافحة الآفات')).toBe(true);
    expect(axes.has('التتبعية')).toBe(true);
  });
});

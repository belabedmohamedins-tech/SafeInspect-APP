import { produceStorageCriteria } from '../../src/criteria/produceStorageCriteria';

describe('produceStorageCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(produceStorageCriteria)).toBe(true);
  });

  it('should contain exactly 7 items', () => {
    expect(produceStorageCriteria).toHaveLength(7);
  });

  it('should have no duplicate IDs', () => {
    const ids = produceStorageCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs follow PRD- prefix', () => {
    produceStorageCriteria.forEach(item => expect(item.id).toMatch(/^PRD-/));
  });

  it('all items have required fields', () => {
    produceStorageCriteria.forEach(item => {
      expect(item.id).toBeDefined();
      expect(item.axis).toBeDefined();
      expect(item.criteria).toBeDefined();
      expect(item.severity).toBeDefined();
      expect(item.controlType).toBeDefined();
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('PRD-01-01 is licence doc high', () => {
    const item = produceStorageCriteria.find(i => i.id === 'PRD-01-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('PRD-02-01 is temperature/humidity measurement high', () => {
    const item = produceStorageCriteria.find(i => i.id === 'PRD-02-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('measurement');
    expect(item!.severity).toBe('high');
  });

  it('PRD-05-01 is spoiled produce removal visual high', () => {
    const item = produceStorageCriteria.find(i => i.id === 'PRD-05-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('visual');
    expect(item!.severity).toBe('high');
  });

  it('axes cover expected domains', () => {
    const axes = new Set(produceStorageCriteria.map(i => i.axis));
    expect(axes.has('هوية المنشأة والوثائق')).toBe(true);
    expect(axes.has('شروط التخزين')).toBe(true);
    expect(axes.has('نظافة فضاءات التخزين')).toBe(true);
  });
});

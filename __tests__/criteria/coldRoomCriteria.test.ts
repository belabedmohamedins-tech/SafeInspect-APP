import { coldRoomSpecificCriteria } from '../../src/criteria/coldRoomCriteria';

describe('coldRoomSpecificCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(coldRoomSpecificCriteria)).toBe(true);
    expect(coldRoomSpecificCriteria.length).toBeGreaterThan(0);
  });

  it('all IDs are unique', () => {
    const ids = coldRoomSpecificCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs match CLD-1X-XX pattern (17, 18, or 19)', () => {
    coldRoomSpecificCriteria.forEach(item =>
      expect(item.id).toMatch(/^CLD-1[789]-\d{2}$/)
    );
  });

  it('all items have required fields', () => {
    coldRoomSpecificCriteria.forEach(item => {
      expect(item.id).toBeDefined();
      expect(item.axis).toBeDefined();
      expect(item.criteria).toBeDefined();
      expect(item.severity).toBeDefined();
      expect(item.controlType).toBeDefined();
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('severity values are valid', () => {
    coldRoomSpecificCriteria.forEach(item =>
      expect(['low', 'medium', 'high']).toContain(item.severity)
    );
  });

  it('measurement items with numericField have valid unit', () => {
    coldRoomSpecificCriteria
      .filter(i => i.controlType === 'measurement' && i.numericField)
      .forEach(item => expect(item.numericField!.unit).toBeTruthy());
  });

  it('axes cover expected domains', () => {
    const axes = new Set(coldRoomSpecificCriteria.map(i => i.axis));
    expect(axes.size).toBeGreaterThan(2);
  });

  it('contains EIA criterion CLD-19-01', () => {
    const item = coldRoomSpecificCriteria.find(i => i.id === 'CLD-19-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
    expect(item!.axis).toBe('دراسة التأثير البيئي');
  });
});

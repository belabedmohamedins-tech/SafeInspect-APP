import { blacksmithCriteria } from '../../src/criteria/blacksmithCriteria';

describe('blacksmithCriteria', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(blacksmithCriteria)).toBe(true);
    expect(blacksmithCriteria.length).toBeGreaterThan(0);
  });

  it('should have no duplicate IDs', () => {
    const ids = blacksmithCriteria.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all items have required fields', () => {
    blacksmithCriteria.forEach(item => {
      expect(item.id).toBeDefined();
      expect(item.axis).toBeDefined();
      expect(item.criteria).toBeDefined();
      expect(item.severity).toBeDefined();
      expect(item.controlType).toBeDefined();
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  // blacksmithCriteria spreads baseCompressedGasCriteria (CGS- prefix) — both prefixes are valid
  it('all IDs are BLS- or CGS- prefix', () => {
    blacksmithCriteria.forEach(item =>
      expect(item.id).toMatch(/^(BLS|CGS)-/)
    );
  });

  it('severity values are valid', () => {
    blacksmithCriteria.forEach(item =>
      expect(['low', 'medium', 'high']).toContain(item.severity)
    );
  });

  it('should have items covering السلامة المهنية axis', () => {
    const safety = blacksmithCriteria.filter(i => i.axis === 'السلامة المهنية');
    expect(safety.length).toBeGreaterThan(0);
  });

  it('axes cover expected domains', () => {
    const axes = new Set(blacksmithCriteria.map(i => i.axis));
    expect(axes.has('الموقع والتهيئة')).toBe(true);
    expect(axes.has('السلامة المهنية')).toBe(true);
  });
});

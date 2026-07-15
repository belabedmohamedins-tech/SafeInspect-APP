import { gplCriteria } from '../criteria/gplCriteria';
import { InspectionItem } from '../types';

describe('gplCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(gplCriteria)).toBe(true);
  });

  // GPL-05-01 added in Phase 10.2 (EIA trigger criterion) → 11 items
  it('contains exactly 11 criteria', () => {
    expect(gplCriteria).toHaveLength(11);
  });

  it('has no duplicate IDs', () => {
    const ids = gplCriteria.map((c: InspectionItem) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs match GPL-XX-XX pattern', () => {
    gplCriteria.forEach((c: InspectionItem) => {
      expect(c.id).toMatch(/^GPL-\d{2}-\d{2}$/);
    });
  });

  it('all items have complianceStatus not-evaluated', () => {
    gplCriteria.forEach((item: InspectionItem) => {
      expect(item.complianceStatus).toBe('not-evaluated');
    });
  });

  it('all severity values are valid', () => {
    gplCriteria.forEach((item: InspectionItem) => {
      expect(['high', 'medium', 'low']).toContain(item.severity);
    });
  });

  it('GPL-01-01 operating license is high severity doc', () => {
    const item = gplCriteria.find((c: InspectionItem) => c.id === 'GPL-01-01');
    expect(item).toBeDefined();
    expect(item!.severity).toBe('high');
    expect(item!.controlType).toBe('doc');
  });

  it('GPL-05-01 EIA criterion exists (Phase 10.2)', () => {
    const item = gplCriteria.find((c: InspectionItem) => c.id === 'GPL-05-01');
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('GPL-03-03 emergency plan cites Décret 09-335 not 09-410', () => {
    const item = gplCriteria.find((c: InspectionItem) => c.id === 'GPL-03-03');
    expect(item).toBeDefined();
    expect(item!.legalReference).toContain('09-335');
    expect(item!.legalReference).not.toContain('09-410');
  });

  it('has fire prevention criteria (GPL-03-xx axis)', () => {
    const fireItems = gplCriteria.filter(
      (c: InspectionItem) => c.axis === 'الوقاية من الحريق والانفجار'
    );
    expect(fireItems.length).toBeGreaterThanOrEqual(3);
  });
});

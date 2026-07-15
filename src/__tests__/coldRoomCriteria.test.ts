import { coldRoomSpecificCriteria } from '../criteria/coldRoomCriteria';
import { InspectionItem } from '../types';

describe('coldRoomSpecificCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(coldRoomSpecificCriteria)).toBe(true);
  });

  it('contains exactly 8 criteria', () => {
    expect(coldRoomSpecificCriteria).toHaveLength(8);
  });

  it('has no duplicate IDs', () => {
    const ids = coldRoomSpecificCriteria.map((c: InspectionItem) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs follow the CLD-1X-XX or CLD-19-XX pattern', () => {
    coldRoomSpecificCriteria.forEach((c: InspectionItem) => {
      expect(c.id).toMatch(/^CLD-1\d-\d{2}$/);
    });
  });

  it('all items have a valid severity', () => {
    const valid = ['low', 'medium', 'high'];
    coldRoomSpecificCriteria.forEach((c: InspectionItem) => {
      expect(valid).toContain(c.severity);
    });
  });

  it('all items have a non-empty legalReference', () => {
    coldRoomSpecificCriteria.forEach((c: InspectionItem) => {
      expect(c.legalReference).toBeTruthy();
      expect(c.legalReference.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items have a non-empty criteria text', () => {
    coldRoomSpecificCriteria.forEach((c: InspectionItem) => {
      expect(c.criteria).toBeTruthy();
      expect(c.criteria.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items have a non-empty axis', () => {
    coldRoomSpecificCriteria.forEach((c: InspectionItem) => {
      expect(c.axis).toBeTruthy();
    });
  });

  it('all items default to not-evaluated', () => {
    coldRoomSpecificCriteria.forEach((c: InspectionItem) => {
      expect(c.complianceStatus).toBe('not-evaluated');
    });
  });

  it('majority of items are high severity (cold chain critical)', () => {
    const highCount = coldRoomSpecificCriteria.filter(
      (c: InspectionItem) => c.severity === 'high'
    ).length;
    expect(highCount).toBeGreaterThanOrEqual(5);
  });

  it('covers expected axes', () => {
    const axes = new Set(coldRoomSpecificCriteria.map((c: InspectionItem) => c.axis));
    expect(axes).toContain('هوية المنشأة والوثائق');
    expect(axes).toContain('التحكم الحراري');
    expect(axes).toContain('تنظيم التخزين');
    expect(axes).toContain('النظافة ومكافحة النواقل');
  });

  it('temperature measurement criterion CLD-17-04 has numericField', () => {
    const item = coldRoomSpecificCriteria.find(
      (c: InspectionItem) => c.id === 'CLD-17-04'
    );
    expect(item).toBeDefined();
    expect(item!.numericField).toBeDefined();
    expect(item!.numericField!.unit).toBe('°C');
    expect(item!.numericField!.min).toBeLessThan(0);
    expect(item!.numericField!.max).toBe(5);
    expect(item!.numericField!.warningMax).toBe(7);
  });

  it('CLD-17-07 is removed (deduped to baseFoodCriteria)', () => {
    const item = coldRoomSpecificCriteria.find(
      (c: InspectionItem) => c.id === 'CLD-17-07'
    );
    expect(item).toBeUndefined();
  });

  it('HACCP criterion CLD-18-01 exists and is a doc', () => {
    const item = coldRoomSpecificCriteria.find(
      (c: InspectionItem) => c.id === 'CLD-18-01'
    );
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });

  it('EIA criterion CLD-19-01 exists and is high severity doc', () => {
    const item = coldRoomSpecificCriteria.find(
      (c: InspectionItem) => c.id === 'CLD-19-01'
    );
    expect(item).toBeDefined();
    expect(item!.controlType).toBe('doc');
    expect(item!.severity).toBe('high');
  });
});

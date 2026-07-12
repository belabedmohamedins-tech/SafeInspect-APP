import { carWashCriteria } from '../criteria/carWashCriteria';
import { InspectionItem } from '../types';

describe('carWashCriteria', () => {
  it('exports an array', () => {
    expect(Array.isArray(carWashCriteria)).toBe(true);
  });

  it('contains exactly 10 criteria', () => {
    expect(carWashCriteria).toHaveLength(10);
  });

  it('has no duplicate IDs', () => {
    const ids = carWashCriteria.map((c: InspectionItem) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs follow the CWS-XX-XX pattern', () => {
    carWashCriteria.forEach((c: InspectionItem) => {
      expect(c.id).toMatch(/^CWS-\d{2}-\d{2}$/);
    });
  });

  it('all items have a valid severity', () => {
    const valid = ['low', 'medium', 'high'];
    carWashCriteria.forEach((c: InspectionItem) => {
      expect(valid).toContain(c.severity);
    });
  });

  it('all items have a non-empty legalReference', () => {
    carWashCriteria.forEach((c: InspectionItem) => {
      expect(c.legalReference).toBeTruthy();
      expect(c.legalReference.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items have a non-empty criteria text', () => {
    carWashCriteria.forEach((c: InspectionItem) => {
      expect(c.criteria).toBeTruthy();
      expect(c.criteria.trim().length).toBeGreaterThan(0);
    });
  });

  it('all items have a non-empty axis', () => {
    carWashCriteria.forEach((c: InspectionItem) => {
      expect(c.axis).toBeTruthy();
    });
  });

  it('all items default to not-evaluated', () => {
    carWashCriteria.forEach((c: InspectionItem) => {
      expect(c.complianceStatus).toBe('not-evaluated');
    });
  });

  it('severity distribution: has high-severity items for critical environmental risks', () => {
    const highCount = carWashCriteria.filter((c: InspectionItem) => c.severity === 'high').length;
    // CWS has multiple high-severity items (flooring, oil discharge, chemicals)
    expect(highCount).toBeGreaterThanOrEqual(4);
  });

  it('covers expected axes', () => {
    const axes = new Set(carWashCriteria.map((c: InspectionItem) => c.axis));
    expect(axes).toContain('هوية المنشأة والوثائق');
    expect(axes).toContain('تسيير مياه الغسل');
    expect(axes).toContain('المواد الكيميائية');
    expect(axes).toContain('النظافة والسلامة');
  });
});

// src/__tests__/briefService.test.ts
import { generateBrief } from '../services/briefService';
import { InspectionItem } from '../types';

const makeItem = (overrides: Partial<InspectionItem> = {}): InspectionItem => ({
  id: 'item-1',
  criteria: 'Test criteria',
  legalReference: '',
  axis: 'Hygiene',
  complianceStatus: 'non-compliant',
  comment: '',
  severity: 'high',
  ...overrides,
});

describe('generateBrief', () => {
  it('returns a string', () => {
    const result = generateBrief([makeItem()]);
    expect(typeof result).toBe('string');
  });

  it('handles empty array', () => {
    const result = generateBrief([]);
    expect(typeof result).toBe('string');
  });
});

// src/__tests__/CriteriaPreviewStore.test.ts
import { InspectionItem } from '../types';

const makeItem = (id: string): InspectionItem => ({
  id,
  criteria:         'Test criterion',
  legalReference:   '',
  axis:             'Hygiene',
  complianceStatus: 'not-evaluated',
  comment:          '',
  severity:         'medium',
});

describe('CriteriaPreviewStore fixtures', () => {
  it('makeItem produces a valid InspectionItem', () => {
    const item = makeItem('item-1');
    expect(item.id).toBe('item-1');
    expect(item.severity).toBe('medium');
  });
});

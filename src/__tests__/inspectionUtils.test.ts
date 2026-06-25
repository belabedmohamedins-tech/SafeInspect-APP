import { InspectionItem } from '../types';
import { getEvaluatedCount, groupByAxis } from '../utils/inspectionUtils';

function makeItem(overrides: Partial<InspectionItem> = {}): InspectionItem {
  return {
    id: Math.random().toString(),
    criteria: 'c1',
    legalReference: '',
    severity: 'low',
    axis: 'المحور 1',
    category: 'نظافة',
    complianceStatus: 'not-evaluated',
    ...overrides,
  };
}

describe('getEvaluatedCount', () => {
  it('counts only evaluated items', () => {
    const items = [
      makeItem({ complianceStatus: 'compliant' }),
      makeItem({ complianceStatus: 'non-compliant' }),
      makeItem({ complianceStatus: 'not-evaluated' }),
    ];
    expect(getEvaluatedCount(items)).toBe(2);
  });

  it('returns 0 for an empty array', () => {
    expect(getEvaluatedCount([])).toBe(0);
  });
});

describe('groupByAxis', () => {
  it('groups items by axis', () => {
    const items = [
      makeItem({ id: '1', axis: 'المحور 1' }),
      makeItem({ id: '2', axis: 'المحور 1' }),
      makeItem({ id: '3', axis: 'المحور 2' }),
    ];
    const result = groupByAxis(items);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('المحور 1');
    expect(result[0].data).toHaveLength(2);
    expect(result[1].title).toBe('المحور 2');
    expect(result[1].data).toHaveLength(1);
  });

  it('returns empty array for empty input', () => {
    expect(groupByAxis([])).toEqual([]);
  });
});
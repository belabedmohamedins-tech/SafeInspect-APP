// __tests__/utils/statusUtils.test.ts
// Mock constants at the path statusUtils uses: '../../constants'
jest.mock('../../constants', () => ({
  Colors: {
    compliant:    '#27ae60',
    nonCompliant: '#e74c3c',
    warning:      '#f39c12',
  },
}), { virtual: true });

import { getStatusText, getStatusColor, getComplianceSummary } from '../../src/utils/statusUtils';

describe('getStatusText', () => {
  it('compliant', () => expect(getStatusText('compliant')).toBe('مطابق'));
  it('non-compliant', () => expect(getStatusText('non-compliant')).toBe('غير مطابق'));
  it('na', () => expect(getStatusText('na')).toBe('غير معني'));
  it('partial', () => expect(getStatusText('partial')).toBe('جزئي'));
  it('unknown default', () => expect(getStatusText('unknown' as any)).toBe('لم يقيم'));
});

describe('getStatusColor', () => {
  it('compliant', () => expect(getStatusColor('compliant')).toBe('#27ae60'));
  it('non-compliant', () => expect(getStatusColor('non-compliant')).toBe('#e74c3c'));
  it('na', () => expect(getStatusColor('na')).toBe('#9e9e9e'));
  it('default (partial)', () => expect(getStatusColor('partial')).toBe('#f39c12'));
});

describe('getComplianceSummary', () => {
  it('empty array', () => {
    expect(getComplianceSummary([])).toEqual({ total: 0, compliant: 0, nonCompliant: 0, na: 0, notEvaluated: 0 });
  });

  it('counts correctly', () => {
    const items = [
      { complianceStatus: 'compliant' },
      { complianceStatus: 'compliant' },
      { complianceStatus: 'non-compliant' },
      { complianceStatus: 'na' },
      { complianceStatus: 'not-evaluated' },
    ];
    const r = getComplianceSummary(items);
    expect(r.total).toBe(5);
    expect(r.compliant).toBe(2);
    expect(r.nonCompliant).toBe(1);
    expect(r.na).toBe(1);
    expect(r.notEvaluated).toBe(1);
  });
});

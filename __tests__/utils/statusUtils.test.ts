// __tests__/utils/statusUtils.test.ts
// statusUtils imports Colors from constants — mock that path
jest.mock('../../../constants', () => ({
  Colors: {
    compliant: '#4caf50',
    nonCompliant: '#f44336',
    warning: '#ff9800',
  },
}), { virtual: true });

import { getStatusText, getStatusColor, getComplianceSummary } from '../../src/utils/statusUtils';

describe('getStatusText', () => {
  it('compliant → مطابق', () => expect(getStatusText('compliant')).toBe('مطابق'));
  it('non-compliant → غير مطابق', () => expect(getStatusText('non-compliant')).toBe('غير مطابق'));
  it('na → غير معني', () => expect(getStatusText('na')).toBe('غير معني'));
  it('partial → جزئي', () => expect(getStatusText('partial')).toBe('جزئي'));
  it('unknown → لم يقيم', () => expect(getStatusText('unknown' as any)).toBe('لم يقيم'));
});

describe('getStatusColor', () => {
  it('compliant → Colors.compliant', () => expect(getStatusColor('compliant')).toBe('#4caf50'));
  it('non-compliant → Colors.nonCompliant', () => expect(getStatusColor('non-compliant')).toBe('#f44336'));
  it('na → #9e9e9e', () => expect(getStatusColor('na')).toBe('#9e9e9e'));
  it('default (partial/unknown) → Colors.warning', () => expect(getStatusColor('partial')).toBe('#ff9800'));
});

describe('getComplianceSummary', () => {
  it('empty array → all zeros', () => {
    const r = getComplianceSummary([]);
    expect(r).toEqual({ total: 0, compliant: 0, nonCompliant: 0, na: 0, notEvaluated: 0 });
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

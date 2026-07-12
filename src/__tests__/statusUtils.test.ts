// src/__tests__/statusUtils.test.ts
// statusUtils imports Colors from '../../constants' — mock it at L4.
jest.mock('../../constants', () => ({
  Colors: {
    compliant:    '#4caf50',
    nonCompliant: '#f44336',
    warning:      '#ff9800',
  },
}));

import {
  getStatusText,
  getStatusColor,
  getComplianceSummary,
} from '../../src/utils/statusUtils';

describe('getStatusText', () => {
  it('returns Arabic text for compliant', () => {
    expect(getStatusText('compliant')).toBe('مطابق');
  });
  it('returns Arabic text for non-compliant', () => {
    expect(getStatusText('non-compliant')).toBe('غير مطابق');
  });
  it('returns Arabic text for na', () => {
    expect(getStatusText('na')).toBe('غير معني');
  });
  it('returns Arabic text for partial', () => {
    expect(getStatusText('partial')).toBe('جزئي');
  });
  it('returns fallback for unknown status', () => {
    expect(getStatusText('unknown' as any)).toBe('لم يقيم');
  });
});

describe('getStatusColor', () => {
  it('returns compliant color', () => {
    expect(getStatusColor('compliant')).toBe('#4caf50');
  });
  it('returns nonCompliant color', () => {
    expect(getStatusColor('non-compliant')).toBe('#f44336');
  });
  it('returns gray for na', () => {
    expect(getStatusColor('na')).toBe('#9e9e9e');
  });
  it('returns warning color for unknown', () => {
    expect(getStatusColor('unknown' as any)).toBe('#ff9800');
  });
});

describe('getComplianceSummary', () => {
  it('counts all statuses correctly', () => {
    const items = [
      { complianceStatus: 'compliant' },
      { complianceStatus: 'compliant' },
      { complianceStatus: 'non-compliant' },
      { complianceStatus: 'na' },
      { complianceStatus: 'not-evaluated' }, // counted in notEvaluated
    ];
    const r = getComplianceSummary(items);
    expect(r.total).toBe(5);
    expect(r.compliant).toBe(2);
    expect(r.nonCompliant).toBe(1);
    expect(r.na).toBe(1);
    expect(r.notEvaluated).toBe(1);
  });

  it('returns all zeros for empty list', () => {
    const r = getComplianceSummary([]);
    expect(r).toEqual({ total: 0, compliant: 0, nonCompliant: 0, na: 0, notEvaluated: 0 });
  });
});

// __tests__/utils/statusUtils.test.ts
//
// Full coverage for src/utils/statusUtils.ts
// Colors constant is already mapped by L2 moduleNameMapper.
// Pure switch/case logic — no mocks needed beyond Colors.

jest.mock('../../constants', () => ({
  Colors: {
    compliant:    '#4caf50',
    nonCompliant: '#f44336',
    warning:      '#ff9800',
  },
}));

import { getStatusText, getStatusColor, getComplianceSummary } from '../../src/utils/statusUtils';

// ── getStatusText ─────────────────────────────────────────────────────────────

describe('getStatusText', () => {
  it('returns "مطابق" for compliant', () => {
    expect(getStatusText('compliant')).toBe('مطابق');
  });

  it('returns "غير مطابق" for non-compliant', () => {
    expect(getStatusText('non-compliant')).toBe('غير مطابق');
  });

  it('returns "غير معني" for na', () => {
    expect(getStatusText('na')).toBe('غير معني');
  });

  it('returns "جزئي" for partial', () => {
    expect(getStatusText('partial')).toBe('جزئي');
  });

  it('returns "لم يقيم" for unknown/default', () => {
    expect(getStatusText('not-evaluated' as any)).toBe('لم يقيم');
  });
});

// ── getStatusColor ───────────────────────────────────────────────────────────

describe('getStatusColor', () => {
  it('returns Colors.compliant for compliant', () => {
    expect(getStatusColor('compliant')).toBe('#4caf50');
  });

  it('returns Colors.nonCompliant for non-compliant', () => {
    expect(getStatusColor('non-compliant')).toBe('#f44336');
  });

  it('returns #9e9e9e for na', () => {
    expect(getStatusColor('na')).toBe('#9e9e9e');
  });

  it('returns Colors.warning for default (partial / not-evaluated)', () => {
    expect(getStatusColor('partial')).toBe('#ff9800');
    expect(getStatusColor('not-evaluated' as any)).toBe('#ff9800');
  });
});

// ── getComplianceSummary ───────────────────────────────────────────────────────

describe('getComplianceSummary', () => {
  it('returns all zeros for empty array', () => {
    expect(getComplianceSummary([])).toEqual({
      total: 0, compliant: 0, nonCompliant: 0, na: 0, notEvaluated: 0,
    });
  });

  it('counts compliant items', () => {
    const items = [
      { complianceStatus: 'compliant' },
      { complianceStatus: 'compliant' },
    ];
    const r = getComplianceSummary(items);
    expect(r.compliant).toBe(2);
    expect(r.total).toBe(2);
  });

  it('counts non-compliant items', () => {
    const items = [{ complianceStatus: 'non-compliant' }];
    const r = getComplianceSummary(items);
    expect(r.nonCompliant).toBe(1);
  });

  it('counts na items', () => {
    const items = [{ complianceStatus: 'na' }];
    const r = getComplianceSummary(items);
    expect(r.na).toBe(1);
  });

  it('counts notEvaluated as total minus compliant/nonCompliant/na', () => {
    const items = [
      { complianceStatus: 'compliant' },
      { complianceStatus: 'non-compliant' },
      { complianceStatus: 'na' },
      { complianceStatus: 'not-evaluated' },
      { complianceStatus: 'observation-only' },
    ];
    const r = getComplianceSummary(items);
    expect(r.total).toBe(5);
    expect(r.notEvaluated).toBe(2); // not-evaluated + observation-only
  });

  it('handles all items as not-evaluated', () => {
    const items = Array(4).fill({ complianceStatus: 'not-evaluated' });
    const r = getComplianceSummary(items);
    expect(r.compliant).toBe(0);
    expect(r.nonCompliant).toBe(0);
    expect(r.notEvaluated).toBe(4);
  });
});

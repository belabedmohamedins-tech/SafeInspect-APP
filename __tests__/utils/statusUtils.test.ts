// __tests__/utils/statusUtils.test.ts
import { getStatusText, getStatusColor, getComplianceSummary } from '../../src/utils/statusUtils';

// statusUtils imports Colors from constants — mock the module so tests have
// no dependency on the React Native runtime.
jest.mock('../../constants', () => ({
  Colors: {
    compliant: '#27ae60',
    nonCompliant: '#e74c3c',
    warning: '#f39c12',
  },
}));

// ─── getStatusText ────────────────────────────────────────────────────────────

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

  it('returns "لم يقيم" for not-evaluated (default branch)', () => {
    expect(getStatusText('not-evaluated' as any)).toBe('لم يقيم');
  });

  it('returns "لم يقيم" for any unrecognised value', () => {
    expect(getStatusText('unknown-status' as any)).toBe('لم يقيم');
  });
});

// ─── getStatusColor ───────────────────────────────────────────────────────────

describe('getStatusColor', () => {
  it('returns Colors.compliant for compliant', () => {
    expect(getStatusColor('compliant')).toBe('#27ae60');
  });

  it('returns Colors.nonCompliant for non-compliant', () => {
    expect(getStatusColor('non-compliant')).toBe('#e74c3c');
  });

  it('returns #9e9e9e for na', () => {
    expect(getStatusColor('na')).toBe('#9e9e9e');
  });

  it('returns Colors.warning (default) for not-evaluated', () => {
    expect(getStatusColor('not-evaluated' as any)).toBe('#f39c12');
  });

  it('returns Colors.warning for partial', () => {
    expect(getStatusColor('partial')).toBe('#f39c12');
  });
});

// ─── getComplianceSummary ─────────────────────────────────────────────────────

describe('getComplianceSummary', () => {
  it('handles empty array', () => {
    const result = getComplianceSummary([]);
    expect(result).toEqual({ total: 0, compliant: 0, nonCompliant: 0, na: 0, notEvaluated: 0 });
  });

  it('correctly counts each status', () => {
    const items = [
      { complianceStatus: 'compliant' },
      { complianceStatus: 'compliant' },
      { complianceStatus: 'non-compliant' },
      { complianceStatus: 'na' },
      { complianceStatus: 'not-evaluated' },
      { complianceStatus: 'not-evaluated' },
    ];
    const result = getComplianceSummary(items);
    expect(result.total).toBe(6);
    expect(result.compliant).toBe(2);
    expect(result.nonCompliant).toBe(1);
    expect(result.na).toBe(1);
    expect(result.notEvaluated).toBe(2);
  });

  it('notEvaluated = total - compliant - nonCompliant - na', () => {
    const items = [
      { complianceStatus: 'compliant' },
      { complianceStatus: 'non-compliant' },
      { complianceStatus: 'na' },
      { complianceStatus: 'not-evaluated' },
    ];
    const { total, compliant, nonCompliant, na, notEvaluated } = getComplianceSummary(items);
    expect(notEvaluated).toBe(total - compliant - nonCompliant - na);
  });

  it('all compliant produces notEvaluated = 0', () => {
    const items = [
      { complianceStatus: 'compliant' },
      { complianceStatus: 'compliant' },
    ];
    expect(getComplianceSummary(items).notEvaluated).toBe(0);
  });
});

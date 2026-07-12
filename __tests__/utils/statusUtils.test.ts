// __tests__/utils/statusUtils.test.ts
// statusUtils imports Colors from '../../constants' (real file, no mock needed)
import { getStatusText, getStatusColor, getComplianceSummary } from '../../src/utils/statusUtils';

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
  it('returns default text for unknown status', () => {
    expect(getStatusText('unknown' as any)).toBe('لم يقيم');
  });
});

describe('getStatusColor', () => {
  it('returns a string for compliant', () => {
    expect(typeof getStatusColor('compliant')).toBe('string');
    expect(getStatusColor('compliant').length).toBeGreaterThan(0);
  });
  it('returns a string for non-compliant', () => {
    expect(typeof getStatusColor('non-compliant')).toBe('string');
  });
  it('returns #9e9e9e for na', () => {
    expect(getStatusColor('na')).toBe('#9e9e9e');
  });
  it('returns a string for partial (default/warning)', () => {
    expect(typeof getStatusColor('partial')).toBe('string');
  });
});

describe('getComplianceSummary', () => {
  const items = [
    { complianceStatus: 'compliant' },
    { complianceStatus: 'compliant' },
    { complianceStatus: 'non-compliant' },
    { complianceStatus: 'na' },
    { complianceStatus: 'not-evaluated' },
  ];

  it('counts total correctly', () => {
    expect(getComplianceSummary(items).total).toBe(5);
  });
  it('counts compliant correctly', () => {
    expect(getComplianceSummary(items).compliant).toBe(2);
  });
  it('counts nonCompliant correctly', () => {
    expect(getComplianceSummary(items).nonCompliant).toBe(1);
  });
  it('counts na correctly', () => {
    expect(getComplianceSummary(items).na).toBe(1);
  });
  it('counts notEvaluated correctly', () => {
    expect(getComplianceSummary(items).notEvaluated).toBe(1);
  });
  it('returns zeros for empty array', () => {
    const r = getComplianceSummary([]);
    expect(r).toEqual({ total: 0, compliant: 0, nonCompliant: 0, na: 0, notEvaluated: 0 });
  });
});

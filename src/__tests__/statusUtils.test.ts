import { getComplianceSummary, getStatusColor, getStatusText } from '../utils/statusUtils';

// ─── getStatusText ────────────────────────────────────────────────────────────

describe('getStatusText', () => {
  it('returns مطابق for compliant', () => {
    expect(getStatusText('compliant')).toBe('مطابق');
  });

  it('returns غير مطابق for non-compliant', () => {
    expect(getStatusText('non-compliant')).toBe('غير مطابق');
  });

  it('returns غير معني for na', () => {
    expect(getStatusText('na')).toBe('غير معني');
  });

  it('returns لم يقيم for unknown/default', () => {
    expect(getStatusText('not-evaluated' as any)).toBe('لم يقيم');
  });
});

// ─── getStatusColor ───────────────────────────────────────────────────────────

describe('getStatusColor', () => {
  it('returns green for compliant', () => {
    expect(getStatusColor('compliant')).toBe('#27ae60');
  });

  it('returns red for non-compliant', () => {
    expect(getStatusColor('non-compliant')).toBe('#e74c3c');
  });

  it('returns grey for na', () => {
    expect(getStatusColor('na')).toBe('#9e9e9e');
  });

  it('returns orange for default/not-evaluated', () => {
    expect(getStatusColor('not-evaluated' as any)).toBe('#f39c12');
  });
});

// ─── getComplianceSummary ─────────────────────────────────────────────────────

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

  it('counts notEvaluated as remainder', () => {
    expect(getComplianceSummary(items).notEvaluated).toBe(1);
  });

  it('handles empty array', () => {
    const result = getComplianceSummary([]);
    expect(result.total).toBe(0);
    expect(result.compliant).toBe(0);
    expect(result.notEvaluated).toBe(0);
  });
});
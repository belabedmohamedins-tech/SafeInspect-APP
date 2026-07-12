// __tests__/utils/statusUtils.test.ts
import { getStatusText, getStatusColor, getComplianceSummary } from '../../src/utils/statusUtils';
import { Colors } from '../../constants';

describe('getStatusText', () => {
  it('compliant → Arabic text', () => {
    expect(getStatusText('compliant')).toBe('مطابق');
  });

  it('non-compliant → Arabic text', () => {
    expect(getStatusText('non-compliant')).toBe('غير مطابق');
  });

  it('na → Arabic text', () => {
    expect(getStatusText('na')).toBe('غير معني');
  });

  it('partial → Arabic text', () => {
    expect(getStatusText('partial')).toBe('جزئي');
  });

  it('unknown → default Arabic text', () => {
    expect(getStatusText('unknown' as any)).toBe('لم يقيم');
  });
});

describe('getStatusColor', () => {
  it('compliant → Colors.compliant', () => {
    expect(getStatusColor('compliant')).toBe(Colors.compliant);
  });

  it('non-compliant → Colors.nonCompliant', () => {
    expect(getStatusColor('non-compliant')).toBe(Colors.nonCompliant);
  });

  it('na → grey hex', () => {
    expect(getStatusColor('na')).toBe('#9e9e9e');
  });

  it('partial (default) → Colors.warning', () => {
    expect(getStatusColor('partial')).toBe(Colors.warning);
  });

  it('unknown (default) → Colors.warning', () => {
    expect(getStatusColor('unknown' as any)).toBe(Colors.warning);
  });
});

describe('getComplianceSummary', () => {
  it('counts all statuses correctly', () => {
    const items = [
      { complianceStatus: 'compliant' },
      { complianceStatus: 'compliant' },
      { complianceStatus: 'non-compliant' },
      { complianceStatus: 'na' },
      { complianceStatus: 'partial' }, // not-evaluated bucket
    ];
    const r = getComplianceSummary(items);
    expect(r.total).toBe(5);
    expect(r.compliant).toBe(2);
    expect(r.nonCompliant).toBe(1);
    expect(r.na).toBe(1);
    expect(r.notEvaluated).toBe(1);
  });

  it('empty list → all zeros', () => {
    const r = getComplianceSummary([]);
    expect(r.total).toBe(0);
    expect(r.compliant).toBe(0);
    expect(r.nonCompliant).toBe(0);
    expect(r.na).toBe(0);
    expect(r.notEvaluated).toBe(0);
  });

  it('all compliant → notEvaluated 0', () => {
    const items = Array.from({ length: 3 }, () => ({ complianceStatus: 'compliant' }));
    const r = getComplianceSummary(items);
    expect(r.compliant).toBe(3);
    expect(r.notEvaluated).toBe(0);
  });
});

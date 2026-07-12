// __tests__/utils/statusUtils.test.ts
import { getStatusText, getStatusColor, getComplianceSummary } from '../../src/utils/statusUtils';

// NOTE: statusUtils imports Colors from '../../constants'
// Colors is an object — the import should resolve via moduleNameMapper or
// the actual constants file. If it fails, add a mock at L2.

// ── getStatusText ─────────────────────────────────────────────────────────────
describe('getStatusText', () => {
  it('returns Arabic text for compliant', () => {
    expect(getStatusText('compliant')).toBe('\u0645\u0637\u0627\u0628\u0642');
  });

  it('returns Arabic text for non-compliant', () => {
    expect(getStatusText('non-compliant')).toBe('\u063a\u064a\u0631 \u0645\u0637\u0627\u0628\u0642');
  });

  it('returns Arabic text for na', () => {
    expect(getStatusText('na')).toBe('\u063a\u064a\u0631 \u0645\u0639\u0646\u064a');
  });

  it('returns Arabic text for partial', () => {
    expect(getStatusText('partial')).toBe('\u062c\u0632\u0626\u064a');
  });

  it('returns default Arabic text for unknown status', () => {
    expect(getStatusText('not-evaluated' as any)).toBe('\u0644\u0645 \u064a\u0642\u064a\u0645');
  });

  it('returns default Arabic text for undefined-like status', () => {
    expect(getStatusText('something-else' as any)).toBe('\u0644\u0645 \u064a\u0642\u064a\u0645');
  });
});

// ── getStatusColor ────────────────────────────────────────────────────────────
describe('getStatusColor', () => {
  it('returns a non-empty string for compliant', () => {
    const color = getStatusColor('compliant');
    expect(typeof color).toBe('string');
    expect(color.length).toBeGreaterThan(0);
  });

  it('returns a non-empty string for non-compliant', () => {
    const color = getStatusColor('non-compliant');
    expect(typeof color).toBe('string');
    expect(color.length).toBeGreaterThan(0);
  });

  it('returns #9e9e9e for na', () => {
    expect(getStatusColor('na')).toBe('#9e9e9e');
  });

  it('returns a non-empty string for default (partial/not-evaluated)', () => {
    const color = getStatusColor('partial');
    expect(typeof color).toBe('string');
    expect(color.length).toBeGreaterThan(0);
  });

  it('returns different colors for compliant vs non-compliant', () => {
    expect(getStatusColor('compliant')).not.toBe(getStatusColor('non-compliant'));
  });
});

// ── getComplianceSummary ──────────────────────────────────────────────────────
describe('getComplianceSummary', () => {
  const makeItem = (status: string) => ({ complianceStatus: status });

  it('returns all zeros for empty array', () => {
    const result = getComplianceSummary([]);
    expect(result.total).toBe(0);
    expect(result.compliant).toBe(0);
    expect(result.nonCompliant).toBe(0);
    expect(result.na).toBe(0);
    expect(result.notEvaluated).toBe(0);
  });

  it('counts compliant items correctly', () => {
    const items = [makeItem('compliant'), makeItem('compliant'), makeItem('non-compliant')];
    const result = getComplianceSummary(items);
    expect(result.compliant).toBe(2);
    expect(result.nonCompliant).toBe(1);
    expect(result.total).toBe(3);
  });

  it('counts na items correctly', () => {
    const items = [makeItem('na'), makeItem('compliant')];
    const result = getComplianceSummary(items);
    expect(result.na).toBe(1);
    expect(result.notEvaluated).toBe(0);
  });

  it('counts not-evaluated items as remainder', () => {
    const items = [
      makeItem('compliant'),
      makeItem('not-evaluated'),
      makeItem('not-evaluated'),
    ];
    const result = getComplianceSummary(items);
    expect(result.notEvaluated).toBe(2);
    expect(result.compliant).toBe(1);
  });

  it('total = compliant + nonCompliant + na + notEvaluated', () => {
    const items = [
      makeItem('compliant'),
      makeItem('non-compliant'),
      makeItem('na'),
      makeItem('not-evaluated'),
      makeItem('partial'),  // treated as notEvaluated
    ];
    const r = getComplianceSummary(items);
    expect(r.compliant + r.nonCompliant + r.na + r.notEvaluated).toBe(r.total);
  });

  it('handles all items compliant', () => {
    const items = Array.from({ length: 5 }, () => makeItem('compliant'));
    const r = getComplianceSummary(items);
    expect(r.compliant).toBe(5);
    expect(r.nonCompliant).toBe(0);
    expect(r.notEvaluated).toBe(0);
    expect(r.na).toBe(0);
  });
});

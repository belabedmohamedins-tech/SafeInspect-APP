// __tests__/utils/fileUtils.test.ts
import { generateFileName } from '../../src/utils/fileUtils';

// ── generateFileName ────────────────────────────────────────────────────────────────
describe('generateFileName', () => {
  it('returns a string', () => {
    expect(typeof generateFileName('Report', 'pdf')).toBe('string');
  });

  it('ends with the given extension', () => {
    expect(generateFileName('Report', 'pdf')).toMatch(/\.pdf$/);
    expect(generateFileName('Export', 'csv')).toMatch(/\.csv$/);
    expect(generateFileName('Doc', 'xlsx')).toMatch(/\.xlsx$/);
  });

  it('contains a date segment matching YYYY-MM-DD', () => {
    expect(generateFileName('Report', 'pdf')).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('contains a time segment matching HH-MM', () => {
    expect(generateFileName('Report', 'pdf')).toMatch(/_\d{2}-\d{2}\./);
  });

  it('replaces spaces with underscores in the base name', () => {
    const result = generateFileName('My Report', 'pdf');
    expect(result).toMatch(/^My_Report_/);
  });

  it('removes special characters (keeps alphanumeric, Arabic, spaces, dashes)', () => {
    const result = generateFileName('Report!@#$%', 'pdf');
    // Special chars stripped — only safe chars remain before the date segment
    expect(result).toMatch(/^Report_/);
  });

  it('preserves Arabic characters in base name', () => {
    const result = generateFileName('تقرير المفتش', 'pdf');
    expect(result).toContain('تقرير');
  });

  it('handles empty base name gracefully — starts with _', () => {
    const result = generateFileName('', 'pdf');
    // safeBase will be '' — result: _YYYY-MM-DD_HH-MM.pdf
    expect(result).toMatch(/^_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}\.pdf$/);
  });

  it('base name with only special chars → stripped → starts with _', () => {
    const result = generateFileName('!!!', 'pdf');
    expect(result).toMatch(/^_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}\.pdf$/);
  });

  it('result format is safeBase_YYYY-MM-DD_HH-MM.ext', () => {
    const result = generateFileName('Audit', 'csv');
    expect(result).toMatch(/^Audit_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}\.csv$/);
  });

  it('multiple calls with same input produce same-format output', () => {
    // Both calls happen in the same second — compare structure, not exact time
    const r1 = generateFileName('Test', 'pdf');
    const r2 = generateFileName('Test', 'pdf');
    const pattern = /^Test_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}\.pdf$/;
    expect(r1).toMatch(pattern);
    expect(r2).toMatch(pattern);
  });
});

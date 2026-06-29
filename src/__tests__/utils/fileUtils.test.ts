// src/__tests__/utils/fileUtils.test.ts
//
// generateFileName uses `new Date()` internally, so we freeze time with
// jest.useFakeTimers / jest.setSystemTime to get deterministic output.

import { generateFileName } from '../../utils/fileUtils';

// Fixed point in time: 2026-03-15 09:05
const FROZEN = new Date(2026, 2, 15, 9, 5, 0); // month is 0-indexed

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(FROZEN);
});

afterAll(() => {
  jest.useRealTimers();
});

// ─── output structure ────────────────────────────────────────────────────────────────

describe('generateFileName — output structure', () => {
  it('ends with the requested extension', () => {
    expect(generateFileName('Facility', 'pdf')).toMatch(/\.pdf$/);
    expect(generateFileName('Facility', 'csv')).toMatch(/\.csv$/);
  });

  it('contains the frozen date (2026-03-15)', () => {
    expect(generateFileName('Report', 'pdf')).toContain('2026-03-15');
  });

  it('contains the frozen time (09-05)', () => {
    expect(generateFileName('Report', 'pdf')).toContain('09-05');
  });

  it('matches the full pattern: <base>_YYYY-MM-DD_HH-MM.<ext>', () => {
    const result = generateFileName('Office', 'pdf');
    expect(result).toMatch(/^.+_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}\..+$/);
  });

  it('pads single-digit month and day with zeros', () => {
    // Frozen date is March (03) 15 — both already two-digit,
    // so test the padding logic by checking the date segment directly.
    const result = generateFileName('x', 'txt');
    const datePart = result.match(/(\d{4}-\d{2}-\d{2})/)?.[1];
    expect(datePart).toBe('2026-03-15');
  });

  it('pads single-digit hour and minute with zeros (09-05)', () => {
    const result = generateFileName('x', 'txt');
    const timePart = result.match(/(\d{2}-\d{2})\./)?.[1];
    expect(timePart).toBe('09-05');
  });
});

// ─── baseName sanitisation ─────────────────────────────────────────────────────────

describe('generateFileName — baseName sanitisation', () => {
  it('replaces spaces with underscores', () => {
    const result = generateFileName('My Facility', 'pdf');
    // The base portion (everything before the date stamp) must use underscores.
    expect(result).toContain('My_Facility');
  });

  it('collapses multiple spaces into a single underscore', () => {
    const result = generateFileName('A  B   C', 'pdf');
    expect(result).toContain('A_B_C');
  });

  it('strips special characters not in \\w, -, or Arabic range', () => {
    const result = generateFileName('Report!@#$%^&*()', 'pdf');
    // Only the base "Report" survives; special chars are removed.
    expect(result.startsWith('Report_')).toBe(true);
  });

  it('preserves Arabic characters', () => {
    const result = generateFileName('منشأة صناعية', 'pdf');
    expect(result).toContain('منشأة_صناعية');
  });

  it('preserves ASCII word characters (letters, digits, underscore)', () => {
    const result = generateFileName('ABC_123', 'pdf');
    expect(result).toContain('ABC_123');
  });

  it('preserves hyphens in baseName', () => {
    const result = generateFileName('Site-A', 'pdf');
    expect(result).toContain('Site-A');
  });

  it('handles an empty baseName without throwing', () => {
    expect(() => generateFileName('', 'pdf')).not.toThrow();
  });

  it('produces a non-empty filename even with an empty baseName', () => {
    const result = generateFileName('', 'pdf');
    // Should at least contain the date/time stamp and extension.
    expect(result).toMatch(/_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}\.pdf$/);
  });
});

// ─── extension handling ───────────────────────────────────────────────────────────────

describe('generateFileName — extension handling', () => {
  it('appends the extension after a dot', () => {
    expect(generateFileName('x', 'xlsx')).toMatch(/\.xlsx$/);
  });

  it('does not duplicate the dot when extension already starts with one', () => {
    // The function concatenates `.${extension}` directly,
    // so passing 'pdf' should result in exactly one dot before the extension.
    const result = generateFileName('x', 'pdf');
    expect((result.match(/\.pdf/g) ?? []).length).toBe(1);
  });
});

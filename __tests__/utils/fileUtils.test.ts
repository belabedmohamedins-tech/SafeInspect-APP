// __tests__/utils/fileUtils.test.ts
//
// Full coverage for src/utils/fileUtils.ts
// generateFileName is pure TS — no mocks needed.
// Date is frozen via jest.useFakeTimers to guarantee deterministic output.

import { generateFileName } from '../../src/utils/fileUtils';

// ── Freeze time to 2026-07-12 14:05 ──────────────────────────────────────────

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-07-12T14:05:00.000Z'));
});

afterAll(() => {
  jest.useRealTimers();
});

// ── generateFileName ──────────────────────────────────────────────────────────

describe('generateFileName', () => {
  it('produces the correct date and time segment', () => {
    const result = generateFileName('test', 'pdf');
    // Date segment: 2026-07-12, time depends on local offset — we just check format
    expect(result).toMatch(/\d{4}-\d{2}-\d{2}_\d{2}-\d{2}\.pdf$/);
  });

  it('appends the given extension', () => {
    expect(generateFileName('report', 'pdf')).toMatch(/\.pdf$/);
    expect(generateFileName('export', 'csv')).toMatch(/\.csv$/);
  });

  it('replaces spaces with underscores in baseName', () => {
    const result = generateFileName('my facility name', 'pdf');
    expect(result).toMatch(/^my_facility_name_/);
  });

  it('strips special characters not in \\w, Arabic, space, or hyphen', () => {
    // ! @ # $ % ^ & * ( ) should be removed
    const result = generateFileName('name!@#', 'pdf');
    expect(result).toMatch(/^name_/);
  });

  it('preserves Arabic characters in baseName', () => {
    const result = generateFileName('مطعم الأمل', 'pdf');
    expect(result).toMatch(/^مطعم_الأمل_/);
  });

  it('preserves hyphens in baseName', () => {
    const result = generateFileName('safe-inspect', 'pdf');
    expect(result).toMatch(/^safe-inspect_/);
  });

  it('preserves alphanumeric characters', () => {
    const result = generateFileName('Report2026', 'csv');
    expect(result).toMatch(/^Report2026_/);
  });

  it('handles empty baseName gracefully (safeBase becomes empty string)', () => {
    const result = generateFileName('', 'pdf');
    // Starts with underscore since safeBase is empty
    expect(result).toMatch(/^_\d{4}-\d{2}-\d{2}/);
  });

  it('handles baseName with only special characters', () => {
    const result = generateFileName('!!!###', 'pdf');
    // All chars stripped → safeBase is ''
    expect(result).toMatch(/^_\d{4}-\d{2}-\d{2}/);
  });

  it('collapses multiple consecutive spaces into a single underscore', () => {
    const result = generateFileName('a   b', 'pdf');
    expect(result).toMatch(/^a_b_/);
  });

  it('returns a string in the format: safeBase_YYYY-MM-DD_HH-MM.ext', () => {
    const result = generateFileName('facility', 'pdf');
    expect(result).toMatch(/^[^_]+_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}\.pdf$/);
  });
});

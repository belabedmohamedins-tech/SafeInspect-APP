// __tests__/utils/dateUtils.test.ts
import {
  formatDateTimeShort,
  formatDateOnly,
  formatDateForCard,
  formatDateLong,
  formatDateForAgenda,
} from '../../src/utils/dateUtils';

// Pin a deterministic ISO string so tests don't drift with the real clock.
const ISO = '2026-03-15T14:30:00.000Z'; // UTC

// ─── formatDateTimeShort ──────────────────────────────────────────────────────

describe('formatDateTimeShort', () => {
  it('returns YYYY-MM-DD HH:MM format', () => {
    const d = new Date(ISO);
    const expected = [
      d.getFullYear(),
      (d.getMonth() + 1).toString().padStart(2, '0'),
      d.getDate().toString().padStart(2, '0'),
    ].join('-') + ' ' + [
      d.getHours().toString().padStart(2, '0'),
      d.getMinutes().toString().padStart(2, '0'),
    ].join(':');
    expect(formatDateTimeShort(ISO)).toBe(expected);
  });

  it('pads single-digit month and day with zeros', () => {
    const result = formatDateTimeShort('2026-01-05T08:03:00.000Z');
    const parts = result.split(' ')[0].split('-');
    expect(parts[1].length).toBe(2);
    expect(parts[2].length).toBe(2);
  });

  it('result has exactly one space separating date and time', () => {
    const result = formatDateTimeShort(ISO);
    expect(result.split(' ')).toHaveLength(2);
  });
});

// ─── formatDateForCard ────────────────────────────────────────────────────────

describe('formatDateForCard', () => {
  it('delegates to formatDateTimeShort (same output)', () => {
    expect(formatDateForCard(ISO)).toBe(formatDateTimeShort(ISO));
  });
});

// ─── formatDateOnly ───────────────────────────────────────────────────────────

describe('formatDateOnly', () => {
  it('returns a non-empty Arabic string', () => {
    const result = formatDateOnly(ISO);
    expect(result.length).toBeGreaterThan(0);
  });

  it('does not include a time component (no colon)', () => {
    const result = formatDateOnly(ISO);
    expect(result).not.toContain(':');
  });

  it('includes the year 2026', () => {
    expect(formatDateOnly(ISO)).toContain('2026');
  });
});

// ─── formatDateLong ───────────────────────────────────────────────────────────

describe('formatDateLong', () => {
  it('returns a non-empty Arabic string', () => {
    expect(formatDateLong(ISO).length).toBeGreaterThan(0);
  });

  it('includes a time separator (colon)', () => {
    expect(formatDateLong(ISO)).toContain(':');
  });

  it('includes the year 2026', () => {
    expect(formatDateLong(ISO)).toContain('2026');
  });
});

// ─── formatDateForAgenda ──────────────────────────────────────────────────────

describe('formatDateForAgenda', () => {
  it('returns a non-empty string', () => {
    expect(formatDateForAgenda(ISO).length).toBeGreaterThan(0);
  });

  it('includes a time separator (colon)', () => {
    expect(formatDateForAgenda(ISO)).toContain(':');
  });
});

// ─── edge cases ───────────────────────────────────────────────────────────────

describe('edge cases', () => {
  it('formatDateTimeShort handles end-of-year date', () => {
    const result = formatDateTimeShort('2026-12-31T23:59:00.000Z');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });

  it('formatDateTimeShort handles start-of-year date', () => {
    const result = formatDateTimeShort('2026-01-01T00:00:00.000Z');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });
});

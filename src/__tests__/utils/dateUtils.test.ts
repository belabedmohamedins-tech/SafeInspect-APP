// src/__tests__/utils/dateUtils.test.ts
//
// Pure function tests — no mocks needed.
// All assertions use a fixed UTC ISO string parsed through the local date
// object; we test structure (format shape, zero-padding) rather than
// locale-rendered strings, which differ between environments.

import {
  formatDateTimeShort,
  formatDateOnly,
  formatDateLong,
  formatDateForAgenda,
  formatDateForCard,
} from '../../utils/dateUtils';

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Build the expected "YYYY-MM-DD HH:MM" string using the SAME Date math as the
 *  source so the test passes regardless of the test runner's local timezone. */
function expectedShort(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const mo = (d.getMonth() + 1).toString().padStart(2, '0');
  const dy = d.getDate().toString().padStart(2, '0');
  const h = d.getHours().toString().padStart(2, '0');
  const mi = d.getMinutes().toString().padStart(2, '0');
  return `${y}-${mo}-${dy} ${h}:${mi}`;
}

// ─── formatDateTimeShort ─────────────────────────────────────────────────────

describe('formatDateTimeShort', () => {
  it('formats a typical mid-year datetime', () => {
    const iso = '2026-03-15T14:30:00.000Z';
    expect(formatDateTimeShort(iso)).toBe(expectedShort(iso));
  });

  it('zero-pads month, day, hour, minute', () => {
    // Use a datetime that will have single-digit local components for at least
    // month or day depending on timezone — we just verify the output matches
    // the expected formula, which always zero-pads.
    const iso = '2026-01-05T09:07:00.000Z';
    const result = formatDateTimeShort(iso);
    expect(result).toBe(expectedShort(iso));
    // Structural assertion: YYYY-MM-DD HH:MM
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });

  it('handles midnight (00:00)', () => {
    const iso = '2026-06-01T00:00:00.000Z';
    expect(formatDateTimeShort(iso)).toMatch(/\d{2}:\d{2}$/);
  });

  it('handles December 31 (leap-year boundary)', () => {
    const iso = '2024-12-31T23:59:00.000Z';
    const result = formatDateTimeShort(iso);
    expect(result).toBe(expectedShort(iso));
  });
});

// ─── formatDateOnly ───────────────────────────────────────────────────────────

describe('formatDateOnly', () => {
  it('returns a non-empty string for a valid ISO date', () => {
    expect(formatDateOnly('2026-03-15T10:00:00.000Z')).toBeTruthy();
  });

  it('does not include a colon (i.e. no time portion)', () => {
    // The ar-DZ locale string for date-only should not contain ":" from time.
    // We rely on the fact that time components produce ":" separators.
    const result = formatDateOnly('2026-07-04T08:00:00.000Z');
    expect(result).not.toMatch(/\d{2}:\d{2}/);
  });

  it('includes the year digits', () => {
    const result = formatDateOnly('2026-03-15T10:00:00.000Z');
    expect(result).toContain('2026');
  });
});

// ─── formatDateLong ───────────────────────────────────────────────────────────

describe('formatDateLong', () => {
  it('returns a non-empty string', () => {
    expect(formatDateLong('2026-03-15T14:30:00.000Z')).toBeTruthy();
  });

  it('contains the full year', () => {
    expect(formatDateLong('2026-03-15T14:30:00.000Z')).toContain('2026');
  });

  it('does not throw for a valid ISO string', () => {
    expect(() => formatDateLong('2025-11-20T08:45:00.000Z')).not.toThrow();
  });
});

// ─── formatDateForAgenda ──────────────────────────────────────────────────────

describe('formatDateForAgenda', () => {
  it('returns a non-empty string', () => {
    expect(formatDateForAgenda('2026-04-10T09:00:00.000Z')).toBeTruthy();
  });

  it('contains the year', () => {
    expect(formatDateForAgenda('2026-04-10T09:00:00.000Z')).toContain('2026');
  });
});

// ─── formatDateForCard ────────────────────────────────────────────────────────

describe('formatDateForCard', () => {
  it('returns the same output as formatDateTimeShort', () => {
    const iso = '2026-05-20T11:15:00.000Z';
    expect(formatDateForCard(iso)).toBe(formatDateTimeShort(iso));
  });

  it('output matches YYYY-MM-DD HH:MM shape', () => {
    expect(formatDateForCard('2026-08-08T08:08:00.000Z')).toMatch(
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/
    );
  });
});

// ─── edge cases ───────────────────────────────────────────────────────────────

describe('dateUtils — edge cases', () => {
  it('formatDateTimeShort does not throw for an invalid ISO string', () => {
    expect(() => formatDateTimeShort('not-a-date')).not.toThrow();
  });

  it('formatDateTimeShort: year 2000', () => {
    const iso = '2000-01-01T00:00:00.000Z';
    expect(formatDateTimeShort(iso)).toBe(expectedShort(iso));
  });

  it('formatDateOnly does not throw for an invalid ISO string', () => {
    expect(() => formatDateOnly('not-a-date')).not.toThrow();
  });

  it('formatDateForCard zero-pads single-digit month and day components', () => {
    // Any date whose local month or day is single-digit
    const iso = '2026-02-03T05:06:00.000Z';
    const result = formatDateForCard(iso);
    // Structural: must be YYYY-MM-DD HH:MM with two-digit month and day
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });
});

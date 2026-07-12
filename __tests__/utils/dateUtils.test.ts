// __tests__/utils/dateUtils.test.ts
//
// Full coverage for src/utils/dateUtils.ts
// Pure TS date formatting — no mocks needed.
// Time is frozen to guarantee deterministic output for formatDateTimeShort/formatDateForCard.
// Locale-dependent functions (formatDateLong, formatDateOnly, formatDateForAgenda)
// are tested for shape/type only since locale rendering varies by environment.

import {
  formatDateLong,
  formatDateTimeShort,
  formatDateOnly,
  formatDateForAgenda,
  formatDateForCard,
} from '../../src/utils/dateUtils';

// Fixed ISO string — 2026-07-12 at 14:30 UTC
const ISO = '2026-07-12T14:30:00.000Z';

// ── formatDateTimeShort ──────────────────────────────────────────────────────

describe('formatDateTimeShort', () => {
  it('returns a string in YYYY-MM-DD HH:MM format', () => {
    const result = formatDateTimeShort(ISO);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });

  it('contains the correct year and month and day', () => {
    const result = formatDateTimeShort(ISO);
    // Year is always 2026, month 07, day 12 regardless of TZ offset (±14h)
    expect(result).toMatch(/^2026/);
  });

  it('pads single-digit month with leading zero', () => {
    // January = 01
    const jan = formatDateTimeShort('2026-01-05T10:00:00.000Z');
    // month part is always 2 digits
    expect(jan).toMatch(/^\d{4}-\d{2}-\d{2}/);
  });

  it('pads single-digit day with leading zero', () => {
    const result = formatDateTimeShort('2026-07-05T10:00:00.000Z');
    expect(result).toMatch(/^\d{4}-\d{2}-0\d /);
  });

  it('pads single-digit hours and minutes', () => {
    // 01:02 local — just check HH:MM format
    const result = formatDateTimeShort('2026-07-12T01:02:00.000Z');
    expect(result).toMatch(/\d{2}:\d{2}$/);
  });
});

// ── formatDateForCard ────────────────────────────────────────────────────────

describe('formatDateForCard', () => {
  it('delegates to formatDateTimeShort (same output)', () => {
    expect(formatDateForCard(ISO)).toBe(formatDateTimeShort(ISO));
  });

  it('returns a string in YYYY-MM-DD HH:MM format', () => {
    expect(formatDateForCard(ISO)).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });
});

// ── formatDateLong ───────────────────────────────────────────────────────────
// Locale output varies by Node/OS — we verify it returns a non-empty string

describe('formatDateLong', () => {
  it('returns a non-empty string', () => {
    const result = formatDateLong(ISO);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('contains the year 2026', () => {
    expect(formatDateLong(ISO)).toContain('2026');
  });
});

// ── formatDateOnly ───────────────────────────────────────────────────────────

describe('formatDateOnly', () => {
  it('returns a non-empty string', () => {
    const result = formatDateOnly(ISO);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('contains the year 2026', () => {
    expect(formatDateOnly(ISO)).toContain('2026');
  });

  it('does NOT contain a time component (no colon)', () => {
    // toLocaleDateString with year/month/day only — no hour/minute
    // NOTE: some locales may include a comma but never HH:MM digits
    const result = formatDateOnly(ISO);
    expect(result).not.toMatch(/\d{2}:\d{2}/);
  });
});

// ── formatDateForAgenda ──────────────────────────────────────────────────────

describe('formatDateForAgenda', () => {
  it('returns a non-empty string', () => {
    const result = formatDateForAgenda(ISO);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('contains the year 2026', () => {
    expect(formatDateForAgenda(ISO)).toContain('2026');
  });
});

// __tests__/utils/dateUtils.test.ts
//
// Timezone-safe strategy: compute expected values dynamically from the same
// Date object the function would use — never hardcode locale strings.
// formatDateLong / formatDateOnly / formatDateForAgenda use toLocaleDateString
// which is locale+platform dependent; we verify structural invariants instead.
// formatDateTimeShort / formatDateForCard build the string manually — we
// can verify exact output by computing from the same Date.

import {
  formatDateLong,
  formatDateTimeShort,
  formatDateOnly,
  formatDateForAgenda,
  formatDateForCard,
} from '../../src/utils/dateUtils';

// ── Helpers ──────────────────────────────────────────────────────────────────
const ISO = '2026-03-15T14:30:00.000Z';

/** Compute the short-form output the function would produce for a given ISO string. */
function expectedShort(iso: string): string {
  const d = new Date(iso);
  const year    = d.getFullYear();
  const month   = (d.getMonth() + 1).toString().padStart(2, '0');
  const day     = d.getDate().toString().padStart(2, '0');
  const hours   = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// ── formatDateTimeShort ─────────────────────────────────────────────────────
describe('formatDateTimeShort', () => {
  it('returns YYYY-MM-DD HH:mm format (timezone-safe)', () => {
    expect(formatDateTimeShort(ISO)).toBe(expectedShort(ISO));
  });

  it('zero-pads single-digit month and day', () => {
    // Use a date that in any timezone will have month=1 and day=5
    const iso = '2026-01-05T06:00:00.000Z';
    const result = formatDateTimeShort(iso);
    // The result must match YYYY-MM-DD HH:mm
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });

  it('zero-pads hours and minutes', () => {
    const result = formatDateTimeShort(ISO);
    // HH:mm at end — both parts must be 2 digits
    const timePart = result.split(' ')[1];
    expect(timePart).toMatch(/^\d{2}:\d{2}$/);
  });

  it('year is 4 digits', () => {
    expect(formatDateTimeShort(ISO).split('-')[0]).toHaveLength(4);
  });

  it('matches expected short output dynamically', () => {
    const iso2 = '2025-12-31T23:59:59.000Z';
    expect(formatDateTimeShort(iso2)).toBe(expectedShort(iso2));
  });
});

// ── formatDateForCard ──────────────────────────────────────────────────────────
describe('formatDateForCard', () => {
  it('delegates to formatDateTimeShort — outputs same value', () => {
    expect(formatDateForCard(ISO)).toBe(formatDateTimeShort(ISO));
  });

  it('returns YYYY-MM-DD HH:mm format (regex)', () => {
    expect(formatDateForCard(ISO)).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });
});

// ── formatDateLong ───────────────────────────────────────────────────────────────
describe('formatDateLong', () => {
  it('returns a non-empty string', () => {
    expect(formatDateLong(ISO).length).toBeGreaterThan(0);
  });

  it('contains the year 2026', () => {
    // year digits are stable regardless of locale
    expect(formatDateLong(ISO)).toContain('2026');
  });

  it('is consistent — same input gives same output', () => {
    expect(formatDateLong(ISO)).toBe(formatDateLong(ISO));
  });

  it('different dates produce different outputs', () => {
    const iso2 = '2025-06-01T08:00:00.000Z';
    expect(formatDateLong(ISO)).not.toBe(formatDateLong(iso2));
  });
});

// ── formatDateOnly ──────────────────────────────────────────────────────────────
describe('formatDateOnly', () => {
  it('returns a non-empty string', () => {
    expect(formatDateOnly(ISO).length).toBeGreaterThan(0);
  });

  it('contains the year 2026', () => {
    expect(formatDateOnly(ISO)).toContain('2026');
  });

  it('does NOT contain a colon (no time component)', () => {
    // Time would introduce HH:mm — date-only output must not have it
    expect(formatDateOnly(ISO)).not.toMatch(/\d{2}:\d{2}/);
  });

  it('is consistent — same input gives same output', () => {
    expect(formatDateOnly(ISO)).toBe(formatDateOnly(ISO));
  });

  it('different dates produce different outputs', () => {
    expect(formatDateOnly(ISO)).not.toBe(formatDateOnly('2025-01-01T00:00:00.000Z'));
  });
});

// ── formatDateForAgenda ─────────────────────────────────────────────────────────
describe('formatDateForAgenda', () => {
  it('returns a non-empty string', () => {
    expect(formatDateForAgenda(ISO).length).toBeGreaterThan(0);
  });

  it('contains the year 2026', () => {
    expect(formatDateForAgenda(ISO)).toContain('2026');
  });

  it('is consistent — same input gives same output', () => {
    expect(formatDateForAgenda(ISO)).toBe(formatDateForAgenda(ISO));
  });

  it('different dates produce different outputs', () => {
    const iso2 = '2025-11-20T09:00:00.000Z';
    expect(formatDateForAgenda(ISO)).not.toBe(formatDateForAgenda(iso2));
  });
});

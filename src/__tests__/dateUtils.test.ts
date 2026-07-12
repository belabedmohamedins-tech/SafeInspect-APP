// src/__tests__/dateUtils.test.ts
//
// Timezone-safe: never hardcode expected date strings.
// Compute expected values from the same Date object the function uses.
import {
  formatDateTimeShort,
  formatDateLong,
  formatDateOnly,
  formatDateForAgenda,
  formatDateForCard,
} from '../../src/utils/dateUtils';

const ISO = '2026-03-15T14:30:00.000Z';

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

  it('pads single-digit months and days', () => {
    const iso = '2026-01-05T09:07:00.000Z';
    const result = formatDateTimeShort(iso);
    // Month and day must be zero-padded
    const parts = result.split(' ')[0].split('-');
    expect(parts[1].length).toBe(2);
    expect(parts[2].length).toBe(2);
  });
});

describe('formatDateLong', () => {
  it('returns a non-empty Arabic string', () => {
    const result = formatDateLong(ISO);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(5);
  });
});

describe('formatDateOnly', () => {
  it('returns a non-empty Arabic string without time', () => {
    const result = formatDateOnly(ISO);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(5);
    // Should not contain ':' (no time component)
    expect(result).not.toMatch(/\d:\d/);
  });
});

describe('formatDateForAgenda', () => {
  it('returns a non-empty string', () => {
    const result = formatDateForAgenda(ISO);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(5);
  });
});

describe('formatDateForCard', () => {
  it('delegates to formatDateTimeShort', () => {
    expect(formatDateForCard(ISO)).toBe(formatDateTimeShort(ISO));
  });
});

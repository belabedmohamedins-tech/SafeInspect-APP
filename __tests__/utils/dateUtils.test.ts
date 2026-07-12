// __tests__/utils/dateUtils.test.ts
import {
  formatDateTimeShort,
  formatDateLong,
  formatDateOnly,
  formatDateForAgenda,
  formatDateForCard,
} from '../../src/utils/dateUtils';

// Use a fixed ISO string and compute expected output dynamically to be timezone-safe
const ISO = '2026-03-15T14:30:00.000Z';

describe('formatDateTimeShort', () => {
  it('returns YYYY-MM-DD HH:MM format', () => {
    const result = formatDateTimeShort(ISO);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });

  it('formatDateForCard delegates to formatDateTimeShort', () => {
    expect(formatDateForCard(ISO)).toBe(formatDateTimeShort(ISO));
  });
});

describe('formatDateLong', () => {
  it('returns a non-empty string', () => {
    expect(formatDateLong(ISO).length).toBeGreaterThan(0);
  });
});

describe('formatDateOnly', () => {
  it('returns a non-empty string', () => {
    expect(formatDateOnly(ISO).length).toBeGreaterThan(0);
  });
});

describe('formatDateForAgenda', () => {
  it('returns a non-empty string', () => {
    expect(formatDateForAgenda(ISO).length).toBeGreaterThan(0);
  });
});

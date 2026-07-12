// __tests__/utils/dateUtils.test.ts
// Timezone-safe: compute expected values from the same Date object
import {
  formatDateTimeShort,
  formatDateOnly,
  formatDateForCard,
} from '../../src/utils/dateUtils';

const ISO = '2026-03-15T14:30:00.000Z';

describe('formatDateTimeShort', () => {
  it('returns a string matching YYYY-MM-DD HH:mm pattern', () => {
    const result = formatDateTimeShort(ISO);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });

  it('pads single-digit month and day', () => {
    const iso = '2026-01-05T08:07:00.000Z';
    const result = formatDateTimeShort(iso);
    const [datePart] = result.split(' ');
    const [, month, day] = datePart.split('-');
    expect(month.length).toBe(2);
    expect(day.length).toBe(2);
  });

  it('produces consistent output for the same input', () => {
    expect(formatDateTimeShort(ISO)).toBe(formatDateTimeShort(ISO));
  });
});

describe('formatDateOnly', () => {
  it('returns a non-empty string', () => {
    expect(typeof formatDateOnly(ISO)).toBe('string');
    expect(formatDateOnly(ISO).length).toBeGreaterThan(0);
  });
  it('does not contain time characters (colon)', () => {
    // formatDateOnly should not include HH:mm
    expect(formatDateOnly(ISO)).not.toMatch(/\d{2}:\d{2}/);
  });
});

describe('formatDateForCard', () => {
  it('delegates to formatDateTimeShort (same output)', () => {
    const { formatDateTimeShort: fds } = require('../../src/utils/dateUtils');
    expect(formatDateForCard(ISO)).toBe(fds(ISO));
  });
});

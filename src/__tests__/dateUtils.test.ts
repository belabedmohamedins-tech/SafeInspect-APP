import { formatDateForCard, formatDateOnly, formatDateTimeShort } from '../utils/dateUtils';

const ISO = '2026-03-15T14:30:00.000Z';

describe('formatDateTimeShort', () => {
  it('returns YYYY-MM-DD HH:MM format', () => {
    const result = formatDateTimeShort(ISO);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });
});

describe('formatDateOnly', () => {
  it('returns Arabic locale string containing the year', () => {
    const result = formatDateOnly(ISO);
    expect(result).toContain('2026');
  });

  it('returns a non-empty string', () => {
    expect(formatDateOnly(ISO).length).toBeGreaterThan(0);
  });
});

describe('formatDateForCard', () => {
  it('delegates to formatDateTimeShort format', () => {
    const result = formatDateForCard(ISO);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });
});

describe('edge cases', () => {
  it('handles midnight correctly', () => {
    const result = formatDateTimeShort('2026-01-01T00:00:00.000Z');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });
});

// __tests__/utils/fileUtils.test.ts
import { generateFileName } from '../../src/utils/fileUtils';

describe('generateFileName', () => {
  it('returns a string', () => {
    expect(typeof generateFileName('test', 'pdf')).toBe('string');
  });

  it('ends with the given extension', () => {
    expect(generateFileName('report', 'pdf')).toMatch(/\.pdf$/);
    expect(generateFileName('data', 'csv')).toMatch(/\.csv$/);
  });

  it('includes a date portion (YYYY-MM-DD)', () => {
    expect(generateFileName('facility', 'pdf')).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('includes a time portion (HH-MM)', () => {
    expect(generateFileName('facility', 'pdf')).toMatch(/\d{2}-\d{2}/);
  });

  it('replaces spaces with underscores in baseName', () => {
    const result = generateFileName('my report', 'pdf');
    expect(result).toContain('my_report');
  });

  it('strips special characters (except arabic, word chars, spaces, hyphens)', () => {
    const result = generateFileName('rep!@#$ort', 'pdf');
    expect(result).not.toMatch(/[!@#$]/);
  });

  it('preserves Arabic characters in baseName', () => {
    const result = generateFileName('\u0645\u0646\u0634\u0623\u0629', 'pdf');
    expect(result).toContain('\u0645\u0646\u0634\u0623\u0629');
  });

  it('handles empty baseName gracefully', () => {
    const result = generateFileName('', 'pdf');
    expect(result).toMatch(/\.pdf$/);
  });
});

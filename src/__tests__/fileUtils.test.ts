// src/__tests__/fileUtils.test.ts
import { generateFileName } from '../../src/utils/fileUtils';

describe('generateFileName', () => {
  it('includes the extension', () => {
    const r = generateFileName('Facility', 'pdf');
    expect(r).toMatch(/\.pdf$/);
  });

  it('includes a date portion YYYY-MM-DD', () => {
    const r = generateFileName('Test', 'csv');
    expect(r).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('includes a time portion HH-MM', () => {
    const r = generateFileName('Test', 'csv');
    expect(r).toMatch(/\d{2}-\d{2}/);
  });

  it('replaces spaces with underscores in baseName', () => {
    const r = generateFileName('My Facility', 'pdf');
    expect(r).toMatch(/My_Facility/);
  });

  it('strips special characters from baseName', () => {
    const r = generateFileName('Facility!@#$%', 'pdf');
    expect(r).not.toMatch(/[!@#$%]/);
  });

  it('preserves Arabic characters in baseName', () => {
    const r = generateFileName('منشأة الإنتاج', 'pdf');
    expect(r).toMatch(/[\u0600-\u06FF]/);
  });

  it('handles empty baseName gracefully', () => {
    const r = generateFileName('', 'pdf');
    expect(r).toMatch(/\.pdf$/);
    expect(r.length).toBeGreaterThan(4);
  });
});

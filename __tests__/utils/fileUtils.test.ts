// __tests__/utils/fileUtils.test.ts
import { generateFileName } from '../../src/utils/fileUtils';

describe('generateFileName', () => {
  it('returns string ending with .extension', () => {
    const name = generateFileName('test', 'pdf');
    expect(name).toMatch(/\.pdf$/);
  });

  it('includes YYYY-MM-DD date portion', () => {
    const name = generateFileName('test', 'csv');
    expect(name).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('includes HH-MM time portion', () => {
    const name = generateFileName('test', 'pdf');
    expect(name).toMatch(/\d{2}-\d{2}/);
  });

  it('replaces spaces with underscores', () => {
    const name = generateFileName('my facility', 'pdf');
    expect(name).toContain('my_facility');
  });

  it('strips special characters', () => {
    const name = generateFileName('file/name:test', 'pdf');
    expect(name).not.toContain('/');
    expect(name).not.toContain(':');
  });

  it('preserves Arabic characters', () => {
    const name = generateFileName('منشأة', 'pdf');
    expect(name).toContain('منشأة');
  });
});

// src/__tests__/briefService.test.ts
import { buildBrief } from '../services/briefService';

describe('buildBrief', () => {
  it('is a callable function', () => {
    expect(typeof buildBrief).toBe('function');
  });
});

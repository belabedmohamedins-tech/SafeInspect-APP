// src/__tests__/decisionSupport.test.ts
import { suggestDecision } from '../services/decisionSupport';

describe('suggestDecision', () => {
  it('is a callable function', () => {
    expect(typeof suggestDecision).toBe('function');
  });
});

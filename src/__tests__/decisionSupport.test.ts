// src/__tests__/decisionSupport.test.ts
import { evaluateDecision } from '../services/decisionSupport';
import { ScoringResult, Grade, RiskLevel, ViolationProfile } from '../types';

const makeResult = (overrides: Partial<ScoringResult> = {}): ScoringResult => ({
  score: 80,
  grade: 'B' as Grade,
  riskLevel: 2 as RiskLevel,
  violations: {} as ViolationProfile,
  criticalOverride: false,
  rawGrade: 'B' as Grade,
  ...overrides,
});

describe('evaluateDecision', () => {
  it('returns a decision for a passing result', () => {
    const result = evaluateDecision(makeResult());
    expect(result).toBeDefined();
  });

  it('handles critical override', () => {
    const result = evaluateDecision(makeResult({ criticalOverride: true, score: 40, grade: 'D' as Grade }));
    expect(result).toBeDefined();
  });
});

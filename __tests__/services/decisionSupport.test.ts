// __tests__/services/decisionSupport.test.ts
import { suggestDecision } from '../../src/services/decisionSupport';
import { ScoringResult } from '../../src/utils/scoringUtils';
import { DifferentialView } from '../../src/services/differentialView';

function scoring(overrides: Partial<ScoringResult> = {}): ScoringResult {
  return {
    score: 100,
    grade: 'A',
    rawGrade: 'A',
    riskLevel: 1,
    nextInspectionDays: 730,
    violations: { high: 0, medium: 0, low: 0, total: 0 },
    criticalOverride: false,
    incomplete: false,
    evaluatedCount: 10,
    disclaimer: '',
    ...overrides,
  } as ScoringResult;
}

function diff(overrides: Partial<DifferentialView> = {}): DifferentialView {
  return {
    all: [],
    resolved: [],
    stillFailing: [],
    newViolations: [],
    hasUnresolvedPriorViolations: false,
    priorInspection: null,
    ...overrides,
  } as DifferentialView;
}

describe('suggestDecision', () => {
  it('grade A → close-file, urgency low', () => {
    const r = suggestDecision(scoring());
    expect(r.action).toBe('close-file');
    expect(r.urgency).toBe('low');
    expect(r.legalBasis).toContain('44');
  });

  it('grade B → schedule-routine, urgency low', () => {
    const r = suggestDecision(scoring({ grade: 'B', score: 75, riskLevel: 2, nextInspectionDays: 365 }));
    expect(r.action).toBe('schedule-routine');
    expect(r.urgency).toBe('low');
  });

  it('grade C, no unresolved → notice, medium urgency', () => {
    const r = suggestDecision(scoring({ grade: 'C', score: 55, riskLevel: 3, nextInspectionDays: 180 }));
    expect(r.action).toBe('notice');
    expect(r.urgency).toBe('medium');
    expect(r.legalBasis).toContain('48');
  });

  it('grade C + unresolved → formal-warning, high urgency', () => {
    const d = diff({ hasUnresolvedPriorViolations: true, stillFailing: [{}] as any });
    const r = suggestDecision(scoring({ grade: 'C', score: 55, riskLevel: 3, nextInspectionDays: 180 }), d);
    expect(r.action).toBe('formal-warning');
    expect(r.urgency).toBe('high');
  });

  it('grade D, no unresolved → formal-warning, high urgency', () => {
    const r = suggestDecision(scoring({ grade: 'D', score: 20, riskLevel: 4, nextInspectionDays: 30, violations: { high: 0, medium: 0, low: 2, total: 2 } }));
    expect(r.action).toBe('formal-warning');
    expect(r.urgency).toBe('high');
    expect(r.legalBasis).toContain('54');
  });

  it('grade D + unresolved → partial-closure', () => {
    const d = diff({ hasUnresolvedPriorViolations: true, stillFailing: [{}] as any });
    const r = suggestDecision(scoring({ grade: 'D', score: 20, riskLevel: 4, nextInspectionDays: 30 }), d);
    expect(r.action).toBe('partial-closure');
  });

  it('grade D + ≥3 high → immediate-closure, critical', () => {
    const r = suggestDecision(scoring({ grade: 'D', score: 0, violations: { high: 3, medium: 0, low: 0, total: 3 }, criticalOverride: true, riskLevel: 4, nextInspectionDays: 30 }));
    expect(r.action).toBe('immediate-closure');
    expect(r.urgency).toBe('critical');
    expect(r.legalBasis).toContain('56');
    expect(r.additionalRefs.length).toBeGreaterThan(0);
  });

  it('unresolved + new violations → escalate-authority, critical', () => {
    const d = diff({
      hasUnresolvedPriorViolations: true,
      stillFailing: [{}] as any,
      newViolations: [{}] as any,
    });
    const r = suggestDecision(scoring({ grade: 'C' }), d);
    expect(r.action).toBe('escalate-authority');
    expect(r.urgency).toBe('critical');
    expect(r.legalBasis).toContain('60');
  });

  it('includes criticalOverride reason when true', () => {
    const r = suggestDecision(scoring({ criticalOverride: true }));
    expect(r.reasons.some(s => s.includes('تجاوز الحرج'))).toBe(true);
    expect(r.criticalOverride).toBe(true);
  });

  it('includes incomplete reason when true', () => {
    const r = suggestDecision(scoring({ incomplete: true }));
    expect(r.reasons.some(s => s.includes('60'))).toBe(true);
  });

  it('includes high violation count in reasons', () => {
    const r = suggestDecision(scoring({ violations: { high: 2, medium: 0, low: 0, total: 2 } }));
    expect(r.reasons.some(s => s.includes('2'))).toBe(true);
  });

  it('includes medium violation count in reasons', () => {
    const r = suggestDecision(scoring({ violations: { high: 0, medium: 3, low: 0, total: 3 } }));
    expect(r.reasons.some(s => s.includes('3'))).toBe(true);
  });

  it('resolved count appears in reasons', () => {
    const d = diff({ resolved: [{}, {}] as any });
    const r = suggestDecision(scoring(), d);
    expect(r.reasons.some(s => s.includes('2'))).toBe(true);
  });

  it('null diff → no unresolved, no new violations', () => {
    const r = suggestDecision(scoring({ grade: 'A' }), null);
    expect(r.action).toBe('close-file');
  });

  it('actionLabel is Arabic string', () => {
    const r = suggestDecision(scoring());
    expect(typeof r.actionLabel).toBe('string');
    expect(r.actionLabel.length).toBeGreaterThan(3);
  });

  it('nextVisitDays mirrors nextInspectionDays', () => {
    const r = suggestDecision(scoring({ nextInspectionDays: 180 }));
    expect(r.nextVisitDays).toBe(180);
  });
});

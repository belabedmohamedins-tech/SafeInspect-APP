// __tests__/services/decisionSupport.test.ts
import { suggestDecision } from '../../src/services/decisionSupport';
import { ScoringResult }    from '../../src/utils/scoringUtils';
import { DifferentialView } from '../../src/services/differentialView';

function makeScoring(overrides: Partial<ScoringResult> = {}): ScoringResult {
  return {
    score: 90,
    grade: 'A',
    rawGrade: 'A',
    criticalOverride: false,
    incomplete: false,
    violations: { high: 0, medium: 0, low: 0 },
    riskLevel: 'low',
    nextInspectionDays: 365,
    ...overrides,
  };
}

function makeDiff(overrides: Partial<DifferentialView> = {}): DifferentialView {
  return {
    all: [],
    resolved: [],
    stillFailing: [],
    newViolations: [],
    hasUnresolvedPriorViolations: false,
    priorInspection: null,
    ...overrides,
  };
}

describe('suggestDecision', () => {
  it('grade A → close-file, urgency low', () => {
    const r = suggestDecision(makeScoring({ grade: 'A' }));
    expect(r.action).toBe('close-file');
    expect(r.urgency).toBe('low');
  });

  it('grade B → schedule-routine, urgency low', () => {
    const r = suggestDecision(makeScoring({ grade: 'B', score: 80 }));
    expect(r.action).toBe('schedule-routine');
    expect(r.urgency).toBe('low');
  });

  it('grade C, no prior violations → notice, urgency medium', () => {
    const r = suggestDecision(makeScoring({ grade: 'C', score: 65 }));
    expect(r.action).toBe('notice');
    expect(r.urgency).toBe('medium');
  });

  it('grade C + unresolved prior violations → formal-warning, urgency high', () => {
    const diff = makeDiff({
      hasUnresolvedPriorViolations: true,
      stillFailing: [{ diffStatus: 'still-failing' } as any],
    });
    const r = suggestDecision(makeScoring({ grade: 'C', score: 65 }), diff);
    expect(r.action).toBe('formal-warning');
    expect(r.urgency).toBe('high');
  });

  it('grade D, no unresolved prior → formal-warning, urgency high', () => {
    const r = suggestDecision(makeScoring({ grade: 'D', score: 45, violations: { high: 1, medium: 0, low: 0 } }));
    expect(r.action).toBe('formal-warning');
    expect(r.urgency).toBe('high');
  });

  it('grade D + unresolved prior → partial-closure, urgency high', () => {
    const diff = makeDiff({
      hasUnresolvedPriorViolations: true,
      stillFailing: [{ diffStatus: 'still-failing' } as any],
    });
    const r = suggestDecision(makeScoring({ grade: 'D', score: 45 }), diff);
    expect(r.action).toBe('partial-closure');
    expect(r.urgency).toBe('high');
  });

  it('grade D + \u22653 high violations → immediate-closure, urgency critical', () => {
    const r = suggestDecision(makeScoring({
      grade: 'D', score: 30,
      violations: { high: 3, medium: 2, low: 0 },
    }));
    expect(r.action).toBe('immediate-closure');
    expect(r.urgency).toBe('critical');
  });

  it('unresolved prior + new violations → escalate-authority, urgency critical', () => {
    const diff = makeDiff({
      hasUnresolvedPriorViolations: true,
      stillFailing: [{ diffStatus: 'still-failing' } as any],
      newViolations: [{ diffStatus: 'new-violation' } as any],
    });
    const r = suggestDecision(makeScoring({ grade: 'B', score: 75 }), diff);
    expect(r.action).toBe('escalate-authority');
    expect(r.urgency).toBe('critical');
  });

  it('includes criticalOverride in reasons when applied', () => {
    const r = suggestDecision(makeScoring({ grade: 'C', criticalOverride: true }));
    expect(r.reasons.some(re => re.includes('\u0627\u0644\u062a\u062c\u0627\u0648\u0632 \u0627\u0644\u062d\u0631\u062c'))).toBe(true);
    expect(r.criticalOverride).toBe(true);
  });

  it('includes incomplete reason when scoring is incomplete', () => {
    const r = suggestDecision(makeScoring({ grade: 'B', incomplete: true }));
    // Source uses Arabic percent sign \u066a and the string '60'
    expect(r.reasons.some(re => re.includes('60'))).toBe(true);
  });

  it('includes violation counts in reasons', () => {
    const r = suggestDecision(makeScoring({
      grade: 'C',
      violations: { high: 2, medium: 3, low: 0 },
    }));
    expect(r.reasons.some(re => re.includes('2'))).toBe(true);
    expect(r.reasons.some(re => re.includes('3'))).toBe(true);
  });

  it('includes resolved count in reasons when diff has resolved items', () => {
    const diff = makeDiff({ resolved: [{ diffStatus: 'resolved' } as any] });
    const r = suggestDecision(makeScoring({ grade: 'A' }), diff);
    expect(r.reasons.some(re => re.includes('\u062a\u0645 \u062a\u0635\u062d\u064a\u062d\u0647\u0627'))).toBe(true);
  });

  it('sets nextVisitDays from scoring.nextInspectionDays', () => {
    const r = suggestDecision(makeScoring({ nextInspectionDays: 180 }));
    expect(r.nextVisitDays).toBe(180);
  });

  it('returns fallback reason when no contextual reasons exist (grade A, no diff)', () => {
    const r = suggestDecision(makeScoring({ grade: 'A' }));
    expect(r.reasons).toContain('\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0644\u0627\u062d\u0638\u0627\u062a \u0625\u0636\u0627\u0641\u064a\u0629');
  });

  it('works without diff argument (undefined)', () => {
    const r = suggestDecision(makeScoring({ grade: 'B' }));
    expect(r.action).toBe('schedule-routine');
  });

  it('works with explicit null diff', () => {
    const r = suggestDecision(makeScoring({ grade: 'B' }), null);
    expect(r.action).toBe('schedule-routine');
  });
});

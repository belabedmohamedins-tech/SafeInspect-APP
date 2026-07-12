// __tests__/utils/groupViolations.test.ts
//
// Full coverage for src/utils/groupViolations.ts
// Covers: groupViolationsByRepeat, formatViolationGroupSummary
// All branches exercised — no React Native imports needed (pure TS logic).

import {
  groupViolationsByRepeat,
  formatViolationGroupSummary,
  ViolationGroups,
} from '../../src/utils/groupViolations';
import { InspectionItem } from '../../src/types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeItem(
  id: string,
  complianceStatus: InspectionItem['complianceStatus'],
  isRepeatViolation?: boolean,
): InspectionItem {
  return {
    id,
    criteria: `Criterion ${id}`,
    legalReference: 'Art. 1',
    severity: 'medium',
    complianceStatus,
    isRepeatViolation,
  };
}

// ─── groupViolationsByRepeat ─────────────────────────────────────────────────

describe('groupViolationsByRepeat', () => {
  it('returns two empty arrays when items is empty', () => {
    const result = groupViolationsByRepeat([]);
    expect(result.firstTime).toEqual([]);
    expect(result.repeat).toEqual([]);
  });

  it('ignores compliant items — both groups empty', () => {
    const items = [
      makeItem('c1', 'compliant'),
      makeItem('c2', 'compliant'),
    ];
    const result = groupViolationsByRepeat(items);
    expect(result.firstTime).toHaveLength(0);
    expect(result.repeat).toHaveLength(0);
  });

  it('ignores na, not-evaluated, observation-only, unable-to-verify', () => {
    const items = [
      makeItem('n1', 'na'),
      makeItem('n2', 'not-evaluated'),
      makeItem('n3', 'observation-only'),
      makeItem('n4', 'unable-to-verify'),
    ];
    const result = groupViolationsByRepeat(items);
    expect(result.firstTime).toHaveLength(0);
    expect(result.repeat).toHaveLength(0);
  });

  it('puts non-compliant with isRepeatViolation=undefined into firstTime', () => {
    const item = makeItem('v1', 'non-compliant', undefined);
    const result = groupViolationsByRepeat([item]);
    expect(result.firstTime).toHaveLength(1);
    expect(result.firstTime[0].id).toBe('v1');
    expect(result.repeat).toHaveLength(0);
  });

  it('puts non-compliant with isRepeatViolation=false into firstTime', () => {
    const item = makeItem('v2', 'non-compliant', false);
    const result = groupViolationsByRepeat([item]);
    expect(result.firstTime).toHaveLength(1);
    expect(result.repeat).toHaveLength(0);
  });

  it('puts non-compliant with isRepeatViolation=true into repeat', () => {
    const item = makeItem('v3', 'non-compliant', true);
    const result = groupViolationsByRepeat([item]);
    expect(result.firstTime).toHaveLength(0);
    expect(result.repeat).toHaveLength(1);
    expect(result.repeat[0].id).toBe('v3');
  });

  it('correctly splits a mixed array', () => {
    const items = [
      makeItem('a', 'compliant'),
      makeItem('b', 'non-compliant', false),   // → firstTime
      makeItem('c', 'non-compliant', true),    // → repeat
      makeItem('d', 'na'),
      makeItem('e', 'non-compliant', undefined), // → firstTime
      makeItem('f', 'non-compliant', true),    // → repeat
      makeItem('g', 'observation-only'),
    ];
    const result = groupViolationsByRepeat(items);
    expect(result.firstTime).toHaveLength(2);
    expect(result.repeat).toHaveLength(2);
    expect(result.firstTime.map(i => i.id)).toEqual(['b', 'e']);
    expect(result.repeat.map(i => i.id)).toEqual(['c', 'f']);
  });

  it('returns all non-compliant as firstTime when none are repeats', () => {
    const items = [
      makeItem('x1', 'non-compliant'),
      makeItem('x2', 'non-compliant', false),
    ];
    const result = groupViolationsByRepeat(items);
    expect(result.firstTime).toHaveLength(2);
    expect(result.repeat).toHaveLength(0);
  });

  it('returns all non-compliant as repeat when all are repeats', () => {
    const items = [
      makeItem('r1', 'non-compliant', true),
      makeItem('r2', 'non-compliant', true),
      makeItem('r3', 'non-compliant', true),
    ];
    const result = groupViolationsByRepeat(items);
    expect(result.firstTime).toHaveLength(0);
    expect(result.repeat).toHaveLength(3);
  });
});

// ─── formatViolationGroupSummary ─────────────────────────────────────────────

describe('formatViolationGroupSummary', () => {
  it('returns "لا توجد مخالفات" when both groups are empty', () => {
    const groups: ViolationGroups = { firstTime: [], repeat: [] };
    expect(formatViolationGroupSummary(groups)).toBe('لا توجد مخالفات');
  });

  it('formats correctly with only firstTime violations (1)', () => {
    const groups: ViolationGroups = {
      firstTime: [makeItem('a', 'non-compliant')],
      repeat: [],
    };
    expect(formatViolationGroupSummary(groups)).toBe('1 مخالفات: 1 لأول مرة');
  });

  it('formats correctly with only firstTime violations (3)', () => {
    const groups: ViolationGroups = {
      firstTime: [
        makeItem('a', 'non-compliant'),
        makeItem('b', 'non-compliant'),
        makeItem('c', 'non-compliant'),
      ],
      repeat: [],
    };
    expect(formatViolationGroupSummary(groups)).toBe('3 مخالفات: 3 لأول مرة');
  });

  it('formats correctly with only 1 repeat violation (singular suffix)', () => {
    const groups: ViolationGroups = {
      firstTime: [],
      repeat: [makeItem('r1', 'non-compliant', true)],
    };
    // repeat.length === 1 → no 'ة' suffix
    expect(formatViolationGroupSummary(groups)).toBe('1 مخالفات: 1 متكرر');
  });

  it('formats correctly with only 2 repeat violations (plural suffix)', () => {
    const groups: ViolationGroups = {
      firstTime: [],
      repeat: [
        makeItem('r1', 'non-compliant', true),
        makeItem('r2', 'non-compliant', true),
      ],
    };
    // repeat.length > 1 → 'ة' suffix
    expect(formatViolationGroupSummary(groups)).toBe('2 مخالفات: 2 متكررة');
  });

  it('formats correctly with mixed firstTime and repeat (1 each)', () => {
    const groups: ViolationGroups = {
      firstTime: [makeItem('f1', 'non-compliant')],
      repeat: [makeItem('r1', 'non-compliant', true)],
    };
    expect(formatViolationGroupSummary(groups)).toBe('2 مخالفات: 1 لأول مرة، 1 متكرر');
  });

  it('formats correctly with mixed firstTime and repeat (multiple)', () => {
    const groups: ViolationGroups = {
      firstTime: [makeItem('f1', 'non-compliant'), makeItem('f2', 'non-compliant')],
      repeat: [
        makeItem('r1', 'non-compliant', true),
        makeItem('r2', 'non-compliant', true),
        makeItem('r3', 'non-compliant', true),
      ],
    };
    expect(formatViolationGroupSummary(groups)).toBe('5 مخالفات: 2 لأول مرة، 3 متكررة');
  });
});

// __tests__/utils/groupViolations.test.ts
import {
  groupViolationsByRepeat,
  formatViolationGroupSummary,
  ViolationGroups,
} from '../../src/utils/groupViolations';
import { InspectionItem } from '../../src/types';

// ── Helpers ───────────────────────────────────────────────────────────────────
const item = (
  complianceStatus: InspectionItem['complianceStatus'],
  isRepeatViolation = false
): InspectionItem =>
  ({
    id: Math.random().toString(),
    criterionId: 'c1',
    label: 'test',
    complianceStatus,
    isRepeatViolation,
  } as unknown as InspectionItem);

const nonComp  = (repeat = false) => item('non-compliant', repeat);
const compliant = ()              => item('compliant');
const obs       = ()              => item('observation-only');
const utv       = ()              => item('unable-to-verify');
const notEval   = ()              => item('not-evaluated');

// ── groupViolationsByRepeat ───────────────────────────────────────────────────
describe('groupViolationsByRepeat', () => {
  it('empty array → both groups empty', () => {
    expect(groupViolationsByRepeat([])).toEqual({ firstTime: [], repeat: [] });
  });

  it('only compliant items → both groups empty', () => {
    expect(groupViolationsByRepeat([compliant(), compliant()])).toEqual({ firstTime: [], repeat: [] });
  });

  it('observation-only excluded from both groups', () => {
    expect(groupViolationsByRepeat([obs(), obs()])).toEqual({ firstTime: [], repeat: [] });
  });

  it('unable-to-verify excluded from both groups', () => {
    expect(groupViolationsByRepeat([utv()])).toEqual({ firstTime: [], repeat: [] });
  });

  it('not-evaluated excluded from both groups', () => {
    expect(groupViolationsByRepeat([notEval()])).toEqual({ firstTime: [], repeat: [] });
  });

  it('non-compliant, isRepeatViolation=false → firstTime', () => {
    const i = nonComp(false);
    const result = groupViolationsByRepeat([i]);
    expect(result.firstTime).toContain(i);
    expect(result.repeat).toHaveLength(0);
  });

  it('non-compliant, isRepeatViolation=true → repeat', () => {
    const i = nonComp(true);
    const result = groupViolationsByRepeat([i]);
    expect(result.repeat).toContain(i);
    expect(result.firstTime).toHaveLength(0);
  });

  it('mixed bag → correct split', () => {
    const ft1 = nonComp(false);
    const ft2 = nonComp(false);
    const rp1 = nonComp(true);
    const result = groupViolationsByRepeat([ft1, compliant(), rp1, obs(), ft2, utv()]);
    expect(result.firstTime).toHaveLength(2);
    expect(result.repeat).toHaveLength(1);
    expect(result.firstTime).toContain(ft1);
    expect(result.firstTime).toContain(ft2);
    expect(result.repeat).toContain(rp1);
  });

  it('all items non-compliant first-time → repeat is empty', () => {
    const result = groupViolationsByRepeat([nonComp(), nonComp(), nonComp()]);
    expect(result.firstTime).toHaveLength(3);
    expect(result.repeat).toHaveLength(0);
  });

  it('all items non-compliant repeat → firstTime is empty', () => {
    const result = groupViolationsByRepeat([nonComp(true), nonComp(true)]);
    expect(result.firstTime).toHaveLength(0);
    expect(result.repeat).toHaveLength(2);
  });
});

// ── formatViolationGroupSummary ───────────────────────────────────────────────
describe('formatViolationGroupSummary', () => {
  const empty: ViolationGroups = { firstTime: [], repeat: [] };

  it('no violations → "لا توجد مخالفات"', () => {
    expect(formatViolationGroupSummary(empty)).toBe('لا توجد مخالفات');
  });

  it('only first-time violations', () => {
    const groups: ViolationGroups = {
      firstTime: [nonComp(), nonComp()],
      repeat: [],
    };
    expect(formatViolationGroupSummary(groups)).toBe('2 مخالفات: 2 لأول مرة');
  });

  it('only repeat violations — singular (1)', () => {
    const groups: ViolationGroups = { firstTime: [], repeat: [nonComp(true)] };
    // repeat.length === 1 → 'متكرر' (no ة)
    expect(formatViolationGroupSummary(groups)).toBe('1 مخالفات: 1 متكرر');
  });

  it('only repeat violations — plural (2+)', () => {
    const groups: ViolationGroups = {
      firstTime: [],
      repeat: [nonComp(true), nonComp(true)],
    };
    // repeat.length > 1 → 'متكررة'
    expect(formatViolationGroupSummary(groups)).toBe('2 مخالفات: 2 متكررة');
  });

  it('mixed first-time and repeat', () => {
    const groups: ViolationGroups = {
      firstTime: [nonComp()],
      repeat: [nonComp(true), nonComp(true)],
    };
    expect(formatViolationGroupSummary(groups)).toBe('3 مخالفات: 1 لأول مرة، 2 متكررة');
  });

  it('total = firstTime.length + repeat.length invariant', () => {
    const groups: ViolationGroups = {
      firstTime: [nonComp(), nonComp()],
      repeat: [nonComp(true), nonComp(true), nonComp(true)],
    };
    const result = formatViolationGroupSummary(groups);
    expect(result.startsWith('5 مخالفات')).toBe(true);
  });
});

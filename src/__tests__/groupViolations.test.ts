// src/__tests__/groupViolations.test.ts
import {
  groupViolationsByRepeat,
  formatViolationGroupSummary,
} from '../../src/utils/groupViolations';
import { InspectionItem } from '../../src/types';

function item(id: string, status: string, isRepeat?: boolean): InspectionItem {
  return { id, complianceStatus: status, isRepeatViolation: isRepeat } as unknown as InspectionItem;
}

describe('groupViolationsByRepeat', () => {
  it('returns empty groups when no items', () => {
    const r = groupViolationsByRepeat([]);
    expect(r.firstTime).toHaveLength(0);
    expect(r.repeat).toHaveLength(0);
  });

  it('excludes compliant and na items', () => {
    const r = groupViolationsByRepeat([
      item('a', 'compliant'),
      item('b', 'na'),
    ]);
    expect(r.firstTime).toHaveLength(0);
    expect(r.repeat).toHaveLength(0);
  });

  it('puts non-repeat violations in firstTime', () => {
    const r = groupViolationsByRepeat([item('a', 'non-compliant', false)]);
    expect(r.firstTime).toHaveLength(1);
    expect(r.repeat).toHaveLength(0);
  });

  it('puts repeat violations in repeat', () => {
    const r = groupViolationsByRepeat([item('a', 'non-compliant', true)]);
    expect(r.firstTime).toHaveLength(0);
    expect(r.repeat).toHaveLength(1);
  });

  it('splits mixed violations correctly', () => {
    const items = [
      item('a', 'non-compliant', false),
      item('b', 'non-compliant', true),
      item('c', 'non-compliant', false),
      item('d', 'compliant'),
    ];
    const r = groupViolationsByRepeat(items);
    expect(r.firstTime).toHaveLength(2);
    expect(r.repeat).toHaveLength(1);
  });
});

describe('formatViolationGroupSummary', () => {
  it('returns Arabic no-violations message when both groups are empty', () => {
    expect(formatViolationGroupSummary({ firstTime: [], repeat: [] })).toBe('لا توجد مخالفات');
  });

  it('shows only firstTime when no repeat', () => {
    const r = formatViolationGroupSummary({
      firstTime: [item('a', 'non-compliant')],
      repeat: [],
    });
    expect(r).toContain('1 مخالفات');
    expect(r).toContain('لأول مرة');
    expect(r).not.toContain('متكرر');
  });

  it('shows only repeat when no firstTime', () => {
    const r = formatViolationGroupSummary({
      firstTime: [],
      repeat: [item('a', 'non-compliant', true), item('b', 'non-compliant', true)],
    });
    expect(r).toContain('2 مخالفات');
    expect(r).toContain('متكررة'); // plural
  });

  it('uses singular متكرر for 1 repeat', () => {
    const r = formatViolationGroupSummary({
      firstTime: [],
      repeat: [item('a', 'non-compliant', true)],
    });
    expect(r).toContain('متكرر');
  });

  it('shows both parts when mixed', () => {
    const r = formatViolationGroupSummary({
      firstTime: [item('a', 'non-compliant')],
      repeat: [item('b', 'non-compliant', true)],
    });
    expect(r).toContain('2 مخالفات');
    expect(r).toContain('لأول مرة');
    expect(r).toContain('متكرر');
  });
});

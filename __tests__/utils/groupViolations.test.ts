// __tests__/utils/groupViolations.test.ts
import { groupViolationsByRepeat, formatViolationGroupSummary } from '../../src/utils/groupViolations';
import { InspectionItem } from '../../src/types';

function makeItem(id: string, status: string, isRepeat?: boolean): InspectionItem {
  return { id, complianceStatus: status, isRepeatViolation: isRepeat } as unknown as InspectionItem;
}

describe('groupViolationsByRepeat', () => {
  it('returns empty groups when items array is empty', () => {
    const r = groupViolationsByRepeat([]);
    expect(r.firstTime).toEqual([]);
    expect(r.repeat).toEqual([]);
  });

  it('excludes compliant and na items from both groups', () => {
    const items = [makeItem('c', 'compliant'), makeItem('na', 'na')];
    const r = groupViolationsByRepeat(items);
    expect(r.firstTime).toHaveLength(0);
    expect(r.repeat).toHaveLength(0);
  });

  it('puts non-repeat non-compliant into firstTime', () => {
    const items = [makeItem('i1', 'non-compliant', false), makeItem('i2', 'non-compliant', undefined)];
    const r = groupViolationsByRepeat(items);
    expect(r.firstTime).toHaveLength(2);
    expect(r.repeat).toHaveLength(0);
  });

  it('puts repeat non-compliant into repeat', () => {
    const items = [makeItem('i1', 'non-compliant', true)];
    const r = groupViolationsByRepeat(items);
    expect(r.repeat).toHaveLength(1);
    expect(r.firstTime).toHaveLength(0);
  });

  it('correctly separates mixed items', () => {
    const items = [
      makeItem('a', 'non-compliant', false),
      makeItem('b', 'non-compliant', true),
      makeItem('c', 'compliant'),
      makeItem('d', 'non-compliant', true),
    ];
    const r = groupViolationsByRepeat(items);
    expect(r.firstTime).toHaveLength(1);
    expect(r.repeat).toHaveLength(2);
  });
});

describe('formatViolationGroupSummary', () => {
  it('returns no-violation string when both groups are empty', () => {
    const r = formatViolationGroupSummary({ firstTime: [], repeat: [] });
    expect(r).toBe('لا توجد مخالفات');
  });

  it('includes firstTime count when only firstTime violations exist', () => {
    const items = [makeItem('a', 'non-compliant')];
    const r = formatViolationGroupSummary({ firstTime: items, repeat: [] });
    expect(r).toContain('1');
    expect(r).toContain('لأول مرة');
  });

  it('includes repeat count when only repeat violations exist', () => {
    const items = [makeItem('a', 'non-compliant', true), makeItem('b', 'non-compliant', true)];
    const r = formatViolationGroupSummary({ firstTime: [], repeat: items });
    expect(r).toContain('2');
    expect(r).toContain('متكرر');
  });

  it('shows both counts when mixed', () => {
    const ft = [makeItem('a', 'non-compliant')];
    const rp = [makeItem('b', 'non-compliant', true)];
    const r = formatViolationGroupSummary({ firstTime: ft, repeat: rp });
    expect(r).toContain('2 مخالفات');
    expect(r).toContain('لأول مرة');
    expect(r).toContain('متكرر');
  });

  it('uses plural suffix for multiple repeat violations', () => {
    const rp = [makeItem('a', 'x', true), makeItem('b', 'x', true)];
    const r = formatViolationGroupSummary({ firstTime: [], repeat: rp });
    expect(r).toContain('متكررة');
  });
});

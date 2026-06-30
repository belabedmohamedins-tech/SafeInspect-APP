// src/__tests__/groupViolations.test.ts
import {
  groupViolationsByRepeat,
  formatViolationGroupSummary,
} from '../utils/groupViolations';
import { InspectionItem } from '../types';

function makeItem(
  id: string,
  complianceStatus: InspectionItem['complianceStatus'],
  isRepeatViolation = false,
): InspectionItem {
  return {
    id,
    criteria: `Criterion ${id}`,
    complianceStatus,
    isRepeatViolation,
    severity: 'medium',
    category: 'general',
  } as unknown as InspectionItem;
}

describe('groupViolationsByRepeat', () => {
  it('returns empty groups when items array is empty', () => {
    const result = groupViolationsByRepeat([]);
    expect(result.firstTime).toHaveLength(0);
    expect(result.repeat).toHaveLength(0);
  });

  it('excludes compliant items from both groups', () => {
    const result = groupViolationsByRepeat([makeItem('1', 'compliant')]);
    expect(result.firstTime).toHaveLength(0);
    expect(result.repeat).toHaveLength(0);
  });

  it('excludes observation-only items', () => {
    const result = groupViolationsByRepeat([makeItem('1', 'observation-only')]);
    expect(result.firstTime).toHaveLength(0);
    expect(result.repeat).toHaveLength(0);
  });

  it('excludes unable-to-verify items', () => {
    const result = groupViolationsByRepeat([makeItem('1', 'unable-to-verify')]);
    expect(result.firstTime).toHaveLength(0);
    expect(result.repeat).toHaveLength(0);
  });

  it('puts a non-repeat non-compliant item into firstTime', () => {
    const item = makeItem('1', 'non-compliant', false);
    const result = groupViolationsByRepeat([item]);
    expect(result.firstTime).toContain(item);
    expect(result.repeat).toHaveLength(0);
  });

  it('puts a repeat non-compliant item into repeat', () => {
    const item = makeItem('1', 'non-compliant', true);
    const result = groupViolationsByRepeat([item]);
    expect(result.repeat).toContain(item);
    expect(result.firstTime).toHaveLength(0);
  });

  it('correctly splits a mixed list', () => {
    const items = [
      makeItem('a', 'non-compliant', false),
      makeItem('b', 'non-compliant', true),
      makeItem('c', 'compliant'),
      makeItem('d', 'non-compliant', false),
      makeItem('e', 'non-compliant', true),
    ];
    const result = groupViolationsByRepeat(items);
    expect(result.firstTime).toHaveLength(2);
    expect(result.repeat).toHaveLength(2);
  });
});

describe('formatViolationGroupSummary', () => {
  it('returns Arabic no-violations string when both groups are empty', () => {
    expect(formatViolationGroupSummary({ firstTime: [], repeat: [] })).toBe('لا توجد مخالفات');
  });

  it('formats only first-time violations', () => {
    const summary = formatViolationGroupSummary({
      firstTime: [makeItem('1', 'non-compliant')],
      repeat: [],
    });
    expect(summary).toContain('1 مخالفات');
    expect(summary).toContain('لأول مرة');
    expect(summary).not.toContain('متكرر');
  });

  it('formats only repeat violations (singular)', () => {
    const summary = formatViolationGroupSummary({
      firstTime: [],
      repeat: [makeItem('1', 'non-compliant', true)],
    });
    expect(summary).toContain('متكرر');
  });

  it('formats only repeat violations (plural)', () => {
    const summary = formatViolationGroupSummary({
      firstTime: [],
      repeat: [makeItem('1', 'non-compliant', true), makeItem('2', 'non-compliant', true)],
    });
    expect(summary).toContain('متكررة');
  });

  it('formats both groups', () => {
    const summary = formatViolationGroupSummary({
      firstTime: [makeItem('1', 'non-compliant'), makeItem('2', 'non-compliant')],
      repeat: [makeItem('3', 'non-compliant', true)],
    });
    expect(summary).toContain('3 مخالفات');
    expect(summary).toContain('لأول مرة');
    expect(summary).toContain('متكرر');
  });
});

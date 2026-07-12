// __tests__/utils/groupViolations.test.ts
import { groupViolationsByRepeat, formatViolationGroupSummary } from '../../src/utils/groupViolations';
import { InspectionItem } from '../../src/types';

function item(id: string, status: string, isRepeat?: boolean): InspectionItem {
  return { id, complianceStatus: status, isRepeatViolation: isRepeat, criteria: id, severity: 'low' } as InspectionItem;
}

describe('groupViolationsByRepeat', () => {
  it('empty → both groups empty', () => {
    const r = groupViolationsByRepeat([]);
    expect(r.firstTime).toHaveLength(0);
    expect(r.repeat).toHaveLength(0);
  });

  it('non-compliant without isRepeatViolation → firstTime', () => {
    const r = groupViolationsByRepeat([item('a', 'non-compliant')]);
    expect(r.firstTime).toHaveLength(1);
    expect(r.repeat).toHaveLength(0);
  });

  it('non-compliant with isRepeatViolation=true → repeat', () => {
    const r = groupViolationsByRepeat([item('a', 'non-compliant', true)]);
    expect(r.firstTime).toHaveLength(0);
    expect(r.repeat).toHaveLength(1);
  });

  it('compliant and na items are excluded', () => {
    const r = groupViolationsByRepeat([
      item('a', 'compliant'),
      item('b', 'na'),
      item('c', 'non-compliant', false),
    ]);
    expect(r.firstTime).toHaveLength(1);
    expect(r.repeat).toHaveLength(0);
  });

  it('mixed first-time and repeat', () => {
    const r = groupViolationsByRepeat([
      item('a', 'non-compliant', false),
      item('b', 'non-compliant', true),
      item('c', 'non-compliant', true),
    ]);
    expect(r.firstTime).toHaveLength(1);
    expect(r.repeat).toHaveLength(2);
  });
});

describe('formatViolationGroupSummary', () => {
  it('no violations → Arabic no-violations string', () => {
    expect(formatViolationGroupSummary({ firstTime: [], repeat: [] })).toBe('لا توجد مخالفات');
  });

  it('only first-time violations', () => {
    const r = formatViolationGroupSummary({ firstTime: [item('a', 'non-compliant')], repeat: [] });
    expect(r).toContain('1');
    expect(r).toContain('لأول مرة');
  });

  it('only repeat violations singular', () => {
    const r = formatViolationGroupSummary({ firstTime: [], repeat: [item('a', 'non-compliant', true)] });
    expect(r).toContain('متكرر');
  });

  it('only repeat violations plural', () => {
    const r = formatViolationGroupSummary({
      firstTime: [],
      repeat: [item('a', 'non-compliant', true), item('b', 'non-compliant', true)],
    });
    expect(r).toContain('متكررة');
  });

  it('mixed first-time and repeat', () => {
    const r = formatViolationGroupSummary({
      firstTime: [item('a', 'non-compliant')],
      repeat: [item('b', 'non-compliant', true)],
    });
    expect(r).toContain('2');
    expect(r).toContain('لأول مرة');
    expect(r).toContain('متكرر');
  });
});

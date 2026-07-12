// __tests__/utils/groupViolations.test.ts
import { groupViolationsByRepeat, formatViolationGroupSummary } from '../../src/utils/groupViolations';
import { InspectionItem } from '../../src/types';

function item(id: string, status: string, isRepeat?: boolean): InspectionItem {
  return { id, complianceStatus: status, isRepeatViolation: isRepeat } as InspectionItem;
}

describe('groupViolationsByRepeat', () => {
  it('empty → both arrays empty', () => {
    const r = groupViolationsByRepeat([]);
    expect(r.firstTime).toHaveLength(0);
    expect(r.repeat).toHaveLength(0);
  });

  it('compliant items excluded', () => {
    const r = groupViolationsByRepeat([item('a', 'compliant')]);
    expect(r.firstTime).toHaveLength(0);
    expect(r.repeat).toHaveLength(0);
  });

  it('na items excluded', () => {
    const r = groupViolationsByRepeat([item('a', 'na')]);
    expect(r.firstTime).toHaveLength(0);
  });

  it('non-compliant without isRepeatViolation → firstTime', () => {
    const r = groupViolationsByRepeat([item('a', 'non-compliant')]);
    expect(r.firstTime).toHaveLength(1);
    expect(r.repeat).toHaveLength(0);
  });

  it('non-compliant with isRepeatViolation=false → firstTime', () => {
    const r = groupViolationsByRepeat([item('a', 'non-compliant', false)]);
    expect(r.firstTime).toHaveLength(1);
    expect(r.repeat).toHaveLength(0);
  });

  it('non-compliant with isRepeatViolation=true → repeat', () => {
    const r = groupViolationsByRepeat([item('a', 'non-compliant', true)]);
    expect(r.firstTime).toHaveLength(0);
    expect(r.repeat).toHaveLength(1);
  });

  it('mixed batch', () => {
    const items = [
      item('a', 'non-compliant', false),
      item('b', 'non-compliant', true),
      item('c', 'compliant'),
      item('d', 'non-compliant'),
    ];
    const r = groupViolationsByRepeat(items);
    expect(r.firstTime).toHaveLength(2);
    expect(r.repeat).toHaveLength(1);
  });
});

describe('formatViolationGroupSummary', () => {
  it('no violations → لا توجد مخالفات', () => {
    expect(formatViolationGroupSummary({ firstTime: [], repeat: [] })).toBe('لا توجد مخالفات');
  });

  it('only firstTime', () => {
    const r = formatViolationGroupSummary({ firstTime: [item('a', 'non-compliant')], repeat: [] });
    expect(r).toContain('1 مخالفات');
    expect(r).toContain('لأول مرة');
  });

  it('only repeat (singular)', () => {
    const r = formatViolationGroupSummary({ firstTime: [], repeat: [item('a', 'non-compliant')] });
    expect(r).toContain('1 مخالفات');
    expect(r).toContain('متكرر');
  });

  it('repeat plural (2+) uses ة suffix', () => {
    const r = formatViolationGroupSummary({
      firstTime: [],
      repeat: [item('a', 'non-compliant'), item('b', 'non-compliant')],
    });
    expect(r).toContain('متكررة');
  });

  it('mixed — shows both parts', () => {
    const r = formatViolationGroupSummary({
      firstTime: [item('a', 'non-compliant')],
      repeat: [item('b', 'non-compliant')],
    });
    expect(r).toContain('2 مخالفات');
    expect(r).toContain('لأول مرة');
    expect(r).toContain('متكرر');
  });
});

// __tests__/hooks/useCollapsibleSections.test.ts
// W4-fix: sections start collapsed=true. All assertions updated accordingly.
import { renderHook, act } from '@testing-library/react-native';
import { useCollapsibleSections } from '../../src/hooks/useCollapsibleSections';

describe('useCollapsibleSections', () => {
  it('initialises all sections as collapsed (collapsed=true)', () => {
    const { result } = renderHook(() =>
      useCollapsibleSections(['\u0627\u0644\u0645\u062d\u0648\u0631 1', '\u0627\u0644\u0645\u062d\u0648\u0631 2'])
    );
    expect(result.current.isCollapsed('\u0627\u0644\u0645\u062d\u0648\u0631 1')).toBe(true);
    expect(result.current.isCollapsed('\u0627\u0644\u0645\u062d\u0648\u0631 2')).toBe(true);
  });

  it('toggleSection expands a collapsed section (first tap opens)', () => {
    const { result } = renderHook(() =>
      useCollapsibleSections(['A', 'B'])
    );
    // A starts collapsed=true; one tap → false (expanded)
    act(() => { result.current.toggleSection('A'); });
    expect(result.current.isCollapsed('A')).toBe(false);
    expect(result.current.isCollapsed('B')).toBe(true); // untouched
  });

  it('toggleSection collapses an expanded section (second tap closes)', () => {
    const { result } = renderHook(() =>
      useCollapsibleSections(['A'])
    );
    act(() => { result.current.toggleSection('A'); }); // true → false
    act(() => { result.current.toggleSection('A'); }); // false → true
    expect(result.current.isCollapsed('A')).toBe(true);
  });

  it('isCollapsed returns true for unknown section (safe default)', () => {
    const { result } = renderHook(() =>
      useCollapsibleSections(['A'])
    );
    expect(result.current.isCollapsed('unknown')).toBe(true);
  });

  it('adds new sections as collapsed when sectionTitles changes', () => {
    const { result, rerender } = renderHook(
      ({ titles }: { titles: string[] }) => useCollapsibleSections(titles),
      { initialProps: { titles: ['A'] } }
    );
    // expand A first
    act(() => { result.current.toggleSection('A'); });
    expect(result.current.isCollapsed('A')).toBe(false);

    // add new section B
    rerender({ titles: ['A', 'B'] });
    expect(result.current.isCollapsed('A')).toBe(false); // preserved (expanded)
    expect(result.current.isCollapsed('B')).toBe(true);  // new = collapsed
  });

  it('getSectionProgress counts evaluated items', () => {
    const { result } = renderHook(() => useCollapsibleSections([]));
    const items = [
      { complianceStatus: 'compliant' },
      { complianceStatus: 'not-evaluated' },
      { complianceStatus: 'non-compliant' },
    ];
    expect(result.current.getSectionProgress(items)).toBe('2/3');
  });

  it('getSectionProgress returns 0/0 for empty items', () => {
    const { result } = renderHook(() => useCollapsibleSections([]));
    expect(result.current.getSectionProgress([])).toBe('0/0');
  });
});

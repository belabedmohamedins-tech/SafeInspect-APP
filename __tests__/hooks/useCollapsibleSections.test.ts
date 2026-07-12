// __tests__/hooks/useCollapsibleSections.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useCollapsibleSections } from '../../src/hooks/useCollapsibleSections';

describe('useCollapsibleSections', () => {
  it('initialises all sections as expanded (collapsed=false)', () => {
    const { result } = renderHook(() =>
      useCollapsibleSections(['\u0627\u0644\u0645\u062d\u0648\u0631 1', '\u0627\u0644\u0645\u062d\u0648\u0631 2'])
    );
    expect(result.current.isCollapsed('\u0627\u0644\u0645\u062d\u0648\u0631 1')).toBe(false);
    expect(result.current.isCollapsed('\u0627\u0644\u0645\u062d\u0648\u0631 2')).toBe(false);
  });

  it('toggleSection collapses an expanded section', () => {
    const { result } = renderHook(() =>
      useCollapsibleSections(['A', 'B'])
    );
    act(() => { result.current.toggleSection('A'); });
    expect(result.current.isCollapsed('A')).toBe(true);
    expect(result.current.isCollapsed('B')).toBe(false);
  });

  it('toggleSection expands a collapsed section', () => {
    const { result } = renderHook(() =>
      useCollapsibleSections(['A'])
    );
    act(() => { result.current.toggleSection('A'); });
    act(() => { result.current.toggleSection('A'); });
    expect(result.current.isCollapsed('A')).toBe(false);
  });

  it('isCollapsed returns false for unknown section', () => {
    const { result } = renderHook(() =>
      useCollapsibleSections(['A'])
    );
    expect(result.current.isCollapsed('unknown')).toBe(false);
  });

  it('adds new sections as expanded when sectionTitles changes', () => {
    const { result, rerender } = renderHook(
      ({ titles }: { titles: string[] }) => useCollapsibleSections(titles),
      { initialProps: { titles: ['A'] } }
    );
    // collapse A first
    act(() => { result.current.toggleSection('A'); });
    expect(result.current.isCollapsed('A')).toBe(true);

    // add new section B
    rerender({ titles: ['A', 'B'] });
    expect(result.current.isCollapsed('A')).toBe(true);  // preserved
    expect(result.current.isCollapsed('B')).toBe(false); // new = expanded
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

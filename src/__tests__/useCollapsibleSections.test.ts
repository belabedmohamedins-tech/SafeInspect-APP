/**
 * Unit tests for src/hooks/useCollapsibleSections.ts
 */
import { act, renderHook } from '@testing-library/react-native';
import { useCollapsibleSections } from '../hooks/useCollapsibleSections';

describe('useCollapsibleSections', () => {
  it('starts all provided sections as collapsed', () => {
    const { result } = renderHook(() =>
      useCollapsibleSections(['ألف', 'باء', 'تاء'])
    );
    expect(result.current.isCollapsed('ألف')).toBe(true);
    expect(result.current.isCollapsed('باء')).toBe(true);
    expect(result.current.isCollapsed('تاء')).toBe(true);
  });

  it('toggleSection opens a collapsed section', () => {
    const { result } = renderHook(() => useCollapsibleSections(['ألف']));
    act(() => result.current.toggleSection('ألف'));
    expect(result.current.isCollapsed('ألف')).toBe(false);
  });

  it('toggleSection re-collapses an open section', () => {
    const { result } = renderHook(() => useCollapsibleSections(['ألف']));
    act(() => result.current.toggleSection('ألف'));
    act(() => result.current.toggleSection('ألف'));
    expect(result.current.isCollapsed('ألف')).toBe(true);
  });

  it('isCollapsed returns true for an unknown section title', () => {
    const { result } = renderHook(() => useCollapsibleSections([]));
    expect(result.current.isCollapsed('لا يوجد')).toBe(true);
  });

  it('getSectionProgress counts only evaluated items', () => {
    const { result } = renderHook(() => useCollapsibleSections([]));
    const items = [
      { complianceStatus: 'compliant'     },
      { complianceStatus: 'non-compliant' },
      { complianceStatus: 'not-evaluated' },
      { complianceStatus: 'n/a'           },
    ];
    expect(result.current.getSectionProgress(items)).toBe('3/4');
  });

  it('getSectionProgress returns 0/0 for an empty section', () => {
    const { result } = renderHook(() => useCollapsibleSections([]));
    expect(result.current.getSectionProgress([])).toBe('0/0');
  });

  it('preserves existing collapse state when new sections are added', () => {
    const { result, rerender } = renderHook(
      ({ titles }) => useCollapsibleSections(titles),
      { initialProps: { titles: ['ألف'] } }
    );
    // open the first section
    act(() => result.current.toggleSection('ألف'));
    expect(result.current.isCollapsed('ألف')).toBe(false);

    // add a new section
    rerender({ titles: ['ألف', 'باء'] });
    // original section state must not change
    expect(result.current.isCollapsed('ألف')).toBe(false);
    // new section starts collapsed
    expect(result.current.isCollapsed('باء')).toBe(true);
  });

  it('toggling one section does not affect other sections', () => {
    const { result } = renderHook(() =>
      useCollapsibleSections(['ألف', 'باء'])
    );
    act(() => result.current.toggleSection('ألف'));
    expect(result.current.isCollapsed('ألف')).toBe(false);
    expect(result.current.isCollapsed('باء')).toBe(true);
  });
});

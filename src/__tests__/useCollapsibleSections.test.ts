/**
 * Unit tests for src/hooks/useCollapsibleSections.ts
 *
 * useCollapsibleSections is a pure React state hook with no native module deps.
 * No wrapper is needed — renderHook works out-of-the-box for pure hooks.
 * (The React.Fragment createElement wrapper pattern leaves result.current
 * undefined due to the synthetic RN Proxy registered in jest.setup.ts.)
 */
import { act, renderHook } from '@testing-library/react-native';
import { useCollapsibleSections } from '../hooks/useCollapsibleSections';

describe('useCollapsibleSections', () => {
  it('initialises all sections as expanded (collapsed = false)', () => {
    const { result } = renderHook(() => useCollapsibleSections(['A', 'B', 'C']));
    ['A', 'B', 'C'].forEach(s =>
      expect(result.current.collapsed[s]).toBe(false),
    );
  });

  it('toggleSection flips one section without affecting others', async () => {
    const { result } = renderHook(() => useCollapsibleSections(['X', 'Y']));
    await act(async () => { result.current.toggleSection('X'); });
    expect(result.current.collapsed['X']).toBe(true);
    expect(result.current.collapsed['Y']).toBe(false);
  });

  it('toggleSection toggles back to expanded on second call', async () => {
    const { result } = renderHook(() => useCollapsibleSections(['X']));
    await act(async () => { result.current.toggleSection('X'); });
    await act(async () => { result.current.toggleSection('X'); });
    expect(result.current.collapsed['X']).toBe(false);
  });

  it('isCollapsed() returns false for an expanded section', () => {
    const { result } = renderHook(() => useCollapsibleSections(['alpha']));
    expect(result.current.isCollapsed('alpha')).toBe(false);
  });

  it('isCollapsed() returns true after toggling the section', async () => {
    const { result } = renderHook(() => useCollapsibleSections(['alpha']));
    await act(async () => { result.current.toggleSection('alpha'); });
    expect(result.current.isCollapsed('alpha')).toBe(true);
  });

  it('isCollapsed() returns false for an unknown section key (safe default)', () => {
    const { result } = renderHook(() => useCollapsibleSections([]));
    expect(result.current.isCollapsed('nonexistent')).toBe(false);
  });

  it('getSectionProgress returns evaluated/total ratio string', () => {
    const { result } = renderHook(() => useCollapsibleSections(['S1']));
    const items = [
      { complianceStatus: 'compliant' },
      { complianceStatus: 'not-evaluated' },
      { complianceStatus: 'non-compliant' },
    ];
    expect(result.current.getSectionProgress(items)).toBe('2/3');
  });
});

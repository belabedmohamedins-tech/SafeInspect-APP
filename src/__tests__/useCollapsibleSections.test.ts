/**
 * Unit tests for src/hooks/useCollapsibleSections.ts
 */
import { act, renderHook } from '@testing-library/react-native';
import { useCollapsibleSections } from '../hooks/useCollapsibleSections';

describe('useCollapsibleSections', () => {
  it('initialises all sections as collapsed (false)', () => {
    const sections = ['A', 'B', 'C'];
    const { result } = renderHook(() => useCollapsibleSections(sections));
    sections.forEach(s => {
      expect(result.current.collapsed[s]).toBe(false);
    });
  });

  it('toggleSection flips a single section', () => {
    const { result } = renderHook(() => useCollapsibleSections(['X', 'Y']));
    act(() => { result.current.toggleSection('X'); });
    expect(result.current.collapsed['X']).toBe(true);
    expect(result.current.collapsed['Y']).toBe(false);
  });

  it('toggleSection toggles back on second call', () => {
    const { result } = renderHook(() => useCollapsibleSections(['X']));
    act(() => { result.current.toggleSection('X'); });
    act(() => { result.current.toggleSection('X'); });
    expect(result.current.collapsed['X']).toBe(false);
  });
});

/**
 * Unit tests for src/hooks/useCollapsibleSections.ts
 */
import { act, renderHook } from '@testing-library/react-native';
import { useCollapsibleSections } from '../hooks/useCollapsibleSections';

// No wrapper needed: useCollapsibleSections is a pure-logic hook.
describe('useCollapsibleSections', () => {
  it('initialises all sections as collapsed (false)', () => {
    const sections = ['A', 'B', 'C'];
    const { result } = renderHook(() => useCollapsibleSections(sections));
    sections.forEach(s => {
      expect(result.current.collapsed[s]).toBe(false);
    });
  });

  it('toggleSection flips a single section', async () => {
    const { result } = renderHook(() => useCollapsibleSections(['X', 'Y']));
    await act(async () => { result.current.toggleSection('X'); });
    expect(result.current.collapsed['X']).toBe(true);
    expect(result.current.collapsed['Y']).toBe(false);
  });

  it('toggleSection toggles back on second call', async () => {
    const { result } = renderHook(() => useCollapsibleSections(['X']));
    await act(async () => { result.current.toggleSection('X'); });
    await act(async () => { result.current.toggleSection('X'); });
    expect(result.current.collapsed['X']).toBe(false);
  });
});

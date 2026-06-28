/**
 * Unit tests for src/hooks/useCollapsibleSections.ts
 */
import { act, renderHook } from '@testing-library/react-native';
import React from 'react';
import { useCollapsibleSections } from '../hooks/useCollapsibleSections';

// A plain function component wrapper (not an arrow function returning
// React.createElement) avoids the result.current === undefined issue
// seen with some versions of @testing-library/react-native.
function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}

describe('useCollapsibleSections', () => {
  it('initialises all sections as collapsed (false)', () => {
    const sections = ['A', 'B', 'C'];
    const { result } = renderHook(() => useCollapsibleSections(sections), { wrapper });
    sections.forEach(s => {
      expect(result.current.collapsed[s]).toBe(false);
    });
  });

  it('toggleSection flips a single section', async () => {
    const { result } = renderHook(() => useCollapsibleSections(['X', 'Y']), { wrapper });
    await act(async () => { result.current.toggleSection('X'); });
    expect(result.current.collapsed['X']).toBe(true);
    expect(result.current.collapsed['Y']).toBe(false);
  });

  it('toggleSection toggles back on second call', async () => {
    const { result } = renderHook(() => useCollapsibleSections(['X']), { wrapper });
    await act(async () => { result.current.toggleSection('X'); });
    await act(async () => { result.current.toggleSection('X'); });
    expect(result.current.collapsed['X']).toBe(false);
  });
});

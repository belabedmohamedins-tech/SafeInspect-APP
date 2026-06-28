/**
 * Unit tests for src/hooks/useCollapsibleSections.ts
 */
import { act, renderHook } from '@testing-library/react-native';
import React from 'react';
import { useCollapsibleSections } from '../hooks/useCollapsibleSections';

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);

describe('useCollapsibleSections', () => {
  it('initialises all sections as collapsed (false)', () => {
    const sections = ['A', 'B', 'C'];
    const { result } = renderHook(() => useCollapsibleSections(sections), { wrapper });
    sections.forEach(s => {
      expect(result.current.collapsed[s]).toBe(false);
    });
  });

  it('toggleSection flips a single section', () => {
    const { result } = renderHook(() => useCollapsibleSections(['X', 'Y']), { wrapper });
    act(() => { result.current.toggleSection('X'); });
    expect(result.current.collapsed['X']).toBe(true);
    expect(result.current.collapsed['Y']).toBe(false);
  });

  it('toggleSection toggles back on second call', () => {
    const { result } = renderHook(() => useCollapsibleSections(['X']), { wrapper });
    act(() => { result.current.toggleSection('X'); });
    act(() => { result.current.toggleSection('X'); });
    expect(result.current.collapsed['X']).toBe(false);
  });
});

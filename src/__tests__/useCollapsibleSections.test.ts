/**
 * Unit tests for src/hooks/useCollapsibleSections.ts
 *
 * useCollapsibleSections is a pure React state hook.
 *
 * WHY we do NOT use renderHook from @testing-library/react-native:
 *   jest.setup.ts mocks 'react-native' with a Proxy whose fallback get trap
 *   returns jest.fn() for every unknown key, including React internal symbols
 *   ($$typeof, _context, ...) that RNTL's renderHook uses to mount its host
 *   component wrapper tree. This leaves result.current = undefined.
 *
 * FIX: use a minimal renderPureHook shim backed by react-test-renderer.
 * It never touches react-native host components.
 */
import React from 'react';
import { act } from '@testing-library/react-native';
import { useCollapsibleSections } from '../hooks/useCollapsibleSections';

// ─── Minimal renderHook shim (pure React, no RN host renderer) ───────────────

function renderPureHook<T>(hook: () => T): { result: React.MutableRefObject<T> } {
  const result = React.createRef() as React.MutableRefObject<T>;
  function Wrapper() {
    result.current = hook();
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { create } = require('react-test-renderer');
  act(() => { create(React.createElement(Wrapper)); });
  return { result };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useCollapsibleSections', () => {
  it('initialises all sections as expanded (collapsed = false)', () => {
    const { result } = renderPureHook(() => useCollapsibleSections(['A', 'B', 'C']));
    ['A', 'B', 'C'].forEach(s =>
      expect(result.current.collapsed[s]).toBe(false),
    );
  });

  it('toggleSection flips one section without affecting others', async () => {
    const { result } = renderPureHook(() => useCollapsibleSections(['X', 'Y']));
    await act(async () => { result.current.toggleSection('X'); });
    expect(result.current.collapsed['X']).toBe(true);
    expect(result.current.collapsed['Y']).toBe(false);
  });

  it('toggleSection toggles back to expanded on second call', async () => {
    const { result } = renderPureHook(() => useCollapsibleSections(['X']));
    await act(async () => { result.current.toggleSection('X'); });
    await act(async () => { result.current.toggleSection('X'); });
    expect(result.current.collapsed['X']).toBe(false);
  });

  it('isCollapsed() returns false for an expanded section', () => {
    const { result } = renderPureHook(() => useCollapsibleSections(['alpha']));
    expect(result.current.isCollapsed('alpha')).toBe(false);
  });

  it('isCollapsed() returns true after toggling the section', async () => {
    const { result } = renderPureHook(() => useCollapsibleSections(['alpha']));
    await act(async () => { result.current.toggleSection('alpha'); });
    expect(result.current.isCollapsed('alpha')).toBe(true);
  });

  it('isCollapsed() returns false for an unknown section key (safe default)', () => {
    const { result } = renderPureHook(() => useCollapsibleSections([]));
    expect(result.current.isCollapsed('nonexistent')).toBe(false);
  });

  it('getSectionProgress returns evaluated/total ratio string', () => {
    const { result } = renderPureHook(() => useCollapsibleSections(['S1']));
    const items = [
      { complianceStatus: 'compliant' },
      { complianceStatus: 'not-evaluated' },
      { complianceStatus: 'non-compliant' },
    ];
    expect(result.current.getSectionProgress(items)).toBe('2/3');
  });
});

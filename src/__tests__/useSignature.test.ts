/**
 * Unit tests for src/hooks/useSignature.ts
 *
 * useSignature is a pure React state hook with no native module dependencies.
 *
 * WHY we do NOT use renderHook from @testing-library/react-native:
 *   jest.setup.ts mocks 'react-native' with a Proxy whose fallback get trap
 *   returns jest.fn() for every unknown key, including React internal symbols
 *   ($$typeof, _context, ...) that RNTL's renderHook uses to mount its host
 *   component wrapper tree. This leaves result.current = undefined.
 *
 * FIX: use React 18's built-in React.act + a manual ref-based renderHook shim
 * that never touches react-native host components.
 */
import React from 'react';
import { act } from '@testing-library/react-native';
import { useSignature } from '../hooks/useSignature';

// ─── Minimal renderHook shim (pure React, no RN host renderer) ───────────────
// Renders the hook in a plain React function component via React.createElement,
// stores the return value in a ref, and flushes effects with act().
// Compatible with React 18 — no external dependencies needed.

function renderPureHook<T>(hook: () => T): { result: React.MutableRefObject<T> } {
  const result = React.createRef() as React.MutableRefObject<T>;
  function Wrapper() {
    result.current = hook();
    return null;
  }
  // Use React's test renderer directly
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { create } = require('react-test-renderer');
  let renderer: ReturnType<typeof create>;
  act(() => {
    renderer = create(React.createElement(Wrapper));
  });
  const rerender = (newHook?: () => T) => {
    act(() => {
      renderer.update(React.createElement(newHook ? function W2() { result.current = newHook(); return null; } : Wrapper));
    });
  };
  void rerender; // available if needed
  return { result };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useSignature', () => {
  it('initialises with empty signature and collapsed panel', () => {
    const { result } = renderPureHook(() => useSignature());
    expect(result.current.signature).toBe('');
    expect(result.current.showSignature).toBe(false);
  });

  it('setSignature stores the value', async () => {
    const { result } = renderPureHook(() => useSignature());
    await act(async () => {
      result.current.setSignature('data:image/png;base64,abc');
    });
    expect(result.current.signature).toBe('data:image/png;base64,abc');
  });

  it('setSignature collapses the panel after storing a value', async () => {
    const { result } = renderPureHook(() => useSignature());
    await act(async () => { result.current.setShowSignature(true); });
    await act(async () => { result.current.setSignature('sig-data'); });
    expect(result.current.showSignature).toBe(false);
  });

  it('clearSignature resets the value to empty string', async () => {
    const { result } = renderPureHook(() => useSignature());
    await act(async () => { result.current.setSignature('some-sig'); });
    await act(async () => { result.current.clearSignature(); });
    expect(result.current.signature).toBe('');
  });

  it('setShowSignature toggles the panel flag independently', async () => {
    const { result } = renderPureHook(() => useSignature());
    await act(async () => { result.current.setShowSignature(true); });
    expect(result.current.showSignature).toBe(true);
    await act(async () => { result.current.setShowSignature(false); });
    expect(result.current.showSignature).toBe(false);
  });

  it('handleSignature is an alias for setSignature', async () => {
    const { result } = renderPureHook(() => useSignature());
    await act(async () => { result.current.handleSignature('alias-test'); });
    expect(result.current.signature).toBe('alias-test');
  });
});

/**
 * Unit tests for src/hooks/useSignature.ts
 *
 * Why not @testing-library/react-native renderHook?
 *   jest.setup.ts wraps react-native in a Proxy whose fallback returns
 *   jest.fn() for every unknown key — including React internal symbols
 *   that RNTL's renderHook needs to mount its wrapper tree. Result:
 *   result.current is always undefined/null.
 *
 * Fix: renderPureHook — renders the hook inside react-test-renderer
 *   (pure JS reconciler, never touches react-native host components)
 *   and captures output in a plain mutable object { current } that lives
 *   in the same closure as Wrapper, so cross-reconciler ref issues
 *   cannot occur. All act() calls use react-test-renderer's own act.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { act: rtrAct, create } = require('react-test-renderer');
import React from 'react';
import { useSignature } from '../hooks/useSignature';

// ─── renderPureHook ───────────────────────────────────────────────────────────
// Returns a plain { current } object that is always up-to-date because it is
// written by Wrapper on every render inside the same reconciler instance.

function renderPureHook<T>(hook: () => T) {
  const snapshot: { current: T | null } = { current: null };

  function Wrapper() {
    snapshot.current = hook();
    return null;
  }

  rtrAct(() => {
    create(React.createElement(Wrapper));
  });

  return snapshot;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useSignature', () => {
  it('initialises with empty signature and collapsed panel', () => {
    const result = renderPureHook(() => useSignature());
    expect(result.current!.signature).toBe('');
    expect(result.current!.showSignature).toBe(false);
  });

  it('setSignature stores the value', () => {
    const result = renderPureHook(() => useSignature());
    rtrAct(() => { result.current!.setSignature('data:image/png;base64,abc'); });
    expect(result.current!.signature).toBe('data:image/png;base64,abc');
  });

  it('setSignature collapses the panel after storing a value', () => {
    const result = renderPureHook(() => useSignature());
    rtrAct(() => { result.current!.setShowSignature(true); });
    expect(result.current!.showSignature).toBe(true);
    rtrAct(() => { result.current!.setSignature('sig-data'); });
    expect(result.current!.showSignature).toBe(false);
  });

  it('clearSignature resets the value to empty string', () => {
    const result = renderPureHook(() => useSignature());
    rtrAct(() => { result.current!.setSignature('some-sig'); });
    expect(result.current!.signature).toBe('some-sig');
    rtrAct(() => { result.current!.clearSignature(); });
    expect(result.current!.signature).toBe('');
  });

  it('setShowSignature toggles the panel flag independently', () => {
    const result = renderPureHook(() => useSignature());
    rtrAct(() => { result.current!.setShowSignature(true); });
    expect(result.current!.showSignature).toBe(true);
    rtrAct(() => { result.current!.setShowSignature(false); });
    expect(result.current!.showSignature).toBe(false);
  });

  it('handleSignature is an alias for setSignature', () => {
    const result = renderPureHook(() => useSignature());
    rtrAct(() => { result.current!.handleSignature('alias-test'); });
    expect(result.current!.signature).toBe('alias-test');
  });
});

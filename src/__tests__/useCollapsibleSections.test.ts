/**
 * Unit tests for src/hooks/useCollapsibleSections.ts
 *
 * Same renderPureHook pattern as useSignature.test.ts.
 * See that file for the full explanation of why RNTL renderHook is avoided.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { act: rtrAct, create } = require('react-test-renderer');
import React from 'react';
import { useCollapsibleSections } from '../hooks/useCollapsibleSections';

// ─── renderPureHook ───────────────────────────────────────────────────────────

function renderPureHook<T>(hook: () => T) {
  const snapshot: { current: T | null } = { current: null };
  function Wrapper() {
    snapshot.current = hook();
    return null;
  }
  rtrAct(() => { create(React.createElement(Wrapper)); });
  return snapshot;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useCollapsibleSections', () => {
  it('initialises all sections as expanded (collapsed = false)', () => {
    const result = renderPureHook(() => useCollapsibleSections(['A', 'B', 'C']));
    ['A', 'B', 'C'].forEach(s =>
      expect(result.current!.collapsed[s]).toBe(false),
    );
  });

  it('toggleSection flips one section without affecting others', () => {
    const result = renderPureHook(() => useCollapsibleSections(['X', 'Y']));
    rtrAct(() => { result.current!.toggleSection('X'); });
    expect(result.current!.collapsed['X']).toBe(true);
    expect(result.current!.collapsed['Y']).toBe(false);
  });

  it('toggleSection toggles back to expanded on second call', () => {
    const result = renderPureHook(() => useCollapsibleSections(['X']));
    rtrAct(() => { result.current!.toggleSection('X'); });
    rtrAct(() => { result.current!.toggleSection('X'); });
    expect(result.current!.collapsed['X']).toBe(false);
  });

  it('isCollapsed() returns false for an expanded section', () => {
    const result = renderPureHook(() => useCollapsibleSections(['alpha']));
    expect(result.current!.isCollapsed('alpha')).toBe(false);
  });

  it('isCollapsed() returns true after toggling the section', () => {
    const result = renderPureHook(() => useCollapsibleSections(['alpha']));
    rtrAct(() => { result.current!.toggleSection('alpha'); });
    expect(result.current!.isCollapsed('alpha')).toBe(true);
  });

  it('isCollapsed() returns false for an unknown section key (safe default)', () => {
    const result = renderPureHook(() => useCollapsibleSections([]));
    expect(result.current!.isCollapsed('nonexistent')).toBe(false);
  });

  it('getSectionProgress returns evaluated/total ratio string', () => {
    const result = renderPureHook(() => useCollapsibleSections(['S1']));
    const items = [
      { complianceStatus: 'compliant' },
      { complianceStatus: 'not-evaluated' },
      { complianceStatus: 'non-compliant' },
    ];
    expect(result.current!.getSectionProgress(items)).toBe('2/3');
  });
});

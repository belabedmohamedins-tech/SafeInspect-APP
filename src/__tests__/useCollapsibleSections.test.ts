/**
 * Unit tests for src/hooks/useCollapsibleSections.ts
 *
 * W4-fix: sections start collapsed=true. All assertions updated accordingly.
 * Same renderPureHook pattern as useSignature.test.ts.
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

// Renders a hook whose input can be changed between acts.
function renderPureHookStateful<TProps, TResult>(
  useHook: (p: TProps) => TResult,
  initialProps: TProps,
) {
  const snapshot: { current: TResult | null } = { current: null };
  let latestProps: TProps = initialProps;
  let renderer: ReturnType<typeof create>;
  function Wrapper() {
    snapshot.current = useHook(latestProps);
    return null;
  }
  rtrAct(() => { renderer = create(React.createElement(Wrapper)); });
  function rerender(newProps: TProps) {
    latestProps = newProps;
    rtrAct(() => { renderer.update(React.createElement(Wrapper)); });
  }
  return { snapshot, rerender };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useCollapsibleSections', () => {
  it('initialises all sections as collapsed (collapsed = true)', () => {
    const result = renderPureHook(() => useCollapsibleSections(['A', 'B', 'C']));
    ['A', 'B', 'C'].forEach(s =>
      expect(result.current!.collapsed[s]).toBe(true),
    );
  });

  it('toggleSection expands a collapsed section (first tap opens)', () => {
    const result = renderPureHook(() => useCollapsibleSections(['X', 'Y']));
    // X starts true; one tap → false
    rtrAct(() => { result.current!.toggleSection('X'); });
    expect(result.current!.collapsed['X']).toBe(false);
    expect(result.current!.collapsed['Y']).toBe(true); // untouched
  });

  it('toggleSection collapses an expanded section (second tap closes)', () => {
    const result = renderPureHook(() => useCollapsibleSections(['X']));
    rtrAct(() => { result.current!.toggleSection('X'); }); // true → false
    rtrAct(() => { result.current!.toggleSection('X'); }); // false → true
    expect(result.current!.collapsed['X']).toBe(true);
  });

  it('isCollapsed() returns true for a collapsed section (initial state)', () => {
    const result = renderPureHook(() => useCollapsibleSections(['alpha']));
    expect(result.current!.isCollapsed('alpha')).toBe(true);
  });

  it('isCollapsed() returns false after toggling (expanding) the section', () => {
    const result = renderPureHook(() => useCollapsibleSections(['alpha']));
    rtrAct(() => { result.current!.toggleSection('alpha'); }); // true → false
    expect(result.current!.isCollapsed('alpha')).toBe(false);
  });

  it('isCollapsed() returns true for an unknown section key (safe default)', () => {
    const result = renderPureHook(() => useCollapsibleSections([]));
    expect(result.current!.isCollapsed('nonexistent')).toBe(true);
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

  // ── useEffect branch — new title added after initial render ──
  it('adds a new section key as collapsed when sectionTitles grows', () => {
    const { snapshot, rerender } = renderPureHookStateful(
      (titles: string[]) => useCollapsibleSections(titles),
      ['A', 'B'],
    );
    // Sanity: initial state — all collapsed
    expect(snapshot.current!.collapsed['A']).toBe(true);
    expect(snapshot.current!.collapsed['B']).toBe(true);
    expect(snapshot.current!.collapsed['C']).toBeUndefined();

    // Re-render with a new title → useEffect fires → 'C' added as true
    rerender(['A', 'B', 'C']);
    expect(snapshot.current!.collapsed['C']).toBe(true);
  });

  it('does NOT reset collapsed state of existing sections when a new one is added', () => {
    const { snapshot, rerender } = renderPureHookStateful(
      (titles: string[]) => useCollapsibleSections(titles),
      ['A', 'B'],
    );
    // Expand A (true → false)
    rtrAct(() => { snapshot.current!.toggleSection('A'); });
    expect(snapshot.current!.collapsed['A']).toBe(false);

    rerender(['A', 'B', 'C']);
    // 'A' must remain expanded — the effect only adds missing keys
    expect(snapshot.current!.collapsed['A']).toBe(false);
    expect(snapshot.current!.collapsed['C']).toBe(true); // new = collapsed
  });
});

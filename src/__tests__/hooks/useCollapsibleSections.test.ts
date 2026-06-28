// src/__tests__/hooks/useCollapsibleSections.test.ts
//
// WHY render() IS WRAPPED IN act()
// ─────────────────────────────────
// In this version of @testing-library/react-native, render() does NOT
// synchronously flush the React reconciler. The component's first render
// commit happens asynchronously.  Calling render() without act() leaves
// ref.current === null immediately after the call returns.
//
// Wrapping render() in act() forces React to flush all pending state updates
// and effects synchronously before act() returns, so ref.current holds the
// hook's return value by the time the expect() calls run.
//
// WHY WE USE A COMPONENT HARNESS INSTEAD OF renderHook
// ──────────────────────────────────────────────────────
// jest.setup.ts documents the root cause: configure({ defaultWrapper }) was
// removed because it corrupts result.current in the installed RTLRN version.
// The corruption persists even when a per-call wrapper is passed to
// renderHook(). A component harness with render() sidesteps the broken path
// entirely while exercising the exact same React lifecycle.

import React from 'react';
import { View } from 'react-native';
import { render, act } from '@testing-library/react-native';
import { useCollapsibleSections } from '../../hooks/useCollapsibleSections';

type HookResult = ReturnType<typeof useCollapsibleSections>;

function makeHarness(getTitles: () => string[]) {
  const ref = { current: null as HookResult | null };

  function Harness() {
    const result = useCollapsibleSections(getTitles());
    // Assign during render — safe, pure write, no side effect.
    // This runs synchronously inside act(), so by the time act() returns
    // ref.current holds the latest hook return value.
    ref.current = result;
    return React.createElement(View, null);
  }

  return { Harness, ref };
}

// ─── initial state ────────────────────────────────────────────────────────────

describe('useCollapsibleSections — initial state', () => {
  it('all sections start expanded (collapsed=false)', () => {
    const { Harness, ref } = makeHarness(() => ['Axis A', 'Axis B']);
    act(() => { render(React.createElement(Harness)); });
    expect(ref.current!.collapsed['Axis A']).toBe(false);
    expect(ref.current!.collapsed['Axis B']).toBe(false);
  });

  it('isCollapsed() returns false for every section on init', () => {
    const { Harness, ref } = makeHarness(() => ['S1', 'S2', 'S3']);
    act(() => { render(React.createElement(Harness)); });
    expect(ref.current!.isCollapsed('S1')).toBe(false);
    expect(ref.current!.isCollapsed('S2')).toBe(false);
    expect(ref.current!.isCollapsed('S3')).toBe(false);
  });

  it('isCollapsed() returns false for an unknown title (default fallback)', () => {
    const { Harness, ref } = makeHarness(() => ['Known']);
    act(() => { render(React.createElement(Harness)); });
    expect(ref.current!.isCollapsed('Unknown')).toBe(false);
  });
});

// ─── toggleSection ────────────────────────────────────────────────────────────

describe('useCollapsibleSections — toggleSection', () => {
  it('collapses an expanded section', () => {
    const { Harness, ref } = makeHarness(() => ['Axis A']);
    act(() => { render(React.createElement(Harness)); });
    act(() => { ref.current!.toggleSection('Axis A'); });
    expect(ref.current!.collapsed['Axis A']).toBe(true);
    expect(ref.current!.isCollapsed('Axis A')).toBe(true);
  });

  it('expands a collapsed section', () => {
    const { Harness, ref } = makeHarness(() => ['Axis A']);
    act(() => { render(React.createElement(Harness)); });
    act(() => { ref.current!.toggleSection('Axis A'); });
    act(() => { ref.current!.toggleSection('Axis A'); });
    expect(ref.current!.collapsed['Axis A']).toBe(false);
  });

  it('toggling one section does not affect others', () => {
    const { Harness, ref } = makeHarness(() => ['S1', 'S2']);
    act(() => { render(React.createElement(Harness)); });
    act(() => { ref.current!.toggleSection('S1'); });
    expect(ref.current!.collapsed['S1']).toBe(true);
    expect(ref.current!.collapsed['S2']).toBe(false);
  });
});

// ─── dynamic title addition ───────────────────────────────────────────────────

describe('useCollapsibleSections — dynamic title addition (useEffect branch)', () => {
  it('adds a new title to collapsed map when sectionTitles prop gains a new entry', () => {
    let titles = ['Axis A'];
    const { Harness, ref } = makeHarness(() => titles);
    let rerender: ReturnType<typeof render>['rerender'];
    act(() => { ({ rerender } = render(React.createElement(Harness))); });

    expect(ref.current!.collapsed).toHaveProperty('Axis A');
    expect(ref.current!.collapsed).not.toHaveProperty('Axis B');

    titles = ['Axis A', 'Axis B'];
    act(() => { rerender(React.createElement(Harness)); });

    expect(ref.current!.collapsed).toHaveProperty('Axis B');
    expect(ref.current!.collapsed['Axis B']).toBe(false);
  });

  it('does not reset collapsed state of existing sections when a new one is added', () => {
    let titles = ['Axis A'];
    const { Harness, ref } = makeHarness(() => titles);
    let rerender: ReturnType<typeof render>['rerender'];
    act(() => { ({ rerender } = render(React.createElement(Harness))); });

    act(() => { ref.current!.toggleSection('Axis A'); });
    expect(ref.current!.collapsed['Axis A']).toBe(true);

    titles = ['Axis A', 'Axis C'];
    act(() => { rerender(React.createElement(Harness)); });

    expect(ref.current!.collapsed['Axis A']).toBe(true);
    expect(ref.current!.collapsed['Axis C']).toBe(false);
  });
});

// ─── getSectionProgress ───────────────────────────────────────────────────────

describe('useCollapsibleSections — getSectionProgress', () => {
  it('returns "0/N" when no items are evaluated', () => {
    const { Harness, ref } = makeHarness(() => ['Axis A']);
    act(() => { render(React.createElement(Harness)); });
    const items = [
      { complianceStatus: 'not-evaluated' },
      { complianceStatus: 'not-evaluated' },
    ];
    expect(ref.current!.getSectionProgress(items)).toBe('0/2');
  });

  it('counts evaluated items correctly', () => {
    const { Harness, ref } = makeHarness(() => ['Axis A']);
    act(() => { render(React.createElement(Harness)); });
    const items = [
      { complianceStatus: 'compliant' },
      { complianceStatus: 'not-evaluated' },
      { complianceStatus: 'non-compliant' },
    ];
    expect(ref.current!.getSectionProgress(items)).toBe('2/3');
  });

  it('returns "N/N" when all items are evaluated', () => {
    const { Harness, ref } = makeHarness(() => ['Axis A']);
    act(() => { render(React.createElement(Harness)); });
    const items = [
      { complianceStatus: 'compliant' },
      { complianceStatus: 'compliant' },
    ];
    expect(ref.current!.getSectionProgress(items)).toBe('2/2');
  });
});

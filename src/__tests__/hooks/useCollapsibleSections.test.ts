// src/__tests__/hooks/useCollapsibleSections.test.ts
//
// WHY React.Fragment INSTEAD OF View
// ─────────────────────────────────
// The react-native mock in jest.setup.ts is a strict Proxy that throws on
// any unstubbed key access. View is stubbed as the string 'View', not a
// real component constructor. Rendering the string 'View' as a React element
// causes React to silently abort the render — the Harness function body never
// executes, ref.current stays null.
// React.Fragment is a first-class React primitive that needs no native module
// and always renders safely in test environments.
//
// WHY render() IS WRAPPED IN act()
// ─────────────────────────────────
// In this version of @testing-library/react-native, render() does not
// synchronously flush the React reconciler. Wrapping in act() forces React
// to flush all pending state updates and effects before act() returns.
//
// WHY renderHook IS NOT USED
// ──────────────────────────
// jest.setup.ts documents the root cause: configure({ defaultWrapper }) was
// removed because it corrupts result.current in the installed RTLRN version.
// The corruption persists even with per-call wrapper options.

import React from 'react';
import { render, act } from '@testing-library/react-native';
import { useCollapsibleSections } from '../../hooks/useCollapsibleSections';

type HookResult = ReturnType<typeof useCollapsibleSections>;

function makeHarness(getTitles: () => string[]) {
  const ref = { current: null as HookResult | null };

  function Harness() {
    const result = useCollapsibleSections(getTitles());
    // Pure assignment during render — no side effect, safe.
    // act() ensures this runs before returning to the test.
    ref.current = result;
    // Fragment: no native module needed, always safe in jest environment.
    return React.createElement(React.Fragment, null);
  }

  return { Harness, ref };
}

// ─── initial state ────────────────────────────────────────────────────────────

describe('useCollapsibleSections — initial state', () => {
  it('all sections start expanded (collapsed=false)', () => {
    const { Harness, ref } = makeHarness(() => ['Axis A', 'Axis B']);
    act(() => { render(React.createElement(Harness)); });
    expect(ref.current).not.toBeNull();
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
    let rerender!: ReturnType<typeof render>['rerender'];
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
    let rerender!: ReturnType<typeof render>['rerender'];
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

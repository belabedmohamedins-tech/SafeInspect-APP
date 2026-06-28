// src/__tests__/hooks/useCollapsibleSections.test.ts
//
// WHY WE DO NOT USE renderHook HERE
// ──────────────────────────────────
// Every attempt to use renderHook() for this hook leaves result.current
// === undefined, regardless of whether `await` is present or absent, and
// regardless of the `wrapper` option.  The jest.setup.ts file documents
// exactly this failure mode and its root cause: configure({ defaultWrapper })
// was removed because it corrupts result.current in the installed version
// of @testing-library/react-native.  The corruption survives even when the
// wrapper is passed per-call, because the problem is in how the RTLRN
// version interacts with the jest-expo preset's React reconciler setup.
//
// SOLUTION: drive the hook through a real rendered component using `render`
// from @testing-library/react-native.  We expose the hook's return value via
// a ref attached to the component, which is updated on every render.
// This is 100% equivalent to renderHook — it exercises the same React
// lifecycle (useState, useEffect, useCallback, useRef) — with no reliance
// on the broken renderHook path.

import React, { useRef, useEffect } from 'react';
import { View } from 'react-native';
import { render, act } from '@testing-library/react-native';
import { useCollapsibleSections } from '../../hooks/useCollapsibleSections';

// ─── Harness ──────────────────────────────────────────────────────────────────
// A thin component that runs the hook and writes its return value into a ref
// that the test can read synchronously after each render / act().

type HookResult = ReturnType<typeof useCollapsibleSections>;

function makeHarness(getTitles: () => string[]) {
  const ref = { current: null as HookResult | null };

  function Harness() {
    const result = useCollapsibleSections(getTitles());
    // Write into ref on every render so tests always see the latest value.
    // useEffect fires after render, but we need the value synchronously in
    // act() — assign directly during render (safe: no side effects, pure write).
    ref.current = result;
    return React.createElement(View, null);
  }

  return { Harness, ref };
}

// ─── initial state ────────────────────────────────────────────────────────────

describe('useCollapsibleSections \u2014 initial state', () => {
  it('all sections start expanded (collapsed=false)', () => {
    const { Harness, ref } = makeHarness(() => ['Axis A', 'Axis B']);
    render(React.createElement(Harness));
    expect(ref.current!.collapsed['Axis A']).toBe(false);
    expect(ref.current!.collapsed['Axis B']).toBe(false);
  });

  it('isCollapsed() returns false for every section on init', () => {
    const { Harness, ref } = makeHarness(() => ['S1', 'S2', 'S3']);
    render(React.createElement(Harness));
    expect(ref.current!.isCollapsed('S1')).toBe(false);
    expect(ref.current!.isCollapsed('S2')).toBe(false);
    expect(ref.current!.isCollapsed('S3')).toBe(false);
  });

  it('isCollapsed() returns false for an unknown title (default fallback)', () => {
    const { Harness, ref } = makeHarness(() => ['Known']);
    render(React.createElement(Harness));
    expect(ref.current!.isCollapsed('Unknown')).toBe(false);
  });
});

// ─── toggleSection ────────────────────────────────────────────────────────────

describe('useCollapsibleSections \u2014 toggleSection', () => {
  it('collapses an expanded section', () => {
    const { Harness, ref } = makeHarness(() => ['Axis A']);
    render(React.createElement(Harness));
    act(() => { ref.current!.toggleSection('Axis A'); });
    expect(ref.current!.collapsed['Axis A']).toBe(true);
    expect(ref.current!.isCollapsed('Axis A')).toBe(true);
  });

  it('expands a collapsed section', () => {
    const { Harness, ref } = makeHarness(() => ['Axis A']);
    render(React.createElement(Harness));
    act(() => { ref.current!.toggleSection('Axis A'); });
    act(() => { ref.current!.toggleSection('Axis A'); });
    expect(ref.current!.collapsed['Axis A']).toBe(false);
  });

  it('toggling one section does not affect others', () => {
    const { Harness, ref } = makeHarness(() => ['S1', 'S2']);
    render(React.createElement(Harness));
    act(() => { ref.current!.toggleSection('S1'); });
    expect(ref.current!.collapsed['S1']).toBe(true);
    expect(ref.current!.collapsed['S2']).toBe(false);
  });
});

// ─── dynamic title addition (useEffect branch) ────────────────────────────────

describe('useCollapsibleSections \u2014 dynamic title addition (useEffect branch)', () => {
  it('adds a new title to collapsed map when sectionTitles prop gains a new entry', () => {
    let titles = ['Axis A'];
    const { Harness, ref } = makeHarness(() => titles);
    const { rerender } = render(React.createElement(Harness));

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
    const { rerender } = render(React.createElement(Harness));

    act(() => { ref.current!.toggleSection('Axis A'); });
    expect(ref.current!.collapsed['Axis A']).toBe(true);

    titles = ['Axis A', 'Axis C'];
    act(() => { rerender(React.createElement(Harness)); });

    expect(ref.current!.collapsed['Axis A']).toBe(true);
    expect(ref.current!.collapsed['Axis C']).toBe(false);
  });
});

// ─── getSectionProgress ───────────────────────────────────────────────────────

describe('useCollapsibleSections \u2014 getSectionProgress', () => {
  it('returns "0/N" when no items are evaluated', () => {
    const { Harness, ref } = makeHarness(() => ['Axis A']);
    render(React.createElement(Harness));
    const items = [
      { complianceStatus: 'not-evaluated' },
      { complianceStatus: 'not-evaluated' },
    ];
    expect(ref.current!.getSectionProgress(items)).toBe('0/2');
  });

  it('counts evaluated items correctly', () => {
    const { Harness, ref } = makeHarness(() => ['Axis A']);
    render(React.createElement(Harness));
    const items = [
      { complianceStatus: 'compliant' },
      { complianceStatus: 'not-evaluated' },
      { complianceStatus: 'non-compliant' },
    ];
    expect(ref.current!.getSectionProgress(items)).toBe('2/3');
  });

  it('returns "N/N" when all items are evaluated', () => {
    const { Harness, ref } = makeHarness(() => ['Axis A']);
    render(React.createElement(Harness));
    const items = [
      { complianceStatus: 'compliant' },
      { complianceStatus: 'compliant' },
    ];
    expect(ref.current!.getSectionProgress(items)).toBe('2/2');
  });
});

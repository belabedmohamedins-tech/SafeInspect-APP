// src/__tests__/hooks/useCollapsibleSections.test.ts
//
// ROOT CAUSE OF result.current === undefined (see jest.setup.ts for full history):
//   The global expo-router mock in jest.setup.ts calls `cb()` directly inside
//   useFocusEffect. This hook file does NOT use useFocusEffect — but jest.setup
//   runs for every suite. A different version of this mock existed at some point
//   that called useEffect() inside the factory, violating hook rules and causing
//   React to abort the entire render, leaving result.current undefined.
//
//   The safest fix is to re-declare the expo-router mock at Layer 4 (this file)
//   so it fully overrides the global one for this suite, guaranteeing no hook
//   violations can bleed in from the global setup.
//
// SYNC HOOK: renderHook() must NOT be awaited — this hook has no async operations.

import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { useCollapsibleSections } from '../../hooks/useCollapsibleSections';

// Layer 4 override — safe, no-op stub, no hooks called inside
jest.mock('expo-router', () => ({
  useFocusEffect:  (_cb: () => void) => { /* no-op — this hook does not use it */ },
  useNavigation:   jest.fn(() => ({ addListener: jest.fn(() => jest.fn()) })),
  useRouter:       jest.fn(() => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() })),
  useLocalSearchParams: jest.fn(() => ({})),
  Link: 'Link',
  Redirect: 'Redirect',
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}

describe('useCollapsibleSections — initial state', () => {
  it('all sections start expanded (collapsed=false)', () => {
    const { result } = renderHook(
      () => useCollapsibleSections(['Axis A', 'Axis B']),
      { wrapper: Wrapper }
    );
    expect(result.current.collapsed['Axis A']).toBe(false);
    expect(result.current.collapsed['Axis B']).toBe(false);
  });

  it('isCollapsed() returns false for every section on init', () => {
    const { result } = renderHook(
      () => useCollapsibleSections(['S1', 'S2', 'S3']),
      { wrapper: Wrapper }
    );
    expect(result.current.isCollapsed('S1')).toBe(false);
    expect(result.current.isCollapsed('S2')).toBe(false);
    expect(result.current.isCollapsed('S3')).toBe(false);
  });

  it('isCollapsed() returns false for an unknown title (default fallback)', () => {
    const { result } = renderHook(
      () => useCollapsibleSections(['Known']),
      { wrapper: Wrapper }
    );
    expect(result.current.isCollapsed('Unknown')).toBe(false);
  });
});

describe('useCollapsibleSections — toggleSection', () => {
  it('collapses an expanded section', () => {
    const { result } = renderHook(
      () => useCollapsibleSections(['Axis A']),
      { wrapper: Wrapper }
    );
    act(() => { result.current.toggleSection('Axis A'); });
    expect(result.current.collapsed['Axis A']).toBe(true);
    expect(result.current.isCollapsed('Axis A')).toBe(true);
  });

  it('expands a collapsed section', () => {
    const { result } = renderHook(
      () => useCollapsibleSections(['Axis A']),
      { wrapper: Wrapper }
    );
    act(() => { result.current.toggleSection('Axis A'); });
    act(() => { result.current.toggleSection('Axis A'); });
    expect(result.current.collapsed['Axis A']).toBe(false);
  });

  it('toggling one section does not affect others', () => {
    const { result } = renderHook(
      () => useCollapsibleSections(['S1', 'S2']),
      { wrapper: Wrapper }
    );
    act(() => { result.current.toggleSection('S1'); });
    expect(result.current.collapsed['S1']).toBe(true);
    expect(result.current.collapsed['S2']).toBe(false);
  });
});

describe('useCollapsibleSections — dynamic title addition (useEffect branch)', () => {
  it('adds a new title to collapsed map when sectionTitles prop gains a new entry', () => {
    let titles = ['Axis A'];
    const { result, rerender } = renderHook(
      () => useCollapsibleSections(titles),
      { wrapper: Wrapper }
    );
    expect(result.current.collapsed).toHaveProperty('Axis A');
    expect(result.current.collapsed).not.toHaveProperty('Axis B');

    titles = ['Axis A', 'Axis B'];
    rerender({});

    expect(result.current.collapsed).toHaveProperty('Axis B');
    expect(result.current.collapsed['Axis B']).toBe(false);
  });

  it('does not reset collapsed state of existing sections when a new one is added', () => {
    let titles = ['Axis A'];
    const { result, rerender } = renderHook(
      () => useCollapsibleSections(titles),
      { wrapper: Wrapper }
    );
    act(() => { result.current.toggleSection('Axis A'); });
    expect(result.current.collapsed['Axis A']).toBe(true);

    titles = ['Axis A', 'Axis C'];
    rerender({});

    expect(result.current.collapsed['Axis A']).toBe(true);
    expect(result.current.collapsed['Axis C']).toBe(false);
  });
});

describe('useCollapsibleSections — getSectionProgress', () => {
  it('returns "0/N" when no items are evaluated', () => {
    const { result } = renderHook(
      () => useCollapsibleSections(['Axis A']),
      { wrapper: Wrapper }
    );
    const items = [
      { complianceStatus: 'not-evaluated' },
      { complianceStatus: 'not-evaluated' },
    ];
    expect(result.current.getSectionProgress(items)).toBe('0/2');
  });

  it('counts evaluated items correctly', () => {
    const { result } = renderHook(
      () => useCollapsibleSections(['Axis A']),
      { wrapper: Wrapper }
    );
    const items = [
      { complianceStatus: 'compliant' },
      { complianceStatus: 'not-evaluated' },
      { complianceStatus: 'non-compliant' },
    ];
    expect(result.current.getSectionProgress(items)).toBe('2/3');
  });

  it('returns "N/N" when all items are evaluated', () => {
    const { result } = renderHook(
      () => useCollapsibleSections(['Axis A']),
      { wrapper: Wrapper }
    );
    const items = [
      { complianceStatus: 'compliant' },
      { complianceStatus: 'compliant' },
    ];
    expect(result.current.getSectionProgress(items)).toBe('2/2');
  });
});

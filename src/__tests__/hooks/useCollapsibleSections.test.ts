// src/__tests__/hooks/useCollapsibleSections.test.ts
import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { useCollapsibleSections } from '../../hooks/useCollapsibleSections';

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
    // Start with ['Axis A'], then change to ['Axis A', 'Axis B']
    // This exercises the useEffect branch at lines 22-23 of the source.
    let titles = ['Axis A'];
    const { result, rerender } = renderHook(
      () => useCollapsibleSections(titles),
      { wrapper: Wrapper }
    );
    expect(result.current.collapsed).toHaveProperty('Axis A');
    expect(result.current.collapsed).not.toHaveProperty('Axis B');

    titles = ['Axis A', 'Axis B'];
    rerender({});

    // After re-render the effect runs and adds the new title
    expect(result.current.collapsed).toHaveProperty('Axis B');
    expect(result.current.collapsed['Axis B']).toBe(false);
  });

  it('does not reset the collapsed state of existing sections when a new one is added', () => {
    let titles = ['Axis A'];
    const { result, rerender } = renderHook(
      () => useCollapsibleSections(titles),
      { wrapper: Wrapper }
    );
    // Collapse Axis A first
    act(() => { result.current.toggleSection('Axis A'); });
    expect(result.current.collapsed['Axis A']).toBe(true);

    // Add a new title
    titles = ['Axis A', 'Axis C'];
    rerender({});

    // Axis A must still be collapsed
    expect(result.current.collapsed['Axis A']).toBe(true);
    // New title defaults to expanded
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

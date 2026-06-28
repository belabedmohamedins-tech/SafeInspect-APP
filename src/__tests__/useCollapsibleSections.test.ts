/**
 * Unit tests for src/hooks/useCollapsibleSections.ts
 *
 * useCollapsibleSections is a pure React state hook with no native module deps.
 * We pass an explicit React.Fragment wrapper to renderHook to give RNTL v14
 * a valid host component tree (bypasses the synthetic react-native Proxy in
 * jest.setup.ts that would otherwise leave result.current undefined).
 */
import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { useCollapsibleSections } from '../hooks/useCollapsibleSections';

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);

describe('useCollapsibleSections', () => {
  it('initialises all sections as expanded (collapsed = false)', () => {
    const { result } = renderHook(
      () => useCollapsibleSections(['A', 'B', 'C']),
      { wrapper },
    );
    ['A', 'B', 'C'].forEach(s =>
      expect(result.current.collapsed[s]).toBe(false),
    );
  });

  it('toggleSection flips one section without affecting others', async () => {
    const { result } = renderHook(
      () => useCollapsibleSections(['X', 'Y']),
      { wrapper },
    );
    await act(async () => { result.current.toggleSection('X'); });
    expect(result.current.collapsed['X']).toBe(true);
    expect(result.current.collapsed['Y']).toBe(false);
  });

  it('toggleSection toggles back to expanded on second call', async () => {
    const { result } = renderHook(
      () => useCollapsibleSections(['X']),
      { wrapper },
    );
    await act(async () => { result.current.toggleSection('X'); });
    await act(async () => { result.current.toggleSection('X'); });
    expect(result.current.collapsed['X']).toBe(false);
  });

  it('isCollapsed() returns false for an expanded section', () => {
    const { result } = renderHook(
      () => useCollapsibleSections(['alpha']),
      { wrapper },
    );
    expect(result.current.isCollapsed('alpha')).toBe(false);
  });

  it('isCollapsed() returns true after toggling the section', async () => {
    const { result } = renderHook(
      () => useCollapsibleSections(['alpha']),
      { wrapper },
    );
    await act(async () => { result.current.toggleSection('alpha'); });
    expect(result.current.isCollapsed('alpha')).toBe(true);
  });

  it('isCollapsed() returns false for an unknown section key (safe default)', () => {
    const { result } = renderHook(
      () => useCollapsibleSections([]),
      { wrapper },
    );
    expect(result.current.isCollapsed('nonexistent')).toBe(false);
  });

  it('getSectionProgress returns evaluated/total ratio string', () => {
    const { result } = renderHook(
      () => useCollapsibleSections(['S1']),
      { wrapper },
    );
    const items = [
      { complianceStatus: 'compliant' },
      { complianceStatus: 'not-evaluated' },
      { complianceStatus: 'non-compliant' },
    ];
    expect(result.current.getSectionProgress(items)).toBe('2/3');
  });
});

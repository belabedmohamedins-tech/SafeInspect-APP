/**
 * Unit tests for src/hooks/useSignature.ts
 *
 * useSignature is a pure React state hook with no native module dependencies.
 * We pass an explicit React.Fragment wrapper to renderHook to give RNTL v14
 * a valid host component tree (bypasses the synthetic react-native Proxy in
 * jest.setup.ts that would otherwise leave result.current undefined).
 */
import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { useSignature } from '../hooks/useSignature';

// Pure hook — no mocks needed.

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);

describe('useSignature', () => {
  it('initialises with empty signature and collapsed panel', () => {
    const { result } = renderHook(() => useSignature(), { wrapper });
    expect(result.current.signature).toBe('');
    expect(result.current.showSignature).toBe(false);
  });

  it('setSignature stores the value', async () => {
    const { result } = renderHook(() => useSignature(), { wrapper });
    await act(async () => {
      result.current.setSignature('data:image/png;base64,abc');
    });
    expect(result.current.signature).toBe('data:image/png;base64,abc');
  });

  it('setSignature collapses the panel after storing a value', async () => {
    const { result } = renderHook(() => useSignature(), { wrapper });
    await act(async () => { result.current.setShowSignature(true); });
    await act(async () => { result.current.setSignature('sig-data'); });
    expect(result.current.showSignature).toBe(false);
  });

  it('clearSignature resets the value to empty string', async () => {
    const { result } = renderHook(() => useSignature(), { wrapper });
    await act(async () => { result.current.setSignature('some-sig'); });
    await act(async () => { result.current.clearSignature(); });
    expect(result.current.signature).toBe('');
  });

  it('setShowSignature toggles the panel flag independently', async () => {
    const { result } = renderHook(() => useSignature(), { wrapper });
    await act(async () => { result.current.setShowSignature(true); });
    expect(result.current.showSignature).toBe(true);
    await act(async () => { result.current.setShowSignature(false); });
    expect(result.current.showSignature).toBe(false);
  });

  it('handleSignature is an alias for setSignature', async () => {
    const { result } = renderHook(() => useSignature(), { wrapper });
    await act(async () => { result.current.handleSignature('alias-test'); });
    expect(result.current.signature).toBe('alias-test');
  });
});

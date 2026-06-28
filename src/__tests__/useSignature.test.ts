/**
 * Unit tests for src/hooks/useSignature.ts
 */
import { act, renderHook } from '@testing-library/react-native';
import React from 'react';
import { useSignature } from '../hooks/useSignature';

// A plain function component wrapper satisfies @testing-library/react-native's
// renderHook requirement (React.Fragment as a wrapper is not a valid component
// in some versions and results in result.current being undefined).
function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}

describe('useSignature', () => {
  it('initialises with empty signature', () => {
    const { result } = renderHook(() => useSignature(), { wrapper });
    expect(result.current.signature).toBe('');
  });

  it('setSignature updates the signature value', async () => {
    const { result } = renderHook(() => useSignature(), { wrapper });
    await act(async () => { result.current.setSignature('data:image/png;base64,abc'); });
    expect(result.current.signature).toBe('data:image/png;base64,abc');
  });

  it('clearSignature resets signature to empty string', async () => {
    const { result } = renderHook(() => useSignature(), { wrapper });
    await act(async () => { result.current.setSignature('some-sig'); });
    await act(async () => { result.current.clearSignature(); });
    expect(result.current.signature).toBe('');
  });
});

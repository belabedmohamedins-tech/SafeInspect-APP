/**
 * Unit tests for src/hooks/useSignature.ts
 */
import { act, renderHook } from '@testing-library/react-native';
import { useSignature } from '../hooks/useSignature';

describe('useSignature', () => {
  it('initialises with empty signature', () => {
    const { result } = renderHook(() => useSignature());
    expect(result.current.signature).toBe('');
  });

  it('setSignature updates the signature value', () => {
    const { result } = renderHook(() => useSignature());
    act(() => { result.current.setSignature('data:image/png;base64,abc'); });
    expect(result.current.signature).toBe('data:image/png;base64,abc');
  });

  it('clearSignature resets signature to empty string', () => {
    const { result } = renderHook(() => useSignature());
    act(() => { result.current.setSignature('some-sig'); });
    act(() => { result.current.clearSignature(); });
    expect(result.current.signature).toBe('');
  });
});

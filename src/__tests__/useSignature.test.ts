/**
 * Unit tests for src/hooks/useSignature.ts
 */
import { act, renderHook } from '@testing-library/react-native';
import { useSignature } from '../hooks/useSignature';

describe('useSignature', () => {
  it('starts with showSignature=false and signature=undefined', () => {
    const { result } = renderHook(() => useSignature());
    expect(result.current.showSignature).toBe(false);
    expect(result.current.signature).toBeUndefined();
  });

  it('setShowSignature(true) opens the modal', () => {
    const { result } = renderHook(() => useSignature());
    act(() => result.current.setShowSignature(true));
    expect(result.current.showSignature).toBe(true);
  });

  it('handleSignature stores the provided signature string', () => {
    const { result } = renderHook(() => useSignature());
    act(() => result.current.handleSignature('data:image/png;base64,abc123'));
    expect(result.current.signature).toBe('data:image/png;base64,abc123');
  });

  it('handleSignature closes the modal', () => {
    const { result } = renderHook(() => useSignature());
    act(() => result.current.setShowSignature(true));
    act(() => result.current.handleSignature('sig'));
    expect(result.current.showSignature).toBe(false);
  });

  it('calling handleSignature twice overwrites the previous value', () => {
    const { result } = renderHook(() => useSignature());
    act(() => result.current.handleSignature('first'));
    act(() => result.current.handleSignature('second'));
    expect(result.current.signature).toBe('second');
  });
});

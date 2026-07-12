// __tests__/hooks/useSignature.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useSignature } from '../../src/hooks/useSignature';

describe('useSignature', () => {
  it('initialises with empty signature and showSignature=false', () => {
    const { result } = renderHook(() => useSignature());
    expect(result.current.signature).toBe('');
    expect(result.current.showSignature).toBe(false);
  });

  it('setShowSignature opens the signature pad', () => {
    const { result } = renderHook(() => useSignature());
    act(() => { result.current.setShowSignature(true); });
    expect(result.current.showSignature).toBe(true);
  });

  it('setSignature stores the sig and closes the pad', () => {
    const { result } = renderHook(() => useSignature());
    act(() => { result.current.setShowSignature(true); });
    act(() => { result.current.setSignature('data:image/png;base64,abc'); });
    expect(result.current.signature).toBe('data:image/png;base64,abc');
    expect(result.current.showSignature).toBe(false);
  });

  it('handleSignature is an alias for setSignature', () => {
    const { result } = renderHook(() => useSignature());
    act(() => { result.current.handleSignature('sig123'); });
    expect(result.current.signature).toBe('sig123');
    expect(result.current.showSignature).toBe(false);
  });

  it('clearSignature resets signature to empty string', () => {
    const { result } = renderHook(() => useSignature());
    act(() => { result.current.setSignature('sig123'); });
    act(() => { result.current.clearSignature(); });
    expect(result.current.signature).toBe('');
  });
});

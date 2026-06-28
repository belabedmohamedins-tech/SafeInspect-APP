/**
 * Unit tests for src/hooks/useSignature.ts
 */
import { act, renderHook } from '@testing-library/react-native';
import { useSignature } from '../hooks/useSignature';

// useSignature is a pure-logic hook — no context, no providers needed.
describe('useSignature', () => {
  it('initialises with empty signature', () => {
    const { result } = renderHook(() => useSignature());
    expect(result.current.signature).toBe('');
  });

  it('setSignature updates the signature value', async () => {
    const { result } = renderHook(() => useSignature());
    await act(async () => { result.current.setSignature('data:image/png;base64,abc'); });
    expect(result.current.signature).toBe('data:image/png;base64,abc');
  });

  it('clearSignature resets signature to empty string', async () => {
    const { result } = renderHook(() => useSignature());
    await act(async () => { result.current.setSignature('some-sig'); });
    await act(async () => { result.current.clearSignature(); });
    expect(result.current.signature).toBe('');
  });
});

// src/hooks/useSignature.ts
import { useCallback, useState } from 'react';

export function useSignature() {
  const [showSignature, setShowSignature] = useState(false);
  const [signature, setSignatureState] = useState<string>('');

  const setSignature = useCallback((sig: string) => {
    setSignatureState(sig);
    setShowSignature(false);
  }, []);

  const clearSignature = useCallback(() => {
    setSignatureState('');
  }, []);

  // handleSignature kept as alias for backward compatibility
  const handleSignature = setSignature;

  return {
    showSignature,
    setShowSignature,
    signature,
    setSignature,
    clearSignature,
    handleSignature,
  };
}

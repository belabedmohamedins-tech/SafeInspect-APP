// src/hooks/useSignature.ts
import { useCallback, useState } from 'react';

export function useSignature() {
  const [showSignature, setShowSignature] = useState(false);
  const [signature, setSignature] = useState<string | undefined>();

  const handleSignature = useCallback((sig: string) => {
    setSignature(sig);
    setShowSignature(false);
  }, []);

  return {
    showSignature,
    setShowSignature,
    signature,
    handleSignature,
  };
}
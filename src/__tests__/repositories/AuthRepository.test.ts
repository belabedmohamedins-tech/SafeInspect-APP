// src/__tests__/repositories/AuthRepository.test.ts
// Auth repository tests — mock expo-local-authentication

jest.mock('expo-local-authentication', () => ({
  authenticateAsync: jest.fn(),
  hasHardwareAsync: jest.fn().mockResolvedValue(true),
  isEnrolledAsync:  jest.fn().mockResolvedValue(true),
  LocalAuthenticationError: { USER_CANCEL: 'user_cancel' },
}));

import * as LA from 'expo-local-authentication';
const mockAuthenticate = LA.authenticateAsync as jest.Mock;

describe('AuthRepository - biometric', () => {
  it('returns success=true when biometric succeeds', async () => {
    mockAuthenticate.mockResolvedValueOnce({ success: true });
    const result = await LA.authenticateAsync();
    expect(result.success).toBe(true);
  });

  it('handles failure with error field', async () => {
    mockAuthenticate.mockResolvedValueOnce({
      success: false,
      error: 'user_cancel' as LA.LocalAuthenticationError,
    });
    const result = await LA.authenticateAsync();
    expect(result.success).toBe(false);
  });
});

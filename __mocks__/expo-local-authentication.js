// __mocks__/expo-local-authentication.js
// Layer-2 global mock for expo-local-authentication.
// Defaults to: hardware present, enrolled, fingerprint, auth succeeds.
// Individual tests can override via mockResolvedValue / mockResolvedValueOnce.

const AuthenticationType = {
  FINGERPRINT:         2,
  FACIAL_RECOGNITION:  1,
  IRIS:                3,
};

const hasHardwareAsync                  = jest.fn().mockResolvedValue(true);
const isEnrolledAsync                   = jest.fn().mockResolvedValue(true);
const supportedAuthenticationTypesAsync = jest.fn().mockResolvedValue([AuthenticationType.FINGERPRINT]);
const authenticateAsync                 = jest.fn().mockResolvedValue({ success: true });

module.exports = {
  AuthenticationType,
  hasHardwareAsync,
  isEnrolledAsync,
  supportedAuthenticationTypesAsync,
  authenticateAsync,
};

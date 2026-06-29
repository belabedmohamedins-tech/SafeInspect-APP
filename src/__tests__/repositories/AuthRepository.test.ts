// src/__tests__/repositories/AuthRepository.test.ts
//
// Web-branch strategy:
//   AuthRepository exports `_platformOS` (a plain string let). The web
//   describe block sets it to 'web' in beforeEach and restores it in
//   afterEach. No module tricks, no Proxy fights.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuth from 'expo-local-authentication';
import { AuthRepository, _platformOS as _po } from '../../repositories/AuthRepository';
import * as AuthModule from '../../repositories/AuthRepository';

const mockHasHardware    = jest.mocked(LocalAuth.hasHardwareAsync);
const mockIsEnrolled     = jest.mocked(LocalAuth.isEnrolledAsync);
const mockSupportedTypes = jest.mocked(LocalAuth.supportedAuthenticationTypesAsync);
const mockAuthenticate   = jest.mocked(LocalAuth.authenticateAsync);

const { __resetStore: resetSecure } = SecureStore as any;
const { __resetStore: resetAsync }  = AsyncStorage as any;

beforeEach(() => {
  resetAsync();
  resetSecure();
  jest.clearAllMocks();
});

// ─── Native-platform tests ────────────────────────────────────────────────
describe('AuthRepository', () => {
  describe('PIN management', () => {
    it('returns null when no PIN is set', async () => {
      expect(await AuthRepository.getPin()).toBeNull();
    });
    it('stores and retrieves a PIN', async () => {
      await AuthRepository.setPin('1234');
      expect(await AuthRepository.getPin()).toBe('1234');
    });
    it('deletes the PIN when setPin(null) is called', async () => {
      await AuthRepository.setPin('1234');
      await AuthRepository.setPin(null);
      expect(await AuthRepository.getPin()).toBeNull();
    });
    it('resets failed attempts when PIN is set', async () => {
      await AuthRepository.incrementFailedAttempts();
      await AuthRepository.setPin('5678');
      expect(await AuthRepository.getFailedAttempts()).toBe(0);
    });
  });

  describe('failed attempts / lockout', () => {
    it('returns 0 failed attempts initially', async () => {
      expect(await AuthRepository.getFailedAttempts()).toBe(0);
    });
    it('increments failed attempts and returns the new count', async () => {
      const count = await AuthRepository.incrementFailedAttempts();
      expect(count).toBe(1);
      expect(await AuthRepository.getFailedAttempts()).toBe(1);
    });
    it('is not locked out below MAX_ATTEMPTS', async () => {
      for (let i = 0; i < AuthRepository.MAX_ATTEMPTS - 1; i++) {
        await AuthRepository.incrementFailedAttempts();
      }
      expect(await AuthRepository.isLockedOut()).toBe(false);
    });
    it('is locked out at MAX_ATTEMPTS', async () => {
      for (let i = 0; i < AuthRepository.MAX_ATTEMPTS; i++) {
        await AuthRepository.incrementFailedAttempts();
      }
      expect(await AuthRepository.isLockedOut()).toBe(true);
    });
    it('resets failed attempts to 0', async () => {
      await AuthRepository.incrementFailedAttempts();
      await AuthRepository.resetFailedAttempts();
      expect(await AuthRepository.getFailedAttempts()).toBe(0);
    });
  });

  describe('biometric availability', () => {
    it('returns true when hardware is present and enrolled', async () => {
      expect(await AuthRepository.isBiometricAvailable()).toBe(true);
    });
    it('returns false when no hardware is present', async () => {
      mockHasHardware.mockResolvedValueOnce(false);
      expect(await AuthRepository.isBiometricAvailable()).toBe(false);
    });
    it('returns false when hardware present but not enrolled', async () => {
      mockIsEnrolled.mockResolvedValueOnce(false);
      expect(await AuthRepository.isBiometricAvailable()).toBe(false);
    });
  });

  describe('getBiometricType', () => {
    it('returns FINGERPRINT when fingerprint is available', async () => {
      mockSupportedTypes.mockResolvedValueOnce([2]);
      expect(await AuthRepository.getBiometricType()).toBe('FINGERPRINT');
    });
    it('returns FACE_RECOGNITION when facial auth is available', async () => {
      mockSupportedTypes.mockResolvedValueOnce([1]);
      expect(await AuthRepository.getBiometricType()).toBe('FACE_RECOGNITION');
    });
    it('returns IRIS when iris auth is available', async () => {
      mockSupportedTypes.mockResolvedValueOnce([3]);
      expect(await AuthRepository.getBiometricType()).toBe('IRIS');
    });
    it('returns none when no biometric type is supported', async () => {
      mockSupportedTypes.mockResolvedValueOnce([]);
      expect(await AuthRepository.getBiometricType()).toBe('none');
    });
  });

  describe('biometric user preference', () => {
    it('returns false when biometric has not been enabled', async () => {
      expect(await AuthRepository.isBiometricEnabled()).toBe(false);
    });
    it('persists the biometric enabled preference', async () => {
      await AuthRepository.setBiometricEnabled(true);
      expect(await AuthRepository.isBiometricEnabled()).toBe(true);
    });
    it('can disable biometric preference', async () => {
      await AuthRepository.setBiometricEnabled(true);
      await AuthRepository.setBiometricEnabled(false);
      expect(await AuthRepository.isBiometricEnabled()).toBe(false);
    });
  });

  describe('authenticateWithBiometric', () => {
    it('returns true on successful biometric authentication', async () => {
      mockAuthenticate.mockResolvedValueOnce({ success: true });
      expect(await AuthRepository.authenticateWithBiometric()).toBe(true);
    });
    it('returns false when user cancels', async () => {
      mockAuthenticate.mockResolvedValueOnce({ success: false });
      expect(await AuthRepository.authenticateWithBiometric()).toBe(false);
    });
    it('returns false when authenticateAsync throws', async () => {
      mockAuthenticate.mockRejectedValueOnce(new Error('biometric error'));
      expect(await AuthRepository.authenticateWithBiometric()).toBe(false);
    });
  });
});

// ─── Web-platform branches ───────────────────────────────────────────────
// Set AuthModule._platformOS = 'web' directly — it is a plain exported `let`,
// not a Proxy property. isNative() reads it on every call, so the web branch
// is active for the duration of these tests.
describe('AuthRepository — web platform (isNative = false)', () => {
  beforeEach(() => {
    AuthModule._platformOS = 'web';
    resetAsync();
    resetSecure();
    jest.clearAllMocks();
  });

  afterEach(() => {
    AuthModule._platformOS = 'android';
  });

  it('reads and writes PIN via AsyncStorage (not SecureStore) on web', async () => {
    await AuthRepository.setPin('9999');
    expect(await AuthRepository.getPin()).toBe('9999');
  });

  it('deletes PIN via AsyncStorage on web', async () => {
    await AuthRepository.setPin('9999');
    await AuthRepository.setPin(null);
    expect(await AuthRepository.getPin()).toBeNull();
  });

  it('persists biometric preference via AsyncStorage on web', async () => {
    await AuthRepository.setBiometricEnabled(true);
    expect(await AuthRepository.isBiometricEnabled()).toBe(true);
  });

  it('isBiometricAvailable returns false on web without calling LocalAuth', async () => {
    expect(await AuthRepository.isBiometricAvailable()).toBe(false);
    expect(mockHasHardware).not.toHaveBeenCalled();
  });

  it('getBiometricType returns "none" on web without calling LocalAuth', async () => {
    expect(await AuthRepository.getBiometricType()).toBe('none');
    expect(mockSupportedTypes).not.toHaveBeenCalled();
  });

  it('authenticateWithBiometric returns false on web without calling LocalAuth', async () => {
    expect(await AuthRepository.authenticateWithBiometric()).toBe(false);
    expect(mockAuthenticate).not.toHaveBeenCalled();
  });
});

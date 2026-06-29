// src/__tests__/repositories/AuthRepository.test.ts
//
// Web-branch strategy:
//   AuthRepository exports `isNative` (Platform.OS !== 'web') as a named const
//   frozen at require() time.  To test the web branch we use jest.isolateModules()
//   inside beforeAll — which runs at execution time, after all setup files — to
//   get a fresh copy of the module with Platform.OS temporarily set to 'web'.
//
//   CRITICAL: do NOT call jest.resetModules() before isolateModules().  That
//   wipes the mock registry so the isolated AuthRepository gets a raw
//   (non-mock) AsyncStorage whose setItem/getItem are no-ops, causing getPin()
//   to return null.
//
//   Instead, we only re-require AuthRepository.  Platform, AsyncStorage,
//   SecureStore and LocalAuth stay in the registry as the correct mocks.

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuth from 'expo-local-authentication';
import { AuthRepository } from '../../repositories/AuthRepository';

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

// ─── Native-platform tests ───────────────────────────────────────────────────
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

// ─── Web-platform branches ───────────────────────────────────────────────────
// We get a fresh AuthRepository whose isNative = false by temporarily
// patching Platform.OS before the isolated require().
// The PLATFORM object in jest.setup.ts is a plain object (not a Proxy —
// the Proxy wraps the rnStubs map for the 'react-native' module, but
// 'react-native/Libraries/Utilities/Platform' is mapped directly to PLATFORM).
// Writing to PLATFORM.OS is therefore a plain property assignment and
// is immediately visible to the next require() of AuthRepository.
describe('AuthRepository — web platform (isNative = false)', () => {
  let WebAuth: typeof AuthRepository;

  beforeAll(done => {
    jest.isolateModules(() => {
      (Platform as any).OS = 'web';
      WebAuth = require('../../repositories/AuthRepository').AuthRepository;
      (Platform as any).OS = 'android';
      done();
    });
  });

  afterEach(() => {
    resetAsync();
    resetSecure();
  });

  afterAll(() => {
    (Platform as any).OS = 'android';
  });

  it('reads and writes PIN via AsyncStorage (not SecureStore) on web', async () => {
    await WebAuth.setPin('9999');
    expect(await WebAuth.getPin()).toBe('9999');
  });

  it('deletes PIN via AsyncStorage on web', async () => {
    await WebAuth.setPin('9999');
    await WebAuth.setPin(null);
    expect(await WebAuth.getPin()).toBeNull();
  });

  it('persists biometric preference via AsyncStorage on web', async () => {
    await WebAuth.setBiometricEnabled(true);
    expect(await WebAuth.isBiometricEnabled()).toBe(true);
  });

  it('isBiometricAvailable returns false on web without calling LocalAuth', async () => {
    expect(await WebAuth.isBiometricAvailable()).toBe(false);
    expect(mockHasHardware).not.toHaveBeenCalled();
  });

  it('getBiometricType returns "none" on web without calling LocalAuth', async () => {
    expect(await WebAuth.getBiometricType()).toBe('none');
    expect(mockSupportedTypes).not.toHaveBeenCalled();
  });

  it('authenticateWithBiometric returns false on web without calling LocalAuth', async () => {
    expect(await WebAuth.authenticateWithBiometric()).toBe(false);
    expect(mockAuthenticate).not.toHaveBeenCalled();
  });
});

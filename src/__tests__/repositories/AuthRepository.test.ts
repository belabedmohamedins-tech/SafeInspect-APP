// src/__tests__/repositories/AuthRepository.test.ts
//
// TWO PLATFORM CONTEXTS
// ─────────────────────────────────────────────────────────────────────────────
// isNative = Platform.OS !== 'web' is evaluated ONCE at module-load time.
// This means we cannot change Platform.OS mid-test and expect different
// behaviour from an already-imported module.
//
// Solution: use jest.isolateModules() to load a fresh copy of AuthRepository
// inside a describe block where Platform.OS has been set to 'web' before the
// require() call. The original import at the top of this file (Platform.OS =
// 'ios') covers the native path; the isolated require covers the web path.
//
// expo-secure-store and expo-local-authentication are mapped at Layer 2
// (moduleNameMapper) to __mocks__/ files whose jest.fn() stubs use
// mockImplementation — those implementations survive jest.clearAllMocks().

import { Platform } from 'react-native';
(Platform as any).OS = 'ios';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuth from 'expo-local-authentication';
import { AuthRepository } from '../../repositories/AuthRepository';

// ─── Typed stub references ────────────────────────────────────────────────────
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

// ─── Native-platform (ios) tests ─────────────────────────────────────────────
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

// ─── Web-platform branches (lines 32-44, 94, 106, 135) ───────────────────────
// isNative is captured once at module load. Use jest.isolateModules() to
// load a fresh AuthRepository with Platform.OS = 'web' already set.
// Covers: secureGet/secureSet/secureDelete → AsyncStorage fallback paths,
// and the three early-return false guards in isBiometricAvailable,
// getBiometricType, and authenticateWithBiometric.
describe('AuthRepository — web platform (isNative = false)', () => {
  let WebAuth: typeof AuthRepository;

  beforeAll(() => {
    jest.isolateModules(() => {
      const { Platform } = require('react-native');
      Platform.OS = 'web';
      WebAuth = require('../../repositories/AuthRepository').AuthRepository;
    });
  });

  afterAll(() => {
    // Restore ios so subsequent test files are not affected
    const { Platform } = require('react-native');
    Platform.OS = 'ios';
  });

  beforeEach(() => {
    resetAsync();
    resetSecure();
    jest.clearAllMocks();
  });

  // lines 32-44: secureGet/Set/Delete fall back to AsyncStorage on web
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

  // line 94: isBiometricAvailable returns false on web without calling LocalAuth
  it('isBiometricAvailable returns false on web without calling LocalAuth', async () => {
    const result = await WebAuth.isBiometricAvailable();
    expect(result).toBe(false);
    expect(mockHasHardware).not.toHaveBeenCalled();
  });

  // line 106: getBiometricType returns 'none' on web without calling LocalAuth
  it('getBiometricType returns "none" on web without calling LocalAuth', async () => {
    const result = await WebAuth.getBiometricType();
    expect(result).toBe('none');
    expect(mockSupportedTypes).not.toHaveBeenCalled();
  });

  // line 135: authenticateWithBiometric returns false on web without calling LocalAuth
  it('authenticateWithBiometric returns false on web without calling LocalAuth', async () => {
    const result = await WebAuth.authenticateWithBiometric();
    expect(result).toBe(false);
    expect(mockAuthenticate).not.toHaveBeenCalled();
  });
});

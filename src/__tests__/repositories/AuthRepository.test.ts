// src/__tests__/repositories/AuthRepository.test.ts
//
// expo-secure-store and expo-local-authentication are mapped at Layer 2
// (moduleNameMapper in jest.config.js) to __mocks__/ files that expose
// real jest.fn() stubs. We retrieve typed references here at Layer 4.
//
// Platform.OS is forced to 'ios' so that the isNative branch is exercised.
// Without this, all SecureStore paths fall through to AsyncStorage and the
// biometric methods return early with false/none.

import { Platform } from 'react-native';
(Platform as any).OS = 'ios'; // must run before AuthRepository is imported

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuth from 'expo-local-authentication';
import { AuthRepository } from '../../repositories/AuthRepository';

// ─── Typed stub references (resolved after moduleNameMapper maps the mocks) ───
const mockSecureGet    = jest.mocked(SecureStore.getItemAsync);
const mockSecureSet    = jest.mocked(SecureStore.setItemAsync);
const mockSecureDelete = jest.mocked(SecureStore.deleteItemAsync);
const { __resetStore: resetSecure } = SecureStore as any;

const mockHasHardware    = jest.mocked(LocalAuth.hasHardwareAsync);
const mockIsEnrolled     = jest.mocked(LocalAuth.isEnrolledAsync);
const mockSupportedTypes = jest.mocked(LocalAuth.supportedAuthenticationTypesAsync);
const mockAuthenticate   = jest.mocked(LocalAuth.authenticateAsync);

const { __resetStore: resetAsync } = AsyncStorage as any;

beforeEach(() => {
  resetAsync();
  resetSecure();
  jest.clearAllMocks();
  // Restore default implementations after clearAllMocks wipes them
  mockHasHardware.mockResolvedValue(true);
  mockIsEnrolled.mockResolvedValue(true);
  mockSupportedTypes.mockResolvedValue([2]); // FINGERPRINT
  mockAuthenticate.mockResolvedValue({ success: true });
  // SecureStore stubs reconstruct in-memory operations from the now-cleared map
  mockSecureGet.mockImplementation((key: string) =>
    Promise.resolve((SecureStore as any).__store?.get(key) ?? null)
  );
});

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
      mockHasHardware.mockResolvedValue(false);
      expect(await AuthRepository.isBiometricAvailable()).toBe(false);
    });

    it('returns false when hardware present but not enrolled', async () => {
      mockIsEnrolled.mockResolvedValue(false);
      expect(await AuthRepository.isBiometricAvailable()).toBe(false);
    });
  });

  describe('getBiometricType', () => {
    it('returns FINGERPRINT when fingerprint is available', async () => {
      mockSupportedTypes.mockResolvedValue([2]);
      expect(await AuthRepository.getBiometricType()).toBe('FINGERPRINT');
    });

    it('returns FACE_RECOGNITION when facial auth is available', async () => {
      mockSupportedTypes.mockResolvedValue([1]);
      expect(await AuthRepository.getBiometricType()).toBe('FACE_RECOGNITION');
    });

    it('returns IRIS when iris auth is available', async () => {
      mockSupportedTypes.mockResolvedValue([3]);
      expect(await AuthRepository.getBiometricType()).toBe('IRIS');
    });

    it('returns none when no biometric type is supported', async () => {
      mockSupportedTypes.mockResolvedValue([]);
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
      mockAuthenticate.mockResolvedValue({ success: true });
      expect(await AuthRepository.authenticateWithBiometric()).toBe(true);
    });

    it('returns false when user cancels', async () => {
      mockAuthenticate.mockResolvedValue({ success: false });
      expect(await AuthRepository.authenticateWithBiometric()).toBe(false);
    });

    it('returns false when authenticateAsync throws', async () => {
      mockAuthenticate.mockRejectedValue(new Error('biometric error'));
      expect(await AuthRepository.authenticateWithBiometric()).toBe(false);
    });
  });
});

// src/__tests__/repositories/AuthRepository.test.ts
//
// AuthRepository uses expo-secure-store on native and AsyncStorage on web.
// The jest-expo preset maps Platform.OS to 'ios' by default, so isNative=true.
// expo-secure-store is mocked via expo-modules-core (Layer 2).
// We override it here at Layer 4 with simple in-memory stubs.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthRepository } from '../../repositories/AuthRepository';

// ─── Mocks ──────────────────────────────────────────────────────────────────
// expo-secure-store: in-memory Map, same interface as AsyncStorage but sync-style
const secureStore = new Map<string, string>();
const mockSecureGet    = jest.fn((key: string) => Promise.resolve(secureStore.get(key) ?? null));
const mockSecureSet    = jest.fn((key: string, value: string) => { secureStore.set(key, value); return Promise.resolve(); });
const mockSecureDelete = jest.fn((key: string) => { secureStore.delete(key); return Promise.resolve(); });

jest.mock('expo-secure-store', () => ({
  getItemAsync:    mockSecureGet,
  setItemAsync:    mockSecureSet,
  deleteItemAsync: mockSecureDelete,
  WHEN_UNLOCKED: 'WHEN_UNLOCKED',
}));

// expo-local-authentication: default to hardware present + enrolled + success
const mockHasHardware  = jest.fn().mockResolvedValue(true);
const mockIsEnrolled   = jest.fn().mockResolvedValue(true);
const mockSupportedTypes = jest.fn().mockResolvedValue([2]); // 2 = FINGERPRINT
const mockAuthenticate = jest.fn().mockResolvedValue({ success: true });

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync:                  mockHasHardware,
  isEnrolledAsync:                   mockIsEnrolled,
  supportedAuthenticationTypesAsync: mockSupportedTypes,
  authenticateAsync:                 mockAuthenticate,
  AuthenticationType: {
    FINGERPRINT:         2,
    FACIAL_RECOGNITION:  1,
    IRIS:                3,
  },
}));

const { __resetStore } = AsyncStorage as any;
beforeEach(() => {
  __resetStore();
  secureStore.clear();
  jest.clearAllMocks();
  // Restore default mock implementations after clearAllMocks()
  mockSecureGet.mockImplementation((key: string) => Promise.resolve(secureStore.get(key) ?? null));
  mockSecureSet.mockImplementation((key: string, value: string) => { secureStore.set(key, value); return Promise.resolve(); });
  mockSecureDelete.mockImplementation((key: string) => { secureStore.delete(key); return Promise.resolve(); });
  mockHasHardware.mockResolvedValue(true);
  mockIsEnrolled.mockResolvedValue(true);
  mockSupportedTypes.mockResolvedValue([2]);
  mockAuthenticate.mockResolvedValue({ success: true });
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
      const result = await AuthRepository.incrementFailedAttempts();
      expect(result).toBe(1);
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
      mockSupportedTypes.mockResolvedValue([2]); // FINGERPRINT
      expect(await AuthRepository.getBiometricType()).toBe('FINGERPRINT');
    });

    it('returns FACE_RECOGNITION when facial auth is available', async () => {
      mockSupportedTypes.mockResolvedValue([1]); // FACIAL_RECOGNITION
      expect(await AuthRepository.getBiometricType()).toBe('FACE_RECOGNITION');
    });

    it('returns IRIS when iris auth is available', async () => {
      mockSupportedTypes.mockResolvedValue([3]); // IRIS
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

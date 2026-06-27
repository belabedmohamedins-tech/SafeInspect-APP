// src/repositories/AuthRepository.ts
//
// Sole owner of all authentication state:
//   • APP_PIN            → expo-secure-store (keychain / Keystore)
//   • BIOMETRIC_ENABLED  → expo-secure-store (boolean preference)
//   • PIN_FAILED_ATTEMPTS→ AsyncStorage (non-sensitive counter)
//
// Biometric flow (Q4-T3):
//   1. isBiometricAvailable() — hardware present + enrolled
//   2. isBiometricEnabled()   — user opted in from Settings
//   3. authenticateWithBiometric() — calls LocalAuthentication.authenticateAsync
//   4. On success → navigate to home (no PIN needed)
//   5. On failure / cancel → fall back to PIN pad

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuth from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { StorageKeys } from './keys';

const MAX_ATTEMPTS = 5;

const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED,
};

// ─── Low-level secure helpers ───────────────────────────────────────

const isNative = Platform.OS !== 'web';

async function secureGet(key: string): Promise<string | null> {
  return isNative
    ? SecureStore.getItemAsync(key, SECURE_OPTIONS)
    : AsyncStorage.getItem(key);
}

async function secureSet(key: string, value: string): Promise<void> {
  return isNative
    ? SecureStore.setItemAsync(key, value, SECURE_OPTIONS)
    : AsyncStorage.setItem(key, value);
}

async function secureDelete(key: string): Promise<void> {
  return isNative
    ? SecureStore.deleteItemAsync(key, SECURE_OPTIONS)
    : AsyncStorage.removeItem(key);
}

// ─── Repository ─────────────────────────────────────────────────────────

export const AuthRepository = {

  // ── PIN ─────────────────────────────────────────────────────────

  getPin: (): Promise<string | null> => secureGet(StorageKeys.APP_PIN),

  setPin: async (pin: string | null): Promise<void> => {
    if (pin === null) {
      await secureDelete(StorageKeys.APP_PIN);
    } else {
      await secureSet(StorageKeys.APP_PIN, pin);
    }
    await AsyncStorage.removeItem(StorageKeys.PIN_FAILED_ATTEMPTS);
  },

  getFailedAttempts: async (): Promise<number> => {
    const val = await AsyncStorage.getItem(StorageKeys.PIN_FAILED_ATTEMPTS);
    return val ? parseInt(val, 10) : 0;
  },

  incrementFailedAttempts: async (): Promise<number> => {
    const current = await AuthRepository.getFailedAttempts();
    const next = current + 1;
    await AsyncStorage.setItem(StorageKeys.PIN_FAILED_ATTEMPTS, String(next));
    return next;
  },

  resetFailedAttempts: (): Promise<void> =>
    AsyncStorage.removeItem(StorageKeys.PIN_FAILED_ATTEMPTS).then(() => {}),

  isLockedOut: async (): Promise<boolean> => {
    const attempts = await AuthRepository.getFailedAttempts();
    return attempts >= MAX_ATTEMPTS;
  },

  // ── Biometrics ────────────────────────────────────────────────

  /**
   * True when the device has biometric hardware AND the user
   * has enrolled at least one biometric (face / fingerprint).
   * Always false on Web.
   */
  isBiometricAvailable: async (): Promise<boolean> => {
    if (!isNative) return false;
    const compatible = await LocalAuth.hasHardwareAsync();
    if (!compatible) return false;
    const enrolled = await LocalAuth.isEnrolledAsync();
    return enrolled;
  },

  /**
   * Returns the best available biometric type label.
   * e.g. 'FACE_RECOGNITION' | 'FINGERPRINT' | 'IRIS' | 'none'
   */
  getBiometricType: async (): Promise<string> => {
    if (!isNative) return 'none';
    const types = await LocalAuth.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuth.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'FACE_RECOGNITION';
    }
    if (types.includes(LocalAuth.AuthenticationType.FINGERPRINT)) {
      return 'FINGERPRINT';
    }
    if (types.includes(LocalAuth.AuthenticationType.IRIS)) {
      return 'IRIS';
    }
    return 'none';
  },

  /** User preference: has the user opted-in to biometric unlock? */
  isBiometricEnabled: async (): Promise<boolean> => {
    const val = await secureGet(StorageKeys.BIOMETRIC_ENABLED);
    return val === 'true';
  },

  /** Persist user preference. */
  setBiometricEnabled: (enabled: boolean): Promise<void> =>
    secureSet(StorageKeys.BIOMETRIC_ENABLED, String(enabled)),

  /**
   * Trigger the OS biometric prompt.
   * Returns true on success, false on failure / user cancel.
   */
  authenticateWithBiometric: async (promptMessage = 'تحقق من هويتك للمتابعة'): Promise<boolean> => {
    if (!isNative) return false;
    try {
      const result = await LocalAuth.authenticateAsync({
        promptMessage,
        cancelLabel: 'إلغاء',
        disableDeviceFallback: true, // PIN fallback is our own screen
        fallbackLabel: '',
      });
      return result.success;
    } catch {
      return false;
    }
  },

  MAX_ATTEMPTS,
} as const;

// src/repositories/AuthRepository.ts
//
// Sole owner of all authentication state:
//   • APP_PIN             → expo-secure-store (keychain / Keystore)
//   • BIOMETRIC_ENABLED   → expo-secure-store (boolean preference)
//   • PIN_FAILED_ATTEMPTS → AsyncStorage (non-sensitive counter)

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuth from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { StorageKeys } from './keys';

const MAX_ATTEMPTS = 5;

const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED,
};

// Read at call time so tests can patch Platform.OS without needing
// isolateModules or module-registry tricks.
function isNative(): boolean {
  return Platform.OS !== 'web';
}

async function secureGet(key: string): Promise<string | null> {
  return isNative()
    ? SecureStore.getItemAsync(key, SECURE_OPTIONS)
    : AsyncStorage.getItem(key);
}

async function secureSet(key: string, value: string): Promise<void> {
  return isNative()
    ? SecureStore.setItemAsync(key, value, SECURE_OPTIONS)
    : AsyncStorage.setItem(key, value);
}

async function secureDelete(key: string): Promise<void> {
  return isNative()
    ? SecureStore.deleteItemAsync(key, SECURE_OPTIONS)
    : AsyncStorage.removeItem(key);
}

export const AuthRepository = {

  // ── PIN ──────────────────────────────────────────────────────────────

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

  // ── Biometrics ────────────────────────────────────────────────────────

  isBiometricAvailable: async (): Promise<boolean> => {
    if (!isNative()) return false;
    const compatible = await LocalAuth.hasHardwareAsync();
    if (!compatible) return false;
    return LocalAuth.isEnrolledAsync();
  },

  getBiometricType: async (): Promise<string> => {
    if (!isNative()) return 'none';
    const types = await LocalAuth.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuth.AuthenticationType.FACIAL_RECOGNITION)) return 'FACE_RECOGNITION';
    if (types.includes(LocalAuth.AuthenticationType.FINGERPRINT))        return 'FINGERPRINT';
    if (types.includes(LocalAuth.AuthenticationType.IRIS))               return 'IRIS';
    return 'none';
  },

  isBiometricEnabled: async (): Promise<boolean> => {
    const val = await secureGet(StorageKeys.BIOMETRIC_ENABLED);
    return val === 'true';
  },

  setBiometricEnabled: (enabled: boolean): Promise<void> =>
    secureSet(StorageKeys.BIOMETRIC_ENABLED, String(enabled)),

  authenticateWithBiometric: async (promptMessage = 'تحقق من هويتك للمتابعة'): Promise<boolean> => {
    if (!isNative()) return false;
    try {
      const result = await LocalAuth.authenticateAsync({
        promptMessage,
        cancelLabel: 'إلغاء',
        disableDeviceFallback: true,
        fallbackLabel: '',
      });
      return result.success;
    } catch {
      return false;
    }
  },

  MAX_ATTEMPTS,
} as const;

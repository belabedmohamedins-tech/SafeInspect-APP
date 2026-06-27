// src/repositories/AuthRepository.ts
//
// Sole owner of PIN storage and failed-attempt counter.
//
// Storage strategy (Q4-T2):
//   • APP_PIN  → expo-secure-store (device keychain on iOS, Android Keystore on Android)
//               → excluded from iCloud/iTunes and ADB backups
//               → accessible only when device is unlocked (WHEN_UNLOCKED)
//               → falls back to AsyncStorage on Web (secure-store unavailable)
//
//   • PIN_FAILED_ATTEMPTS → AsyncStorage (non-sensitive counter, no keychain needed)
//
// Migration note:
//   On first launch after this upgrade the old AsyncStorage PIN is silently
//   discarded. Users who already set a PIN will see the lock screen once,
//   fail authentication, and be prompted to re-set their PIN from Settings.
//   This is the correct security behaviour — do NOT auto-migrate plaintext
//   values into the keychain.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { StorageKeys } from './keys';

const MAX_ATTEMPTS = 5;

// SecureStore options: only available when device is unlocked;
// excluded from cloud and ADB backups.
const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED,
};

// ─── Helpers ──────────────────────────────────────────────────────────────
// True on iOS / Android; false on Web where SecureStore is a no-op.
const isNative = Platform.OS !== 'web';

async function secureGet(key: string): Promise<string | null> {
  if (isNative) {
    return SecureStore.getItemAsync(key, SECURE_OPTIONS);
  }
  // Web fallback — acceptable because browsers don’t have keychain access
  return AsyncStorage.getItem(key);
}

async function secureSet(key: string, value: string): Promise<void> {
  if (isNative) {
    return SecureStore.setItemAsync(key, value, SECURE_OPTIONS);
  }
  await AsyncStorage.setItem(key, value);
}

async function secureDelete(key: string): Promise<void> {
  if (isNative) {
    return SecureStore.deleteItemAsync(key, SECURE_OPTIONS);
  }
  await AsyncStorage.removeItem(key);
}

// ─── Repository ─────────────────────────────────────────────────────────

export const AuthRepository = {

  /** Returns the stored PIN, or null if none is configured. */
  getPin: async (): Promise<string | null> => {
    return secureGet(StorageKeys.APP_PIN);
  },

  /**
   * Persists a new PIN in the device keychain.
   * Pass null to remove (disable PIN lock).
   * Always resets the failed-attempt counter.
   */
  setPin: async (pin: string | null): Promise<void> => {
    if (pin === null) {
      await secureDelete(StorageKeys.APP_PIN);
    } else {
      await secureSet(StorageKeys.APP_PIN, pin);
    }
    // Reset counter whenever PIN changes
    await AsyncStorage.removeItem(StorageKeys.PIN_FAILED_ATTEMPTS);
  },

  /** Returns current failed attempt count (0 if never failed). */
  getFailedAttempts: async (): Promise<number> => {
    const val = await AsyncStorage.getItem(StorageKeys.PIN_FAILED_ATTEMPTS);
    return val ? parseInt(val, 10) : 0;
  },

  /** Increments and persists the failed counter. Returns the new count. */
  incrementFailedAttempts: async (): Promise<number> => {
    const current = await AuthRepository.getFailedAttempts();
    const next = current + 1;
    await AsyncStorage.setItem(StorageKeys.PIN_FAILED_ATTEMPTS, String(next));
    return next;
  },

  /** Clears the failed counter (call on successful login). */
  resetFailedAttempts: async (): Promise<void> => {
    await AsyncStorage.removeItem(StorageKeys.PIN_FAILED_ATTEMPTS);
  },

  /** True when failed attempts ≥ MAX_ATTEMPTS. */
  isLockedOut: async (): Promise<boolean> => {
    const attempts = await AuthRepository.getFailedAttempts();
    return attempts >= MAX_ATTEMPTS;
  },

  MAX_ATTEMPTS,
} as const;

// src/repositories/AuthRepository.ts
//
// Sole owner of PIN storage and failed-attempt counter.
// All other modules must go through this repository — never touch
// StorageKeys.APP_PIN or StorageKeys.PIN_FAILED_ATTEMPTS directly.
//
// Security note: PIN is stored as a plain string in AsyncStorage for now.
// Q4-T2 will migrate this to expo-secure-store (device keychain/keystore)
// so the value is hardware-protected and excluded from iCloud/ADB backups.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from './keys';

const MAX_ATTEMPTS = 5;

export const AuthRepository = {

  /** Returns the stored PIN, or null if none is configured. */
  getPin: async (): Promise<string | null> => {
    return AsyncStorage.getItem(StorageKeys.APP_PIN);
  },

  /** Persists a new PIN. Pass null to remove (disable PIN lock). */
  setPin: async (pin: string | null): Promise<void> => {
    if (pin === null) {
      await AsyncStorage.removeItem(StorageKeys.APP_PIN);
    } else {
      await AsyncStorage.setItem(StorageKeys.APP_PIN, pin);
    }
    // Reset counter whenever PIN changes
    await AsyncStorage.removeItem(StorageKeys.PIN_FAILED_ATTEMPTS);
  },

  /** Returns current failed attempt count (0 if never failed). */
  getFailedAttempts: async (): Promise<number> => {
    const val = await AsyncStorage.getItem(StorageKeys.PIN_FAILED_ATTEMPTS);
    return val ? parseInt(val, 10) : 0;
  },

  /** Increments and persists the failed counter. Returns new count. */
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

  /** True when failed attempts >= MAX_ATTEMPTS. */
  isLockedOut: async (): Promise<boolean> => {
    const attempts = await AuthRepository.getFailedAttempts();
    return attempts >= MAX_ATTEMPTS;
  },

  MAX_ATTEMPTS,
} as const;

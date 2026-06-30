// src/services/serverAuth.ts
//
// Manages the server-side JWT session for the mobile app.
//
// Flow:
//   1. Inspector enters their ministry matricule + password once.
//   2. login() exchanges credentials for accessToken (15 min) + refreshToken (30 days).
//   3. Tokens are persisted in SecureStore (native) / AsyncStorage (web/test).
//   4. getAccessToken() transparently refreshes on expiry.
//   5. SyncService and apiClient call getAccessToken() before every API request.
//
// ⚠️  No localStorage / sessionStorage — app runs in sandboxed context.
//     Uses expo-secure-store on device, AsyncStorage fallback on web.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { StorageKeys } from '../repositories/keys';

// Computed key — defeats babel-plugin-transform-inline-environment-variables
const SYNC_API_URL_KEY = 'EXPO_PUBLIC_SYNC_API_URL';
function getApiUrl(): string {
  return ((process.env[SYNC_API_URL_KEY] ?? '').trim()) || 'http://localhost:3000';
}

const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED,
};

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

// ── JWT helpers ──────────────────────────────────────────────────────────────────

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  // Refresh 60 seconds before actual expiry
  return Date.now() / 1000 > (payload.exp as number) - 60;
}

// ── Token storage ─────────────────────────────────────────────────────────────────

export interface ServerTokens {
  accessToken:  string;
  refreshToken: string;
}

export async function saveTokens(tokens: ServerTokens): Promise<void> {
  await Promise.all([
    secureSet(StorageKeys.JWT_ACCESS_TOKEN,  tokens.accessToken),
    secureSet(StorageKeys.JWT_REFRESH_TOKEN, tokens.refreshToken),
  ]);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    secureDelete(StorageKeys.JWT_ACCESS_TOKEN),
    secureDelete(StorageKeys.JWT_REFRESH_TOKEN),
    secureDelete(StorageKeys.SERVER_USER_ID),
  ]);
}

// ── Refresh ──────────────────────────────────────────────────────────────────────

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await secureGet(StorageKeys.JWT_REFRESH_TOKEN);
  if (!refreshToken) return null;

  try {
    const res = await globalThis.fetch(`${getApiUrl()}/auth/refresh`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      await clearTokens();
      return null;
    }

    const json = await res.json() as { accessToken: string; refreshToken: string };
    await saveTokens({ accessToken: json.accessToken, refreshToken: json.refreshToken });
    return json.accessToken;
  } catch {
    return null;
  }
}

// ── Public API ───────────────────────────────────────────────────────────────────

/**
 * Returns a valid (non-expired) access token, refreshing silently if needed.
 * Returns null if no session exists or refresh fails.
 */
export async function getAccessToken(): Promise<string | null> {
  const token = await secureGet(StorageKeys.JWT_ACCESS_TOKEN);
  if (!token) return null;
  if (!isTokenExpired(token)) return token;
  return refreshAccessToken();
}

export interface LoginResult {
  ok:           boolean;
  error?:       string;
  user?: {
    id:        string;
    name:      string;
    matricule: string;
    role:      string;
    wilaya:    string | null;
  };
}

/**
 * Authenticates with the SafeInspect server using ministry matricule + password.
 * Stores tokens in SecureStore on success.
 */
export async function login(matricule: string, password: string): Promise<LoginResult> {
  try {
    const res = await globalThis.fetch(`${getApiUrl()}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ matricule, password }),
    });

    const json = await res.json() as {
      accessToken:  string;
      refreshToken: string;
      user: LoginResult['user'];
      error?: string;
    };

    if (!res.ok) {
      return { ok: false, error: json.error ?? 'Login failed' };
    }

    await saveTokens({ accessToken: json.accessToken, refreshToken: json.refreshToken });
    if (json.user?.id) {
      await secureSet(StorageKeys.SERVER_USER_ID, json.user.id);
    }

    return { ok: true, user: json.user };
  } catch (err) {
    return { ok: false, error: 'Network error — check your connection' };
  }
}

/**
 * Returns true if the user has a valid server session (refresh token present).
 * Does NOT make a network request.
 */
export async function isLoggedIn(): Promise<boolean> {
  const refreshToken = await secureGet(StorageKeys.JWT_REFRESH_TOKEN);
  return refreshToken !== null;
}

/**
 * Returns the cached server user id, or null if not logged in.
 */
export async function getServerUserId(): Promise<string | null> {
  return secureGet(StorageKeys.SERVER_USER_ID);
}

/**
 * Registers the device Expo push token with the server so the backend
 * can send push notifications directly to this device.
 * Call after login and after Notifications.getExpoPushTokenAsync().
 */
export async function registerPushToken(pushToken: string): Promise<void> {
  const accessToken = await getAccessToken();
  if (!accessToken) return;

  try {
    await globalThis.fetch(`${getApiUrl()}/notifications/register`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ pushToken }),
    });
  } catch {
    // Non-fatal — retry on next app launch
  }
}

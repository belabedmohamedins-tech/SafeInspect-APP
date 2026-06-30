// src/services/apiClient.ts
//
// Thin authenticated fetch wrapper for the SafeInspect API.
//
// Features:
//   - Automatically attaches the Bearer access token from SecureStore.
//   - On 401 response, attempts one silent token refresh then retries.
//   - Falls back gracefully if no server session exists (offline / not logged in).
//
// Usage:
//   import { apiClient } from './apiClient';
//   const res = await apiClient('/facilities');
//   const res = await apiClient('/sync/inspections', { method: 'POST', body: JSON.stringify(data) });

import { getAccessToken, refreshAccessToken } from './serverAuth';

// Computed key — defeats babel-plugin-transform-inline-environment-variables
const SYNC_API_URL_KEY = 'EXPO_PUBLIC_SYNC_API_URL';
function getApiUrl(): string {
  return ((process.env[SYNC_API_URL_KEY] ?? '').trim()) || 'http://localhost:3000';
}

/**
 * Authenticated fetch wrapper.
 * Returns the raw Response object so callers can handle status codes themselves.
 * Throws only on network errors (DNS failure, connection refused, etc.).
 */
export async function apiClient(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const url = `${getApiUrl()}${path}`;

  const buildHeaders = (token: string | null): Record<string, string> => ({
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  let token = await getAccessToken();

  const res = await globalThis.fetch(url, {
    ...init,
    headers: buildHeaders(token),
  });

  // On 401, attempt one refresh and retry
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return globalThis.fetch(url, {
        ...init,
        headers: buildHeaders(newToken),
      });
    }
  }

  return res;
}

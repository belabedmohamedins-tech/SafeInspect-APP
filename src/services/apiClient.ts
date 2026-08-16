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
//   const res = await apiClient('/facilities');            → POST ${BASE}/api/facilities
//   const res = await apiClient('/sync/inspections', …);  → POST ${BASE}/api/sync/inspections
//
// Note: callers pass paths WITHOUT the /api prefix — this wrapper adds it.
// This matches the server’s mount convention: app.use(`/api/${name}`, router).
// W61: added /api prefix, aligned getApiUrl() to throw on missing env.

import { getAccessToken, refreshAccessToken } from './serverAuth';

// Computed key — defeats babel-plugin-transform-inline-environment-variables
const SYNC_API_URL_KEY = 'EXPO_PUBLIC_SYNC_API_URL';
function getApiUrl(): string {
  const url = ((process.env[SYNC_API_URL_KEY] ?? '').trim());
  if (!url) {
    throw new Error(
      'EXPO_PUBLIC_SYNC_API_URL is not set. Configure it in your .env file before using server features.',
    );
  }
  return url;
}

/**
 * Authenticated fetch wrapper.
 * Prepends /api to every path so callers stay decoupled from the server mount convention.
 * Returns the raw Response object so callers can handle status codes themselves.
 * Throws only on network errors (DNS failure, connection refused, etc.) or missing env.
 */
export async function apiClient(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  // Normalise: ensure path starts with / then prepend /api
  const normPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${getApiUrl()}/api${normPath}`;

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

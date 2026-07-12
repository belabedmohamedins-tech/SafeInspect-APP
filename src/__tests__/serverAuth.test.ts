// src/__tests__/serverAuth.test.ts
//
// serverAuth.ts uses:
//   - expo-secure-store (L2 mock) on native (Platform.OS !== 'web')
//   - AsyncStorage (L2 mock) on web
//   - globalThis.fetch — mocked per test
//
// jest-expo preset runs under Platform.OS = 'ios' (native path),
// so SecureStore is the active storage backend.

import * as SecureStore from 'expo-secure-store';

// Typed helpers for the L2 SecureStore mock
const mockGet    = SecureStore.getItemAsync    as jest.Mock;
const mockSet    = SecureStore.setItemAsync    as jest.Mock;
const mockDelete = SecureStore.deleteItemAsync as jest.Mock;

import {
  saveTokens,
  clearTokens,
  refreshAccessToken,
  getAccessToken,
  login,
  isLoggedIn,
  getServerUserId,
  registerPushToken,
} from '../../src/services/serverAuth';

// ── JWT helpers ──────────────────────────────────────────────────────────────

/** Build a real base64url-encoded JWT with the given exp (unix seconds). */
function makeJwt(exp: number): string {
  const payload = btoa(JSON.stringify({ sub: 'user-1', exp }));
  return `header.${payload}.sig`;
}

const VALID_TOKEN   = makeJwt(Math.floor(Date.now() / 1000) + 3600); // expires in 1h
const EXPIRED_TOKEN = makeJwt(Math.floor(Date.now() / 1000) - 120);  // expired 2 min ago

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  // Default: SecureStore returns null (nothing stored)
  mockGet.mockResolvedValue(null);
  mockSet.mockResolvedValue(undefined);
  mockDelete.mockResolvedValue(undefined);
  // Default fetch — tests override as needed
  globalThis.fetch = jest.fn();
});

// ── saveTokens ────────────────────────────────────────────────────────────────

describe('saveTokens', () => {
  it('writes accessToken and refreshToken to SecureStore', async () => {
    await saveTokens({ accessToken: 'acc', refreshToken: 'ref' });
    expect(mockSet).toHaveBeenCalledWith('jwt_access_token',  'acc',  expect.any(Object));
    expect(mockSet).toHaveBeenCalledWith('jwt_refresh_token', 'ref',  expect.any(Object));
  });
});

// ── clearTokens ───────────────────────────────────────────────────────────────

describe('clearTokens', () => {
  it('deletes all three keys', async () => {
    await clearTokens();
    expect(mockDelete).toHaveBeenCalledWith('jwt_access_token',  expect.any(Object));
    expect(mockDelete).toHaveBeenCalledWith('jwt_refresh_token', expect.any(Object));
    expect(mockDelete).toHaveBeenCalledWith('server_user_id',    expect.any(Object));
  });
});

// ── isLoggedIn ────────────────────────────────────────────────────────────────

describe('isLoggedIn', () => {
  it('returns false when no refresh token stored', async () => {
    mockGet.mockResolvedValue(null);
    expect(await isLoggedIn()).toBe(false);
  });

  it('returns true when refresh token present', async () => {
    mockGet.mockResolvedValue('some-refresh-token');
    expect(await isLoggedIn()).toBe(true);
  });
});

// ── getServerUserId ───────────────────────────────────────────────────────────

describe('getServerUserId', () => {
  it('returns null when not set', async () => {
    mockGet.mockResolvedValue(null);
    expect(await getServerUserId()).toBeNull();
  });

  it('returns the stored user id', async () => {
    mockGet.mockResolvedValue('user-42');
    expect(await getServerUserId()).toBe('user-42');
  });
});

// ── refreshAccessToken ────────────────────────────────────────────────────────

describe('refreshAccessToken', () => {
  it('returns null when no refresh token stored', async () => {
    mockGet.mockResolvedValue(null);
    expect(await refreshAccessToken()).toBeNull();
  });

  it('exchanges refresh token and saves new tokens on success', async () => {
    mockGet.mockResolvedValue('old-refresh');
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok:   true,
      json: async () => ({ accessToken: 'new-acc', refreshToken: 'new-ref' }),
    });

    const result = await refreshAccessToken();
    expect(result).toBe('new-acc');
    expect(mockSet).toHaveBeenCalledWith('jwt_access_token',  'new-acc', expect.any(Object));
    expect(mockSet).toHaveBeenCalledWith('jwt_refresh_token', 'new-ref', expect.any(Object));
  });

  it('clears tokens and returns null when server returns non-ok', async () => {
    mockGet.mockResolvedValue('old-refresh');
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok:   false,
      json: async () => ({ error: 'Token expired' }),
    });

    const result = await refreshAccessToken();
    expect(result).toBeNull();
    expect(mockDelete).toHaveBeenCalledWith('jwt_access_token',  expect.any(Object));
    expect(mockDelete).toHaveBeenCalledWith('jwt_refresh_token', expect.any(Object));
  });

  it('returns null on network error (fetch throws)', async () => {
    mockGet.mockResolvedValue('old-refresh');
    (globalThis.fetch as jest.Mock).mockRejectedValue(new Error('Network failure'));
    expect(await refreshAccessToken()).toBeNull();
  });
});

// ── getAccessToken ────────────────────────────────────────────────────────────

describe('getAccessToken', () => {
  it('returns null when no access token stored', async () => {
    mockGet.mockResolvedValue(null);
    expect(await getAccessToken()).toBeNull();
  });

  it('returns valid non-expired token directly without refreshing', async () => {
    mockGet.mockResolvedValue(VALID_TOKEN);
    const result = await getAccessToken();
    expect(result).toBe(VALID_TOKEN);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('refreshes and returns new token when stored token is expired', async () => {
    // First call: getItemAsync('jwt_access_token') → expired
    // Second call (inside refreshAccessToken): getItemAsync('jwt_refresh_token') → has value
    mockGet
      .mockResolvedValueOnce(EXPIRED_TOKEN)
      .mockResolvedValueOnce('refresh-token');

    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok:   true,
      json: async () => ({ accessToken: 'refreshed-acc', refreshToken: 'new-ref' }),
    });

    const result = await getAccessToken();
    expect(result).toBe('refreshed-acc');
  });

  it('returns null when token is expired and refresh fails', async () => {
    mockGet
      .mockResolvedValueOnce(EXPIRED_TOKEN)
      .mockResolvedValueOnce('refresh-token');

    (globalThis.fetch as jest.Mock).mockRejectedValue(new Error('Network down'));
    expect(await getAccessToken()).toBeNull();
  });

  it('handles malformed JWT payload gracefully (no exp → treated as expired)', async () => {
    // A token with invalid base64 payload triggers the catch in decodeJwtPayload
    mockGet.mockResolvedValueOnce('header.!!!invalid!!!.sig');
    // refresh path — no refresh token stored
    mockGet.mockResolvedValueOnce(null);
    expect(await getAccessToken()).toBeNull();
  });
});

// ── login ─────────────────────────────────────────────────────────────────────

describe('login', () => {
  const credentials = { matricule: 'MAT-001', password: 'secret' };

  it('returns ok:true and saves tokens on success', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok:   true,
      json: async () => ({
        accessToken:  'acc-tok',
        refreshToken: 'ref-tok',
        user: { id: 'u1', name: 'Ali', matricule: 'MAT-001', role: 'inspector', wilaya: 'Algiers' },
      }),
    });

    const result = await login(credentials.matricule, credentials.password);
    expect(result.ok).toBe(true);
    expect(result.user?.id).toBe('u1');
    expect(mockSet).toHaveBeenCalledWith('jwt_access_token',  'acc-tok', expect.any(Object));
    expect(mockSet).toHaveBeenCalledWith('jwt_refresh_token', 'ref-tok', expect.any(Object));
    expect(mockSet).toHaveBeenCalledWith('server_user_id',    'u1',      expect.any(Object));
  });

  it('returns ok:false with server error message on non-ok response', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok:   false,
      json: async () => ({ error: 'Invalid credentials' }),
    });

    const result = await login(credentials.matricule, credentials.password);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Invalid credentials');
    expect(mockSet).not.toHaveBeenCalled();
  });

  it('returns generic error message when server error has no error field', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok:   false,
      json: async () => ({}),
    });

    const result = await login(credentials.matricule, credentials.password);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Login failed');
  });

  it('returns ok:false and network error message when fetch throws', async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValue(new Error('No internet'));
    const result = await login(credentials.matricule, credentials.password);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/network error/i);
  });

  it('does not store SERVER_USER_ID when user.id is absent', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok:   true,
      json: async () => ({
        accessToken:  'acc',
        refreshToken: 'ref',
        user: { name: 'Ali', matricule: 'MAT-001', role: 'inspector', wilaya: null },
      }),
    });

    await login(credentials.matricule, credentials.password);
    const userIdCalls = (mockSet as jest.Mock).mock.calls.filter(
      (c: string[]) => c[0] === 'server_user_id'
    );
    expect(userIdCalls).toHaveLength(0);
  });
});

// ── registerPushToken ─────────────────────────────────────────────────────────

describe('registerPushToken', () => {
  it('does nothing when no access token available', async () => {
    mockGet.mockResolvedValue(null);
    await registerPushToken('ExponentPushToken[xxx]');
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('posts push token to server with Bearer auth', async () => {
    mockGet.mockResolvedValue(VALID_TOKEN);
    (globalThis.fetch as jest.Mock).mockResolvedValue({ ok: true });

    await registerPushToken('ExponentPushToken[abc]');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/notifications/register'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: `Bearer ${VALID_TOKEN}`,
        }),
      })
    );
  });

  it('does not throw when fetch fails (non-fatal)', async () => {
    mockGet.mockResolvedValue(VALID_TOKEN);
    (globalThis.fetch as jest.Mock).mockRejectedValue(new Error('Server down'));
    await expect(registerPushToken('token')).resolves.toBeUndefined();
  });
});

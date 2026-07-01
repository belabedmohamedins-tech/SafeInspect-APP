// src/__tests__/apiClient.test.ts
//
// Tests the authenticated fetch wrapper in apiClient.ts.
// Covers:
//   - Happy path: attaches Bearer token from getAccessToken
//   - 401 + successful refresh: retries with new token
//   - 401 + refresh returns null: returns the 401 response without retry  ← branch lines 49-51
//   - No token (unauthenticated): sends request without Authorization header
//   - Network error: propagates the thrown error

jest.mock('../services/serverAuth', () => ({
  getAccessToken:     jest.fn(),
  refreshAccessToken: jest.fn(),
}));

import { apiClient } from '../services/apiClient';
import { getAccessToken, refreshAccessToken } from '../services/serverAuth';

const mockGetAccessToken     = jest.mocked(getAccessToken);
const mockRefreshAccessToken = jest.mocked(refreshAccessToken);

/** Build a minimal fetch-compatible Response stub. */
function mockResponse(status: number, body: unknown = {}): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetAccessToken.mockResolvedValue('access-token-123');
  mockRefreshAccessToken.mockResolvedValue(null);
  globalThis.fetch = jest.fn();
});

describe('apiClient', () => {
  it('attaches Authorization header with the current access token', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(mockResponse(200));
    await apiClient('/facilities');
    const [, init] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(init.headers['Authorization']).toBe('Bearer access-token-123');
  });

  it('sends request without Authorization header when no token exists', async () => {
    mockGetAccessToken.mockResolvedValueOnce(null);
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(mockResponse(200));
    await apiClient('/public');
    const [, init] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(init.headers['Authorization']).toBeUndefined();
  });

  it('returns 200 response directly without refreshing', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(mockResponse(200, { ok: true }));
    const res = await apiClient('/data');
    expect(res.status).toBe(200);
    expect(mockRefreshAccessToken).not.toHaveBeenCalled();
  });

  it('retries with new token after 401 when refresh succeeds', async () => {
    mockRefreshAccessToken.mockResolvedValueOnce('new-token-456');
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce(mockResponse(401))   // first attempt
      .mockResolvedValueOnce(mockResponse(200));   // retry
    const res = await apiClient('/protected');
    expect(res.status).toBe(200);
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    const [, retryInit] = (globalThis.fetch as jest.Mock).mock.calls[1];
    expect(retryInit.headers['Authorization']).toBe('Bearer new-token-456');
  });

  // ── Branch: 401 but refreshAccessToken returns null (lines 49-51) ─────────
  it('returns the original 401 response when refresh returns null', async () => {
    mockRefreshAccessToken.mockResolvedValueOnce(null);
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(mockResponse(401));
    const res = await apiClient('/protected');
    // No retry — fetch called only once
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(401);
  });

  it('propagates network errors', async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    await expect(apiClient('/offline')).rejects.toThrow('Network error');
  });

  it('forwards custom headers from init', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(mockResponse(200));
    await apiClient('/custom', { headers: { 'X-Custom': 'value' } });
    const [, init] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(init.headers['X-Custom']).toBe('value');
  });
});

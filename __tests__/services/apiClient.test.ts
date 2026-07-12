// __tests__/services/apiClient.test.ts
jest.mock('../../src/services/serverAuth', () => ({
  getAccessToken: jest.fn(),
  refreshAccessToken: jest.fn(),
}));

import { apiClient } from '../../src/services/apiClient';
import { getAccessToken, refreshAccessToken } from '../../src/services/serverAuth';

const mockGetAccessToken    = getAccessToken as jest.Mock;
const mockRefreshAccessToken = refreshAccessToken as jest.Mock;
const mockFetch = jest.fn();
(globalThis as any).fetch = mockFetch;

function makeResponse(status: number, body = {}): Response {
  return { status, json: async () => body, ok: status < 400 } as unknown as Response;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetAccessToken.mockResolvedValue(null);
  mockRefreshAccessToken.mockResolvedValue(null);
});

describe('apiClient', () => {
  it('sends request with Authorization header when token exists', async () => {
    mockGetAccessToken.mockResolvedValue('tok-123');
    mockFetch.mockResolvedValue(makeResponse(200));

    await apiClient('/facilities');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers['Authorization']).toBe('Bearer tok-123');
  });

  it('sends request without Authorization when no token', async () => {
    mockGetAccessToken.mockResolvedValue(null);
    mockFetch.mockResolvedValue(makeResponse(200));

    await apiClient('/facilities');
    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers['Authorization']).toBeUndefined();
  });

  it('uses EXPO_PUBLIC_SYNC_API_URL env var as base URL', async () => {
    process.env.EXPO_PUBLIC_SYNC_API_URL = 'https://api.example.com';
    mockFetch.mockResolvedValue(makeResponse(200));
    await apiClient('/test-path');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe('https://api.example.com/test-path');
    delete process.env.EXPO_PUBLIC_SYNC_API_URL;
  });

  it('falls back to localhost:3000 when env var missing', async () => {
    delete process.env.EXPO_PUBLIC_SYNC_API_URL;
    mockFetch.mockResolvedValue(makeResponse(200));
    await apiClient('/path');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('localhost:3000');
  });

  it('on 401 with refreshed token, retries and returns second response', async () => {
    mockGetAccessToken.mockResolvedValue('old-tok');
    mockRefreshAccessToken.mockResolvedValue('new-tok');
    mockFetch
      .mockResolvedValueOnce(makeResponse(401))
      .mockResolvedValueOnce(makeResponse(200));

    const res = await apiClient('/secure');
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(res.status).toBe(200);
    const [, secondInit] = mockFetch.mock.calls[1];
    expect(secondInit.headers['Authorization']).toBe('Bearer new-tok');
  });

  it('on 401 with no refresh token, returns 401 response', async () => {
    mockGetAccessToken.mockResolvedValue('old-tok');
    mockRefreshAccessToken.mockResolvedValue(null);
    mockFetch.mockResolvedValueOnce(makeResponse(401));

    const res = await apiClient('/secure');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(401);
  });

  it('passes custom method and body through', async () => {
    mockFetch.mockResolvedValue(makeResponse(201));
    await apiClient('/data', { method: 'POST', body: JSON.stringify({ x: 1 }) });
    const [, init] = mockFetch.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ x: 1 }));
  });

  it('merges custom headers with defaults', async () => {
    mockFetch.mockResolvedValue(makeResponse(200));
    await apiClient('/data', { headers: { 'X-Custom': 'yes' } });
    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers['X-Custom']).toBe('yes');
    expect(init.headers['Content-Type']).toBe('application/json');
  });
});

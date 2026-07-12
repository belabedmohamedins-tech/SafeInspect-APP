// __tests__/services/apiClient.test.ts

const mockGetAccessToken  = jest.fn();
const mockRefreshToken    = jest.fn();

jest.mock('../../src/services/serverAuth', () => ({
  getAccessToken:    () => mockGetAccessToken(),
  refreshAccessToken:() => mockRefreshToken(),
}));

import { apiClient } from '../../src/services/apiClient';

const mockFetch = jest.fn();
globalThis.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
  mockGetAccessToken.mockResolvedValue('token-abc');
  mockRefreshToken.mockResolvedValue(null);
});

const makeResponse = (status: number, body = '{}') => ({
  status,
  json: () => Promise.resolve(JSON.parse(body)),
  text: () => Promise.resolve(body),
});

describe('apiClient', () => {
  it('sends Authorization Bearer header', async () => {
    mockFetch.mockResolvedValue(makeResponse(200));
    await apiClient('/test');
    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers.Authorization).toBe('Bearer token-abc');
  });

  it('sends request without auth header when no token', async () => {
    mockGetAccessToken.mockResolvedValue(null);
    mockFetch.mockResolvedValue(makeResponse(200));
    await apiClient('/test');
    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers.Authorization).toBeUndefined();
  });

  it('returns response directly on 200', async () => {
    mockFetch.mockResolvedValue(makeResponse(200));
    const res = await apiClient('/test');
    expect(res.status).toBe(200);
  });

  it('retries with new token on 401 and refresh succeeds', async () => {
    mockFetch
      .mockResolvedValueOnce(makeResponse(401))
      .mockResolvedValueOnce(makeResponse(200));
    mockRefreshToken.mockResolvedValue('new-token');
    const res = await apiClient('/protected');
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(res.status).toBe(200);
    const retryHeaders = mockFetch.mock.calls[1][1].headers;
    expect(retryHeaders.Authorization).toBe('Bearer new-token');
  });

  it('returns 401 response when refresh returns null', async () => {
    mockFetch.mockResolvedValue(makeResponse(401));
    mockRefreshToken.mockResolvedValue(null);
    const res = await apiClient('/protected');
    // Only called once — no retry when refresh returns null
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(401);
  });

  it('merges custom headers with defaults', async () => {
    mockFetch.mockResolvedValue(makeResponse(200));
    await apiClient('/test', { headers: { 'X-Custom': 'yes' } });
    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers['X-Custom']).toBe('yes');
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('propagates network errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'));
    await expect(apiClient('/fail')).rejects.toThrow('Network failure');
  });
});

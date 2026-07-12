// __tests__/services/apiClient.test.ts
const mockGetAccessToken    = jest.fn();
const mockRefreshAccessToken = jest.fn();

jest.mock('../../src/services/serverAuth', () => ({
  getAccessToken:     (...a: any[]) => mockGetAccessToken(...a),
  refreshAccessToken: (...a: any[]) => mockRefreshAccessToken(...a),
}));

import { apiClient } from '../../src/services/apiClient';

function makeResponse(status: number, body: string = '{}'): Response {
  return new Response(body, { status });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetAccessToken.mockResolvedValue('token-abc');
  mockRefreshAccessToken.mockResolvedValue(null);
});

describe('apiClient', () => {
  it('attaches Authorization Bearer header when token is present', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(makeResponse(200));
    await apiClient('/test');
    const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer token-abc');
    fetchSpy.mockRestore();
  });

  it('omits Authorization header when token is null', async () => {
    mockGetAccessToken.mockResolvedValue(null);
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(makeResponse(200));
    await apiClient('/test');
    const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
    fetchSpy.mockRestore();
  });

  it('returns 200 response without retrying', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(makeResponse(200));
    const res = await apiClient('/test');
    expect(res.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    fetchSpy.mockRestore();
  });

  it('retries with new token on 401 when refresh succeeds', async () => {
    mockRefreshAccessToken.mockResolvedValue('new-token');
    const fetchSpy = jest.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(makeResponse(401))
      .mockResolvedValueOnce(makeResponse(200));
    const res = await apiClient('/protected');
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    const retryHeaders = fetchSpy.mock.calls[1][1]?.headers as Record<string, string>;
    expect(retryHeaders.Authorization).toBe('Bearer new-token');
    expect(res.status).toBe(200);
    fetchSpy.mockRestore();
  });

  it('returns 401 response without retrying when refresh returns null', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(makeResponse(401));
    const res = await apiClient('/protected');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(401);
    fetchSpy.mockRestore();
  });

  it('passes custom init options through to fetch', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(makeResponse(201));
    await apiClient('/create', { method: 'POST', body: JSON.stringify({ x: 1 }) });
    expect(fetchSpy.mock.calls[0][1]).toMatchObject({ method: 'POST' });
    fetchSpy.mockRestore();
  });
});

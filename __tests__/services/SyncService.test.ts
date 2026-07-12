// __tests__/services/SyncService.test.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// NetInfo mock — must be set before importing SyncService
jest.mock('@react-native-community/netinfo', () => ({
  default: {
    fetch: jest.fn().mockResolvedValue({ isConnected: true, isInternetReachable: true }),
  },
}));

jest.mock('../../src/services/apiClient', () => ({
  apiClient: jest.fn().mockResolvedValue({ ok: true }),
}));

import { enqueue, flush, getSyncStatus, clearQueue } from '../../src/services/SyncService';
import { apiClient } from '../../src/services/apiClient';
import NetInfo from '@react-native-community/netinfo';

const makeInspection = (overrides = {}): any => ({
  id: 'i1',
  facilityId: 'f1',
  facilityName: 'FAC',
  date: '2026-01-01',
  status: 'completed',
  items: [],
  score: 90,
  grade: 'A',
  ...overrides,
});

beforeEach(async () => {
  jest.clearAllMocks();
  AsyncStorage.clear();
  // Default: online
  (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true, isInternetReachable: true });
  (apiClient as jest.Mock).mockResolvedValue({ ok: true });
});

describe('enqueue', () => {
  it('adds an item to the queue', async () => {
    await enqueue(makeInspection());
    const status = await getSyncStatus();
    expect(status.pendingCount).toBe(1);
  });

  it('replaces existing item when newer timestamp', async () => {
    await enqueue(makeInspection({ updatedAt: '2026-01-01' }));
    await enqueue(makeInspection({ updatedAt: '2026-01-02' }));
    const status = await getSyncStatus();
    expect(status.pendingCount).toBe(1);
  });

  it('keeps existing item when incoming is older', async () => {
    await enqueue(makeInspection({ updatedAt: '2026-01-02' }));
    await enqueue(makeInspection({ updatedAt: '2026-01-01' }));
    const status = await getSyncStatus();
    expect(status.pendingCount).toBe(1);
  });

  it('adds distinct items for different ids', async () => {
    await enqueue(makeInspection({ id: 'i1' }));
    await enqueue(makeInspection({ id: 'i2' }));
    const status = await getSyncStatus();
    expect(status.pendingCount).toBe(2);
  });
});

describe('flush', () => {
  it('returns 0 when SYNC_API_URL is not set', async () => {
    delete process.env.EXPO_PUBLIC_SYNC_API_URL;
    const count = await flush();
    expect(count).toBe(0);
  });

  it('returns 0 when offline', async () => {
    process.env.EXPO_PUBLIC_SYNC_API_URL = 'https://api.example.com';
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false, isInternetReachable: false });
    await enqueue(makeInspection());
    const count = await flush();
    expect(count).toBe(0);
    delete process.env.EXPO_PUBLIC_SYNC_API_URL;
  });

  it('returns 0 when queue is empty', async () => {
    process.env.EXPO_PUBLIC_SYNC_API_URL = 'https://api.example.com';
    const count = await flush();
    expect(count).toBe(0);
    delete process.env.EXPO_PUBLIC_SYNC_API_URL;
  });

  it('syncs items and returns count', async () => {
    process.env.EXPO_PUBLIC_SYNC_API_URL = 'https://api.example.com';
    await enqueue(makeInspection({ id: 'i1' }));
    await enqueue(makeInspection({ id: 'i2' }));
    const count = await flush();
    expect(count).toBe(2);
    const status = await getSyncStatus();
    expect(status.pendingCount).toBe(0);
    delete process.env.EXPO_PUBLIC_SYNC_API_URL;
  });

  it('keeps failed items in queue', async () => {
    process.env.EXPO_PUBLIC_SYNC_API_URL = 'https://api.example.com';
    (apiClient as jest.Mock).mockResolvedValue({ ok: false });
    await enqueue(makeInspection());
    const count = await flush();
    expect(count).toBe(0);
    const status = await getSyncStatus();
    expect(status.pendingCount).toBe(1);
    delete process.env.EXPO_PUBLIC_SYNC_API_URL;
  });

  it('keeps items in queue on network exception', async () => {
    process.env.EXPO_PUBLIC_SYNC_API_URL = 'https://api.example.com';
    (apiClient as jest.Mock).mockRejectedValue(new Error('network'));
    await enqueue(makeInspection());
    const count = await flush();
    expect(count).toBe(0);
    delete process.env.EXPO_PUBLIC_SYNC_API_URL;
  });

  it('handles NetInfo fetch throwing (falls back to online=true)', async () => {
    process.env.EXPO_PUBLIC_SYNC_API_URL = 'https://api.example.com';
    (NetInfo.fetch as jest.Mock).mockRejectedValue(new Error('netinfo fail'));
    await enqueue(makeInspection());
    const count = await flush();
    expect(count).toBe(1);
    delete process.env.EXPO_PUBLIC_SYNC_API_URL;
  });
});

describe('getSyncStatus', () => {
  it('returns pendingCount, lastSyncAt, isOnline', async () => {
    const status = await getSyncStatus();
    expect(status).toHaveProperty('pendingCount');
    expect(status).toHaveProperty('lastSyncAt');
    expect(status).toHaveProperty('isOnline');
  });

  it('lastSyncAt is null before any sync', async () => {
    const status = await getSyncStatus();
    expect(status.lastSyncAt).toBeNull();
  });

  it('lastSyncAt is a Date after flush', async () => {
    process.env.EXPO_PUBLIC_SYNC_API_URL = 'https://api.example.com';
    await enqueue(makeInspection());
    await flush();
    const status = await getSyncStatus();
    expect(status.lastSyncAt).toBeInstanceOf(Date);
    delete process.env.EXPO_PUBLIC_SYNC_API_URL;
  });
});

describe('clearQueue', () => {
  it('empties the queue', async () => {
    await enqueue(makeInspection());
    await clearQueue();
    const status = await getSyncStatus();
    expect(status.pendingCount).toBe(0);
  });
});

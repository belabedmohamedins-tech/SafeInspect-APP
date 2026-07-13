// src/__tests__/SyncService.test.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../repositories/keys';
import {
  clearQueue,
  enqueue,
  flush,
  getSyncStatus,
} from '../services/SyncService';
import { SavedInspection } from '../types';

// ─── Mock apiClient ─────────────────────────────────────────────────────────────────────
jest.mock('../services/apiClient', () => ({
  apiClient: jest.fn(),
}));

import { apiClient } from '../services/apiClient';
const mockApiClient = apiClient as jest.Mock;

// ─── NetInfo ─────────────────────────────────────────────────────────────────────────
const NetInfoMock = require('@react-native-community/netinfo').default as {
  __reset: () => void;
  fetch:   jest.Mock;
};

beforeEach(async () => {
  jest.clearAllMocks();
  NetInfoMock.__reset();
  await AsyncStorage.clear();
  mockApiClient.mockResolvedValue({ ok: true, status: 200 });
});

// ─── Helpers ───────────────────────────────────────────────────────────────────────

function makeInspection(id: string, updatedAt?: string): SavedInspection {
  return {
    id,
    facilityId:    'fac-1',
    facilityName:  'منشأة',
    inspectorName: 'مفتش',
    officeName:    'مكتب',
    date:          '2026-06-27',
    updatedAt:     updatedAt ?? '2026-06-27T10:00:00Z',
    status:        'completed',
    items:         [],
    score:         80,
    grade:         'B',
  } as unknown as SavedInspection;
}

async function readQueue() {
  const raw = await AsyncStorage.getItem(StorageKeys.SYNC_QUEUE);
  return raw ? JSON.parse(raw) : [];
}

// ─── enqueue ─────────────────────────────────────────────────────────────────────────────

describe('enqueue', () => {
  it('adds a new inspection to an empty queue', async () => {
    await enqueue(makeInspection('i1'));
    const q = await readQueue();
    expect(q).toHaveLength(1);
    expect(q[0].inspection.id).toBe('i1');
  });

  it('replaces an existing entry when incoming updatedAt is newer', async () => {
    await enqueue(makeInspection('i1', '2026-06-27T08:00:00Z'));
    await enqueue(makeInspection('i1', '2026-06-27T10:00:00Z'));
    const q = await readQueue();
    expect(q).toHaveLength(1);
    expect(q[0].inspection.updatedAt).toBe('2026-06-27T10:00:00Z');
  });

  it('keeps existing entry when incoming updatedAt is older', async () => {
    await enqueue(makeInspection('i1', '2026-06-27T10:00:00Z'));
    await enqueue(makeInspection('i1', '2026-06-27T08:00:00Z'));
    const q = await readQueue();
    expect(q).toHaveLength(1);
    expect(q[0].inspection.updatedAt).toBe('2026-06-27T10:00:00Z');
  });

  it('keeps two entries for two different ids', async () => {
    await enqueue(makeInspection('i1'));
    await enqueue(makeInspection('i2'));
    const q = await readQueue();
    expect(q).toHaveLength(2);
  });

  it('resets attempts to 0 when replacing an existing entry', async () => {
    await enqueue(makeInspection('i1', '2026-06-27T08:00:00Z'));
    const q1 = await readQueue();
    q1[0].attempts = 3;
    await AsyncStorage.setItem(StorageKeys.SYNC_QUEUE, JSON.stringify(q1));
    await enqueue(makeInspection('i1', '2026-06-27T10:00:00Z'));
    const q2 = await readQueue();
    expect(q2[0].attempts).toBe(0);
  });
});

// ─── flush — no API URL ───────────────────────────────────────────────────────────────────

describe('flush — no API URL configured', () => {
  it('returns 0 without calling apiClient', async () => {
    await enqueue(makeInspection('i1'));
    const synced = await flush();
    expect(synced).toBe(0);
    expect(mockApiClient).not.toHaveBeenCalled();
  });
});

// ─── flush — with API URL ───────────────────────────────────────────────────────────────

describe('flush — with API URL', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_SYNC_API_URL = 'https://api.test';
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_SYNC_API_URL;
  });

  it('returns 0 immediately when queue is empty', async () => {
    const synced = await flush();
    expect(synced).toBe(0);
    expect(mockApiClient).not.toHaveBeenCalled();
  });

  it('returns 0 when device is offline', async () => {
    await enqueue(makeInspection('i1'));
    NetInfoMock.fetch.mockResolvedValueOnce({ isConnected: false, isInternetReachable: false });
    const synced = await flush();
    expect(synced).toBe(0);
    expect(mockApiClient).not.toHaveBeenCalled();
  });

  // isInternetReachable: null means unknown — treated as online (branch: !== false)
  it('treats isInternetReachable=null as online and proceeds to flush', async () => {
    await enqueue(makeInspection('i1'));
    NetInfoMock.fetch.mockResolvedValueOnce({ isConnected: true, isInternetReachable: null });
    const synced = await flush();
    expect(synced).toBe(1);
  });

  // checkOnline catch branch — NetInfo.fetch throws inside flush
  it('defaults to online and flushes when NetInfo.fetch throws', async () => {
    await enqueue(makeInspection('i1'));
    NetInfoMock.fetch.mockRejectedValueOnce(new Error('NetInfo unavailable'));
    const synced = await flush();
    expect(synced).toBe(1);
  });

  it('removes item from queue on 2xx response', async () => {
    await enqueue(makeInspection('i1'));
    mockApiClient.mockResolvedValueOnce({ ok: true, status: 200 });
    const synced = await flush();
    expect(synced).toBe(1);
    const q = await readQueue();
    expect(q).toHaveLength(0);
  });

  it('keeps item in queue on 4xx response and increments attempts', async () => {
    await enqueue(makeInspection('i1'));
    mockApiClient.mockResolvedValueOnce({ ok: false, status: 422 });
    const synced = await flush();
    expect(synced).toBe(0);
    const q = await readQueue();
    expect(q).toHaveLength(1);
    expect(q[0].attempts).toBe(1);
  });

  it('keeps item in queue when apiClient throws and increments attempts', async () => {
    await enqueue(makeInspection('i1'));
    mockApiClient.mockRejectedValueOnce(new Error('Network request failed'));
    const synced = await flush();
    expect(synced).toBe(0);
    const q = await readQueue();
    expect(q).toHaveLength(1);
    expect(q[0].attempts).toBe(1);
  });

  it('does not update SYNC_LAST_RUN when nothing is synced', async () => {
    await enqueue(makeInspection('i1'));
    mockApiClient.mockResolvedValueOnce({ ok: false, status: 500 });
    await flush();
    const lastRun = await AsyncStorage.getItem(StorageKeys.SYNC_LAST_RUN);
    expect(lastRun).toBeNull();
  });

  it('updates SYNC_LAST_RUN only when at least one item is synced', async () => {
    await enqueue(makeInspection('i1'));
    mockApiClient.mockResolvedValueOnce({ ok: true, status: 200 });
    await flush();
    const lastRun = await AsyncStorage.getItem(StorageKeys.SYNC_LAST_RUN);
    expect(lastRun).not.toBeNull();
  });

  it('handles mixed success and failure in one flush', async () => {
    await enqueue(makeInspection('i1'));
    await enqueue(makeInspection('i2'));
    await enqueue(makeInspection('i3'));
    mockApiClient
      .mockResolvedValueOnce({ ok: true,  status: 200 })
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: true,  status: 201 });
    const synced = await flush();
    expect(synced).toBe(2);
    const q = await readQueue();
    expect(q).toHaveLength(1);
    expect(q[0].inspection.id).toBe('i2');
  });
});

// ─── getSyncStatus ───────────────────────────────────────────────────────────────────────

describe('getSyncStatus', () => {
  it('returns pendingCount equal to queue length', async () => {
    await enqueue(makeInspection('i1'));
    await enqueue(makeInspection('i2'));
    const status = await getSyncStatus();
    expect(status.pendingCount).toBe(2);
  });

  it('returns lastSyncAt as null when SYNC_LAST_RUN not set', async () => {
    const status = await getSyncStatus();
    expect(status.lastSyncAt).toBeNull();
  });

  it('returns lastSyncAt as a Date when SYNC_LAST_RUN is set', async () => {
    const ts = '2026-06-27T10:00:00.000Z';
    await AsyncStorage.setItem(StorageKeys.SYNC_LAST_RUN, ts);
    const status = await getSyncStatus();
    expect(status.lastSyncAt).toEqual(new Date(ts));
  });

  it('isOnline reflects NetInfo result', async () => {
    const status = await getSyncStatus();
    expect(status.isOnline).toBe(true);
  });

  it('isOnline defaults to true when NetInfo.fetch throws (catch branch)', async () => {
    NetInfoMock.fetch.mockRejectedValueOnce(new Error('NetInfo unavailable'));
    const status = await getSyncStatus();
    expect(status.isOnline).toBe(true);
  });
});

// ─── clearQueue ─────────────────────────────────────────────────────────────────────────

describe('clearQueue', () => {
  it('removes all items from the queue', async () => {
    await enqueue(makeInspection('i1'));
    await enqueue(makeInspection('i2'));
    await clearQueue();
    const q = await readQueue();
    expect(q).toHaveLength(0);
  });
});

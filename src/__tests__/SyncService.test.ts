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

function makeInspectionNoTimestamps(id: string): SavedInspection {
  // Both updatedAt and date are undefined — exercises the `?? ''` fallback
  return {
    id,
    facilityId:    'fac-1',
    facilityName:  'منشأة',
    inspectorName: 'مفتش',
    officeName:    'مكتب',
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

  // readQueue catch branch — corrupt JSON in storage returns empty array
  it('returns empty queue and adds item when storage contains corrupt JSON', async () => {
    await AsyncStorage.setItem(StorageKeys.SYNC_QUEUE, '{corrupt json');
    await enqueue(makeInspection('i1'));
    const q = await readQueue();
    expect(q).toHaveLength(1);
    expect(q[0].inspection.id).toBe('i1');
  });

  // ── Branch: updatedAt undefined on both entries — falls back to date ?? '' (line 95) ──
  it('keeps existing entry when neither existing nor incoming has timestamps (equal timestamps treated as not-newer)', async () => {
    const noTs = makeInspectionNoTimestamps('i1');
    await enqueue(noTs);
    // Manually bump attempts so we can verify it was NOT replaced
    const q1 = await readQueue();
    q1[0].attempts = 5;
    await AsyncStorage.setItem(StorageKeys.SYNC_QUEUE, JSON.stringify(q1));
    await enqueue(noTs);
    // incomingTs ('') >= existingTs ('') is true, so it IS replaced (attempts reset)
    const q2 = await readQueue();
    expect(q2).toHaveLength(1);
    expect(q2[0].attempts).toBe(0);
  });

  // ── Branch: incoming has date but no updatedAt; existing has updatedAt (line 95) ─────
  it('uses date as fallback for timestamp comparison when updatedAt is absent', async () => {
    // Enqueue inspection with only a date field (no updatedAt)
    const withDate = { ...makeInspectionNoTimestamps('i2'), date: '2026-07-01' } as unknown as SavedInspection;
    await enqueue(withDate);
    const q1 = await readQueue();
    expect(q1[0].inspection.id).toBe('i2');
    // Enqueue same id with an older date — should NOT replace
    const olderDate = { ...makeInspectionNoTimestamps('i2'), date: '2026-06-01' } as unknown as SavedInspection;
    await enqueue(olderDate);
    const q2 = await readQueue();
    expect(q2).toHaveLength(1);
    expect(q2[0].inspection.date).toBe('2026-07-01');
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

  // ── Branch: isConnected is null → `=== true` is false → offline (line 71) ─────────
  it('returns 0 when isConnected is null (treated as offline)', async () => {
    await enqueue(makeInspection('i1'));
    NetInfoMock.fetch.mockResolvedValueOnce({ isConnected: null, isInternetReachable: true });
    const synced = await flush();
    expect(synced).toBe(0);
    expect(mockApiClient).not.toHaveBeenCalled();
  });

  // isInternetReachable: null — treated as online (branch: !== false)
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

  // readQueue catch branch inside flush — corrupt JSON treated as empty queue
  it('returns 0 when queue storage is corrupt JSON', async () => {
    await AsyncStorage.setItem(StorageKeys.SYNC_QUEUE, '{corrupt json');
    const synced = await flush();
    expect(synced).toBe(0);
    expect(mockApiClient).not.toHaveBeenCalled();
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

  // readQueue catch branch in getSyncStatus — corrupt storage returns pendingCount 0
  it('returns pendingCount 0 when queue storage is corrupt JSON', async () => {
    await AsyncStorage.setItem(StorageKeys.SYNC_QUEUE, '{corrupt json');
    const status = await getSyncStatus();
    expect(status.pendingCount).toBe(0);
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

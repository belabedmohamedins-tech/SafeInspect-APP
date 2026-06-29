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

// ─── Mock fetch globally ─────────────────────────────────────────────────────
const mockFetch = jest.fn();
global.fetch = mockFetch;

// ─── NetInfo ──────────────────────────────────────────────────────────────────
// moduleNameMapper routes @react-native-community/netinfo to the __mocks__ file.
// We grab the stable instance here so we can call __reset() after clearAllMocks()
// restores all mock implementations to undefined.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const NetInfoMock = require('@react-native-community/netinfo').default as {
  __reset: () => void;
};

beforeEach(async () => {
  jest.clearAllMocks();
  // clearAllMocks() wipes mock implementations (including NetInfo.fetch's
  // mockResolvedValue).  Restore the default online state so checkOnline()
  // returns true and flush() doesn't short-circuit.
  NetInfoMock.__reset();
  global.fetch = mockFetch;
  await AsyncStorage.clear();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeInspection(id: string, updatedAt?: string): SavedInspection {
  return {
    id,
    facilityId:    'fac-1',
    facilityName:  '\u0645\u0646\u0634\u0623\u0629',
    inspectorName: '\u0645\u0641\u062a\u0634',
    officeName:    '\u0645\u0643\u062a\u0628',
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

// ─── enqueue ──────────────────────────────────────────────────────────────────

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

// ─── flush — no API URL ────────────────────────────────────────────────────────

describe('flush — no API URL configured', () => {
  it('returns 0 without calling fetch', async () => {
    await enqueue(makeInspection('i1'));
    const synced = await flush();
    expect(synced).toBe(0);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

// ─── flush — with API URL ──────────────────────────────────────────────────────
//
// No jest.resetModules() — module registry stays stable for the whole file.
// process.env is mutated per-test; getSyncApiUrl() reads it lazily so the
// env change is visible to the already-loaded SyncService module.

describe('flush — with API URL (mocked via env)', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV, EXPO_PUBLIC_SYNC_API_URL: 'https://api.test' };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('removes item from queue on 2xx response', async () => {
    await enqueue(makeInspection('i1'));
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });
    const synced = await flush();
    expect(synced).toBe(1);
    const q = await readQueue();
    expect(q).toHaveLength(0);
  });

  it('keeps item in queue on 4xx response', async () => {
    await enqueue(makeInspection('i1'));
    mockFetch.mockResolvedValueOnce({ ok: false, status: 422 });
    const synced = await flush();
    expect(synced).toBe(0);
    const q = await readQueue();
    expect(q).toHaveLength(1);
  });

  it('keeps item in queue when fetch throws (network error)', async () => {
    await enqueue(makeInspection('i1'));
    mockFetch.mockRejectedValueOnce(new Error('Network request failed'));
    const synced = await flush();
    expect(synced).toBe(0);
    const q = await readQueue();
    expect(q).toHaveLength(1);
  });

  it('updates SYNC_LAST_RUN only when at least one item is synced', async () => {
    await enqueue(makeInspection('i1'));
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });
    await flush();
    const lastRun = await AsyncStorage.getItem(StorageKeys.SYNC_LAST_RUN);
    expect(lastRun).not.toBeNull();
  });

  it('handles mixed success and failure in one flush', async () => {
    await enqueue(makeInspection('i1'));
    await enqueue(makeInspection('i2'));
    await enqueue(makeInspection('i3'));
    mockFetch
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

// ─── getSyncStatus ────────────────────────────────────────────────────────────

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
});

// ─── clearQueue ───────────────────────────────────────────────────────────────

describe('clearQueue', () => {
  it('removes all items from the queue', async () => {
    await enqueue(makeInspection('i1'));
    await enqueue(makeInspection('i2'));
    await clearQueue();
    const q = await readQueue();
    expect(q).toHaveLength(0);
  });
});

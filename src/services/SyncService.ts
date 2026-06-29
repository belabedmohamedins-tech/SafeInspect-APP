// src/services/SyncService.ts
//
// Offline-first sync queue.
//
// Design:
//   - Completed inspections are enqueued locally (AsyncStorage) immediately
//     after save, regardless of network state.
//   - flush() is called by the scheduler in _layout.tsx (every 15 min) and
//     can also be triggered manually from the Backup screen.
//   - Each item is POSTed to SYNC_API_URL.  On 2xx the item is dequeued.
//     On network error or non-2xx the item stays in the queue for the next run.
//   - Conflict resolution: the server should compare updatedAt and keep the
//     newest version (last-write-wins).  The client always sends the full
//     inspection object.
//   - If SYNC_API_URL is not configured the service is a silent no-op so
//     development / Expo Go usage is unaffected.
//
// NOTE: SYNC_API_URL is intentionally read lazily (inside each function) so
// that tests can mutate process.env + call jest.resetModules() to exercise
// both the "no URL" and "URL configured" branches without module caching.
//
// NOTE: checkOnline() uses require() instead of import() for the same reason:
// jest.mock() only intercepts require() and static imports — NOT dynamic
// import() calls — so after jest.resetModules() a dynamic import() would
// bypass the mock registry and hit the real (or stale) module.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedInspection } from '../types';
import { StorageKeys } from '../repositories/keys';

/** Read the API URL fresh each call — lets jest.resetModules() + env work. */
function getSyncApiUrl(): string | undefined {
  return (process.env.EXPO_PUBLIC_SYNC_API_URL ?? '').trim() || undefined;
}

export interface SyncQueueItem {
  inspection: SavedInspection;
  queuedAt: string;   // ISO timestamp
  attempts: number;
}

export interface SyncStatus {
  pendingCount: number;
  lastSyncAt: Date | null;
  isOnline: boolean;
}

// ─── Queue helpers ────────────────────────────────────────────────────────────

async function readQueue(): Promise<SyncQueueItem[]> {
  try {
    const raw = await AsyncStorage.getItem(StorageKeys.SYNC_QUEUE);
    return raw ? (JSON.parse(raw) as SyncQueueItem[]) : [];
  } catch {
    return [];
  }
}

async function writeQueue(queue: SyncQueueItem[]): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.SYNC_QUEUE, JSON.stringify(queue));
}

// ─── Network check ───────────────────────────────────────────────────────────

async function checkOnline(): Promise<boolean> {
  try {
    // Lazy require() — NOT import() — so jest.mock() interception works
    // correctly after jest.resetModules() in tests.  Dynamic import() bypasses
    // the Jest mock registry; require() does not.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const NetInfo = require('@react-native-community/netinfo') as typeof import('@react-native-community/netinfo');
    const state = await NetInfo.default.fetch();
    return state.isConnected === true && state.isInternetReachable !== false;
  } catch {
    // If NetInfo is not installed, assume online and let the fetch decide
    return true;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Add or update an inspection in the sync queue.
 * Idempotent: if an entry with the same id already exists it is replaced
 * with the latest version (higher updatedAt wins).
 */
export async function enqueue(inspection: SavedInspection): Promise<void> {
  const queue = await readQueue();
  const idx = queue.findIndex(q => q.inspection.id === inspection.id);

  const item: SyncQueueItem = {
    inspection,
    queuedAt: new Date().toISOString(),
    attempts: 0,
  };

  if (idx >= 0) {
    // Keep whichever version is newer
    const existing = queue[idx].inspection;
    const existingTs = existing.updatedAt ?? existing.date ?? '';
    const incomingTs = inspection.updatedAt ?? inspection.date ?? '';
    if (incomingTs >= existingTs) {
      queue[idx] = item;
    }
  } else {
    queue.push(item);
  }

  await writeQueue(queue);
}

/**
 * Attempt to push all queued inspections to the sync endpoint.
 * Resolves with the number of successfully synced items.
 * Silent no-op if SYNC_API_URL is not configured.
 */
export async function flush(): Promise<number> {
  const SYNC_API_URL = getSyncApiUrl();
  if (!SYNC_API_URL) return 0;

  const isOnline = await checkOnline();
  if (!isOnline) return 0;

  const queue = await readQueue();
  if (queue.length === 0) return 0;

  let synced = 0;
  const remaining: SyncQueueItem[] = [];

  for (const item of queue) {
    try {
      const res = await fetch(`${SYNC_API_URL}/inspections`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(item.inspection),
      });

      if (res.ok) {
        synced++;
        // item successfully synced — drop from queue
      } else {
        // Server rejected — keep in queue, bump attempts
        remaining.push({ ...item, attempts: item.attempts + 1 });
      }
    } catch {
      // Network error — keep in queue
      remaining.push({ ...item, attempts: item.attempts + 1 });
    }
  }

  await writeQueue(remaining);

  if (synced > 0) {
    await AsyncStorage.setItem(
      StorageKeys.SYNC_LAST_RUN,
      new Date().toISOString(),
    );
  }

  return synced;
}

/**
 * Return the current sync status for display in the Backup screen.
 */
export async function getSyncStatus(): Promise<SyncStatus> {
  const [queue, lastRaw] = await Promise.all([
    readQueue(),
    AsyncStorage.getItem(StorageKeys.SYNC_LAST_RUN),
  ]);

  const isOnline = await checkOnline();

  return {
    pendingCount: queue.length,
    lastSyncAt:  lastRaw ? new Date(lastRaw) : null,
    isOnline,
  };
}

/**
 * Discard the entire sync queue (e.g. after a full backup restore).
 */
export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(StorageKeys.SYNC_QUEUE);
}

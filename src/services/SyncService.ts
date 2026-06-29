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
//   - If SYNC_API_URL is not configured the service is a silent no-op so
//     development / Expo Go usage is unaffected.
//
// NOTE: SYNC_API_URL is read lazily via getSyncApiUrl() so env mutations in
// tests are visible without module reloading. Mutate process.env IN-PLACE
// (process.env.KEY = value) — never replace the whole object — so every
// module that holds a reference to process.env sees the change.
//
// NetInfo uses require() (not dynamic import()) so moduleNameMapper always
// routes it to the __mocks__ stub synchronously.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedInspection } from '../types';
import { StorageKeys } from '../repositories/keys';

function getSyncApiUrl(): string | undefined {
  return (process.env.EXPO_PUBLIC_SYNC_API_URL ?? '').trim() || undefined;
}

export interface SyncQueueItem {
  inspection: SavedInspection;
  queuedAt: string;
  attempts: number;
}

export interface SyncStatus {
  pendingCount: number;
  lastSyncAt: Date | null;
  isOnline: boolean;
}

// ── Queue helpers ──────────────────────────────────────────────────────────────

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

// ── Network check ──────────────────────────────────────────────────────────────

async function checkOnline(): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const NetInfo = (require('@react-native-community/netinfo') as {
      default: {
        fetch: () => Promise<{
          isConnected: boolean | null;
          isInternetReachable: boolean | null;
        }>;
      };
    }).default;
    const state = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable !== false;
  } catch {
    return true;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function enqueue(inspection: SavedInspection): Promise<void> {
  const queue = await readQueue();
  const idx = queue.findIndex(q => q.inspection.id === inspection.id);

  const item: SyncQueueItem = {
    inspection,
    queuedAt: new Date().toISOString(),
    attempts: 0,
  };

  if (idx >= 0) {
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
      } else {
        remaining.push({ ...item, attempts: item.attempts + 1 });
      }
    } catch {
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

export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(StorageKeys.SYNC_QUEUE);
}

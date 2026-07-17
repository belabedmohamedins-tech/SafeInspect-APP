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
//     On network error or non-2xx the item stays in the queue for the next
//     run.
//   - If SYNC_API_URL is not configured the service is a silent no-op so
//     development / Expo Go usage is unaffected.
//
// Tier-2 change:
//   - flush() now attaches the server JWT Bearer token via apiClient.
//     The apiClient handles silent token refresh on 401 automatically.
//     If no server session exists (offline / not logged in) the sync
//     falls back gracefully — items remain in the queue.
//
// ⚠️  ENV ACCESS — do NOT change `process.env[KEY]` back to `process.env.KEY`:
//   babel-preset-expo ships babel-plugin-transform-inline-environment-variables
//   which replaces the static form `process.env.EXPO_PUBLIC_*` with the
//   LITERAL value of that variable at Babel/Jest compile time.  Because the
//   variable is not set when Jest transforms this module the plugin writes
//   `undefined` into the compiled JS and runtime mutations are invisible.
//   Using a computed key `process.env[KEY]` is opaque to the plugin and is
//   read from the live process.env object at call time.
//
// ⚠️  FETCH — keep `globalThis.fetch()` (not bare `fetch()`):
//   Babel captures the bare identifier at module-load time; globalThis.fetch
//   is a property lookup resolved at call time, ensuring the jest.fn() mock
//   assigned in beforeEach is always visible.
//
// ⚠️  NETINFO — keep `require()` (not `import`):
//   Dynamic require() is resolved through moduleNameMapper at call time;
//   a static import would be hoisted and cached before mocks are wired.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedInspection } from '../types';
import { StorageKeys } from '../repositories/keys';
import { apiClient } from './apiClient';

// Computed key — defeats babel-plugin-transform-inline-environment-variables.
const SYNC_API_URL_KEY = 'EXPO_PUBLIC_SYNC_API_URL';

function getSyncApiUrl(): string | undefined {
  return (process.env[SYNC_API_URL_KEY] ?? '').trim() || undefined;
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

// ── Queue helpers ─────────────────────────────────────────────────────────────────

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

// ── Network check ─────────────────────────────────────────────────────────────────

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

// ── Public API ───────────────────────────────────────────────────────────────────

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
    // Use updatedAt for precise timestamp comparison when available;
    // fall back to date (date-only string) then empty string.
    const existingTs = (existing as any).updatedAt ?? existing.date ?? '';
    const incomingTs = (inspection as any).updatedAt ?? inspection.date ?? '';
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
      // apiClient attaches the Bearer token and handles silent 401 refresh.
      // Falls back to a plain unauthenticated POST if no server session exists
      // (same behaviour as before Tier-2 — server will return 401 and the
      // item stays in the queue until the user logs in).
      // FIX (G13/Phase5): server route is registered at POST /sync (not /sync/inspections).
      const res = await apiClient('/sync', {
        method: 'POST',
        body:   JSON.stringify(item.inspection),
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

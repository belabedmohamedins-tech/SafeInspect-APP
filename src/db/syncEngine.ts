// src/db/syncEngine.ts
//
// Background sync scheduler.
//
// Wraps SyncService.flush() in a setInterval and also fires a flush
// immediately when the device transitions from offline → online.
//
// Usage (in _layout.tsx):
//
//   const stopSync = startSyncScheduler(30_000);   // flush every 30 s
//   return () => stopSync();                        // cleanup on unmount
//
// Design constraints:
//   - Silent no-op when EXPO_PUBLIC_SYNC_API_URL is not set so Expo Go /
//     development builds are unaffected (same contract as SyncService).
//   - The NetInfo listener is defensive: if @react-native-community/netinfo
//     is not installed the scheduler falls back to interval-only mode.
//   - All flush() errors are caught and logged — a sync failure must never
//     crash the app.
//
// NOTE: Both SyncService and NetInfo are required lazily (require) so the
// Jest moduleNameMapper-provided stubs are always resolved from the live
// registry at call time — no jest.resetModules() needed in tests.

/** Returns true when a sync endpoint is configured. */
function hasSyncUrl(): boolean {
  return Boolean((process.env.EXPO_PUBLIC_SYNC_API_URL ?? '').trim());
}

async function safeFlush(): Promise<void> {
  if (!hasSyncUrl()) return;
  try {
    // Lazy require — resolved against the live Jest module registry so
    // jest.mock('../services/SyncService') is always honoured.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { flush } = require('../services/SyncService') as typeof import('../services/SyncService');
    const synced = await flush();
    if (synced > 0) {
      console.info(`[SafeInspect] Sync: ${synced} inspection(s) uploaded.`);
    }
  } catch (err) {
    console.warn('[SafeInspect] Sync flush error (non-fatal):', err);
  }
}

/**
 * Start the background sync scheduler.
 *
 * @param intervalMs  Milliseconds between scheduled flush attempts.
 *                    Defaults to 30 000 (30 seconds).
 * @returns           A cleanup function — call it in useEffect cleanup or
 *                    on app unmount to stop the scheduler and remove the
 *                    network listener.
 */
export function startSyncScheduler(intervalMs = 30_000): () => void {
  if (!hasSyncUrl()) {
    return () => {};
  }

  // ── 1. Interval-based flush ────────────────────────────────────────────────
  const timer = setInterval(safeFlush, intervalMs);

  // ── 2. Connectivity-triggered flush ───────────────────────────────────────
  //    Fire a flush as soon as the device comes back online so that
  //    inspections queued while offline are uploaded without waiting for
  //    the next interval tick.
  //
  //    Lazy require() (not dynamic import()) keeps this inside the Jest
  //    module registry so moduleNameMapper stubs are resolved correctly and
  //    the __setAddEventListener() spy injected in beforeEach is in place
  //    by the time this code runs.
  let unsubscribeNetInfo: (() => void) | undefined;
  let wasOnline: boolean | null = null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const NetInfo = require('@react-native-community/netinfo') as {
      default: {
        addEventListener: (
          cb: (state: { isConnected: boolean | null; isInternetReachable: boolean | null }) => void
        ) => () => void;
      };
    };

    unsubscribeNetInfo = NetInfo.default.addEventListener((state) => {
      const isOnline =
        state.isConnected === true && state.isInternetReachable !== false;

      // Transition: offline → online
      if (wasOnline === false && isOnline) {
        safeFlush();
      }
      wasOnline = isOnline;
    });
  } catch {
    // NetInfo not available — interval-only mode.
  }

  // ── 3. Cleanup ────────────────────────────────────────────────────────────
  return () => {
    clearInterval(timer);
    unsubscribeNetInfo?.();
  };
}

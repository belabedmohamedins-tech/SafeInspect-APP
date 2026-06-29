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
// NOTE: SyncService is required lazily inside safeFlush() rather than via a
// top-level static import.  A static import is compiled by Babel/tsc into a
// binding that is captured at module-load time.  When tests call
// jest.resetModules() and re-register the SyncService mock AFTER requiring
// this module, the static binding would already point at the wrong (real)
// module.  A lazy require() call resolves the mock registry at call time,
// so jest.resetModules() + mock re-registration works as expected.

/** Returns true when a sync endpoint is configured. */
function hasSyncUrl(): boolean {
  return Boolean((process.env.EXPO_PUBLIC_SYNC_API_URL ?? '').trim());
}

async function safeFlush(): Promise<void> {
  if (!hasSyncUrl()) return;
  try {
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
    // No endpoint configured — return a no-op cleanup.
    return () => {};
  }

  // ── 1. Interval-based flush ──────────────────────────────────────────────────
  const timer = setInterval(safeFlush, intervalMs);

  // ── 2. Connectivity-triggered flush ───────────────────────────────────────────
  //    Fire a flush as soon as the device comes back online so that
  //    inspections queued while offline are uploaded without waiting for
  //    the next interval tick.
  let unsubscribeNetInfo: (() => void) | undefined;
  let wasOnline: boolean | null = null;

  import('@react-native-community/netinfo')
    .then((NetInfo) => {
      unsubscribeNetInfo = NetInfo.default.addEventListener((state) => {
        const isOnline =
          state.isConnected === true && state.isInternetReachable !== false;

        // Transition: offline → online
        if (wasOnline === false && isOnline) {
          safeFlush();
        }
        wasOnline = isOnline;
      });
    })
    .catch(() => {
      // NetInfo not available — interval-only mode, no action needed.
    });

  // ── 3. Cleanup ───────────────────────────────────────────────────────────────
  return () => {
    clearInterval(timer);
    unsubscribeNetInfo?.();
  };
}

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
// ⚠️  ENV ACCESS — do NOT change `process.env[KEY]` back to
//    `process.env.EXPO_PUBLIC_SYNC_API_URL`:
//    babel-preset-expo ships babel-plugin-transform-inline-environment-variables
//    which replaces the static dot-notation form with the LITERAL value of
//    that variable at Babel/Jest compile time.  Because the variable is not
//    set when Jest transforms this module the plugin writes `undefined` into
//    the compiled JS and any runtime process.env mutation is invisible.
//    Using a computed key `process.env[KEY]` is opaque to the plugin and
//    reads the live process.env object at call time.
//
// ⚠️  IMPORTS — keep require() (not import) for SyncService and NetInfo:
//    Dynamic require() is resolved through moduleNameMapper at call time;
//    a static import would be hoisted and cached before mocks are wired.

// Computed key — defeats babel-plugin-transform-inline-environment-variables.
const SYNC_API_URL_KEY = 'EXPO_PUBLIC_SYNC_API_URL';

/** Returns true when a sync endpoint is configured. */
function hasSyncUrl(): boolean {
  return Boolean((process.env[SYNC_API_URL_KEY] ?? '').trim());
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

      // Transition: offline → online only
      if (wasOnline === false && isOnline) {
        safeFlush();
      }
      wasOnline = isOnline;
    });
  } catch /* istanbul ignore next */ {
    // NetInfo not available — interval-only mode.
  }

  // ── 3. Cleanup ────────────────────────────────────────────────────────────
  return () => {
    clearInterval(timer);
    // istanbul ignore next -- optional chaining on unsubscribeNetInfo
    unsubscribeNetInfo?.();
  };
}

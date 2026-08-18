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
//   - Also a no-op when the user has disabled auto-sync via Settings
//     (SettingsRepository.getAll() key 'autoSync' === 'false'). W72 fix.
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
// ⚠️  IMPORTS — keep require() (not import) for SyncService, SettingsRepository,
//    and NetInfo:
//    Dynamic require() is resolved through moduleNameMapper at call time;
//    a static import would be hoisted and cached before mocks are wired.

const SYNC_API_URL_KEY = 'EXPO_PUBLIC_SYNC_API_URL';

function hasSyncUrl(): boolean {
  return Boolean((process.env[SYNC_API_URL_KEY] ?? '').trim());
}

/**
 * W72: reads the autoSync setting at call-time (not cached).
 * Uses getAll() to read raw key→value pairs so we avoid the
 * zero-argument get() signature constraint on SettingsRepository.
 */
async function isAutoSyncEnabled(): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { SettingsRepository } = require('../repositories/SettingsRepository') as
      typeof import('../repositories/SettingsRepository');
    const all = await SettingsRepository.getAll();
    const raw = (all as Record<string, string>)['autoSync'];
    // Default true when unset — preserves behaviour for existing installs.
    if (raw === undefined) return true;
    return raw !== 'false' && raw !== '0' && raw !== '';
  } catch {
    return true;
  }
}

async function safeFlush(): Promise<void> {
  if (!hasSyncUrl()) return;
  // W72: honour the user's autoSync preference.
  const enabled = await isAutoSyncEnabled();
  if (!enabled) return;
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

export function startSyncScheduler(intervalMs = 30_000): () => void {
  if (!hasSyncUrl()) {
    return () => {};
  }

  const timer = setInterval(safeFlush, intervalMs);

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

      if (wasOnline === false && isOnline) {
        safeFlush();
      }
      wasOnline = isOnline;
    });
  } catch {
    /* istanbul ignore next -- NetInfo not available — interval-only mode */
  }

  return () => {
    clearInterval(timer);
    unsubscribeNetInfo?.(); // istanbul ignore next
  };
}

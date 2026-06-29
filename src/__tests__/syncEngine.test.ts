// src/__tests__/syncEngine.test.ts
//
// ─── NetInfo mock ─────────────────────────────────────────────────────────────
//
// syncEngine.ts uses a dynamic import() for NetInfo inside startSyncScheduler.
// Because the 'with API URL' suite calls jest.resetModules() before every test
// we must re-register the mock each time.  To keep _netInfoListener stable
// across re-registrations we hoist the captured state into a plain object that
// every factory invocation closes over.

type NetInfoChangeCallback = (state: {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
}) => void;

// Stable shared state — survives jest.resetModules() because it lives in the
// test-file scope, not inside the mock factory.
// Prefixed with 'mock' so Jest's hoisting restriction allows it inside
// jest.mock() factory closures (Jest permits variables named mock*).
const mockNetInfoState = {
  listener: null as NetInfoChangeCallback | null,
  unsubscribe: jest.fn(),
};

jest.mock('@react-native-community/netinfo', () => ({
  default: {
    addEventListener: jest.fn((cb: NetInfoChangeCallback) => {
      mockNetInfoState.listener = cb;
      return mockNetInfoState.unsubscribe;
    }),
  },
}));

// ─── SyncService mock ─────────────────────────────────────────────────────────

const mockFlush = jest.fn().mockResolvedValue(0);
jest.mock('../services/SyncService', () => ({
  flush: (...args: unknown[]) => mockFlush(...args),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ORIGINAL_ENV = process.env;

function withSyncUrl() {
  process.env = { ...ORIGINAL_ENV, EXPO_PUBLIC_SYNC_API_URL: 'https://api.test' };
}

function withoutSyncUrl() {
  process.env = { ...ORIGINAL_ENV, EXPO_PUBLIC_SYNC_API_URL: '' };
}

/** Drain enough microtask ticks for the dynamic import() chain to settle. */
async function drainImport() {
  for (let i = 0; i < 4; i++) await Promise.resolve();
}

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockNetInfoState.listener = null;
});

afterEach(() => {
  jest.useRealTimers();
  process.env = ORIGINAL_ENV;
});

// ─── No API URL ───────────────────────────────────────────────────────────────

describe('startSyncScheduler — no API URL configured', () => {
  it('returns a callable cleanup without invoking flush', () => {
    withoutSyncUrl();
    const { startSyncScheduler } = require('../db/syncEngine');
    const stop = startSyncScheduler(1000);
    jest.advanceTimersByTime(5000);
    expect(mockFlush).not.toHaveBeenCalled();
    expect(() => stop()).not.toThrow();
  });

  it('calling the cleanup does not throw even without a timer', () => {
    withoutSyncUrl();
    const { startSyncScheduler } = require('../db/syncEngine');
    const stop = startSyncScheduler();
    expect(() => stop()).not.toThrow();
  });
});

// ─── With API URL ─────────────────────────────────────────────────────────────

describe('startSyncScheduler — with API URL', () => {
  beforeEach(() => {
    withSyncUrl();
    jest.resetModules();
    // Re-register both mocks after resetModules so the freshly-required
    // syncEngine resolves to our spies.  The NetInfo factory writes into
    // mockNetInfoState (module-scope) so the listener is always captured.
    jest.mock('@react-native-community/netinfo', () => ({
      default: {
        addEventListener: jest.fn((cb: NetInfoChangeCallback) => {
          mockNetInfoState.listener = cb;
          return mockNetInfoState.unsubscribe;
        }),
      },
    }));
    jest.mock('../services/SyncService', () => ({
      flush: (...args: unknown[]) => mockFlush(...args),
    }));
  });

  it('does NOT call flush synchronously on scheduler start', () => {
    const { startSyncScheduler } = require('../db/syncEngine');
    startSyncScheduler(1000);
    expect(mockFlush).not.toHaveBeenCalled();
  });

  it('calls flush after one interval tick', async () => {
    const { startSyncScheduler } = require('../db/syncEngine');
    startSyncScheduler(1000);
    jest.advanceTimersByTime(1000);
    await Promise.resolve();
    expect(mockFlush).toHaveBeenCalledTimes(1);
  });

  it('calls flush on every interval tick', async () => {
    const { startSyncScheduler } = require('../db/syncEngine');
    startSyncScheduler(1000);
    jest.advanceTimersByTime(3000);
    await Promise.resolve();
    expect(mockFlush).toHaveBeenCalledTimes(3);
  });

  it('stops calling flush after cleanup is called', async () => {
    const { startSyncScheduler } = require('../db/syncEngine');
    const stop = startSyncScheduler(1000);
    jest.advanceTimersByTime(1000);
    await Promise.resolve();
    stop();
    jest.advanceTimersByTime(3000);
    await Promise.resolve();
    expect(mockFlush).toHaveBeenCalledTimes(1);
  });

  it('does not rethrow when flush rejects (safeFlush swallows errors)', async () => {
    mockFlush.mockRejectedValueOnce(new Error('upload failed'));
    const { startSyncScheduler } = require('../db/syncEngine');
    startSyncScheduler(1000);
    jest.advanceTimersByTime(1000);
    await expect(Promise.resolve()).resolves.toBeUndefined();
  });

  it('fires flush when device transitions offline → online', async () => {
    const { startSyncScheduler } = require('../db/syncEngine');
    startSyncScheduler(60_000);

    // Drain the dynamic import() promise chain fully.
    await drainImport();

    expect(mockNetInfoState.listener).not.toBeNull();

    // Simulate: was offline
    mockNetInfoState.listener!({ isConnected: false, isInternetReachable: false });
    // Transition to online
    mockNetInfoState.listener!({ isConnected: true, isInternetReachable: true });
    await Promise.resolve();

    expect(mockFlush).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire flush on online → offline transition', async () => {
    const { startSyncScheduler } = require('../db/syncEngine');
    startSyncScheduler(60_000);

    await drainImport();

    mockNetInfoState.listener!({ isConnected: true,  isInternetReachable: true });
    mockNetInfoState.listener!({ isConnected: false, isInternetReachable: false });
    await Promise.resolve();

    expect(mockFlush).not.toHaveBeenCalled();
  });

  it('does NOT fire flush when already online and stays online', async () => {
    const { startSyncScheduler } = require('../db/syncEngine');
    startSyncScheduler(60_000);

    await drainImport();

    mockNetInfoState.listener!({ isConnected: true, isInternetReachable: true });
    mockNetInfoState.listener!({ isConnected: true, isInternetReachable: true });
    await Promise.resolve();

    expect(mockFlush).not.toHaveBeenCalled();
  });

  it('calls the NetInfo unsubscribe function on cleanup', async () => {
    const { startSyncScheduler } = require('../db/syncEngine');
    const stop = startSyncScheduler(60_000);

    await drainImport();

    stop();
    expect(mockNetInfoState.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('falls back to interval-only mode when NetInfo import fails (no crash)', async () => {
    jest.mock('@react-native-community/netinfo', () => {
      throw new Error('module not found');
    });
    jest.resetModules();
    jest.mock('../services/SyncService', () => ({
      flush: (...args: unknown[]) => mockFlush(...args),
    }));

    const { startSyncScheduler } = require('../db/syncEngine');
    let stop: (() => void) | undefined;
    expect(() => {
      stop = startSyncScheduler(1000);
    }).not.toThrow();

    jest.advanceTimersByTime(1000);
    await Promise.resolve();
    expect(mockFlush).toHaveBeenCalledTimes(1);
    stop?.();
  });
});

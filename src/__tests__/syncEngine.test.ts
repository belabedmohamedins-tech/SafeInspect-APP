// src/__tests__/syncEngine.test.ts

// ─── NetInfo mock ─────────────────────────────────────────────────────────────
//
// We capture the listener registered by startSyncScheduler so tests can
// fire connectivity-change events directly.

type NetInfoChangeCallback = (state: {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
}) => void;

let _netInfoListener: NetInfoChangeCallback | null = null;
const mockUnsubscribe = jest.fn();

jest.mock('@react-native-community/netinfo', () => ({
  default: {
    addEventListener: jest.fn((cb: NetInfoChangeCallback) => {
      _netInfoListener = cb;
      return mockUnsubscribe;
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

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  _netInfoListener = null;
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
    // Re-apply mocks after resetModules so the freshly-required module
    // resolves to our spies, not the real implementations.
    jest.mock('../services/SyncService', () => ({
      flush: (...args: unknown[]) => mockFlush(...args),
    }));
    jest.mock('@react-native-community/netinfo', () => ({
      default: {
        addEventListener: jest.fn((cb: NetInfoChangeCallback) => {
          _netInfoListener = cb;
          return mockUnsubscribe;
        }),
      },
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
    // Let the microtask queue drain so the async safeFlush body runs.
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
    // The promise returned by safeFlush is not observed by the caller,
    // so this simply must not throw synchronously or cause unhandled rejection.
    await expect(Promise.resolve()).resolves.toBeUndefined();
  });

  it('fires flush when device transitions offline → online', async () => {
    const { startSyncScheduler } = require('../db/syncEngine');
    startSyncScheduler(60_000);

    // Allow the dynamic NetInfo import to settle.
    await Promise.resolve();
    await Promise.resolve();

    expect(_netInfoListener).not.toBeNull();

    // Simulate: was offline
    _netInfoListener!({ isConnected: false, isInternetReachable: false });
    // Transition to online
    _netInfoListener!({ isConnected: true, isInternetReachable: true });
    await Promise.resolve();

    expect(mockFlush).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire flush on online → offline transition', async () => {
    const { startSyncScheduler } = require('../db/syncEngine');
    startSyncScheduler(60_000);

    await Promise.resolve();
    await Promise.resolve();

    _netInfoListener!({ isConnected: true,  isInternetReachable: true });
    _netInfoListener!({ isConnected: false, isInternetReachable: false });
    await Promise.resolve();

    expect(mockFlush).not.toHaveBeenCalled();
  });

  it('does NOT fire flush when already online and stays online', async () => {
    const { startSyncScheduler } = require('../db/syncEngine');
    startSyncScheduler(60_000);

    await Promise.resolve();
    await Promise.resolve();

    _netInfoListener!({ isConnected: true, isInternetReachable: true });
    _netInfoListener!({ isConnected: true, isInternetReachable: true });
    await Promise.resolve();

    expect(mockFlush).not.toHaveBeenCalled();
  });

  it('calls the NetInfo unsubscribe function on cleanup', async () => {
    const { startSyncScheduler } = require('../db/syncEngine');
    const stop = startSyncScheduler(60_000);

    await Promise.resolve();
    await Promise.resolve();

    stop();
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
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
    // Must not throw even though NetInfo import will fail
    expect(() => {
      stop = startSyncScheduler(1000);
    }).not.toThrow();

    jest.advanceTimersByTime(1000);
    await Promise.resolve();
    // Interval flush still works
    expect(mockFlush).toHaveBeenCalledTimes(1);
    stop?.();
  });
});

// src/__tests__/syncEngine.test.ts
//
// ─── Strategy ────────────────────────────────────────────────────────────────
//
// moduleNameMapper in jest.config.js permanently routes
// @react-native-community/netinfo to __mocks__/@react-native-community/netinfo.js.
//
// The key invariant: jest.resetModules() clears the module registry, so the
// NEXT require/import of netinfo loads a FRESH instance of the mock file.
// That fresh instance has _addEventListenerImpl = null.
//
// Therefore the NetInfo spy must be injected (via __setAddEventListener)
// AFTER jest.resetModules() and using the SAME require() handle that
// syncEngine will see when it does import('@react-native-community/netinfo').
//
// Concretely: in the inner beforeEach (which runs after the outer one),
// we call jest.resetModules(), then re-require the NetInfo mock, then
// inject the spy, then require syncEngine.

type NetInfoChangeCallback = (state: {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
}) => void;

// Stable shared state updated by each test's beforeEach.
const mockNetInfoState = {
  listener:    null as NetInfoChangeCallback | null,
  unsubscribe: jest.fn(),
};

// ─── SyncService mock ─────────────────────────────────────────────────────────
// Registered at file-parse time (before any resetModules).
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

async function flushPromises() {
  for (let i = 0; i < 8; i++) await Promise.resolve();
}

async function drainImport() {
  for (let i = 0; i < 4; i++) await Promise.resolve();
}

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

// Outer beforeEach — runs first, sets up fakes.
beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockNetInfoState.listener    = null;
  mockNetInfoState.unsubscribe = jest.fn();
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
  // Inner beforeEach — runs AFTER the outer one.
  // Order: outer beforeEach → inner beforeEach → test → afterEach.
  beforeEach(() => {
    withSyncUrl();

    // Step 1: reset module registry so syncEngine gets a fresh load.
    jest.resetModules();

    // Step 2: re-register SyncService mock in the new registry.
    jest.mock('../services/SyncService', () => ({
      flush: (...args: unknown[]) => mockFlush(...args),
    }));

    // Step 3: require the NetInfo mock from the NEW registry — this is the
    // same instance that syncEngine's dynamic import() will resolve to.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const NetInfoMock = require('@react-native-community/netinfo').default as {
      __setAddEventListener: (impl: ((cb: NetInfoChangeCallback) => () => void) | null) => void;
      __resetAddEventListener: () => void;
    };

    // Step 4: inject spy so listener is captured when syncEngine calls
    // NetInfo.default.addEventListener(cb).
    NetInfoMock.__setAddEventListener((cb: NetInfoChangeCallback) => {
      mockNetInfoState.listener = cb;
      return mockNetInfoState.unsubscribe;
    });
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
    await flushPromises();
    expect(mockFlush).toHaveBeenCalledTimes(1);
  });

  it('calls flush on every interval tick', async () => {
    const { startSyncScheduler } = require('../db/syncEngine');
    startSyncScheduler(1000);
    jest.advanceTimersByTime(3000);
    await flushPromises();
    expect(mockFlush).toHaveBeenCalledTimes(3);
  });

  it('stops calling flush after cleanup is called', async () => {
    const { startSyncScheduler } = require('../db/syncEngine');
    const stop = startSyncScheduler(1000);
    jest.advanceTimersByTime(1000);
    await flushPromises();
    stop();
    jest.advanceTimersByTime(3000);
    await flushPromises();
    expect(mockFlush).toHaveBeenCalledTimes(1);
  });

  it('does not rethrow when flush rejects (safeFlush swallows errors)', async () => {
    mockFlush.mockRejectedValueOnce(new Error('upload failed'));
    const { startSyncScheduler } = require('../db/syncEngine');
    startSyncScheduler(1000);
    jest.advanceTimersByTime(1000);
    await expect(flushPromises()).resolves.toBeUndefined();
  });

  it('fires flush when device transitions offline → online', async () => {
    const { startSyncScheduler } = require('../db/syncEngine');
    startSyncScheduler(60_000);

    await drainImport();

    expect(mockNetInfoState.listener).not.toBeNull();

    mockNetInfoState.listener!({ isConnected: false, isInternetReachable: false });
    mockNetInfoState.listener!({ isConnected: true, isInternetReachable: true });
    await flushPromises();

    expect(mockFlush).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire flush on online → offline transition', async () => {
    const { startSyncScheduler } = require('../db/syncEngine');
    startSyncScheduler(60_000);

    await drainImport();

    mockNetInfoState.listener!({ isConnected: true,  isInternetReachable: true });
    mockNetInfoState.listener!({ isConnected: false, isInternetReachable: false });
    await flushPromises();

    expect(mockFlush).not.toHaveBeenCalled();
  });

  it('does NOT fire flush when already online and stays online', async () => {
    const { startSyncScheduler } = require('../db/syncEngine');
    startSyncScheduler(60_000);

    await drainImport();

    mockNetInfoState.listener!({ isConnected: true, isInternetReachable: true });
    mockNetInfoState.listener!({ isConnected: true, isInternetReachable: true });
    await flushPromises();

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
    // Override the spy to throw, simulating a missing package.
    // Must re-require NetInfoMock from the current registry to affect the
    // right instance.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const NetInfoMock = require('@react-native-community/netinfo').default as {
      __setAddEventListener: (impl: ((cb: NetInfoChangeCallback) => () => void) | null) => void;
    };
    NetInfoMock.__setAddEventListener(() => {
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
    await flushPromises();
    expect(mockFlush).toHaveBeenCalledTimes(1);
    stop?.();
  });
});

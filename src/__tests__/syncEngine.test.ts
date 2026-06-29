// src/__tests__/syncEngine.test.ts
//
// ─── NetInfo mock ─────────────────────────────────────────────────────────────
//
// moduleNameMapper in jest.config.js permanently routes
// @react-native-community/netinfo to __mocks__/@react-native-community/netinfo.js.
// jest.mock() factory overrides do NOT win over moduleNameMapper after
// jest.resetModules() — the mapper file always loads.
//
// Strategy: inject per-test spies via NetInfo.__setAddEventListener() which
// the __mocks__ file delegates to when set.  This survives resetModules()
// because the __mocks__ module itself is persistent (mapper always returns it)
// and _addEventListenerImpl is a module-level variable inside it.

type NetInfoChangeCallback = (state: {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
}) => void;

// Stable shared state — survives jest.resetModules().
const mockNetInfoState = {
  listener:    null as NetInfoChangeCallback | null,
  unsubscribe: jest.fn(),
};

// We do NOT call jest.mock() for netinfo here — moduleNameMapper handles it.
// Instead we inject our spy via __setAddEventListener in beforeEach.

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

async function flushPromises() {
  for (let i = 0; i < 8; i++) await Promise.resolve();
}

async function drainImport() {
  for (let i = 0; i < 4; i++) await Promise.resolve();
}

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-var-requires
const NetInfoMock = require('@react-native-community/netinfo').default as {
  __setAddEventListener: (impl: ((cb: NetInfoChangeCallback) => () => void) | null) => void;
  __resetAddEventListener: () => void;
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockNetInfoState.listener    = null;
  mockNetInfoState.unsubscribe = jest.fn();
  // Inject our spy into the persistent __mocks__ module.
  NetInfoMock.__setAddEventListener((cb: NetInfoChangeCallback) => {
    mockNetInfoState.listener = cb;
    return mockNetInfoState.unsubscribe;
  });
});

afterEach(() => {
  jest.useRealTimers();
  process.env = ORIGINAL_ENV;
  NetInfoMock.__resetAddEventListener();
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
    // Re-register SyncService mock after resetModules.
    jest.mock('../services/SyncService', () => ({
      flush: (...args: unknown[]) => mockFlush(...args),
    }));
    // No need to re-register NetInfo — __setAddEventListener injected in
    // the outer beforeEach persists in the __mocks__ module-level variable.
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
    // Override the addEventListener spy to throw, simulating missing package.
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

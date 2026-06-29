// src/__tests__/syncEngine.test.ts
//
// Strategy: NO jest.resetModules() anywhere.
//
// Both SyncService and NetInfo are mocked once at file-parse time.
// process.env is mutated per-test; syncEngine reads it lazily so the
// change is visible without a module reload.
//
// NetInfo.addEventListener is a plain function in the mock file so
// jest.clearAllMocks() cannot wipe its body.  We inject/reset the
// addEventListener spy via __setAddEventListener in beforeEach/afterEach.

type NetInfoChangeCallback = (state: {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
}) => void;

// ─── Stable mocks (registered once at parse time) ────────────────────────────

const mockFlush = jest.fn().mockResolvedValue(0);
jest.mock('../services/SyncService', () => ({
  flush: (...args: unknown[]) => mockFlush(...args),
}));

// ─── NetInfo spy state ────────────────────────────────────────────────────────

const mockNetInfoState = {
  listener:    null as NetInfoChangeCallback | null,
  unsubscribe: jest.fn(),
};

// Grab the stable NetInfo mock instance once at module scope.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const NetInfoMock = require('@react-native-community/netinfo').default as {
  __setAddEventListener:   (impl: ((cb: NetInfoChangeCallback) => () => void) | null) => void;
  __resetAddEventListener: () => void;
};

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

beforeEach(() => {
  jest.clearAllMocks();
  // Re-arm mockFlush — clearAllMocks() wipes mockResolvedValue(0).
  mockFlush.mockResolvedValue(0);
  jest.useFakeTimers();
  mockNetInfoState.listener    = null;
  mockNetInfoState.unsubscribe = jest.fn();
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
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { startSyncScheduler } = require('../db/syncEngine');
    const stop = startSyncScheduler(1000);
    jest.advanceTimersByTime(5000);
    expect(mockFlush).not.toHaveBeenCalled();
    expect(() => stop()).not.toThrow();
  });

  it('calling the cleanup does not throw even without a timer', () => {
    withoutSyncUrl();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { startSyncScheduler } = require('../db/syncEngine');
    const stop = startSyncScheduler();
    expect(() => stop()).not.toThrow();
  });
});

// ─── With API URL ─────────────────────────────────────────────────────────────

describe('startSyncScheduler — with API URL', () => {
  beforeEach(() => {
    withSyncUrl();
  });

  it('does NOT call flush synchronously on scheduler start', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { startSyncScheduler } = require('../db/syncEngine');
    startSyncScheduler(1000);
    expect(mockFlush).not.toHaveBeenCalled();
  });

  it('calls flush after one interval tick', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { startSyncScheduler } = require('../db/syncEngine');
    startSyncScheduler(1000);
    jest.advanceTimersByTime(1000);
    await flushPromises();
    expect(mockFlush).toHaveBeenCalledTimes(1);
  });

  it('calls flush on every interval tick', async () => {
    // eslint-disable-next-line @typescript-eslant/no-var-requires
    const { startSyncScheduler } = require('../db/syncEngine');
    startSyncScheduler(1000);
    jest.advanceTimersByTime(3000);
    await flushPromises();
    expect(mockFlush).toHaveBeenCalledTimes(3);
  });

  it('stops calling flush after cleanup is called', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
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
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { startSyncScheduler } = require('../db/syncEngine');
    startSyncScheduler(1000);
    jest.advanceTimersByTime(1000);
    await expect(flushPromises()).resolves.toBeUndefined();
  });

  it('fires flush when device transitions offline → online', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { startSyncScheduler } = require('../db/syncEngine');
    startSyncScheduler(60_000);

    await drainImport();

    expect(mockNetInfoState.listener).not.toBeNull();

    mockNetInfoState.listener!({ isConnected: false, isInternetReachable: false });
    mockNetInfoState.listener!({ isConnected: true,  isInternetReachable: true });
    await flushPromises();

    expect(mockFlush).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire flush on online → offline transition', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { startSyncScheduler } = require('../db/syncEngine');
    startSyncScheduler(60_000);

    await drainImport();

    mockNetInfoState.listener!({ isConnected: true,  isInternetReachable: true });
    mockNetInfoState.listener!({ isConnected: false, isInternetReachable: false });
    await flushPromises();

    expect(mockFlush).not.toHaveBeenCalled();
  });

  it('does NOT fire flush when already online and stays online', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { startSyncScheduler } = require('../db/syncEngine');
    startSyncScheduler(60_000);

    await drainImport();

    mockNetInfoState.listener!({ isConnected: true, isInternetReachable: true });
    mockNetInfoState.listener!({ isConnected: true, isInternetReachable: true });
    await flushPromises();

    expect(mockFlush).not.toHaveBeenCalled();
  });

  it('calls the NetInfo unsubscribe function on cleanup', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { startSyncScheduler } = require('../db/syncEngine');
    const stop = startSyncScheduler(60_000);

    await drainImport();

    stop();
    expect(mockNetInfoState.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('falls back to interval-only mode when NetInfo import fails (no crash)', async () => {
    NetInfoMock.__setAddEventListener(() => {
      throw new Error('module not found');
    });

    // eslint-disable-next-line @typescript-eslint/no-var-requires
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

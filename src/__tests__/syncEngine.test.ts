// src/__tests__/syncEngine.test.ts
//
// Tests for startSyncScheduler and the W72 autoSync guard.
//
// W89: replaced jest.runAllTimersAsync() with jest.advanceTimersByTimeAsync(intervalMs).
//   runAllTimersAsync() runs ALL pending timers including the repeating setInterval
//   recursively until Jest aborts with "infinite loop" after 100 000 ticks.
//   advanceTimersByTimeAsync(ms) advances the clock by exactly ms, triggering each
//   setInterval callback exactly once — correct for a single-tick assertion.

const SYNC_URL = 'https://example.com/api';
const INTERVAL_MS = 100;

jest.mock('../services/SyncService', () => ({ flush: jest.fn().mockResolvedValue(0) }));
jest.mock('../repositories/SettingsRepository', () => ({
  SettingsRepository: { get: jest.fn().mockResolvedValue(true) },
}));
jest.mock('@react-native-community/netinfo', () => ({
  default: { addEventListener: jest.fn().mockReturnValue(jest.fn()) },
}));

const { SettingsRepository } = require('../repositories/SettingsRepository');

describe('syncEngine', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    process.env = { ...originalEnv, EXPO_PUBLIC_SYNC_API_URL: SYNC_URL };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.useRealTimers();
  });

  it('returns a no-op when EXPO_PUBLIC_SYNC_API_URL is not set', () => {
    delete process.env.EXPO_PUBLIC_SYNC_API_URL;
    jest.resetModules();
    const { startSyncScheduler } = require('../db/syncEngine');
    const stop = startSyncScheduler(INTERVAL_MS);
    expect(typeof stop).toBe('function');
    stop();
  });

  it('W72: does not flush when autoSync is disabled', async () => {
    jest.resetModules();
    jest.mock('../services/SyncService', () => ({ flush: jest.fn().mockResolvedValue(0) }));
    jest.mock('../repositories/SettingsRepository', () => ({
      SettingsRepository: { get: jest.fn().mockResolvedValue(false) },
    }));
    jest.mock('@react-native-community/netinfo', () => ({
      default: { addEventListener: jest.fn().mockReturnValue(jest.fn()) },
    }));
    const { startSyncScheduler } = require('../db/syncEngine');
    const { flush: freshFlush } = require('../services/SyncService');
    const stop = startSyncScheduler(INTERVAL_MS);
    // Advance exactly one interval — fires the callback once, then stops.
    await jest.advanceTimersByTimeAsync(INTERVAL_MS);
    expect(freshFlush).not.toHaveBeenCalled();
    stop();
  });

  it('W72: flushes when autoSync is enabled', async () => {
    jest.resetModules();
    jest.mock('../services/SyncService', () => ({ flush: jest.fn().mockResolvedValue(1) }));
    jest.mock('../repositories/SettingsRepository', () => ({
      SettingsRepository: { get: jest.fn().mockResolvedValue(true) },
    }));
    jest.mock('@react-native-community/netinfo', () => ({
      default: { addEventListener: jest.fn().mockReturnValue(jest.fn()) },
    }));
    const { startSyncScheduler } = require('../db/syncEngine');
    const { flush: freshFlush } = require('../services/SyncService');
    const stop = startSyncScheduler(INTERVAL_MS);
    // Advance exactly one interval — flush must be called once.
    await jest.advanceTimersByTimeAsync(INTERVAL_MS);
    expect(freshFlush).toHaveBeenCalled();
    stop();
  });
});

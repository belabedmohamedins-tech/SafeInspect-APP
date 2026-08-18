// src/__tests__/syncEngine.test.ts
//
// Tests for startSyncScheduler and the W72 autoSync guard.

const SYNC_URL = 'https://example.com/api';

jest.mock('../services/SyncService', () => ({ flush: jest.fn().mockResolvedValue(0) }));
jest.mock('../repositories/SettingsRepository', () => ({
  SettingsRepository: { get: jest.fn().mockResolvedValue(true) },
}));
jest.mock('@react-native-community/netinfo', () => ({
  default: { addEventListener: jest.fn().mockReturnValue(jest.fn()) },
}));

const { SettingsRepository } = require('../repositories/SettingsRepository');
const { flush } = require('../services/SyncService');

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
    // Re-require to pick up env change
    jest.resetModules();
    const { startSyncScheduler } = require('../db/syncEngine');
    const stop = startSyncScheduler(1000);
    expect(typeof stop).toBe('function');
    stop(); // should not throw
  });

  it('W72: does not flush when autoSync is disabled', async () => {
    (SettingsRepository.get as jest.Mock).mockResolvedValue(false);
    jest.resetModules();
    // Re-apply mocks after resetModules
    jest.mock('../services/SyncService', () => ({ flush: jest.fn().mockResolvedValue(0) }));
    jest.mock('../repositories/SettingsRepository', () => ({
      SettingsRepository: { get: jest.fn().mockResolvedValue(false) },
    }));
    jest.mock('@react-native-community/netinfo', () => ({
      default: { addEventListener: jest.fn().mockReturnValue(jest.fn()) },
    }));
    const { startSyncScheduler } = require('../db/syncEngine');
    const { flush: freshFlush } = require('../services/SyncService');
    const stop = startSyncScheduler(100);
    await jest.runAllTimersAsync();
    expect(freshFlush).not.toHaveBeenCalled();
    stop();
  });

  it('W72: flushes when autoSync is enabled', async () => {
    (SettingsRepository.get as jest.Mock).mockResolvedValue(true);
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
    const stop = startSyncScheduler(100);
    await jest.runAllTimersAsync();
    expect(freshFlush).toHaveBeenCalled();
    stop();
  });
});

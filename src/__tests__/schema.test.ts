// src/__tests__/schema.test.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../repositories/keys';
import { initializeDatabase } from '../db/schema';

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

// ─── Happy path ───────────────────────────────────────────────────────────────

describe('initializeDatabase — happy path', () => {
  it('resolves without throwing when AsyncStorage is healthy', async () => {
    await expect(initializeDatabase()).resolves.toBeUndefined();
  });

  it('seeds STATS_CACHE with JSON null on a fresh install', async () => {
    await initializeDatabase();
    const raw = await AsyncStorage.getItem(StorageKeys.STATS_CACHE);
    expect(raw).toBe(JSON.stringify(null));
  });

  it('does NOT overwrite STATS_CACHE when it already exists', async () => {
    const existing = JSON.stringify({ total: 42 });
    await AsyncStorage.setItem(StorageKeys.STATS_CACHE, existing);
    await initializeDatabase();
    const raw = await AsyncStorage.getItem(StorageKeys.STATS_CACHE);
    expect(raw).toBe(existing);
  });

  it('performs the warm-up read against the INSPECTIONS key', async () => {
    const spy = jest.spyOn(AsyncStorage, 'getItem');
    await initializeDatabase();
    expect(spy).toHaveBeenCalledWith(StorageKeys.INSPECTIONS);
  });

  it('logs a console.info message on success', async () => {
    const spy = jest.spyOn(console, 'info').mockImplementation(() => {});
    await initializeDatabase();
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('[SafeInspect] Database initialised'),
    );
    spy.mockRestore();
  });
});

// ─── Failure paths ────────────────────────────────────────────────────────────

describe('initializeDatabase — failure paths', () => {
  it('rejects with a descriptive Error when the warm-up read throws', async () => {
    jest
      .spyOn(AsyncStorage, 'getItem')
      .mockRejectedValueOnce(new Error('storage unavailable'));

    await expect(initializeDatabase()).rejects.toThrow(
      /AsyncStorage warm-up failed/,
    );
  });

  it('resolves (non-fatal) when STATS_CACHE setItem throws after a successful warm-up', async () => {
    // First getItem (INSPECTIONS warm-up) succeeds.
    // Second getItem (STATS_CACHE existence check) returns null.
    // setItem (seed) throws — must NOT propagate.
    jest
      .spyOn(AsyncStorage, 'getItem')
      .mockResolvedValueOnce(null)   // INSPECTIONS warm-up → ok
      .mockResolvedValueOnce(null);  // STATS_CACHE check → not present

    jest
      .spyOn(AsyncStorage, 'setItem')
      .mockRejectedValueOnce(new Error('disk full'));

    await expect(initializeDatabase()).resolves.toBeUndefined();
  });

  it('resolves (non-fatal) when the STATS_CACHE existence check throws', async () => {
    // Warm-up succeeds, but the second getItem (STATS_CACHE) throws.
    jest
      .spyOn(AsyncStorage, 'getItem')
      .mockResolvedValueOnce(null)                              // INSPECTIONS ok
      .mockRejectedValueOnce(new Error('key read error'));      // STATS_CACHE check fails

    await expect(initializeDatabase()).resolves.toBeUndefined();
  });
});

// ─── Idempotency ──────────────────────────────────────────────────────────────

describe('initializeDatabase — idempotency', () => {
  it('can be called multiple times without error', async () => {
    await initializeDatabase();
    await initializeDatabase();
    // STATS_CACHE should still hold the seeded value, not be overwritten.
    const raw = await AsyncStorage.getItem(StorageKeys.STATS_CACHE);
    expect(raw).toBe(JSON.stringify(null));
  });
});

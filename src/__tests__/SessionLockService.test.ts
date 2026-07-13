// src/__tests__/SessionLockService.test.ts
//
// Full coverage for SessionLockService.
// Pure in-memory logic — only SettingsRepository.getAll needs mocking (L4).

import { SessionLockService } from '../services/SessionLockService';
import { SettingsRepository } from '../repositories/SettingsRepository';

jest.mock('../repositories/SettingsRepository', () => ({
  SettingsRepository: {
    getAll: jest.fn(),
  },
}));

const mockGetAll = SettingsRepository.getAll as jest.MockedFunction<
  typeof SettingsRepository.getAll
>;

// Helper: advance Date.now() by ms without touching real timers
function advanceTime(ms: number) {
  const real = Date.now();
  jest.spyOn(Date, 'now').mockReturnValue(real + ms);
}

beforeEach(() => {
  jest.restoreAllMocks();
  // Reset singleton state between tests by calling reset()
  SessionLockService.reset();
  mockGetAll.mockResolvedValue({});
});

// ─── recordActivity ──────────────────────────────────────────────────────────

describe('recordActivity', () => {
  it('refreshes lastActivityAt so shouldLock returns false', async () => {
    // Set timeout to 1 minute
    mockGetAll.mockResolvedValue({ sessionLockTimeoutMinutes: '1' });

    // Simulate 2 minutes of inactivity
    advanceTime(2 * 60 * 1000);
    expect(await SessionLockService.shouldLock()).toBe(true);

    // Record activity — resets the timer
    jest.restoreAllMocks();
    SessionLockService.recordActivity();
    mockGetAll.mockResolvedValue({ sessionLockTimeoutMinutes: '1' });
    expect(await SessionLockService.shouldLock()).toBe(false);
  });
});

// ─── markLocked / shouldLock already-locked guard ────────────────────────────

describe('markLocked', () => {
  it('prevents shouldLock from returning true again once locked', async () => {
    mockGetAll.mockResolvedValue({ sessionLockTimeoutMinutes: '1' });
    advanceTime(2 * 60 * 1000);

    SessionLockService.markLocked();
    // Even though timeout elapsed, shouldLock must be false (already locked)
    expect(await SessionLockService.shouldLock()).toBe(false);
  });
});

// ─── reset ───────────────────────────────────────────────────────────────────

describe('reset', () => {
  it('clears lockedOut flag and refreshes activity timestamp', async () => {
    mockGetAll.mockResolvedValue({ sessionLockTimeoutMinutes: '1' });

    SessionLockService.markLocked();
    advanceTime(2 * 60 * 1000);

    // Still false because lockedOut = true
    expect(await SessionLockService.shouldLock()).toBe(false);

    // Reset — clears flag and refreshes timestamp
    jest.restoreAllMocks();
    SessionLockService.reset();
    mockGetAll.mockResolvedValue({ sessionLockTimeoutMinutes: '1' });

    // Now within timeout window → should NOT lock
    expect(await SessionLockService.shouldLock()).toBe(false);
  });
});

// ─── shouldLock — timeout scenarios ─────────────────────────────────────────

describe('shouldLock', () => {
  it('returns false when elapsed < timeout', async () => {
    mockGetAll.mockResolvedValue({ sessionLockTimeoutMinutes: '5' });
    advanceTime(4 * 60 * 1000); // 4 min < 5 min
    expect(await SessionLockService.shouldLock()).toBe(false);
  });

  it('returns true when elapsed >= timeout', async () => {
    mockGetAll.mockResolvedValue({ sessionLockTimeoutMinutes: '5' });
    advanceTime(5 * 60 * 1000); // exactly 5 min
    expect(await SessionLockService.shouldLock()).toBe(true);
  });

  it('returns true when elapsed > timeout', async () => {
    mockGetAll.mockResolvedValue({ sessionLockTimeoutMinutes: '5' });
    advanceTime(10 * 60 * 1000);
    expect(await SessionLockService.shouldLock()).toBe(true);
  });

  it('returns false when timeout is 0 (disabled)', async () => {
    mockGetAll.mockResolvedValue({ sessionLockTimeoutMinutes: '0' });
    advanceTime(99 * 60 * 1000);
    expect(await SessionLockService.shouldLock()).toBe(false);
  });

  it('returns false when timeout is negative (disabled)', async () => {
    mockGetAll.mockResolvedValue({ sessionLockTimeoutMinutes: '-5' });
    advanceTime(99 * 60 * 1000);
    expect(await SessionLockService.shouldLock()).toBe(false);
  });

  it('uses DEFAULT_TIMEOUT_MS (5 min) when setting is missing', async () => {
    mockGetAll.mockResolvedValue({});

    // 4 min 59 s — just under default
    advanceTime(4 * 60 * 1000 + 59 * 1000);
    expect(await SessionLockService.shouldLock()).toBe(false);

    jest.restoreAllMocks();
    SessionLockService.reset();
    mockGetAll.mockResolvedValue({});

    // 5 min exactly — hits default
    advanceTime(5 * 60 * 1000);
    expect(await SessionLockService.shouldLock()).toBe(true);
  });

  it('uses DEFAULT_TIMEOUT_MS when setting is null', async () => {
    mockGetAll.mockResolvedValue({ sessionLockTimeoutMinutes: null as any });
    advanceTime(5 * 60 * 1000);
    expect(await SessionLockService.shouldLock()).toBe(true);
  });

  it('uses DEFAULT_TIMEOUT_MS when setting is NaN string', async () => {
    mockGetAll.mockResolvedValue({ sessionLockTimeoutMinutes: 'abc' });
    // NaN → disabled (returns 0) → false
    advanceTime(99 * 60 * 1000);
    expect(await SessionLockService.shouldLock()).toBe(false);
  });

  it('falls back to DEFAULT_TIMEOUT_MS when SettingsRepository throws', async () => {
    mockGetAll.mockRejectedValue(new Error('DB error'));
    advanceTime(5 * 60 * 1000);
    expect(await SessionLockService.shouldLock()).toBe(true);
  });

  it('falls back to DEFAULT_TIMEOUT_MS and returns false before 5 min on error', async () => {
    mockGetAll.mockRejectedValue(new Error('DB error'));
    advanceTime(4 * 60 * 1000);
    expect(await SessionLockService.shouldLock()).toBe(false);
  });
});

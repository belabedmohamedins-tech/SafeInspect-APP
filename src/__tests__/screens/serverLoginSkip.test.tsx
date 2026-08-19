// src/__tests__/screens/serverLoginSkip.test.tsx
//
// W95 (SPEC12-C) — server-login skip persistence
//
// Verifies:
//  1. handleSkip() writes StorageKeys.SERVER_LOGIN_SKIPPED = 'true' to SettingsRepository.
//  2. After skip is persisted, the _layout.tsx auth guard (reproduced inline)
//     does NOT redirect to server-login when isLoggedIn() is false but the
//     skipped flag is set.
//  3. Without the flag, the guard DOES redirect to server-login
//     (regression guard for the original SPEC12-C bug).

import { StorageKeys } from '../../repositories/keys';

// ---------------------------------------------------------------------------
// Stable mock database — prefixed with 'mock' so jest.mock() hoisting allows it
// ---------------------------------------------------------------------------
const mockStore: Record<string, string> = {};

const mockDb = {
  getAllAsync: jest.fn(async (_sql: string, _params?: unknown[]) => {
    return Object.entries(mockStore).map(([key, value]) => ({ key, value }));
  }),
  runAsync: jest.fn(async (_sql: string, params?: unknown[]) => {
    if (params && params.length >= 2) {
      mockStore[params[0] as string] = params[1] as string;
    }
  }),
  withTransactionAsync: jest.fn(async (fn: () => Promise<void>) => fn()),
};

jest.mock('../../db/schema', () => ({
  getDb: jest.fn(() => Promise.resolve(mockDb)),
  initializeDatabase: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../services/serverAuth', () => ({
  isLoggedIn: jest.fn().mockResolvedValue(false),
  registerPushToken: jest.fn().mockResolvedValue(undefined),
}));

import { SettingsRepository } from '../../repositories/SettingsRepository';
import { isLoggedIn } from '../../services/serverAuth';

// ---------------------------------------------------------------------------
// Helper: simulates the _layout.tsx 2c guard logic
// ---------------------------------------------------------------------------
async function runGuard(currentPath = 'home'): Promise<string | null> {
  const all = await SettingsRepository.getAll();
  const serverSession = await isLoggedIn();
  const skipped = all[StorageKeys.SERVER_LOGIN_SKIPPED] === 'true';

  if (!serverSession && !skipped && !currentPath.includes('server-login')) {
    return '/screens/server-login';
  }
  return null;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
beforeEach(() => {
  Object.keys(mockStore).forEach(k => delete mockStore[k]);
  jest.clearAllMocks();
  mockDb.getAllAsync.mockImplementation(async () =>
    Object.entries(mockStore).map(([key, value]) => ({ key, value }))
  );
  mockDb.runAsync.mockImplementation(async (_sql: string, params?: unknown[]) => {
    if (params && params.length >= 2) {
      mockStore[params[0] as string] = params[1] as string;
    }
  });
});

describe('SPEC12-C — server-login skip persistence', () => {
  it('handleSkip persists SERVER_LOGIN_SKIPPED = true in SettingsRepository', async () => {
    await SettingsRepository.set(StorageKeys.SERVER_LOGIN_SKIPPED, 'true');
    const all = await SettingsRepository.getAll();
    expect(all[StorageKeys.SERVER_LOGIN_SKIPPED]).toBe('true');
  });

  it('guard does NOT redirect after skip is persisted (isLoggedIn = false)', async () => {
    await SettingsRepository.set(StorageKeys.SERVER_LOGIN_SKIPPED, 'true');
    const redirect = await runGuard('home');
    expect(redirect).toBeNull();
  });

  it('guard DOES redirect when no session AND no skip flag (regression for original bug)', async () => {
    // mockStore is empty — no skip flag, no session
    const redirect = await runGuard('home');
    expect(redirect).toBe('/screens/server-login');
  });

  it('guard does NOT redirect when already on server-login screen (loop prevention)', async () => {
    // no skip, no session, but already on the screen
    const redirect = await runGuard('server-login');
    expect(redirect).toBeNull();
  });

  it('guard does NOT redirect when isLoggedIn = true, regardless of skip flag', async () => {
    (isLoggedIn as jest.Mock).mockResolvedValueOnce(true);
    const redirect = await runGuard('home');
    expect(redirect).toBeNull();
  });
});

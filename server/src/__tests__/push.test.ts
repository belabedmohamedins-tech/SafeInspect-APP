// server/src/__tests__/push.test.ts
// W96 — two-phase push receipt stale-token cleanup
//
// jest.mock() factories are hoisted to the TOP of the file by Babel/Jest,
// ABOVE every `const`/`let` declaration. The ONLY values safe to reference
// inside a factory are:
//   1. jest.fn() called fresh inside the factory itself, OR
//   2. A plain object literal declared with `var` (var is also hoisted), OR
//   3. Properties on an object that is mutated AFTER jest.mock() registers.
//
// Pattern used here: declare a plain `stubs` object with `var` (hoisted to
// undefined, then assigned before the factory runs because jest.mock() calls
// are deferred to module-load time, not compile time). The factory closes over
// the `stubs` reference; each stub fn is installed via lazy getters so the
// factory body itself never reads an uninitialised binding.

/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendPush, pollReceipts } from '../lib/push';

// ── Shared stubs container ─────────────────────────────────────────────────────────
// `var` is function-scoped and declaration is hoisted (value = undefined).
// By the time any factory BODY executes, this assignment has already run
// because jest.mock() bodies run at module-evaluation time, after all
// top-level statements in this file have been processed.
// eslint-disable-next-line no-var
var stubs = {
  // Expo
  send:     jest.fn() as jest.Mock,
  receipts: jest.fn() as jest.Mock,
  // Prisma — pushToken
  ptDeleteMany: jest.fn() as jest.Mock,
  // Prisma — pushReceiptQueue
  prqCreate:     jest.fn() as jest.Mock,
  prqFindMany:   jest.fn() as jest.Mock,
  prqDeleteMany: jest.fn() as jest.Mock,
  // Prisma — inspector
  inspFindMany: jest.fn() as jest.Mock,
};

// ── Prisma mock ───────────────────────────────────────────────────────────────
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    // Lazy getters read `stubs` at CALL time, not factory-hoist time.
    get pushToken()        { return { deleteMany: stubs.ptDeleteMany }; },
    get pushReceiptQueue() {
      return {
        create:     stubs.prqCreate,
        findMany:   stubs.prqFindMany,
        deleteMany: stubs.prqDeleteMany,
      };
    },
    get inspector() { return { findMany: stubs.inspFindMany }; },
  })),
}));

// ── Expo mock ─────────────────────────────────────────────────────────────────
jest.mock('expo-server-sdk', () => ({
  Expo: Object.assign(
    jest.fn().mockImplementation(() => ({
      chunkPushNotifications:          (msgs: unknown[]) => [msgs],
      // Lazy getters — same pattern.
      get sendPushNotificationsAsync()      { return stubs.send; },
      get getPushNotificationReceiptsAsync(){ return stubs.receipts; },
    })),
    { isExpoPushToken: () => true },
  ),
}));

// ── Reset before each test ─────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  stubs.inspFindMany.mockResolvedValue([]);
  stubs.prqFindMany.mockResolvedValue([]);
  stubs.ptDeleteMany.mockResolvedValue({ count: 1 });
  stubs.prqCreate.mockResolvedValue({});
  stubs.prqDeleteMany.mockResolvedValue({ count: 1 });
});

// ── Test 1 ──────────────────────────────────────────────────────────────────────────────
test('Phase 1 — send-time DeviceNotRegistered removes token immediately', async () => {
  stubs.send.mockResolvedValue([{
    status: 'error',
    message: 'The device cannot receive push notifications',
    details: { error: 'DeviceNotRegistered' },
  }]);

  await sendPush(['ExponentPushToken[stale-token]'], 'Test', 'Body');

  expect(stubs.ptDeleteMany).toHaveBeenCalledWith({
    where: { token: 'ExponentPushToken[stale-token]' },
  });
  expect(stubs.prqCreate).not.toHaveBeenCalled();
});

// ── Test 2 ──────────────────────────────────────────────────────────────────────────────
test('Phase 1 — ok ticket stores receiptId + token in PushReceiptQueue', async () => {
  stubs.send.mockResolvedValue([{ status: 'ok', id: 'receipt-abc-123' }]);

  await sendPush(['ExponentPushToken[good-token]'], 'Test', 'Body');

  expect(stubs.prqCreate).toHaveBeenCalledWith({
    data: { receiptId: 'receipt-abc-123', token: 'ExponentPushToken[good-token]' },
  });
  expect(stubs.ptDeleteMany).not.toHaveBeenCalled();
});

// ── Test 3 ──────────────────────────────────────────────────────────────────────────────
test('Phase 2 — receipt DeviceNotRegistered removes token and clears queue row', async () => {
  stubs.prqFindMany.mockResolvedValue([
    { receiptId: 'receipt-stale-456', token: 'ExponentPushToken[stale-receipt]', createdAt: new Date() },
  ]);
  stubs.receipts.mockResolvedValue({
    'receipt-stale-456': {
      status: 'error',
      message: 'The device cannot receive push notifications',
      details: { error: 'DeviceNotRegistered' },
    },
  });

  await pollReceipts();

  expect(stubs.ptDeleteMany).toHaveBeenCalledWith({
    where: { token: 'ExponentPushToken[stale-receipt]' },
  });
  expect(stubs.prqDeleteMany).toHaveBeenCalledWith({
    where: { receiptId: { in: ['receipt-stale-456'] } },
  });
});

// ── Test 4 ──────────────────────────────────────────────────────────────────────────────
test('Phase 2 — receipt ok does not remove token', async () => {
  stubs.prqFindMany.mockResolvedValue([
    { receiptId: 'receipt-good-789', token: 'ExponentPushToken[healthy-token]', createdAt: new Date() },
  ]);
  stubs.receipts.mockResolvedValue({
    'receipt-good-789': { status: 'ok' },
  });

  await pollReceipts();

  expect(stubs.ptDeleteMany).not.toHaveBeenCalled();
  expect(stubs.prqDeleteMany).toHaveBeenCalledWith({
    where: { receiptId: { in: ['receipt-good-789'] } },
  });
});

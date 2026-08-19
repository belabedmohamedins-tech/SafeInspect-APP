// server/src/__tests__/push.test.ts
// W96 — two-phase push receipt stale-token cleanup
//
// jest.mock() factories are hoisted above ALL variable declarations by Babel.
// Any `const mockX = jest.fn()` declared outside the factory is NOT yet
// initialised when the factory executes — ReferenceError.
// Fix: define stub objects inside the factory and expose them via module-level
// variables that are assigned AFTER the mock is registered (or use lazy getters).

import { sendPush, pollReceipts } from '../lib/push';

// ── Prisma stubs (defined inside factory to avoid hoisting trap) ─────────────
const mockPushToken        = { deleteMany: jest.fn() };
const mockPushReceiptQueue = {
  create:     jest.fn(),
  findMany:   jest.fn(),
  deleteMany: jest.fn(),
};
const mockInspector = { findMany: jest.fn() };

jest.mock('@prisma/client', () => {
  const { PrismaClient: _Orig } = jest.requireActual('@prisma/client') as { PrismaClient: unknown };
  void _Orig;
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      // Lazy property access — reads the jest.fn() references at call-time,
      // not at factory-hoist time, so no ReferenceError.
      get pushToken()        { return mockPushToken; },
      get pushReceiptQueue() { return mockPushReceiptQueue; },
      get inspector()        { return mockInspector; },
    })),
  };
});

// ── Expo stubs ─────────────────────────────────────────────────────────────────
const expoInstance = {
  chunkPushNotifications:          (msgs: unknown[]) => [msgs],
  sendPushNotificationsAsync:      jest.fn(),
  getPushNotificationReceiptsAsync: jest.fn(),
};

jest.mock('expo-server-sdk', () => ({
  Expo: Object.assign(
    jest.fn().mockImplementation(() => expoInstance),
    { isExpoPushToken: () => true },
  ),
}));

// ── Convenience aliases ──────────────────────────────────────────────────────
const mockSend     = expoInstance.sendPushNotificationsAsync;
const mockReceipts = expoInstance.getPushNotificationReceiptsAsync;
const mockDeleteMany       = mockPushToken.deleteMany;
const mockCreate           = mockPushReceiptQueue.create;
const mockQueueFindMany    = mockPushReceiptQueue.findMany;
const mockQueueDeleteMany  = mockPushReceiptQueue.deleteMany;

beforeEach(() => {
  jest.clearAllMocks();
  mockInspector.findMany.mockResolvedValue([]);
  mockQueueFindMany.mockResolvedValue([]);
  mockDeleteMany.mockResolvedValue({ count: 1 });
  mockCreate.mockResolvedValue({});
  mockQueueDeleteMany.mockResolvedValue({ count: 1 });
});

// ── Test 1: send-time DeviceNotRegistered removes token immediately ───────────
test('Phase 1 — send-time DeviceNotRegistered removes token immediately', async () => {
  mockSend.mockResolvedValue([{
    status: 'error',
    message: 'The device cannot receive push notifications',
    details: { error: 'DeviceNotRegistered' },
  }]);

  await sendPush(['ExponentPushToken[stale-token]'], 'Test', 'Body');

  expect(mockDeleteMany).toHaveBeenCalledWith({
    where: { token: 'ExponentPushToken[stale-token]' },
  });
  expect(mockCreate).not.toHaveBeenCalled();
});

// ── Test 2: successful ticket stores receipt ID in queue ──────────────────────
test('Phase 1 — ok ticket stores receiptId + token in PushReceiptQueue', async () => {
  mockSend.mockResolvedValue([{ status: 'ok', id: 'receipt-abc-123' }]);

  await sendPush(['ExponentPushToken[good-token]'], 'Test', 'Body');

  expect(mockCreate).toHaveBeenCalledWith({
    data: { receiptId: 'receipt-abc-123', token: 'ExponentPushToken[good-token]' },
  });
  expect(mockDeleteMany).not.toHaveBeenCalled();
});

// ── Test 3: Phase 2 receipt DeviceNotRegistered removes token + clears queue ──
test('Phase 2 — receipt DeviceNotRegistered removes token and clears queue row', async () => {
  mockQueueFindMany.mockResolvedValue([
    { receiptId: 'receipt-stale-456', token: 'ExponentPushToken[stale-receipt]', createdAt: new Date() },
  ]);
  mockReceipts.mockResolvedValue({
    'receipt-stale-456': {
      status: 'error',
      message: 'The device cannot receive push notifications',
      details: { error: 'DeviceNotRegistered' },
    },
  });

  await pollReceipts();

  expect(mockDeleteMany).toHaveBeenCalledWith({
    where: { token: 'ExponentPushToken[stale-receipt]' },
  });
  expect(mockQueueDeleteMany).toHaveBeenCalledWith({
    where: { receiptId: { in: ['receipt-stale-456'] } },
  });
});

// ── Test 4: Phase 2 receipt 'ok' does NOT remove token ───────────────────────
test('Phase 2 — receipt ok does not remove token', async () => {
  mockQueueFindMany.mockResolvedValue([
    { receiptId: 'receipt-good-789', token: 'ExponentPushToken[healthy-token]', createdAt: new Date() },
  ]);
  mockReceipts.mockResolvedValue({
    'receipt-good-789': { status: 'ok' },
  });

  await pollReceipts();

  expect(mockDeleteMany).not.toHaveBeenCalled();
  expect(mockQueueDeleteMany).toHaveBeenCalledWith({
    where: { receiptId: { in: ['receipt-good-789'] } },
  });
});

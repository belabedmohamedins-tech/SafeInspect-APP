// server/src/__tests__/push.test.ts
// W96 — two-phase push receipt stale-token cleanup

import { sendPush, pollReceipts } from '../lib/push';

// ── Prisma mock ───────────────────────────────────────────────────────────────
const mockDeleteMany     = jest.fn().mockResolvedValue({ count: 1 });
const mockCreate         = jest.fn().mockResolvedValue({});
const mockFindMany       = jest.fn();
const mockPrismDeleteMany = jest.fn().mockResolvedValue({ count: 1 });

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    pushToken: { deleteMany: mockDeleteMany },
    pushReceiptQueue: {
      create:     mockCreate,
      findMany:   mockFindMany,
      deleteMany: mockPrismDeleteMany,
    },
    inspector: { findMany: jest.fn().mockResolvedValue([]) },
  })),
}));

// ── Expo mock ─────────────────────────────────────────────────────────────────
const mockSend    = jest.fn();
const mockReceipts = jest.fn();

jest.mock('expo-server-sdk', () => ({
  Expo: Object.assign(
    jest.fn().mockImplementation(() => ({
      chunkPushNotifications: (msgs: unknown[]) => [msgs],
      sendPushNotificationsAsync: mockSend,
      getPushNotificationReceiptsAsync: mockReceipts,
    })),
    { isExpoPushToken: () => true },
  ),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockFindMany.mockResolvedValue([]);
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
  // No receipt should be queued for a failed ticket.
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
  mockFindMany.mockResolvedValue([
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
  expect(mockPrismDeleteMany).toHaveBeenCalledWith({
    where: { receiptId: { in: ['receipt-stale-456'] } },
  });
});

// ── Test 4: Phase 2 receipt 'ok' does NOT remove token ───────────────────────
test('Phase 2 — receipt ok does not remove token', async () => {
  mockFindMany.mockResolvedValue([
    { receiptId: 'receipt-good-789', token: 'ExponentPushToken[healthy-token]', createdAt: new Date() },
  ]);
  mockReceipts.mockResolvedValue({
    'receipt-good-789': { status: 'ok' },
  });

  await pollReceipts();

  expect(mockDeleteMany).not.toHaveBeenCalled();
  // Queue row should still be cleared after processing.
  expect(mockPrismDeleteMany).toHaveBeenCalledWith({
    where: { receiptId: { in: ['receipt-good-789'] } },
  });
});

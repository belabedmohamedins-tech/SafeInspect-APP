// server/src/lib/push.ts
//
// Expo push notification helpers — two-phase stale-token cleanup (W96).
//
// Phase 1 (sendPush): Send notifications. For each OK ticket store the receipt
// ID + originating token in PushReceiptQueue. For send-time DeviceNotRegistered
// errors remove the token immediately (Expo docs: these are safe to act on now).
//
// Phase 2 (pollReceipts / startReceiptPoller): Expo makes receipts available
// ~24 h after delivery. Poll getPushNotificationReceiptsAsync with stored IDs.
// Remove tokens whose receipt shows DeviceNotRegistered; clear processed rows.
//
// Ticket ↔ message correlation is by ARRAY INDEX per Expo docs, NOT by any
// .to / ._to field on the ticket object. Tickets have no .to field.
//
// NOTE: PushReceiptQueue is defined in schema.prisma. Run `npx prisma generate`
// after migration so the Prisma client picks up the new model. The explicit
// PrismaReceiptRow type below keeps TSC green before generate has been run.

import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { PrismaClient } from '@prisma/client';

const expo   = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN || undefined });
// Cast to any so TSC accepts .pushReceiptQueue before `prisma generate` adds it
// to the generated client. After running `npx prisma generate` the cast is a
// no-op and the real types take over.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient() as any;

// Shape of a PushReceiptQueue row (matches schema.prisma model).
interface PushReceiptRow {
  id:        string;
  receiptId: string;
  token:     string;
  createdAt: Date;
}

// Expo hard limit: 300 receipt IDs per getPushNotificationReceiptsAsync call.
const MAX_RECEIPT_IDS_PER_CALL = 300;

// ── Phase 1: Send ─────────────────────────────────────────────────────────────
export async function sendPush(
  tokens:  string[],
  title:   string,
  body:    string,
  data?:   Record<string, string>,
): Promise<void> {
  const validTokens = tokens.filter(t => Expo.isExpoPushToken(t));
  if (validTokens.length === 0) return;

  const messages: ExpoPushMessage[] = validTokens.map(to => ({
    to,
    title,
    body,
    data: data ?? {},
    sound: 'default',
    priority: 'high',
  }));

  const chunks = expo.chunkPushNotifications(messages);

  // Track the flat index across chunks so we can map ticket[i] → message[i].
  let flatOffset = 0;

  for (const chunk of chunks) {
    try {
      const tickets: ExpoPushTicket[] = await expo.sendPushNotificationsAsync(chunk);

      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        // Ticket ↔ message correlation is by array index (Expo docs).
        const originalToken = messages[flatOffset + i].to as string;

        if (ticket.status === 'ok') {
          // Store receipt ID for Phase 2 polling.
          await prisma.pushReceiptQueue.create({
            data: { receiptId: ticket.id, token: originalToken },
          }).catch(() => {});

        } else if (ticket.status === 'error') {
          console.warn('[push] send-time error for token', originalToken, ticket.message, ticket.details);
          if ((ticket.details as { error?: string } | undefined)?.error === 'DeviceNotRegistered') {
            // Send-time DeviceNotRegistered is definitive — remove immediately.
            await prisma.pushToken.deleteMany({ where: { token: originalToken } }).catch(() => {});
            console.log('[push] removed stale token (send-time):', originalToken);
          }
        }
      }
    } catch (err) {
      console.error('[push] send error:', err);
    }

    flatOffset += chunk.length;
  }
}

// ── Phase 2: Poll receipts ────────────────────────────────────────────────────
export async function pollReceipts(): Promise<void> {
  const rows: PushReceiptRow[] = await prisma.pushReceiptQueue.findMany({
    take: MAX_RECEIPT_IDS_PER_CALL,
    orderBy: { createdAt: 'asc' },
  });

  if (rows.length === 0) return;

  const receiptIds = rows.map((r: PushReceiptRow) => r.receiptId);
  const tokenByReceiptId: Record<string, string> = Object.fromEntries(
    rows.map((r: PushReceiptRow) => [r.receiptId, r.token]),
  );

  try {
    const receiptMap = await expo.getPushNotificationReceiptsAsync(receiptIds);

    for (const [receiptId, receipt] of Object.entries(
      receiptMap as Record<string, { status: string; message?: string; details?: { error?: string } }>,
    )) {
      if (receipt.status === 'error') {
        console.warn('[push] receipt error for receiptId', receiptId, receipt.message, receipt.details);
        if (receipt.details?.error === 'DeviceNotRegistered') {
          const staleToken = tokenByReceiptId[receiptId];
          if (staleToken) {
            await prisma.pushToken.deleteMany({ where: { token: staleToken } }).catch(() => {});
            console.log('[push] removed stale token (receipt):', staleToken);
          }
        }
      }
    }
  } catch (err) {
    console.error('[push] receipt poll error:', err);
  }

  // Clear processed rows regardless of outcome (prevents infinite retry loops).
  await prisma.pushReceiptQueue.deleteMany({
    where: { receiptId: { in: receiptIds } },
  }).catch(() => {});
}

// ── Poller: call startReceiptPoller() once at server startup ─────────────────
const POLL_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

export function startReceiptPoller(): void {
  // Run once at startup to drain any rows left from the previous run.
  pollReceipts().catch(err => console.error('[push] startup receipt poll failed:', err));
  setInterval(() => {
    pollReceipts().catch(err => console.error('[push] receipt poll failed:', err));
  }, POLL_INTERVAL_MS);
  console.log('[push] receipt poller started (interval: 1 h)');
}

// ── Convenience wrappers ─────────────────────────────────────────────────────
export async function sendPushToInspector(
  tokens:  string[],
  title:   string,
  body:    string,
  data?:   Record<string, string>,
): Promise<void> {
  return sendPush(tokens, title, body, data);
}

export async function sendPushToSupervisors(
  title: string,
  body:  string,
  data?: Record<string, string>,
): Promise<void> {
  const supervisors = await prisma.inspector.findMany({
    where:   { role: { in: ['SUPERVISOR', 'ADMIN'] } },
    include: { pushTokens: true },
  });
  const tokens = supervisors.flatMap((s: { pushTokens: { token: string }[] }) =>
    s.pushTokens.map((t: { token: string }) => t.token),
  );
  return sendPush(tokens, title, body, data);
}

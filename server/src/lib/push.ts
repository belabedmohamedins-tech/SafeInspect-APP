// server/src/lib/push.ts
//
// Expo push notification helpers.
// Uses expo-server-sdk — no APNs or FCM credentials needed for Expo-managed push.

import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { PrismaClient } from '@prisma/client';

const expo   = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN || undefined });
const prisma = new PrismaClient();

// ── Send push to a list of Expo tokens ───────────────────────────────────────
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
  for (const chunk of chunks) {
    try {
      const receipts = await expo.sendPushNotificationsAsync(chunk);
      for (const receipt of receipts) {
        if (receipt.status === 'error') {
          console.warn('[push] delivery error:', receipt.message, receipt.details);
          // If DeviceNotRegistered, clean up the stale token
          if (receipt.details?.error === 'DeviceNotRegistered') {
            const staleTo = (chunk.find(m =>
              (m as ExpoPushMessage & { _to?: string })._to === (receipt as unknown as Record<string, string>).to
            ) as ExpoPushMessage | undefined)?.to;
            if (staleTo) {
              await prisma.pushToken.deleteMany({ where: { token: staleTo as string } })
                .catch(() => {});
            }
          }
        }
      }
    } catch (err) {
      console.error('[push] send error:', err);
    }
  }
}

// ── Convenience: notify a specific inspector ─────────────────────────────────
export async function sendPushToInspector(
  tokens:  string[],
  title:   string,
  body:    string,
  data?:   Record<string, string>,
): Promise<void> {
  return sendPush(tokens, title, body, data);
}

// ── Convenience: notify ALL supervisors + admins ─────────────────────────────
export async function sendPushToSupervisors(
  title: string,
  body:  string,
  data?: Record<string, string>,
): Promise<void> {
  const supervisors = await prisma.inspector.findMany({
    where:   { role: { in: ['SUPERVISOR', 'ADMIN'] } },
    include: { pushTokens: true },
  });

  const tokens = supervisors.flatMap(s => s.pushTokens.map(t => t.token));
  return sendPush(tokens, title, body, data);
}

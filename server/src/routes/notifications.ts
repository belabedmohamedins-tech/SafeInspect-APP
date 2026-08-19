// server/src/routes/notifications.ts
//
// W91 — Push-token registration endpoint.
//
// The mobile app calls registerPushToken() in serverAuth.ts at startup after
// acquiring an Expo push token. That function POSTs to /api/notifications/register.
// This route was previously missing, causing every startup to silently 404 and
// no push token to ever be stored, so push notifications never worked in prod.
//
// Routes:
//   POST   /api/notifications/register  — upsert token for the authenticated inspector
//   DELETE /api/notifications/register  — remove token (logout / permission revoked)
//
// Auth: requireAuth (JWT). Both routes are inspector-only; no role restriction.
//
// Prisma model (already exists in schema — used by push.ts):
//   model PushToken {
//     id          String    @id @default(cuid())
//     token       String    @unique
//     inspectorId String
//     createdAt   DateTime  @default(now())
//     updatedAt   DateTime  @updatedAt
//     inspector   Inspector @relation(fields: [inspectorId], references: [id])
//   }
//
// The server index.ts auto-scans routes/ and mounts this at /api/notifications.

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { Expo } from 'expo-server-sdk';

const router = Router();
const prisma = new PrismaClient();

// ── POST /api/notifications/register ─────────────────────────────────────────
// Body: { pushToken: string }
// Upserts the push token so repeated calls (e.g. app restart) are idempotent.
router.post(
  '/register',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const { pushToken } = req.body as { pushToken?: string };
    const inspectorId   = req.inspector!.inspectorId;

    // Validate token format — Expo push tokens have a well-defined shape.
    if (!pushToken || typeof pushToken !== 'string' || !Expo.isExpoPushToken(pushToken)) {
      res.status(400).json({ error: 'Invalid or missing pushToken' });
      return;
    }

    try {
      // Upsert: if this token already exists, just update the inspectorId binding
      // (handles the case where the same device re-authenticates as a different
      // inspector after a logout). If it does not exist, create it.
      await prisma.pushToken.upsert({
        where:  { token: pushToken },
        update: { inspectorId },
        create: { token: pushToken, inspectorId },
      });

      res.status(200).json({ ok: true });
    } catch (err) {
      console.error('[notifications] register error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// ── DELETE /api/notifications/register ───────────────────────────────────────
// Body: { pushToken: string }
// Called on logout or when the user revokes notification permissions.
// No-ops gracefully if the token is not found (already removed).
router.delete(
  '/register',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const { pushToken } = req.body as { pushToken?: string };

    if (!pushToken || typeof pushToken !== 'string') {
      res.status(400).json({ error: 'Missing pushToken' });
      return;
    }

    try {
      await prisma.pushToken.deleteMany({
        where: {
          token:       pushToken,
          // Scope deletion to the authenticated inspector — prevents one
          // inspector from removing another's token.
          inspectorId: req.inspector!.inspectorId,
        },
      });

      res.status(200).json({ ok: true });
    } catch (err) {
      console.error('[notifications] unregister error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

export default router;

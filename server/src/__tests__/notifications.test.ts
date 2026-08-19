// server/src/__tests__/notifications.test.ts
// W91 — integration tests for push-token registration route.
//
// Strategy: mock Prisma (no real DB) + mock auth middleware (no JWT).
// Tests verify:
//   1. POST /register with valid token → 200 ok:true
//   2. POST /register with invalid token → 400
//   3. POST /register with missing token → 400
//   4. DELETE /register with valid token → 200 ok:true
//   5. DELETE /register with missing token → 400

import express from 'express';
import request from 'supertest';
import { JwtPayload } from '../middleware/auth';

// ── Mock Prisma ───────────────────────────────────────────────────────────────
const mockPrisma = {
  pushToken: {
    upsert:     jest.fn(),
    deleteMany: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

// ── Mock expo-server-sdk — control isExpoPushToken validation ─────────────────
jest.mock('expo-server-sdk', () => ({
  Expo: class {
    static isExpoPushToken(token: string): boolean {
      return token.startsWith('ExponentPushToken[');
    }
  },
}));

// ── Mock auth middleware ──────────────────────────────────────────────────────
jest.mock('../middleware/auth', () => ({
  requireAuth: (
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    req.inspector = {
      inspectorId: 'insp-001',
      matricule:   'MAT-001',
      role:        'INSPECTOR',
    } satisfies JwtPayload;
    next();
  },
  requireRole: (..._roles: string[]) =>
    (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
}));

// ── Build test app ─────────────────────────────────────────────────────────────
import notificationsRouter from '../routes/notifications';

function buildApp(): express.Express {
  const app = express();
  app.use(express.json());
  app.use('/api/notifications', notificationsRouter);
  return app;
}

const VALID_TOKEN = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';

beforeEach(() => {
  jest.clearAllMocks();
  mockPrisma.pushToken.upsert.mockResolvedValue({});
  mockPrisma.pushToken.deleteMany.mockResolvedValue({ count: 1 });
});

// ── POST /register ─────────────────────────────────────────────────────────────
describe('POST /api/notifications/register', () => {
  it('returns 200 and upserts a valid Expo push token', async () => {
    const res = await request(buildApp())
      .post('/api/notifications/register')
      .send({ pushToken: VALID_TOKEN });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(mockPrisma.pushToken.upsert).toHaveBeenCalledWith({
      where:  { token: VALID_TOKEN },
      update: { inspectorId: 'insp-001' },
      create: { token: VALID_TOKEN, inspectorId: 'insp-001' },
    });
  });

  it('returns 400 for a token that does not pass Expo format validation', async () => {
    const res = await request(buildApp())
      .post('/api/notifications/register')
      .send({ pushToken: 'not-a-valid-expo-token' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid or missing pushToken/);
    expect(mockPrisma.pushToken.upsert).not.toHaveBeenCalled();
  });

  it('returns 400 when pushToken is missing from body', async () => {
    const res = await request(buildApp())
      .post('/api/notifications/register')
      .send({});

    expect(res.status).toBe(400);
    expect(mockPrisma.pushToken.upsert).not.toHaveBeenCalled();
  });
});

// ── DELETE /register ──────────────────────────────────────────────────────────
describe('DELETE /api/notifications/register', () => {
  it('returns 200 and deletes token scoped to inspector', async () => {
    const res = await request(buildApp())
      .delete('/api/notifications/register')
      .send({ pushToken: VALID_TOKEN });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(mockPrisma.pushToken.deleteMany).toHaveBeenCalledWith({
      where: { token: VALID_TOKEN, inspectorId: 'insp-001' },
    });
  });

  it('returns 400 when pushToken is missing from body', async () => {
    const res = await request(buildApp())
      .delete('/api/notifications/register')
      .send({});

    expect(res.status).toBe(400);
    expect(mockPrisma.pushToken.deleteMany).not.toHaveBeenCalled();
  });
});

// server/src/__tests__/approvals.test.ts
// W61 — integration tests for approvals routes (SPEC 09)
//
// Strategy: mock Prisma and the push lib so no real DB is needed.
// Tests verify:
//   1. Routes are mounted (not 404) — regression for Problem 1.
//   2. /by-inspection/:inspectionId/approve resolves Approval by inspectionId (Problem 3).
//   3. /by-inspection/:inspectionId/reject resolves Approval by inspectionId (Problem 3).
//   4. /:id/approve still works with Approval.id (legacy path).

import express from 'express';
import request from 'supertest';
import { JwtPayload } from '../middleware/auth';

// ── Mock Prisma ──────────────────────────────────────────────────────────────
const mockApproval = {
  id: 'approval-001',
  inspectionId: 'insp-001',
  status: 'PENDING',
  inspection: {
    facilityName: 'Test Facility',
    approvalStatus: 'PENDING',
    inspector: {
      pushTokens: [],
    },
  },
};

const mockPrisma = {
  approval: {
    findFirst:  jest.fn(),
    findUnique: jest.fn(),
    findMany:   jest.fn(),
    update:     jest.fn(),
  },
  inspection: {
    update: jest.fn(),
  },
  $transaction: jest.fn((ops: unknown[]) => Promise.all(ops as Promise<unknown>[])),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

// ── Mock push lib ─────────────────────────────────────────────────────────────
jest.mock('../lib/push', () => ({
  sendPushToInspector: jest.fn().mockResolvedValue(undefined),
}));

// ── Mock auth middleware ──────────────────────────────────────────────────────
// Injects a fake supervisor — bypasses JWT verification for unit tests.
jest.mock('../middleware/auth', () => ({
  requireAuth: (
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    req.inspector = {
      inspectorId: 'supervisor-001',
      matricule:   'MAT-001',
      role:        'SUPERVISOR',
    } satisfies JwtPayload;
    next();
  },
  requireRole: (..._roles: string[]) =>
    (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
}));

// ── Build test app ─────────────────────────────────────────────────────────────
// Import AFTER mocks are declared so jest.mock() hoisting applies.
import approvalsRouter from '../routes/approvals';

function buildApp(): express.Express {
  const app = express();
  app.use(express.json());
  app.use('/api/approvals', approvalsRouter);
  return app;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function resetMocks(): void {
  jest.clearAllMocks();
  mockPrisma.$transaction.mockImplementation(
    (ops: unknown[]) => Promise.all(ops as Promise<unknown>[]),
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('GET /api/approvals', () => {
  beforeEach(resetMocks);

  it('returns 200 and approvals list (route is mounted)', async () => {
    mockPrisma.approval.findMany.mockResolvedValue([mockApproval]);
    const app = buildApp();
    const res = await request(app).get('/api/approvals?status=PENDING');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('approvals');
  });
});

describe('POST /api/approvals/by-inspection/:inspectionId/approve (W61 Problem 3)', () => {
  beforeEach(resetMocks);

  it('returns 200 when approval exists and is PENDING', async () => {
    mockPrisma.approval.findFirst.mockResolvedValue({ ...mockApproval });
    mockPrisma.approval.update.mockResolvedValue({});
    mockPrisma.inspection.update.mockResolvedValue({});

    const app = buildApp();
    const res = await request(app)
      .post('/api/approvals/by-inspection/insp-001/approve')
      .send({ note: 'All good' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, status: 'APPROVED' });
    expect(mockPrisma.approval.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { inspectionId: 'insp-001' } }),
    );
  });

  it('returns 404 when no approval record exists for inspectionId', async () => {
    mockPrisma.approval.findFirst.mockResolvedValue(null);
    const app = buildApp();
    const res = await request(app)
      .post('/api/approvals/by-inspection/unknown-insp/approve')
      .send({});
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/approval record/);
  });

  it('returns 400 when approval is already APPROVED', async () => {
    mockPrisma.approval.findFirst.mockResolvedValue({
      ...mockApproval,
      status: 'APPROVED',
    });
    const app = buildApp();
    const res = await request(app)
      .post('/api/approvals/by-inspection/insp-001/approve')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/APPROVED/);
  });
});

describe('POST /api/approvals/by-inspection/:inspectionId/reject (W61 Problem 3)', () => {
  beforeEach(resetMocks);

  it('returns 200 and RETURNED when reason provided', async () => {
    mockPrisma.approval.findFirst.mockResolvedValue({ ...mockApproval });
    mockPrisma.approval.update.mockResolvedValue({});
    mockPrisma.inspection.update.mockResolvedValue({});

    const app = buildApp();
    const res = await request(app)
      .post('/api/approvals/by-inspection/insp-001/reject')
      .send({ reason: 'Missing documents for review' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      status: 'RETURNED',
      reason: 'Missing documents for review',
    });
    expect(mockPrisma.approval.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { inspectionId: 'insp-001' } }),
    );
  });

  it('returns 400 when reason is too short', async () => {
    mockPrisma.approval.findFirst.mockResolvedValue({ ...mockApproval });
    const app = buildApp();
    const res = await request(app)
      .post('/api/approvals/by-inspection/insp-001/reject')
      .send({ reason: 'No' });
    expect(res.status).toBe(400);
  });

  it('returns 404 when no approval record found', async () => {
    mockPrisma.approval.findFirst.mockResolvedValue(null);
    const app = buildApp();
    const res = await request(app)
      .post('/api/approvals/by-inspection/unknown/reject')
      .send({ reason: 'Missing documents here' });
    expect(res.status).toBe(404);
  });
});

describe('POST /api/approvals/:id/approve (legacy Approval.id path)', () => {
  beforeEach(resetMocks);

  it('returns 200 when called with Approval.id', async () => {
    mockPrisma.approval.findUnique.mockResolvedValue({ ...mockApproval });
    mockPrisma.approval.update.mockResolvedValue({});
    mockPrisma.inspection.update.mockResolvedValue({});

    const app = buildApp();
    const res = await request(app)
      .post('/api/approvals/approval-001/approve')
      .send({ note: '' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, status: 'APPROVED' });
    expect(mockPrisma.approval.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'approval-001' } }),
    );
  });

  it('returns 404 when Approval.id not found', async () => {
    mockPrisma.approval.findUnique.mockResolvedValue(null);
    const app = buildApp();
    const res = await request(app)
      .post('/api/approvals/nonexistent-id/approve')
      .send({});
    expect(res.status).toBe(404);
  });
});

describe('Route mounting regression (W61 Problem 1)', () => {
  it('GET /api/approvals does NOT return 404', async () => {
    mockPrisma.approval.findMany.mockResolvedValue([]);
    const app = buildApp();
    const res = await request(app).get('/api/approvals');
    expect(res.status).not.toBe(404);
  });
});

// server/src/routes/approvals.ts
//
// GET    /approvals?status=PENDING|APPROVED|RETURNED   — list for supervisor
// POST   /approvals/:id/approve                        — approve an inspection
// POST   /approvals/:id/return                         — return with comment

import { Router } from 'express';
import { z }      from 'zod';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth';
import { sendPushToInspector } from '../lib/push';

const router = Router();
const prisma = new PrismaClient();

// ── GET /approvals ────────────────────────────────────────────────────────────
router.get('/', requireAuth, requireRole('SUPERVISOR', 'ADMIN'), async (req, res) => {
  const status = (req.query.status as string | undefined)?.toUpperCase() ?? 'PENDING';

  const approvals = await prisma.approval.findMany({
    where:   { status: status as 'PENDING' | 'APPROVED' | 'RETURNED' | 'ESCALATED' },
    orderBy: { createdAt: 'desc' },
    include: {
      inspection: {
        include: {
          inspector: { select: { id: true, name: true, matricule: true } },
          facility:  { select: { projectName: true, address: true, activity: true } },
        },
      },
    },
  });

  res.json({ approvals });
});

// ── POST /approvals/:id/approve ───────────────────────────────────────────────
router.post('/:id/approve', requireAuth, requireRole('SUPERVISOR', 'ADMIN'), async (req, res) => {
  const { id } = req.params;
  const supervisorId = req.inspector!.inspectorId;

  const approval = await prisma.approval.findUnique({
    where:   { id },
    include: { inspection: { include: { inspector: { include: { pushTokens: true } } } } },
  });

  if (!approval) {
    res.status(404).json({ error: 'Approval not found' });
    return;
  }

  if (approval.status !== 'PENDING') {
    res.status(400).json({ error: `Cannot approve — current status is ${approval.status}` });
    return;
  }

  // Update approval + inspection in a transaction
  await prisma.$transaction([
    prisma.approval.update({
      where: { id },
      data:  { status: 'APPROVED', supervisorId, updatedAt: new Date() },
    }),
    prisma.inspection.update({
      where: { id: approval.inspectionId },
      data:  { approvalStatus: 'APPROVED', approvedBy: supervisorId, approvedAt: new Date() },
    }),
  ]);

  // Push notify the inspector
  const tokens = approval.inspection.inspector.pushTokens.map(t => t.token);
  if (tokens.length > 0) {
    sendPushToInspector(
      tokens,
      'تمت الموافقة على التقرير ✅',
      `تمت الموافقة على تقرير تفتيش ${approval.inspection.facilityName}.`,
      { type: 'APPROVAL_ACTION', action: 'approved', inspectionId: approval.inspectionId },
    ).catch(err => console.warn('[push] inspector notify failed:', err));
  }

  res.json({ ok: true, status: 'APPROVED' });
});

// ── POST /approvals/:id/return ────────────────────────────────────────────────
const ReturnSchema = z.object({
  comment: z.string().min(5, 'يجب إدخال سبب الإرجاع (5 أحرف على الأقل)'),
});

router.post('/:id/return', requireAuth, requireRole('SUPERVISOR', 'ADMIN'), async (req, res) => {
  const { id } = req.params;
  const supervisorId = req.inspector!.inspectorId;

  const parsed = ReturnSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message });
    return;
  }

  const { comment } = parsed.data;

  const approval = await prisma.approval.findUnique({
    where:   { id },
    include: { inspection: { include: { inspector: { include: { pushTokens: true } } } } },
  });

  if (!approval) {
    res.status(404).json({ error: 'Approval not found' });
    return;
  }

  if (approval.status !== 'PENDING') {
    res.status(400).json({ error: `Cannot return — current status is ${approval.status}` });
    return;
  }

  await prisma.$transaction([
    prisma.approval.update({
      where: { id },
      data:  { status: 'RETURNED', supervisorId, comment, updatedAt: new Date() },
    }),
    prisma.inspection.update({
      where: { id: approval.inspectionId },
      data:  { approvalStatus: 'RETURNED', returnedReason: comment },
    }),
  ]);

  const tokens = approval.inspection.inspector.pushTokens.map(t => t.token);
  if (tokens.length > 0) {
    sendPushToInspector(
      tokens,
      'تم إرجاع التقرير 🔄',
      `تقرير ${approval.inspection.facilityName} يحتاج إلى مراجعة: ${comment}`,
      { type: 'APPROVAL_ACTION', action: 'returned', inspectionId: approval.inspectionId },
    ).catch(err => console.warn('[push] inspector notify failed:', err));
  }

  res.json({ ok: true, status: 'RETURNED', comment });
});

export default router;

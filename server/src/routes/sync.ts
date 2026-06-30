// server/src/routes/sync.ts
//
// POST /sync
//   Auth: Bearer JWT
//   Body: SyncBatch (see schema below)
//   Returns: { synced: number, skipped: number, errors: string[] }
//
// The mobile app sends a batch of:
//   - inspections  (SavedInspection[])
//   - actions      (CorrectiveAction[])
//   - agenda       (AgendaItem[])
//
// Strategy: upsert by device-generated UUID.
// The server never rejects a record — it logs errors and returns them.

import { Router } from 'express';
import { z }      from 'zod';
import { PrismaClient, Prisma } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { sendPushToSupervisors } from '../lib/push';

const router = Router();
const prisma = new PrismaClient();

// ── Zod schemas (relaxed — device data is the source of truth) ───────────────

const InspectionItemSchema = z.object({
  id:               z.string(),
  criteria:         z.string(),
  legalReference:   z.string(),
  severity:         z.enum(['low', 'medium', 'high']),
  complianceStatus: z.string(),
  comment:          z.string().optional(),
  photoUri:         z.string().optional(),
  photos:           z.array(z.string()).optional(),
  numericValue:     z.number().optional(),
  numericUnit:      z.string().optional(),
  isRepeatViolation:     z.boolean().optional(),
  rootCause:             z.string().optional(),
  sanctionTier:          z.string().optional(),
  axis:                  z.string().optional(),
  category:              z.string().optional(),
  controlType:           z.string().optional(),
}).passthrough();

const InspectionSchema = z.object({
  id:                  z.string().uuid(),
  facilityId:          z.string(),
  facilityName:        z.string(),
  facilityAddress:     z.string(),
  date:                z.string(),
  inspectorName:       z.string(),
  status:              z.enum(['completed', 'in-progress', 'draft']),
  items:               z.array(InspectionItemSchema).default([]),
  inspectionType:      z.string().optional(),
  priorInspectionId:   z.string().optional(),
  openingMeetingDone:  z.boolean().optional(),
  closingMeetingDone:  z.boolean().optional(),
  score:               z.number().optional(),
  grade:               z.string().optional(),
  riskLevel:           z.number().int().optional(),
  criticalOverride:    z.boolean().optional(),
  incomplete:          z.boolean().optional(),
  nextInspectionDays:  z.number().int().optional(),
  escalationOverrideReason: z.string().optional(),
  signature:           z.string().optional(),
  officeName:          z.string().optional(),
  inspectionCause:     z.string().optional(),
  referenceDocument:   z.string().optional(),
  committeeMembers:    z.array(z.string()).optional(),
  coordinates:         z.object({ latitude: z.number(), longitude: z.number() }).optional(),
  integrityHash:       z.string().optional(),
  geofenceOverrideNote: z.string().optional(),
  reportSequenceNumber: z.string().optional(),
  approvalStatus:      z.string().optional(),
  approvedBy:          z.string().optional(),
  approvedAt:          z.string().optional(),
  returnedReason:      z.string().optional(),
  approvalNote:        z.string().optional(),
  violations:          z.object({
    high: z.number(), medium: z.number(), low: z.number(), total: z.number(),
  }).optional(),
}).passthrough();

const ActionSchema = z.object({
  id:               z.string(),
  inspectionId:     z.string(),
  inspectionItemId: z.string(),
  facilityId:       z.string(),
  facilityName:     z.string(),
  criteria:         z.string(),
  severity:         z.string(),
  deadline:         z.string(),
  assignedTo:       z.string(),
  status:           z.string().default('open'),
  notes:            z.string().optional(),
  createdAt:        z.string(),
  updatedAt:        z.string(),
  closedAt:         z.string().optional(),
}).passthrough();

const AgendaSchema = z.object({
  id:              z.string(),
  facilityId:      z.string(),
  facilityName:    z.string(),
  facilityAddress: z.string().optional(),
  activity:        z.string().optional(),
  date:            z.string(),
  notes:           z.string(),
  status:          z.string().default('pending'),
  inspectionId:    z.string().optional(),
}).passthrough();

const SyncBatchSchema = z.object({
  inspections: z.array(InspectionSchema).default([]),
  actions:     z.array(ActionSchema).default([]),
  agenda:      z.array(AgendaSchema).default([]),
});

// ── Helper: status mapping ────────────────────────────────────────────────────
function mapStatus(s: string | undefined) {
  const map: Record<string, string> = {
    'completed': 'COMPLETED',
    'in-progress': 'IN_PROGRESS',
    'draft': 'DRAFT',
  };
  return (map[s ?? ''] ?? 'IN_PROGRESS') as 'COMPLETED' | 'IN_PROGRESS' | 'DRAFT';
}

function mapInspectionType(t: string | undefined) {
  const map: Record<string, string> = {
    'routine': 'ROUTINE',
    'follow-up': 'FOLLOW_UP',
    'complaint': 'COMPLAINT',
    'extraordinary': 'EXTRAORDINARY',
  };
  return (map[t ?? ''] ?? 'ROUTINE') as 'ROUTINE' | 'FOLLOW_UP' | 'COMPLAINT' | 'EXTRAORDINARY';
}

// ── POST /sync ────────────────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
  const parsed = SyncBatchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid sync payload', details: parsed.error.issues });
    return;
  }

  const { inspections, actions, agenda } = parsed.data;
  const inspectorId = req.inspector!.inspectorId;
  let synced  = 0;
  let skipped = 0;
  const errors: string[] = [];

  // ── Upsert facilities (create if unknown) ────────────────────────────────
  const facilityIds = [...new Set(inspections.map(i => i.facilityId))];
  for (const fid of facilityIds) {
    const sample = inspections.find(i => i.facilityId === fid)!;
    await prisma.facility.upsert({
      where:  { id: fid },
      update: {},
      create: {
        id:          fid,
        projectName: sample.facilityName,
        ownerName:   '',
        activity:    '',
        address:     sample.facilityAddress,
      },
    });
  }

  // ── Upsert inspections ───────────────────────────────────────────────────
  const newlyCompleted: string[] = [];

  for (const insp of inspections) {
    try {
      const data: Prisma.InspectionUncheckedCreateInput = {
        id:                  insp.id,
        facilityId:          insp.facilityId,
        inspectorId,
        facilityName:        insp.facilityName,
        facilityAddress:     insp.facilityAddress,
        inspectionDate:      insp.date ? new Date(insp.date) : undefined,
        inspectorName:       insp.inspectorName,
        status:              mapStatus(insp.status),
        inspectionType:      mapInspectionType(insp.inspectionType),
        priorInspectionId:   insp.priorInspectionId,
        openingMeetingDone:  insp.openingMeetingDone ?? false,
        closingMeetingDone:  insp.closingMeetingDone ?? false,
        score:               insp.score,
        grade:               insp.grade,
        riskLevel:           insp.riskLevel,
        criticalOverride:    insp.criticalOverride ?? false,
        incomplete:          insp.incomplete ?? false,
        nextInspectionDays:  insp.nextInspectionDays,
        escalationOverrideReason: insp.escalationOverrideReason,
        signature:           insp.signature,
        officeName:          insp.officeName,
        inspectionCause:     insp.inspectionCause,
        referenceDocument:   insp.referenceDocument,
        committeeMembers:    insp.committeeMembers ?? [],
        latitude:            insp.coordinates?.latitude,
        longitude:           insp.coordinates?.longitude,
        integrityHash:       insp.integrityHash,
        geofenceOverrideNote: insp.geofenceOverrideNote,
        reportSequenceNumber: insp.reportSequenceNumber,
        violationsHigh:      insp.violations?.high   ?? 0,
        violationsMedium:    insp.violations?.medium ?? 0,
        violationsLow:       insp.violations?.low    ?? 0,
        violationsTotal:     insp.violations?.total  ?? 0,
        items:               insp.items as unknown as Prisma.InputJsonValue,
        syncedAt:            new Date(),
      };

      const existing = await prisma.inspection.findUnique({ where: { id: insp.id } });
      const wasCompleted = existing?.status === 'COMPLETED';
      const nowCompleted = data.status === 'COMPLETED';

      await prisma.inspection.upsert({
        where:  { id: insp.id },
        update: { ...data, id: undefined },
        create: data,
      });

      // Create a pending approval record when an inspection first completes
      if (!wasCompleted && nowCompleted) {
        await prisma.approval.upsert({
          where:  { inspectionId: insp.id },
          update: {},
          create: { inspectionId: insp.id, status: 'PENDING' },
        });
        newlyCompleted.push(insp.id);
      }

      synced++;
    } catch (e) {
      errors.push(`inspection ${insp.id}: ${(e as Error).message}`);
      skipped++;
    }
  }

  // ── Upsert corrective actions ────────────────────────────────────────────
  for (const action of actions) {
    try {
      const data = {
        id:               action.id,
        inspectionId:     action.inspectionId,
        inspectionItemId: action.inspectionItemId,
        facilityId:       action.facilityId,
        facilityName:     action.facilityName,
        criteria:         action.criteria,
        severity:         action.severity,
        deadline:         new Date(action.deadline),
        assignedTo:       action.assignedTo,
        status:           action.status,
        notes:            action.notes,
        createdAt:        new Date(action.createdAt),
        updatedAt:        new Date(action.updatedAt),
        closedAt:         action.closedAt ? new Date(action.closedAt) : undefined,
      };
      await prisma.correctiveAction.upsert({
        where:  { id: action.id },
        update: { ...data, id: undefined },
        create: data,
      });
      synced++;
    } catch (e) {
      errors.push(`action ${action.id}: ${(e as Error).message}`);
      skipped++;
    }
  }

  // ── Upsert agenda items ───────────────────────────────────────────────────
  for (const item of agenda) {
    try {
      const data = {
        id:              item.id,
        facilityId:      item.facilityId,
        facilityName:    item.facilityName,
        facilityAddress: item.facilityAddress,
        activity:        item.activity,
        date:            new Date(item.date),
        notes:           item.notes,
        status:          item.status,
        inspectionId:    item.inspectionId,
      };
      await prisma.agendaItem.upsert({
        where:  { id: item.id },
        update: { ...data, id: undefined },
        create: data,
      });
      synced++;
    } catch (e) {
      errors.push(`agenda ${item.id}: ${(e as Error).message}`);
      skipped++;
    }
  }

  // ── Notify supervisors about newly completed inspections ─────────────────
  if (newlyCompleted.length > 0) {
    sendPushToSupervisors(
      `تقرير تفتيش جديد بانتظار المراجعة (${newlyCompleted.length})`,
      'يُرجى الدخول إلى قائمة الموافقات.',
      { type: 'NEW_APPROVAL_PENDING' },
    ).catch(err => console.warn('[push] supervisor notify failed:', err));
  }

  res.json({ synced, skipped, errors });
});

export default router;

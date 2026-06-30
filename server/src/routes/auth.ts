// server/src/routes/auth.ts
//
// POST /auth/login
//   Body: { matricule: string, password: string }
//   Returns: { token: string, inspector: { id, name, matricule, role, officeName } }
//
// POST /auth/register-push-token
//   Auth: Bearer JWT
//   Body: { token: string }   (Expo push token)
//   Returns: { ok: true }
//
// POST /auth/me
//   Auth: Bearer JWT
//   Returns: inspector profile

import { Router } from 'express';
import bcrypt    from 'bcryptjs';
import jwt       from 'jsonwebtoken';
import { z }     from 'zod';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// ── POST /auth/login ─────────────────────────────────────────────────────────
const LoginSchema = z.object({
  matricule: z.string().min(2).max(50),
  password:  z.string().min(4).max(128),
});

router.post('/login', async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'بيانات غير صحيحة', details: parsed.error.issues });
    return;
  }

  const { matricule, password } = parsed.data;

  const inspector = await prisma.inspector.findUnique({ where: { matricule } });
  if (!inspector) {
    res.status(401).json({ error: 'رقم التسجيل أو كلمة المرور غير صحيحة' });
    return;
  }

  const valid = await bcrypt.compare(password, inspector.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'رقم التسجيل أو كلمة المرور غير صحيحة' });
    return;
  }

  const token = jwt.sign(
    { inspectorId: inspector.id, matricule: inspector.matricule, role: inspector.role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? '30d' } as jwt.SignOptions,
  );

  res.json({
    token,
    inspector: {
      id:         inspector.id,
      name:       inspector.name,
      matricule:  inspector.matricule,
      role:       inspector.role,
      officeName: inspector.officeName,
    },
  });
});

// ── POST /auth/register-push-token ───────────────────────────────────────────
const PushTokenSchema = z.object({
  token: z.string().min(10),
});

router.post('/register-push-token', requireAuth, async (req, res) => {
  const parsed = PushTokenSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid push token' });
    return;
  }

  const { token } = parsed.data;
  const inspectorId = req.inspector!.inspectorId;

  // Upsert: same token might re-register after app reinstall
  await prisma.pushToken.upsert({
    where:  { token },
    update: { inspectorId, updatedAt: new Date() },
    create: { token, inspectorId },
  });

  res.json({ ok: true });
});

// ── GET /auth/me ──────────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  const inspector = await prisma.inspector.findUnique({
    where:  { id: req.inspector!.inspectorId },
    select: { id: true, name: true, matricule: true, role: true, officeName: true },
  });

  if (!inspector) {
    res.status(404).json({ error: 'Inspector not found' });
    return;
  }

  res.json({ inspector });
});

export default router;

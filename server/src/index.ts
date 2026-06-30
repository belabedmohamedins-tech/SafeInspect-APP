// server/src/index.ts
import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRouter     from './routes/auth';
import syncRouter     from './routes/sync';
import approvalsRouter from './routes/approvals';

const app  = express();
const PORT = Number(process.env.PORT ?? 3000);

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (process.env.CORS_ORIGINS ?? '').split(',').map(s => s.trim()).filter(Boolean),
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' })); // 10 MB to accommodate photo URIs in sync batches

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use('/auth', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

app.use('/sync', rateLimit({
  windowMs: 60 * 1000,  // 1 min
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/auth',      authRouter);
app.use('/sync',      syncRouter);
app.use('/approvals', approvalsRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0', ts: new Date().toISOString() });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((
  err: Error,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction,
) => {
  console.error('[ERROR]', err.message, err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🛡️  SafeInspect API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);
});

export default app;

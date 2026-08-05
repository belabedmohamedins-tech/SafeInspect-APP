// server/src/index.ts — SafeInspect API server entry point
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT ?? 3000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());

// ── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'SafeInspect API', timestamp: new Date().toISOString() });
});

// ── Routes ──────────────────────────────────────────────────────────────────
// Routes are loaded dynamically so the server can start even if a route module
// is still under development.
async function loadRoutes(): Promise<void> {
  try {
    const routeFiles = ['auth', 'inspections', 'facilities', 'reports'];
    for (const name of routeFiles) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require(`./routes/${name}`);
        const router = mod.default ?? mod.router;
        if (router) {
          app.use(`/api/${name}`, router);
        }
      } catch {
        // Route module not yet implemented — skip silently
      }
    }
  } catch (err) {
    console.warn('Route loading error:', err);
  }
}

// ── Start ────────────────────────────────────────────────────────────────────
loadRoutes().then(() => {
  app.listen(PORT, () => {
    console.log(`SafeInspect API listening on port ${PORT}`);
  });
});

export default app;

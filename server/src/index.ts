// server/src/index.ts — SafeInspect API server entry point
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT ?? 3000;

// ── Middleware ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'SafeInspect API', timestamp: new Date().toISOString() });
});

// ── Routes ──────────────────────────────────────────────────────────────────
// Auto-scan server/src/routes/ so a route file that exists is always mounted.
// This prevents the class of bug where a fully-built module (sync, approvals)
// is skipped because someone forgot to add its name to a hardcoded list.
async function loadRoutes(): Promise<void> {
  const routesDir = path.join(__dirname, 'routes');

  let routeFiles: string[];
  try {
    routeFiles = fs
      .readdirSync(routesDir)
      .filter((f) => f.endsWith('.ts') || f.endsWith('.js'))
      .map((f) => f.replace(/\.(ts|js)$/, ''));
  } catch (err) {
    console.warn('[routes] Could not read routes directory:', err);
    return;
  }

  for (const name of routeFiles) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require(`./routes/${name}`) as { default?: unknown; router?: unknown };
      const router = mod.default ?? mod.router;
      if (router) {
        app.use(`/api/${name}`, router);
        console.log(`[routes] Mounted /api/${name}`);
      } else {
        console.warn(`[routes] ${name}.ts has no default export or .router — skipped`);
      }
    } catch (err) {
      // Warn explicitly — silent swallow was masking missing mounts (SPEC 09)
      console.warn(`[routes] Failed to load route module '${name}':`, err);
    }
  }
}

// ── Start ──────────────────────────────────────────────────────────────────────
loadRoutes().then(() => {
  app.listen(PORT, () => {
    console.log(`SafeInspect API listening on port ${PORT}`);
  });
});

export default app;

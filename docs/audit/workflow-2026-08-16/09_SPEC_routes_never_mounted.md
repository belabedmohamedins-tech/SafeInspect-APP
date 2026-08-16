# SPEC 09 — The sync/approval network chain is broken end-to-end: routes
never mounted, then a path-prefix mismatch, then a wrong endpoint entirely
Priority: P0 — fix before SPEC 08 (that fix is moot if this endpoint isn't
reachable at all). Dependencies: none. Scope note: this spec covers only
the routing/connectivity chain for sync and approvals. Unrelated smaller
server-side findings from the same area of the codebase are in SPEC 12 —
keep them separate to avoid scope bleed in a single PR.

## Problem 1 — the routes are never mounted
`server/src/index.ts`'s `loadRoutes()` is the ONLY place any route module
gets attached to the Express app (confirmed — grepped the whole server
tree for `app.use`, no other call site exists):
```js
const routeFiles = ['auth', 'inspections', 'facilities', 'reports'];
for (const name of routeFiles) {
  try {
    const mod = require(`./routes/${name}`);
    const router = mod.default ?? mod.router;
    if (router) app.use(`/api/${name}`, router);
  } catch {
    // Route module not yet implemented — skip silently
  }
}
```
The actual files present in `server/src/routes/` are `auth.ts`,
`approvals.ts`, `sync.ts` (confirmed via `ls`). Cross-referencing:
- `auth.ts` → matches `'auth'` in the list → correctly mounted at `/api/auth`.
- `'inspections'`, `'facilities'`, `'reports'` → in the list, but no
  matching files exist → the `require()` throws, caught and silently
  swallowed as "not yet implemented."
- **`sync.ts` and `approvals.ts` → fully implemented (Zod schemas, Prisma
  upserts, push notifications — see SPEC 08 for `sync.ts`'s content) but
  never appear in `routeFiles` at all → never mounted, at any path.**

As currently deployed, the running server only exposes `/api/auth/*`. Any
request to wherever `sync.ts`/`approvals.ts` were intended to be mounted
currently 404s. If this server deployment is what's actually running in
the field, cloud sync and server-side approval are not just buggy
(SPEC 08, SPEC 02) — they are currently completely non-functional, full
stop. If a different branch or deployment does mount these correctly, that
needs to be identified and reconciled with what's in `main` — flag this
explicitly to the maintainer, don't assume either way.

## Problem 2 — fixing the mount alone still isn't enough: path-prefix
## mismatch between client and server
`src/services/SyncService.ts` calls `apiClient('/sync', ...)`, and
`apiClient.ts`'s own doc comment shows `apiClient('/facilities')` and
`apiClient('/sync/inspections')` as intended usage — no `/api` prefix
anywhere on the client side. But `index.ts`'s mounting convention is
`app.use(`/api/${name}`, router)` — so once `'sync'` is added to
`routeFiles` per Problem 1's fix, the route lives at `/api/sync`, not
`/sync`. Unless `EXPO_PUBLIC_SYNC_API_URL` is configured to already
include `/api` as part of its base (undocumented, unconfirmed, fragile if
so), the client's request and the server's mount point still won't line
up even after Problem 1 is fixed. Recommend making the client's `/api`
prefix explicit in code (either `apiClient.ts` prepends it, or
`SyncService.ts` calls `apiClient('/api/sync')`) rather than relying on an
undocumented env var convention.

## Problem 3 — even with both fixed, the one approval path that DOES call
## the server targets a completely different, wrong endpoint
An earlier pass of this audit stated "no client caller of /api/approvals
exists" — that was incomplete; corrected here. `src/repositories/
ApprovalRepository.ts` DOES call out to the server, via
`serverAuth.approveInspection(inspectionId, note)` /
`.rejectInspection(inspectionId, reason)`, wrapped in a well-built
fire-and-forget `syncToServer()` helper. Tracing exactly what those
functions call reveals three independent, stacking mismatches:

1. **Wrong path.** `serverAuth.ts` calls
   `POST ${getApiUrl()}/inspections/${inspectionId}/approve` (and `/reject`).
   The server's actual approval logic lives in `approvals.ts`, which (once
   mounted per Problem 1) would live at `/api/approvals/:id/approve` — a
   completely different resource path.
2. **The route doesn't exist at all, not even unmounted.** There is no
   `inspections.ts` route file anywhere in `server/src/routes/` (confirmed
   — only `auth.ts`, `approvals.ts`, `sync.ts` exist). `/inspections/*`
   isn't a route that's failing to mount; it was never written. This call
   will 404 regardless of whether Problems 1 and 2 are fixed.
3. **Even the ID semantics don't match.** `approvals.ts`'s
   `POST /:id/approve` looks up `prisma.approval.findUnique({ where: { id
   } })` — `:id` is the `Approval` record's own id. The client passes
   `inspectionId` into that position. Even if the path were corrected to
   point at `approvals.ts`, the lookup would fail with "Approval not
   found" unless the caller first resolves the inspection's associated
   `Approval.id` (`sync.ts` creates one automatically when an inspection
   completes — the client would need to fetch or already know that id,
   not reuse the inspection's own id).

Resolve by either: (a) add a real
`POST /api/approvals/by-inspection/:inspectionId/approve` convenience
route server-side that resolves the Approval internally (simplest for the
client), or (b) have the client fetch/track the `Approval.id` and call the
existing `/api/approvals/:id/approve` correctly. Recommend (a) — the
client shouldn't need to know about the separate `Approval` record's
existence at all.

## Important note for Perplexity — this was marked "confirmed clean," it
## isn't; the gap is easy to miss and worth explaining precisely
The repo's own maintenance log (`docs/README.md`) shows **W53 marked this
exact issue (F-18, the local/server approval disconnect) "CLOSED —
confirmed clean" on 2026-08-11**, describing the `syncToServer()`
fire-and-forget wrapper with `SERVER_SYNC_PENDING` fallback logging. That
description is accurate as far as it goes — the wrapper itself
(non-blocking, never throws, logs failures for retry) is genuinely
well-built. What that review didn't catch: tracing `syncToServer` one
level deeper into the `serverAuth.approveInspection()`/
`.rejectInspection()` call it wraps shows the call targets a route that
doesn't exist anywhere on the server, so it will 404 on every single
invocation. Additionally — checked directly — **nothing anywhere in the
codebase actually reads `SERVER_SYNC_PENDING` audit entries to retry
them**; the comment `'server sync threw — will retry'` describes a retry
path that was never implemented. So the full picture: every approval
correctly commits locally, correctly attempts a server call, that call
always fails, the failure is correctly logged, and then nothing ever
retries it — permanently. This is worth flagging to Perplexity explicitly
as a case where the wrapper's own correctness made the deeper problem easy
to miss on a prior pass; recommend reopening W53 alongside this fix rather
than treating it as a new, unrelated issue.

## Desired behavior
1. Add `'sync'` and `'approvals'` to `routeFiles` in `loadRoutes()` (or
   replace the hardcoded list with an actual directory scan of
   `server/src/routes/` so this class of bug — a route file existing but
   never being wired in — can't recur silently).
2. Remove `'inspections'`, `'facilities'`, `'reports'` from the list if
   those modules were never actually built, or confirm with the
   maintainer whether they're planned and just missing.
3. The silent `catch` swallowing route-load failures should at minimum
   `console.warn` which module failed and why.
4. Fix the path-prefix mismatch per Problem 2.
5. Fix the approval endpoint per Problem 3's recommended option (a).
6. Add a retry mechanism for stuck `SERVER_SYNC_PENDING` entries — decide
   where this logic should live (the sync engine, a background task, or
   an explicit retry action) as part of this fix, since fixing the routes
   alone doesn't help entries already stuck from before the fix landed.

## Reason
This is the same class of bug as SPEC 08 (client/server contract drift)
but one layer up — the endpoint itself was never wired in, not just
mis-validated once reached. It's the highest-leverage fix in this entire
audit if confirmed to be the actual deployed state: everything else in the
sync/approval chain (the well-designed Zod schemas, the correct Prisma
upserts, the `requireRole` authorization) is real working code that simply
isn't being executed or isn't being reached correctly.

## Affected files
- `server/src/index.ts` (`loadRoutes()`)
- `src/services/apiClient.ts` and/or `src/services/SyncService.ts`
  (path-prefix fix — pick one location, don't split it across both)
- `src/services/serverAuth.ts` and/or `server/src/routes/approvals.ts`
  (Problem 3's endpoint fix)

## Tests required
- Integration test: start the Express app, `POST /api/sync` with a valid
  batch → assert 200, not 404.
- Integration test: `GET /api/approvals` with a valid supervisor JWT →
  assert 200, not 404.
- Regression: `GET /api/auth/me` still works after the loader change.
- Client-side: confirm `SyncService.flush()`'s constructed URL actually
  matches the server's mount point after both fixes land.
- Integration test: approve an inspection via `ApprovalRepository.approve()`
  → assert the server call succeeds (200), not a 404 — the regression test
  for Problem 3.
- Test asserting a `SERVER_SYNC_PENDING` audit entry actually gets
  retried by something once point 6 is implemented.

# SPEC 08 — Server sync schemas are missing real client enum values in TWO
places (severity, inspection status), blocking entire sync batches
Priority: P0 — highest priority of all specs in this delivery, alongside
SPEC 09 (fix 09 first, since the endpoint must be reachable before this
matters). Dependencies: SPEC 09.

## Problem A — severity
`server/src/routes/sync.ts`'s `InspectionItemSchema` validates each
inspection item's severity as:
```
severity: z.enum(['low', 'medium', 'high']),
```
The client's `Severity` type (`src/types.ts`, used consistently across
`scoringUtils.ts`, `decisionSupport.ts`, `capFactory.ts`,
`corrective-actions.tsx`, etc.) is `'critical' | 'high' | 'medium' | 'low'`.
`'critical'` is a real, actively-produced value — it's the value that
triggers the decision engine's override logic (3+ critical findings force
`immediate-closure`; see `decisionSupport.ts`).

## Problem B — inspection status (found in a follow-up pass reading the
## Prisma schema; same file, same bug class, likely more damaging)
The same file's `InspectionSchema` validates:
```
status: z.enum(['completed', 'in-progress', 'draft']),
```
But the client's real `SavedInspection.status` type (`src/types.ts` line
265) is:
```
'completed' | 'in-progress' | 'draft' | 'submitted' | 'pending-review' | 'approved' | 'rejected'
```
Four of seven real values aren't in the server's enum. This means **no
inspection that has been submitted, is pending review, or has been
approved/rejected can ever sync successfully** — since Problem C below
means one bad value fails the whole batch, this is not a minor gap, it
blocks syncing the single most important lifecycle stage of every
inspection that reaches approval.

There's a second, independent bug even if the enum gets widened:
`mapStatus()` (used to convert the client string to the Prisma
`InspectionStatus` enum for the DB write) is:
```js
function mapStatus(s: string | undefined) {
  const map: Record<string, string> = {
    'completed': 'COMPLETED', 'in-progress': 'IN_PROGRESS', 'draft': 'DRAFT',
  };
  return (map[s ?? ''] ?? 'IN_PROGRESS') as 'COMPLETED' | 'IN_PROGRESS' | 'DRAFT';
}
```
It silently falls back to `'IN_PROGRESS'` for any unmapped value. Today
this fallback is unreachable in practice (the Zod gate rejects those
values first), but if only the Zod enum is widened without also fixing
this mapping, an **approved, finalized inspection would sync successfully
and then be silently mis-recorded as "in progress" in the server
database** — wrong in the opposite, quieter direction. The Prisma
`InspectionStatus` enum itself (`COMPLETED | IN_PROGRESS | DRAFT`) would
also need widening to represent the full lifecycle, or a decision to keep
richer status only in `approvalStatus`/`Approval` and map `status` down to
a simpler three-state representation deliberately (see Problem D below for
why that's currently ambiguous too).

## Problem C — both A and B fail because of the same all-or-nothing gate
`POST /sync`'s handler validates the ENTIRE request body in one call:
```
const parsed = SyncBatchSchema.safeParse(req.body);
if (!parsed.success) {
  res.status(400).json({ error: 'Invalid sync payload', details: parsed.error.issues });
  return;
}
```
Any single non-conforming value anywhere in the batch — one critical
severity item, one approved inspection — fails validation for the whole
request. Nothing in that batch is processed, not just the offending
record. There is no server-side error visible to the inspector explaining
why (per `SyncService.ts`'s flush logic — a 400 is treated as a generic
failure and retried with the same payload, failing the same way forever).

## Problem D — CONFIRMED NOT A BUG (checked, worth recording so it isn't
## re-flagged later): `Inspection.approvalStatus` and `Approval.status`
`server/prisma/schema.prisma` has both a denormalized `approvalStatus` on
`Inspection` and a separate `Approval` model — two representations of the
same fact, which is the kind of thing the original audit brief's "duplicated
sources of truth" concern (section 13) would flag on sight. Checked
`POST /:id/approve` in `approvals.ts` directly: it correctly wraps both
updates in `prisma.$transaction([...])`, keeping them atomically in sync,
and separately guards against double-approval (`if (approval.status !==
'PENDING')`). No fix needed here — recording this so a future pass doesn't
re-flag it without checking.

## Problem E — client-side filter UI also only handles 2 of 7 status
## values (found in a follow-up pass — the same incompleteness pattern as
## Problem B, but in the main inspections list screen, not the server)
`src/hooks/useInspectionList.ts` (used by `app/(tabs)/inspection/index.tsx`
— the main inspections list tab) filters with:
```
activeFilter: 'all' | 'completed' | 'in-progress'
...
.filter(i => activeFilter === 'all' || i.status === activeFilter)
```
Same gap as Problem B: `SavedInspection.status` has 7 real values. An
inspection that's `submitted`, `pending-review`, `approved`, or `rejected`
never matches the `'completed'` filter button, even though it was
completed and has simply progressed further through the approval
workflow. A user filtering to "completed" to review their finished work
would not see anything past that stage — those inspections only reappear
if they switch back to "all." Not a server/sync issue like the rest of
this spec, but the identical root pattern (the status enum has grown to 7
values across this codebase's history, and not every consumer was updated
to match) — worth fixing in the same pass since it's the same bug class
and easy to miss again otherwise.

## Confirmed severity of impact
Problem A defeats the critical-override decision logic. Problem B is
arguably worse in practice — it means the entire approval workflow this
whole audit has focused on (SPEC 02, SPEC 09) currently has no working path
to the server at all, since an approved inspection can never sync
successfully as things stand.

## Desired behavior
1. Add `'critical'` to `InspectionItemSchema.severity`'s enum.
2. Add `'submitted'`, `'pending-review'`, `'approved'`, `'rejected'` to
   `InspectionSchema.status`'s enum, AND update `mapStatus()` to handle
   them (either widen the Prisma `InspectionStatus` enum to match, or make
   a deliberate, documented decision to collapse them to `COMPLETED`
   server-side since `approvalStatus`/`Approval` already carries the
   finer-grained state — don't leave the mapping silently lossy either
   way).
3. Audit every other enum-typed field in `server/src` for the same class
   of gap — at minimum check `ActionSchema.severity` (currently a loose
   `z.string()`, won't reject unknown values, but confirm nothing
   downstream has a narrower constraint) and `mapInspectionType()`.
4. Change `POST /sync` to validate and process records individually
   rather than all-or-nothing: iterate the raw array, `safeParse` each
   inspection/action/agenda entry separately, process the valid ones, and
   collect per-record validation failures into the existing `errors[]`
   array instead of failing the whole request. This is the more important
   structural fix — it prevents any single malformed or newly-added field
   value from ever blocking an entire batch again, which is the actual
   root cause class here, not just these two enums.
5. Prisma `severity` column check — confirmed, no migration needed there;
   it's a loose `String`. `InspectionStatus` DOES need a decision per
   point 2.
6. For Problem E: either add explicit filter options for the post-
   completion states, or (simpler, likely more correct) treat `'completed'`
   as matching all of `completed | submitted | pending-review | approved |
   rejected` — i.e. "finished the checklist" rather than "exactly equal to
   the literal string 'completed'" — since that's almost certainly what a
   user filtering by "completed" actually means. Flag the exact semantics
   to the maintainer rather than assuming.
7. Note: there is no server-side test suite at all currently (confirmed —
   no `.test.ts`/`.spec.ts` anywhere under `server/`). The tests below
   would be the first server-side tests in this repo — flag whether that's
   in scope here or a separate infrastructure task.

## Reason
This is a client/server contract drift bug appearing twice in the same
file, and the status version specifically means the approval workflow this
audit spent multiple sessions verifying client-side currently has no
working path to institutional (server) record-keeping at all.

## Affected files
- `server/src/routes/sync.ts` (`InspectionItemSchema`, `InspectionSchema`,
  `mapStatus()`, `POST /sync` handler)
- `server/prisma/schema.prisma` (`InspectionStatus` enum — only if the
  widen-rather-than-collapse decision in point 2 is chosen)
- `src/hooks/useInspectionList.ts` (Problem E)

## Tests required
This would be the first server-side test file in the repo for the server
half; the last item below is client-side.
- Sync a batch containing one inspection with an item at
  `severity: 'critical'` → assert 200/success and the record is persisted.
- Sync a batch containing one inspection at `status: 'approved'` → assert
  200/success and the record's stored status correctly reflects approval
  (not silently mapped to `IN_PROGRESS`).
- Sync a batch with one valid inspection and one genuinely malformed
  inspection (e.g. missing required `id`) → assert the valid one is still
  persisted and the malformed one's error is reported in `errors[]`, not a
  whole-batch 400 — the regression test for point 4's per-record
  validation change.
- `useInspectionList` test: seed inspections at each of the 7 status
  values, assert the `'completed'` filter shows the ones the fixed
  semantics from point 6 says it should.

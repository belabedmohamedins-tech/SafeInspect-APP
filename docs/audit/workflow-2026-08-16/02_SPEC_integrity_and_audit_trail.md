# SPEC 02 — Two inconsistent approval code paths: one correct, one broken
Priority: P0. Dependencies: none (pairs well with SPEC 01 since hash storage
should also move into the backup payload once SPEC 01 lands).

## Problem — the app has TWO independent implementations of "approve/reject
an inspection," reachable from two different entry points, with different
reliability guarantees. This was mis-scoped in an earlier pass of this
audit as a single-function bug — tracing every real caller shows it's
actually a duplication problem.

### Path A (correct locally; server call is separately broken — see SPEC 09)
Calls `ApprovalRepository.approve()` / `.returnForRevision()` / `.escalate()`.
These functions call `InspectionRepository.save()` with the mutated
inspection (`approvalStatus`, `approvedBy`, `approvedAt` set). `save()`
correctly calls `IntegrityService.hashAndStore()` on every save, so the hash
stays valid. `ApprovalRepository` also calls `AuditLogRepository.append()`
after every action (currently under the generic `'INSPECTION_SAVED'` action
type with a descriptive detail string, not a dedicated action type — minor
secondary gap, see Desired Behavior). It ALSO now calls
`serverAuth.approveInspection()`/`.rejectInspection()` to notify the
server — but that call targets a nonexistent route with mismatched ID
semantics; see SPEC 09's addendum for the full breakdown. Not this spec's
concern (the local hash/audit-trail correctness this spec is about is
unaffected by whether the server call succeeds), but worth knowing the
"correct" path isn't fully correct end-to-end either.

### Path B (broken) — push notification → supervisor-approvals.tsx
`app/_layout.tsx`'s notification handler routes directly to
`/screens/supervisor-approvals`, which calls
`InspectionRepository.updateStatus(item.id, 'approved' | 'rejected')`
directly — bypassing `ApprovalRepository` entirely. `updateStatus()`
mutates `approvalStatus` on the stored inspection but never calls
`hashAndStore()` or `AuditLogRepository.append()`. Since
`IntegrityService.verifyInspection()` recomputes the hash from the current
object (which now includes the new `approvalStatus`) and compares it
against a hash computed before that field existed, `verifyInspection()`
reports `ok: false` for any inspection approved/rejected via this path —
a false positive. There's also no audit trail entry for the action at all.

**Net effect: whether an approval is hash-valid and audit-logged currently
depends on whether the supervisor tapped a push notification or browsed
the menu to get there — not on anything about the approval itself.**

## Confirmed user-facing impact
This isn't only an internal data-integrity abstraction. `components/
inspection/IntegrityBadge.tsx` calls `verifyInspection()` directly and
renders on both `app/reports/[id].tsx` and `app/preview/index.tsx` — the
report screen and the final printable preview. When `ok: false`, it shows
a red "⚠ تحذير: تم التعديل" ("Warning: modified") badge. Any inspection
approved via Path B currently displays this false tamper warning to
whoever opens its report afterward — the inspector who did nothing wrong,
or a supervisor re-checking their own correctly-approved report.

## Desired behavior
Do not fix `updateStatus()` in place — that would leave two parallel
implementations to keep in sync forever. Instead:
1. Change `supervisor-approvals.tsx` to call the same
   `ApprovalRepository.approve()` / `.returnForRevision()` methods that
   `approval-detail.tsx` uses, removing its direct
   `InspectionRepository.updateStatus()` calls entirely.
2. Once nothing calls `InspectionRepository.updateStatus()` for inspections
   (grep confirmed only these two call sites, plus an unrelated
   `CorrectiveActionRepository.updateStatus()` which is a different function
   on a different repository — not in scope here), consider removing
   `InspectionRepository.updateStatus()` or clearly marking it
   deprecated/internal-only to prevent a third inconsistent caller being
   added later.
3. Secondary: give approval actions their own `AuditAction` entry
   (e.g. `'INSPECTION_APPROVAL_STATUS_CHANGED'`) instead of the generic
   `'INSPECTION_SAVED'`, so the audit log can be filtered/queried
   specifically for approval events (section 9 traceability).

## Reason
The hash and the audit trail are the two mechanisms this app relies on to
claim a report is legally defensible. Right now that claim depends on
internal navigation history, which no reviewer would think to check.
Unifying on the already-correct `ApprovalRepository` path is less work and
more robust than patching the broken one to match it.

## Affected files
- `app/screens/supervisor-approvals.tsx` (replace direct
  `InspectionRepository.updateStatus()` calls with
  `ApprovalRepository.approve()` / `.returnForRevision()`)
- `src/repositories/InspectionRepository.ts` (`updateStatus` — deprecate or
  remove once unused)
- `src/repositories/AuditLogRepository.ts` (`AuditAction` union — add the
  dedicated approval action type)
- `src/repositories/ApprovalRepository.ts` (switch its own audit calls to
  the new dedicated action type)

## Existing test coverage — this exact bug has zero coverage
`InspectionRepository.updateStatus()` — Path B, the broken one — has no
tests in either `src/__tests__/repositories/InspectionRepository.test.ts`
or `.extended.test.ts` (confirmed via grep, zero matches).
`src/__tests__/IntegrityService.test.ts` is thorough for the service in
isolation (`computeHash`, `verifyInspection`, `hashAndStore`, `removeHash`)
but never exercises it through the approval workflow end-to-end. This is
why the bug shipped silently — write the two-entry-point regression test
below as new coverage, not as a replacement for existing passing tests.

## Additional finding — the audit trail has no server-side existence at all
Checked `server/prisma/schema.prisma` in full: there is no `AuditLog`
model anywhere, and `sync.ts`'s sync payload only carries inspections,
actions, and agenda items — never audit log entries. This means even after
fixing the client-side bug this spec describes, the audit trail
(`AuditLogRepository`, `AuditAction` entries) exists ONLY on the
inspector's own device. A hypothetical supervisor/administrator reviewing
from a server-side or web context has zero access to who-did-what history.
It also means the audit trail is more fragile than the inspection data
itself — if a device is lost, reset, or the app reinstalled (recall SPEC
05's finding that PIN-lockout recovery is currently destructive), the
entire audit trail for that inspector's work is permanently and
irrecoverably gone, with no institutional copy anywhere. Recommend: add an
`AuditLog` model to the Prisma schema and include audit entries in the
sync payload — same treatment as inspections/actions/agenda. This is a
larger addition than the rest of this spec; flag it to the maintainer as
a distinct follow-up item rather than assuming it belongs in the same PR
as the dual-approval-path fix above.

## Additional finding — anyone can clear their own audit log, not just a
## supervisor/admin
`app/screens/audit-log.tsx`'s clear button calls
`AuditLogRepository.clear(inspectorName)` with no role check anywhere in
the call chain — any user viewing their own local audit log can wipe it.
The mechanism itself is well-designed (`clear()` inserts a sentinel
`'AUDIT_LOG_CLEARED'` row attributing who cleared it and when, BEFORE
deleting everything else, so the act of clearing is itself recorded) — but
combined with the "no server-side audit log at all" finding above, once
cleared, the actual history is genuinely and permanently gone except for
that one attribution row. For a system whose stated purpose is holding
inspectors accountable, the person the log is meant to hold accountable
currently has an unrestricted way to erase it. Recommend gating this
action to `SUPERVISOR`/`ADMIN` role (once local role has real meaning —
see SPEC 09's note that the local `profile_role` field is currently
self-declared and has no enforcement), or removing self-service clearing
entirely in favor of a server-side retention/archival policy once the
audit trail has a server home.

## Tests required
- Approve an inspection via the `supervisor-approvals.tsx` code path (now
  routed through `ApprovalRepository`) → call `verifyInspection()` → assert
  `ok: true`.
- Assert `AuditLogRepository.getByInspection(id)` contains an approval
  entry after using EITHER entry point (notification or menu) — same
  outcome from both, which is the actual bug being fixed.
- Regression: `INSPECTION_LOCKED` still thrown by `save()`/`delete()` on an
  approved inspection after this change.

# SPEC 03 — Corrective actions carry no evidence; resolved/closed semantics
don't match the documented model; deleting an inspection orphans its CAPs
Priority: P1. Dependencies: none (independent of SPEC 01/02/04).

## Problem A — no evidence or legal-basis linkage on the CAP record
`src/services/capFactory.ts` (`createCapItemsFromInspection`) creates a
`CorrectiveAction` from each non-compliant `InspectionItem` but only copies
`criteria` and `notes` (from `item.comment`). It never copies
`item.photoUri` / `item.photos` / `item.legalReference` / `item.numericValue`.
The `CorrectiveAction.finding` field (documented in `src/types.ts` as "Used
as the display label in NearDeadlineWidget and CAP list screens") is never
populated at all — it's silently blank everywhere it's shown.

A supervisor or administrator reviewing the CAP list independently of the
original inspection cannot see the photo evidence or legal basis behind a
given corrective action without navigating back via `inspectionId` /
`inspectionItemId` — and that back-reference isn't guaranteed to still
resolve to anything (see Problem C).

## Problem B — resolved vs. closed don't match the documented distinction
`src/types.ts`'s `ActionStatus` doc comment explicitly distinguishes:
'resolved' = facility reports it is fixed (pending inspector verification)
vs 'closed' = inspector verified and closed. But
`CorrectiveActionRepository.updateStatus()` stamps `closedAt` when status
becomes `'resolved'`, not when it becomes `'closed'` — conflating the
facility's self-report with administrative verification. There is also no
field anywhere on `CorrectiveAction` to record verification evidence (a
re-inspection photo, the verifying inspector's identity) for the actual
closure step — only a freeform `notes` string.

## Problem C — orphaned CAPs on inspection delete
`InspectionRepository.delete()` never calls
`CorrectiveActionRepository.deleteByInspection()`. Deleting a
draft/rejected inspection leaves any corrective actions already generated
from it pointing at a dead `inspectionId`.

## Desired behavior
1. Extend `CorrectiveAction` (types + `corrective_actions` table + a
   migration) with: `finding` (populate from a short description derived
   from `item.criteria`/`item.comment` at creation time — not left blank),
   `legalReference` (copy from `item.legalReference`), `photoUri`/`photos`
   (copy from the item at creation time — denormalized snapshot, so it
   survives even if the source inspection item later changes).
2. Add verification fields: `verifiedBy?: string`, `verificationNote?: string`,
   `verificationPhotoUri?: string`. `updateStatus()` only stamps `closedAt`
   when the new status is `'closed'`, and requires (at the call-site /
   screen level) that verification fields are supplied for that transition.
3. `InspectionRepository.delete()` calls
   `CorrectiveActionRepository.deleteByInspection(id)` before/after its own
   delete (atomically if possible) — OR, if orphaned CAPs should instead be
   preserved as historical record, change the desired behavior to marking
   them with a `sourceInspectionDeleted: true` flag instead of silent
   dangling references. Flag this design choice to the maintainer rather
   than assuming.

## Problem D — two of three deadline-reminder mechanisms are never invoked
`src/services/CapNotificationService.ts` implements three real, well-built
notification strategies (per-item deadline alerts, a daily digest, a
weekly Monday digest — correct Android channels, run-once-per-day guards,
Expo Go compatibility guards). Confirmed via full-codebase grep for each
exported scheduling function: only `scheduleCapDeadlineNotifications()` is
ever called (from `app/(tabs)/home.tsx` on load).
`scheduleCapDigestNotification()` and `scheduleCapWeeklyDigest()` are
exported, fully implemented, and referenced in the file's own header
comment as core features ("B) Daily grouped digest," "C) Weekly Monday
digest") — but have zero callers anywhere in the app. This is the same
class of bug as the server route-mounting issue found elsewhere in this
audit (a fully-built feature that was never wired into anything that
invokes it) — worth mentioning to Perplexity as a pattern to watch for
generally, not just fix here.

## Problem E — two smaller UI-layer echoes of the CAP evidence/lifecycle
theme, found in the home-screen widgets (lower severity than A-D, grouped
here rather than given separate write-ups)
- `components/home/NearDeadlineWidget.tsx` titles itself
  `مواعيد قريبة ({items.length})`, but `items` is already
  `near.slice(0, 5)` — capped at 5 for display. If there are actually 8
  near-deadline corrective actions, the title reads "(5)", not "(8)".
  Self-consistent with the list shown below it (unlike the `loadHomeData`
  bug elsewhere in this audit), so lower severity, but still silently
  truncates the count a user would reasonably read as a total.
- `components/home/CapStatsWidget.tsx` renders a "مُغلَقة" (Closed) stat
  from `CorrectiveActionRepository.getStats()`, which buckets with
  `else stats.resolved++` — anything that isn't `open`/`in-progress`/
  `overdue` falls into that one bucket, meaning `'resolved'` (facility
  self-report, not yet verified) and `'closed'` (inspector-verified) are
  counted together and displayed under the "Closed" label. This is the
  same resolved-vs-closed conflation as Problem B, just visible in the
  stats UI too — worth fixing together once Problem B's verification
  model is settled, not as a separate effort.

## Reason
This is the same "evidence doesn't travel with the finding" pattern as
SPEC 04, at the CAP layer instead of the sync/backup layer. And the
resolved/closed conflation means the app's own documented model (self-report
vs. administratively-verified closure) isn't actually enforced anywhere,
weakening the audit trail for exactly the events regulators would ask about
first ("was this actually verified fixed, or did the facility just say so?").

## Affected files
- `src/types.ts` (`CorrectiveAction` interface)
- `src/db/schema.ts` (new migration for the added columns)
- `src/services/capFactory.ts` (populate new fields at creation)
- `src/repositories/CorrectiveActionRepository.ts` (`rowToCap`, `save`,
  `updateStatus` — closedAt logic, verification fields)
- `src/repositories/InspectionRepository.ts` (`delete` — CAP cleanup or
  flagging, per the design decision above)
- CAP-related screens (`app/screens/cap.tsx`, `app/(tabs)/cap.tsx`,
  `app/screens/corrective-actions.tsx`) — display the new fields, and gate
  the resolved→closed transition on verification input

- `app/(tabs)/home.tsx` (Problem D — add the two missing call sites; confirm
  the right lifecycle hook, e.g. same effect as the existing call, or app
  startup/foreground)
- `components/home/NearDeadlineWidget.tsx` (Problem E — count the true
  total separately from the display-capped list)
- `src/repositories/CorrectiveActionRepository.ts` (`getStats()` — Problem
  E, split the `resolved` bucket once Problem B's model is settled)

## Tests required
- `createCapItemsFromInspection` test asserting `finding`, `legalReference`,
  and photo fields are populated on the created `CorrectiveAction`.
- `updateStatus` test: transition to `'resolved'` does NOT set `closedAt`;
  transition to `'closed'` DOES, and only when verification fields are
  present (if enforced at repository level — confirm intended layer with
  maintainer, may be UI-level validation instead).
- Delete-cascade (or flag) test confirming the chosen behavior from
  Problem C's design decision.
- Test asserting `scheduleCapDigestNotification()` and
  `scheduleCapWeeklyDigest()` are actually invoked from app startup/home
  screen mount (a call-site test, since the scheduling logic itself is
  presumably already covered given how complete the implementation is).

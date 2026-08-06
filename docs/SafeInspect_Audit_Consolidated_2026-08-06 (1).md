# SafeInspect — Consolidated Independent Audit
**Auditor:** Claude (independent QA/Architecture/Data-Integrity/Product Auditor — analysis only, no code changes made)
**Repo:** `belabedmohamedins-tech/SafeInspect-APP`
**Date compiled:** 2026-08-06 (fully re-verified pass)
**Note on methodology:** This audit ran across multiple sessions while Perplexity was actively committing fixes to the same repo in parallel (confirmed via `docs/README.md`'s live log — the AsyncStorage→SQLite migration completed mid-audit, superseding two earlier findings). **Every finding still marked CONFIRMED below was re-fetched from the live repository immediately before this revision was written** — not carried over from earlier in the conversation. Only F-02, F-03, F-06, and F-16 were not re-fetched in this final pass (all low-severity/cosmetic or legal-citation items that don't change based on code commits) — these are called out explicitly where they appear.

---

## How to use this document
- Findings are IDed F-01 through F-17.
- Severity: CRITICAL > HIGH > MEDIUM > LOW.
- Status reflects the **most recent check**, not the original discovery.
- "Already correct" items are listed separately — don't re-investigate them.
- Legal/citation items (Phase 4) are flagged for human/expert review, not treated as confirmed code bugs.

---

## A. TOP ISSUES (ranked by real-world impact)

### 1. F-11 — Approved inspections are not actually immutable
**Severity:** CRITICAL | **Status:** CONFIRMED, re-verified 2026-08-06 (final pass, via fresh `InspectionRepository.ts` read)
**Category:** Data integrity / legal defensibility
`ApprovalRepository.approve()`'s own comment says approved inspections "become immutable," but neither `InspectionRepository.save()` nor `.delete()` (now SQLite-backed, same gap as the prior AsyncStorage version) checks `approvalStatus` before writing. `app/screens/reports.tsx`'s swipe-to-delete calls `InspectionRepository.delete()` directly with only a generic confirm dialog — no distinction for approved/legally-relevant records. `useChecklistData.ts` can also reopen any inspection by ID into an editable state regardless of approval status.
**Fix:** Add an explicit guard in `save()`/`delete()`: reject writes/deletes when `existing.approvalStatus === 'approved'` unless routed through a new, explicitly-audited "supervisor override" path.
**Needs product sign-off** on whether a legitimate reopen-for-correction workflow should exist before implementing a hard block.

### 2. F-12 — Integrity/tamper-detection badge is permanently non-functional
**Severity:** CRITICAL | **Status:** CONFIRMED, re-verified 2026-08-06 (final pass)
**Category:** Data integrity, confirmed via both code AND test-gap analysis
`InspectionRepository.save()` calls `IntegrityService.computeHash()` (embeds a hash in the record itself) but **never calls `hashAndStore()`** (the only function that persists a hash to the separate `INSPECTION_HASHES` store `verifyInspection()` checks against). `components/inspection/IntegrityBadge.tsx`, shown on every report preview, will therefore **always show "no fingerprint,"** never "verified," and can never actually catch tampering.
**Test-gap confirmation:** `src/__tests__/IntegrityService.test.ts` is thorough and 100% passing — but every test calls `hashAndStore()` directly, never through `InspectionRepository.save()`. The bug lives exactly in that untested integration seam.
**Fix:** Call `IntegrityService.hashAndStore(toSave)` inside `InspectionRepository.save()`'s `isNewCompletion` branch, alongside the existing `computeHash()` call.
**Recommended new test:** complete an inspection via `InspectionRepository.save()`, then assert `verifyInspection()` returns `ok: true`.

### 3. F-13 — Reinspection flow can silently link the wrong facility's prior data
**Severity:** HIGH | **Status:** CONFIRMED, re-verified 2026-08-06 (final pass — fresh reads of `reinspection.tsx`, `facilities.tsx`, and `differentialView.ts`, all three fetched again just now)
**Category:** Core workflow / decision correctness
`reinspection.tsx` already knows the exact prior facility (loads it via `InspectionRepository.getById`) but still routes the inspector back through manual category/facility re-selection with `activity: ''`. `facilities.tsx`'s `handleGateConfirmed()` still overwrites `facilityId`/`facilityName`/`facilityAddress`/`activity` with whatever facility is tapped, while `priorInspectionId` passes through unchanged in the spread. `differentialView.ts`'s `buildDifferentialView()` — re-read in full just now — still resolves the prior record purely by `currentInspection.priorInspectionId` with only an `if (specific?.status === 'completed')` check; **no `facilityId` match check exists on this path.** A wrong tap during re-selection → nonsensical cross-facility diff → feeds directly into `decisionSupport.ts`'s escalation/closure recommendations.
**Test-gap confirmation:** `differentialView.test.ts` explicitly tests "ignores inspections from a different facility" — but only for the `getAll()` fallback path. Every test using the `priorInspectionId`/`getById` path uses matching facility IDs; the mismatch scenario is untested there.
**Fix:** Either skip re-selection entirely for reinspection (facility is already known), and/or add a facility-match guard in `buildDifferentialView()` that falls back to "no valid prior" on mismatch.
**Recommended new test:** mock `getById` to return a prior inspection with a different `facilityId`; assert the function refuses/falls back.

### 4. F-15 — Documented auto-follow-up for "unable-to-verify" doesn't exist
**Severity:** HIGH | **Status:** CONFIRMED, re-verified 2026-08-06 (final pass, fresh `followUpService.ts` read)
**Category:** Checklist/evaluation engine vs. documented behavior
`types.ts` documents `'unable-to-verify'` as auto-generating a follow-up task. `createFollowUpIfNeeded()` only triggers on `grade === 'D'` or an open CAP existing — it has no logic for `'unable-to-verify'` at all. An inspection with only unable-to-verify items (otherwise compliant) gets no follow-up scheduled, despite the documented guarantee.
**Fix:** Add a condition: also trigger follow-up when any item has `complianceStatus === 'unable-to-verify'`.

### 5. F-10 — New facility categories invisible in the "start inspection" flow
**Severity:** HIGH | **Status:** CONFIRMED, re-verified 2026-08-06 (final pass, fresh `categories.tsx` read)
**Category:** Core workflow (Registry → Planning)
`categories.tsx` builds its category list from the static `src/facilitiesData` import, not `facilitiesService.getAllFacilities()` (which correctly merges static + user-added facilities, and which the very next screen, `facilities.tsx`, uses correctly). A user-added facility with a new `activity` value is unreachable via the normal start-inspection flow.
**Fix:** Change `categories.tsx` to derive its category list from `getAllFacilities()` instead of the static import.

### 6. F-17 — Real server ↔ mobile schema mismatch (sync layer, not yet live)
**Severity:** HIGH | **Status:** CONFIRMED, independently re-verified 2026-08-06 against fresh `server/prisma/schema.prisma`
**Category:** Sync/data-integrity, pre-emptive (sync isn't live yet, so nothing is broken in production today)
Confirmed real mismatches: status enum casing (`COMPLETED`/`IN_PROGRESS`/`DRAFT` server-side vs. lowercase-hyphenated mobile values), violation counts (4 denormalized Int columns server-side vs. 1 JSON blob mobile-side), `committeeMembers` (native array vs. JSON string), required `inspectorId` FK server-side with no mobile equivalent, and **no server-side model at all** for audit-log entries or notifications.
**Fix:** Write and unit-test explicit mapping functions for each mismatched field before enabling real sync; decide explicitly whether audit logs need a server-side model given their legal-defensibility purpose.

### 7. F-14 — Inconsistent "evaluated" definitions + observation-only/unable-to-verify mislabeled
**Severity:** MEDIUM-HIGH | **Status:** CONFIRMED, re-verified 2026-08-06 (final pass, fresh `statusUtils.ts` read)
**Category:** Evaluation engine / report accuracy
Three different "is this evaluated?" formulas coexist (progress bar / finish-gate / scoring completion rate), disagreeing specifically on `observation-only`/`unable-to-verify` items. Separately, `statusUtils.ts`'s `getStatusText()` still has no case for either status — both display as **"لم يقيم" (not evaluated)** on the official printed/exported report (`app/preview/index.tsx`), misrepresenting real inspector work.
**Fix:** Add explicit label/color handling for both statuses in `statusUtils.ts`; reconcile the three completion-rate formulas (make `scoringUtils.ts` match the finish-gate's definition).

### 8. F-08 — Redundant (harmless) double CAP-creation call
**Severity:** LOW | **Status:** CONFIRMED harmless, re-verified 2026-08-06 (final pass)
`checklist.tsx`'s `doFinish()` calls `createCapItemsFromInspection()` a second time after `InspectionRepository.save()` already called it internally. Verified idempotent (checked `capFactory.ts` directly) — not a duplication bug, just wasted work.
**Fix:** Remove the redundant call in `doFinish()`.

### 9. F-09 — No autosave on app-kill/background during a checklist
**Severity:** MEDIUM | **Status:** CONFIRMED, re-verified 2026-08-06 (final pass — fresh full read of `useChecklistData.ts`)
`useChecklistData.ts` still only persists in-progress work in two places: on `handleFinish()` (completion) and via the `navigation.addListener('beforeRemove', ...)` auto-save on back-navigation. No `AppState` listener, no interval autosave exist anywhere in the file. A field inspector whose app is killed by the OS (not via the in-app back button) loses unsaved progress since the last navigation-triggered save.
**Fix:** Add an `AppState` listener (background/inactive → save as `'in-progress'`) and/or a periodic autosave interval.

### 10. F-16 — HACCP legal-citation article number possibly mismatched
**Severity:** MEDIUM (confidence: moderate — flagged for expert/primary-source review, not a confirmed code bug)
**Category:** Legal/criteria accuracy
`baseFoodCriteria.ts` cites Décret 17-140 **Article 9** for the HACCP obligation (with a code comment claiming "primary-source verified"). An official arrêté published in the Journal Officiel implementing HACCP under this decree instead cites **Article 5** as its legal basis. These aren't necessarily contradictory (Art. 9 could state the obligation, Art. 5 could authorize the implementing arrêté), but the code's "primary-source verified" confidence claim should be re-checked against the full decree text, not just this audit's search snippets.
**Also flagged, not verified:** the couvoir/UPD HACCP-exclusion rationale may actually stem from Décret 04-82's scope, not a general "primary production" exclusion as currently commented.

---

## B. Already resolved / no longer applicable
- **F-04 / F-07 (original):** SQLite was found dormant/orphaned in early sessions. **Now resolved** — Perplexity's "Phase Z5" migrated `InspectionRepository`, `AgendaRepository`, `CorrectiveActionRepository`, `AuditLogRepository`, and `FacilityRepository` to real SQLite reads/writes, independently re-verified by fetching `InspectionRepository.ts` fresh. No action needed.

## C. Already verified as correct (do not re-investigate)
- **Activity→checklist mapping** (`criteriaData.ts`): all 26 distinct facility activity values have a matching key; no facility silently falls back to generic criteria. Independently cross-checked against `facilitiesData.ts`.
- **No WatermelonDB remnants**: confirmed the stack is expo-sqlite throughout; docs explicitly and correctly state this.
- **Docs are current, not stale**: `docs/README.md` and `docs/RAQIB_SQLite_Migration_Plan.md` are actively maintained and accurately reflect the codebase — better than typically expected going into a docs-vs-code audit.
- **CAP creation idempotency**: `capFactory.ts` correctly prevents duplicate corrective actions per inspection+item (relevant to F-08 above).
- **85% completion gate logic**: correctly implemented and consistent with its own internal definition (separate from the F-14 cross-file inconsistency).

## D0. Additional real-time re-checks (F-01, F-05) + new finding F-18
- **F-01** (`.env` not gitignored): re-fetched `.gitignore` just now — still only excludes `.env*.local`, plain `.env` is still tracked and unprotected. Confirmed still live.
- **F-05** (prod API URL falls back to `localhost`): re-fetched `serverAuth.ts` in full just now — `getApiUrl()` still falls back to `'http://localhost:3000'` unconditionally. Confirmed still live.

### F-18 — Local and server approval workflows are completely disconnected
**Severity:** HIGH | **Status:** CONFIRMED, discovered and verified 2026-08-06 (final pass)
**Category:** Architecture / approval integrity — directly related to F-11
**Evidence:** `serverAuth.ts` contains a fully-implemented server-side approval API: `approveInspection(inspectionId, note)` and `rejectInspection(inspectionId, reason)`, both calling real endpoints (`POST /inspections/:id/approve` / `/reject`) with proper auth headers and error handling. Separately, `ApprovalRepository.ts` — **the actual code path the app uses for supervisor approval** (`approve()`, `returnForRevision()`, `escalate()`) — is entirely local: an AsyncStorage-backed queue that calls `InspectionRepository.save()` directly. **`ApprovalRepository.ts` has no import of `serverAuth.ts` anywhere and never calls `approveInspection()`/`rejectInspection()`.**
**Why it matters:** Whatever the server-side approve/reject endpoints were built for (a web dashboard? a planned centralized oversight feature?), the mobile app's actual supervisor-approval action never reaches the server. This means:
  1. A supervisor approving an inspection on-device gives no signal to the server at all — if anything server-side depends on approval status (reporting, oversight, compliance dashboards), it will never reflect mobile approvals.
  2. Combined with F-11 (no local immutability enforcement) and F-17 (real server/mobile schema mismatches on `approvalStatus` casing), "approved" is currently a purely on-device concept with three separate unreconciled representations: the local `ApprovalRecord` queue, the `approvalStatus` field on the SQLite inspection row, and whatever the server's `ApprovalStatus` enum expects — none of which currently talk to each other.
**Recommended solution:** Decide explicitly whether server-side approval is: (a) intended and simply not wired up yet — in which case `ApprovalRepository.approve()` etc. should call `approveInspection()`/`rejectInspection()` after the local update succeeds, or (b) dead/unused code from an earlier design that should be removed. Don't leave it half-built silently — either wire it in or delete it, since a half-connected approval system is worse than a clearly local-only one.
**Tests required:** Once a direction is chosen — either an integration test asserting `ApprovalRepository.approve()` also calls the server endpoint, or (if removed) nothing.
**Dependencies/risks:** Should be resolved alongside F-11, since both concern what "approved" actually means and how durable/authoritative that state is.

## D. Flagged for dedicated attention, not fully investigated
- **Décret 17-140 temperature thresholds** (0–5°C chilled / ≤−18°C frozen, Articles 7/8): plausible (match international norms) but not confirmed against full primary Algerian legal text.
- **18 of 19 criteria files' legal citations** (only `baseFoodCriteria.ts` was sampled in Phase 4) — needs dedicated legal-research time, ideally with direct access to JORADP primary texts rather than search snippets.
- **Audit log "clear all" button** (`app/screens/audit-log.tsx`) — available to the same user population the log is meant to hold accountable; worth a role/permissions look.
- **`decisionSupport.test.ts`** — only 243 bytes, unusually thin for a file that drives legal escalation recommendations; likely under-tested.
- **Server E2E sync test** — doesn't exist yet (matches Perplexity's own roadmap, listed as deferred "Phase Z9").

---

## E. Recommended implementation order for Perplexity
1. **F-12** (integrity hash) — smallest, self-contained, one call-site addition.
2. **F-15** (unable-to-verify follow-up) — small, additive, no schema change.
3. **F-10** (categories.tsx data source swap) — small, localized.
4. **F-08** (remove redundant CAP call) — trivial cleanup.
5. **F-13** (reinspection facility-match guard) — moderate, touches decision-support chain; add the regression test alongside the fix.
6. **F-11** (approval immutability) — needs product sign-off on override workflow before implementation; do after the above so the "legally defensible record" story is consistent end-to-end. **Do this together with F-18** (below) since both concern what "approved" means and how it's enforced/propagated.
7. **F-18** (local/server approval disconnect) — needs a product decision (wire in vs. remove the server endpoints) before implementation; resolve alongside F-11.
8. **F-14** (status label + completion-rate reconciliation) — moderate, spans multiple files.
9. **F-09** (autosave) — independent, can slot in anytime.
10. **F-17** (server schema mapping) — do before enabling real sync, not urgent otherwise. Relevant to F-18 as well, since fixing the approval disconnect means the `approvalStatus` casing mismatch would suddenly matter in practice.
11. **F-16 and remaining legal citations** — route to whoever has primary legal-text access; not a code task.

---

## F. Full finding index

| ID | Severity | Area | Status |
|---|---|---|---|
| F-01 | MEDIUM | `.env` not gitignored | **Confirmed, re-verified real-time** |
| F-02 | LOW | Stale Node/Expo version comment | Confirmed (Phase 1, not re-checked — cosmetic, low risk of change) |
| F-03 | LOW | Migration naming (`001_` reused) | Confirmed, not a functional bug (not re-checked — cosmetic) |
| F-04 | — | Original AsyncStorage migration gap | **Resolved/moot** (SQLite migration completed) |
| F-05 | LOW | Prod API URL falls back to `localhost` | **Confirmed, re-verified real-time** |
| F-06 | — | Stack is expo-sqlite, not WatermelonDB | Informational, confirmed correct |
| F-07 | — | SQLite layer was orphaned | **Resolved** — now live via Z5 migration |
| F-08 | LOW | Redundant CAP-creation call | **Confirmed harmless, re-verified real-time** |
| F-09 | MEDIUM | No autosave on app-kill | **Confirmed, re-verified real-time** |
| F-10 | HIGH | New facility categories invisible | **Confirmed, re-verified real-time** |
| F-11 | CRITICAL | Approved inspections not immutable | **Confirmed, re-verified real-time** |
| F-12 | CRITICAL | Integrity badge non-functional | **Confirmed, re-verified real-time** + test-gap confirmed |
| F-13 | HIGH | Reinspection facility mismatch risk | **Confirmed, re-verified real-time** + test-gap confirmed |
| F-14 | MEDIUM-HIGH | Inconsistent evaluated defs + mislabeling | **Confirmed, re-verified real-time** |
| F-15 | HIGH | Missing unable-to-verify follow-up | **Confirmed, re-verified real-time** |
| F-16 | MEDIUM | HACCP article citation | Flagged for expert review — not a code artifact, doesn't change with commits |
| F-17 | HIGH | Server↔mobile schema mismatch | **Confirmed, re-verified real-time** |
| F-18 | HIGH | Local/server approval workflows disconnected | **Confirmed, discovered real-time** |

**Real-time coverage: 14 of 18 findings re-fetched and reconfirmed (or newly discovered) against the live repository in this final pass. The 4 not re-fetched (F-02, F-03, F-06, F-16) are either purely cosmetic, already-resolved/informational, or legal-citation items whose truth doesn't depend on code commits.**

---

*End of consolidated audit. No repository files were modified in the course of this analysis.*

# SafeInspect — Workflow/Decision-Engine Audit — Final Deliverable
Repo: https://github.com/belabedmohamedins-tech/SafeInspect-APP
Audit scope: inspection workflow, state machine, evidence, CAP lifecycle,
scoring/decision support, planning, reporting, security, UX, and server-side
code — NOT the checklist/legal-content audit (handled separately, in a
different conversation thread).

## Status: complete
This deliverable covers all 18 sections of the original audit brief,
including a full UX sweep of every screen (not just high-stakes ones —
settings, notifications, onboarding, agenda, and server-login were all
individually read), full coverage of every file in `server/src`, every
service/repository/util/hook in `src/`, the largest and most-used shared
components, and a cross-reference against two prior repo-internal audit
documents (`docs/SafeInspect_Audit_Consolidated_2026-08-06.md` and the
live maintenance log `docs/README.md`). That cross-reference independently
confirmed nine of that document's findings (F-01, F-05, F-08, F-09, F-10,
F-11, F-13, F-14, F-15) are now FIXED — cite these to Perplexity as
recently-resolved, don't re-open them. A named-competitor feature
benchmark was intentionally not code-audited (would need external
research); a general benchmark against mature-platform expectations is in
the audit conversation instead.

## Executive verdict
SafeInspect's individual features are each reasonably implemented in
isolation, and — importantly — under active, competent maintenance: the
cross-reference above shows nine real bugs from an earlier audit pass
fixed within about 48 hours of that audit landing. The remaining gaps
found by this audit follow two repeating patterns:

**Pattern 1 — the client/server boundary is broken end-to-end.** Not one
bug, but a connected chain: the server never mounts its own sync/approval
routes (SPEC 09); even if it did, a path-prefix mismatch would still block
requests (SPEC 09); even past that, the one approval code path that DOES
try to call the server targets a completely different, nonexistent
endpoint with mismatched ID semantics (SPEC 09); and the sync schema that
requests would need to pass is itself missing real client values in two
places — severity and status — meaning no approved/rejected inspection or
critical-severity finding could sync even with a perfect connection
(SPEC 08). This chain was partially reviewed internally and marked
"confirmed clean" (W53, 2026-08-11) — worth reopening alongside the fix,
since the wrapper code that WAS reviewed is genuinely well-built; the gap
is one level deeper than that review went.

**Pattern 2 — fully-built features with nothing that ever invokes them.**
Found seven times independently across this audit: the server sync/
approval routes themselves (SPEC 09); two of three CAP deadline-reminder
notification types (SPEC 03); all three Settings screen toggles (SPEC 10);
the entire in-app Notification Centre — repository, screen, and bell badge,
all correctly built, never fired once (SPEC 10); and a minor unreachable
UI branch for agenda's 'cancelled' status (noted in SPEC 11). Seven
repetitions is strong enough to treat as this project's most common defect
class — SPEC 10 recommends a mandatory mechanical grep sweep before the
next release (for every settings key written / scheduler exported / status
enum value defined, confirm something actually produces or reads it), not
just fixing the seven found instances.

Beyond those two patterns, in priority order: backup/restore reads the
wrong storage layer and currently protects nothing (SPEC 01); two
inconsistent local approval code paths, one of which produces a visible
false "tampered" badge, plus no server-side audit trail at all and an
unrestricted local audit-log clear (SPEC 02); photographic evidence never
leaves the device in either backup or sync (SPEC 04); PIN lockout is
bypassable with a destructive-by-default recovery path (SPEC 05);
corrective actions carry no evidence/legal-basis link and "resolved" vs
"closed" don't match the documented model (SPEC 03); the PDF report omits
verification fields, only 1 of 3 signatures is digitally captured, and a
timing-based (not state-based) race condition affects signature
confirmation (SPEC 06); risk/priority data is computed but never surfaced
in the UI, including a dashboard stat silently computed over the wrong
denominator (SPEC 07); and a one-line form bug in agenda creation that can
launch an inspection for the wrong facility (SPEC 11).

A recurring meta-finding worth flagging to Perplexity directly: several
bugs (SPEC 01, SPEC 02) have existing test suites that test the wrong
layer entirely or have zero coverage of the actual broken path — new
tests need to replace/extend deliberately, not sit alongside tests that
pass for the wrong reasons. See each spec's "Existing test coverage"
section.

## Spec files in this delivery, in priority order

| # | File | Priority | Depends on |
|---|------|----------|------------|
| 1 | `09_SPEC_routes_never_mounted.md` | P0 — fix first | none |
| 2 | `08_SPEC_sync_severity_schema_bug.md` (severity + status enums) | P0 | #9 |
| 3 | `01_SPEC_backup_restore_fix.md` | P0 | none |
| 4 | `02_SPEC_integrity_and_audit_trail.md` | P0 | none |
| 5 | `04_SPEC_photo_evidence_sync.md` | P0 | #1 (shares backup payload) |
| 6 | `05_SPEC_security_pin_lockout.md` | P1 | none |
| 7 | `03_SPEC_cap_evidence_and_lifecycle.md` | P1 | none |
| 8 | `06_SPEC_report_generation_gaps.md` | P1 | none |
| 9 | `07_SPEC_planning_prioritization.md` | P1 | none |
| 10 | `10_SPEC_dead_settings_toggles.md` | P1 | none |
| 11 | `11_SPEC_agenda_add_facility_mismatch.md` | P2 | none |
| 12 | `12_SPEC_minor_server_hardening.md` | P2 | none |

## How to use these files with Perplexity
Hand ONE file per session/PR to avoid scope bleed. Each file is
self-contained: problem → current behavior → desired behavior → affected
files → concrete change → tests required. Perplexity should not touch
files outside the "Affected files" list in a given spec without flagging
it first. Files with no listed dependency can be worked in parallel/any
order after the P0s land. SPEC 12 exists specifically to keep unrelated
minor findings out of the P0 specs' scope — don't merge it back in.

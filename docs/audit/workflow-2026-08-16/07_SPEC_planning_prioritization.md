# SPEC 07 — Risk/priority data computed but never surfaced; pre-visit brief
mis-ranks critical violations
Priority: P1. Dependencies: none.

## Problem A — no risk-based facility prioritization anywhere in the UI
`SavedInspection.riskLevel` (1–4) and `nextInspectionDays` are computed by
the scoring/decision-support pipeline (`src/utils/scoringUtils.ts`,
`src/services/decisionSupport.ts`) and persisted to SQLite and the sync
payload. Confirmed via full-codebase grep: neither field is read by any
screen. `FacilityRepository.getAll()` returns facilities via
`ORDER BY created_at DESC` — creation order, not risk or due-date. The
agenda screen (`app/agenda/index.tsx`) has no risk/priority awareness
either. An administration currently cannot answer "which facility should we
prioritize" from inside the app, despite the underlying data existing.

## Problem B — pre-visit brief silently deprioritizes critical violations
`src/services/briefService.ts`'s `buildBrief()` ranks a facility's prior
violations for the "top violations to review before this visit" list using:
```
const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
topViolations = ...sort((a,b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3)).slice(0, 3)
```
`Severity` includes `'critical'` (added per the `G18` fix referenced in
`src/types.ts`), but this map doesn't. A `'critical'` item falls through to
the `?? 3` default — sorting AFTER `'low'` (2). If a facility has 3+
non-critical violations, a critical one from the prior visit can be dropped
from the pre-visit brief entirely. Confirmed this is isolated to
`briefService.ts` — `scoringUtils.ts`'s weighting handles `'critical'`
correctly elsewhere (weight 4, above high's 3).

## Problem C — the home dashboard's "non-compliant" stat is silently scoped
to only the 3 most recently shown inspections, not the real total
`src/utils/loadHomeData.ts`'s `stats.nonCompliantFacilities` is computed by
iterating `completedInspections` — which is `completed.slice(-3).reverse()`,
the same 3 inspections shown in the "recent" list widget, not all
completed inspections. `stats.totalCompleted`, right next to it, correctly
uses `completed.length` (the true total). `components/home/StatsBar.tsx`
renders both with no qualifier — the label is bare "غير مطابق"
("Non-compliant"), not "Non-compliant (recent 3)". A user glancing at the
dashboard sees e.g. "Total: 47 / Non-compliant: 1" and would reasonably
read that as a compliance rate, when the real denominator for the "1" is
3, not 47. Separately, and lower-confidence: `getFacilityForAgenda()` in
the same file checks the static `hardcodedFacilities` import before
`userFacilities` — may be intentional (a seeded base registry vs.
user-added facilities) or may be the same stale-static-data pattern
already fixed elsewhere (F-10, per this audit's cross-reference against
`docs/SafeInspect_Audit_Consolidated_2026-08-06.md`) — flag to the
maintainer to confirm intent rather than assuming either way.

## Desired behavior
### A.
- Add a computed "due/priority" view: sort or filter facilities by
  `nextInspectionDays` (elapsed vs. recommended) and/or latest `riskLevel`,
  surfaced as a facility-list sort option and/or a dashboard widget
  ("X facilities overdue for inspection", "Y facilities graded D last
  visit"). Exact UI placement is a design decision — flag options to the
  maintainer (facilities list sort control vs. a dedicated home-screen
  widget vs. both) rather than picking unilaterally.
- At minimum, expose `riskLevel`/`nextInspectionDays` as visible fields
  on the facility profile screen if they aren't already.

### B.
- Fix `severityOrder` in `briefService.ts` to include `critical: -1` (or
  equivalent, ranking above `high`), matching the ranking already used in
  `scoringUtils.ts`. Recommend importing/reusing a single shared severity-
  ranking constant instead of maintaining a second copy — flag the
  duplication itself as a maintainability note.

### C.
- Compute `nonCompliantFacilities` from the full `completed` array, not the
  sliced `completedInspections` display list — this is a one-line fix
  (`completed.forEach(...)` instead of `completedInspections.forEach(...)`).
- Confirm the `hardcodedFacilities`-first lookup order in
  `getFacilityForAgenda()` is intentional; if not, apply the same fix
  pattern as F-10.

## Reason
Problem A is section 11 of the brief verbatim: "Determine whether the
application can actually help an administration decide which establishment
to inspect, when, and why." Currently it cannot, despite having the data.
Problem B is a correctness bug with real safety implications: an inspector
prepping for a follow-up visit could be shown low-severity carryover items
while a critical one from last time — cold-chain failure, structural hazard,
etc. — is silently omitted from their prep list. Problem C is a trust
issue: the one compliance-health number shown on the home screen is wrong
in a way that isn't visible without reading the code — exactly the kind of
bug that erodes confidence in every other number on the same dashboard
once discovered.

## Affected files
- `src/services/briefService.ts` (`severityOrder` — Problem B, small fix)
- `src/repositories/FacilityRepository.ts` (add a risk/due-date sort query
  option)
- Facility list / dashboard screens (`app/screens/facilities/all.tsx`,
  `app/(tabs)/home.tsx` or wherever a summary widget belongs — maintainer
  to confirm placement)
- `src/utils/loadHomeData.ts` (Problem C fix)

## Tests required
- `buildBrief()` test: seed a prior inspection with 1 critical + 3 high
  violations, assert the critical item appears in `topViolations`.
- Facility-list test: assert a new sort/filter mode orders facilities by
  risk/due-date correctly (exact API shape depends on the UI decision made
  above — write once that's settled).
- `loadHomeData()` test: seed more than 3 completed inspections where a
  non-compliant one falls outside the last 3, assert
  `stats.nonCompliantFacilities` still counts it.

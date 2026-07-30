# RAQIB — Master Technical Manuscript
### Single Source of Truth — SafeInspect / RAQIB Inspection Platform

**Revision 2.** The original draft (Chapters 1–7) was built from static reading of
`SafeInspect-APP-main__5_.zip`. Chapter 8 added findings from actually running `npm
install` + `tsc --noEmit` against that snapshot. **This revision goes one step further:**
every chapter has now been cross-checked directly against the live repository
(`belabedmohamedins-tech/SafeInspect-APP` on GitHub) via a real-time GitHub connector,
reading 10 files in full. Where live code disagreed with the earlier draft — either
because something got fixed, or because active parallel development (via Perplexity)
introduced something new — this revision reflects the live state, not the original
snapshot. Every claim in this document is now one of three explicit types, stated inline:
**confirmed live** (fetched and read directly), **confirmed via compiler** (`tsc` output,
snapshot-era), or **not yet re-verified** (should be checked before being trusted as
current).

**Status of this document:** All 7 original chapters revised; Chapter 8 restructured
around live-verification findings, superseding its original `tsc`-only framing where the
two diverge.


in `SafeInspect-APP-main__5_.zip` (210 TypeScript files) rather than against prior audit
reports, which describe an earlier, less advanced state of the code. Where a prior audit
document's claim was checked against the code and found outdated, this is noted explicitly
in the relevant chapter — this manuscript never repeats a stale finding as if current.

**Method note:** every factual claim about "what exists" or "what's missing" in this
document was obtained by inspecting the actual `.ts`/`.tsx` source files, not by trusting
the audit narrative documents. The audit documents (`Session_02...09`, `Master_Rollup`,
`Super_ReDesign`, `Master_Audit_v2`, `Expert_Panel_Review`, `Checklists_audit`,
`Honest_Critic`) are used only for: (a) legal-citation rationale that isn't visible from
code alone, (b) flagged research gaps that genuinely require legal research rather than
code inspection, and (c) historical context on *why* a decision was made.

---

# CHAPTER 1 — System Architecture & Facility Mapping

## 1.1 What RAQIB actually is, as of this codebase

RAQIB (`dz-inspection`, package.json v1.0.0) is a React Native / Expo mobile-first
inspection app for Algerian municipal classified-establishment inspectors. The codebase
is materially more advanced than several of the uploaded audit documents describe. Those
documents (especially `Safe_Inspect_Super_ReDesign.docx` and the original
`SafeInspect_360_Audit_Report.md`) were written against an earlier snapshot and describe
things as "completely missing" that now exist in this zip. This manuscript treats the
current zip as ground truth throughout.

Confirmed present in the current codebase (not aspirational — actually implemented):

- **Authentication & session security:** `AuthRepository`, `pin-lock.tsx`, `pin-setup.tsx`,
  `SessionLockService`, `server-login.tsx`, `serverAuth.ts`.
- **Tamper-evidence:** `IntegrityService.ts` uses `expo-crypto`'s
  `CryptoDigestAlgorithm.SHA256` — the djb2 → SHA-256 upgrade flagged as Priority 1 across
  three separate audit documents is **done**.
- **Supervisor approval workflow:** `ApprovalRepository`, `approval-queue.tsx`,
  `approval-detail.tsx`, `supervisor-approvals.tsx`.
- **Audit logging:** `AuditLogRepository`, `audit-log.tsx` screen.
- **Corrective Action Plans:** `CorrectiveActionRepository`, `capFactory.ts`,
  `app/cap/[id].tsx`, `app/(tabs)/cap.tsx`, `corrective-actions.tsx`.
- **Follow-up / differential inspection:** `followUpService.ts`, `differentialView.ts`,
  `violationHistory.ts` — the "differential follow-up view" flagged as the single most
  critical missing feature in `Checklists_audit.docx` §Top-50 exists as real service code.
- **Decision support:** `decisionSupport.ts`, `meetingGateService.ts` (opening/closing
  meeting gate), `briefService.ts` (pre-departure briefing).
- **Geofencing:** `geofencingService.ts`, `geofence-check.tsx`.
- **Backend-facing sync:** `apiClient.ts`, `SyncService.ts`, `src/db/syncEngine.ts` — a
  real sync engine exists, distinct from the "sync endpoint is optional and unimplemented"
  finding in the original 360° audit.
- **SQLite migration — in progress, not finished.** `src/db/schema.ts` defines the full
  SQLite schema and a migration runner, explicitly documented in-file as **"Phase A":
  schema and migration runner exist; all repositories still read/write AsyncStorage; no
  behaviour change yet.** This is a real, current, half-finished state — not "done" and
  not "not started." See Chapter 6 for the precise remaining work.
- **Reporting:** `pdfService.ts`, `reports/[id].tsx`, `reports.tsx`, `backup.tsx`.
- **Statistics:** `stats.tsx`, `statsUtils.ts`.
- **Notifications:** `NotificationRepository`, `NotificationService.ts`, `notifications.tsx`.

This does **not** mean every gap identified across the audit series is closed — Chapter 6
gives the filtered, code-verified remainder. But any manuscript chapter that simply
restated the old documents' "missing" lists would be wrong in specific, checkable ways,
several of which are demonstrated above.

## 1.2 Directory structure (relevant to inspection logic)

```
src/
├── criteria/            20 activity-specific criteria files + 2 shared base files
│   ├── baseGeneralCriteria.ts     (36 criteria — universal baseline, all 26 activities)
│   ├── baseFoodCriteria.ts        (13 criteria — food-handling activities only)
│   ├── baseCompressedGasCriteria.ts (3 criteria — shared gas-cylinder-storage module,
│   │                                 see §2.3 — this is new since the last audit pass
│   │                                 and already implements the Session 4 recommendation
│   │                                 to stop reinventing cylinder-storage rules per file)
│   └── [18 activity-specific files, catalogued in Chapter 3]
├── criteriaData.ts       Composes base + activity criteria into 15 checklist constants,
│                         maps 26 facility activity strings to checklists, exposes
│                         getChecklistForActivity() with an unknown-activity guard
├── facilitiesData.ts     Facility registry — 26 distinct activity strings in use
├── facilityCategoriesFull.json  609-row official classified-establishment activity list
│                         (rubrique code, label, licensing regime, radius) — this is a
│                         real ingestion of Algeria's official activity nomenclature,
│                         not something any prior audit document mentions at all
├── types.ts               Core type definitions (InspectionItem, SavedInspection, etc.)
├── repositories/          9 repositories: Agenda, Approval, AuditLog, Auth,
│                          CorrectiveAction, Facility, Inspection, Notification, Settings
│                          — all currently AsyncStorage-backed (see §1.1 SQLite note)
├── services/              16 services covering PDF export, sync, geofencing, decision
│                          support, meeting gates, briefings, CAP generation, differential
│                          view, violation history, integrity hashing, server auth
├── db/                    schema.ts (SQLite schema + migrations, Phase A) and
│                          syncEngine.ts (sync scheduler)
└── utils/                 scoringUtils.ts (severity-weighted scoring — see §1.4),
                           statsUtils.ts, inspectionUtils.ts, dateUtils.ts, etc.

app/
├── (tabs)/                Bottom-tab navigation: home, inspection, actions, cap, plus
├── screens/                26 screens covering the full inspection lifecycle: facilities,
│                          brief, geofence-check, checklist (under inspection/), cap,
│                          signature, reports, approval-queue/detail, supervisor-approvals,
│                          audit-log, stats, backup, settings, map, notifications,
│                          legal, onboarding, pin-setup, server-login
├── agenda/                 Scheduling: index, add, edit
├── reports/[id].tsx        Per-inspection report view
└── cap/[id].tsx             Per-CAP detail view
```

## 1.3 The 26 facility activity types and how mapping actually works

`criteriaData.ts` composes 15 checklist constants from `baseGeneralCriteria` (always),
`baseFoodCriteria` (only for the 7 genuinely food-handling checklists), and one
activity-specific criteria file. `criteriaByActivity` maps Arabic activity strings to
these checklists. Every facility is looked up through `getChecklistForActivity()`, which
falls back to `baseGeneralCriteria` and logs a `console.warn` if the activity string has
no mapping — this closes the "typo = silent default fallback" risk flagged in
`Master_Audit_v2.md` Priority 2, **for facilities whose activity string is simply
unrecognized.** It does **not** catch the case verified below, where the string is
recognized-looking but doesn't exactly match — see the critical finding.

**Checklist composition table (verified from `criteriaData.ts`):**

| Checklist | Base modules included | Activity-specific file |
|---|---|---|
| `uabChecklist` | General + Food | `uabCriteria.ts` |
| `abattoirChecklist` | General + Food | `abattoirCriteria.ts` |
| `couvoirChecklist` | General + Food | `couvoirCriteria.ts` |
| `updChecklist` | General only (Food deliberately excluded — see code comment: *"UPD = primary poultry production, not food processing... removed per S5 audit"*) | `updCriteria.ts` |
| `slaughterhouseSmallChecklist` | General + Food | `slaughterhouseSmallCriteria.ts` |
| `bakeryChecklist` | General + Food | `bakeryCriteria.ts` |
| `coldRoomChecklist` | General + Food | `coldRoomCriteria.ts` |
| `produceStorageChecklist` | General + Food | `produceStorageCriteria.ts` |
| `mechanicChecklist` | General only | `mechanicCriteria.ts` |
| `blacksmithChecklist` | General only | `blacksmithCriteria.ts` |
| `carpenteryChecklist` | General only | `carpenteryCriteria.ts` |
| `carWashChecklist` | General only | `carWashCriteria.ts` |
| `gplChecklist` | General only | `gplCriteria.ts` |
| `marbleChecklist` | General only | `marbleCriteria.ts` |
| `paintShopChecklist` | General only | `paintShopCriteria.ts` |
| `printingChecklist` | General only | `printingCriteria.ts` |
| `semiPharmaChecklist` | General only | `semiPharmaCriteria.ts` |

This confirms the `baseFoodCriteria` scope correction described in
`RAQIB_Checklist_Audit_Report.docx` (removed from UAB/UPD/Couvoir) is **partially
superseded by a further, more precise pass**: UAB, abattoir, and couvoir currently *do*
include `baseFoodCriteria` (they are food-processing activities), while UPD does not
(primary production, correctly excluded, with the rationale left in a code comment). This
is more accurate than the audit report's blanket "removed from UAB, UPD, and Couvoir" —
the current code differentiates the three correctly rather than treating them uniformly.
Chapter 2 covers this in full detail.

## 1.4 ✅ RESOLVED (confirmed live) — facility↔checklist mapping drift

**Original finding (still recorded for context):** comparing every activity string
actually used in `src/facilitiesData.ts` against every key in `criteriaByActivity`
(`src/criteriaData.ts`) turned up a real, currently-active defect: five facility activity
strings had no matching key, so those facilities were inspected against
`baseGeneralCriteria` alone.

**Confirmed live, this revision: fixed.** `src/criteriaData.ts` now contains all 5
corrected mappings, added as new entries below the original list (the 11 original dead
alias keys were left in place rather than removed — harmless, but worth a cosmetic cleanup
pass at some point):

```typescript
'ميكانيك السيارات': mechanicChecklist,
'ورشة حدادة (صناعة السياج)': blacksmithChecklist,
'ورشة نجارة الألمنيوم': carpenteryChecklist,
'مطبعة خاصة بإنتاج لوازم مدرسية ومستلزمات المكاتب': printingChecklist,
'ذبح الدواجن (أكثر من 500 كغ/ي وأقل من 2 طن/ي)': slaughterhouseSmallChecklist,
```

One design difference from this manuscript's original recommendation: medium-throughput
slaughter now routes to `slaughterhouseSmallChecklist` rather than `abattoirChecklist`.
Both are defensible (the original `RAQIB_Checklist_Audit_Report.docx` argued for
abattoir-identical treatment; routing to the small-slaughterhouse checklist is a
legitimate alternate call) — not flagged as an error, just noted as a live divergence from
the original recommendation.

## 1.5 ✅ RESOLVED (confirmed live) — corrective actions were never auto-created; now fixed

**Update, this revision: fixed and confirmed live.** `src/repositories/InspectionRepository.ts`
now correctly imports and calls `capFactory.ts`'s `createCapItemsFromInspection(toSave)`,
with an explicit code comment: *"FIX (G17c): replaced dead
CorrectiveActionRepository.createFromInspection (method never existed) with the real
capFactory function — this is why CAP items were silently not being created on inspection
completion."* This confirms the finding below was accurate, and that it's now closed.
**Recommend a manual smoke test regardless** (complete a mock inspection with a
non-compliant item, confirm a CAP entry appears) — this manuscript can confirm the code
path is now correct, not that the behavior has been observed working end-to-end on a
device. Original finding preserved below for the record.

This was not visible in the original snapshot's static read — it only surfaced once
`tsc --noEmit` was run (Chapter 8) and then confirmed against live code. It was the
single most consequential functional finding in this manuscript.

`src/services/capFactory.ts` implements `createCapItemsFromInspection()` — a complete,
well-designed function that scans a completed inspection's non-compliant items and creates
a `CorrectiveAction` record for each one, with deduplication logic to avoid re-creating
entries when a draft is reopened. Its own header comment states: *"Called by
checklist.tsx immediately after the inspection is saved as 'completed'."*

**It wasn't.** `src/repositories/InspectionRepository.ts`'s `save()` method — the actual
completion path — called `CorrectiveActionRepository.createFromInspection(toSave)` instead:
a method that has never existed on `CorrectiveActionRepository` (its real exports are
`getAll`, `getByInspection`, `getByFacility`, `getOpen`, `getOverdue`, `getStats`,
`persistOverdueEscalation`, `save`, `updateStatus`, `delete`, `deleteByInspection` — no
`createFromInspection`). A repository-wide code search for `createCapItemsFromInspection`
(the function that actually works) returned **zero results outside its own definition** —
it was called from nowhere in the entire codebase.

**Practical effect while this was broken: no Corrective Action Plan was ever automatically
generated by this app**, for any inspection, on any device, despite the feature being
fully implemented, tested-looking, and documented as wired in. Every non-compliant finding
across every completed inspection produced no CAP entry unless one was created manually
through a different screen — which defeated a substantial part of the app's design intent
(see `Checklists_audit.docx`'s finding that CAP creation, not the score, is "the primary
deliverable" of a professional inspection system).

**This was a two-line fix** — call the correct function instead of the nonexistent one —

**This was a two-line fix** — call the correct function instead of the nonexistent one —
and it was applied. This remains the highest-priority finding this manuscript ever made,
precisely because it was small, isolated, and had been silently broken the entire time
the app existed. See Chapter 5 §5.7 for the closure confirmation and
`RAQIB_Fix_Spec_v2.md` Phase 4.2 for the diff that was applied.

## 1.6 The official activity nomenclature RAQIB has access to but doesn't yet use

`src/facilityCategoriesFull.json` contains 609 rows of Algeria's official classified-
establishment activity list: `rubrique` (activity code), `label` (Arabic activity name),
`regime` (licensing regime — رخصة / تصريح / etc.), and `radius` (a numeric siting/buffer

figure per activity). **No audit document in the uploaded set mentions this file.** Its
presence in the codebase is directly relevant to two long-standing flagged gaps:

- **Chapter 6 (Documentation & Licensing) of the legal manual** flags Décret 07-144's
  facility-type-to-license-category mapping as the single highest-value unresolved
  research gap in the whole manual — "not yet extracted."
- This JSON file's `regime` field, per official activity code, is very plausibly exactly
  that mapping (or close to it) already sitting in the repository, unused by any current
  checklist or licensing criterion.
- The `radius` field is likewise plausibly relevant to the "no numeric buffer-distance
  figure" gap flagged in both the Documentation & Licensing chapter of the manual and the
  Air Quality session's UPD siting-distance placeholder in the Perplexity implementation
  spec.

This is flagged here rather than treated as solved: the manuscript author has not verified
that `facilityCategoriesFull.json`'s `regime`/`radius` values are authoritative,
current, or correctly sourced — only that the file exists, is structured exactly like the
missing mapping the legal manual searched for, and is currently unused by any inspection
logic. **Chapter 6 lists "verify and wire up `facilityCategoriesFull.json`" as a
high-value, low-research task**, distinct from the open-ended "find Décret 07-144's list"
research task the manual originally proposed — because the data may already be sitting in
the repo.

---

*End of Chapter 1.*

---

# CHAPTER 2 — Universal Baseline Modules

Three shared modules exist. Two are spread into every checklist that needs them via
`criteriaData.ts`; the third is a new, partially-adopted shared module not documented in
any prior audit.

## 2.1 `baseGeneralCriteria.ts` — 36 criteria, all 26 activities

This is the only module included in **all 15** checklist constants without exception —
every inspection in the app starts from these 36 criteria. Organized into 9 axes:

| Axis (المحور) | IDs | Count | Note |
|---|---|---|---|
| 1. هوية المنشأة والوثائق (identity & documents) | BGN-01-01…03 | 3 | BGN-01-01 already carries the "no-license-at-all" branch the Session 7 audit recommended promoting from `mechanicCriteria.ts` — **done**. BGN-01-03 is the anti-obstruction criterion the audit found in exactly 1 of 18 files (UAB only) — **now universal**, confirming the Session 7 recommendation shipped. |
| 2. الموقع والتهيئة العامة (site & general layout) | BGN-02-01…07 | 7 | BGN-02-05/07 (floor/wall/lighting) still carry only a generic legal reference, not a specific decree — Session 9's audit flagged this exact gap and it is **still open**, verified. |
| 3. المياه والصرف الصحي (water & sanitation) | BGN-03-01…06 | 6 | BGN-03-06 (septic pit) now has a specific pumping-frequency figure (≤90 days or 80% capacity), code-commented `Phase 4.4`. This directly closes the `[SILENCE]` gap Chapter 1 of the legal manual flagged — see Chapter 4 for a note on where this figure came from, since the manual itself said no such figure could be found. |
| 4. النظافة العامة وتسيير النفايات (general hygiene & waste) | BGN-04-01…08 | 8 | BGN-04-06 (waste transfer manifest/"بورديرو") and BGN-04-08 (waste classification register) directly implement two Master Rollup "criteria to add" recommendations. BGN-04-05/07 split the incineration ban into non-hazardous vs. hazardous/medical self-incineration — more granular than the single ban Session 3 asked for. |
| 7. مكافحة النواقل (pest control) | BGN-07-01…05 | 5 | Code comment confirms: `// S9: upgraded with map/bait/trap/documentation detail from COU-AX8-02` — the Session 9 pest-control consolidation (4 layers → 1) is done here. |
| 8. السلامة العامة والوقاية من الحوادث (fire & general safety) | BGN-08-01…03, 05, 06 | 5 (04 retired) | BGN-08-01 now requires checking the extinguisher's service-tag date — closes the Session 4 gap. BGN-08-05 (fire alarm/smoke detection) and BGN-08-06 (wilaya operating-user authorization, Category 1) are new, universal, matching Master Rollup §5. `BGN-08-04`'s id is retired with a code comment redirecting to `BGN-01-03` — documented renumbering, not a duplicate. |
| 9. الضجيج والانبعاثات البيئية (noise & emissions) | BGN-09-01, 02 | 2 | See §2.4 — the most significant new finding of this chapter. |

**Total: 36 criteria**, matching the file's `grep` count exactly.

## 2.2 `baseFoodCriteria.ts` — 13 criteria, 7 food-handling checklists

Included in: `uabChecklist`, `abattoirChecklist`, `couvoirChecklist`,
`slaughterhouseSmallChecklist`, `bakeryChecklist`, `coldRoomChecklist`,
`produceStorageChecklist`. **Not** included in `updChecklist` (correct, documented
exclusion for primary poultry production — see Ch.1 §1.3).

| Axis | IDs | Status vs. audit findings |
|---|---|---|
| 1. المواد الأولية والموردون | BFD-01-01/02 | Unchanged from audit description. |
| 2. التخزين | BFD-02-01…03 | Unchanged; the ≥15cm/≥5cm shelving clearances are a concrete standard not previously flagged either way — worth treating as unverified [PRATIQUE]-tier, since the citation given is a bare Décret 17-140 reference with no article number. |
| 3. نظافة الأسطح والتجهيزات | BFD-03-01/02 | Unchanged. |
| 4. سلسلة البرودة (cold chain) | BFD-04-01/02 | Numeric thresholds hard-coded: chilled ≤5°C, frozen ≤−18°C. See §2.4.2 for a schema-consistency concern specific to this implementation. |
| 5. HACCP | BFD-05-01 | The undated "2020 joint ministerial order" citation flagged in Session 5 and the Perplexity spec is **gone**, replaced by a vaguer but not-wrong reference to Décret 17-140. Improvement, but vaguer than the Perplexity spec's proposed fix (which named art. 4 specifically) — worth tightening later, not urgent. |
| 6. نظافة العمال الصحية | BFD-06-01/02 | The six-monthly medical exam interval referenced in prior audits does **not** appear in the current criterion text — generalized to "شهادات صحة سارية" with no interval stated. Arguably more honest than asserting "6 months" without a source (the legal manual couldn't confirm the interval either), but the interval is no longer enforced anywhere in this criterion. |
| 7. مكافحة الآفات | *(retired)* | Code comment: `// Phase 8.4 ✅: BFD-07-01 و BFD-07-02 أُزيلا — المحور مُدمج في BGN-07-01/05`. Confirms the Session 9 pest-control consolidation shipped exactly as specified. |
| 8. التتبعية والسجلات (traceability) | BFD-08-01 | Code comment: `// Phase 3.4 ✅`. Exactly the shared traceability criterion the Session 5 audit and Perplexity spec recommended — done, with a 2-year retention requirement and citation to Loi 09-03 art. 19. |

**Total: 13 criteria**, matching the file's `grep` count.

## 2.3 `baseCompressedGasCriteria.ts` — 3 criteria, a new shared module with a self-documented incomplete rollout

This file appears in no uploaded audit document — it was created after the audit series,
evidently in direct response to Session 4's finding that blacksmith's gas-cylinder
criterion (`BLS-04-02`) was "independently reinvented" relative to GPL's equivalent. The
file's own header comment states the intended scope precisely:

> *"blacksmithCriteria.ts → imports CGS-01, CGS-02, CGS-03 (welding-gas context) ...
> gplCriteria.ts already has equivalent GPL-02-01/02/03; align wording on next GPL
> rework."*

**Verified done:** `blacksmithCriteria.ts` imports and spreads `baseCompressedGasCriteria`,
with its old `BLS-04-02` explicitly commented out and replaced (`// BLS-04-02 removed —
replaced by shared baseCompressedGasCriteria`).

**Verified not yet done, self-documented as such in the code:** `gplCriteria.ts` has
**not** been switched over — it still carries its own independently-worded
`GPL-02-01/02/03`. The exact duplication the merge was meant to solve still exists between
blacksmith (now via the shared module) and GPL (still standalone) — reduced from N
independent copies to 2, not to 1. **Listed in Chapter 6 as a small, precisely-scoped,
code-comment-confirmed remaining task.**

## 2.4 Two findings that need your attention

### 2.4.1 Décret 93-120 — status update: CONFIRMED LIVE, partially fixed, inconsistently applied

**Original finding (snapshot-era):** `93-120` cited 25 times across 11 files for at least
four different subjects, only one of which (periodic worker medical exams) matches the
decree's actual confirmed subject per the legal manual (organization of occupational
medicine).

**Confirmed live, this revision.** A dedicated citation-correction sweep has since run
against this codebase — visible directly in `printingCriteria.ts`, where `PRT-03-03`,
`PRT-05-01`, and `PRT-05-02` now carry explicit code comments explaining the correction
(e.g. citing Loi 90-11 art. 8, Décret 91-05 art. 6, and a *different* decree — 93-05 — for
machine-guarding, unverified but at least not a repeat of the 93-120 pattern). **This is
real, correctly-reasoned work.** But it was not applied uniformly:

| Location | Confirmed live status |
|---|---|
| `printingCriteria.ts` — machine-guarding, PPE, chemical storage | ✅ Fixed, with explanatory comments |
| `paintShopCriteria.ts`'s `PNT-04-01` (general PPE) | ❌ Still plain `93-120`, unfixed |
| `blacksmithCriteria.ts`'s `BLS-04-06` (occupational noise, 85 dB) | ❌ Still `93-120`, unfixed — and note: the live text doesn't even carry the "Art. 9" specificity that a parallel document (a live project-tracking roadmap in the same repo) claimed had been verified — see Chapter 8 §8.5 for that discrepancy in full |
| `uabCriteria.ts`'s `UAB-AX7-07` (occupational noise, 85 dB) | ❌ Still `93-120`, unfixed |
| `baseGeneralCriteria.ts`'s `BGN-09-01` (neighbor-facing 70 dB) | Not re-verified live this pass — presumed still open |

**The medical-exam uses remain correct and untouched** — `abattoirCriteria.ts`,
`bakeryCriteria.ts`, `uabCriteria.ts`'s `UAB-AX7-02`, and others. Do not touch those.

**Still the single highest-priority citation-correction task in this manuscript** — now
narrowed specifically to the two occupational-noise citations (`BLS-04-06`,
`UAB-AX7-07`) and `paintShopCriteria.ts`'s PPE citation, since the rest of the original
finding has genuinely been resolved. See Chapter 4 and Chapter 6 §6.1, and
`RAQIB_Fix_Spec_v2.md` Phase 9.1 for the exact remaining diffs.

### 2.4.2 `baseFoodCriteria.ts`'s cold-chain `numericField` objects — CONFIRMED LIVE: fixed in 3 of 4 locations

`src/types.ts` defines `NumericFieldSpec` with a **required** `unit` and `labelAr`, and
optional `min` / `max` / `warningMin` / `warningMax` / `step` / `upperLimit`. There is no
`label`, `threshold`, or `comparisonOperator` field in the type.

`baseGeneralCriteria.ts`'s `BGN-09-01` (noise) uses the type correctly:
`{ unit, labelAr, min, max, warningMax, step, upperLimit }`.

**Update, this revision:** `tsc --noEmit` was subsequently run (Chapter 8) and confirmed
this was a real compile error, present in 4 files, not just `baseFoodCriteria.ts`
(`baseFoodCriteria.ts` ×2, `blacksmithCriteria.ts` ×1, `uabCriteria.ts` ×1). **Live
re-verification, this revision: 3 of the 4 are now fixed** — `BFD-04-01`, `BFD-04-02`
(both in `baseFoodCriteria.ts`), and `BLS-04-06` (`blacksmithCriteria.ts`) all now
correctly use `{ unit, labelAr, min, max, warningMax, step, upperLimit }`, matching this
exact recommendation. **`uabCriteria.ts`'s `UAB-AX7-07` was not fixed** — confirmed live,
still uses the old broken shape (`{ label, unit, threshold, comparisonOperator }`)
verbatim. See Chapter 6 §6.2 and `RAQIB_Fix_Spec_v2.md` Phase 3.4 for the one remaining
diff.

---

*End of Chapter 2.*

---

# CHAPTER 3 — Activity-Specific Checklist Catalog

Every file below was read in full (or, for the largest four, verified by complete
ID/axis extraction) from the current zip. Status labels are defined as:

- **CURRENT** — matches or exceeds every relevant audit recommendation found for it; no
  known open issue beyond the cross-cutting ones already logged in Chapter 2/6.
- **MINOR_GAPS** — solid, functional, but has 1–2 specific, small, precisely-described
  open items.
- **NEEDS_REVIEW** — has a real structural gap (too few criteria for its risk profile,
  or an unresolved duplication/citation issue specific to the file).

## 3.1 Food & agro-processing files (consume `baseGeneralCriteria` + `baseFoodCriteria`)

| File | Criteria | Domain summary | Status |
|---|---|---|---|
| `abattoirCriteria.ts` | 26 (`ABT-AX1…AX10`) | Full slaughter/post-mortem pathway, wash-water chlorine residual, cold chain, HACCP (`AX8-01`, `AX10-01` — two HACCP-tagged axes, worth a naming cleanup, not a duplicate finding), fire safety, **and a new `ABT-AX10-02` veterinary/medical waste criterion citing Décret 03-478's three-stream system** — closes the gap the legal manual's Chapter 2 called "a genuinely new finding... currently zero coverage." | **CURRENT** |
| `slaughterhouseSmallCriteria.ts` | 12 (`SLH-05-01…09`, `SLH-06-01`, `SLH-07-01`) | Same veterinary-waste addition (`SLH-07-01`, Décret 03-478) as abattoir. `SLH-05-04` uses a correctly-typed `numericField` for the DBO5 discharge threshold (30 mg/L max, 25 mg/L warning) sourced from Décret 06-141 — this is a real, schema-correct implementation of a numeric legal threshold, exactly the pattern the audit series wanted generalized. | **CURRENT** |
| `couvoirCriteria.ts` | 22 (`COU-AX1…AX9`) | Hatchery-specific: incubation temp/humidity control, egg-batch traceability, biosecurity, disinfection between batches. No veterinary/medical-waste criterion — correctly, since a hatchery has no slaughter/post-mortem activity generating that waste stream. | **CURRENT** |
| `updCriteria.ts` | 20 (`UPD-AX1…AX10`) | Poultry housing: siting/isolation, manure management, biosecurity, veterinary program, EIA study (`AX10-01`). `updChecklist` correctly excludes `baseFoodCriteria` (Ch.1 §1.3). `UPD-AX3-02` (id gap between AX3-01 and AX3-03) is the renamed `UPD-AX2-03`/siting-distance criterion the Perplexity spec flagged with a placeholder — confirm whether the distance figure has since been filled in; **still worth a direct check**, see Chapter 6. | MINOR_GAPS |
| `uabCriteria.ts` | 28+ (`UAB-AX1…AX8`, since expanded with `AX7-07` noise measurement and sanction-tier/root-cause scaffolding — see Ch.8) | The "model" facility type across the whole audit series — full classify→segregate→dispose waste chain, discharge-permit-to-lab-analysis chain, major-hazard risk study, emissions measurement, anti-obstruction (`AX8-01`). Still the deepest single checklist in the codebase. **Confirmed live: `UAB-AX7-07`'s `numericField` schema bug (§2.4.2) and its `93-120` noise mis-citation (§2.4.1) are both still unfixed.** Also: `UAB-AX6-01` cites Décret 22-167 for "industrial equipment maintenance," but the legal manual's Chapter 6 confirms 22-167's actual subject is the 2022 amendment to Décret 06-198 (licensing), not equipment maintenance — lower-confidence flag, not independently re-verified against 22-167's full text, listed as Research Task R8 in Chapter 6. | MINOR_GAPS |
| `bakeryCriteria.ts` | 13 (`BAK-10-01…13`) | HACCP (`10-10`), worker medical exams (`10-11`), extinguisher service-tag (`10-12`), and — new, not flagged in any audit — an EIA/impact-study criterion (`10-13`). This single file now implements three separate items from three different audit documents' "should add" lists. | **CURRENT** |
| `coldRoomCriteria.ts` | 7 (`CLD-17-01…06`, `18-01`) | Traceability correctly retired in favor of shared `BFD-08-01` (§2.2). `CLD-17-04`'s cold-chain `numericField` is correctly typed (`unit`, `labelAr`, `min`, `max`, `warningMax`, `step`, `upperLimit`) — **this is the schema `baseFoodCriteria.ts`'s own cold-chain fields should have matched but didn't** (see §2.4.2); worth using this file as the template when fixing that. | **CURRENT** |
| `produceStorageCriteria.ts` | 7 (`PRD-01…05`) | Pest control and traceability both correctly retired to shared modules. Clean, no open items found. | **CURRENT** |

## 3.2 Industrial / workshop files (consume `baseGeneralCriteria` only)

| File | Criteria | Domain summary | Status |
|---|---|---|---|
| `mechanicCriteria.ts` | 9 (`MCH-29-02…10`) | ✅ **Update, confirmed live:** the Master Rollup/Master Audit v2 recommendation has been implemented — `MCH-29-08` (brake fluid), `MCH-29-09` (tyre waste), `MCH-29-10` (lead-acid battery) now exist, independently drafted, citing Loi 01-19 + Décret 05-315 (both already-confirmed-correct instruments elsewhere in this codebase). No longer the smallest checklist by a wide margin. | **CURRENT** |
| `blacksmithCriteria.ts` | 10 + 3 (via `baseCompressedGasCriteria`) = 13 effective | Gas-cylinder storage now via the shared module (§2.3). Emissions-measurement criterion (`BLS-04-07`) exists but **confirmed live: cites Décret 06-141 (wrong — see §2.4.1/Ch.4) instead of 06-138 for welding-fume air emissions**, and doesn't state a numeric ceiling in prose (unlike carpentry/marble, less severe on that dimension). **`BLS-04-06`'s `numericField` schema is confirmed fixed** (§2.4.2); **its `93-120` occupational-noise citation is confirmed still unfixed** (§2.4.1). `BLS-04-05` (machine guard) now correctly cites a different decree, 93-05, not 93-120 — unverified independently, but not part of the mis-citation pattern. | MINOR_GAPS |
| `carpenteryCriteria.ts` | 11 | Machine-guard criterion present (Session 6 gap — carpentry already had one; this was blacksmith's gap, now closed via the shared PPE/machine axis). New wood-dust emissions-measurement criterion (`CAR-05-02`) states a specific **5 mg/m³** respirable-dust ceiling in prose — but is typed `'doc'` and doesn't use `numericField`, so this numeric threshold isn't schema-enforced the way `coldRoomCriteria.ts`'s or `slaughterhouseSmallCriteria.ts`'s are. Also carries a `93-120` mis-citation (§2.4.1). | MINOR_GAPS |
| `marbleCriteria.ts` | 11 | Same pattern as carpentry: new silica-dust emissions criterion (`MRB-05-05`, **0.1 mg/m³** ceiling) in prose only, `controlType: 'doc'`, no `numericField`. Also a `93-120` mis-citation. | MINOR_GAPS |
| `paintShopCriteria.ts` | 12 | ✅/⚠️ **Update, confirmed live:** the emissions-measurement gap flagged below is closed — `PNT-02-01/02/03` all exist. **But all three cite Décret 06-141**, the wastewater/liquid-discharge decree (confirmed extensively wrong for this purpose — see Chapter 4 §4.1's parameter table), **for VOC air emissions** — should be Décret 06-138, already used correctly in `carpenteryCriteria.ts`/`marbleCriteria.ts`. Also `PNT-04-01`'s `93-120` PPE mis-citation (§2.4.1) is confirmed still unfixed. | MINOR_GAPS |
| `printingCriteria.ts` | 11 | ✅/⚠️ **Update, confirmed live:** `PRT-02-01/02/03` emissions criteria exist, same Décret 06-141-instead-of-06-138 problem as paint shop (3 instances). **Machine-guarding/PPE/chemical-storage citations (`PRT-03-03`, `PRT-05-01`, `PRT-05-02`) are correctly fixed with explanatory code comments** — this file got the good half of the citation-correction work paint shop didn't. `PRT-03-03`'s Décret 04-409 mis-citation (Session 3) remains confirmed gone. | MINOR_GAPS |
| `carWashCriteria.ts` | 12 | Discharge/oil-separator chain, water conservation, chemical storage, hazardous waste. Two `numericField`s present (worth confirming what they measure — likely discharge parameters) — **the most measurement-forward of the workshop files**, closer to UAB's model than any other. | **CURRENT** |
| `gplCriteria.ts` | 10 | Citations fully corrected (21-430 ×8, 09-335 ×1 — Ch.1 §1.1 spot-check). **Still has its own independently-worded `GPL-02-01/02/03` cylinder-storage criteria instead of consuming `baseCompressedGasCriteria`** — the one open item explicitly flagged by that shared module's own code comment (§2.3). | MINOR_GAPS |
| `semiPharmaCriteria.ts` | 9 | Packaging hygiene, traceability, labeling, worker health. No prior audit session covered this activity type in depth (it was one of the 10 originally-unmapped activities); nothing here contradicts or duplicates any other file's content. | **CURRENT** |

## 3.3 Checklist-level totals (base + activity-specific, as actually composed)

| Checklist | General (36) | Food (13) | Compressed-gas (3) | Activity-specific | **Total items an inspector sees** |
|---|---|---|---|---|---|
| `uabChecklist` | ✓ | ✓ | — | 28 | **77** |
| `abattoirChecklist` | ✓ | ✓ | — | 26 | **75** |
| `couvoirChecklist` | ✓ | ✓ | — | 22 | **71** |
| `updChecklist` | ✓ | — | — | 20 | **56** |
| `slaughterhouseSmallChecklist` | ✓ | ✓ | — | 12 | **61** |
| `bakeryChecklist` | ✓ | ✓ | — | 13 | **62** |
| `coldRoomChecklist` | ✓ | ✓ | — | 7 | **56** |
| `produceStorageChecklist` | ✓ | ✓ | — | 7 | **56** |
| `mechanicChecklist` | ✓ | — | — | 6 | **42** |
| `blacksmithChecklist` | ✓ | — | ✓ | 10 | **49** |
| `carpentryChecklist` | ✓ | — | — | 11 | **47** |
| `carWashChecklist` | ✓ | — | — | 12 | **48** |
| `gplChecklist` | ✓ | — | — | 10 | **46** |
| `marbleChecklist` | ✓ | — | — | 11 | **47** |
| `paintShopChecklist` | ✓ | — | — | 9 | **45** |
| `printingChecklist` | ✓ | — | — | 11 | **47** |
| `semiPharmaChecklist` | ✓ | — | — | 9 | **45** |

`mechanicChecklist` (42 items) is the smallest checklist in the app by a meaningful
margin — 4 fewer than the next-smallest — which is consistent with §3.2's
**NEEDS_REVIEW** finding for `mechanicCriteria.ts` rather than contradicting it.

---

*End of Chapter 3.*

---

# CHAPTER 4 — Legal & Regulatory Framework

This chapter consolidates every law/decree number found by scanning all 20 criteria
files (`legalReference` fields), cross-referenced against the 8-chapter legal manual
(`Inspection_Manual_Chapter1…6`, plus the Air Quality and Occupational Health sessions)
where that manual covers the same instrument. 37 distinct instrument numbers are cited in
the current code.

## 4.1 Instruments confirmed correctly used, matching the legal manual's research

| Instrument | Subject (per legal manual) | Where cited in code | Status |
|---|---|---|---|
| Décret 06-198 (+ 22-167, 24-196 amendments) | Classified-establishment licensing framework | `baseGeneralCriteria.ts` (BGN-01-01, BGN-08-06), throughout | ✅ Correctly cites the amended text, including the amendment decrees — matches the manual's single most consequential finding (Ch.6). |
| Loi 03-10 | General environmental protection | Nearly every file | ✅ Consistent. |
| Loi 01-19 | Waste management framework | Nearly every file | ✅ Consistent. |
| Décret 06-104 | Official waste classification list | `slaughterhouseSmallCriteria.ts` etc. | ✅ Consistent. |
| Décret 05-315 | Hazardous special waste declaration | Multiple files | ✅ Consistent. |
| **Décret 09-19** | Collection-operator accreditation | `slaughterhouseSmallCriteria.ts` (SLH-05-05 equivalent) | ✅ **Session 3's flagged gap — "none of the contract-with-approved-operator criteria cite Décret 09-19" — is now fixed**, at least in this file. Worth confirming it's been added everywhere the "contract with approved operator" pattern repeats (mechanic, UAB, abattoir) — see Chapter 6. |
| Décret 21-430 | LPG/C installation licensing | `gplCriteria.ts` | ✅ Session 4's 04-409 mis-citation fully corrected (8 of 8 affected criteria). |
| Décret 09-335 | Internal industrial intervention plans | `gplCriteria.ts`, `uabCriteria.ts` | ✅ Session 4's 09-410 mis-citation fully corrected. |
| Décret 17-140 | Food hygiene/HACCP framework | `baseFoodCriteria.ts` + every food-adjacent file | ✅ Consistent, article-level in most places. |
| Décret 03-478 | Medical/veterinary waste, 3-stream system | `abattoirCriteria.ts`, `slaughterhouseSmallCriteria.ts` | ✅ New since the audit series — closes the "zero coverage" gap the legal manual's Chapter 2 flagged. |
| Loi 09-03 | Consumer protection / traceability | `baseFoodCriteria.ts` (BFD-08-01) | ✅ Consistent. |
| Décret 93-162 | Used-oil recovery | `mechanicCriteria.ts` | ✅ Consistent. |
| **Décret 11-125 (amended by 14-96) / Décret 11-219** | Drinking-water chlorine residual standard, ≥0.1 mg/L | `slaughterhouseSmallCriteria.ts` (SLH-05-06) | ✅ **This resolves an item the legal manual explicitly flagged for verification and could not confirm** — "Chlorine residual for abattoir/food-facility wash water `[PRATIQUE]`... this manual could not independently verify a specific Algerian decree mandating this exact figure" (`Inspection_Manual_Chapter1_Wastewater.txt`, §6). The code now cites a specific, dated instrument for the 0.1 mg/L figure. **This should be fed back into the legal manual to upgrade that value from `[PRATIQUE]` to `[LOI]`** — a rare case of the codebase's research now being ahead of the manual's. |

## 4.2 Instruments cited in code that never appear in any uploaded audit/manual document

These aren't errors — they're real Algerian instruments the audit series simply never
researched, because the criteria they ground were added after the audit series concluded.
Listed here so they're captured in the manuscript rather than silently absent:

| Instrument | Cited subject in code | Where |
|---|---|---|
| Décret 02-115 | Establishes ONEDD (National Environmental Observatory) | `uabCriteria.ts` (paired with 06-141 as the reference for discharge values) |
| Décret 07-205 | Requirements for licensed hazardous-waste incinerators | `baseGeneralCriteria.ts` (BGN-04-07) |
| Décret 23-324 | Conditions for practicing as an environmental-studies consultancy | Used where a facility is directed to obtain an environmental review |
| Décret 76-35 | Electrical worker-protection requirements; also cited for compressed-gas storage safety | `baseGeneralCriteria.ts` (BGN-08-03), `baseCompressedGasCriteria.ts` — **note: this decree is cited for two unrelated subjects (electrical safety AND gas-cylinder storage) in different files; worth a quick check that it genuinely covers both, since this is structurally the same risk pattern as the 93-120 problem, just not yet confirmed as wrong** |
| Loi 90-11 | Labor relations law, cited as an occupational-safety basis | Multiple workshop files |
| Décret 88-164 | Drinking-water specifications | `baseGeneralCriteria.ts` (BGN-03-01) |
| Loi 04-08 | General conditions for commercial activity | `marbleCriteria.ts`, `paintShopCriteria.ts` (with explanation), `carWashCriteria.ts`, `printingCriteria.ts` (bare citation, no parenthetical — minor completeness inconsistency, not a wrong citation) |

None of these were checked against a primary source by this manuscript — they're flagged
as "present in code, absent from prior legal research" rather than verified correct.
**Chapter 6 lists confirming these as a Research Task**, distinct from the higher-priority
93-120 correction, since there's no specific reason to doubt them.

## 4.3 The one confirmed, high-priority citation problem: Décret 93-120

Fully detailed in Chapter 2 §2.4.1 — repeated here as the anchor entry in this
chapter's table since it's a legal-framework issue, not just a code issue.

| Instrument | Actually governs (per legal manual, confirmed) | Correctly cited for | Incorrectly cited for |
|---|---|---|---|
| Décret 93-120 (15 mai 1993) | Organization of occupational medicine | Periodic worker medical exams (10 files, correct) | Noise limits — both the 70 dB neighbor-facing figure and the 85 dB occupational figure (2 files); machine-guarding/emergency-stops (4 files); dust protection (2 files); general PPE (3 files) |

**Recommended fix, to be executed in code (not in this manuscript):** revert the noise,
machine-guarding, dust, and general-PPE citations to their actual legal basis. For noise,
the pre-2026 code's citation — **Décret 93-184** — should be restored *if* it can be
re-verified as the correct instrument (this manuscript did not re-verify 93-184 itself
against a primary source; it only confirms 93-120 is wrong for this purpose). For
machine-guarding and general PPE, Loi 88-07 (already correctly used elsewhere in the
codebase for exactly this purpose — see `baseGeneralCriteria.ts` BGN-09-02, which
correctly cites Décret 02-427 for PPE-training) is the right anchor. For the 85 dB
occupational figure specifically, the legal manual's own instruction should be followed:
either find the actual Algerian noise-exposure decree (a dedicated research task the
manual already recommended and which this manuscript re-flags in Chapter 6), or present
the figure explicitly as `[INTL]`/best-practice rather than attaching a specific,
seemingly-authoritative decree number to it.

## 4.4 `[LOI]` / `[PRATIQUE]` / `[INTL]` / `[SILENCE]` tags: what the code has resolved since the manual was written

The legal manual's tagging convention (Ch.1 front matter) predates most of the code
changes catalogued in this manuscript. Cross-referencing what the manual left open against
what the code now contains:

| Manual's flagged item | Manual's status | Code's current status |
|---|---|---|
| Abattoir wash-water chlorine residual (0.1 mg/L) | `[PRATIQUE]`, "flagged for legal verification" | **Resolved** — Décret 11-125/14-96 now cited (§4.1) |
| Décret 06-198's four-category → facility-type mapping (Décret 07-144) | `[LOI]`, "not yet extracted... highest-value remaining gap" | **Not resolved in criteria code** — but see Chapter 1 §1.6: `facilityCategoriesFull.json` may already contain this data, unused |
| Septic-pit pumping frequency | `[SILENCE]`, "no numeric requirement found" | **A specific figure now appears in code** (BGN-03-06: ≤90 days or 80% capacity) with no legal citation for the number itself beyond the general septic-service decrees — this is worth checking whether it's [PRATIQUE] (a reasonable operational standard the developer set) being presented without the `[PRATIQUE]` label, or whether a source was found and just not carried into this manuscript's source documents. **Flagged for verification in Chapter 6**, not asserted either way. |
| Occupational noise-exposure limit | `[SILENCE]`, explicitly warned against dressing up 85 dB(A) as law | **Regressed** — 85 dB is now attached to Décret 93-120, incorrectly (§4.3) |
| Loi 19-02 evacuation-width/exit-capacity figures | `[SILENCE]`, "research gap, not confirmed silence" | Not found in any criteria file — still open |
| Extinguisher class-to-hazard technical standard | `[PRATIQUE]`, not independently sourced | Unchanged in code — extinguisher criteria specify CO2/dry-powder by activity type without a cited Algerian technical standard |
| UPD/UPD-siting minimum distance figure (Perplexity spec placeholder) | Flagged as needing the actual figure before merge | `UPD-AX2-...` axis exists in current code (§3.1) — **needs a direct read of the current criterion text to confirm whether the placeholder was ever filled in; not yet checked in this manuscript** |

---

*End of Chapter 4.*

---

# CHAPTER 5 — Completed Audit Corrections

This is the deduplicated "already done" log. Its purpose is narrow and specific: **stop
any future session (human or AI) from re-investigating or re-fixing any of the following**,
since every line here was verified directly against the current code, not inferred from
a prior report's claim.

## 5.1 Structural deduplication (Master Rollup §2, Perplexity spec Phase 1)

- Legacy numeric duplicate ID series (`04-0X` abattoir, `01-0X` UAB, `02-0X` couvoir,
  `03-0X` UPD) — **fully removed**. Zero matches anywhere in the current codebase.
- Universal double-licensing (Session 7's highest-frequency finding — every facility
  checking its operating license twice) — **merged for 9 of the ~13 affected files**
  (blacksmith, carpentry, car wash, marble, paint shop, printing, semi-pharma, mechanic,
  plus the anti-obstruction promotion). **Not yet merged for bakery, cold room, GPL, and
  produce storage** — see Chapter 6, this is now a precisely-scoped remaining task, not a
  rediscovered version of the original finding.
- Pest control's four-layer stack (general baseline + food baseline + per-facility +
  legacy) — **fully consolidated** into `BGN-07-01…05`, with the food-specific insect
  screen requirement and the UPD wild-bird exclusion correctly retained as documented
  additions rather than merged away. Confirmed via code comments in `baseFoodCriteria.ts`
  (`Phase 8.4 ✅`), `bakeryCriteria.ts`, `produceStorageCriteria.ts`,
  `slaughterhouseSmallCriteria.ts`.
- Traceability's two independently-written versions (cold room, produce storage) —
  **fully consolidated** into `BFD-08-01` in the shared food baseline (`Phase 3.4 ✅`).

## 5.2 Legal citation corrections (Sessions 3–4)

- Décret 04-409 (hazardous-waste transport, mis-cited for LPG licensing and SDS
  requirements) — **fully corrected**. Zero remaining citations anywhere in the codebase;
  `gplCriteria.ts` now correctly cites Décret 21-430, `printingCriteria.ts`'s SDS
  criterion no longer cites it at all.
- Décret 09-410 (security-sensitive equipment, mis-cited for emergency intervention
  plans) — **fully corrected**, replaced by Décret 09-335 in both affected files.
- Décret 06-198's amendment history (22-167, 24-196) — **correctly incorporated**
  throughout, including the three-year regularization grace period logic implicitly
  reflected in `BGN-01-01`'s no-license branch.
- Décret 09-19 (waste-collector accreditation, previously never cited despite being the
  actual basis for every "approved operator" criterion) — **now cited**, confirmed in
  `slaughterhouseSmallCriteria.ts`; extent of rollout to other "approved operator"
  criteria not fully re-verified across every file — flagged as a light verification task
  in Chapter 6, not a reopened finding.

## 5.3 New content added since the audit series (not "fixes" — genuinely new)

- HACCP extended from bakery-only to abattoir, small slaughterhouse, and cold room
  (Master Rollup §5 recommendation) — **done**, all four now carry a documented,
  legally-grounded HACCP criterion.
- Veterinary/medical waste, Décret 03-478's three-stream system — **newly added** to
  abattoir and small slaughterhouse, closing a gap the legal manual's Chapter 2 called
  "a genuinely new finding... zero presence in the current SafeInspect checklist."
- Anti-obstruction/illegal-operation criterion — **promoted from UAB-only (1 of 18
  facility types) to universal** (`BGN-01-03`), exactly as Session 7 recommended.
- Fire-alarm/smoke-detection and basic electrical-safety criteria — **added to the
  universal baseline** (`BGN-08-03`, `BGN-08-05`), closing the "zero coverage anywhere"
  finding from Session 4.
- Extinguisher service-tag/date verification — **added** to `BGN-08-01` and individually
  to `bakeryCriteria.ts` (`BAK-10-12`) and `mechanicCriteria.ts`, closing the "presence
  checked, service currency never checked" finding from Session 4.
- Machine guard for blacksmith — closed via the shared safety axis, alongside the
  compressed-gas consolidation (§2.3).
- Waste transfer manifest ("بورديرو") and waste classification/inventory register — both
  **added to the universal baseline** (`BGN-04-06`, `BGN-04-08`), closing the "contract
  existence ≠ proof of execution" finding shared by Sessions 2 and 3.
- Periodic emissions measurement, extended from UAB-only to carpentry, marble, and
  blacksmith (Session 8's recommendation) — **now confirmed fully rolled out to all five
  activities**, including paint shop and printing (the two Session 8 named specifically) —
  though with a citation defect on the new criteria, see §5.6 and Chapter 6 §6.1.
- Décret 06-198 Category 1 (wilaya-level) operating-user authorization — **new, universal
  criterion** (`BGN-08-06`), matching the four-category licensing-authority system
  documented in the legal manual's Chapter 6.
- Décret 11-125/14-96/11-219's chlorine-residual figure — **new citation**, resolving a
  value the legal manual could not verify and had left at `[PRATIQUE]` (§4.1, §4.4).

## 5.4 SHA-256 integrity hashing (all three audit documents' Priority 1)

`IntegrityService.ts` uses `expo-crypto`'s `CryptoDigestAlgorithm.SHA256` — the djb2 →
SHA-256 replacement flagged as the single highest-priority "do it today, 2 hours" item
across `SafeInspect_360_Audit_Report.md`, `SafeInspect_Master_Audit_v2.md`, and
`Expert_Panel_Review_Report.docx` is **done**.

## 5.5 Infrastructure the "missing 85%" documents did not anticipate

Not corrections to a specific flagged item, but worth logging so no future session
proposes rebuilding what already exists: `ApprovalRepository`, `AuditLogRepository`,
`AuthRepository`, `CorrectiveActionRepository`, `differentialView.ts`,
`decisionSupport.ts`, `meetingGateService.ts`, `followUpService.ts`, `briefService.ts`,
`geofencingService.ts`, `apiClient.ts` / `SyncService.ts`, and a SQLite schema +
migration runner (`src/db/schema.ts`, Phase A of a two-phase migration — see Chapter 6
for what Phase B still requires). Full detail in Chapter 1 §1.1. **Additionally, since
this section was first drafted: a full working backend (`server/` — Express + Prisma +
PostgreSQL + JWT auth) has been confirmed to exist, closely matching the MVP spec
`SafeInspect_Master_Audit_v2.md` proposed from scratch. See Chapter 8 §8.1.**

## 5.6 First live-verification pass — superseded by §5.7 below

The list below was accurate as of the first live GitHub read this session. Several items
have since been closed by a second read — kept here only to show the trajectory; **§5.7
is current.**

- Facility↔checklist mapping (G1) — fully fixed.
- Mechanic checklist expansion (G8) — fully done.
- Paint-shop and printing emissions measurement (G5) — added, but citation was wrong on
  all 6 instances at the time.
- `numericField` schema fix — done for 3 of 4 files; `UAB-AX7-07` unfixed at the time.
- 93-120 citation sweep — done for printing's machine-guarding/PPE/chemical-storage; not
  yet extended elsewhere at the time.

## 5.7 Second live-verification pass — current, this revision

A second read (11 more files) found the overwhelming majority of what §5.6 listed as
open has since been closed — several fixes carry code comments explicitly citing this
manuscript's G-numbers and `RAQIB_Fix_Spec_v2.md`'s phase numbers, confirming both
documents are being read and acted on directly, not just referenced loosely:

- **G-CAP (the CAP auto-creation bug, Chapter 1 §1.5) — FIXED.** `InspectionRepository.ts`
  now imports and calls `capFactory.ts`'s `createCapItemsFromInspection(toSave)`, with a
  code comment reading: *"FIX (G17c): replaced dead
  CorrectiveActionRepository.createFromInspection (method never existed) with the real
  capFactory function — this is why CAP items were silently not being created on
  inspection completion."* This was this manuscript's single highest-priority finding.
- **G17a (AuditLogRepository signature) — FIXED**, all 3 call sites in
  `InspectionRepository.ts`, each with a `FIX (G17a)` comment.
- **G17b (`CorrectiveAction.severity`) — FIXED.** `types.ts` now declares
  `severity: Severity | 'critical'`, comment: *"FIX (G17b): added '| critical' —
  capFactory.ts already assigns this value..."*
- **G15 (`Category` type/value drift) — FIXED.** `types.ts`'s `Category` type now reads
  `'تنظيمية' | 'بيئية' | 'صحية' | 'سلامة' | 'نظافة' | 'عامة' | 'غذائية'`, comment: *"FIX
  (G15): corrected 'صحيه' → 'صحية'... added 'غذائية'..."* — exactly the fix this
  manuscript recommended, including the reasoning for which direction to fix it in.
- **G14 (peer-dependency version) — FIXED.** `package.json` now pins
  `react-native-safe-area-context@~5.4.0`.
- **G13 (sync path mismatch) — FIXED.** `SyncService.ts` now calls `apiClient('/sync', …)`,
  comment: *"FIX (G13/Phase5): server route is registered at POST /sync (not
  /sync/inspections)."*
- **G6 (carpentry/marble numericField) — FIXED**, both files, comments explicitly marked
  `G6 fix`.
- **G18 (Décret 06-141 → 06-138) — FIXED in 5 of 6 originally-found instances**: marble
  (`MRB-02-02`, comment `G6 fix: citation corrected 06-141 → 06-138`), blacksmith
  (`BLS-04-07`, comment `Phase 14.7`), printing (`PRT-02-01/02/03`), and paint shop
  (`PNT-02-01/02/03`) all now correctly cite Décret 06-138.
- **G2 (93-120 noise/PPE mis-citations) — FIXED for `blacksmithCriteria.ts`'s
  `BLS-04-06`** (with a comment explicitly reverting the earlier "Art. 9" claim as
  unverified precision and reframing the 85 dB figure as an unconfirmed international
  reference pending Research Tasks R1/R6 — precisely the correct treatment) **and for
  `paintShopCriteria.ts`'s `PNT-04-01`** (now correctly cites Loi 90-11 + Décret 91-05).
  **`uabCriteria.ts`'s `UAB-AX7-07` remains unfixed** — see Chapter 6 §6.1.
- **G16 (numericField schema) — FIXED in all 4 originally-flagged locations**, including
  `UAB-AX7-07` (confirmed fixed this pass, comment: `FIX (Phase 14): align numericField
  to NumericFieldSpec... matches BLS-04-06 schema`).

**Not re-confirmed this pass, status per §5.6/Chapter 6:** G3 (narrowed — GPL's version
evolved into legitimate new content rather than being a duplicate to remove; bakery/
cold-room/produce-storage still open), G9, G10, G11, G12.

---

*End of Chapter 5.*

---

# CHAPTER 6 — Remaining Implementation Gaps

**Revised a second time this session.** Between the previous revision and this one, a
second live GitHub read (11 more files) found that the overwhelming majority of what was
listed as open has since been fixed — several with code comments directly citing this
manuscript's own G-numbers and the companion `RAQIB_Fix_Spec_v2.md`'s phase numbers,
confirming the two documents are being read and acted on directly. This chapter now
reflects that: closed items have been removed (Chapter 5 §5.7 has the full closure log),
and only what remains genuinely open — confirmed as of this most recent read — is listed
below.

## 6.0 🔴 NEW, CRITICAL — R7's "resolved" VOC/dust thresholds are wrong; do not implement as drafted

`CHECKLIST_PROFESSIONAL_ROADMAP.md` reports Research Task R7 (Décret 06-138's Annex I
emissions thresholds — previously an open research gap in the legal manual and this
manuscript) as resolved, citing a specific official source (`me.gov.dz`) and specific
numbers: total dust **30 mg/Nm³ (50 mg/Nm³ for old installations)**, VOC **20 mg/Nm³
(100 mg/Nm³ for old installations)**. Five new criteria were reportedly drafted against
these figures (`PNT-07-01`, `MRB-07-01`, `CRP-07-01`, `PRT-07-01`, `BLS-07-01`).

**These numbers are wrong, verified against two independent primary sources this
session** (`me.gov.dz`'s own PDF and a cleanly-extracted republication at `and.dz`).
Décret 06-138's actual Annex I general limits are:

| Parameter | Roadmap's claimed figure | Confirmed actual Annex I general limit |
|---|---|---|
| Poussières totales (total dust) | 30 mg/Nm³ (50 old) | **50 mg/Nm³ (100 old)** |
| Composés organiques volatils (VOC) | 20 mg/Nm³ (100 old) | **150 mg/Nm³ (200 old)** |

The dust figure is traceable to a real but wrong row: **Annex II category 2 (cement/
plaster/lime manufacturing)** specifies exactly 30/50 mg/Nm³ for dust — a real number
from the real decree, pulled from the wrong table. None of the five facility types these
criteria target (marble, carpentry, blacksmith, paint shop, printing) are cement/lime
facilities; they should use Annex I's general limit. The VOC figure (20 mg/Nm³) doesn't
match any value found anywhere in the decree — Annex I's general VOC limit is 150 mg/Nm³;
the closest category-specific figure (bitumen/drying installations) is 30/50 mg/Nm³.
Neither matches 20.

**This is the third instance of a confidently-sourced-looking legal citation turning out
wrong in this same workflow**, after the 93-120 "Art. 9" claim and the 06-141-for-VOC
claim (both Chapter 8 §8.5). Unlike those two, this one comes with a specific URL and
date attached, which makes it look more verified than it is — worth naming explicitly to
whoever is prompting Perplexity: **a citation with a source URL still needs the actual
number checked against the actual table**, not just confirmation that the document
exists and is reachable.

**Action: do not merge `PNT-07-01`/`MRB-07-01`/`CRP-07-01`/`PRT-07-01`/`BLS-07-01` with
the current threshold values.** Correct to 50 mg/Nm³ (dust) / 150 mg/Nm³ (VOC) general
limits, with 100/200 mg/Nm³ tolerance for pre-existing installations, before merging. If
any of these five facility types should instead be evaluated under one of Annex II's
specific industrial categories rather than Annex I's general limit, that needs an
explicit, stated rationale — not a default assumption either way.

## 6.1 Confirmed still open — actionable now

**G2, remaining instance.** `uabCriteria.ts`'s `UAB-AX7-07` still cites plain
`المرسوم 93-120 (الحد الأقصى للضجيج في بيئة العمل: 85 ديسيبل)` for occupational noise.
The identical issue in `blacksmithCriteria.ts`'s `BLS-04-06` and `paintShopCriteria.ts`'s
`PNT-04-01` has already been fixed — `BLS-04-06` with a code comment explicitly treating
the 85 dB figure as an unconfirmed international reference pending Research Tasks R1/R6,
which is the correct pattern. Apply the identical fix to `UAB-AX7-07`.

**R8 — now CONFIRMED (primary source), not just flagged.** `uabCriteria.ts`'s
`UAB-AX6-01` cites Décret 22-167 for "صيانة التجهيزات الصناعية" (industrial equipment
maintenance). This has since been independently verified by fetching the actual Journal
Officiel text of Décret 22-167 from three sources (`faolex.fao.org`, `me.gov.dz`,
`cnas.dz`) — its Article 1 states unambiguously: *"Le présent décret a pour objet de
modifier et de compléter certaines dispositions du décret exécutif n° 06-198"* (redefining
terms, subdividing establishment categories, and setting environmental-audit terms of
reference — an annex titled *"TERMES DE REFERENCE DE L'AUDIT ENVIRONNEMENTAL"* is attached).
**Nothing in it concerns equipment maintenance.** This is a fourth confirmed instance of
this same failure pattern in this codebase (after 93-120/noise, 06-141/VOC, and R7's
wrong emissions numbers) — a real, correctly-numbered decree, cited for a subject it
doesn't cover. It also appears to be a **regression**: the pre-2026 project files version
of this same criterion cited Décret 06-198 art. 13 — the base classified-establishment
decree, which does plausibly cover equipment-maintenance-as-technical-file-compliance —
suggesting a correct citation was replaced with an incorrect one at some point during
implementation, the same pattern found earlier with the 93-184→93-120 noise-citation swap.
See `RAQIB_Fix_Spec_v3.md` Phase C for the fix.

**G3, narrowed.** Three of the original four files still carry a standalone license
criterion duplicating `BGN-01-01`: `bakeryCriteria.ts` (`BAK-10-01`),
`coldRoomCriteria.ts` (`CLD-17-01`), `produceStorageCriteria.ts` (`PRD-01-01`) — all
confirmed live, unchanged, plain restatements. **`gplCriteria.ts`'s `GPL-01-01` is no
longer in this category** — it has been substantially rewritten to include the Décret
24-196 regularization grace-period logic and the Décret 06-198 art. 4 non-substitution
principle (license doesn't replace GPL/energy-sector accreditation or fire-safety
authorization), both matching real research gaps the legal manual's Chapter 6 flagged.
This is no longer "unwanted duplication" — it's legitimate, valuable, GPL-specific legal
content that happens to also restate the base license concept. **Worth considering
whether the grace-period/non-substitution logic should be promoted into `BGN-01-01`
itself**, since Décret 24-196's grace period and art. 4's non-substitution principle
apply to every classified establishment under Décret 06-198, not just GPL — a design
question, not a bug.

**Minor: `PRD-02-01`** (`produceStorageCriteria.ts`) is typed `controlType: 'measurement'`
but has no `numericField` object attached, despite stating two numeric ranges in prose
(0–5°C for vegetables, 7–15°C for olives). Small, same-shape fix as the numericField work
already done elsewhere.

**New, this pass: `BGN-02-06` — likely a fifth instance of the 93-120 pattern.**
`baseGeneralCriteria.ts`'s `BGN-02-06` (general workplace ventilation) cites "المرسوم
التنفيذي 93-120 المادة 11 (متطلبات التهوية في المنشآت الصناعية)" — ventilation
requirements. The legal manual's confirmed sole subject for Décret 93-120 is occupational
medicine organization; ventilation is not part of that. Not independently re-verified
against a primary source this pass (unlike R7/R8, which were), but follows the identical
shape as the four confirmed instances — flagged with the same confidence as those were
before their own primary-source checks, i.e. worth verifying, not yet asserted as
certain.

**New, this pass: Décret 76-35's dual use — checked, genuinely inconclusive.** `BGN-08-03`
(electrical safety) cites Décret 76-35. Per `CHECKLIST_PROFESSIONAL_ROADMAP.md`'s Phase 11,
76-35 was scoped specifically to compressed-gas storage (`baseCompressedGasCriteria.ts`'s
`CGS-01-xx`) as the resolution to the original Research Task R5. A primary-source search
was attempted this pass and **did not locate the actual text of a 1976-era Algerian
Décret exécutif n° 76-35** — unlike the 2006-and-later decrees checked elsewhere in this
manuscript, older instruments from this period do not appear to be well-indexed in
generally-searchable sources. **Genuinely unresolved, not a confirmed error** — stated
plainly rather than forced to a conclusion either way, consistent with
`RAQIB_Citation_Verification_Protocol.md`'s own standard: absence of verification is not
evidence of error, and shouldn't be reported as one. Either 76-35 covers both electrical
safety and compressed-gas storage legitimately, or one use is wrong — this remains
Research Task R9, requiring a JORADP archive search or a source better suited to
pre-2000s Algerian legal texts than general web search.

**Good news, this pass: a new universal EIA/impact-study criterion (`BGN-10-01`) has been
added, and handled honestly.** `baseGeneralCriteria.ts` now has a 10th axis
("دراسة التأثير البيئي") with a criterion requiring an environmental impact study or
summary for Category 1/2 classified establishments, citing Loi 03-10 arts. 15–22, Décret
07-145, Décret 07-144, and the amended Décret 06-198. Its code comment explicitly states:
*"Facility-type-to-category mapping (Décret 07-144) is a research gap (10.5) — inspector
must verify category from the operating license or wilaya classification list."* This is
the correct pattern — an honest research-gap flag rather than an invented mapping — and
partially addresses G10's underlying concern (the legal manual's Décret 07-144 mapping
gap) at the criterion-design level, even though `facilityCategoriesFull.json` itself
remains unused.

## 6.2 Not re-verified this session — treat as possibly still open

These were confirmed open as of the *first* live verification pass and have not been
re-checked since, given the volume of confirmed fixes found elsewhere. Given how much has
changed in a short window, a fresh check is worth doing before assuming either status:

- **G9 — confirmed live, precisely narrowed.** `abattoirCriteria.ts`'s `ABT-AX4-03`
  explicitly cites Décret 09-19 (naming it directly in the criterion text, not just the
  legal reference field) — a second confirmed instance alongside
  `slaughterhouseSmallCriteria.ts`. `mechanicCriteria.ts`'s newest addition,
  `MCH-29-09`, also has it. **But `mechanicCriteria.ts`'s original flagged criterion,
  `MCH-29-04`, still doesn't** — the citation is being applied to new content going
  forward, not backfilled to the criterion that originally prompted the finding. Worth a
  quick backfill pass on `MCH-29-04` and any other "contract with an approved operator"
  criterion predating this citation convention, rather than a full re-audit — the pattern
  is now well understood, just not universally applied yet. Also worth noting:
  `ABT-AX8-01` demonstrates good practice worth replicating elsewhere — an explicit
  inline note flagging an unverified ministerial-order number ("رقم القرار الوزاري
  المحلي المحدد بحاجة تحقق قبل النشر") rather than inventing one, the same discipline
  `BGN-10-01` showed for the Décret 07-144 mapping gap.
- **G10** — `facilityCategoriesFull.json` (609-row official activity nomenclature)
  remains unused by any inspection logic; may contain the Décret 07-144 category mapping
  the legal manual flagged as its highest-value research gap. Partially mitigated by the
  new `BGN-10-01` criterion's honest research-gap handling (see §6.1) — the underlying
  data gap is unchanged, but it's no longer silently unaddressed at the criterion level.
- **G11 — confirmed still open, re-verified live this pass.** `BGN-03-06`'s
  legalReference (`القانون 01-19 + المرسوم 01-102 (ONA) + القانون 05-12 المادة 46`) does
  not ground the specific 90-day/80%-capacity figure stated in the criterion text — none
  of the three cited instruments specify a numeric pumping frequency. The figure remains
  unsourced.
- **G12 — status substantially updated, this pass.** `src/db/schema.ts` was fetched in
  full and is far more complete than earlier chapters credited: a working, idempotent
  migration runner, 6 tables (`inspections`, `facilities`, `agenda`,
  `corrective_actions`, `audit_log`, `notifications`) with 3 indexes already in place,
  and a data-migration helper (`migrateAsyncStorageToSQLite()`) that already handles 3 of
  the 6 tables. **Confirmed live: `app/_layout.tsx` calls `initializeDatabase()` on every
  app launch, gating the splash screen** — the SQLite database is being actively created
  and migrated in production right now, not dormant code. It's simply empty: no
  repository reads or writes to it yet (`InspectionRepository.ts` and `BackupService.ts`
  both confirmed still AsyncStorage-only), and the migration helper itself is never
  called from anywhere. **A full phased plan for finishing this — grounded in the actual
  current schema, not a generic migration plan — is now available separately:
  `RAQIB_SQLite_Migration_Plan.md`.**
- **G13, remaining piece** — even with the `/sync` path corrected (confirmed fixed, see
  Chapter 5 §5.7), the mobile↔server integration has not been confirmed exercised
  end-to-end against a real running server instance.
- **`SavedInspection.updatedAt`** — `SyncService.ts`'s reference to this nonexistent field
  is confirmed still present, but now silenced with an `as any` cast rather than removed
  — no longer a `tsc` error, but the underlying dead-code/misleading-fallback issue is
  unchanged.
- **`PhotoService.ts`/`BackupService.ts`**'s `expo-file-system` import — ✅ **confirmed
  live, fixed.** Both now correctly import `expo-file-system/legacy`.
- **`src/db/schema.ts`**'s originally-reported "3 no overload matches" `tsc` errors —
  not re-checked this pass; given how much of this file has now been read and appears
  well-structured, worth re-running `tsc` specifically against this file before assuming
  the errors are still current, rather than treating them as confirmed-unchanged.

## 6.3 Research Tasks (require legal research, not code inspection)

Unchanged: R1 (Algeria's actual occupational noise-exposure limit — now the blocking
item for closing G2's last instance properly), R2 (Loi 19-02 evacuation-width figures),
R3 (fire-extinguisher class-to-hazard standard), R4 (Décret 07-144's full category list
— check G10 first), R6 (re-verify Décret 93-184 as the correct noise citation).
**R5 — reopened.** Previously marked resolved (76-35 scoped to compressed-gas storage
per a documented decision); `BGN-08-03`'s continued use of 76-35 for electrical safety
means the scoping question isn't actually closed — see R9 below, which absorbs it.
**R7 — see §6.0, resolved incorrectly, needs a redo with the correct
numbers before being closed. R8 — see §6.1, confirmed this revision via primary source.
R9 (new) — Décret 76-35's actual scope, genuinely unresolved: a primary-source search
this revision could not locate the decree's text (pre-2000s Algerian instruments are
less consistently indexed than 2006+ ones); needs a JORADP archive or equivalent
specialized source, not general web search.**

---

# CHAPTER 7 — Master Implementation Plan

**Revised this revision: priority order now leads with G-CAP (Chapter 6 §6.1), since it
was confirmed live as a silent, complete functional failure of a core workflow feature,
not just a type error.** Original Phase 1 (data-only fixes) is retained but demoted below
the CAP fix given the latter's severity and near-zero implementation risk.

Phased so each phase is independently shippable and none blocks the next. File paths are
exact, relative to repo root. **See `RAQIB_Fix_Spec_v2.md` for exact diffs of everything
in Phases 0–2 below — this chapter states the plan; that document has the code.**

## Phase 0 — Do this first: fix CAP auto-creation (G-CAP)

In `src/repositories/InspectionRepository.ts`'s `save()`, replace the call to the
nonexistent `CorrectiveActionRepository.createFromInspection(toSave)` with a call to
`capFactory.ts`'s `createCapItemsFromInspection(toSave)` (with the corresponding import
added). Two lines. Then smoke-test: complete a mock inspection with at least one
non-compliant item and confirm a CAP entry appears. See Fix Spec Phase 4.2.

## Phase 1 — Data-only fixes (no logic changes, low risk, do first)

**1.1 ✅ DONE, confirmed live — no action needed.** ~~Fix `src/criteriaData.ts`'s `criteriaByActivity` map (closes G1).~~ Kept below for the record only.
- Remove 11 dead keys: `الديوان الوطني لأغذية الأنعام`, `تركيب GPL`, `صناعة سياج`,
  `لوازم مدرسية ومكاتب`, `مذبحة دواجن <500 كغ/يوم`, `مطبعة`, `ميكانيك سيارات`,
  `وحدة تربية الدواجن`, `وحدة تفريخ الدواجن`, `وحدة مذابح الغرب`, `ورشة ألمنيوم`.
- Add/correct 5 keys to point at existing checklist constants:
  - `'ذبح الدواجن (أكثر من 500 كغ/ي وأقل من 2 طن/ي)': abattoirChecklist`
  - `'مطبعة خاصة بإنتاج لوازم مدرسية ومستلزمات المكاتب': printingChecklist`
  - `'ميكانيك السيارات': mechanicChecklist`
  - `'ورشة حدادة (صناعة السياج)': blacksmithChecklist`
  - `'ورشة نجارة الألمنيوم': carpentryChecklist`
- Verification: re-run the Python diff from Chapter 1 §1.4 after the edit; it should
  return zero rows in both columns.

**1.2 Run `tsc --noEmit` and resolve G7.** If it confirms `baseFoodCriteria.ts`'s
`BFD-04-01`/`BFD-04-02` fail type-checking, rewrite their `numericField` objects to match
`coldRoomCriteria.ts`'s `CLD-17-04` pattern exactly:
```typescript
numericField: {
  unit: '°C',
  labelAr: 'درجة حرارة التبريد المقاسة',
  min: -100,        // or an appropriate floor
  max: 5,            // or -18 for the frozen variant
  warningMax: 7,      // or -15 for the frozen variant
  step: 0.1,
  upperLimit: true,
},
```

## Phase 2 — Legal citation corrections

**2.1 ⚠️ PARTIALLY DONE, confirmed live — narrowed scope.** Machine-guarding/PPE/chemical-storage citations in `printingCriteria.ts` are already fixed correctly. Remaining: `BLS-04-06`, `UAB-AX7-07` (noise), `PNT-04-01` (PPE). For each incorrect citation
identified in Chapter 2 §2.4.1 / Chapter 4 §4.3:
- Noise criteria (`baseGeneralCriteria.ts` BGN-09-01, `blacksmithCriteria.ts`,
  `uabCriteria.ts`): replace with the correct noise-specific instrument once R6 confirms
  93-184 (or whatever R1 turns up), or explicitly re-tag the 85 dB figure as `[INTL]` /
  best-practice with no specific decree number, per the legal manual's own instruction.
- Machine-guarding criteria (`blacksmithCriteria.ts`, `carpenteryCriteria.ts`,
  `marbleCriteria.ts`, `printingCriteria.ts`): replace with Loi 88-07 art. 8, already
  correctly used for this exact purpose elsewhere in the codebase.
- Dust-protection criteria (`carpenteryCriteria.ts`, `marbleCriteria.ts`): replace with
  Loi 88-07's general framework, pending R1/R3 turning up anything more specific.
- General-PPE criteria (`blacksmithCriteria.ts`, `mechanicCriteria.ts`,
  `paintShopCriteria.ts`): replace with Loi 88-07 art. 10 (already the correct citation
  used for the same purpose in `baseGeneralCriteria.ts` BGN-09-02).
- Leave the 10 genuinely-correct medical-exam citations untouched.

## Phase 3 — Structural completion (finish already-started merges)

**3.1 Status unknown, not re-verified live this revision.** Merge the remaining 4 license criteria (closes G3). Remove
`BAK-10-01`/`CLD-17-01`/`GPL-01-01`/`PRD-01-01`, keeping each file's genuinely
activity-specific detail (e.g., GPL's accreditation requirement) as a short addition
folded into `BGN-01-01`'s spread or as a distinct, clearly-non-duplicate criterion — not
a full restatement of "a valid license exists."

**3.2 ⚠️ SUPERSEDED BY A DOCUMENTED DECISION — do not apply without re-checking.** A separate decision *not* to merge GPL onto the shared module was made, citing a legal-basis distinction (21-430 vs 76-35). Treat the paragraph below as historical only unless that distinction turns out not to hold. Original text: switch `gplCriteria.ts` onto `baseCompressedGasCriteria` (closes G4). Remove
`GPL-02-01/02/03`, add `import { baseCompressedGasCriteria } from
'./baseCompressedGasCriteria'` and `...baseCompressedGasCriteria` to the array, mirroring
`blacksmithCriteria.ts`'s exact pattern. Update the shared module's own header comment to
remove the "align wording on next GPL rework" TODO once done.

**3.3 ✅ DONE, confirmed live — but landed with the wrong citation.** ~~Extend the emissions-measurement criterion to paint shop and printing (closes G5).~~ `PNT-02-01/02/03`/`PRT-02-01/02/03` all exist; all 6 cite Décret 06-141 instead of 06-138 — see Chapter 6 §6.1 (G18) and Fix Spec Phase 8 for the correction, not this section's original content.
Model on `CAR-05-02` / `MRB-05-05`, adapted for VOC/solvent-vapor concentration rather than
particulate — but see 3.4 below, since this should be done using `numericField` from the
start rather than repeating the prose-only pattern.

**3.4 Status unknown for carpentry/marble (G6), CONFIRMED still needed for `UAB-AX7-07` (part of G16) — see Chapter 6 §6.2.** Add `numericField` to the three existing emissions criteria (closes G6), then to
the two new ones from 3.3.** `CAR-05-02` (5 mg/m³ ceiling), `MRB-05-05` (0.1 mg/m³
ceiling), and `BLS-04-07` (no numeric ceiling currently stated — leave as `doc` until R1
turns up a real threshold) should get `numericField` treatment consistent with
`SLH-05-04`'s DBO5 pattern:
```typescript
numericField: {
  unit: 'mg/m³',
  labelAr: 'تركيز غبار الخشب القابل للاستنشاق',
  max: 5,
  warningMax: 4,
  step: 0.1,
  upperLimit: true,
},
```
and `controlType` changed from `'doc'` to `'measurement'` to match.

## Phase 4 — Verification-only tasks (fast, no research required)

**4.1 (G9)** `grep -rL "09-19" $(grep -rl "متعامل معتمد" src/criteria/*.ts)` — any file
this returns still needs the Décret 09-19 citation added to its approved-operator
criterion.

**4.2 (G10)** Have someone with domain knowledge review `facilityCategoriesFull.json`'s
`regime` and `radius` fields against a known-correct sample of facilities, to determine
whether it's safe to treat as the Décret 07-144 mapping.

**4.3 (G11)** Determine the source of BGN-03-06's 90-day/80%-capacity septic-pumping
figure. If unsourced, either find a source or change the criterion's evidence standard
back to "verify contract currency + operator's demonstrated adequacy," per the legal
manual's original recommendation for a confirmed `[SILENCE]`.

**4.4 (from Chapter 4 §4.4)** Confirm whether the UPD siting-distance placeholder
(`UPD-AX2-...`) was ever given an actual minimum-distance figure, or whether it still
reads as "قرار" without a number — the current `UPD-AX2-02` criterion (Chapter 3 §3.1)
addresses layout/buffering qualitatively but does not appear to state a hard minimum
distance; if confirmed, this becomes Research Task R4's responsibility once Décret 07-144's
mapping (or `facilityCategoriesFull.json`'s `radius` field) is resolved.

## Phase 5 — Engineering task, tracked but out of this manuscript's detailed scope

**5.1 (G12)** SQLite migration Phase B: switch all 9 repositories from AsyncStorage reads/
writes to the schema already defined in `src/db/schema.ts`. This is a backend/data-layer
engineering task, not a criteria-content task — it should be scoped and executed as its
own project, following whatever migration plan `src/db/schema.ts`'s Phase A comments
already describe.

## Phase 6 — Research Tasks (R1–R6, per Chapter 6 §6.4)

Not code work. Route to whichever of your team (or a dedicated legal-research pass, in the
same style as the original 8-chapter manual) is set up to do primary-source Algerian legal
research. R1 and R6 (noise) block part of Phase 2.1 cleanly reaching a final, confident
citation — until then, Phase 2.1's noise fix should land on the safer of "cite 93-184 with
a caveat it needs re-verification" or "drop the specific decree number and mark the figure
`[INTL]`," rather than leaving 93-120 in place.

*End of Chapter 7.*

---

# CHAPTER 8 — Addendum: Live `tsc` Verification and a Previously-Undiscovered Backend

Everything in this chapter was produced by actually running the project's own tooling —
`npm install` and `npx tsc --noEmit` — rather than static reading. Two things came out of
this that materially change what Chapters 1–7 say, and neither was visible from reading
source files in isolation.

## 8.1 Correction to Chapter 1 / 5 / 6: a real backend already exists

Chapter 1 (§1.1) listed `apiClient.ts` and `SyncService.ts` as "backend-facing sync" code
and treated the SQLite migration as the only unfinished infrastructure item. That
undersold what's actually there. **A separate `server/` directory contains a working
Express + Prisma + PostgreSQL backend** — not a stub, a real implementation:

- `server/prisma/schema.prisma` — a full relational schema (`Inspector`, `PushToken`,
  `Facility`, `Inspection`, `Approval` models with proper relations), explicitly commented
  as mirroring `src/types.ts`.
- `server/src/index.ts` — Express app with `helmet`, `cors`, rate limiting (20 req/15min
  on `/auth`, 30 req/min on `/sync`), a global error handler, and a `/health` endpoint.
- `server/src/routes/auth.ts` — `POST /login`, `POST /register-push-token`, `GET /me`.
- `server/src/routes/sync.ts` — `POST /` (i.e. `POST /sync` once mounted), batch-upserts
  inspections/CAP items/agenda by device-generated UUID, and pushes a notification to
  supervisors on submission (`sendPushToSupervisors`, via `expo-server-sdk`).
- `server/src/routes/approvals.ts` — `GET /`, `POST /:id/approve`, `POST /:id/return`,
  role-gated to `SUPERVISOR`/`ADMIN` via `requireRole`.
- `server/src/middleware/auth.ts` — JWT-based `requireAuth`/`requireRole`.

This is, almost point-for-point, the "Minimal Viable Backend Specification" that
`SafeInspect_Master_Audit_v2.md` §8 proposed from scratch (Node/Express/PostgreSQL/Prisma,
JWT auth, sync/approval/push endpoints, a `users`/`facilities`/`inspections`/`approvals`/
`notifications` schema). **The three-audit-document "no backend exists" finding (CF3 in
the 360° audit, repeated in the Master Audit v2 and Expert Panel Review) is now
substantially out of date** — not just "partially addressed," as Chapter 1 characterized
it, but "built, matching the proposed spec closely."

**This does not mean the integration is finished — it isn't, and one specific defect is
below.** Corrections needed to this manuscript:
- **Chapter 5 §5.5** should read "a working Express/Prisma/PostgreSQL backend exists
  under `server/`, closely matching the previously-proposed MVP spec" rather than only
  listing client-side service files.
- **Chapter 6 G12** was framed purely as "mobile-side SQLite Phase B." That's still
  accurate as far as it goes, but it undersold the picture — the mobile app already has
  something real to sync *to*. G12 is retitled below.

## 8.2 ✅ RESOLVED (confirmed live) — the mobile app and server now agree on the sync URL

**Update, this revision: fixed and confirmed live.** `SyncService.ts` now calls
`apiClient('/sync', ...)`, with a code comment: *"FIX (G13/Phase5): server route is
registered at POST /sync (not /sync/inspections)."* Original finding below, preserved for
context — the underlying mismatch it describes is real and was accurately diagnosed, it's
just no longer present in the code.

`src/services/SyncService.ts` called `apiClient('/sync/inspections', { method: 'POST', ... })`.
`server/src/index.ts` mounts the sync router at `app.use('/sync', syncRouter)`, and
`server/src/routes/sync.ts` only defines `router.post('/', ...)` — meaning the server's
actual endpoint was `POST /sync`, not `POST /sync/inspections`. As it was written, a
sync attempt against a real deployment of this server would have hit a 404. **The URL
mismatch is fixed; whether the integration has actually been exercised end-to-end against
a live server instance is still unconfirmed** — see Chapter 6 §6.2.

## 8.3 `npx tsc --noEmit` result: 247 errors, none previously known

`npm install` required `--legacy-peer-deps` to complete at all — `package.json` currently
pins `react-native-safe-area-context@~5.0.0` while the installed `expo-router@56.2.15`
requires `>=5.4.0` as a peer dependency. **New gap: G14** (small — bump the pinned
version — but worth doing before any fresh-machine setup fails on a plain `npm install`).

With dependencies installed, `npx tsc --noEmit` at the repo root returns **247 errors**.
Scoped to `src/` only (excluding `server/`, which has its own separate, uninstalled
`node_modules` and whose errors here are just "module not found" noise from that, and
excluding `__tests__/`), there are **110 real errors**. This means, contrary to every
prior assumption in this manuscript (and every uploaded audit document) that the code
"works" in the sense of being internally consistent, **the mobile app does not currently
pass a strict TypeScript check.** Whether this blocks Metro/Expo at runtime is a separate
question (Babel-based bundlers often don't type-check), but it is a real correctness
problem regardless of whether it blocks a build. The two most significant patterns,
by volume:

### G15 (new, highest-volume) — the `category` field's type and its actual values have drifted apart, 33 instances across 5 files

`src/types.ts` defines: `export type Category = 'تنظيمية' | 'بيئية' | 'صحيه' | 'سلامة' |
'نظافة' | 'عامة';`

Two distinct problems, confirmed by exact error counts:

- **24 instances** use `'صحية'` where the type requires `'صحيه'` — a one-character
  orthographic variant (different final letter: ة vs ه) of the same Arabic word for
  "health/sanitary." Affects `abattoirCriteria.ts` (9), `couvoirCriteria.ts` (7),
  `uabCriteria.ts` (3), `updCriteria.ts` (5).
- **9 instances**, all in `baseFoodCriteria.ts`, use `'غذائية'` ("food/dietary") — a
  category value that **does not exist in the `Category` type at all**, in either
  spelling. This means every food-hygiene-specific criterion in the shared food baseline
  — the module every food-safety-adjacent audit session singled out as the best-designed
  content in the codebase — has never had a type-valid category.

This bug was invisible to every prior audit (none of them ran `tsc`) and to my own
Chapters 1–7 (which read source but didn't compile it). It's larger in raw instance count
than the Décret 93-120 problem (G2, 25 instances) and touches five separate files,
including the shared food baseline. **Practical impact:** anywhere the app groups,
filters, or scores by `category` (the old scoring system's category-weight model is
retired per `Scoring_System.docx`/`scoringUtils.ts`, but any UI filtering-by-category
feature, or a future re-introduction of category-based logic, would silently mis-handle
every affected criterion, since its `category` field is not a valid member of the type
it's declared to satisfy).

**Fix:** in `types.ts`, either (a) change `'صحيه'` to `'صحية'` (the more common modern
Arabic spelling, and the one actually used in 24 of the 24+ instances, suggesting it's the
newer/intended spelling and `types.ts` itself has the stale one) and add `'غذائية'` as a
seventh member, or (b) standardize the criteria files on `'صحيه'` and `'تنظيمية'`-family
spelling and pick an existing category for the 9 food-specific ones. **(a) is very likely
correct** — the higher-count, more-recently-touched files (all 4 non-`baseFoodCriteria`
files) already agree with each other on `'صحية'`, and only the type definition disagrees
with the actual usage, not the other way around.

### G16 (new) — `NumericFieldSpec`'s `label`/`labelAr` mismatch, confirmed and wider than originally scoped (G7 update)

Chapter 2 §2.4.2 / Chapter 6 G7 flagged this in `baseFoodCriteria.ts` and said it "needs a
`tsc --noEmit` run to confirm." **Confirmed: it is a real compile error.** It is also
**wider than originally scoped** — it appears in 4 files, not 1:
`baseFoodCriteria.ts` (2 instances — `BFD-04-01`/`02`, as originally flagged),
`blacksmithCriteria.ts` (1 instance), `uabCriteria.ts` (1 instance). **G7 is superseded by
this finding; use G16 going forward.** The fix described in Chapter 7 §1.2 (match
`coldRoomCriteria.ts`'s `CLD-17-04` pattern) is still the right template — it now needs to
be applied in 4 places, not 1.

### G17 (new) — a cluster of repository/service errors suggesting a mid-refactor was left incomplete

Six call sites across `ApprovalRepository.ts` (3) and `InspectionRepository.ts` (3) call a
function with 1 argument where TypeScript expects 2–3 — consistent with a repository
method's signature having been changed (likely during the CAP/approval-workflow build-out)
without every call site being updated to match. Separately:

- `src/services/capFactory.ts` uses `'critical'` as a `Severity` value in two places, but
  `Severity` (per `types.ts`, matching `scoringUtils.ts`'s `SEVERITY_WEIGHTS`) is only
  `'high' | 'medium' | 'low'` — there is no `'critical'` severity tier anywhere else in the
  app; this looks like a leftover from an earlier design (the Super ReDesign document does
  describe a 4-tier `minor/major/critical/blocking` non-conformity classification that was
  apparently never adopted) rather than a typo.
- `src/services/CapReportService.ts` has the same `'critical'`-not-in-`Severity` problem
  in a `Record<Severity, string>` color-mapping object, twice.
- `src/services/SyncService.ts` references `SavedInspection.updatedAt`, a field that does
  not exist on the type (`types.ts`'s `SavedInspection` has `date`, not `updatedAt`).
- `src/services/PhotoService.ts` and `src/services/BackupService.ts` both reference
  `expo-file-system`'s `documentDirectory` on the modern package import, which no longer
  exposes it — the fix used elsewhere in this same codebase (`__tests__` mocks, per the
  uploaded `Fair_feedback` document) is importing from `expo-file-system/legacy` instead;
  these two production files apparently weren't updated when that legacy-import pattern
  was adopted for the test suite.
- `src/db/schema.ts` has 3 "no overload matches" errors on what is almost certainly the
  Drizzle/SQLite table-definition calls — consistent with Chapter 1's note that this file
  is mid-migration (Phase A) and not yet exercised by real repository code.

None of these were individually re-derived from first principles in this manuscript — they
are reported as `tsc`'s own error text, grouped by theme. **Recommend a dedicated
`npm run typecheck` pass and fix-up session** covering G15, G16, and G17 together, since
they're independent of each other and can be fixed in any order, but all three should be
resolved before the SQLite migration (G12/Phase 5) proceeds, since a clean compile is a
reasonable precondition for a risky data-layer migration.

## 8.4 Revised gap list — superseded, see Chapter 6

The original G13–G17 table that lived here has been fully absorbed into Chapter 6, which
now carries the live-confirmed status of every item (some fixed, some not, some narrowed
in scope since first found). Not repeated here to avoid two sources of truth for the same
list — Chapter 6 is current; this note exists only so a reader following an old link
from here knows where to go.

## 8.5 Live GitHub verification: a parallel workstream, two "corrections" that briefly made things worse, and a rapid fix

This section was added after a live GitHub connector became available mid-project and
was used to read files directly from `belabedmohamedins-tech/SafeInspect-APP`, including
a project-tracking document not previously known to exist:
`CHECKLIST_PROFESSIONAL_ROADMAP.md`. That document shows a substantial, separate,
ongoing workstream (driven via Perplexity) actively fixing many of this manuscript's
findings — genuinely and correctly, in the overwhelming majority of cases (Chapter 5
§5.7 has the full list). **Two entries in that roadmap, at the time first checked,
asserted a citation was "✅ CORRECT" in a way that directly contradicted the legal manual
the roadmap itself claimed as a grounding source. Both have since been corrected — see
the update note at the end of this section.**

1. **Décret 93-120 "Art. 9" for the 85 dB occupational noise limit.** No article-level
   content of Décret 93-120 was ever retrieved in any research session in this project
   beyond its confirmed title-level subject (occupational medicine). The specific article
   number asserted in the roadmap had no traceable source anywhere in this project's
   materials — it read as fabricated precision. **Confirmed live at the time: the actual
   file (`blacksmithCriteria.ts`) didn't even contain the "Art. 9" text the roadmap
   claimed to have verified** — the citation was just plain "93-120."
2. **Décret 06-141 for VOC/air-emission limits**, asserted as correct for printing,
   paint shop, and blacksmith. Décret 06-141's full parameter table (this manuscript's
   Chapter 4 §4.1, sourced from the legal manual's most extensively-researched chapter)
   contains only liquid-discharge parameters — nothing airborne. Décret 06-138 is the
   correct instrument and was already used correctly elsewhere in the same codebase.

**Update: both fixed, confirmed live, within the same session.** `blacksmithCriteria.ts`'s
`BLS-04-06` now reframes the 85 dB figure as an unconfirmed international reference,
explicitly citing Research Tasks R1/R6 rather than asserting a specific decree article —
exactly the correction this section recommended. All 6 originally-found 06-141 instances
(marble, printing ×3, paint shop ×2, blacksmith) now correctly cite Décret 06-138. One
93-120 noise instance remains open — `uabCriteria.ts`'s `UAB-AX7-07` — see Chapter 6 §6.1.

**Why this still matters beyond these two specific citations, even though both are now
fixed:** both were examples of a citation being marked "verified" and "do not change"
without the underlying source actually supporting the specific claim made. Given this
project's entire methodology is built on not inventing legal specifics (the front matter
of every legal manual chapter says so explicitly), **any future citation "correction" —
from any source, including future AI-assisted passes — should be required to show the
specific source sentence it's
based on before being accepted as settled.** Fix Spec `RAQIB_Fix_Spec_v2.md` Phase 9 has
the exact reversal diffs for both.

**Update — this pattern recurred twice more** (the R7 emissions-threshold numbers in
Chapter 6 §6.0, and the Décret 22-167 mis-citation in §6.1's R8), for a confirmed total of
four instances. Given the recurrence, a standing preventive protocol has been written up
separately: **`RAQIB_Citation_Verification_Protocol.md`** — a short, insertable set of
rules for the citation-correction workflow itself, derived from what specifically went
wrong in all four cases. Recommend adding it to whatever prompt or instruction set drives
future citation-correction passes.

---

# Appendix — Files that can be archived

Every file listed below has been fully superseded by either the current codebase (verified
in this manuscript) or by this manuscript itself, and can be archived/deleted from active
reference without losing information, **provided this manuscript is kept**:

| File | Why it can be archived |
|---|---|
| `Session_02` through `Session_09` audit files, `Master_Rollup_Checklist_Audit_Summary.txt` | Every finding still relevant has been carried into Chapters 2–6 with its current-code status attached. The original 9-session narrative (methodology, panel reasoning) has no further reference value once its conclusions are captured here. |
| `RAQIB_Checklist_Audit_Report.docx` | Superseded by Chapter 1 (mapping), Chapter 3 (catalog) — this manuscript's mapping table is more current and has been verified against `facilitiesData.ts` directly, catching the G1 defect this report's own table would not surface today. |
| `Perplexity_Implementation_Spec (2).txt` | Nearly everything it specified has shipped (Chapter 5). The few unshipped items (G3, G4) are captured precisely in Chapter 6/7 with exact current file state, which is more useful than the spec's now-stale diff instructions. |
| `Handover_SafeInspect_Project.md` | Its "next steps" are superseded by this manuscript's Chapter 6/7. Its cross-cutting facts (the 04-409/09-410 pattern, the 06-198 amendment history) are preserved in Chapters 4–5. |
| `Inspection_Manual_Chapter1…6` (the legal manual) + the Air Quality / Occupational Health session narratives | **Do not archive outright** — these remain the only source for several `[LOI]`/`[PRATIQUE]`/`[SILENCE]` legal determinations not re-derivable from code (e.g., the full Décret 06-141 discharge table, Loi 19-02's committee structure). Chapter 4 of this manuscript cross-references but does not fully reproduce them. Keep as a legal-reference appendix; archive only the chapters' embedded "Status and Next Steps" sections, which are now superseded by Chapter 6 here. |
| `Honest_Critic.docx`, `Safe_Inspect_Super_ReDesign.docx`, `SafeInspect_360_Audit_Report.md`, `SafeInspect_Master_Audit_v2.md`, `Expert_Panel_Review_Report.docx`, `Checklists_audit.docx` | All describe a codebase state substantially earlier than the current zip (Chapter 1 §1.1, Chapter 5 §5.4–5.5). Their maturity-scoring and "missing 85%" framing is materially out of date — keeping them risks a future session re-proposing work already done. If any strategic/business framing from these is still wanted (e.g., the multi-tenant national-platform roadmap), extract that narrative separately; don't keep them as technical references. |
| `Fair_feedback — I got the relative.md` | Pure test-suite debugging log, no lasting reference value once the fix is merged. Archive freely. |
| `Scoring_System.docx` | The scoring model it describes matches `src/utils/scoringUtils.ts` exactly (verified: severity weights 3/2/1, thresholds 85/70/50, critical-override rules at 1 and 3 high violations, `[SILENCE]`-appropriate Arabic disclaimer text) — this document can be archived since the code **is** the current source of truth for the scoring model, and matches this doc precisely; nothing here contradicts current code. |
| `RAQIB_PRD_v1_0.docx` | Aspirational product spec for a 3-product national platform. Keep only if you still want the V1.0/V2.0/V3.0 roadmap and success-metrics framing for planning purposes — it has no bearing on what needs fixing in the current codebase, which is this manuscript's job. |

**Keep, unarchived:** `criteriaData.ts`/`types.ts`/`scoringUtils.ts` etc. (they're the
actual source, not documentation about it) and this manuscript,
`RAQIB_MASTER_MANUSCRIPT.md`, as the new single source of truth.

---

*End of manuscript.*

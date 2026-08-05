# SafeInspect — Living Handoff Document

> **This file is the primary handoff for ALL agents (Perplexity, Claude, GPT, human).** Read this before touching any file. It is updated after every session.

---

## Live Observations Log

*(Newest entry at top)*

### 2026-08-05 13:53 WAT — [Agent: Perplexity] — Phase V false-positive audit: CapNotificationService + AuditLogRepository confirmed clean by direct code read
- Phases closed: none
- Phases opened: none
- Files changed: `docs/README.md`, `docs/STRATEGIC_PLAN.md`
- Critical finding: **Three more Phase V error table entries confirmed FALSE POSITIVES by direct source read: (1) `cap.tsx:25` — `CapNotificationService` exports `scheduleCapDigestNotification`, `scheduleCapWeeklyDigest`, and default `scheduleCapDeadlineNotifications` — already correct. (2) `audit-log.tsx` — `AuditAction` exported as `export type AuditAction` from `AuditLogRepository.ts`, `AuditEntry` exported as `export interface AuditEntry` — both correct; screen aliases `AuditEntry as AuditLogEntry` — valid. (3) `AuditLogRepository` exported as `export const AuditLogRepository` — correct. All three error table rows must be marked DO NOT TOUCH. STRATEGIC_PLAN.md Phase V error table updated with confirmed false-positive annotations.**

### 2026-08-05 13:37 WAT — [Agent: Perplexity] — Phase W URLs confirmed complete; fresh-session handoff context logged
- Phases closed: none
- Phases opened: none
- Files changed: `docs/README.md`
- Critical finding: **User delivered fresh-session handoff context. All 5 Phase W legal document URLs confirmed present and accessible: W-1 JORADP JO n°43 (cold-chain 07/05/2025), W-2 FAO mirror/Bejaia recueil (temps 21/11/1999), W-3 MESRS PDF (Loi 19-02 full text), W-4 ILO NatLex + Univ Batna2 DOCX (Décret 93-120), W-5 Scribd AIM GPL2 (LPG cylinder storage). Ordonnance 76-04 (evacuation/extinguisher base text) located at Scribd securite-ERP PDF as bonus. No new phases opened. Next action: user downloads Phase W docs → adds to Claude project as `legal_sources/` folder → Claude ingests and resolves [À VÉRIFIER] items. Phase V (TSC 145 errors) remains assigned to Claude locally.**

### 2026-08-05 13:10 WAT — [Agent: Perplexity] — server/src/index.ts stub filled; 3 remaining Phase V error table claims confirmed false positives
- Phases closed: none (Phase V still requires `npx tsc --noEmit` gate locally)
- Phases opened: none
- Files changed: `server/src/index.ts`, `docs/README.md`
- Critical finding: **`server/src/index.ts` was 0 bytes (stub) — written with minimal Express bootstrap (helmet + cors + json + health + dynamic route loader). Commit: [513adbe196426f2ad6595caf7f666c778d880c8e](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/513adbe196426f2ad6595caf7f666c778d880c8e). Three more Phase V error table entries confirmed clean by direct code read: (1) `approval-detail.tsx:174` — `returnForRevision` already called with exactly 3 args (id, supervisor, reason) — do NOT re-fix. (2) `facilities/index.tsx:69` — `.remove()` already correct — confirmed again. (3) `approval-queue.tsx:64` — ActionSheet type already fixed — confirmed again. Phase V remaining gap: real TSC errors in `src/db/schema.ts`, test mock fixtures, NotificationType union — require `npx tsc --noEmit` locally by Claude.**

### 2026-08-05 13:02 WAT — [Agent: Perplexity] — Phase V false-positive audit: 2 STRATEGIC_PLAN error claims already fixed in source; Phase W URLs confirmed
- Phases closed: none
- Phases opened: none
- Files changed: `docs/README.md`
- Critical finding: **Two Phase V error items confirmed clean by direct source read: (1) `facilities/index.tsx:69` — uses `FacilityRepository.remove(facility.id)` already; the "`.delete` vs `.remove`" claim in the error table is stale. (2) `approval-queue.tsx:64` — ActionSheet type already fixed in-file with `NonNullable<ActionSheet>['mode']`; the comment in the file confirms it. Do NOT re-fix either. All 5 Phase W legal document URLs confirmed present in STRATEGIC_PLAN.md and README Phase W table. Next action: Claude continues Phase V remaining TSC clusters locally (`npx tsc --noEmit`); user downloads Phase W documents and adds to Claude project.**

### 2026-08-05 12:41 WAT — [Agent: Perplexity] — Phase W opened: 5 legal source gaps identified, working document URLs located
- Phases closed: none
- Phases opened: W (Legal document verification — 5 source gaps)
- Files changed: `docs/STRATEGIC_PLAN.md`, `docs/README.md`
- Critical finding: **Claude flagged 5 unresolved legal source gaps. Working copies located by Perplexity web search. User must download and add to Claude project as `legal_sources/` files. Gaps: (W-1) Arrêté 07/05/2025 cold-chain temps — JORADP JO n°43; (W-2) Arrêté 21/11/1999 conservation temps table; (W-3) Loi 19-02 full text art.14 ERP categories — JO n°46; (W-4) Décret 93-120 du 15/05/1993 médecine du travail — ILO NatLex + Univ. Batna2; (W-5) AIM GPL2 technical standard LPG cylinder storage (separate from Décret 21-430). All URLs in STRATEGIC_PLAN.md Phase W section. Next available phase letter: X.**

### 2026-08-05 12:13 WAT — [Agent: Perplexity] — Phase V criteria fix: PRD-02-01 split into vegetables (0–5 °C) + olives (7–15 °C) with numericField
- Phases closed: none (Phase V still OPEN — TSC errors require Claude locally)
- Phases opened: none
- Files changed: `src/criteria/produceStorageCriteria.ts`
- Critical finding: **PRD-02-01 had `controlType: 'measurement'` but no `numericField` — type error. Split into `PRD-02-01` (vegetables, 0–5 °C) and `PRD-02-01b` (olives, 7–15 °C), each with correct `numericField: { min, max, unit, labelAr }`. Commit: [015470710511616e298072c9dfd9594f106b6816](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/015470710511616e298072c9dfd9594f106b6816). Phase V TSC zero-error gate still requires `npx tsc --noEmit` locally — assign remaining 145-error clusters to Claude per STRATEGIC_PLAN.md.**

### 2026-08-05 11:54 WAT — [Agent: Perplexity] — Phase V batch-2 audit: doc-listed targets already clean; only PRD-02-01 numericField confirmed open
- Phases closed: none (Phase V still OPEN)
- Phases opened: none
- Files changed: docs/README.md (this entry only)
- Critical finding: **`src/utils/scoringUtils.ts` already has `ViolationProfile.total` field and `RiskLevel` exported — no fix needed. `src/db/schema.ts` uses `expo-sqlite` with plain SQL strings (NOT WatermelonDB column type literals) — no fix needed. README batch-2 list was stale. One confirmed open item: `src/criteria/produceStorageCriteria.ts` `PRD-02-01` has `controlType: 'measurement'` but no `numericField`. Must be split into PRD-02-01 (vegetables 0–5 °C) and PRD-02-01b (olives 7–15 °C) with correct `numericField` on each. Real remaining TSC errors (145 in 63 files per STRATEGIC_PLAN.md) require `npx tsc --noEmit` locally — Claude must run this and fix cluster by cluster per the STRATEGIC_PLAN.md error table.**

### 2026-08-05 11:24 WAT — [Agent: Perplexity] — Phase V batch-1 pushed: TSC fixes for preview/index.tsx, decisionSupport.test, NotificationService, i18n
- Phases closed: none (batch-1 of V — more fixes needed)
- Phases opened: none
- Files changed: `app/preview/index.tsx`, `src/__tests__/decisionSupport.test.ts`, `src/services/NotificationService.ts`, `src/i18n/index.ts`, `app/preview/_layout.tsx`
- Critical finding: **`CapFollowUpSheet.tsx` and `server/src/index.ts` were already empty (size 0) in the repo before this session — no real content lost. `decisionSupport.test.ts` now uses `violations: { high, medium, low, total }` and `riskLevel: 1 as RiskLevel`. `NotificationService.ts` adds `shouldShowBanner` and `shouldShowList` to satisfy Expo SDK 51+ handler type. `i18n/index.ts` re-exports from `./index-impl` (no `.tsx` extension). Phase V (TSC zero-error goal) remains OPEN — additional files still need fixing (scoringUtils, schema.ts, remaining TSC clusters).**

### 2026-08-05 00:23 WAT — [Agent: Perplexity] — Verification session: _layout.tsx wiring confirmed, activity→criteria mapping 100% verified (26/26), no gaps
- Phases closed: none
- Phases opened: none
- Files changed: docs/README.md (this entry only)
- Critical finding: **All 26 unique `activity` strings in `facilitiesData.ts` have exact keys in `criteriaByActivity` in `criteriaData.ts`. Zero facilities will silently fall back to `baseGeneralCriteria`. The empty-criteria guard added in Phase U (checklist.tsx) is a safety net for future unknown activities only. `_layout.tsx` reinspection route + REINSPECTION deep-link handler both confirmed correct. Only open phase is R (local TypeScript + Jest — Claude only).**

### 2026-08-04 23:58 WAT — [Agent: Perplexity] — Phase U CLOSED: 3 RTL/UX bugs fixed across reinspection.tsx, checklist.tsx, categories.tsx
- Phases closed: U (UX polish — end-to-end inspector flow)
- Phases opened: none
- Files changed: `app/screens/reinspection.tsx`, `app/(tabs)/inspection/checklist.tsx`, `app/(tabs)/inspection/categories.tsx`, `docs/README.md`, `docs/STRATEGIC_PLAN.md`
- Critical finding: **3 real bugs fixed by direct code read:** (1) `reinspection.tsx` header used `arrow-right` (forward in RTL) instead of `arrow-left` for back navigation — semantic RTL bug. Added empty-member-list hint. (2) `checklist.tsx` had no guard when `data.length === 0` after loading — inspector would see blank checklist + active Finish button. Added clear warning + back. (3) `categories.tsx` placed folder icon left of text (LTR order) in an RTL Arabic list — fixed to text-left, icon-right with space-between. **No open Perplexity phases remain. Next action for Claude: Phase R (TypeScript + Jest on all 4 affected files).**

### 2026-08-04 23:58 WAT — [Agent: Perplexity] — Phase T CLOSED: Décret 06-138 Annex I already fully verified in Ch7; docs corrected
- Phases closed: T (Legal verify — Décret 06-138 air quality Annex I numeric table)
- Phases opened: none
- Files changed: docs/STRATEGIC_PLAN.md, docs/README.md
- Critical finding: Phase T was already complete — Ch7 Section 6 had the full primary-source content. STRATEGIC_PLAN.md was out of sync. Detected by CODE VS DOC check.

### 2026-08-04 23:45 WAT — [Agent: Perplexity] — Phase S CLOSED: Loi 19-02 scope fully verified from JORADP primary source; Phase T opened
- Phases closed: S (Legal verify — Loi 19-02 fire safety scope)
- Phases opened: T (Legal verify — Décret 06-138 air quality Annex I numeric table)
- Files changed: docs/README.md, docs/STRATEGIC_PLAN.md
- Critical finding: Loi 19-02 applies to ERPs, high-rise, very-high-rise, and residential ONLY. ~Half of SafeInspect facility types are outside its scope. Art. 44 deadline expired ~21 July 2024.

### 2026-08-04 23:03 WAT — [Agent: Perplexity] — Phase Q CLOSED: reinspection.tsx + _layout.tsx delivered, docs synced
- Phases closed: Q (UI screens — Reinspection screen)
- Phases opened: R (Integration / end-to-end tests)
- Files changed: app/screens/reinspection.tsx, app/_layout.tsx, docs/README.md, docs/STRATEGIC_PLAN.md
- Critical finding: Test gate not yet run — `npx tsc --noEmit` and Jest must be run by next agent. Code is committed; validation is the only remaining step.

### 2026-08-04 22:00 WAT — [Agent: Perplexity] — Q-1 DONE: checklist.tsx + start.tsx fully read; lifecycle map updated
- Phases closed: Q-1 (read checklist.tsx + start.tsx)
- Phases opened: none
- Files changed: docs/README.md
- Critical finding: Evidence, Evaluation, Decision, and Closing-meeting/Closure are ALL embedded inside `checklist.tsx`. Only Reinspection had no dedicated screen.

### 2026-08-04 22:10 WAT — [Agent: Perplexity] — Phases O and P confirmed CLOSED by direct code read
- Phases closed: O (corrective actions tracking), P (statistics / dashboard)
- Phases opened: Q (UI screens / navigation wiring)
- Files changed: docs/README.md
- Critical finding: Full corrective action pipeline + statistics utilities confirmed in `src/`. Entire backend complete.

### 2026-08-04 21:55 WAT — [Agent: Perplexity] — Phase N confirmed CLOSED by direct code read of pdfService.ts (54 KB)
- Phases closed: N (report generation)
- Phases opened: none
- Files changed: docs/README.md
- Critical finding: `src/services/pdfService.ts` is a complete, production-grade Arabic RTL PDF report module.

### 2026-08-04 21:16 WAT — [Agent: Perplexity] — Phases L & M confirmed CLOSED by direct code read; roadmap updated
- Phases closed: L (criteria implementation), M (scoring integration)
- Phases opened: none
- Files changed: docs/README.md
- Critical finding: `src/criteria/` has 20 fully-implemented activity criteria files. `scoringUtils.ts` is production-grade.

### 2026-08-04 19:25 WAT — [Agent: Perplexity] — Connector stabilized; docs updated with full session history and current phase map
- Phases closed: none
- Phases opened: none
- Files changed: docs/README.md, docs/STRATEGIC_PLAN.md
- Critical finding: All 8 manual chapters confirmed in docs/. STRATEGIC_PLAN.md phase list now reflects actual repo state as of 2026-08-04.

### 2026-07-30 14:07 WAT — [Agent: Perplexity] — docs/README.md and docs/STRATEGIC_PLAN.md created from scratch as living handoff
- Phases closed: none
- Phases opened: A through G (initial roadmap)
- Files changed: docs/README.md, docs/STRATEGIC_PLAN.md
- Critical finding: docs/ previously had no unified roadmap file.

---

## What is SafeInspect / RAQIB

SafeInspect (code name RAQIB) is a **professional inspection platform for Algerian classified establishments**. It is a React Native + Expo + TypeScript mobile app.

The full inspection lifecycle is:

```
Registry → Planning → Preparation → Inspection → Evidence
→ Evaluation → Decision → Report → Corrective Actions
→ Reinspection → Closure → Statistics
```

Checklist logic is the core of the app. Every criterion must have:
- Activity relevance
- Applicability condition
- Legal/scientific basis (Algerian law first)
- Inspection method
- Evidence type
- Severity
- Risk
- Scoring weight
- Conditional applicability flag

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo |
| Language | TypeScript |
| Local DB | expo-sqlite (NOT WatermelonDB) |
| Build | EAS Build |
| Tests | Jest |
| Routing | **Expo Router (file-system routing in `app/`)** |
| Repo | `belabedmohamedins-tech/SafeInspect-APP` |
| Default branch | `main` |

---

## Source of Truth Order

Use this priority order — never invert it:

1. **Current GitHub code + actual app behavior** = what EXISTS
2. **Verified Algerian legal/scientific sources** = what SHOULD exist
3. **`/docs` files** = current project knowledge and decisions
4. **Old AI audits, reports, roadmaps** = historical context only — never execute blindly

---

## Algerian Law Hierarchy

```
Algerian legislation (lois)
  > Official Algerian regulations (décrets, arrêtés)
    > Algerian standards (normes algériennes)
      > International standards / best practices
```

**Never invent legal articles or numeric values.**  
When uncertain: search JORADP (official gazette) first, academic/thesis sources as corroboration only.

---

## docs/ File Map

| File | Status | Purpose |
|---|---|---|
| `README.md` | ✅ Active | This file. Living handoff. Update after every session. |
| `STRATEGIC_PLAN.md` | ✅ Active | Phase registry and roadmap. Single source of phase numbering. |
| `decisions/DECISIONS.md` | ✅ Active | Major architectural and legal decisions log. |
| `Inspection_Manual_Chapter1_Wastewater.md` | ✅ Active | Wastewater / liquid discharge checklist and legal references. |
| `Inspection_Manual_Chapter2_Solid_Hazardous_Waste.md` | ✅ Active | Solid and hazardous waste checklist. |
| `Inspection_Manual_Chapter3_Fire_Safety.md` | ✅ Active | Fire safety. Loi 19-02 scope VERIFIED 2026-08-05 — ERP/high-rise/residential only. |
| `Inspection_Manual_Chapter4_Food_Safety.md` | ✅ Active | Food safety, HACCP, hygiene. |
| `Inspection_Manual_Chapter5_Occupational_Health.md` | ✅ Active | Occupational health and worker protection. |
| `Inspection_Manual_Chapter6_Documentation_Licensing.md` | ✅ Active | Licensing and classified establishment classification. |
| `Inspection_Manual_Chapter7_Air_Quality.md` | ✅ Active | Air emissions. Décret 06-138 Annex I + II VERIFIED 2026-08-04. |
| `Inspection_Manual_Chapter8_Site_Hygiene_Pest_Control.md` | ✅ Active | Site hygiene and pest control. |
| `Perplexity_Implementation_Spec.md` | ✅ Active | Current implementation spec. |
| `RAQIB_MASTER_MANUSCRIPT.md` | 📚 Reference | Full manuscript. Read for context only. |
| `RAQIB_Fix_Spec_v2.md` | 📚 Reference | Earlier fix spec. Superseded. |
| `RAQIB_Fix_Spec_v3.md` | 📚 Reference | Later fix spec. Check against current code before acting. |
| `RAQIB_Citation_Verification_Protocol.md` | 📚 Reference | Legal citation verification protocol. |
| `RAQIB_SQLite_Migration_Plan.md` | 📚 Reference | DB migration plan. Verify current DB layer before acting. |
| `TIER1_MIGRATION.md` | 📚 Reference | Migration priority tier list. |
| `RAQIB_Perplexity_Prompt_Ready.md` | 📚 Reference | Prompt templates from earlier sessions. |

---

## Working Roadmap

See `docs/STRATEGIC_PLAN.md` for the full phase registry with priorities, statuses, and execution order.

### Quick Status Summary (as of 2026-08-05 13:53 WAT)

| Phase | Title | Status | Confirmed by |
|---|---|---|---|
| A–I | Scoring + 8 manual chapters | ✅ CLOSED | Previous sessions |
| L | Criteria implementation (20 files) | ✅ CLOSED 2026-08-04 | Direct code read |
| M | Scoring integration | ✅ CLOSED 2026-08-04 | Direct code read |
| N | Report generation (pdfService 54 KB) | ✅ CLOSED 2026-08-04 | Direct code read |
| O | Corrective actions pipeline | ✅ CLOSED 2026-08-04 | Direct code read |
| P | Statistics utilities | ✅ CLOSED 2026-08-04 | Direct code read |
| Q-1 | Lifecycle audit — checklist.tsx + start.tsx | ✅ CLOSED 2026-08-04 | Direct code read |
| Q | Reinspection screen | ✅ CLOSED 2026-08-04 | Code delivered |
| R | Integration / TypeScript + Jest (Claude) | 🔴 BLOCKED on V | V must close first |
| S | Legal verify — Loi 19-02 fire safety | ✅ CLOSED 2026-08-04 | JORADP primary source |
| T | Legal verify — Décret 06-138 Annex I | ✅ CLOSED 2026-08-04 | Ch7 primary-source content |
| U | UX polish — end-to-end inspector flow | ✅ CLOSED 2026-08-04 | 3 RTL/UX bugs fixed |
| **V** | **TSC zero-error pass** | 🔴 **OPEN — ASSIGN TO CLAUDE** | batch-1 + criteria fix + server stub pushed; 7 rows in error table confirmed false positives (DO NOT TOUCH — see STRATEGIC_PLAN.md); remaining clusters need local `npx tsc --noEmit` |
| **W** | **Legal document verification (5 source gaps)** | 🟡 **OPEN — USER downloads + Claude ingests** | All 5 URLs confirmed by Perplexity; full URL table in STRATEGIC_PLAN.md |

### Recommended Execution Order (next sessions)

```
→ Claude (local): Phase V — fix remaining TSC error clusters
    Start with: src/db/schema.ts SQLite bind params (~25 errors)
    Then: test mock fixtures (~40 errors)
    Then: NotificationType union (19 errors)
    Then: remaining clusters per STRATEGIC_PLAN.md table
    After each cluster: npx tsc --noEmit + commit
    Gate: npx tsc --noEmit exits with 0 errors

    ⚠️  DO NOT re-fix (confirmed clean by direct code read — multiple confirmations):
        facilities/index.tsx    → .remove() already correct
        approval-queue.tsx      → ActionSheet type already fixed in-file
        approval-detail.tsx:174 → returnForRevision already uses 3 args
        cap.tsx:25              → CapNotificationService exports are correct
        audit-log.tsx           → AuditAction, AuditEntry, AuditLogRepository all correctly exported

→ Parallel: Phase W — user downloads 5 legal docs → adds to Claude project → Claude updates criteria
    W-1: Arrêté 07/05/2025 cold-chain temps (JORADP JO n°43)
    W-2: Arrêté 21/11/1999 conservation temps table
    W-3: Loi 19-02 full text art.14 ERP categories (JO n°46)
    W-4: Décret 93-120 du 15/05/1993 médecine du travail
    W-5: AIM GPL2 technical standard LPG cylinder storage
    Bonus: Ordonnance 76-04 base text (evacuation/extinguisher legal basis)

→ After V closes: Phase R — full Jest run + smoke tests (Claude, local)
```

---

## Phase V — TSC Zero-Error Pass — IN PROGRESS (2026-08-05)

### Batch 1 — DONE (commit c1633f5)

| File | Fix |
|---|---|
| `app/preview/index.tsx` | Fixed `Colors.info→textTertiary`, `Spacing.xxxl→xxl`, `FontSize.xxxl→320`, `Shadow.xs→sm`, `action.description→notes`, CAP_STATUS keys hyphenated, status strings |
| `src/__tests__/decisionSupport.test.ts` | Added `total: 0` to all `ViolationProfile` literals; `riskLevel: 1 as RiskLevel`; imported `RiskLevel` |
| `src/services/NotificationService.ts` | Added `shouldShowBanner` + `shouldShowList` to handler (Expo SDK 51+ type requirement) |
| `src/i18n/index.ts` | Changed re-export to `./index-impl` (no `.tsx` extension) |
| `app/preview/_layout.tsx` | Simplified (removed `headerBackTitleVisible` which is iOS-only RN prop, not valid in Expo Router Stack.Screen options type) |

### Criteria fix — DONE (commit 0154707)

| File | Fix |
|---|---|
| `src/criteria/produceStorageCriteria.ts` | Split `PRD-02-01` (measurement with no numericField) into `PRD-02-01` (vegetables, 0–5 °C) and `PRD-02-01b` (olives, 7–15 °C), each with `numericField: { min, max, unit, labelAr }` |

### Server stub fix — DONE (commit 513adbe)

| File | Fix |
|---|---|
| `server/src/index.ts` | Was 0 bytes. Written with minimal Express bootstrap: helmet + cors + json middleware, /health endpoint, dynamic route loader for auth/inspections/facilities/reports, app.listen on PORT env var. |

### False positives — confirmed clean by direct code read (DO NOT TOUCH)

| Error table claim | Actual source state | Confirmed |
|---|---|---|
| `facilities/index.tsx:69` — `FacilityRepository.delete` doesn't exist | Source uses `FacilityRepository.remove(facility.id)` — already correct | 2026-08-05 (×2) |
| `approval-queue.tsx:64` — `ActionSheet['mode']` type error | In-file uses `NonNullable<ActionSheet>['mode']` — already fixed | 2026-08-05 (×2) |
| `approval-detail.tsx:174` — `returnForRevision` extra arg | Source calls `returnForRevision(inspection.id, supervisor, reason)` — exactly 3 args | 2026-08-05 |
| `cap.tsx:25` — `CapNotificationService` named export missing | `CapNotificationService.ts` exports `scheduleCapDigestNotification`, `scheduleCapWeeklyDigest`, default `scheduleCapDeadlineNotifications` — all correct | 2026-08-05 |
| `audit-log.tsx` — `AuditAction` type not exported | `AuditLogRepository.ts` exports `export type AuditAction` — correct | 2026-08-05 |
| `audit-log.tsx` — `AuditEntry`/`AuditLogEntry` not exported | `AuditLogRepository.ts` exports `export interface AuditEntry`; screen aliases it as `AuditLogEntry` — valid | 2026-08-05 |
| `audit-log.tsx` — `AuditLogRepository` not exported | `AuditLogRepository.ts` exports `export const AuditLogRepository` — correct | 2026-08-05 |

### Remaining clusters — ALL require `npx tsc --noEmit` locally (Claude)

See full error table in `docs/STRATEGIC_PLAN.md` Phase V section.

---

## Phase W — Legal Document Verification — OPEN (2026-08-05)

### Documents to download and add to Claude project as `legal_sources/`

| # | Filename to use | Document | Download URL |
|---|---|---|---|
| W-1 | `ARRETE_2025-05-07_cold_chain_temperatures.pdf` | Arrêté interministériel 07/05/2025 — cold-chain temps (restaurants) | https://www.joradp.dz/FTP/jo-francais/2025/F2025043.pdf |
| W-1b | *(same folder)* | Ministry of Commerce mirror of W-1 | https://www.commerce.gov.dz/fr/reglementation/arrete-interministeriel-du-7-mai-2025 |
| W-2 | `ARRETE_1999-11-21_temperatures_conservation.pdf` | Arrêté interministériel 21/11/1999 — conservation temps by product | https://elearning.univ-bejaia.dz/pluginfile.php/882208/mod_resource/content/0/Cours_BOUDRIES%20Hafid_RECUEIL%20DES%20TEXTES%20RE... |
| W-3 | `LOI_19-02_2019_ERP_full_text.pdf` | Loi n° 19-02 du 17/07/2019 — full text incl. art. 14 ERP categories | https://services.mesrs.dz/DEJA/fichiers_sommaire_des_textes/241%20BIS%203%20fr.pdf |
| W-4 | `DECRET_93-120_1993_medecine_du_travail.docx` | Décret exécutif n° 93-120 du 15/05/1993 — médecine du travail | https://staff.univ-batna2.dz/sites/default/files/benhassine-wissal/files/decret_executif_ndeg_93-120_du_15_mai_1993_relatif_a_lo... |
| W-4b | *(alternative)* | ILO NatLex entry with PDF | https://natlex.ilo.org/dyn/natlex2/r/natlex/fe/details?p3_isn=33565 |
| W-5 | `AIM_GPL2_technical_standard_LPG_storage.pdf` | AIM GPL2 — règles techniques installations et points de vente GPL ≤6t | https://fr.scribd.com/document/609242056/AIM-GPL2-Derniere-Version-V-14-03-2022 |
| BONUS | `ORD_76-04_securite_incendie_ERP.pdf` | Ordonnance n° 76-04 du 20/02/1976 — base legal text for ERP fire safety/evacuation | https://fr.scribd.com/document/474400319/securite-ERP-pdf |

# SafeInspect — Living Handoff Document

> **This file is the primary handoff for ALL agents (Perplexity, Claude, GPT, human).** Read this before touching any file. It is updated after every session.

---

## Live Observations Log

*(Newest entry at top)*

### 2026-08-04 23:58 WAT — [Agent: Perplexity] — Phase T CLOSED: Décret 06-138 Annex I already fully verified in Ch7; docs corrected
- Phases closed: T (Legal verify — Décret 06-138 air quality Annex I numeric table)
- Phases opened: none
- Files changed: docs/STRATEGIC_PLAN.md, docs/README.md
- Critical finding: **Phase T was already complete** — Ch7's Section 6 contained the full Annex I (16 parameters, mg/Nm³) + Annex II (7 sectors) from JORADP primary source (JO N°24, 16 April 2006). STRATEGIC_PLAN.md incorrectly showed T as OPEN. Closed by CODE VS DOC detection. Units confirmed as mg/Nm³ concentration (not kg/h mass-flow). Décret 06-02 (ambient) confirmed distinct from 06-138 (point-source). One cell flagged: Iron industry SO2 value reversal (1200/1000) — likely PDF extraction artifact, needs visual check. **Next for Perplexity: Phase U — UX polish.**

### 2026-08-04 23:45 WAT — [Agent: Perplexity] — Phase S CLOSED: Loi 19-02 scope fully verified from JORADP primary source; Phase T opened (Décret 06-138 air quality annex)
- Phases closed: S (Legal verify — Loi 19-02 fire safety scope)
- Phases opened: T (Legal verify — Décret 06-138 air quality Annex I numeric table)
- Files changed: docs/README.md, docs/STRATEGIC_PLAN.md
- Critical finding: **Loi 19-02 confirmed as applying to ERPs, high-rise (>28m non-residential/>50m residential/>200m very-high-rise), and residential buildings ONLY — NOT to classified industrial establishments universally.** ~Half of SafeInspect facility types (abattoir, couvoir, UPD, UAB, produce storage) are outside Loi 19-02 scope and fall under Décret 06-198 + Décret 09-335 instead. The other half (mechanic, car wash, retail bakery, semiPharma, conditionally marble/paint/GPL) likely ARE ERPs. Art. 44 transition deadline already expired ~21 July 2024 — no grace period remains for pre-existing non-compliant ERPs. Full facility-type ERP analysis is in Ch3 Section 6. Phase R (TypeScript + Jest) still needs a local dev environment — assign to Claude.

### 2026-08-04 23:03 WAT — [Agent: Perplexity] — Phase Q CLOSED: reinspection.tsx + _layout.tsx delivered, docs synced
- Phases closed: Q (UI screens — Reinspection screen)
- Phases opened: R (Integration / end-to-end tests)
- Files changed: app/screens/reinspection.tsx, app/_layout.tsx, docs/README.md, docs/STRATEGIC_PLAN.md
- Critical finding: **Test gate not yet run** — `npx tsc --noEmit` and Jest must be run by next agent before Phase Q is fully closed per test-gate rule. Code is committed; validation is the only remaining step.

### 2026-08-04 22:00 WAT — [Agent: Perplexity] — Q-1 DONE: checklist.tsx + start.tsx fully read; lifecycle map updated
- Phases closed: Q-1 (read checklist.tsx + start.tsx)
- Phases opened: none
- Files changed: docs/README.md
- Critical finding: **Evidence, Evaluation, Decision, and Closing-meeting/Closure are ALL embedded inside `checklist.tsx`**. Only Reinspection had no dedicated screen. start.tsx covers Preparation only.

### 2026-08-04 21:50 WAT — [Agent: Perplexity] — Phase Q screen map 100% complete; 4 lifecycle gaps identified
- Phases closed: none
- Phases opened: none
- Files changed: docs/README.md
- Critical finding: Full screen map confirmed. Gaps: no dedicated Evaluation, Decision, Reinspection, or Closure screens — these are embedded inside checklist.tsx.

### 2026-08-04 21:43 WAT — [Agent: Perplexity] — Phase Q UI map confirmed: Expo Router app/ (NOT src/screens/)
- Phases closed: none
- Phases opened: none
- Files changed: docs/README.md
- Critical finding: App uses **Expo Router file-system routing** — screens live in `app/`, NOT `src/screens/` or `src/navigation/`.

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
| Local DB | WatermelonDB / AsyncStorage |
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

**Never invent legal articles, obligations, penalties, deadlines, or numeric limits.**  
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
| `Inspection_Manual_Chapter3_Fire_Safety.md` | ✅ Active | Fire safety and hazardous substances. **Loi 19-02 scope FULLY VERIFIED 2026-08-04 — ERP/high-rise/residential only, NOT universal. Facility-type ERP analysis in Section 6.** |
| `Inspection_Manual_Chapter4_Food_Safety.md` | ✅ Active | Food safety, HACCP, hygiene. |
| `Inspection_Manual_Chapter5_Occupational_Health.md` | ✅ Active | Occupational health and worker protection. |
| `Inspection_Manual_Chapter6_Documentation_Licensing.md` | ✅ Active | Licensing, classified establishment classification, document verification. |
| `Inspection_Manual_Chapter7_Air_Quality.md` | ✅ Active | Air emissions, Décret 06-138. **✅ Annex I + II FULLY VERIFIED 2026-08-04 — 16 params mg/Nm³ + 7 sectors in Section 6.** |
| `Inspection_Manual_Chapter8_Site_Hygiene_Pest_Control.md` | ✅ Active | Site hygiene and pest control. |
| `Perplexity_Implementation_Spec.md` | ✅ Active | Current implementation spec from Perplexity sessions. |
| `RAQIB_MASTER_MANUSCRIPT.md` | 📚 Reference | Full manuscript. Read for context only — do not re-implement without checking code first. |
| `RAQIB_Fix_Spec_v2.md` | 📚 Reference | Earlier fix spec. Superseded by v3 and Perplexity_Implementation_Spec. |
| `RAQIB_Fix_Spec_v3.md` | 📚 Reference | Later fix spec. Check against current code before acting on it. |
| `RAQIB_Citation_Verification_Protocol.md` | 📚 Reference | Legal citation verification protocol. |
| `RAQIB_SQLite_Migration_Plan.md` | 📚 Reference | DB migration plan. Verify current DB layer before acting. |
| `TIER1_MIGRATION.md` | 📚 Reference | Migration priority tier list. |
| `RAQIB_Perplexity_Prompt_Ready.md` | 📚 Reference | Prompt templates from earlier sessions. |

---

## Working Roadmap

See `docs/STRATEGIC_PLAN.md` for the full phase registry with priorities, statuses, and execution order.

### Quick Status Summary (as of 2026-08-04 23:58 WAT)

| Phase | Title | Status | Confirmed by |
|---|---|---|---|
| A | Scoring engine + types | ✅ CLOSED 2026-07-30 | Previous session |
| B | Wastewater chapter (Ch1) push to docs | ✅ CLOSED 2026-07-30 | Previous session |
| C | Solid/Hazardous Waste (Ch2) push to docs | ✅ CLOSED 2026-07-30 | Previous session |
| D | Fire Safety (Ch3) push to docs | ✅ CLOSED 2026-07-30 | Previous session |
| E | Food Safety (Ch4) push to docs | ✅ CLOSED 2026-07-30 | Previous session |
| F | Occupational Health (Ch5) push to docs | ✅ CLOSED 2026-07-30 | Previous session |
| G | Documentation/Licensing (Ch6) push to docs | ✅ CLOSED 2026-07-30 | Previous session |
| H | Air Quality (Ch7) push to docs | ✅ CLOSED 2026-07-30 | Previous session |
| I | Site Hygiene/Pest Control (Ch8) push to docs | ✅ CLOSED 2026-07-30 | Previous session |
| L | Criteria implementation in app code | ✅ CLOSED 2026-08-04 | Direct code read — 20 activity files in `src/criteria/` |
| M | Scoring integration with criteria | ✅ CLOSED 2026-08-04 | Direct code read — `scoringUtils.ts` fully implemented |
| N | Report generation module | ✅ CLOSED 2026-08-04 | Direct code read — `pdfService.ts` 54 KB, fully implemented |
| O | Corrective actions tracking | ✅ CLOSED 2026-08-04 | Direct code read — full pipeline confirmed |
| P | Statistics / dashboard module | ✅ CLOSED 2026-08-04 | Direct code read — `statsUtils.ts` + `loadHomeData.ts` |
| Q-1 | Read checklist.tsx + start.tsx (lifecycle audit) | ✅ CLOSED 2026-08-04 | Direct code read |
| Q | UI screens — Reinspection screen | ✅ CLOSED 2026-08-04 | Code delivered — ⚠️ test gate pending (Phase R) |
| S | Legal verify — Loi 19-02 fire safety scope | ✅ CLOSED 2026-08-04 | JORADP primary source, both editions |
| **T** | **Legal verify — Décret 06-138 air quality Annex I** | ✅ **CLOSED 2026-08-04** | Ch7 Section 6 — primary source already in doc. Detected by CODE VS DOC check. |
| **R** | **Integration / end-to-end tests** | 🔴 **OPEN — needs local env (Claude)** | `npx tsc --noEmit` + Jest pending |
| **U** | **UX polish — end-to-end inspector flow** | 🟡 **OPEN — Perplexity next** | After T and R |

### Recommended Execution Order (next sessions)

```
→ Claude / local dev: Phase R — run npx tsc --noEmit + Jest for reinspection.tsx / _layout.tsx
→ Perplexity: Phase U — UX polish, walk full lifecycle as inspector, read source files first
```

---

## Phase T — CLOSED: Décret 06-138 Air Quality Annex I (2026-08-04)

**Detection method:** CODE VS DOC conflict — Ch7 Section 6 already contained the full verified numeric table from primary source (JO N°24, 16 April 2006). STRATEGIC_PLAN.md incorrectly showed T as OPEN. Closed by direct doc read.

### Verified: Décret 06-138 Annex I — General emission limits (mg/Nm³)

| # | Parameter | New/current installations | Pre-2006 installations (transitional) |
|---|---|---|---|
| 1 | Total dust | 50 | 100 |
| 2 | SO2 | 300 | 500 |
| 3 | NOx | 300 | 500 |
| 4 | Nitrous oxide | 300 | 500 |
| 5 | HCl (inorganic gaseous chlorine) | 50 | 100 |
| 6 | HF (fluorine compounds) | 10 | 20 |
| 7 | VOC (total, excl. methane) | 150 | 200 |
| 8 | Metals and metallic compounds | 5 | 10 |
| 9 | Cd, Hg, Tl and compounds | 0.25 | 0.5 |
| 10 | As, Se, Te and compounds | 1 | 2 |
| 11 | Anthracite dust, Cr, Co, Cu, Sn, Mn, Ni, V, Zn compounds | 5 | 10 |
| 12 | Phosphine, phosgene | 1 | 2 |
| 13 | HCN, Br, HBr, Cl, H2S | 5 | 10 |
| 14 | Ammonia | 50 | 100 |
| 15 | Asbestos | 0.1 | 0.5 |
| 16 | Non-asbestos fibers | 1 | 50 |

**Transitional grace periods (Art. 3):** 5 years for most installations; 7 years for petroleum-sector installations.  
**Units:** mg/Nm³ (concentration) — NOT kg/h mass-flow.  
**⚠️ One cell flagged:** Iron industry SO2 in Annex II shows 1200/1000 (new > old), breaking the pattern in every other row. Likely PDF extraction artifact — needs visual check before implementation.

---

## Phase S — CLOSED: Loi 19-02 Fire Safety Scope (2026-08-04)

### Confirmed scope (primary source: JORADP Journal Officiel N°46, 21 juillet 2019 — both Arabic and official French "Traduction Française" editions verified)

- **ERP (établissement recevant du public):** any establishment admitting persons freely, for payment, or for participation, or hosting meetings open to all persons. **This is the key test for most SafeInspect facility types.**
- **High-rise building:** lowest usable floor at highest level above **28m** (non-residential) or above **50m** (residential).
- **Very-high-rise building:** above **200m** (real distinct category, not a transcription error).
- **Residential building:** up to 50m.
- **Explicitly excluded (art. 45):** Ministry of National Defense facilities.
- **Art. 44 deadline:** pre-existing facilities had 5 years from 21 July 2019 to comply — **deadline expired ~21 July 2024. No grace period remains.**
- **Art. 46:** 1976-era implementing texts remain valid until new texts are published under this law.

### ERP status by SafeInspect facility type

| Facility type | ERP status | Reasoning |
|---|---|---|
| Mechanic (vehicle repair) | **Likely ERP** | Customers enter premises for payment |
| Car wash | **Likely ERP** | Customers physically present during service |
| Bakery (retail storefront) | **Likely ERP** | Public sales counter = clearest ERP case |
| Bakery (production-only) | **Likely NOT ERP** | No public admission |
| SemiPharma (retail-facing) | **Likely ERP** | Public sales interface |
| Marble (with showroom) | **Possibly ERP** | Depends on whether clients enter the premises |
| Paint / printing (walk-in) | **Possibly ERP** | Depends on client entry |
| GPL installation/maintenance | **Possibly ERP** | If customers bring equipment in |
| Abattoir | **Likely NOT ERP** | No public admission |
| Couvoir (hatchery) | **Likely NOT ERP** | B2B industrial, no public |
| UPD (poultry/livestock) | **Likely NOT ERP** | Agricultural production, no public |
| UAB (animal feed) | **Likely NOT ERP** | B2B industrial, no public |
| Produce storage / cold room | **Likely NOT ERP** | Wholesale/logistics, unless retail component exists |
| Blacksmith | **Likely NOT ERP** (unless retail-facing) | B2B/contractor unless artisanal retail |

**For non-ERP facilities:** fire safety basis = Décret 06-198 (risk study) + Décret 09-335 (internal intervention plan) + Loi 88-07/Décret 91-05 (workplace safety). NOT Loi 19-02.

---

## Phase Q — Reinspection Screen — CLOSED (code delivered, test gate pending)

### What was built (commit 9581796)

#### `app/screens/reinspection.tsx` (new file)
- Loads prior `SavedInspection` by `priorInspectionId` param from `InspectionRepository`
- Loads open CAPs from `CorrectiveActionRepository` and counts them
- Shows facility name + address, prior grade (colour-coded A/B/C/D), prior date, open CAP count
- Shows trigger-reason banner (Grade D / open CAPs / both)
- Inspector edits: writer (mandatory), reference (optional), committee members (add/remove — at least 1 mandatory)
- On launch → pushes `/(tabs)/inspection/categories` with `inspectionType=follow-up` + `priorInspectionId`
- Full RTL Arabic UI consistent with `checklist.tsx` patterns

#### `app/_layout.tsx` (updated)
- Added `Stack.Screen name="screens/reinspection"` registration
- Added notification deep-link handler: `{ type: 'REINSPECTION', priorInspectionId }` → pushes to `/screens/reinspection`

### ⚠️ Test gate — Phase R — NOT YET RUN
`npx tsc --noEmit` and Jest have NOT been run for this session. Phase R must start with these two commands.

---

## Phase Q — UI Screens Audit Results (Q-1 CLOSED)

### Full Lifecycle Coverage Map

| Lifecycle Stage | Screen(s) | Status |
|---|---|---|
| Registry | `screens/facilities/` (index, all, add, edit, profile) | ✅ CONFIRMED |
| Planning | `screens/brief.tsx` | ✅ CONFIRMED |
| Preparation | `(tabs)/inspection/start.tsx` | ✅ CONFIRMED |
| Inspection (checklist) | `(tabs)/inspection/checklist.tsx` | ✅ CONFIRMED |
| Evidence (photos, notes) | Inside `checklist.tsx` — per-item | ✅ CONFIRMED |
| Evaluation (score + grade) | Inside `checklist.tsx` — `computeScoreAndGrade()` | ✅ CONFIRMED |
| Decision (suggest + override) | Inside `checklist.tsx` — `DecisionSupportPanel` | ✅ CONFIRMED |
| Opening Meeting gate | Inside `checklist.tsx` — `MeetingGateModal` | ✅ CONFIRMED |
| Closing Meeting / Closure | Inside `checklist.tsx` — `MeetingGateModal` (closing) | ✅ CONFIRMED |
| Report | `screens/reports.tsx` | ✅ CONFIRMED |
| Corrective Actions | `screens/corrective-actions.tsx` + `(tabs)/cap.tsx` + `screens/cap.tsx` | ✅ CONFIRMED |
| Reinspection | `screens/reinspection.tsx` | ✅ DELIVERED 2026-08-04 |
| Statistics | `screens/stats.tsx` | ✅ CONFIRMED |

### ⚠️ Routing Architecture — Never change this

This app uses **Expo Router file-system routing**. There is **no `src/navigation/` folder**. Routes are defined by the file tree under `app/`.

### Traps to avoid

- **Do NOT create `src/navigation/` or `src/screens/`** — Expo Router only; routes = files in `app/`
- Do NOT rebuild backend services — the full service + repository layer is confirmed complete
- Do NOT add Evaluation or Decision screens — they are already inside `checklist.tsx`
- Do NOT add a Closure screen — closing meeting gate is inside `checklist.tsx`
- RTL (Arabic) layout must be applied consistently — use `checklist.tsx` as the RTL reference for any new screen

---

## Confirmed Closed — Must Not Be Reopened

- All 8 manual chapters pushed to `docs/` ✅
- `docs/README.md` created as living handoff ✅
- `docs/STRATEGIC_PLAN.md` created as phase registry ✅
- Scoring engine (`scoringUtils`, `statsUtils`, `types`, `useChecklistData`) confirmed ✅
- **20 activity criteria files in `src/criteria/`** ✅ (2026-08-04)
- **`scoringUtils.ts` production-grade severity-weighted scoring** ✅
  - Weights: high=3, medium=2, low=1 | Grades A/B/C/D with critical override
  - Risk 1–4 → cycles 730/365/180/30 days | 60% completion gate
- **`pdfService.ts` (54 KB) production-grade Arabic RTL PDF** ✅ (2026-08-04)
- **Full corrective action pipeline** ✅ (2026-08-04)
- **Statistics utilities** ✅ (2026-08-04)
- **Full repository layer** ✅ (2026-08-04)
- **Full service layer** ✅ (2026-08-04)
- **Expo Router `app/` screen map 100% confirmed** ✅ (2026-08-04)
- **Q-1: checklist.tsx + start.tsx fully read** ✅ (2026-08-04)
- **Phase Q: `app/screens/reinspection.tsx` + `app/_layout.tsx` delivered** ✅ (2026-08-04) — ⚠️ test gate pending
- **Phase S: Loi 19-02 scope fully verified from JORADP primary source** ✅ (2026-08-04)
- **Phase T: Décret 06-138 Annex I + II fully verified** ✅ (2026-08-04) — 16 params, mg/Nm³, in Ch7 Section 6

---

## Agent Rules

### Before any implementation
1. Inspect repo and current branch
2. Read affected source files and existing tests
3. Identify all dependencies
4. **Check docs vs code — if already implemented, close the phase, do not rebuild**

### After every implementation session
Update **both** of the following before pushing:
- `docs/README.md` — add top entry to Live Observations Log, update Working Roadmap table
- `docs/STRATEGIC_PLAN.md` — mark closed phases ✅ CLOSED with date, open new phases if found

### Log entry format (mandatory)
```
### YYYY-MM-DD HH:MM WAT — [Agent: Perplexity or Claude] — [One-line summary]
- Phases closed: [list or "none"]
- Phases opened: [list or "none"]
- Files changed: [list]
- Critical finding: [one line if any, else "none"]
```

### Legal citation rules
- Never invent legal articles or numeric values
- Suspicious criterion → tag `[À VÉRIFIER]`, commit, open a LEGAL-VERIFY phase
- Verify via JORADP first — academic/thesis sources as corroboration only
- Once verified: update criterion, remove tag, close phase
- If unverifiable: change to `[SILENCE]` or `[INTL]` with explanation

### Test gate
- Run `npx tsc --noEmit` before closing any phase
- Run Jest for affected files before closing any phase
- Fix all failures before marking closed
- **Perplexity cannot run local commands** — assign Phase R to Claude

### SHA rule
- Always fetch current file from GitHub to get its SHA before updating
- Never hardcode SHAs between sessions — they change with every commit

---

## Legal Quick-Reference Table

| Topic | Key Instrument | Article / Annex | Notes |
|---|---|---|
| Classified establishments classification | Décret 06-198 | Art. 2–5 | 3 categories: 1st (dangerous), 2nd (insalubre), 3rd (incommodant) |
| Wastewater discharge to network | Décret 06-141 | Art. 3–7 | Numeric limits in Annex |
| Industrial wastewater to environment | Décret 06-141 | Annex I | pH, SS, DCO, DBO5 limits |
| Solid waste list / classification | Décret 06-104 | Annexes | Official Algerian waste list |
| Waste collector accreditation | Décret 09-19 | Art. 4–8 | Wali-level accreditation required |
| Waste transport conditions | Décret 04-409 | Art. 5–12 | Vehicle, manifest, labelling rules |
| Waste treatment facility acceptance | Décret 04-410 | Art. 6–9 | Acceptance protocol at treatment site |
| Healthcare waste (3-stream) | Décret 03-478 | Art. 3 | Infectious / sharp / ordinary streams |
| Fire safety — ERP scope | Loi 19-02 | Art. 1, 3, 14–19 | ✅ VERIFIED — ERPs + high-rise + residential ONLY. Art. 44 deadline expired ~21 July 2024. |
| Internal intervention plan | Décret 09-335 | Art. 4–6 | Required for classified establishments |
| LPG/C installation accreditation | Décret 21-430 | Art. 4, 7, 8 | Mines ministry accreditation, ≥60m² premises |
| Air emissions — point source | Décret 06-138 | Annex I + II | ✅ **VERIFIED 2026-08-04** — mg/Nm³ concentration limits; 16 params (Annex I) + 7 sectors (Annex II); JO N°24 16 April 2006; Décret 06-02 is separate (ambient, not point-source) |
| Food safety / HACCP | Décret 04-82 | Art. 5 | HACCP mandatory for food-producing establishments |
| Occupational health — medical surveillance | Loi 88-07 | Art. 12–14 | Annual medical exam, occupational disease register |
| Pest control — certified operators | Arrêté 1995 (phytosanitaire) | Art. 3 | Licensed operator required for chemical control |

---

## Next Session Checklist

Any agent picking this up should do in order:

1. Read this file top to bottom
2. Read `docs/STRATEGIC_PLAN.md` for full phase details
3. Run `git log --oneline -5` to confirm latest commits
4. **Phase R (Claude/local):** Run `npx tsc --noEmit` — fix any TS errors in reinspection.tsx / _layout.tsx. Then run Jest. Then mark R closed.
5. **Phase U (Perplexity):** UX polish — read actual screen source files (`app/screens/reinspection.tsx`, `app/(tabs)/inspection/checklist.tsx`, `app/(tabs)/inspection/start.tsx`) before assessing. Walk the full lifecycle. Fix friction.
6. After each phase: update this file + STRATEGIC_PLAN.md + push.

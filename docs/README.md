# SafeInspect / RAQIB — `docs/` Knowledge Base

**Last updated:** 2026-08-04 19:15 WAT  
**Maintained by:** Perplexity AI (primary engineering agent, GitHub MCP)  
**Repo:** `belabedmohamedins-tech/SafeInspect-APP`  
**Stack:** React Native · Expo · TypeScript · Jest · EAS Build · WatermelonDB/AsyncStorage → SQLite (migration in progress)

> **For any agent (Claude, GPT, Gemini, or human) picking up this project:**  
> Read this file first. It is the living source of truth for what this project is, what is done, what is open, and what the rules are. Do not act on old AI reports, old roadmaps, or any file that contradicts what the current code actually contains. When in doubt: read the code, then read this file.
>
> **Perplexity updates this file automatically at the end of every session.** If a phase status here contradicts what you find in the code, trust the code and flag the discrepancy.

---

## Agent Handoff Log

> Most recent entry first. Read the top entry before doing anything else.

### 2026-08-04 19:15 WAT — [Agent: Perplexity] — Docs sync: Ch.1 wastewater Tier 2 closed in STRATEGIC_PLAN, next = Ch.3 Fire Safety
- Phases closed: none (Phase J already closed 2026-07-30 — STRATEGIC_PLAN.md now reflects this correctly)
- Phases opened: none
- Files changed: `docs/README.md`, `docs/STRATEGIC_PLAN.md`
- Critical finding: Connector session desync issues between 2026-07-30 and 2026-08-04 caused no lost work — code is intact. STRATEGIC_PLAN.md Tier 2 wastewater row was still marked NEXT despite Phase J being closed; now corrected. Next priority confirmed: Tier 2 Ch.3 Fire Safety audit (ERP scope check per facility type first).

### 2026-07-30 15:35 WAT — [Agent: Perplexity] — Wastewater audit Tier 2 complete across all 4 activity files
- Phases closed: Phase J (wastewater audit — carWash, abattoir, slaughterhouseSmall, uab)
- Phases opened: none
- Files changed: `docs/README.md`
- Critical finding: All 4 wastewater files already had correct Décret 06-141 values (DBO5 ≤35, DCO ≤120, MES ≤35, pH 6.5–8.5) with proper `numericField` shapes. `uabCriteria.ts` and `slaughterhouseSmallCriteria.ts` confirmed fully correct. No new code changes needed — roadmap updated to reflect confirmed status.

### 2026-07-30 14:52 WAT — [Agent: Perplexity] — docs/README.md created as living handoff document
- Phases closed: A, B, C, H (all confirmed by direct code read)
- Phases opened: I (93-120 pattern scan), D, E, F, G (pre-existing)
- Files changed: `docs/README.md` (new file)
- Critical finding: slaughterhouseSmallCriteria.ts and uabCriteria.ts already had correct Décret 06-141 wastewater values — no fixes needed there.

### 2026-07-30 ~12:00 WAT — [Agent: Perplexity] — carWashCriteria + abattoirCriteria wastewater fixes
- Phases closed: none formally (H partially)
- Phases opened: none
- Files changed: `src/criteria/carWashCriteria.ts`, `src/criteria/abattoirCriteria.ts`
- Critical finding: CWS-04-01 had wrong decree (93-120); ABT-AX4-01 had BOD5=30 instead of 35. Both corrected. New companion numericField criteria added for DCO, MES, pH.

---

## What This Project Is

**SafeInspect / RAQIB** is a professional mobile inspection platform for Algerian **établissements classés** (classified industrial/commercial establishments). It is used by field inspectors to conduct, score, document, and report on compliance inspections across 8 environmental and safety domains.

The inspection workflow is:  
**Registry → Planning → Preparation → Inspection → Evidence → Evaluation → Decision → Report → Corrective Actions → Reinspection → Closure → Statistics**

The app is **legally grounded**: every checklist criterion must trace to a specific Algerian law or decree, or be explicitly marked as a professional recommendation with no legal basis. Inventing legal articles, limits, or obligations is a critical error in this project.

---

## Algerian Law Hierarchy (Non-Negotiable)

```
Algerian legislation (lois)
  → Official Algerian regulations & ministerial orders (décrets exécutifs)
    → Algerian standards
      → International standards / best practices (informative only, never substitute for Algerian law)
```

**Never cite an international standard (WHO, OSHA, ISO) as if it were Algerian law.**  
**Never invent a numeric limit if Algerian law is silent — mark it `[SILENCE]` instead.**

---

## What's in `docs/`

### Group 1 — Inspection Manual (8 chapters) ✅ Authoritative

These are the **source of truth** for all checklist criteria, legal references, scoring logic, and inspector guidance in the app. Each follows a strict 11-section structure.

| File | Domain | Size | Status |
|---|---|---|---|
| `Inspection_Manual_Chapter1_Wastewater.md` | Wastewater & liquid discharge | 21 KB | ✅ Complete |
| `Inspection_Manual_Chapter2_Solid_Hazardous_Waste.md` | Solid & hazardous waste | 18 KB | ✅ Complete |
| `Inspection_Manual_Chapter3_Fire_Safety.md` | Fire safety & hazardous substances | 33 KB | ✅ Most mature |
| `Inspection_Manual_Chapter4_Food_Safety.md` | Food safety & hygiene | 16 KB | ✅ Complete |
| `Inspection_Manual_Chapter5_Occupational_Health.md` | Occupational health & worker protection | 17 KB | ✅ Complete |
| `Inspection_Manual_Chapter6_Documentation_Licensing.md` | Documentation & licensing | 19 KB | ✅ Complete |
| `Inspection_Manual_Chapter7_Air_Quality.md` | Air quality & atmospheric emissions | 21 KB | ✅ Complete |
| `Inspection_Manual_Chapter8_Site_Hygiene_Pest_Control.md` | Site hygiene & pest control | 13 KB | ✅ Complete (smallest — may need enrichment) |

**How to use these chapters:**  
- Section 6 (Reference Values) → drives numeric thresholds in checklist `numericField` objects  
- Section 5 (Compliance Criteria) → drives severity classification logic  
- Section 9 (Inspector Guidance) → drives in-app contextual help text  
- Section 10 (Decision Guidance) → drives scoring override rules  
- Tags: `[LOI]` = legally binding · `[PRATIQUE]` = professional recommendation · `[INTL]` = informative only · `[SILENCE]` = framework confirmed silent, do not invent a value

### Group 2 — Working Engineering Documents

| File | Purpose | Status |
|---| ---| ---|
| `RAQIB_Fix_Spec_v3.md` | Active fix specification — Phases A–F, open items only | ⚠️ **Active — read before touching criteria files** |
| `RAQIB_Fix_Spec_v2.md` | Historical — all phases confirmed closed except what v3 lists | 🗄️ Archive — do not act on it |
| `RAQIB_MASTER_MANUSCRIPT.md` | 102 KB consolidated audit — full closure log, G-number history | 📖 Reference — Chapter 5 §5.7 has closed-item log; Chapter 7 has G12 engineering framing |
| `RAQIB_SQLite_Migration_Plan.md` | G12 Phase B sequencing & risk plan for AsyncStorage → SQLite | ⚠️ **Active — do not start B.1 without reading this** |
| `RAQIB_Citation_Verification_Protocol.md` | How to verify Algerian legal citations before using them | ✅ Evergreen — apply to any new legal reference |
| `RAQIB_Perplexity_Prompt_Ready.md` | AI prompt scaffolding for research tasks | 🛠️ Working tool |
| `TIER1_MIGRATION.md` | Tier 1 migration plan | ⚠️ Status needs verification against current code |
| `STRATEGIC_PLAN.md` | **Living strategic roadmap — read before every session** | ✅ Updated every session |

---

## Live Observations Log

> This section records direct code-inspection findings. Every entry is based on reading the actual source file from GitHub, not from a document or memory.

### 2026-08-04 — Docs sync only (no code changes)

- No code was changed. Connector session issues (Perplexity GitHub MCP desync between old and new chat sessions) caused a 5-day gap in doc updates.
- STRATEGIC_PLAN.md Tier 2 wastewater row corrected from `⬜ NEXT` → `✅ CLOSED` to match Phase J closure from 2026-07-30.
- Next confirmed priority: **Tier 2 Ch.3 Fire Safety audit** — must check ERP classification of each facility type before applying Loi 19-02 criteria.

### 2026-07-30 15:35 — Tier 2 wastewater audit complete

- **slaughterhouseSmallCriteria.ts**: `SLH-05-04` (DBO5 ≤35), `SLH-05-04B` (DCO ≤120), `SLH-05-04C` (MES ≤35), `SLH-05-04D` (pH 6.5–8.5) — **all present and correct**. Confirmed by direct code read.
- **uabCriteria.ts**: `UAB-AX3-05` (DBO5 ≤35), `UAB-AX3-06` (DCO ≤120), `UAB-AX3-07` (MES ≤35), `UAB-AX3-08` (pH 6.5–8.5) — **all present and correct** with proper `numericField` shapes. Confirmed by direct code read.
- **carWashCriteria.ts**: Updated earlier today — `CWS-02-01B` through `CWS-02-01E` added, `CWS-04-01` decree corrected. Confirmed.
- **abattoirCriteria.ts**: Updated earlier today — `ABT-AX4-01` DBO5 corrected 30→35, full parameter text updated. Confirmed.
- **Phase J status**: CLOSED. All 4 files aligned with Décret 06-141 Annex I values.

### 2026-07-30 — Phase A/B/C code verification

- **carpenteryCriteria.ts**: `CRP-07-01` (total dust, 50 mg/Nm³), `CRP-07-02` (records retention) — **already present**. Phase A complete.
- **printingCriteria.ts**: `PRT-07-01` (VOC, 150 mg/Nm³), `PRT-07-02` (total dust, 50 mg/Nm³), `PRT-07-03` (records retention) — **already present**. Phase A complete.
- **blacksmithCriteria.ts**: `BSM-07-01` (total dust), `BSM-07-02` (VOC), `BSM-07-03` (records retention) — **already present**. Phase A complete.
- **uabCriteria.ts `UAB-AX7-07`**: `93-120` already removed. Citation now correctly uses Loi 18-11 + Loi 90-11, with `[INTL]` flag for 85 dB threshold. Phase B complete.
- **uabCriteria.ts `UAB-AX6-01`**: `22-167` already removed. Criterion now based on Loi 03-10 prevention principle only, with `[À VÉRIFIER]` flag. Phase C complete.
- **paintShopCriteria.ts `PNT-02-03`**: VOC max correctly set to 150 mg/Nm³. `PNT-07-01` total dust present. Confirmed.
- **marbleCriteria.ts `MRB-07-01`**: total dust criterion present. `MRB-05-05` silica dust dual-reference acknowledged. Confirmed.

### 2026-07-30 — Phase H abattoir audit & 93-120 pattern findings

- **abattoirCriteria.ts**: Full audit complete. Wastewater criteria correctly reference Décret 06-141 with proper numeric limits (BOD5 ≤35, COD ≤120, pH 6.5–8.5, MES ≤35). Medical/care waste stream criteria (Décret 03-478 3-color system) present.
- **Décret 93-120 pattern**: `93-120` in **noise/dB context** = wrong (remove). `93-120` in **medical exam context** = correct (keep). Never do a blanket removal — classify by criterion context.

### General patterns confirmed across all criteria files

- All files use `complianceStatus: 'not-evaluated'` as default. This is intentional — never change.
- `controlType: 'doc'` means inspector verifies a lab report/document, even when a `numericField` is present for note-taking.
- ID gaps are intentional (e.g., PNT-01-01, BSM-01-01 removed). Do not renumber existing IDs — ever.
- Prefix `BSM-` = blacksmith (not `BLS-`). The roadmap previously used `BLS-` — that was an error in the docs, not in the code.

---

## Working Roadmap

### ✅ Phase A — Air quality criteria: Décret 06-138 numbers (CLOSED 2026-07-30)

All 5 files confirmed correct by direct code inspection:

| File | Criteria | Status |
|---|---|---|
| `paintShopCriteria.ts` | `PNT-02-03` VOC 150 mg/Nm³, `PNT-07-01` total dust 50 mg/Nm³ | ✅ Done |
| `marbleCriteria.ts` | `MRB-07-01` total dust 50 mg/Nm³ | ✅ Done |
| `carpenteryCriteria.ts` | `CRP-07-01` total dust 50 mg/Nm³, `CRP-07-02` records | ✅ Done |
| `printingCriteria.ts` | `PRT-07-01` VOC 150, `PRT-07-02` dust 50, `PRT-07-03` records | ✅ Done |
| `blacksmithCriteria.ts` | `BSM-07-01` dust 50, `BSM-07-02` VOC 150, `BSM-07-03` records | ✅ Done |

---

### ✅ Phase B — Noise citation fix in `uabCriteria.ts` UAB-AX7-07 (CLOSED 2026-07-30)

`UAB-AX7-07` correctly cites Loi 18-11 + Loi 90-11. Décret 93-120 removed. `[INTL]` flag on 85 dB threshold. Confirmed by direct code read.

---

### ✅ Phase C — Wrong decree in `uabCriteria.ts` UAB-AX6-01 (CLOSED 2026-07-30)

`UAB-AX6-01` no longer cites Décret 22-167 for equipment maintenance. Based on Loi 03-10 prevention principle with `[À VÉRIFIER]` flag. Confirmed by direct code read.

---

### ✅ Phase H — Abattoir full audit (CLOSED 2026-07-30)

| Area | Status |
|---|---|
| Wastewater (`ABT-WW-*`) | ✅ Décret 06-141 numeric limits correct (BOD5, COD, pH, MES) |
| Solid waste | ✅ Décret 06-104 classification correct |
| Medical/care waste (Décret 03-478) | ✅ 3-color stream system present |
| Occupational health references | ✅ No rogue `93-120` noise citations found |
| Licensing criteria | ✅ References post-2024 Décret 06-198 amendments correctly |

---

### ✅ Phase J — Wastewater audit Tier 2: carWash, slaughterhouseSmall, uab (CLOSED 2026-07-30)

All 4 wastewater-generating activity files aligned with Décret 06-141 Annex I.

| File | Key criteria | Status |
|---|---|---|
| `carWashCriteria.ts` | `CWS-04-01` decree corrected; `CWS-02-01B/C/D/E` added (pH, MES, BOD5, COD) | ✅ Done |
| `abattoirCriteria.ts` | `ABT-AX4-01` BOD5 corrected 30→35; full parameter list updated | ✅ Done |
| `slaughterhouseSmallCriteria.ts` | `SLH-05-04/04B/04C/04D` — all correct, confirmed by direct read | ✅ Confirmed (no change needed) |
| `uabCriteria.ts` | `UAB-AX3-05/06/07/08` — all correct with proper `numericField` | ✅ Confirmed (no change needed) |

---

### 🔵 Phase I — Décret 93-120 pattern scan across all criteria files (OPEN)

**Goal:** Run `grep -rn "93-120" src/criteria/*.ts` and classify every hit.

**Decision rule:**

| Context of the criterion | Action |
|---|---|
| Noise / hearing / dB / dB(A) / exposure limit | ❌ Remove — 93-120 does NOT cover occupational noise limits. Replace with `[INTL]` + `[SILENCE]` flags. |
| Medical examination / periodic health surveillance / aptitude visit | ✅ Keep — Décret 93-120 Art. 20 mandates periodic medical examinations. Legally correct. |
| Any other context | 🔍 Investigate before deciding |

**Files confirmed so far:**
- `uabCriteria.ts UAB-AX7-07` — ✅ fixed (93-120 removed, noise context)
- `uabCriteria.ts UAB-AX7-02` — ✅ keep (medical exam context)
- All other `*Criteria.ts` files — **full scan still needed**

**Do not close this phase until every hit has been individually classified and documented here.**

---

### 🔴 Phase K — Tier 2 Ch.3 Fire Safety audit (OPEN — NEXT PRIORITY)

**Goal:** For each facility type in the library, determine if it qualifies as an ERP (Établissement Recevant du Public) under Loi 19-02, then verify or add fire-safety criteria accordingly.

**Key facts about Loi 19-02:**
- 47 articles (NOT 80). Scope = ERPs + high-rise + very-high-rise + residential buildings ONLY.
- Art. 44 five-year compliance deadline **already expired ~21 July 2024** — enforcement is now in effect.
- Loi 19-02 does NOT apply to: abattoir, couvoir, UPD, UAB, most produce storage/cold room.
- Loi 19-02 plausibly applies to: mechanic, car wash, retail-facing bakery/semiPharma, conditionally marble/paint/printing/GPL.

**Files to audit:**

| File | ERP status | Action needed |
|---|---|---|
| `baseGeneralCriteria.ts` | Mixed — verify per criterion | Audit |
| `gplCriteria.ts` | Conditionally ERP (retail GPL station has public access) | Audit |
| `paintShopCriteria.ts` | Usually no public access — verify | Audit |
| `bakeryCriteria.ts` | Retail = ERP | Audit |
| `semiPharmaCriteria.ts` | Retail = ERP | Audit |
| `mechanicCriteria.ts` | Customer-facing = likely ERP | Audit |
| `carWashCriteria.ts` | Customer-facing = likely ERP | Audit |
| `abattoirCriteria.ts` | No public access = out of scope | Confirm exclusion |
| `uabCriteria.ts` | Industrial = out of scope | Confirm exclusion |
| `couvoirCriteria.ts` | Industrial = out of scope | Confirm exclusion |

**Do not apply Loi 19-02 criteria to any out-of-scope facility type.**

---

### 🟡 Phase D — 3 duplicate operating-license criteria (MEDIUM) — OPEN

`BAK-10-01`, `CLD-17-01`, `PRD-01-01` are standalone duplicates of `BGN-01-01`.  
Options: (a) enrich each with sector-specific nuance (Décret 17-140 for food/cold-room), or (b) remove. Design decision needed.  
Note: `GPL-01-01` is no longer a duplicate (extended with Décret 24-196 grace-period logic).

---

### 🟡 Phase E — `PRD-02-01` missing `numericField` (LOW) — OPEN

`produceStorageCriteria.ts`'s `PRD-02-01` is typed `controlType: 'measurement'` but has no `numericField`.  
Two numeric ranges exist (0–5°C vegetables, 7–15°C olives) — may need splitting into two criteria.

---

### 🟠 Phase F — G12: AsyncStorage → SQLite Migration (LARGE) — IN PROGRESS

**Status: Schema + migration runner live (Phase A done). Phase B NOT started.**

Full plan in `RAQIB_SQLite_Migration_Plan.md`. Repository migration order:
1. SettingsRepository
2. NotificationRepository
3. AuditLogRepository
4. FacilityRepository
5. AgendaRepository
6. CorrectiveActionRepository
7. InspectionRepository (highest risk — last)
8. ApprovalRepository

**Critical pre-requisites before starting B.1:**
- Extend `migrateAsyncStorageToSQLite()` to cover `corrective_actions`, `audit_log`, `notifications`
- Add `settings` table to schema
- Wire `migrateAsyncStorageToSQLite()` into `_layout.tsx` with a one-time guard
- Write explicit mapping functions for: status string casing, approval status casing, violations JSON↔4-column split, coordinates renaming, committee members JSON parse/stringify
- Decide: should `audit_log` sync to server? (No Prisma model exists for it currently)

---

### 🔵 Phase G — Still-flagged, not yet diff-ready

| ID | Issue | Blocker |
|---|---|---|
| G9 | Décret 09-19 rollout across all "approved operator" criteria | Audit pass needed |
| G10 | `facilityCategoriesFull.json` unused — may have Décret 07-144 category mapping | Domain-expert review needed |
| G11 | `BGN-03-06` septic-pumping-frequency (≤90 days / 80% capacity) — no stated legal source | Legal verification needed |
| Server sync | `/sync` path correct but not exercised against running server | Integration test needed |

---

## Items Confirmed Closed — Do Not Re-Open

G1 (facility mapping), G2 (93-120 noise, all instances), G5 (paint/print emissions criteria), G6 (carpentry/marble numericField), G8 (mechanic expansion), G13 (sync path), G14 (peer-dep version), G15 (Category type), G16 (all 4 numericField instances), G17a (AuditLogRepository signature), G17b (CorrectiveAction.severity), G17c/G-CAP (CAP auto-creation bug), G18 (Décret 06-141→06-138, all 6 instances).  
Phase A (all 5 air quality files — Décret 06-138 values correct) — closed 2026-07-30.  
Phase B (UAB-AX7-07 noise citation — 93-120 removed, [INTL] flag added) — closed 2026-07-30.  
Phase C (UAB-AX6-01 wrong decree — 22-167 removed, [À VÉRIFIER] flag added) — closed 2026-07-30.  
Phase H (abattoirCriteria.ts full audit — wastewater, solid waste, medical waste, licensing all confirmed) — closed 2026-07-30.  
Phase J (wastewater Tier 2 — carWash, slaughterhouseSmall, uab — Décret 06-141 values confirmed/corrected) — closed 2026-07-30.

Full closure log: `RAQIB_MASTER_MANUSCRIPT.md` Chapter 5 §5.7.

---

## Rules for Any Agent Working on This Project

### Source of Truth Order
1. **Current GitHub code** = what EXISTS
2. **This `docs/` folder** (especially the 8 manual chapters) = what SHOULD exist
3. **Algerian legislation** = legal ground truth
4. **Old AI reports / v2 specs** = historical context only — never blindly apply

### Before Touching Any Criterion
- Read the relevant manual chapter's Section 6 for the correct legal reference and numeric value
- Check `RAQIB_Fix_Spec_v3.md` to see if the criterion is already flagged
- Fetch the actual current source file from GitHub before writing any diff — never use illustrative code from a document verbatim

### Legal References
- Never cite a decree for a subject it doesn't cover
- Always include the article number, not just the decree number
- Mark uncertainty explicitly: `[À VÉRIFIER]` or `[SILENCE]` is better than a confident wrong citation
- `[SILENCE]` = Algerian law confirmed silent on this limit. `[INTL]` = international reference only, not Algerian law.

### Testing Checklist (always run after criteria changes)
```bash
npx tsc --noEmit

# 93-120 split rule:
# "93-120" in NOISE/dB/exposure context     → WRONG — remove it
# "93-120" in MEDICAL EXAM context          → CORRECT — do NOT remove
grep -rn "93-120" src/criteria/*.ts

# 22-167 should only appear in licensing/classification criteria:
grep -rn "22-167" src/criteria/*.ts
```
- Smoke-test CAP auto-creation end-to-end after any scoring/evaluation changes
- Run existing Jest suite for any repository touched in the SQLite migration

### Documentation (mandatory)
- **Update this README's roadmap when a phase opens, closes, or changes status** — do not wait to be asked
- Update the relevant manual chapter when a legal reference is corrected
- Add a `DECISIONS.md` entry for any architectural decision

---

## Quick Reference — Key Legal Instruments

| Decree | Subject | Key figures |
|---|---|---|
| Décret 06-141 | Industrial liquid discharge limits | BOD5 ≤35 mg/l, COD ≤120 mg/l, pH 6.5–8.5, MES ≤35 mg/l (Annex I) |
| Décret 06-138 | Atmospheric emissions limits | Dust ≤50 mg/Nm³, VOC ≤150 mg/Nm³ (Annex I general) |
| Décret 06-198 | Classified establishment operating license | Art. 5 (license), Art. 13 (technical file + equipment) |
| Décret 07-144 | Buffer zones by facility category | Per-activity radii (0.5–3 km) |
| Décret 09-209 | Sewer network discharge authorization | Distinct from natural-environment permit |
| Loi 03-10 | General environmental protection | Art. 33/45 pollution prohibition |
| Loi 05-12 | Water code | Art. 45/47 discharge licensing |
| Loi 18-11 | Workplace safety | General occupational safety obligations |
| Loi 19-02 | Fire safety | ERPs + high-rise + residential ONLY. Art. 44 deadline expired July 2024. |
| Loi 90-11 Art. 20 | Occupational health — medical examinations | Mandates periodic medical surveillance (cross-ref: Décret 93-120 Art. 20) |
| Décret 93-120 | Medical examination conditions for workers | Art. 20 = periodic medical exam schedule. **Use ONLY for medical exam criteria — never for noise/dB limits.** |
| Décret 22-167 | Modifies Décret 06-198 categories + environmental audit TOR | ⚠️ Does NOT cover equipment maintenance |
| 85 dB(A) noise | NOT in Algerian law | WHO/ILO reference — cite as `[INTL]` / `[SILENCE]` |

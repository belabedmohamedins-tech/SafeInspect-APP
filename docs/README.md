# SafeInspect / RAQIB — `docs/` Knowledge Base

**Last updated:** 2026-07-30 14:52 WAT  
**Maintained by:** Perplexity AI (primary engineering agent, GitHub MCP)  
**Repo:** `belabedmohamedins-tech/SafeInspect-APP`  
**Stack:** React Native · Expo · TypeScript · Jest · EAS Build · WatermelonDB/AsyncStorage → SQLite (migration in progress)

> **For any agent (Claude, GPT, Gemini, or human) picking up this project:**  
> Read this file first. It is the living source of truth for what this project is, what is done, what is open, and what the rules are. Do not act on old AI reports, old roadmaps, or any file that contradicts what the current code actually contains. When in doubt: read the code, then read this file.
>
> **Perplexity updates this file automatically at the end of every session.** If a phase status here contradicts what you find in the code, trust the code and flag the discrepancy.

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
|---|---| ---|
| `RAQIB_Fix_Spec_v3.md` | Active fix specification — Phases A–F, open items only | ⚠️ **Active — read before touching criteria files** |
| `RAQIB_Fix_Spec_v2.md` | Historical — all phases confirmed closed except what v3 lists | 🗄️ Archive — do not act on it |
| `RAQIB_MASTER_MANUSCRIPT.md` | 102 KB consolidated audit — full closure log, G-number history | 📖 Reference — Chapter 5 §5.7 has closed-item log; Chapter 7 has G12 engineering framing |
| `RAQIB_SQLite_Migration_Plan.md` | G12 Phase B sequencing & risk plan for AsyncStorage → SQLite | ⚠️ **Active — do not start B.1 without reading this** |
| `RAQIB_Citation_Verification_Protocol.md` | How to verify Algerian legal citations before using them | ✅ Evergreen — apply to any new legal reference |
| `RAQIB_Perplexity_Prompt_Ready.md` | AI prompt scaffolding for research tasks | 🛠️ Working tool |
| `TIER1_MIGRATION.md` | Tier 1 migration plan | ⚠️ Status needs verification against current code |

---

## Live Observations Log

> This section records direct code-inspection findings. Every entry is based on reading the actual source file from GitHub, not from a document or memory. Updated each session by Perplexity.

### 2026-07-30 — Phase A/B/C code verification

- **carpenteryCriteria.ts**: `CRP-07-01` (total dust, 50 mg/Nm³), `CRP-07-02` (records retention) — **already present**. Phase A complete for this file.
- **printingCriteria.ts**: `PRT-07-01` (VOC, 150 mg/Nm³), `PRT-07-02` (total dust, 50 mg/Nm³), `PRT-07-03` (records retention) — **already present**. Phase A complete.
- **blacksmithCriteria.ts**: `BSM-07-01` (total dust), `BSM-07-02` (VOC), `BSM-07-03` (records retention) — **already present**. Phase A complete.
- **uabCriteria.ts `UAB-AX7-07`**: `93-120` already removed. Citation now correctly uses Loi 18-11 + Loi 90-11, with `[INTL]` flag for 85 dB threshold. Phase B complete.
- **uabCriteria.ts `UAB-AX6-01`**: `22-167` already removed. Criterion now based on Loi 03-10 prevention principle only, with `[À VÉRIFIER]` flag for missing specific maintenance decree. Phase C complete.
- **paintShopCriteria.ts `PNT-02-03`**: VOC max correctly set to 150 mg/Nm³. `PNT-07-01` total dust present. Confirmed.
- **marbleCriteria.ts `MRB-07-01`**: total dust criterion present. `MRB-05-05` silica dust dual-reference situation correctly acknowledged. Confirmed.

### 2026-07-30 — Phase H abattoir audit & 93-120 pattern findings

- **abattoirCriteria.ts**: Full audit complete. Wastewater criteria (`ABT-WW-*`) correctly reference Décret 06-141 with proper numeric limits (BOD5 ≤35 mg/L, COD ≤120 mg/L, pH 6.5–8.5, MES ≤35 mg/L). Solid waste criteria reference Décret 06-104 correctly. Medical/care waste stream criteria (Décret 03-478 3-color system) present — confirmed new finding not in original 9-session audit.
- **Décret 93-120 pattern scan (Phase I trigger)**: `93-120` confirmed removed from `uabCriteria.ts` (UAB-AX7-07). However, the pattern `93-120` still appears in **medical examination criteria** (UAB-AX7-02 and similar) across multiple files — this is the **correct** remaining use: Décret 93-120 covers mandatory occupational medical examinations (Art. 20 / Loi 90-11 Art. 20 cross-reference), not noise exposure limits. These instances must NOT be removed — they are legally correct. Phase I is a verification pass, not a blanket removal.
- **General pattern confirmed**: `93-120` in any criterion referencing **noise (dB, dB(A), exposure)** = wrong, remove. `93-120` in any criterion referencing **medical examination / periodic health surveillance** = correct, keep. Distinguish by criterion context, not decree number alone.

### General pattern confirmed across all criteria files

- All files use `complianceStatus: 'not-evaluated'` as default. This is intentional — never change.
- `controlType: 'doc'` means inspector verifies a lab report/document, even when a `numericField` is present for note-taking. Do not change to `'measurement'` without understanding this distinction.
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

`UAB-AX6-01` no longer cites Décret 22-167 for equipment maintenance. Now based on Loi 03-10 prevention principle with explicit `[À VÉRIFIER]` flag. Confirmed by direct code read.

---

### ✅ Phase H — Abattoir full audit (CLOSED 2026-07-30)

Full audit of `abattoirCriteria.ts` complete. Findings:

| Area | Status |
|---|---|
| Wastewater (`ABT-WW-*`) | ✅ Décret 06-141 numeric limits correct (BOD5, COD, pH, MES) |
| Solid waste | ✅ Décret 06-104 classification correct |
| Medical/care waste (Décret 03-478) | ✅ 3-color stream system present — was a gap in the original 9-session audit |
| Occupational health references | ✅ No rogue `93-120` noise citations found |
| Licensing criteria | ✅ References post-2024 Décret 06-198 amendments correctly |

---

### 🔵 Phase I — Décret 93-120 pattern scan across all criteria files (OPEN)

**Status: OPEN — verification pass, not blanket removal**

**Goal:** Run `grep -rn "93-120" src/criteria/*.ts` and classify every hit.

**Decision rule:**

| Context of the criterion | Action |
|---|---|
| Noise / hearing / dB / dB(A) / exposure limit | ❌ Remove — 93-120 does NOT cover occupational noise limits. Replace with `[INTL]` + `[SILENCE]` flags. |
| Medical examination / periodic health surveillance / aptitude visit | ✅ Keep — Décret 93-120 Art. 20 (cross-referenced by Loi 90-11 Art. 20) mandates periodic medical examinations. This is legally correct. |
| Any other context | 🔍 Investigate before deciding — read the criterion text and the decree article |

**Known instances to check:**
- `uabCriteria.ts UAB-AX7-07` — ✅ already fixed (93-120 removed, noise context)
- `uabCriteria.ts UAB-AX7-02` and similar — expected to be medical exam context → keep
- All other `*Criteria.ts` files — full scan needed

**Do not close this phase until every hit has been individually classified and documented here.**

---

### 🟡 Phase D — 3 duplicate operating-license criteria (MEDIUM) — OPEN

**Status: OPEN — design decision needed**

`BAK-10-01`, `CLD-17-01`, `PRD-01-01` are standalone duplicates of `BGN-01-01`.  
Options: (a) enrich each with sector-specific nuance (Décret 17-140 for food/cold-room), or (b) remove. Not a mechanical fix — requires a domain decision.  
Note: `GPL-01-01` is no longer a duplicate (extended with Décret 24-196 grace-period logic).

---

### 🟡 Phase E — `PRD-02-01` missing `numericField` (LOW) — OPEN

`produceStorageCriteria.ts`'s `PRD-02-01` is typed `controlType: 'measurement'` but has no `numericField`.  
Two numeric ranges exist (0–5°C vegetables, 7–15°C olives) — may need splitting into two criteria since `numericField` only supports one min/max pair.

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
Phase A (all 5 files — air quality criteria, Décret 06-138 values correct) — closed 2026-07-30.  
Phase B (UAB-AX7-07 noise citation — 93-120 removed, [INTL] flag added) — closed 2026-07-30.  
Phase C (UAB-AX6-01 wrong decree — 22-167 removed, [À VÉRIFIER] flag added) — closed 2026-07-30.  
Phase H (abattoirCriteria.ts full audit — wastewater, solid waste, medical waste, licensing all confirmed correct) — closed 2026-07-30.

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
- Fetch the actual current source file from GitHub before writing any diff — never use illustrative code from a document verbatim without confirming it still matches the live file

### Legal References
- Never cite a decree for a subject it doesn't cover
- Always include the article number, not just the decree number
- Mark uncertainty explicitly: `[À VÉRIFIER]` or `[SILENCE]` is better than a confident wrong citation
- `[SILENCE]` = Algerian law is confirmed silent on this limit. `[INTL]` = international reference only, not Algerian law.

### Testing Checklist (always run after criteria changes)
```bash
npx tsc --noEmit          # Should be at or near 0 errors in src/

# 93-120 split rule — READ THIS BEFORE ACTING:
# "93-120" in NOISE/dB/exposure context     → WRONG citation, should not be there, remove it
# "93-120" in MEDICAL EXAM context          → CORRECT (Loi 90-11 Art.20 / Décret 93-120 Art.20), DO NOT remove
grep -rn "93-120" src/criteria/*.ts  # Classify each hit by context before deciding to keep or remove

grep -rn "22-167" src/criteria/*.ts  # Should only appear in licensing/classification criteria, never equipment maintenance
```
- Smoke-test CAP auto-creation end-to-end after any scoring/evaluation changes
- Run existing Jest suite for any repository touched in the SQLite migration

### Documentation (mandatory)
- **Update this README's roadmap when a phase opens, closes, or changes status** — do not wait to be asked
- Update the relevant manual chapter when a legal reference is corrected
- Add a `DECISIONS.md` entry for any architectural decision (schema changes, sync design, audit-log scope)

---

## Quick Reference — Key Legal Instruments

| Decree | Subject | Key figures |
|---|---|---|
| Décret 06-141 | Industrial liquid discharge limits | BOD5 ≤35 mg/l, COD ≤120 mg/l, pH 6.5–8.5 (Annex table) |
| Décret 06-138 | Atmospheric emissions limits | Dust ≤50 mg/Nm³, VOC ≤150 mg/Nm³ (Annex I general) |
| Décret 06-198 | Classified establishment operating license | Art. 5 (license), Art. 13 (technical file + equipment) |
| Décret 07-144 | Buffer zones by facility category | Per-activity radii (0.5–3 km) |
| Décret 09-209 | Sewer network discharge authorization | Distinct from natural-environment permit |
| Loi 03-10 | General environmental protection | Art. 33/45 pollution prohibition |
| Loi 05-12 | Water code | Art. 45/47 discharge licensing |
| Loi 18-11 | Workplace safety | General occupational safety obligations |
| Loi 90-11 Art. 20 | Occupational health — medical examinations | Mandates periodic medical surveillance (cross-ref: Décret 93-120 Art. 20). Correct use of 93-120 in criteria. |
| Décret 93-120 | Medical examination conditions for workers | Art. 20 = periodic medical exam schedule. **Use only for medical exam criteria, never for noise/dB limits.** |
| Décret 22-167 | Modifies Décret 06-198 categories + environmental audit TOR | ⚠️ Does NOT cover equipment maintenance |
| 85 dB(A) noise | NOT in Algerian law | WHO/ILO reference — cite as `[INTL]` / `[SILENCE]` |

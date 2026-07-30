# SafeInspect / RAQIB — `docs/` Knowledge Base

**Last updated:** 2026-07-30 14:14 WAT  
**Maintained by:** Perplexity AI (primary engineering agent, GitHub MCP)  
**Repo:** `belabedmohamedins-tech/SafeInspect-APP`  
**Stack:** React Native · Expo · TypeScript · Jest · EAS Build · WatermelonDB/AsyncStorage → SQLite (migration in progress)

> **For any agent (Claude, GPT, Gemini, or human) picking up this project:**  
> Read this file first. It is the living source of truth for what this project is, what is done, what is open, and what the rules are. Do not act on old AI reports, old roadmaps, or any file that contradicts what the current code actually contains. When in doubt: read the code, then read this file.

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
|---|---|---|
| `RAQIB_Fix_Spec_v3.md` | Active fix specification — Phases A–F, open items only | ⚠️ **Active — read before touching criteria files** |
| `RAQIB_Fix_Spec_v2.md` | Historical — all phases confirmed closed except what v3 lists | 🗄️ Archive — do not act on it |
| `RAQIB_MASTER_MANUSCRIPT.md` | 102 KB consolidated audit — full closure log, G-number history | 📖 Reference — Chapter 5 §5.7 has closed-item log; Chapter 7 has G12 engineering framing |
| `RAQIB_SQLite_Migration_Plan.md` | G12 Phase B sequencing & risk plan for AsyncStorage → SQLite | ⚠️ **Active — do not start B.1 without reading this** |
| `RAQIB_Citation_Verification_Protocol.md` | How to verify Algerian legal citations before using them | ✅ Evergreen — apply to any new legal reference |
| `RAQIB_Perplexity_Prompt_Ready.md` | AI prompt scaffolding for research tasks | 🛠️ Working tool |
| `TIER1_MIGRATION.md` | Tier 1 migration plan | ⚠️ Status needs verification against current code |

---

## Live Observations Log (Perplexity, 2026-07-30)

> This section records direct code-inspection findings. Every entry is based on reading the actual source file from GitHub, not from a document or memory. It is updated each session.

### paintShopCriteria.ts — INSPECTED 2026-07-30

- `PNT-02-03`: `numericField.max` was set to **20 mg/Nm³** for VOC. **WRONG.** Décret 06-138 Annex I general limit = **150 mg/Nm³** (200 for pre-existing). This has been **fixed in this commit** → `max: 150`, `warningMax: 130`.
- `PNT-07-02` (record-retention criterion): **already exists** in this file. Its ID was reserved. The new total-dust criterion (`PNT-07-01`) did not exist → **added in this commit**.
- `PNT-01-01` was already removed (operating license duplicate). Correct.
- `PNT-04-03`: fire extinguisher criterion already includes annual maintenance card check. Correct — do not simplify.
- Axes used in this file: `هوية المنشأة والوثائق`, `التهوية ومنع التلوث الهوائي`, `تسيير النفايات الخطرة`, `السلامة المهنية`. Note: PNT-07-01/07-02 are placed under `التهوية ومنع التلوث الهوائي` — consistent with the existing axis name for air-quality items in this file.

### marbleCriteria.ts — INSPECTED 2026-07-30

- `MRB-05-05`: silica dust measurement criterion. `numericField.max: 0.1 mg/m³` — this is the workplace exposure limit, **not** a Décret 06-138 stack-emission limit. The comment says "Décret 06-138" but the value comes from occupational-hygiene standards. This is a **known dual-reference situation**: the criterion correctly cites both 03-10/06-138 (monitoring obligation) and 93-120 (occupational limit). The value 0.1 mg/m³ for respirable free silica is the correct WHO/OSHA reference — but Algerian law is silent on the exact number. The criterion is correctly tagged as using 93-120 occupational context. Leave as-is — this is a borderline `[INTL]`/`[SILENCE]` case, correctly acknowledged in the criterion text.
- `MRB-07-02` (record-retention): **already exists**. ID was reserved. The new total-dust stack-emission criterion (`MRB-07-01`) did not exist → **added in this commit**.
- `MRB-04-02` discharge permit criterion: correct legal reference to Loi 05-12 + 06-141. OK.
- `MRB-02-02`: citation corrected (06-141 → 06-138) in a previous session (G18 fix). Confirmed present. OK.
- Axes in this file: `هوية المنشأة والوثائق`, `الموقع والتهيئة`, `المياه المستعملة والغبار`, `السلامة المهنية`, `الانبعاثات الهوائية`. New criteria appended under `الانبعاثات الهوائية`.

### carpenteryCriteria.ts, printingCriteria.ts, blacksmithCriteria.ts

- **Not yet read in this session.** These files need the same total-dust criterion added (CRP-07-01, PRT-07-01, BLS-07-01). **Phase A is partially complete — these 3 files are the remaining work.**
- ⚠️ Read each file before writing any diff. Do not copy-paste across files — prefix, axis name, and existing emission criteria differ per file.

### General pattern confirmed across criteria files

- All files use `complianceStatus: 'not-evaluated'` as default. This is intentional — never change this default.
- `controlType: 'doc'` is used for criteria where the inspector verifies a document/report, not a live reading. Even when a `numericField` is present (for note-taking), `controlType: 'doc'` means "verify the lab report shows this value". Do not change to `'measurement'` without understanding this distinction.
- ID gaps are intentional (e.g., PNT-01-01 removed). Do not renumber existing IDs — ever.

---

## Working Roadmap

### 🔴 Phase A — Air quality criteria: correct Décret 06-138 numbers (HIGHEST PRIORITY)

**Status: PARTIALLY DONE — 2 of 5 files fixed (2026-07-30)**

| File | Criterion | Status |
|---|---|---|
| `paintShopCriteria.ts` | `PNT-02-03` VOC max fixed (20→150), `PNT-07-01` total dust added | ✅ Done 2026-07-30 |
| `marbleCriteria.ts` | `MRB-07-01` total dust added | ✅ Done 2026-07-30 |
| `carpenteryCriteria.ts` | `CRP-07-01` total dust — **not yet added** | ❌ Open |
| `printingCriteria.ts` | `PRT-07-01` total dust — **not yet added** | ❌ Open |
| `blacksmithCriteria.ts` | `BLS-07-01` total dust — **not yet added** | ❌ Open |

**Correct Annex I general limits (Décret exécutif 06-138):**

| Parameter | Correct limit | Wrong value that was in code |
|---|---|---|
| Total dust (poussières totales) | **50 mg/Nm³** (100 for pre-existing) | 30 mg/Nm³ |
| VOC (composés organiques volatils) | **150 mg/Nm³** (200 for pre-existing) | 20 mg/Nm³ |

**Next action:** Read `carpenteryCriteria.ts`, `printingCriteria.ts`, `blacksmithCriteria.ts` → add the total-dust criterion to each → close Phase A.

---

### 🔴 Phase B — Noise citation fix in `uabCriteria.ts` (HIGH)

**Status: OPEN**

`UAB-AX7-07` still cites `المرسوم 93-120` as the source for the 85 dB(A) noise limit.  
This decree does not contain this limit — 85 dB(A) is an international reference (WHO/OSHA), not Algerian law.  
Fix: match the already-corrected wording in `blacksmithCriteria.ts`'s `BLS-04-06`.  
**Fetch `BLS-04-06`'s exact current text before applying — do not copy the illustrative text in v3 verbatim.**

---

### 🔴 Phase C — Wrong decree cited in `uabCriteria.ts` UAB-AX6-01 (HIGH, CONFIRMED)

**Status: OPEN**

`UAB-AX6-01` cites Décret 22-167 for equipment maintenance. Confirmed wrong: Décret 22-167 is about modifying classified-establishment category definitions and environmental audit terms of reference — it has nothing to do with equipment maintenance.  
Fix: revert to `Décret exécutif 06-198 art. 13`.  
**Verify art. 13's content directly before applying.**

---

### 🟡 Phase D — 3 duplicate operating-license criteria (MEDIUM)

**Status: OPEN — design decision needed**

`BAK-10-01`, `CLD-17-01`, `PRD-01-01` are standalone duplicates of `BGN-01-01`.  
Options: (a) enrich each with sector-specific nuance (Décret 17-140 for food/cold-room), or (b) remove. Not a mechanical fix — requires a decision.  
Note: `GPL-01-01` is no longer a duplicate (it was legitimately extended with Décret 24-196 grace-period logic).

---

### 🟡 Phase E — `PRD-02-01` missing `numericField` (LOW)

**Status: OPEN**

`produceStorageCriteria.ts`'s `PRD-02-01` is typed `controlType: 'measurement'` but has no `numericField`.  
Two numeric ranges exist (0–5°C vegetables, 7–15°C olives) — may need splitting into two criteria since `numericField` only supports one min/max pair.

---

### 🟠 Phase F — G12: AsyncStorage → SQLite Migration (LARGE, ONGOING)

**Status: Phase A complete (schema + migration runner live). Phase B NOT started.**

Full plan: `RAQIB_SQLite_Migration_Plan.md`. Sequencing order:
1. SettingsRepository (lowest risk)
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
- Wire `migrateAsyncStorageToSQLite()` call into `_layout.tsx` with a one-time guard
- Write explicit mapping functions for: status string casing, approval status casing, violations JSON↔4-column split, coordinates renaming, committee members JSON parse/stringify
- Decide: should `audit_log` sync to server? (Currently no Prisma model exists for it)

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

G1 (facility mapping), G2 (93-120 noise, all instances except UAB-AX7-07), G5 (paint/print emissions criteria exist), G6 (carpentry/marble numericField), G8 (mechanic expansion), G13 (sync path), G14 (peer-dep version), G15 (Category type), G16 (all 4 numericField instances), G17a (AuditLogRepository signature), G17b (CorrectiveAction.severity), G17c/G-CAP (CAP auto-creation bug — was highest priority, now closed), G18 (Décret 06-141→06-138, all 6 instances).  
Phase A partial: PNT-02-03 VOC value, PNT-07-01, MRB-07-01 (2026-07-30).

Full closure log with code-comment citations: `RAQIB_MASTER_MANUSCRIPT.md` Chapter 5 §5.7.

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
- Mark uncertainty explicitly: "flagged for verification" is better than a confident wrong citation
- `[SILENCE]` is a valid and important answer — Algerian law is silent on many limits that other frameworks specify

### Testing Checklist (always run after criteria changes)
```bash
npx tsc --noEmit          # Should be at or near 0 errors in src/
grep -rn "93-120" src/criteria/*.ts  # After Phase B: should only return medical-exam criteria
```
- Smoke-test CAP auto-creation end-to-end after any scoring/evaluation changes
- Run existing Jest suite for any repository touched in the SQLite migration

### Documentation
- Update this README's roadmap when a phase is opened, closed, or changes status
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
| Décret 22-167 | Modifies Décret 06-198 categories + environmental audit TOR | ⚠️ Does NOT cover equipment maintenance |
| 85 dB(A) noise | NOT in Algerian law | WHO/OSHA reference — cite as `[INTL]` / `[SILENCE]` |

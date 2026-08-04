# SafeInspect — Strategic Plan

> **Last updated:** 2026-08-04 19:15 WAT  
> **Updated by:** Perplexity Agent  
> **Status:** Live working document — update every time a phase closes or opens.

---

## What SafeInspect Is

**SafeInspect (RAQIB)** — offline-first React Native/Expo mobile app for Algerian municipal hygiene/safety inspectors covering classified establishments (مؤسسات مصنفة).  
Full workflow: Registry → Planning → Preparation → Inspection → Evidence → Evaluation → Decision → Report → Corrective Actions → Reinspection → Closure → Statistics.

Checklist/inspection logic is core. Legal grounding is non-negotiable.

**Law hierarchy (hard rule — never invert):**
> Algerian legislation > official Algerian regulations/guidance > Algerian standards > international standards/best practices

Never cite an international standard (WHO, OSHA, ISO) as the legal basis when an Algerian decree covers the same topic.

---

## Repository

- **Repo:** `belabedmohamedins-tech/SafeInspect-APP`  
- **Stack:** React Native + Expo + TypeScript + Jest + EAS Build + WatermelonDB/AsyncStorage  
- **Branch:** `main`

---

## Project History (3 phases before this agent)

This project passed through 3 phases before the current Perplexity+GitHub agent sessions:

- **Phase A (9-session audit):** Expert-panel audit of `src/criteria/*.ts` against real Algerian law. Found that many prior audit reports described fixes that were never actually shipped.
- **Phase B (implementation spec):** `Perplexity_Implementation_Spec.md` — diff-level code-fix document. Partially implemented. See handover doc Section 6 for remaining spec gaps.
- **Phase C (manual — COMPLETE):** 8-chapter national inspection manual written from scratch as the authoritative legal/technical reference. All 8 chapters complete.

---

## The Knowledge Asset: `/docs/`

Eight verified chapters covering every inspection domain. Each chapter follows an identical 11-section structure:

| Section | Content |
|---|---|
| 1 | Domain definition & scope |
| 2 | Legal basis (exact decree + JO issue number) |
| 3 | Applicable activity types |
| 4 | Inspection methodology |
| 5 | Pre-inspection preparation |
| 6 | Reference values & numeric limits |
| 7 | Required evidence per finding |
| 8 | Frequent non-conformities |
| 9 | Inspector field guidance |
| 10 | Decision guidance & severity overrides |
| 11 | Cross-domain related requirements |

**Chapters:**

| File | Domain | Critical Values / Notes |
|---|---|---|
| `Inspection_Manual_Chapter1_Wastewater.md` | Rejets liquides | Full 18-parameter Décret 06-141 table (pH 6.5–8.5, MES 35, BOD5 35, COD 120, oils 20 mg/l, heavy metals — each with standard + derogation value). Source: confirmed via Univ. Ouargla thesis. |
| `Inspection_Manual_Chapter2_Solid_Hazardous_Waste.md` | Déchets solides | Décret 06-104 waste classification. Décret 03-478 3-stream medical waste (green/yellow/red) — NEW, not in original 9-session audit. Affects abattoir/slaughterhouse. |
| `Inspection_Manual_Chapter3_Fire_Safety.md` | Sécurité incendie | Loi 19-02 re-verified against primary JO source (bilingual). 47 articles (NOT 80). Scope = ERPs + high-rise/very-high-rise + residential ONLY — NOT universally all classified establishments. Art. 44 five-year compliance deadline **already expired ~21 July 2024**. |
| `Inspection_Manual_Chapter4_Food_Safety.md` | Sécurité alimentaire | Décret 17-140 art. 9 = HACCP mandatory at decree level. Primary production EXCLUDED. Cold-chain temps (4–5°C / -18°C) still [PRATIQUE] — no confirmed Algerian source yet. |
| `Inspection_Manual_Chapter5_Occupational_Health.md` | Santé au travail | Décret 91-05 = employer duty (noise, toxic gases, PPE, sanitary facilities). No dedicated Algerian in-plant noise-exposure decree found. 85 dB(A)/8h = [INTL] reference only. Décret 02-427 = correct citation for PPE training. |
| `Inspection_Manual_Chapter6_Documentation_Licensing.md` | Documentation & licensing | Décret 06-198 amended twice: Décret 22-167 (2022) + Décret 24-196 (2024). Active regularization grace period expires ~June 2027. Every citation to "06-198" must be treated as potentially outdated. Full Décret 07-144 facility-type mapping complete. |
| `Inspection_Manual_Chapter7_Air_Quality.md` | Qualité de l'air | Décret 06-138 primary PDF confirmed. Annex I: 16 parameters with new/old-facility values. Annex II: 7 sector-specific tables — none match SafeInspect facility types (all fall under Annex I by default). Art. 10: declaration obligation for non-classified emitters. Art. 11: self-monitoring register required. |
| `Inspection_Manual_Chapter8_Site_Hygiene_Pest_Control.md` | Hygiène des locaux | Smallest chapter — enrichment opportunity. |

---

## Criteria Files (src/criteria/)

21 facility-type files currently in code:

`abattoirCriteria.ts` · `bakeryCriteria.ts` · `baseCompressedGasCriteria.ts` · `baseFoodCriteria.ts` · `baseGeneralCriteria.ts` · `blacksmithCriteria.ts` · `carWashCriteria.ts` · `carpenteryCriteria.ts` · `coldRoomCriteria.ts` · `couvoirCriteria.ts` · `gplCriteria.ts` · `marbleCriteria.ts` · `mechanicCriteria.ts` · `paintShopCriteria.ts` · `printingCriteria.ts` · `produceStorageCriteria.ts` · `semiPharmaCriteria.ts` · `slaughterhouseSmallCriteria.ts` · `uabCriteria.ts` · `updCriteria.ts`

---

## ⚠️ CRITICAL KNOWN ERRORS (fix before anything else in affected files)

These are confirmed mis-citations verified independently multiple times. Do NOT work on any affected file without addressing these first.

### 1. Décret 04-409 mis-cited in 9+ places
**04-409 = transport of hazardous special waste.** It is currently mis-cited as the legal basis for unrelated technical requirements:
- **`gplCriteria.ts`** — 8 of 10 criteria. Correct citation: **Décret 21-430** (LPG/C installation licensing). ✅ Verified clean 2026-07-30.
- **`printingCriteria.ts`** — 1 criterion (SDS/chemical storage). Correct citation: **Loi 88-07**. ✅ Verified clean 2026-07-30.

### 2. Décret 09-410 mis-cited for emergency intervention plans
**09-410 = security-sensitive equipment.** Correct citation: **Décret 09-335**.  
✅ Verified clean in gplCriteria.ts (GPL-03-03 uses 09-335 correctly) 2026-07-30. Search entire codebase if any new file added.

### 3. Décret 06-198 / 22-167 / 24-196 version confusion
Any citation to "06-198" in the codebase may refer to the pre-amendment (pre-2022) text.  
- **22-167** = 2022 amendment — does NOT cover equipment maintenance (common mis-use, now fixed in UAB-AX6-01).
- **24-196** = 2024 amendment — created active regularization grace period ~June 2027.  
- Always specify which version applies and verify article numbers against the correct amendment.

### 4. Loi 19-02 ERP scope — half the facility library may not be covered
Loi 19-02 applies to **ERPs, high-rise buildings, residential buildings ONLY**.  
- **Out of scope (no public admission):** abattoir, couvoir, UPD, UAB, most produce storage/cold room.  
- **Plausibly in scope:** mechanic, car wash, retail-facing bakery/semiPharma, conditionally marble/paint/printing/GPL.  
Do not apply Loi 19-02 fire criteria to out-of-scope facilities without verifying ERP classification first.

---

## 3-Tier Strategic Plan

### 🔴 TIER 1 — Fix What's Provably Wrong

| Phase | File(s) | What | Source | Status |
|---|---|---|---|---|
| **A** | `paintShopCriteria.ts`, `marbleCriteria.ts`, `carpenteryCriteria.ts`, `printingCriteria.ts`, `blacksmithCriteria.ts` | Air emissions: dust ≤50 mg/Nm³ + VOC ≤150 mg/Nm³ per Décret 06-138 Annex I | Ch.7 §6 | ✅ **CLOSED 2026-07-30** |
| **B** | `uabCriteria.ts` | UAB-AX7-07: Remove Décret 93-120 as noise-limit source (93-120 = medical exams). 85 dB flagged [INTL]. | Ch.5 §6 | ✅ **CLOSED 2026-07-30** |
| **C** | `uabCriteria.ts` | UAB-AX6-01: Remove Décret 22-167 as equipment-maintenance basis (22-167 = licensing amendment). Replaced with Loi 03-10 + [À VÉRIFIER] flag. | Ch.6 §2 | ✅ **CLOSED 2026-07-30** |
| **D** | `gplCriteria.ts` | Replace all 8 Décret 04-409 mis-citations with Décret 21-430 | Handover §3 | ✅ **CLOSED 2026-07-30** — verified already clean |
| **E** | `printingCriteria.ts` | Replace 04-409 on SDS criterion with Loi 88-07 | Handover §3 | ✅ **CLOSED 2026-07-30** — verified already clean |
| **F** | Codebase-wide | Replace Décret 09-410 for emergency plans with 09-335 | Handover §3 | ✅ **CLOSED 2026-07-30** — verified clean in gplCriteria.ts |

**All Tier 1 phases closed. Tier 1 is DONE.**

---

### 🟡 TIER 2 — Systematic Chapter-by-Chapter Audit

For each chapter: read the manual Section 6 (reference values), read the live criteria file, find every gap or mismatch, implement.

**Priority order (impact + legal risk):**

| Priority | Chapter | Criteria files to audit | Key risk | Status |
|---|---|---|---|---|
| 1 | **Ch.1 Wastewater** | `abattoirCriteria.ts`, `uabCriteria.ts`, `carWashCriteria.ts`, `slaughterhouseSmallCriteria.ts` | Full 18-parameter Décret 06-141 table — BOD5 35, COD 120, MES 35, pH 6.5–8.5, oils 20 mg/l | ✅ **CLOSED 2026-07-30 (Phase J)** |
| 2 | **Ch.3 Fire Safety** | `baseGeneralCriteria.ts`, `gplCriteria.ts`, `paintShopCriteria.ts`, `bakeryCriteria.ts`, `mechanicCriteria.ts`, `carWashCriteria.ts` | Verify ERP classification before applying Loi 19-02. Art. 44 deadline expired July 2024. | 🔴 **NEXT — Phase K** |
| 3 | **Ch.6 Documentation** | All 21 files | Décret 06-198 + amendments. Grace period ~June 2027. Full 07-144 buffer-zone table by activity. | ⬜ Pending |
| 4 | **Ch.2 Solid Waste** | `baseGeneralCriteria.ts`, `abattoirCriteria.ts` | Add Décret 03-478 3-stream medical waste to abattoir/slaughterhouse | ⬜ Pending |
| 5 | **Ch.4 Food Safety** | `baseFoodCriteria.ts`, `bakeryCriteria.ts`, `coldRoomCriteria.ts`, `produceStorageCriteria.ts` | Décret 17-140 art. 9 HACCP mandatory. Primary production EXCLUDED. Cold-chain temps = [PRATIQUE] until confirmed. | ⬜ Pending |
| 6 | **Ch.5 Occupational Health** | `uabCriteria.ts`, `baseGeneralCriteria.ts` | Noise now tagged [INTL]. Décret 02-427 for PPE training. | ⬜ Pending |
| 7 | **Ch.7 Air Quality** | All 5 Phase A files + any with combustion/dust | Décret 06-138 art. 10 declaration obligation for non-classified emitters. | ⬜ Pending |
| 8 | **Ch.8 Site Hygiene** | `baseGeneralCriteria.ts` | Smallest chapter — enrichment | ⬜ Pending |

---

### 🔵 TIER 3 — Features the Manual Enables

Implement only after Tier 2 is stable.

| Feature | Manual Source | Value |
|---|---|---|
| In-app Legal Reference Panel (tappable "Show law" button) | Ch.1–8 §2 | Inspector credibility on-site |
| Contextual Inspector Hints per criterion | Ch.1–8 §8+§9 | Prevents missed findings |
| Cross-Domain Risk Flags in scoring | Ch.1–8 §11 | Legally defensible reports |
| Evidence Checklist per criterion | Ch.1–8 §7 | Prevents missing field evidence |
| Decision Reasoning Audit Trail | Ch.1–8 §10 | Legally defensible decisions |

---

## Recommended Execution Order

```
CURRENT SESSION  → Phase K: Tier 2 Ch.3 Fire Safety audit
                   Step 1: For each criteria file, determine ERP status
                   Step 2: For ERP-confirmed files, audit existing fire criteria against Loi 19-02
                   Step 3: For out-of-scope files, confirm exclusion and document it
                   Files: baseGeneralCriteria.ts, gplCriteria.ts, paintShopCriteria.ts,
                          bakeryCriteria.ts, mechanicCriteria.ts, carWashCriteria.ts

Then            → Phase I: 93-120 full codebase scan (classify every hit)
Then            → Tier 2 Ch.6 Documentation (all 21 files — largest scope)
Then            → Tier 2 Ch.2, 4, 5, 7, 8 in order
When stable     → Tier 3 features (start with Inspector Hints — fastest to ship)
```

---

## Agent Rules (for any AI agent picking this up)

### Source of Truth Order
1. **Current GitHub code** + actual app behavior = what EXISTS
2. **Verified Algerian legal/scientific sources** = what SHOULD exist
3. **`/docs/`** (8 manual chapters) = current project knowledge and decisions
4. **Old AI audits/reports/roadmaps** = historical context only — never blindly trust

### Pre-Implementation Checklist
- [ ] Read the affected source file in full before touching it
- [ ] Read the relevant manual chapter section before adding/changing a legal reference
- [ ] Never add a numeric limit without citing the exact article and annex
- [ ] Never cite Décret 22-167 for equipment maintenance (it does NOT cover this — UAB-AX6-01 fixed)
- [ ] Never cite Décret 04-409 for anything other than transport of hazardous special waste
- [ ] Never cite Décret 09-410 for emergency intervention plans (use 09-335)
- [ ] Never cite Décret 93-120 as a noise-limit source (it governs medical exams, not noise thresholds)
- [ ] Never apply Loi 19-02 fire criteria to non-ERP facility types without verification
- [ ] Never lower test coverage thresholds
- [ ] Run `jest` after every criteria file change
- [ ] **Update STRATEGIC_PLAN.md automatically at end of every session — no need to be told**

### Auto-update Rule for This Plan
After every implementation session, before ending:
1. Mark completed phases ✅ CLOSED with the date
2. Update Tier 2 status column if any audit was done
3. Move the "NEXT" / "CURRENT SESSION" label to the correct next priority
4. Add any new closed items to the Closed Items table
5. Commit with message: `docs: update STRATEGIC_PLAN.md — [what changed]`

### Legal Citation Tags (use in criteria text and comments)
- **[LOI]** = legally binding, Algerian source confirmed
- **[PRATIQUE]** = best practice, not legally mandated
- **[INTL]** = international guidance only, no Algerian equivalent found
- **[SILENCE]** = confirmed gap — topic not covered by any Algerian text found
- **[À VÉRIFIER]** = unverified — do not implement until confirmed

### Legal Quick-Reference (verified values)

| Domain | Decree | Key Value | Article/Annex |
|---|---|---|---|
| Air — dust | Décret 06-138 | ≤ 50 mg/Nm³ | Annex I general limit |
| Air — VOC | Décret 06-138 | ≤ 150 mg/Nm³ | Annex I general limit |
| Air — records retention | Décret 06-138 | ≥ 3 years | Art. 11 |
| Air — non-classified emitters | Décret 06-138 | Declaration obligation | Art. 10 |
| Wastewater — pH | Décret 06-141 | 6.5–8.5 | Annex I |
| Wastewater — MES | Décret 06-141 | ≤ 35 mg/L | Annex I |
| Wastewater — BOD5 | Décret 06-141 | ≤ 35 mg/L | Annex I |
| Wastewater — COD | Décret 06-141 | ≤ 120 mg/L | Annex I |
| Wastewater — oils/greases | Décret 06-141 | ≤ 20 mg/L | Annex I |
| Noise (occupational) | ⚠️ NO Algerian decree confirmed | 85 dB(A)/8h = [INTL] only | — |
| Noise (neighborhood) | Décret 93-184 | 35–45 dB(A) night | Ambient standard — NOT occupational |
| Décret 93-120 | Periodic medical exams | ⚠️ NOT a noise-limit decree | — |
| PPE training | Décret 02-427 | Employer obligation | — |
| Classified establishment licensing | Décret 06-198 + 22-167 + 24-196 | 4-category system | Active grace period ~June 2027 |
| Buffer zones by facility type | Décret 07-144 | Full table in Ch.6 | Annex |
| LPG/C installation licensing | Décret 21-430 | ⚠️ NOT Décret 04-409 | — |
| Emergency intervention plans | Décret 09-335 | ⚠️ NOT Décret 09-410 | — |
| HACCP mandate | Décret 17-140 | Art. 9 — excludes primary production | — |
| Medical/care waste streams | Décret 03-478 | 3-stream: green/yellow/red | — |
| Fire safety scope | Loi 19-02 | ERPs + high-rise + residential ONLY | Art. 44 deadline expired July 2024 |
| Equipment maintenance | ⚠️ No confirmed Algerian decree | Do NOT cite 22-167 for this | — |

---

## Closed Items (do not re-open)

| Item | Details | Closed |
|---|---|---|
| PNT-02-03 VOC value | Corrected 20 mg/Nm³ → 150 mg/Nm³ (Phases 7.1 + 11b + A) | Pre-2026-07-30 |
| PNT-07-01 | Dust criterion added to paintShopCriteria.ts | Phase A |
| PNT-07-02 | Records retention criterion added to paintShopCriteria.ts | Phase 11b |
| MRB-07-01/02 | Dust + records criteria added to marbleCriteria.ts | Phase A |
| CRP-07-01/02 | Dust + records criteria added to carpenteryCriteria.ts | Phase A |
| PRT-07-01/02/03 | VOC + dust + records criteria added to printingCriteria.ts | Phase A |
| BSM-07-01/02/03 | Dust + VOC + records criteria added to blacksmithCriteria.ts | Phase A |
| **Tier 1 Phase A** | All 5 air emissions files complete — Décret 06-138 Annex I | **2026-07-30 ✅** |
| **Tier 1 Phase B** | UAB-AX7-07: Décret 93-120 removed as noise-limit source. 85 dB tagged [INTL]. | **2026-07-30 ✅** |
| **Tier 1 Phase C** | UAB-AX6-01: Décret 22-167 removed as maintenance basis. Loi 03-10 + [À VÉRIFIER]. | **2026-07-30 ✅** |
| **Tier 1 Phase D** | gplCriteria.ts: verified clean — Décret 04-409 not present, all 21-430 citations correct. | **2026-07-30 ✅** |
| **Tier 1 Phase E** | printingCriteria.ts: verified clean — Décret 04-409 not present, Loi 88-07 used correctly. | **2026-07-30 ✅** |
| **Tier 1 Phase F** | gplCriteria.ts GPL-03-03: verified — Décret 09-335 used correctly for emergency plans. | **2026-07-30 ✅** |
| **Tier 2 Phase J / Ch.1 Wastewater** | All 4 files (carWash, abattoir, slaughterhouseSmall, uab) aligned with Décret 06-141 Annex I. BOD5 35, COD 120, MES 35, pH 6.5–8.5 confirmed/corrected. | **2026-07-30 ✅** |

---

*This plan is updated automatically by the agent at the end of every session. Commit format: `docs: update STRATEGIC_PLAN.md — [what changed]`*

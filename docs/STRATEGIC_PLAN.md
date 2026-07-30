# SafeInspect — Strategic Plan

> **Last updated:** 2026-07-30  
> **Updated by:** Perplexity Agent  
> **Status:** Live working document — update every time a phase closes or opens.

---

## What SafeInspect Is

A professional inspection platform for Algerian classified establishments (مؤسسات مصنفة).  
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

## The Knowledge Asset: `/docs/manual/`

Eight verified chapters (~158 KB total) covering every inspection domain.  
Each chapter follows an identical 11-section structure:

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

| File | Domain | Critical Values |
|---|---|---|
| `ch1_wastewater.md` | Rejets liquides | 18-parameter Décret 06-141 table (BOD5, COD, metals, pH) |
| `ch2_solid_waste.md` | Déchets solides | Décret 06-104 waste classification |
| `ch3_fire_safety.md` | Sécurité incendie | Largest chapter — rich inspector guidance |
| `ch4_food_safety.md` | Sécurité alimentaire | Temperature ranges per product type |
| `ch5_occupational_health.md` | Santé au travail | Noise: Décret 93-120 — verified values only, no [INTL] |
| `ch6_documentation.md` | Documentation & licensing | Décret 07-144 buffer-zone table by activity |
| `ch7_air_quality.md` | Qualité de l'air | Décret 06-138 Annex I: dust ≤50 mg/Nm³, VOC ≤150 mg/Nm³ |
| `ch8_site_hygiene.md` | Hygiène des locaux | Smallest chapter — enrichment opportunity |

---

## Criteria Files (src/criteria/)

21 facility-type files currently in code:

`abattoirCriteria.ts` · `bakeryCriteria.ts` · `baseCompressedGasCriteria.ts` · `baseFoodCriteria.ts` · `baseGeneralCriteria.ts` · `blacksmithCriteria.ts` · `carWashCriteria.ts` · `carpenteryCriteria.ts` · `coldRoomCriteria.ts` · `couvoirCriteria.ts` · `gplCriteria.ts` · `marbleCriteria.ts` · `mechanicCriteria.ts` · `paintShopCriteria.ts` · `printingCriteria.ts` · `produceStorageCriteria.ts` · `semiPharmaCriteria.ts` · `slaughterhouseSmallCriteria.ts` · `uabCriteria.ts` · `updCriteria.ts`

---

## 3-Tier Strategic Plan

### 🔴 TIER 1 — Fix What's Provably Wrong

Concrete, specced, ready to implement. Each has a verified correct value from the manual.

| Phase | File(s) | What | Manual Source | Status |
|---|---|---|---|---|
| **A** | `paintShopCriteria.ts`, `marbleCriteria.ts`, `carpenteryCriteria.ts`, `printingCriteria.ts`, `blacksmithCriteria.ts` | Add/verify 5 missing air emissions criteria: dust ≤50 mg/Nm³ + VOC ≤150 mg/Nm³ per Décret 06-138 Annex I | Ch.7 §6 | 🟡 In Progress — paint shop done, others pending |
| **B** | `uabCriteria.ts` | Fix UAB-AX7-07 noise citation — 85 dB(A) has no Algerian legal basis, must NOT cite Décret 93-120 unless verified | Ch.5 §6 | ⬜ Pending |
| **C** | `uabCriteria.ts` | Fix UAB-AX6-01 — revert from wrong Décret 22-167 back to Décret 06-198 art. 13 | Ch.6 §2 | ⬜ Pending |

---

### 🟡 TIER 2 — Systematic Chapter-by-Chapter Audit

For each chapter: read the manual Section 6 (reference values), read the live criteria file, find every gap or mismatch, implement.

**Priority order (impact + legal risk):**

| Priority | Chapter | Criteria files to audit | Status |
|---|---|---|---|
| 1 | **Ch.1 Wastewater** | `abattoirCriteria.ts`, `uabCriteria.ts`, `carWashCriteria.ts`, `slaughterhouseSmallCriteria.ts` | ⬜ Pending |
| 2 | **Ch.3 Fire Safety** | `baseGeneralCriteria.ts`, `gplCriteria.ts`, `paintShopCriteria.ts` | ⬜ Pending |
| 3 | **Ch.6 Documentation** | All 21 files (licensing + buffer zones apply everywhere) | ⬜ Pending |
| 4 | **Ch.2 Solid Waste** | `baseGeneralCriteria.ts`, `abattoirCriteria.ts` | ⬜ Pending |
| 5 | **Ch.4 Food Safety** | `baseFoodCriteria.ts`, `bakeryCriteria.ts`, `coldRoomCriteria.ts`, `produceStorageCriteria.ts` | ⬜ Pending |
| 6 | **Ch.5 Occupational Health** | `uabCriteria.ts`, `baseGeneralCriteria.ts` | ⬜ Pending |
| 7 | **Ch.7 Air Quality** | After Tier 1 Phase A closes | ⬜ Pending |
| 8 | **Ch.8 Site Hygiene** | `baseGeneralCriteria.ts` | ⬜ Pending |

---

### 🔵 TIER 3 — Features the Manual Enables

Implement only after Tier 2 is complete. Each feature is directly enabled by a specific manual section.

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
Session 1 (current) → Tier 1 Phase A: air emissions criteria in marble, carpentry, printing, blacksmith
Session 2           → Tier 1 Phases B+C: fix 2 citation errors in uabCriteria.ts
Session 3           → Tier 2 Ch.1: full wastewater audit (18-parameter table)
Session 4           → Tier 2 Ch.3: fire safety audit (largest chapter)
Session 5+          → Tier 2 Ch.6, 2, 4, 5, 7, 8 in order
When stable         → Tier 3 features (start with Inspector Hints — fastest to ship)
```

---

## Agent Rules (for any AI agent picking this up)

### Source of Truth Order
1. **Current GitHub code** + actual app behavior = what EXISTS
2. **Verified Algerian legal/scientific sources** = what SHOULD exist
3. **`/docs/manual/`** = current project knowledge and decisions
4. **Old AI audits/reports/roadmaps** = historical context only — never blindly trust

### Pre-Implementation Checklist
- [ ] Read the affected source file in full before touching it
- [ ] Read the relevant manual chapter section before adding/changing a legal reference
- [ ] Never add a numeric limit without citing the exact article and annex
- [ ] Never cite Décret 22-167 for equipment maintenance (it does NOT cover this)
- [ ] Never lower test coverage thresholds
- [ ] Run `jest` after every criteria file change
- [ ] Update this file when a phase status changes

### Legal Citation Rules
- **LEGALLY MANDATORY** = cite the exact Algerian decree + article + annex
- **TECHNICAL RECOMMENDATION** = flag explicitly, never present as law
- **International standard with no Algerian equivalent** = cite as `[INTL]` with disclaimer
- **Unknown / unverified** = flag as `[À VÉRIFIER]`, never invent

### Legal Quick-Reference (verified values)

| Domain | Decree | Key Value | Article/Annex |
|---|---|---|---|
| Air — dust | Décret 06-138 | ≤ 50 mg/Nm³ | Annex I general limit |
| Air — VOC | Décret 06-138 | ≤ 150 mg/Nm³ | Annex I general limit |
| Air — records retention | Décret 06-138 | ≥ 3 years | Art. 11 |
| Wastewater — pH | Décret 06-141 | 6.5–8.5 | Annex I |
| Wastewater — BOD5 | Décret 06-141 | ≤ 40 mg/L | Annex I |
| Wastewater — COD | Décret 06-141 | ≤ 120 mg/L | Annex I |
| Noise | Décret 93-120 | ⚠️ verify exact article before citing | — |
| Classified establishment licensing | Décret 07-144 | Buffer zones by activity class | Annex |
| Equipment maintenance | ⚠️ NOT Décret 22-167 | No Algerian decree confirmed for general equip. maintenance | — |

---

## Closed Items (do not re-open)

- PNT-02-03 VOC value corrected: 20 mg/Nm³ → 150 mg/Nm³ (Phases 7.1 + 11b + A)
- PNT-07-01 dust criterion added to paintShopCriteria.ts (Phase A)
- PNT-07-02 records retention criterion added to paintShopCriteria.ts (Phase 11b)
- UAB-AX6-01 Décret 22-167 issue — flagged, Phase C pending fix
- UAB-AX7-07 noise citation issue — flagged, Phase B pending fix

---

*Update this file at the end of every session. Commit message format: `docs: update STRATEGIC_PLAN.md — [what changed]`*

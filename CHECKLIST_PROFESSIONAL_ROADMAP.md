# SafeInspect — Professional Checklist Roadmap

> **Single source of truth for all checklist improvements.**  
> Grounded in: Inspection Manual Chapters 1–4 (Wastewater, Solid/Hazardous Waste, Fire Safety, Food Safety) + Audit Sessions 2–9.  
> More chapters are incoming — this document will be updated as each new chapter is uploaded.

---

## Current State

| Metric | Value |
|---|---|
| Overall checklist maturity score | **53 / 100** |
| Total criteria in library | ~350 |
| Confirmed duplicate criteria to remove | **60+** |
| Confirmed legal mis-citations | **3 (+ 1 flagged for verification)** |
| Sessions completed | **9 / 9 audit sessions done** |
| Inspection Manual chapters digested | **4 / 4 uploaded (Ch. 1–4)** |
| Inspection Manual chapters pending | **Ch. 5+ (not yet uploaded)** |

---

## Sessions Status

All 9 audit sessions are **complete**. No remaining session work.

| Session | Category | Maturity | Key finding |
|---|---|---|---|
| S2 | Wastewater & Liquid Discharge | 52/100 | No numeric thresholds anywhere; two permit regimes conflated; UAB-only permit+lab chain |
| S3 | Solid & Hazardous Waste | 48/100 | Décret 04-409 mis-cited 9×; zero medical/veterinary waste coverage; zero incineration-ban criterion |
| S4 | Fire Safety & Hazardous Substances | 44/100 | Décret 09-410 mis-cited 2×; zero electrical-safety criterion; zero alarm/detection criterion |
| S5 | Food Safety & Hygiene | 58/100 | BFD-05-01 cites non-existent "2020 HACCP order"; HACCP scope wrong (UPD included, should be excluded) |
| S6 | Occupational Health & Worker Protection | 55/100 | Noise PPE required with nothing measured; blacksmith missing machine-guard criterion |
| S7 | Documentation & Licensing | 61/100 | Universal double-licensing duplication; anti-obstruction criterion in 1 of 18 facility types |
| S8 | Air Quality & Atmospheric Emissions | 50/100 | Equipment-only checks in 5 facility types; no measurement criterion outside UAB |
| S9 | Site Hygiene, Pest Control & General Premises | 57/100 | Pest control stacked 4 layers deep; couvoir = 10 pest items, UPD = 12 |

---

## Implementation Phases

### Phase 1 — Legal Citations (High consequence, low effort) `PRIORITY`

Fix before any other code work. A mis-cited decree fails legal review regardless of content quality.

| # | File | Criterion | Wrong citation | Correct citation | Manual ref |
|---|---|---|---|---|---|
| 1.1 | `src/criteria/foodCriteria.ts` (baseFoodCriteria) | `BFD-05-01` — HACCP plan | "Arrêté interministériel 2020" (does not exist) | **Décret exécutif n° 17-140** + **Arrêté interministériel 4 octobre 2016** (microbiological criteria) | Ch.4 §2 |
| 1.2 | `src/criteria/gplCriteria.ts` (8 criteria) | GPL criteria | Décret 04-409 (hazardous waste transport) | **Décret exécutif n° 21-430** (LPG/C installation accreditation) | Ch.3 §2; S3/S4 |
| 1.3 | `src/criteria/printingCriteria.ts` | `PRT-03-03` — SDS/chemical safety | Décret 04-409 | Appropriate chemical-storage/workplace-safety basis (Décret 91-05 + Loi 88-07) | S3 |
| 1.4 | `src/criteria/gplCriteria.ts` | `GPL-03-03` — emergency plan | Décret 09-410 (security-sensitive equipment — unrelated) | **Décret exécutif n° 09-335** (internal industrial intervention plans) | Ch.3 §2; S4 |
| 1.5 | `src/criteria/uabCriteria.ts` | `UAB-AX1-04` — emergency plan | Décret 09-410 | **Décret exécutif n° 09-335** | Ch.3 §2; S4 |
| 1.6 | `src/criteria/uabCriteria.ts` | `UAB-AX5-02`/`01-09` — emissions benchmark | Décret 06-02 (ambient air quality) | Verify against Décret 06-138 full text — if 06-138 doesn't incorporate 06-02 by reference, remove 06-02 citation | Ch.3; S8 |

---

### Phase 2 — Remove Legacy Duplicates (Mechanical, zero content loss) `PRIORITY`

Removing these ~60+ criteria shrinks each affected inspection to the correct item count and eliminates the silent double-weighting of findings in scores.

#### 2.1 Full legacy numeric series to remove

| File | IDs to remove | Replaced by |
|---|---|---|
| `abattoirCriteria.ts` | `04-01, 04-03–04-11` | `ABT-AX*` series |
| `uabCriteria.ts` | `01-01, 01-02, 01-05–01-12` | `UAB-AX*` series |
| `couvoirCriteria.ts` | `02-01, 02-02, 02-03, 02-04, 02-06, 02-09, 02-10, 02-11` | `COU-AX*` series |
| `updCriteria.ts` | `03-01, 03-02, 03-03–03-10` | `UPD-AX*` series |

#### 2.2 Facility-specific restatements of shared modules to remove

| File | IDs to remove | Reason |
|---|---|---|
| `bakeryCriteria.ts` | `BAK-10-07, BAK-10-08 (partial), BAK-10-09` | Restates `baseFoodCriteria` |
| `coldRoomCriteria.ts` | `CLD-17-02–CLD-17-05` | Restates `baseFoodCriteria` cold-chain content |
| `baseFoodCriteria.ts` | `BFD-07-01, BFD-07-02` | Superseded once pest module is consolidated into `BGN-07-*` (Phase 4) |
| 11 facility-specific operating-license criteria | (one per facility type) | Restate `BGN-01-01` — see S7 for full ID list |

#### 2.3 `criteriaData.ts` — remove `baseFoodCriteria` spread from non-food checklists

`...baseFoodCriteria` is still spread into `uabChecklist`, `abattoirChecklist`, `couvoirChecklist`, and `updChecklist`. This was documented as removed in a prior audit report but was **not shipped**. Remove it.

---

### Phase 3 — Food Safety Fixes (Inspection Manual Chapter 4) `HIGH VALUE`

Directly grounded in **Inspection Manual Chapter 4 — Food Safety**.

| # | Action | Criterion(s) | Details | Legal basis |
|---|---|---|---|---|
| 3.1 | **Fix HACCP scope** | `BFD-05-01` | Remove UPD from HACCP scope — Décret 17-140 **explicitly excludes primary production** (livestock rearing). HACCP applies to: abattoir, slaughterhouse, cold room, bakery. | Décret 17-140 art. scope |
| 3.2 | **Extend HACCP requirement** | New: `ABT-AX10-01`, `SLH-AX10-01`, `CLD-AX10-01` | Add HACCP-plan criterion to abattoir, slaughterhouse, cold room — currently bakery-only, which is the **lower-risk** of the group. | Décret 17-140 |
| 3.3 | **Fix BFD-05-01 citation** | `BFD-05-01` | Replace invented "Arrêté 2020" with confirmed instruments: Décret 17-140 + Arrêté interministériel 4 octobre 2016. | Ch.4 §2 |
| 3.4 | **Add traceability criterion** | New: `BFD-08-01` in baseFoodCriteria | Traceability currently exists in only 2 of 8 food-adjacent facility types. Add to shared food baseline. | Loi 09-03, Décret 17-140 |
| 3.5 | **Verify cold-chain temperature values** | `BFD-04-01`, `BFD-04-02`, `CLD-*` cold-chain criteria | 0–5°C chilled / ≤−18°C frozen currently tagged [PRATIQUE]. Verify against Décret 17-140 arts. 7/8/9 and Arrêté 7 mai 2025. Upgrade to [LOI] or adjust value. | Ch.4 §6 |
| 3.6 | **Add healthcare/veterinary waste criteria** (abattoir & slaughterhouse) | New: `ABT-AX10-02`, `SLH-07-01` | Décret 03-478 three-stream system (green/yellow/red) has **zero coverage** in current checklist. Abattoirs/slaughterhouses with veterinary components generate infectious sharps waste. | Ch.2; Décret 03-478 |

---

### Phase 4 — Wastewater Numeric Thresholds (Inspection Manual Chapter 1) `HIGH VALUE`

Grounded in **Inspection Manual Chapter 1 — Wastewater**, Décret exécutif n° 06-141.

| # | Action | Criterion(s) | Details |
|---|---|---|---|
| 4.1 | **Upgrade discharge criteria to `numericField`** | `ABT-AX4-01`, `SLH-05-04`, `UAB-AX3-01`, `MRB-03-01`, `CWS-03-01` | Add numeric threshold fields: pH 6.5–8.5, BOD₅ ≤35 mg/l, MES ≤35 mg/l, Oils & Greases ≤10 mg/l, Temperature ≤30°C. Use the `numericField` schema already proven in `baseFoodCriteria`. | Décret 06-141 annex |
| 4.2 | **Split conflated permit criterion** | `UAB-AX3-02` | Currently conflates two different regimes. Split into: (a) Sewer-network discharge permit — **Décret 09-209**; (b) Natural-environment discharge permit — **Loi 05-12 art. 45/47 + Direction des Ressources en Eau**. | Ch.1 §2; S2 |
| 4.3 | **Extend permit+lab chain beyond UAB** | New criteria for car wash, mechanic, marble workshop | Any high-volume discharger owes the same Décret 06-141 obligations as UAB. Volume/load threshold triggers the chain. | Ch.1; S2 |
| 4.4 | **Add septic-pit pumping-frequency check** | `ABT-AX4-04`, `BGN-03-06` | Contract existence ≠ adequate pumping frequency. Add a criterion requiring documented pumping log proportional to slaughter/operational volume. | S2 |

---

### Phase 5 — Solid & Hazardous Waste Fixes (Inspection Manual Chapter 2) `HIGH VALUE`

Grounded in **Inspection Manual Chapter 2 — Solid & Hazardous Waste**.

| # | Action | Criterion(s) | Details | Legal basis |
|---|---|---|---|---|
| 5.1 | **Add waste transfer manifest criterion** | New: `BGN-04-05` | Contract with a licensed waste hauler exists ≠ waste was actually picked up. Require a dated waste transfer manifest/receipt. | Décret 02-372 |
| 5.2 | **Add on-site incineration ban** | New: `BGN-04-06` | Currently zero coverage outside one carpentry criterion. Apply to general baseline. | Loi 01-19 art. 28 |
| 5.3 | **Add waste inventory/classification criterion** | New: `BGN-04-07` | Extend UAB's waste-inventory model to mechanic, paint shop, printing, abattoir, marble, blacksmith. | Décret 02-372 |
| 5.4 | **Confirm Décret 04-409 removal** (Phase 1 follow-up) | All 9 criteria | After Phase 1 citation fixes, verify no remaining 04-409 references anywhere in `src/criteria/`. | Ch.2 §2; S3 |

---

### Phase 6 — Fire Safety Fixes (Inspection Manual Chapter 3) `HIGH VALUE`

Grounded in **Inspection Manual Chapter 3 — Fire Safety**, Loi 19-02, Décret 09-335.

| # | Action | Criterion(s) | Details | Legal basis |
|---|---|---|---|---|
| 6.1 | **Add electrical-safety criterion** | New: `BGN-05-05` | Zero coverage anywhere in ~350-item library. Electrical faults are the most common fire-ignition source. Criterion: panel condition, exposed wiring, grounding. | Loi 19-02 general framework; Décret 91-05 |
| 6.2 | **Add fire-alarm/smoke-detection criterion** | New: `BGN-05-06` | Zero coverage anywhere in the library. | Loi 19-02 |
| 6.3 | **Add extinguisher service-tag date check** | Update all extinguisher criteria | Currently only presence is checked, never service currency. Add check: service tag present and dated within the last 12 months. | Loi 19-02; [INTL] annual service standard |
| 6.4 | **Add wilaya operating-user authorization** | New documentation criterion per facility type | Loi 19-02 creates a **second, distinct license** (wilaya-level, via the wilaya committee) separate from the Décret 06-198 classified-establishment license. Currently only one is checked. | Loi 19-02 §wilaya committee |
| 6.5 | **Split extinguisher+housekeeping bundled criteria** | Various (see S4 for full list) | Bundled pass/fail items make it impossible to know which condition failed. Split each into its own criterion. | Ch.3 §8 |

---

### Phase 7 — Air Quality Measurement Extension (Session 8) `MEDIUM`

| # | Action | Criterion(s) | Details | Legal basis |
|---|---|---|---|---|
| 7.1 | **Add periodic emissions measurement criterion** | New `BLS-AX02-03`, `CAR-AX02-03`, `MRB-AX02-03`, `PNT-AX02-03`, `PRT-AX02-03` | Modeled on `UAB-AX5-02`. Currently 5 facility types stop at equipment-presence; none ever measure whether the air meets the actual limit. Use `numericField` schema. | Décret 06-138 |
| 7.2 | **Resolve Décret 06-02 vs 06-138 benchmark** | `UAB-AX5-02`, `01-09` | Verify full text of both decrees. If 06-138 doesn't cross-reference 06-02, remove the ambient-standard citation and use 06-138 alone. | Ch.3; S8 |
| 7.3 | **Add buffer-distance numeric minimum** | `03-02` (UPD) | Replace "proportional to risk" with an actual minimum-distance table tied to facility risk category. | Décret 06-198 classification tiers |

---

### Phase 8 — Pest Control Consolidation (Session 9) `MEDIUM`

| # | Action | Details |
|---|---|---|
| 8.1 | **Consolidate to one pest module** | Keep `BGN-07-01…05` as sole surviving general pest module. Adopt `COU-AX8-02`'s trap-map/intervention-log evidence standard as the universal default. |
| 8.2 | **Remove facility-specific duplicates** | `04-10` (abattoir), `BAK-10-09` (bakery), `COU-AX8-01`/`AX8-02`/`02-11` (couvoir — keep one), `PRD-04-01`/`02` (produce storage), `SLH-05-10` (slaughterhouse), `UPD-AX8-01`/`02`/`03-06`/`03-10` (UPD). |
| 8.3 | **Keep UPD wild-bird exclusion** | `UPD-AX8-03` is a genuinely distinct biosecurity criterion for poultry. Do NOT merge it away. |
| 8.4 | **Add insect-screen criterion as food-specific add-on** | Retain from `BFD-07-01` as a food-facility-only addition on top of the consolidated module, not universal. |

---

### Phase 9 — Occupational Health (Session 6) `MEDIUM`

| # | Action | Criterion(s) | Details | Legal basis |
|---|---|---|---|---|
| 9.1 | **Add noise exposure measurement** | New: various noisy facility types | Ear-protection required with nothing measured to justify it — extend UAB's noise-measurement model. | Décret 91-176 |
| 9.2 | **Add machine-guard criterion for blacksmith** | New: `BLS-AX06-01` | Every comparable workshop type (carpentry, marble, printing) has a machine-guard criterion; blacksmith doesn't. | Loi 88-07; Décret 91-05 |

---

### Phase 10 — Documentation Fixes (Session 7) `MEDIUM`

| # | Action | Criterion(s) | Details |
|---|---|---|---|
| 10.1 | **Add anti-obstruction criterion universally** | New in `baseGeneralCriteria` | Currently only 1 of 18 facility types has this criterion. It protects the inspection system itself. |
| 10.2 | **Extend impact-category-triggered EIA** | New criteria for applicable facility types | The legal trigger for an Environmental Impact Study is the facility's classification category under Décret 06-198, not the facility type. Extend beyond UAB. |

---

## Structural Architecture Change (Cross-phase)

The single most impactful change across all phases is moving from the current flat per-facility structure to a **three-tier model**:

```
Tier 1: Universal baseline (baseGeneralCriteria) — applies to all 18 facility types
Tier 2: Activity-specific layer — per facility type, unique content only
Tier 3: UAB-style measured/high-risk tier — triggered by risk level or volume threshold,
         not hard-coded to UAB alone
```

This resolves: the duplication problem (Tier 1 is defined once), the "equipment-only" measurement gap (Tier 3 mandates measurement), and the UAB-exclusivity problem — all at once.

---

## Inspection Manual Chapters — Integration Status

| Chapter | Topic | Uploaded | Digested | Phases driven |
|---|---|---|---|---|
| Chapter 1 | Wastewater & Liquid Discharge | ✅ | ✅ | Phase 4 |
| Chapter 2 | Solid & Hazardous Waste | ✅ | ✅ | Phase 5 |
| Chapter 3 | Fire Safety & Hazardous Substances | ✅ | ✅ | Phase 6 |
| Chapter 4 | Food Safety & Hygiene | ✅ | ✅ | Phase 3 |
| Chapter 5+ | (pending upload) | ⏳ | ⏳ | Will extend relevant phases |

> **When new chapters arrive:** read the chapter, identify new legal instruments and coverage gaps, and add items to the relevant phase above (or create a new phase if the category is new). Do not create a new separate roadmap file.

---

## Implementation Order (Recommended)

1. **Phase 1** — Fix legal citations (30 min, highest legal risk)
2. **Phase 2** — Remove legacy duplicates (mechanical, ~60 items, no logic change)
3. **Phase 3** — Food safety fixes (highest maturity score gain per effort)
4. **Phase 4** — Wastewater numeric thresholds (reuses existing `numericField` schema)
5. **Phase 5** — Solid/hazardous waste additions
6. **Phase 6** — Fire safety additions (new criteria, highest life-safety stakes)
7. **Phase 7** — Air quality measurement extension
8. **Phase 8** — Pest control consolidation
9. **Phases 9–10** — Occupational health + documentation

---

## What Is NOT Changing

- **Scoring engine** (`src/utils/scoringUtils.ts`) — verified correct and fully wired. Do not touch.
- **`numericField` schema** — already proven in `baseFoodCriteria`. Reuse it, don't rebuild it.
- **UAB's existing AX-series criteria** — these are the best-designed content in the library. Preserve and promote as the model.
- **`BGN-07-01…05` pest module** — technically correct. Consolidate around it, don't replace it.
- **Décret 06-198 citations** — the most precisely cited instrument in the whole codebase. Leave as-is.

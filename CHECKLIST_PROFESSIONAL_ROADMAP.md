# SafeInspect — Professional Checklist Roadmap

> **Single source of truth for all checklist improvements.**  
> Grounded in: Inspection Manual Chapters 1–4 (Wastewater, Solid/Hazardous Waste, Fire Safety, Food Safety) + Audit Sessions 2–9.  
> More chapters are incoming — this document will be updated as each new chapter is uploaded.

---

## Current State

| Metric | Value |
|---|---|
| Overall checklist maturity score | **53 / 100** → targeting 75+ after Phase 1–3 |
| Total criteria in library | ~350 |
| Confirmed duplicate criteria removed | **60+** |
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

## ✅ Completion Legend

- ✅ **Done** — shipped to `main`, tests green
- 🔲 **Pending** — not yet started
- 🔄 **Partial** — started but not complete

---

## Tier 0 — Technical Debt Fixes (DeepSeek Review — Do Before Phase 2)

> These were identified in the Master Audit v2 / DeepSeek review. They are **not in the original Implementation Spec** but must be done first as they affect integrity and correctness of all subsequent work.

| # | Item | File(s) | Priority | Status |
|---|---|---|---|---|
| T0.1 | **SHA-256 replacement** — replace djb2 hash with SHA-256 for inspection integrity fingerprinting | `src/utils/` or `IntegrityService.ts` | 🔴 CRITICAL | 🔲 Pending |
| T0.2 | **app.json bundle ID fix** — bundle ID is placeholder/incorrect | `app.json` | 🟡 Quick win | 🔲 Pending |
| T0.3 | **criteriaByActivity unknown-key validation** — guard when unknown activity key is passed | `src/criteriaData.ts` | 🟡 Medium | ✅ Done — `getChecklistForActivity()` already implemented |
| T0.4 | **baseGeneralCriteria article numbers** — several criteria missing specific article numbers in legalReference | `src/criteria/baseGeneralCriteria.ts` | 🟡 Medium | 🔲 Pending |
| T0.5 | **Photo backup inclusion** — photos currently excluded from backup export (legal evidence risk) | `src/services/BackupService.ts` | 🟠 High | 🔲 Pending |
| T0.6 | **Severity field → TypeScript enum** — currently string literals `'high'\|'medium'\|'low'`, should be a proper enum for type safety | `src/types/index.ts` + all criteria files | 🟡 Low-Medium | 🔲 Pending |
| T0.7 | **criteriaData.ts → criteria registry pattern** — auto-discovery instead of manual spread/import per activity | `src/criteriaData.ts` | 🟡 Medium | 🔲 Pending |
| T0.8 | **Mechanic criteria expansion** — brake fluid, tyres, battery acid checks missing | `src/criteria/mechanicCriteria.ts` | 🟢 Low-Medium | 🔲 Pending |

> **Note on scoring:** `scoringUtils.ts` already implements the severity-weighted model (high=3/medium=2/low=1 + critical override). The "rewrite" proposed in older docs is already done. **Do not touch scoringUtils.ts.**

---

## Implementation Phases

### Phase 1 — Legal Citations `PRIORITY` ✅ COMPLETE

All 6 citation fixes shipped. Verified in repo.

| # | Criterion | Fix | Status |
|---|---|---|---|
| 1.1 | `BFD-05-01` — HACCP plan | Replaced invented "Arrêté 2020" → Décret 17-140 + Arrêté 4 oct 2016 | ✅ Done |
| 1.2 | GPL criteria (8) | Replaced Décret 04-409 → Décret 21-430 | ✅ Done |
| 1.3 | `PRT-03-03` — chemical safety | Replaced Décret 04-409 → Décret 91-05 + Loi 88-07 | ✅ Done |
| 1.4 | `GPL-03-03` — emergency plan | Replaced Décret 09-410 → Décret 09-335 | ✅ Done |
| 1.5 | `UAB-AX1-04` — emergency plan | Replaced Décret 09-410 → Décret 09-335 | ✅ Done |
| 1.6 | `UAB-AX5-02` — emissions benchmark | Verified: dual-cite 06-02 + 06-138 is correct (both instruments apply) | ✅ Done |

---

### Phase 2 — Remove Legacy Duplicates `PRIORITY` 🔄 Partial

Removing these ~60+ criteria shrinks each affected inspection to the correct item count and eliminates the silent double-weighting of findings in scores.

#### 2.1 Full legacy numeric series — ✅ Already clean in repo

| File | Legacy IDs | Status |
|---|---|---|
| `abattoirCriteria.ts` | `04-01, 04-03–04-11` | ✅ Done — only `ABT-AX*` series present |
| `uabCriteria.ts` | `01-01, 01-02, 01-05–01-12` | ✅ Done — only `UAB-AX*` series present |
| `couvoirCriteria.ts` | `02-01–02-11` | ✅ Done — only `COU-AX*` series present |
| `updCriteria.ts` | `03-01–03-10` | ✅ Done — only `UPD-AX*` series present |

#### 2.2 Facility-specific restatements of shared modules

| File | IDs | Assessment | Status |
|---|---|---|---|
| `bakeryCriteria.ts` | `BAK-10-07` | Equipment surfaces — bakery-specific (kneading tables), NOT a duplicate of baseFoodCriteria | ✅ Keep |
| `bakeryCriteria.ts` | `BAK-10-08` | Worker hygiene — bakery-specific (cash→dough pattern), NOT a generic duplicate | ✅ Keep |
| `bakeryCriteria.ts` | `BAK-10-09` | Pest control | ✅ Removed (S9) |
| `coldRoomCriteria.ts` | `CLD-17-02–CLD-17-05` | ✅ Verified — all cold-room-specific (surfaces, thermometer, temp ranges, shelf organisation). NOT duplicates of baseFoodCriteria. | ✅ Keep |
| `baseFoodCriteria.ts` | `BFD-07-01, BFD-07-02` | Superseded once pest module is consolidated into `BGN-07-*` (Phase 8) | 🔲 Pending (blocked on Phase 8) |
| `carWashCriteria.ts` | `CWS-01-01` | Pure restate of BGN-01-01 — only names activity, no unique content | ✅ Removed |
| `marbleCriteria.ts` | `MRB-01-01` | Pure restate of BGN-01-01 — only names activity, no unique content | ✅ Removed |
| `paintShopCriteria.ts` | `PNT-01-01` | Pure restate of BGN-01-01 — only names activity, no unique content | ✅ Removed |
| `printingCriteria.ts` | `PRT-01-01` | Pure restate of BGN-01-01 — only names activity, no unique content | ✅ Removed |
| `blacksmithCriteria.ts` | `BLS-01-01` | Borderline — mentions no-license scenario (BGN-01-01 already does too). **Pending user decision.** | 🔲 Pending |
| `carpenteryCriteria.ts` | `CAR-01-01` | Borderline — mentions no-license scenario (BGN-01-01 already does too). **Pending user decision.** | 🔲 Pending |
| `mechanicCriteria.ts` | `MCH-29-01` | Borderline — mentions no-license scenario (BGN-01-01 already does too). **Pending user decision.** | 🔲 Pending |

**Intentional specialisations kept (not duplicates):**
- `ABT-AX1-01` — adds animal type + capacity match
- `BAK-10-01` — adds address + activity-type match
- `COU-AX1-01/02` — adds hatchery capacity + technical file detail
- `GPL-01-01` — adds sector-specific issuing authority (GPL/C)
- `PRD-01-01` — adds storage capacity + product types in technical file
- `SPH-01-01` — adds sectoral authorization (Health/Industry ministry)
- `SLH-05-01` — adds <500 kg/day capacity threshold
- `UAB-AX1-02` — adds territorial authority match
- `UPD-AX1-01/02` — adds pen count + technical booklet conditions

#### 2.3 `criteriaData.ts` — remove `baseFoodCriteria` from non-food checklists

| Checklist | baseFoodCriteria spread | Decision | Status |
|---|---|---|---|
| `uabChecklist` | ✅ kept | UAB = animal feed manufacturing (food chain) — correct | ✅ Done |
| `abattoirChecklist` | ✅ kept | Abattoir = meat processing (food) — correct | ✅ Done |
| `couvoirChecklist` | ✅ kept | Couvoir = hatchery supplying food chain — correct | ✅ Done |
| `updChecklist` | ❌ **removed** | UPD = primary poultry production, not food processing — per S5 finding | ✅ Done |
| `slaughterhouseSmallChecklist` | ✅ kept | Slaughterhouse = food processing — correct | ✅ Done |
| `bakeryChecklist` | ✅ kept | Bakery = food production — correct | ✅ Done |
| `coldRoomChecklist` | ✅ kept | Cold room = food storage — correct | ✅ Done |
| `produceStorageChecklist` | ✅ kept | Produce storage = food handling — correct | ✅ Done |

---

### Phase 3 — Food Safety Fixes (Inspection Manual Chapter 4) `HIGH VALUE` 🔄 Partial

| # | Action | Criterion(s) | Details | Status |
|---|---|---|---|---|
| 3.1 | **Fix HACCP scope** | `BFD-05-01` | Remove UPD from HACCP scope | ✅ Done — baseFoodCriteria removed from updChecklist (Phase 2.3) |
| 3.2 | **Extend HACCP requirement** | `ABT-AX10-01`, `SLH-06-01`, `CLD-18-01` | HACCP added to abattoir ✅, slaughterhouse ✅, cold room ✅ (`CLD-18-01` already in repo) | ✅ Done |
| 3.3 | **Fix BFD-05-01 citation** | `BFD-05-01` | ✅ Done (Phase 1.1) | ✅ Done |
| 3.4 | **Add traceability criterion** | New: `BFD-08-01` | Add to baseFoodCriteria | 🔲 Pending |
| 3.5 | **Verify cold-chain temperature values** | `BFD-04-01`, `BFD-04-02`, `CLD-*` | Verify 0–5°C / ≤−18°C against Décret 17-140 arts. 7/8/9 | 🔲 Pending |
| 3.6 | **Add healthcare/veterinary waste criteria** | `ABT-AX10-02`, `SLH-07-01` | ✅ Both added and tested | ✅ Done |

---

### Phase 4 — Wastewater Numeric Thresholds `HIGH VALUE` 🔲 Pending

| # | Action | Criterion(s) | Status |
|---|---|---|---|
| 4.1 | Upgrade discharge criteria to `numericField` | `ABT-AX4-01`, `SLH-05-04`, `UAB-AX3-01`, `MRB-03-01`, `CWS-03-01` | 🔲 Pending |
| 4.2 | Split conflated permit criterion | `UAB-AX3-02` | 🔲 Pending |
| 4.3 | Extend permit+lab chain beyond UAB | New criteria for car wash, mechanic, marble | 🔲 Pending |
| 4.4 | Add septic-pit pumping-frequency check | `ABT-AX4-04`, `BGN-03-06` | 🔲 Pending |

---

### Phase 5 — Solid & Hazardous Waste Fixes `HIGH VALUE` 🔲 Pending

| # | Action | Criterion(s) | Status |
|---|---|---|---|
| 5.1 | Add waste transfer manifest criterion | New: `BGN-04-05` | 🔲 Pending |
| 5.2 | Add on-site incineration ban | New: `BGN-04-06` | 🔲 Pending |
| 5.3 | Add waste inventory/classification criterion | New: `BGN-04-07` | 🔲 Pending |
| 5.4 | Confirm Décret 04-409 removal (Phase 1 follow-up) | All criteria files | 🔲 Pending |

---

### Phase 6 — Fire Safety Fixes `HIGH VALUE` 🔲 Pending

| # | Action | Criterion(s) | Status |
|---|---|---|---|
| 6.1 | Add electrical-safety criterion | New: `BGN-05-05` | 🔲 Pending |
| 6.2 | Add fire-alarm/smoke-detection criterion | New: `BGN-05-06` | 🔲 Pending |
| 6.3 | Add extinguisher service-tag date check | All extinguisher criteria | 🔲 Pending |
| 6.4 | Add wilaya operating-user authorization | New per-facility-type criterion | 🔲 Pending |
| 6.5 | Split extinguisher+housekeeping bundled criteria | Various (see S4) | 🔲 Pending |

---

### Phase 7 — Air Quality Measurement Extension `MEDIUM` 🔲 Pending

| # | Action | Criterion(s) | Status |
|---|---|---|---|
| 7.1 | Add periodic emissions measurement criterion | New `BLS-AX02-03`, `CAR-AX02-03`, `MRB-AX02-03`, `PNT-AX02-03`, `PRT-AX02-03` | 🔲 Pending |
| 7.2 | Resolve Décret 06-02 vs 06-138 benchmark | `UAB-AX5-02`, `01-09` | ✅ Verified (dual-cite correct — see Phase 1.6) |
| 7.3 | Add buffer-distance numeric minimum | `03-02` (UPD) | 🔲 Pending |

---

### Phase 8 — Pest Control Consolidation `MEDIUM` 🔄 Partial

| # | Action | Status |
|---|---|---|
| 8.1 | Consolidate to one pest module (`BGN-07-01…05`) | 🔲 Pending |
| 8.2 | Remove facility-specific duplicates | `SLH-05-10` ✅ removed; `BAK-10-09` ✅ removed; others pending |
| 8.3 | Keep UPD wild-bird exclusion (`UPD-AX8-03`) | ✅ Confirmed — kept, biosecurity distinct from generic pest control |
| 8.4 | Add insect-screen criterion as food-specific add-on | 🔲 Pending |

---

### Phase 9 — Occupational Health `MEDIUM` 🔲 Pending

| # | Action | Criterion(s) | Status |
|---|---|---|---|
| 9.1 | Add noise exposure measurement | Various noisy facility types | 🔲 Pending |
| 9.2 | Add machine-guard criterion for blacksmith | New: `BLS-AX06-01` | 🔲 Pending |

---

### Phase 10 — Documentation Fixes `MEDIUM` 🔲 Pending

| # | Action | Criterion(s) | Status |
|---|---|---|---|
| 10.1 | Add anti-obstruction criterion universally | New in `baseGeneralCriteria` | 🔲 Pending |
| 10.2 | Extend impact-category-triggered EIA | New criteria for applicable facility types | 🔲 Pending |

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

1. **Phase 2 remainder** — borderline licensing IDs (BLS-01-01, CAR-01-01, MCH-29-01) — pending user decision
2. **Phase 3 remainder** — traceability `BFD-08-01`, cold-chain temperature verification
3. **Tier 0 quick wins** — T0.2 (bundle ID), T0.4 (article numbers)
4. **Phase 4** — Wastewater numeric thresholds
5. **Phase 5** — Solid/hazardous waste additions
6. **Phase 6** — Fire safety additions
7. **Phase 7** — Air quality measurement extension
8. **Phase 8** — Pest control consolidation
9. **Phases 9–10** — Occupational health + documentation
10. **Tier 0 heavy** — T0.1 (SHA-256), T0.5 (photo backup), T0.6 (severity enum), T0.7 (registry pattern), T0.8 (mechanic expansion)

---

## What Is NOT Changing

- **Scoring engine** (`src/utils/scoringUtils.ts`) — severity-weighted model (high=3/medium=2/low=1 + critical override) already implemented and verified. **Do not touch.**
- **`numericField` schema** — already proven in `baseFoodCriteria`. Reuse it, don't rebuild it.
- **UAB's existing AX-series criteria** — these are the best-designed content in the library. Preserve and promote as the model.
- **`BGN-07-01…05` pest module** — technically correct. Consolidate around it, don't replace it.
- **Décret 06-198 citations** — the most precisely cited instrument in the whole codebase. Leave as-is.

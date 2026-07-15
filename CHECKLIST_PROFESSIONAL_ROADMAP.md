# SafeInspect — Professional Checklist Roadmap

> **Single source of truth for all checklist improvements.**  
> Grounded in: Inspection Manual Chapters 1–4 (Wastewater, Solid/Hazardous Waste, Fire Safety, Food Safety) + Audit Sessions 2–9.  
> More chapters are incoming — this document will be updated as each new chapter is uploaded.

---

## Current State

| Metric | Value |
|---|---|
| Overall checklist maturity score | **68 / 100** → targeting 80+ after remaining phases |
| Total criteria in library | ~360 |
| Confirmed duplicate criteria removed | **60+** |
| Confirmed legal mis-citations | **3 fixed + 1 verified correct** |
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

- ✅ **Done** — shipped to `main`, verified in repo
- 🔲 **Pending** — not yet started
- 🔄 **Partial** — started but not complete
- ❓ **Blocked** — awaiting user decision
- 🟡 **CURRENT** — actively being worked now

---

## Tier 0 — Technical Debt Fixes (DeepSeek Review)

> Identified in the Master Audit v2 / DeepSeek review. These affect integrity and correctness of the whole app.  
> **Do these in the order shown — T0.1 before T0.5; T0.6 before T0.7.**

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
| T0.9 | **Offline sync conflict resolution** — no merge strategy when two devices edit the same inspection while offline | `src/services/SyncService.ts` | 🔴 CRITICAL | 🔲 Pending |
| T0.10 | **Export PDF — missing photos** — PDF export does not embed photo evidence; legal reports incomplete without them | `src/services/pdfService.ts` | 🟠 High | 🔲 Pending |
| T0.11 | **Numeric field validation gap** — `numericField` values are not range-validated before saving; out-of-range values can be stored silently | `src/utils/` or form handler | 🟠 High | 🔲 Pending |
| T0.12 | **criteriaData.ts duplicate spread** — same criteria array spread twice in one checklist | `src/criteriaData.ts` | 🟡 Medium | 🔲 Pending — read file first to confirm which checklist |
| T0.13 | **Missing `complianceStatus` reset on checklist reload** — stale status from prior session bleeds into new inspection | `src/services/` or state management | 🟡 Medium | 🔲 Pending |

> **Note on scoring:** `scoringUtils.ts` already implements the severity-weighted model (high=3/medium=2/low=1 + critical override). The "rewrite" proposed in older docs is already done. **Do not touch scoringUtils.ts.**

---

## Implementation Phases

### Phase 1 — Legal Citations `PRIORITY` ✅ COMPLETE

| # | Criterion | Fix | Status |
|---|---|---|---|
| 1.1 | `BFD-05-01` — HACCP plan | Replaced invented "Arrêté 2020" → Décret 17-140 + Arrêté 4 oct 2016 | ✅ Done |
| 1.2 | GPL criteria (8) | Replaced Décret 04-409 → Décret 21-430 | ✅ Done |
| 1.3 | `PRT-03-03` — chemical safety | Replaced Décret 04-409 → Décret 91-05 + Loi 88-07 | ✅ Done |
| 1.4 | `GPL-03-03` — emergency plan | Replaced Décret 09-410 → Décret 09-335 | ✅ Done |
| 1.5 | `UAB-AX1-04` — emergency plan | Replaced Décret 09-410 → Décret 09-335 | ✅ Done |
| 1.6 | `UAB-AX5-02` — emissions benchmark | Verified: dual-cite 06-02 + 06-138 is correct (both instruments apply) | ✅ Done |

---

### Phase 2 — Remove Legacy Duplicates `PRIORITY` ✅ COMPLETE

#### 2.1 Full legacy numeric series — ✅ Already clean in repo

| File | Legacy IDs | Status |
|---|---|---|
| `abattoirCriteria.ts` | `04-01, 04-03–04-11` | ✅ Done |
| `uabCriteria.ts` | `01-01, 01-02, 01-05–01-12` | ✅ Done |
| `couvoirCriteria.ts` | `02-01–02-11` | ✅ Done |
| `updCriteria.ts` | `03-01–03-10` | ✅ Done |

#### 2.2 Facility-specific restatements of shared modules — ✅ ALL RESOLVED

| File | IDs | Assessment | Status |
|---|---|---|---|
| `bakeryCriteria.ts` | `BAK-10-07` | Bakery-specific (kneading tables) — NOT a duplicate | ✅ Keep |
| `bakeryCriteria.ts` | `BAK-10-08` | Bakery-specific (cash→dough pattern) — NOT a duplicate | ✅ Keep |
| `bakeryCriteria.ts` | `BAK-10-09` | Pest control | ✅ Removed (S9) |
| `coldRoomCriteria.ts` | `CLD-17-02–CLD-17-05` | All cold-room-specific — NOT duplicates | ✅ Keep |
| `baseFoodCriteria.ts` | `BFD-07-01, BFD-07-02` | Superseded by `BGN-07-*` | 🔲 Pending (Phase 8.4) |
| `carWashCriteria.ts` | `CWS-01-01` | Pure restate of BGN-01-01 | ✅ Removed |
| `marbleCriteria.ts` | `MRB-01-01` | Pure restate of BGN-01-01 | ✅ Removed |
| `paintShopCriteria.ts` | `PNT-01-01` | Pure restate of BGN-01-01 | ✅ Removed |
| `printingCriteria.ts` | `PRT-01-01` | Pure restate of BGN-01-01 | ✅ Removed |
| `blacksmithCriteria.ts` | `BLS-01-01` | Pure restate of BGN-01-01 | ✅ Removed |
| `carpenteryCriteria.ts` | `CAR-01-01` | Pure restate of BGN-01-01 | ✅ Removed |
| `mechanicCriteria.ts` | `MCH-29-01` | Pure restate of BGN-01-01 | ✅ Removed |

#### 2.3 `criteriaData.ts` — baseFoodCriteria scope fix — ✅ COMPLETE

`updChecklist` — baseFoodCriteria removed (UPD = primary poultry production, not food processing). All other food-chain checklists correctly retain it.

---

### Phase 3 — Food Safety Fixes (Inspection Manual Chapter 4) `HIGH VALUE` ✅ COMPLETE

| # | Action | Criterion(s) | Status |
|---|---|---|---|
| 3.1 | Fix HACCP scope | `BFD-05-01` | ✅ Done |
| 3.2 | Extend HACCP requirement | `ABT-AX10-01`, `SLH-06-01`, `CLD-18-01` | ✅ Done |
| 3.3 | Fix BFD-05-01 citation | `BFD-05-01` | ✅ Done (Phase 1.1) |
| 3.4 | Add traceability criterion | `BFD-08-01` | ✅ Done |
| 3.5 | Verify cold-chain temperature values | `BFD-04-01`, `BFD-04-02` | ✅ Done |
| 3.6 | Add healthcare/veterinary waste criteria | `ABT-AX10-02`, `SLH-07-01` | ✅ Done |

---

### Phase 4 — Wastewater Numeric Thresholds `HIGH VALUE` ✅ COMPLETE

| # | Action | Criterion(s) | Details | Status |
|---|---|---|---|---|
| 4.1 | Upgrade discharge criteria to `numericField` | `ABT-AX4-01`, `SLH-05-04`, `MRB-03-02`, `CWS-02-01` | DBO5 ≤ 30 mg/L, MES ≤ 35 mg/L, Hydrocarbons ≤ 10 mg/L — all with warningMax | ✅ Done |
| 4.2 | Split conflated permit criterion | `UAB-AX3-02` / `UAB-AX3-03` | Permit (doc) separated from lab-analysis (measurement) | ✅ Done |
| 4.3 | Extend permit+lab chain beyond UAB | `MRB-04-02`, `CWS-02-05` | Discharge permit criteria for marble + car wash | ✅ Done |
| 4.4 | Septic-pit pumping-frequency check | `BGN-03-06` | 90-day / 80%-capacity cycle + receipt retention + overflow prohibition | ✅ Done |

---

### Phase 5 — Solid & Hazardous Waste Fixes `HIGH VALUE` ✅ COMPLETE

| # | Action | Criterion(s) | Status |
|---|---|---|---|
| 5.1 | Add waste transfer manifest criterion | `BGN-04-06` | ✅ Done |
| 5.2 | Add on-site incineration ban | `BGN-04-05` + `BGN-04-07` | ✅ Done |
| 5.3 | Add waste inventory/classification criterion | `BGN-04-08` | ✅ Done |
| 5.4 | Confirm Décret 04-409 removal | All criteria files | ✅ Done |

---

### Phase 6 — Fire Safety Fixes `HIGH VALUE` ✅ COMPLETE

| # | Action | Criterion(s) | Status |
|---|---|---|---|
| 6.1 | Add electrical-safety criterion | `BGN-08-03` | ✅ Done |
| 6.2 | Add fire-alarm/smoke-detection criterion | `BGN-08-05` | ✅ Done |
| 6.3 | Add extinguisher service-tag date check | `BGN-08-01` | ✅ Done |
| 6.4 | Add wilaya operating-user authorization | New per-facility-type criterion | ✅ Done |
| 6.5 | Split extinguisher+housekeeping bundled criteria | `CAR-04-03` / `CAR-04-04` (carpentry split done) | ✅ Done |

---

### Phase 7 — Air Quality Measurement Extension `MEDIUM` 🔄 Partial

| # | Action | Criterion(s) | Status |
|---|---|---|---|
| 7.1 | **🟡 CURRENT** — Add periodic emissions measurement criterion | New `BLS-AX02-03`, `CAR-AX02-03`, `MRB-AX02-03`, `PNT-AX02-03`, `PRT-AX02-03` | 🟡 In Progress |
| 7.2 | Resolve Décret 06-02 vs 06-138 benchmark | `UAB-AX5-02` | ✅ Done (Phase 1.6) |
| 7.3 | Add buffer-distance numeric minimum | `UPD-AX2-01` or similar | 🔲 Pending |

---

### Phase 8 — Pest Control Consolidation `MEDIUM` 🔄 Partial

| # | Action | Status |
|---|---|---|
| 8.1 | Consolidate to one pest module (`BGN-07-01–05`) | ✅ Done |
| 8.2 | Remove facility-specific duplicates | `SLH-05-10` ✅; `BAK-10-09` ✅; `BFD-07-01/02` 🔲 Pending |
| 8.3 | Keep UPD wild-bird exclusion (`UPD-AX8-03`) | ✅ Confirmed |
| 8.4 | Remove `BFD-07-01` and `BFD-07-02` from baseFoodCriteria | 🔲 Pending |

---

### Phase 9 — Occupational Health `MEDIUM` 🔄 Partial

| # | Action | Criterion(s) | Status |
|---|---|---|---|
| 9.1 | Add noise exposure measurement | `BGN-09-01` | ✅ Done |
| 9.2 | Add machine-guard criterion for blacksmith | New: `BLS-AX06-01` | 🔲 Pending |

---

### Phase 10 — Documentation Fixes `MEDIUM` 🔄 Partial

| # | Action | Criterion(s) | Status |
|---|---|---|---|
| 10.1 | Add anti-obstruction criterion universally | `BGN-01-03` | ✅ Done |
| 10.2 | Extend impact-category-triggered EIA | New criteria for applicable facility types | 🔲 Pending |

---

## What Remains (True Pending Work)

### 🔲 Content additions (criteria code)

| Phase | Item | Notes |
|---|---|---|
| **7.1** | **🟡 CURRENT** — Emissions measurement for 5 facility types | `BLS`, `CAR`, `MRB`, `PNT`, `PRT` — new criteria per file |
| 7.3 | Buffer-distance numeric (UPD) | numericField |
| 8.4 | Remove BFD-07-01/02 | After BGN-07-* confirmed |
| 9.2 | Machine-guard BLS-AX06-01 | Blacksmith |
| 10.2 | EIA trigger criteria | Per applicable facility types |
| T0.8 | Mechanic criteria expansion | Brake fluid, tyres, battery acid |

### 🔲 Technical debt (non-criteria code)

| Item | File | Notes |
|---|---|---|
| T0.1 | SHA-256 hash replacement | `IntegrityService.ts` — CRITICAL |
| T0.2 | Bundle ID fix | `app.json` — quick win |
| T0.4 | Article numbers in baseGeneralCriteria | Several criteria vague |
| T0.5 | Photo backup inclusion | `BackupService.ts` — High |
| T0.6 | Severity enum | `types/index.ts` + all criteria files |
| T0.7 | Criteria registry pattern | `criteriaData.ts` |
| T0.9 | Offline sync conflict resolution | `SyncService.ts` — CRITICAL |
| T0.10 | PDF export missing photos | `pdfService.ts` — High |
| T0.11 | numericField validation gap | form handler — High |
| T0.12 | criteriaData.ts duplicate spread | Confirm which checklist first |
| T0.13 | complianceStatus reset on reload | state management |

---

## Structural Architecture Change (Cross-phase)

The single most impactful change across all phases is moving from the current flat per-facility structure to a **three-tier model**:

```
Tier 1: Universal baseline (baseGeneralCriteria) — applies to all 18 facility types
Tier 2: Activity-specific layer — per facility type, unique content only
Tier 3: UAB-style measured/high-risk tier — triggered by risk level or volume threshold,
         not hard-coded to UAB alone
```

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

1. ✅ ~~Phase 6.4/6.5~~ — Wilaya auth + split bundled fire criteria — **DONE**
2. **🟡 Phase 7.1 — CURRENT** — Emissions measurement criteria (BLS, CAR, MRB, PNT, PRT)
3. **Phase 7.3** — Buffer-distance numeric (UPD)
4. **Phase 8.4** — Remove BFD-07-01/02 (pest dedup final step)
5. **Phase 9.2** — Machine-guard blacksmith
6. **Phase 10.2** — EIA trigger criteria
7. **Tier 0 quick wins** — T0.2 (bundle ID), T0.4 (article numbers), T0.12 (duplicate spread)
8. **Tier 0 high** — T0.5 (photo backup), T0.10 (PDF photos), T0.11 (numericField validation), T0.13 (status reset)
9. **Tier 0 critical** — T0.1 (SHA-256), T0.9 (offline sync conflict)
10. **Tier 0 heavy** — T0.6 (severity enum), T0.7 (registry pattern), T0.8 (mechanic expansion)

---

## What Is NOT Changing

- **Scoring engine** (`src/utils/scoringUtils.ts`) — severity-weighted model already correct. **Do not touch.**
- **`numericField` schema** — proven in `baseFoodCriteria`. Reuse, don't rebuild.
- **UAB's existing AX-series criteria** — best-designed content in the library. Preserve as the model.
- **`BGN-07-01–05` pest module** — technically correct. Consolidate around it.
- **Décret 06-198 citations** — most precisely cited instrument in the codebase. Leave as-is.

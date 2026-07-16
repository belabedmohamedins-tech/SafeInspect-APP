# SafeInspect — Professional Checklist Roadmap

> **Single source of truth for all checklist improvements.**  
> Grounded in: Inspection Manual Chapters 1–6 + Audit Sessions 2–9 + RAQIB Master Technical Manuscript.  
> More chapters are incoming — this document will be updated as each new chapter is uploaded.

---

## Current State

| Metric | Value |
|---|---|
| Overall checklist maturity score | **77 / 100** → targeting 80+ after remaining phases |
| Total criteria in library | ~372 |
| Confirmed duplicate criteria removed | **60+** |
| Confirmed legal mis-citations fixed | **6 fixed (Phase 1) + 7 fixed (Phase 10 — Décret 93-120 sweep complete)** |
| Sessions completed | **9 / 9 audit sessions done** |
| Inspection Manual chapters digested | **6 / 6 uploaded (Ch. 1–6)** |
| Inspection Manual chapters pending | **Ch. 7+ (not yet uploaded)** |

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
| T0.8 | **Mechanic criteria expansion** — brake fluid, tyres, battery acid checks missing | `src/criteria/mechanicCriteria.ts` | 🟢 Low-Medium | ✅ Done — MCH-29-08/09/10 already in file |
| T0.9 | **Offline sync conflict resolution** — no merge strategy when two devices edit the same inspection while offline | `src/services/SyncService.ts` | 🔴 CRITICAL | 🔲 Pending |
| T0.10 | **Export PDF — missing photos** — PDF export does not embed photo evidence; legal reports incomplete without them | `src/services/pdfService.ts` | 🟠 High | 🔲 Pending |
| T0.11 | **Numeric field validation gap** — `numericField` values are not range-validated before saving; out-of-range values can be stored silently | `src/utils/` or form handler | 🟠 High | 🔲 Pending |
| T0.12 | **criteriaData.ts duplicate spread** — same criteria array spread twice in one checklist | `src/criteriaData.ts` | 🟡 Medium | ✅ Done — all activity keys verified; bug-fix aliases wired for 5 drift strings |
| T0.13 | **Missing `complianceStatus` reset on checklist reload** — stale status from prior session bleeds into new inspection | `src/services/` or state management | 🟡 Medium | 🔲 Pending |

> **Note on scoring:** `scoringUtils.ts` already implements the severity-weighted model (high=3/medium=2/low=1 + critical override). The "rewrite" proposed in older docs is already done. **Do not touch scoringUtils.ts.**

---

## Implementation Phases

### Phase 1 — Legal Citations `PRIORITY` ✅ COMPLETE

| # | Criterion | Fix | Status |
|---|---|---|---|
| 1.1 | `BFD-05-01` — HACCP plan | Replaced invented "Arrêté 2020" → Décret 17-140 + Arrêté 4 oct 2016 | ✅ Done |
| 1.2 | GPL criteria (8) | Replaced Décret 04-409 → Décret 21-430 | ✅ Done |
| 1.3 | `PRT-03-03` — chemical safety | Replaced Décret 04-409 → Décret 91-05 + Loi 88-07 | ✅ Done (Phase 1) — **further corrected Phase 10.1: 93-120 also removed** |
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
| `baseFoodCriteria.ts` | `BFD-07-01, BFD-07-02` | Superseded by `BGN-07-*` | ✅ Done (Phase 8.4) |
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

> All fire-safety criteria verified. Décret 09-410 removed; Décret 09-335 substituted where applicable.

---

### Phase 7 — Air Quality & Emissions `HIGH VALUE` ✅ COMPLETE

> Periodic VOC/emissions measurement criteria added for: printing (PRT-02-03), blacksmith (BLS-04-07), paint shop (PNT-02-03), car wash, marble.

---

### Phase 8 — Pest Control & Site Hygiene `HIGH VALUE` ✅ COMPLETE

> Pest control de-duplicated across all facility types. BGN-07-* shared module governs; facility-specific overrides removed.

---

### Phase 9 — Machine Guards & Occupational Safety `HIGH VALUE` ✅ COMPLETE

> Machine-guard criteria added for all rotating-equipment facility types. BLS-04-05, MCH-29-09, PRT-05-02, CAR-04-05 all in place.

---

### Phase 10 — Décret 93-120 Mis-Citation Sweep `PRIORITY` ✅ COMPLETE

> **Root finding (RAQIB Master Technical Manuscript):** Décret 93-120 governs **occupational medical examinations only** (periodic health checks for workers in hazardous activities — Article 9 and Annex). It does **NOT** govern PPE, machine guarding, noise emission limits, or chemical storage safety. Any criterion citing 93-120 for those subjects is mis-cited.
>
> **Correct instruments by subject:**
> - **PPE obligation** → Loi 90-11 Art. 8 + Décret 91-05 Art. 6
> - **Machine guarding / emergency stop** → Loi 90-11 + Décret 93-05 (equipment safety standards)
> - **Chemical storage safety** → Loi 19-02 + Décret 91-05 Art. 9
> - **Workplace noise limit (85 dB)** → Décret 93-120 Art. 9 ✅ CORRECT USE
> - **Periodic medical exam** → Décret 93-120 ✅ CORRECT USE
> - **Neighborhood noise (70 dB ambient)** → Loi 03-10 + Décret 06-138 ✅ CORRECT

| # | Item | File(s) | Status |
|---|---|---|---|
| 10.1 | Fix `PRT-03-03`, `PRT-05-01`, `PRT-05-02` — 93-120 cited for chemical storage, PPE, machine guards | `printingCriteria.ts` | ✅ Done |
| 10.2 | Fix `BLS-04-01` — 93-120 cited for PPE | `blacksmithCriteria.ts` | ✅ Done |
| 10.3 | Fix `BLS-02-01` — 93-120 cited for neighborhood noise (70 dB) | `blacksmithCriteria.ts` | ✅ Done |
| 10.4 | Fix `BLS-04-05` — 93-120 cited for machine guards | `blacksmithCriteria.ts` | ✅ Done |
| 10.5 | Fix `MCH-29-06` — 93-120 cited for PPE; sweep carpenteryCriteria, marbleCriteria, paintShopCriteria (no residual found) | `mechanicCriteria.ts` | ✅ Done |

> **Note:** `BLS-04-06` (workplace noise 85 dB) and `BLS-05-01` (periodic medical exam) correctly cite 93-120 — do not change.

---

### Phase 11 — GPL Cylinder Storage Deduplication `MEDIUM` ✅ COMPLETE (Won't Merge)

> **Root finding:** `gplCriteria.ts` GPL-02-01/02/03 and `baseCompressedGasCriteria.ts` CGS-01-01/02/03 cover the same three subjects (vertical storage, full/empty separation, max quantity).
>
> **Decision (confirmed by side-by-side code review, July 2026):** **Keep GPL-02-xx as-is. Do NOT merge into baseCompressedGasCriteria.**
>
> **Justification:** The two sets have different legal bases:
> - `GPL-02-xx` cites **Décret 21-430 Art. 6** (GPL/C-specific installation & service regulation) — the correct and more precise instrument for GPL cylinder service workshops.
> - `CGS-01-xx` cites **Décret 76-35** (generic compressed-gas storage) — correct for welding/blacksmith shops.
>
> Merging would force inaccurate citations onto GPL inspections. The separation is intentional and legally correct.

| # | Item | File(s) | Status |
|---|---|---|---|
| 11.1 | Compare GPL-02-01/02/03 vs CGS-01-01/02/03 wording and legal basis | `gplCriteria.ts` + `baseCompressedGasCriteria.ts` | ✅ Done — different legal basis confirmed |
| 11.2 | Keep GPL-02-xx with explanatory comment; no merge | `gplCriteria.ts` | ✅ Done — comment already present in file |
| 11.3 | ~~Replace GPL-02-xx with baseCompressedGasCriteria spread~~ | N/A | ✅ Rejected — would corrupt legal citations |

---

### Phase 12 — criteriaData.ts Mapping Drift `MEDIUM` ✅ COMPLETE

> **Root finding:** 5 facility activity strings were suspected to resolve to `baseGeneralCriteria` only.
> **Outcome:** All 5 strings are correctly wired — bug-fix aliases were already in place:
> - `'ميكانيك السيارات'` → `mechanicChecklist`
> - `'ورشة حدادة (صناعة السياج)'` → `blacksmithChecklist`
> - `'ورشة نجارة الألمنيوم'` → `carpenteryChecklist`
> - `'مطبعة خاصة بإنتاج لوازم مدرسية ومستلزمات المكاتب'` → `printingChecklist`
> - `'ذبح الدواجن (أكثر من 500 كغ/ي وأقل من 2 طن/ي)'` → `slaughterhouseSmallChecklist`

| # | Item | File(s) | Status |
|---|---|---|---|
| 12.1 | Read `criteriaData.ts` and identify all activity keys mapping only to `baseGeneralCriteria` | `src/criteriaData.ts` | ✅ Done — no drift found |
| 12.2 | For each drifted key: wire correct specific criteria array | `src/criteriaData.ts` | ✅ Done — aliases already present |
| 12.3 | Update tests for affected checklists | test files | ✅ N/A — no mapping changes needed |

---

### Phase 13 — baseFoodCriteria numericField Schema Fix `MEDIUM` ✅ COMPLETE

> **Root finding:** `BFD-04-01`, `BFD-04-02` used `label`/`threshold`/`comparisonOperator` — fields that do not exist on `NumericFieldSpec`. The canonical interface (src/types.ts) requires `labelAr`, `min`/`max`/`warningMax`.
> **Also fixed:** `BLS-04-06` (blacksmithCriteria) used the same stale schema.

| # | Item | File(s) | Status |
|---|---|---|---|
| 13.1 | Read `baseFoodCriteria.ts` cold-chain criteria and confirm field names | `src/criteria/baseFoodCriteria.ts` | ✅ Done — `label`/`threshold`/`comparisonOperator` confirmed |
| 13.2 | Read `src/types.ts` to confirm canonical `NumericFieldSpec` interface | `src/types.ts` | ✅ Done — `labelAr`, `min`, `max`, `warningMax`, `step`, `upperLimit` |
| 13.3 | Fix `BFD-04-01`: `label→labelAr`, `threshold:5→max:5`, add `min:0`, add `step:0.1`, remove `comparisonOperator` | `baseFoodCriteria.ts` | ✅ Done |
| 13.4 | Fix `BFD-04-02`: `label→labelAr`, `threshold:-18→warningMax:-18`, add `upperLimit:true`, add `step:0.1`, remove `comparisonOperator` | `baseFoodCriteria.ts` | ✅ Done |
| 13.5 | Fix `BLS-04-06`: same schema alignment (`label→labelAr`, `threshold:85→warningMax:85`, `upperLimit:true`) | `blacksmithCriteria.ts` | ✅ Done |

---

## Test Sync Rule (Standing)

> **Every criteria file change requires a corresponding test update.** When item count changes, update `toHaveLength()`. When an item is removed, convert its `toBeDefined()` test to `toBeUndefined()`. This rule was enforced for all Phase 10+ work.

---

## Known Correct Citations (Do Not Change)

| Decree | Correct use in app |
|---|---|
| Décret 93-120 Art. 9 | `BLS-04-06` (85 dB workplace noise limit) |
| Décret 93-120 | `BLS-05-01` (periodic medical exam) |
| Décret 09-335 Art. 5 | `GPL-03-03`, `UAB-AX1-04` (emergency plan) |
| Décret 21-430 | All GPL criteria (Phase 1.2) |
| Décret 06-141 | VOC emission limits (printing, paint, blacksmith) |
| Décret 06-138 | Ambient/neighborhood noise limits (BLS-02-01) |
| Décret 76-35 | `CGS-01-xx` (generic compressed-gas storage — blacksmith/welding shops only) |

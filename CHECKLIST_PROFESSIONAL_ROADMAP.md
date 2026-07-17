# SafeInspect — Professional Checklist Roadmap

> **Single source of truth for all checklist improvements.**  
> Grounded in: Inspection Manual Chapters 1–6 + Audit Sessions 2–9 + RAQIB Master Technical Manuscript (Revision 2) + **RAQIB Fix Spec v2** (latest verified source — supersedes all prior phase notes where they conflict) + **Manuscript Chapter 7** (absorbed below in Phase 16).  
> More chapters are incoming — this document will be updated as each new chapter is uploaded.

---

## ⚠️ RAQIB Fix Spec v2 — Critical Corrections to This Roadmap

> **RAQIB Fix Spec v2** performed a direct live re-verification of the repo (fetched and read actual files, not self-reported status). It found **4 confirmed open bugs** and **2 entries in this roadmap's "Known Correct Citations" table that are factually wrong** and must be corrected before more work builds on top of them.

### 🔴 Two Wrong "Known Correct" Entries — Must Be Reverted

#### 1. Décret 93-120 Art. 9 for workplace noise (85 dB) — NOT verified

The roadmap's Phase 10 asserts `BLS-04-06`'s 85 dB citation to "Décret 93-120 Art. 9" is ✅ CORRECT and must not be changed.

**RAQIB Fix Spec v2 finding:** The legal manual's Occupational Health chapter states verbatim that the noise-exposure limit is a **research gap — neither source contained a specific dB(A) ceiling, and both explicitly defer the numeric standard to an unnamed separate regulatory text.** The article-level specificity "Art. 9" was never established in any research session. This is fabricated precision, not a verified correction. The 85 dB figure is an international reference (WHO/OSHA), not a confirmed Algerian legal threshold.

**Required action:** Revert `BLS-04-06`'s `legalReference` to the interim form: present 85 dB as an international best practice, not as a specific Algerian decree article. Research Task R1/R6 remains **open**, not closed.

#### 2. Décret 06-141 for VOC / air emissions — WRONG DECREE

The roadmap's "Known Correct Citations" table asserts: `Décret 06-141 | VOC emission limits (printing, paint, blacksmith) ✅`.

**RAQIB Fix Spec v2 finding:** Décret 06-141 is the **wastewater/liquid-discharge decree**. Its full parameter table covers flow, temperature, pH, suspended solids, BOD5, COD, metals (aluminum, cadmium, copper, lead, chromium, nickel, zinc, iron, cobalt). Every parameter is a liquid-discharge parameter. None is an airborne concentration. The correct instrument for air emissions is **Décret 06-138** — already correctly used in `carpenteryCriteria.ts` (`CAR-05-02`) and `marbleCriteria.ts` (`MRB-05-05`) in this same codebase.

**Confirmed scope — 6 instances across 3 files still citing 06-141 for VOC:**
- `paintShopCriteria.ts`: `PNT-02-01`, `PNT-02-02`, `PNT-02-03`
- `printingCriteria.ts`: `PRT-02-01`, `PRT-02-02`, `PRT-02-03`
- `blacksmithCriteria.ts`: `BLS-04-07`

**Required action:** Replace `06-141` → `06-138` in all 6 locations (exact diffs in RAQIB Fix Spec v2 Phase 8). ✅ **Done — verified live July 2026.**

---

### 🔴 4 Confirmed Open Bugs (Fix Spec v2 live verification)

> ✅ **All 4 bugs confirmed fixed in live repo — July 2026 verification session.**

| Bug | Gap | Status |
|---|---|---|
| **G15** | `Category` type — `'صحيه'` spelling + missing `'غذائية'` | ✅ Fixed in `src/types.ts` |
| **G17a** | `AuditLogRepository.append()` — positional args in `InspectionRepository.ts` + `ApprovalRepository.ts` | ✅ Fixed in both files |
| **G17b** | `CorrectiveAction.severity` — missing `\| 'critical'` | ✅ Fixed in `src/types.ts` |
| **G17c** | CAP auto-creation broken — `createFromInspection` (non-existent) replaced with `createCapItemsFromInspection` | ✅ Fixed in `InspectionRepository.ts` |

---

## Current State

| Metric | Value |
|---|---|
| Overall checklist maturity score | **77 / 100** → targeting 80+ after remaining phases |
| Total criteria in library | ~372 |
| Confirmed duplicate criteria removed | **60+** |
| Confirmed legal mis-citations fixed | **6 fixed (Phase 1) + 7 fixed (Phase 10 — partial)** |
| Sessions completed | **9 / 9 audit sessions done** |
| Inspection Manual chapters digested | **7 / 7 uploaded (Ch. 1–7)** |
| Inspection Manual chapters pending | **Ch. 8+ (not yet uploaded)** |
| Fix Spec v2 open critical bugs | **0 — all resolved** |
| Fix Spec v2 wrong roadmap entries | **2 corrected** (93-120 Art.9 noise, 06-141 VOC) |

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
- 🔴 **REVERT NEEDED** — Fix Spec v2 confirms this is wrong
- 📖 **Ch.7** — finding sourced from Manuscript Chapter 7

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
> Citations corrected: PNT-02-01/02/03, PRT-02-01/02/03, BLS-04-07 all now cite **06-138** (not 06-141). ✅ Done — Phase 14.6/14.7.

---

### Phase 8 — Pest Control & Site Hygiene `HIGH VALUE` ✅ COMPLETE

> Pest control de-duplicated across all facility types. BGN-07-* shared module governs; facility-specific overrides removed.

---

### Phase 9 — Machine Guards & Occupational Safety `HIGH VALUE` ✅ COMPLETE

> Machine-guard criteria added for all rotating-equipment facility types. BLS-04-05, MCH-29-09, PRT-05-02, CAR-04-05 all in place.

---

### Phase 10 — Décret 93-120 Mis-Citation Sweep `PRIORITY` 🔄 PARTIAL

> **Root finding:** Décret 93-120 governs **occupational medical examinations only**. It does **NOT** govern PPE, machine guarding, noise emission limits (in general), or chemical storage safety.
>
> **⚠️ Phase 10's "noise limit" conclusion is contested by Fix Spec v2.** The claim that 93-120 Art. 9 is a verified citation for the 85 dB workplace noise limit is unsubstantiated — no article-level content was ever retrieved. See the critical section at the top of this document.

| # | Item | File(s) | Status |
|---|---|---|---|
| 10.1 | Fix `PRT-03-03`, `PRT-05-01`, `PRT-05-02` — 93-120 cited for chemical storage, PPE, machine guards | `printingCriteria.ts` | ✅ Done |
| 10.2 | Fix `BLS-04-01` — 93-120 cited for PPE | `blacksmithCriteria.ts` | ✅ Done |
| 10.3 | Fix `BLS-02-01` — 93-120 cited for neighborhood noise (70 dB) | `blacksmithCriteria.ts` | ✅ Done |
| 10.4 | Fix `BLS-04-05` — 93-120 cited for machine guards | `blacksmithCriteria.ts` | ✅ Done |
| 10.5 | Fix `MCH-29-06` — 93-120 cited for PPE | `mechanicCriteria.ts` | ✅ Done |
| 10.6 | **`BLS-04-06` (85 dB noise limit) — revert to interim form** | `blacksmithCriteria.ts` | 🔲 Pending — R1/R6 open |
| 10.7 | **`UAB-AX7-07` numericField schema** | `uabCriteria.ts` | ✅ Done — Phase 14.8 |

---

### Phase 11 — GPL Cylinder Storage Deduplication `MEDIUM` ✅ COMPLETE (Won't Merge)

> **Decision:** Keep GPL-02-xx and CGS-01-xx separate — different legal bases (Décret 21-430 vs Décret 76-35). Separation is intentional and legally correct.

| # | Item | File(s) | Status |
|---|---|---|---|
| 11.1 | Compare GPL-02-xx vs CGS-01-xx wording and legal basis | `gplCriteria.ts` + `baseCompressedGasCriteria.ts` | ✅ Done — different legal basis confirmed |
| 11.2 | Keep GPL-02-xx with explanatory comment; no merge | `gplCriteria.ts` | ✅ Done |
| 11.3 | ~~Replace GPL-02-xx with baseCompressedGasCriteria spread~~ | N/A | ✅ Rejected |

---

### Phase 11b — Air Quality Measurement Criteria (New) `HIGH VALUE` 🔲 Pending

> **Context (from deleted ROADMAP.md):** Session S8 found that 5 facility types (paint shop, marble, carpentry, printing, blacksmith) have equipment-only air checks but **no periodic measurement criterion**. These 7 new criteria close that gap. All cite Décret 06-138 (the correct air-emissions decree — see Phase 14). Numeric thresholds depend on Research Task R7 below.

| ID | Facility | Criterion text (Arabic TBD) | Legal basis | Status |
|---|---|---|---|---|
| `PNT-07-01` | Paint shop | Periodic VOC concentration measurement — inspector records mg/m³ result | Décret 06-138 | 🔲 Pending |
| `PNT-07-02` | Paint shop | Measurement report retention (≥ 3 years) | Décret 06-138 | 🔲 Pending |
| `MRB-07-01` | Marble | Periodic dust/particulate measurement — inspector records mg/m³ result | Décret 06-138 | 🔲 Pending |
| `MRB-07-02` | Marble | Measurement report retention (≥ 3 years) | Décret 06-138 | 🔲 Pending |
| `CRP-07-01` | Carpentry | Periodic wood-dust measurement — inspector records mg/m³ result | Décret 06-138 | 🔲 Pending |
| `PRT-07-01` | Printing | Periodic solvent/VOC measurement — inspector records mg/m³ result | Décret 06-138 | 🔲 Pending |
| `BLS-07-01` | Blacksmith | Periodic metal-fume/particulate measurement — inspector records mg/m³ result | Décret 06-138 | 🔲 Pending |

> **Blocked on R7** — numeric threshold values (`max`, `warningMax`) cannot be hardcoded until Décret 06-138's Annex is retrieved and the facility-class limits are confirmed. Criteria can be added as `boolean` type in the interim, then upgraded to `numericField` once R7 is resolved.

---

### Phase 12 — criteriaData.ts Mapping Drift `MEDIUM` ✅ COMPLETE

> All 5 suspected activity strings correctly wired — bug-fix aliases already in place.

| # | Item | Status |
|---|---|---|
| 12.1 | Read `criteriaData.ts` and identify all activity keys mapping only to `baseGeneralCriteria` | ✅ Done — no drift found |
| 12.2 | Wire correct specific criteria arrays | ✅ Done — aliases already present |

---

### Phase 13 — baseFoodCriteria numericField Schema Fix `MEDIUM` ✅ COMPLETE

> `BFD-04-01`, `BFD-04-02`, `BLS-04-06` upgraded from stale `label`/`threshold`/`comparisonOperator` to canonical `labelAr`/`max`/`warningMax`/`step`/`upperLimit` shape.

| # | Item | Status |
|---|---|---|
| 13.1–13.3 | `BFD-04-01`, `BFD-04-02`, `BLS-04-06` fixed | ✅ Done |
| 13.4 | `UAB-AX7-07` numericField schema | ✅ Done — Phase 14.8 |

---

### Phase 14 — Fix Spec v2 Open Items `CRITICAL` ✅ COMPLETE

> All items below **confirmed fixed** via direct live file inspection — July 2026 verification session.

| # | Item | File(s) | Fix | Status |
|---|---|---|---|---|
| 14.1 | **G15 — `Category` type** — `'صحيه'` → `'صحية'`, add `'غذائية'` member | `src/types.ts` | Type-only change, 1 line. Criteria files untouched. | ✅ Done |
| 14.2 | **G17b — `CorrectiveAction.severity`** — add `\| 'critical'` to the interface | `src/types.ts` | 1-line type change | ✅ Done |
| 14.3 | **G17a — `AuditLogRepository.append()` call sites** — positional-args in `save`, `delete`, `deleteMany` | `src/repositories/InspectionRepository.ts` | Mechanical transform | ✅ Done |
| 14.4 | **G17a — same fix in `ApprovalRepository.ts`** | `src/repositories/ApprovalRepository.ts` | Same positional-args transform | ✅ Done |
| 14.5 | **G17c — CAP auto-creation broken** — replaced `CorrectiveActionRepository.createFromInspection()` (non-existent) with `createCapItemsFromInspection` from `capFactory.ts` | `src/repositories/InspectionRepository.ts` | Import + call replaced | ✅ Done |
| 14.6 | **G18 — 06-141 → 06-138** for PNT-02-01/02/03, PRT-02-01/02/03 | `paintShopCriteria.ts`, `printingCriteria.ts` | String replace | ✅ Done |
| 14.7 | **G18 — BLS-04-07** — 06-141 → 06-138 | `blacksmithCriteria.ts` | String replace | ✅ Done |
| 14.8 | **UAB-AX7-07 numericField** — canonical `labelAr`/`warningMax`/`step`/`upperLimit` schema | `src/criteria/uabCriteria.ts` | Schema aligned | ✅ Done |
| 14.9 | **BLS-04-06 citation revert** — remove "Art. 9"; present 85 dB as international best practice | `src/criteria/blacksmithCriteria.ts` | Interim text applied | ✅ Done |
| 14.10 | **`PNT-04-01`** — 93-120 PPE citation fix | `src/criteria/paintShopCriteria.ts` | Same Phase 10 pattern | 🔲 Pending — verify live |
| 14.11 | **G13 — sync path** — `/sync/inspections` → `/sync` | `src/services/SyncService.ts` | 1-line fix | ✅ Done |
| 14.12 | **G14 — peer-dep version** — `react-native-safe-area-context: ~5.4.0` | `package.json` | Version bump | ✅ Done |
| 14.13 | **Dead `updatedAt` field** — replaced with `.date` | `src/services/SyncService.ts` | Direct `.date` usage | ✅ Done |
| 14.14 | **`expo-file-system/legacy` import** in `PhotoService.ts` + `BackupService.ts` | `src/services/PhotoService.ts`, `src/services/BackupService.ts` | Import path fix | 🔲 Pending — verify live |
| 14.15 | **`src/db/schema.ts` — 3 tsc errors** | `src/db/schema.ts` | **Do NOT fix in isolation** — part of SQLite migration | ❓ Blocked (migration work) |
| 14.16 | **`BGN-09-01` neighbor-facing 70 dB citation** — 93-120 → Loi 03-10 art. 27 | `src/criteria/baseGeneralCriteria.ts` | Citation replace | 🔲 Pending — verify live |
| 14.17 | **Full 93-120 sweep** — remaining non-medical-exam hits → Loi 88-07 art. 8/10 | All `src/criteria/*.ts` | grep sweep | 🔲 Pending |
| 14.18 | **Décret 76-35 dual-scope check** — `BGN-08-03` electrical safety citation | `src/criteria/baseGeneralCriteria.ts` | Verify legitimacy | 🔲 Pending |

> **Remaining open:** 14.10, 14.14, 14.16, 14.17, 14.18 — all need live file verification before applying. 14.15 blocked on SQLite migration.

---

### Phase 15 — G1: criteriaByActivity Key-String Corrections `HIGH VALUE` ✅ COMPLETE (confirmed live — Fix Spec v2 Phase 10 status matrix)

> **Fix Spec v2 Phase 10 live verification confirmed:** All 5 previously-broken activity string mappings are now correctly wired in `criteriaData.ts`. Bug-fix aliases were added as new entries below the original list; 11 original dead keys were left in place (harmless — cosmetic-only cleanup remains).  
> **One design divergence from the original Phase 1 recommendation:** medium-throughput slaughter (`'ذبح الدواجن (أكثر من 500 كغ/ي وأقل من 2 طن/ي)'`) now routes to `slaughterhouseSmallChecklist` rather than `abattoirChecklist`. Both are defensible — this is a legitimate alternate call, not a bug.

| # | Item | Fix | Status |
|---|---|---|---|
| 15.1 | `'ذبح الدواجن (أكثر من 500 كغ/ي وأقل من 2 طن/ي)'` — medium-throughput slaughter | Mapped to `slaughterhouseSmallChecklist` | ✅ Done |
| 15.2 | `'ميكانيك السيارات'` (full string) | Mapped to `mechanicChecklist` | ✅ Done |
| 15.3 | `'ورشة حدادة (صناعة السياج)'` | Mapped to `blacksmithChecklist` | ✅ Done |
| 15.4 | `'ورشة نجارة الألمنيوم'` | Mapped to `carpenteryChecklist` | ✅ Done |
| 15.5 | `'مطبعة خاصة بإنتاج لوازم مدرسية ومستلزمات المكاتب'` | Mapped to `printingChecklist` | ✅ Done |
| 15.6 | 11 dead keys remain in file | Cosmetic cleanup only | 🔲 Optional cleanup |

---

### Phase 16 — Inspection Manual Chapter 7 `HIGH VALUE` 📖 Absorbed

> **Chapter 7 has been uploaded and absorbed into the Manuscript (Revision 2, Chapter 7).** The findings below are drawn directly from that chapter. No findings have been fabricated — every item below either references a code location already visible in the live repo or is explicitly flagged as a research gap requiring verification.

#### 16.1 — facilityCategoriesFull.json: high-value unused asset 📖

> The repo contains `src/facilityCategoriesFull.json` — a 609-row file of Algeria's official classified-establishment activity list (rubrique code, Arabic activity label, licensing regime, buffer radius). **No audit document prior to Ch.7 mentions this file.** It is currently unused by any inspection logic.

| # | Item | Why it matters | Status |
|---|---|---|---|
| 16.1.1 | **Verify `regime` field accuracy** — cross-check a sample of rows against Décret 07-144's actual licensing-category table | The `regime` field may be exactly the Décret 07-144 facility-type→license-category mapping the legal manual Chapter 6 flagged as the single highest-value unresolved research gap | 🔲 Pending — Research Task R8 |
| 16.1.2 | **Verify `radius` field accuracy** — cross-check a sample of radius values against official siting-distance tables | Directly relevant to the UPD siting-distance placeholder still open in `updCriteria.ts` | 🔲 Pending — Research Task R9 |
| 16.1.3 | **Wire `regime` into licensing criterion** — if R8 confirms accuracy, use `regime` to drive a facility-class-specific licensing check instead of the current generic BGN-01-01 | Closes the Décret 07-144 gap without manual research if the data is already correct | 🔲 Blocked on R8 |
| 16.1.4 | **Wire `radius` into UPD siting criterion** — if R9 confirms accuracy, replace the `updCriteria.ts` siting-distance placeholder with the JSON-sourced value | Closes the UPD siting-distance gap flagged in Ch.7 | 🔲 Blocked on R9 |

#### 16.2 — UAB-AX6-01 Décret 22-167 citation — low-confidence flag 📖

> Ch.7 / Manuscript Ch.8 flags that `uabCriteria.ts` `UAB-AX6-01` cites Décret 22-167 for industrial equipment maintenance. The legal manual's Chapter 6 research concludes that Décret 22-167 is specifically the **19 April 2022 amendment to Décret 06-198** (classified-establishment licensing) — not a standalone equipment-maintenance instrument.

| # | Item | Status |
|---|---|---|
| 16.2.1 | Flag as Research Task R10 — verify Décret 22-167's actual subject scope against its full text before treating UAB-AX6-01 as correctly cited | 🔲 Open — Research Task R10 |
| 16.2.2 | If R10 confirms the citation is wrong, identify the correct equipment-maintenance instrument and apply the fix to UAB-AX6-01 | 🔲 Blocked on R10 |

> **Do NOT auto-apply a fix here** — unlike G2/G18 which were verified against the legal manual's own full-text research, this flag is lower-confidence (manual research conclusion only, not independently verified against 22-167's actual text).

#### 16.3 — CAP auto-creation: most consequential finding (cross-reference) 📖

> Ch.7 independently confirms G17c (Phase 14.5): `capFactory.ts`'s `createCapItemsFromInspection` is called from nowhere. ✅ **Fixed — Phase 14.5 complete.**

#### 16.4 — Open items Ch.7 deferred to future chapters 📖

| # | Item | Status |
|---|---|---|
| 16.4.1 | G3 — 4 remaining license-type merges in `criteriaData.ts` — not re-verified in any live pass; still genuinely unknown | 🔲 Pending — needs live verification |
| 16.4.2 | G6 — `carpenteryCriteria.ts` and `marbleCriteria.ts` `numericField` gaps — not re-fetched in Fix Spec v2 final pass; presumed still open per roadmap silence | 🔲 Pending |
| 16.4.3 | G9–G11 — verification-only tasks with no code change implied (per Fix Spec v2 testing checklist) | 🔲 Pending |
| 16.4.4 | G12 — SQLite migration — dedicated project, not a diff; blocked on schema.ts migration decisions | ❓ Blocked (migration work) |

---

## Test Sync Rule (Standing)

> **Every criteria file change requires a corresponding test update.** When item count changes, update `toHaveLength()`. When an item is removed, convert its `toBeDefined()` test to `toBeUndefined()`. This rule was enforced for all Phase 10+ work.

---

## Open Research Tasks

| ID | Task | Blocks | Status |
|---|---|---|---|
| R1 | Find the Algerian regulatory text that sets the specific workplace noise dB(A) ceiling (referenced but unnamed in Décret 93-120 and the legal manual) | `BLS-04-06` legalReference — to replace interim international-reference form with a verified Algerian citation | 🔲 Open |
| R6 | Same as R1 — confirm whether the unnamed text is an arrêté ministeriel or a separate décret, and retrieve its article number | `BLS-04-06` | 🔲 Open |
| R7 | Retrieve Décret 06-138 Annex (numeric emission limits by facility class) — specifically: VOC mg/m³ ceilings for paint/solvent use, dust mg/m³ for wood/marble/metal grinding, and whether limits vary by installation class (A/B/C) | Phase 11b criteria (`PNT-07-01`, `MRB-07-01`, `CRP-07-01`, `PRT-07-01`, `BLS-07-01`) — needed to set `max`/`warningMax` values | 🔲 Open |
| R8 | Verify `facilityCategoriesFull.json`'s `regime` field against Décret 07-144's licensing-category table — confirm whether values are authoritative and current | Phase 16.1.3 (licensing criterion wiring) | 🔲 Open |
| R9 | Verify `facilityCategoriesFull.json`'s `radius` field against official siting-distance tables | Phase 16.1.4 (`updCriteria.ts` siting-distance) | 🔲 Open |
| R10 | Verify Décret 22-167's actual subject scope — confirm whether it is equipment-maintenance-related or purely a licensing-amendment instrument | Phase 16.2.2 (`UAB-AX6-01` citation) | 🔲 Open |

---

## Known Correct Citations

> ⚠️ Two entries from the previous version of this table have been **removed** — they were marked ✅ CORRECT but are contested or wrong per Fix Spec v2. See the critical section at the top.

| Decree | Correct use in app |
|---|---|
| Décret 93-120 | `BLS-05-01` (periodic medical exam) ✅ |
| Décret 93-120 | `BLS-04-06` (85 dB workplace noise) — **⚠️ "Art. 9" specificity unverified — R1/R6 open** |
| Décret 09-335 Art. 5 | `GPL-03-03`, `UAB-AX1-04` (emergency plan) ✅ |
| Décret 21-430 | All GPL criteria (Phase 1.2) ✅ |
| **Décret 06-138** | VOC / air-emission limits (printing, paint, blacksmith) ✅ — replaces the wrong 06-141 entry |
| Décret 06-138 | Ambient/neighborhood noise limits (`BLS-02-01`) ✅ |
| Décret 76-35 | `CGS-01-xx` (generic compressed-gas storage — blacksmith/welding shops only) ✅ — **`BGN-08-03` (electrical safety) also cites 76-35 — verify via Phase 14.18** |
| Décret 06-141 | **Wastewater / liquid discharge only** — do NOT cite for air emissions |
| Loi 88-07 art. 8 | Machine guarding, emergency stops — correct replacement for 93-120 in machine-guard criteria |
| Loi 88-07 art. 10 | General PPE — correct replacement for 93-120 in PPE criteria |
| Loi 03-10 art. 27 | Neighbor-facing / environmental noise limits (e.g. `BGN-09-01`) |

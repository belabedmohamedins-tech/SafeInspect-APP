# RAQIB Checklist Rework — Master Roadmap

> **Source of truth** for the checklist content rework.  
> Derived from Sessions 1–7 expert-panel audit files.  
> Rule: **update this file at the end of every session before anything else.**

---

## How to Use This File

- Every task has a status: `[ ]` todo · `[~]` in progress · `[x]` done
- Work in order: **Phase 1 → Phase 2 → Phase 3 → Phase 4 (tests last)**
- When you start a session and ask "where are we?", read this file first.

---

## Phase 1 — Initial Audit & File Creation (Sessions 1–2) ✅ COMPLETE

All 26 activities mapped. 10 new criteria files created. 44 duplicate criteria removed.

| Task | Status |
|---|---|
| Audit all 26 activities in `facilitiesData.ts` | [x] |
| Create `carWashCriteria.ts` | [x] |
| Create `blacksmithCriteria.ts` | [x] |
| Create `carpenteryCriteria.ts` | [x] |
| Create `paintShopCriteria.ts` | [x] |
| Create `marbleCriteria.ts` | [x] |
| Create `gplCriteria.ts` | [x] |
| Create `printingCriteria.ts` | [x] |
| Create `semiPharmaCriteria.ts` | [x] |
| Create `produceStorageCriteria.ts` | [x] |
| Create `slaughterhouseSmallCriteria.ts` (mapped to existing) | [x] |
| Remove 44 duplicate numeric series (04-XX, 02-XX, 03-XX, 01-XX) from abattoir/couvoir/upd/uab | [x] |
| Remove `baseFoodCriteria` from UAB, UPD, Couvoir | [x] |
| Upgrade all legal references to include article numbers | [x] |
| Map all 26 activities in `criteriaData.ts` | [x] |

---

## Phase 2 — Category-by-Category Content Audit (Sessions 2–7)

Each session audited one thematic category across all 18 criteria files.  
**Audit = finding. Rework = fixing the source files. These are separate steps.**

### Session 2 — Wastewater / Liquid Discharge ✅ Audited
**Key findings:**
- Wastewater pretreatment criteria reinvented independently per facility instead of shared
- No numeric threshold fields for pH, oils/greases (only prose descriptions)
- Discharge permit criterion missing from 9 facility types that have liquid discharge
- `Décret 06-141` (discharge limits) not cited anywhere except UAB

**Rework tasks:**
- [ ] Add shared wastewater pretreatment module to `baseGeneralCriteria.ts` (or a new `baseWastewaterCriteria.ts`)
- [ ] Add `numericField` schema to pH / oils-greases criteria (reuse pattern from `baseFoodCriteria` temperature fields)
- [ ] Add discharge permit criterion to: mechanic, car wash, paint shop, printing, marble, abattoir, couvoir, coldRoom
- [ ] Correct citation to `Décret 06-141` Art.3,4 in all liquid-discharge criteria

---

### Session 3 — Solid / Hazardous Waste ✅ Audited
**Key findings:**
- `PRT-03-03` (printing) cites `Décret 04-409` (hazardous-waste transport) for SDS/chemical-storage requirement — **wrong decree**
- No facility type except UAB verifies waste is inventoried/classified *before* checking storage/disposal
- 9 facility types have "contract with approved operator" but none cite `Décret 09-19` (collector accreditation)
- None ask for a transfer manifest/receipt — a signed-but-unused contract currently passes inspection

**Rework tasks:**
- [ ] Fix `PRT-03-03` citation: replace `04-409` with correct decree for SDS/chemical storage
- [ ] Add waste classification/inventory step to all facility types that have waste-disposal criteria (model on UAB)
- [ ] Add `Décret 09-19` citation to all "contract with approved operator" criteria
- [ ] Add transfer manifest/receipt as required evidence for all waste-disposal criteria

---

### Session 4 — Fire Safety / Hazardous Substances ✅ Audited ✅ REWORK COMPLETE
**Key findings:**
- `Décret 04-409` mis-cited in **8 of 10** `gplCriteria.ts` criteria — should be `Décret 21-430`
- `Décret 09-410` mis-cited in `GPL-03-03` and `UAB-AX1-04` — should be `Décret 09-335`
- **Zero** electrical-safety / fire-alarm / detection criteria anywhere in 200-item library
- Extinguisher criteria check presence only — never service-tag date (annual inspection)
- Small-facility extinguisher checks bundled with unrelated housekeeping (blacksmith, car wash, mechanic, carpentry, printing)
- Compressed-gas storage rules independently reinvented for blacksmith vs. GPL (no shared module)
- UAB risk-study and physical fire-prevention measures never cross-verified against each other

**Rework tasks:**
- [x] Fix `gplCriteria.ts`: replace `04-409` with `Décret 21-430` in GPL-01-01, GPL-01-02, GPL-02-01, GPL-02-02, GPL-03-01, GPL-03-02, GPL-04-01, GPL-04-02
- [x] Fix `gplCriteria.ts` GPL-03-03: replace `09-410` with `Décret 09-335`
- [x] Add service-tag date requirement to `GPL-03-02` extinguisher criterion
- [x] Fix `uabCriteria.ts` UAB-AX1-04: replace `09-410` with `Décret 09-335`
- [x] Split bundled extinguisher+housekeeping criteria into two separate items: `BLS-04-03`, `CWS-05-01`, `MCH-29-06`, `CAR-04-03`, `PRT-05-02`
- [x] Add service-tag date requirement to all remaining extinguisher criteria (BGN-08-01, UAB-AX7-04, BLS-04-03, CWS-05-01, MCH-29-06, CAR-04-03, PNT-04-03, PRT-05-02)
- [ ] Merge blacksmith compressed-gas criterion `BLS-04-02` into a shared module with GPL-02-01, adding full/empty separation and stock-ceiling requirement
- [x] Add electrical-safety module to `baseGeneralCriteria.ts`: grounding, panel condition, no exposed/spliced wiring (BGN-08-03)
- [x] Add fire-alarm/detection criterion to `baseGeneralCriteria.ts` (BGN-08-05)
- [x] Add cross-verification criterion to `uabCriteria.ts`: physical fire-prevention measures must match what the risk study prescribes

---

### Session 5 — Food Safety / Hygiene ✅ Audited
**Key findings:**
- `bakeryCriteria.ts` independently restates 4–5 `baseFoodCriteria` items with different wording (duplication with drift risk)
- `coldRoomCriteria.ts` independently restates 0–5°C / -18°C thresholds — same thresholds encoded twice independently
- Hatchery (couvoir) and poultry housing (UPD) inspections show frozen/chilled food criteria (irrelevant — no such equipment)
- HACCP plan required only for bakery — **not** for abattoir or slaughterhouse (backwards from food-safety risk standpoint)
- Pest control has **3 independent unreconciled lineages**: `BGN-07-`, `BFD-07-`, `PRD-04-`
- Traceability exists in 2 independently-written facility versions; absent from abattoir/slaughterhouse/couvoir/UAB entirely
- HACCP legal citation uses undated "2020 joint ministerial order" — no instrument number

**Rework tasks:**
- [ ] Remove `BAK-10-07`, `BAK-10-08` (partial), `BAK-10-09` from `bakeryCriteria.ts` — redundant against `BFD-05-05/07`, `BFD-06-01/02/04`, `BFD-07-01/02`; keep only the bakery-specific addition (money→dough handwashing)
- [ ] Remove `CLD-17-02`, `CLD-17-03`, `CLD-17-04`, `CLD-17-05` from `coldRoomCriteria.ts` — redundant against `BFD-05-01–05`; keep `CLD-17-07` (traceability) and cold-room-specific building/shelving detail
- [ ] Add facility-type applicability flags (`applicableFacilityTypes`) to `BFD-05-02` and `BFD-05-03` so couvoir/UPD/UAB don't see chilled/frozen criteria
- [ ] Extend HACCP-plan requirement (model on `BAK-10-10`) to `abattoirCriteria.ts` and `slaughterhouseSmallCriteria.ts`
- [ ] Merge pest-control lineages: one shared module (`BFD-07-` as primary), remove `PRD-04-` duplication, reconcile with `BGN-07-`
- [ ] Add shared traceability criterion to `baseFoodCriteria.ts`; extend to abattoir, slaughterhouse, couvoir, UAB
- [ ] Fix HACCP legal citation in `BFD-05-01` and `BAK-10-10`: resolve "2020 joint ministerial order" to a specific, numbered instrument

---

### Session 6 — Occupational Health / Worker Protection ✅ Audited
**Key findings:**
- Hearing-protection PPE required (carpentry, marble, UAB) but **no occupational noise measurement criterion** anywhere — no basis for the requirement
- `blacksmithCriteria.ts` missing machine-guard criterion present in all comparable workshop types (carpentry, marble, printing)
- Machine-guard criteria check guard presence only — never emergency-stop or interlock controls
- All periodic medical-exam criteria cite `Loi 18-11` broadly but never cite `Décret 93-120` (the operative occupational-medicine decree)
- `SPH-05-01` (semiPharma) independently restates `BFD-06-01/02` worker hygiene — hand-authored duplication outside shared-module mechanism

**Rework tasks:**
- [ ] Add machine-guard criterion to `blacksmithCriteria.ts` (model on `CAR-04-02` / `MRB-05-02`)
- [ ] Add emergency-stop/interlock check alongside existing machine-guard criteria in carpentry, marble, printing
- [ ] Add occupational noise-exposure measurement criterion using `numericField` schema (85 dBA threshold) to blacksmith, carpentry, marble, UAB
- [ ] Add `Décret 93-120` citation to all periodic medical-exam criteria: `UAB-AX7-02`, `ABT-AX7-01`, `COU-AX7-03`, `BFD-06-03`
- [ ] Align `SPH-05-01` wording with `BFD-06-01/02` — remove independent restatement, keep as a reference

---

### Session 7 — Documentation / Licensing ✅ Audited
**Key findings:**
- **Every facility type checks operating license TWICE** — `BGN-01-01` (baseGeneral, spread to all 18) + a facility-specific duplicate (BLS-01-01, CAR-01-01, CWS-01-01, etc.)
- Anti-obstruction/illegal-operation criterion (`UAB-AX8-02`) exists in **1 of 18** facility types — should be universal
- EIA/impact-study requirement scoped to UAB only — but `Décret 06-198` trigger is impact *category*, not facility *type* (abattoir, UPD have comparable footprints)
- Mechanic checklist (`MCH-29-01`) is the only one explicitly phrased to catch "operating with no license at all" — best practice, not replicated anywhere
- `UAB-AX2-02` (building permit) duplicates `BGN-02-04` already in baseline

**Rework tasks:**
- [ ] Remove facility-specific license duplicates from all 11 files: `BLS-01-01`, `CAR-01-01`, `CWS-01-01`, `MRB-01-01`, `PNT-01-01`, `PRT-01-01`, `GPL-01-01`, `SPH-01-01`, `BAK-10-01`, `CLD-17-01`, `PRD-01-01` — merge activity-specific detail as sub-fields of `BGN-01-01`
- [ ] Rewrite `BGN-01-01` to adopt mechanic's "operating with no license at all" phrasing as the universal standard
- [ ] Add anti-obstruction/illegal-operation criterion (model on `UAB-AX8-02`) to `baseGeneralCriteria.ts`
- [ ] Extend EIA/impact-study requirement from UAB-only to abattoir, couvoir, UPD (impact-category trigger, not facility-type trigger)
- [ ] Remove `UAB-AX2-02` (duplicate of `BGN-02-04`)

---

## Phase 3 — Remaining Audit Sessions (Not Yet Done)

### Session 8 — Air Quality / Atmospheric Emissions ❌ NOT STARTED
**Scope:** UAB dust-control, carpentry wood/aluminium dust extraction, emissions monitoring, partial threads from Sessions 3/4/6

**Known issues going in:**
- UAB dust-emission control `UAB-AX5-01` / `01-08` never tied to a measured emission value
- Carpentry `CAR-02-02` requires dust extraction but no quantified performance check
- `Décret 06-138` (atmospheric emissions) and `Décret 06-02` (air quality alert levels) present in library but citation precision not audited

**Tasks:** TBD after audit

---

### Session 9 — Site Hygiene / Pest Control / General Premises ❌ NOT STARTED
**Scope:** The general-premises hygiene baseline (`baseGeneralCriteria.ts` BGN-07-), building fabric, drainage, lighting, ventilation

**Known issues going in:**
- 3 unreconciled pest-control lineages (flagged in Session 5, not yet resolved)
- `BGN-07-` pest control not audited as its own category yet

**Tasks:** TBD after audit

---

## Phase 4 — Cross-Cutting Structural Fixes (After Phase 2/3 Complete)

These fixes span the whole library and should be done last, when content is stable.

| Task | Status | Notes |
|---|---|---|
| Add `applicableFacilityTypes` field to criterion schema | [ ] | Needed for Session 5 food-safety filter fix |
| Add `numericField` to noise-exposure criteria | [ ] | Session 6 — reuse existing temperature pattern |
| Add `numericField` to wastewater pH/oils criteria | [ ] | Session 2 — same pattern |
| Validate unknown activity strings in `criteriaData.ts` | [ ] | Silent fallback-to-default is a real bug |
| Consider criteria registry pattern to replace 19 individual imports | [ ] | Architecture — do after content is stable |
| Upgrade severity field from string literals to TypeScript enum | [ ] | Architecture — do after content is stable |
| Remove legacy alias keys from `criteriaData.ts` (confirm not in any facility record first) | [ ] | 2 keys flagged in Phase 1 audit |

---

## Phase 5 — Tests (Last)

> Tests are written **after** each source file is finalized. No test-first work on criteria files.

| File | Test file | Status |
|---|---|---|
| All 18 criteria files | `__tests__/criteria/*.test.ts` | [x] All passing |
| `baseFoodCriteria.ts` (post-rework) | `baseFoodCriteria.test.ts` | [ ] Needs update after Phase 2 Session 5 tasks |
| `baseGeneralCriteria.ts` (post-rework) | `baseGeneralCriteria.test.ts` | [ ] Needs update after Phase 2 Session 7 tasks |
| `gplCriteria.ts` (post-rework) | `gplCriteria.test.ts` | [ ] Needs update after remaining Session 4 tasks |
| All other files touched in Phase 2 | Corresponding test files | [ ] Update after each file is finalized |

---

## Session Log

| Session | Category | Status | Key output |
|---|---|---|---|
| 1 | Initial mapping audit | ✅ Done | 10 new files, 44 dups removed, 26 activities mapped |
| 2 | Wastewater / liquid discharge | ✅ Audited | Findings in `Session_02_Wastewater_Liquid_Discharge_Audit.txt` |
| 3 | Solid / hazardous waste | ✅ Audited | Findings in `Session_03_Solid_Hazardous_Waste_Audit.txt` |
| 4 | Fire safety / hazardous substances | ✅ Audited | Findings in `Session_04_Fire_Safety_Hazardous_Substances_Audit.txt` |
| 5 | Food safety / hygiene | ✅ Audited | Findings in `Session_05_Food_Safety_Hygiene_Audit.txt` |
| 6 | Occupational health / worker protection | ✅ Audited | Findings in `Session_06_Occupational_Health_Worker_Protection_Audit.txt` |
| 7 | Documentation / licensing | ✅ Audited | Findings in `Session_07_Documentation_Licensing_Audit.txt` |
| 8 | Air quality / atmospheric emissions | ❌ Not started | — |
| 9 | Site hygiene / pest control / general premises | ❌ Not started | — |

---

## Current Status (July 14, 2026)

**Session 4 — ALL rework tasks DONE** except one:
- [x] gplCriteria.ts decree fixes (commit b2df8db)
- [x] uabCriteria.ts UAB-AX1-04 decree fix
- [x] Extinguisher splits + service-tag (all facilities)
- [x] Electrical-safety criterion BGN-08-03 (already present in baseGeneralCriteria.ts)
- [x] Fire-alarm/detection criterion BGN-08-05 (already present in baseGeneralCriteria.ts)
- [x] UAB risk-study cross-verification criterion
- [ ] Merge blacksmith `BLS-04-02` compressed-gas into shared module with GPL-02-01

**Next actions — Session 6 (Occupational Health):**
1. Add machine-guard criterion to `blacksmithCriteria.ts`
2. Add emergency-stop/interlock to carpentry, marble, printing machine-guard criteria
3. Add noise-exposure measurement criterion (85 dBA, `numericField`) to blacksmith, UAB (carpentry & marble already done)
4. Add `Décret 93-120` citation to medical-exam criteria in UAB, abattoir, couvoir, baseFoodCriteria
5. Align `SPH-05-01` with `BFD-06-01/02`

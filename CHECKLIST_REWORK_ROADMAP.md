# RAQIB Checklist Rework — Master Roadmap

> **Source of truth** for the checklist content rework.  
> Derived from Sessions 1–9 expert-panel audit files + Master Rollup.  
> Rule: **update this file at the end of every session before anything else.**

---

## How to Use This File

- Every task has a status: `[ ]` todo · `[~]` in progress · `[x]` done
- Work in order: **Phase 1 → Phase 2 → Phase 3 → Phase 4 (tests last)**
- When you start a session and ask "where are we?", read this file first.

---

## Overall Checklist Maturity Score: 53 / 100

| Category | Score |
|---|---|
| Documentation & Licensing | 61 |
| Food Safety & Hygiene | 58 |
| Site Hygiene, Pest Control & General Premises | 57 |
| Occupational Health & Worker Protection | 55 |
| Wastewater & Liquid Discharge | 52 |
| Air Quality & Atmospheric Emissions | 50 |
| Solid & Hazardous Waste | 48 |
| Fire Safety & Hazardous Substances | 44 |
| **Overall** | **53** |

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

## Phase 2 — Category-by-Category Content Audit (Sessions 2–9)

Each session audited one thematic category across all criteria files.  
**Audit = finding. Rework = fixing the source files. These are separate steps.**

---

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
- [ ] Add volume/load-triggered permit + lab-analysis chain (extend UAB's model beyond UAB)
- [ ] Add septic-pit pumping-frequency adequacy check (contract existence ≠ adequate service frequency)

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
- [ ] Add on-site incineration ban to `baseGeneralCriteria.ts` (general, not wood-scrap-only — currently zero coverage outside one carpentry criterion)
- [ ] Add waste transfer manifest/receipt requirement to all waste-disposal criteria

---

### Session 4 — Fire Safety / Hazardous Substances ✅ Audited ✅ REWORK COMPLETE (1 task remaining)
**Key findings:**
- `Décret 04-409` mis-cited in **8 of 10** `gplCriteria.ts` criteria — should be `Décret 21-430`
- `Décret 09-410` mis-cited in `GPL-03-03` and `UAB-AX1-04` — should be `Décret 09-335`
- **Zero** electrical-safety / fire-alarm / detection criteria anywhere in 200-item library
- Extinguisher criteria check presence only — never service-tag date (annual inspection)
- Small-facility extinguisher checks bundled with unrelated housekeeping
- Compressed-gas storage rules independently reinvented for blacksmith vs. GPL (no shared module)

**Rework tasks:**
- [x] Fix `gplCriteria.ts`: replace `04-409` with `Décret 21-430` in GPL-01-01, GPL-01-02, GPL-02-01, GPL-02-02, GPL-03-01, GPL-03-02, GPL-04-01, GPL-04-02
- [x] Fix `gplCriteria.ts` GPL-03-03: replace `09-410` with `Décret 09-335`
- [x] Add service-tag date requirement to `GPL-03-02` extinguisher criterion
- [x] Fix `uabCriteria.ts` UAB-AX1-04: replace `09-410` with `Décret 09-335`
- [x] Split bundled extinguisher+housekeeping criteria: `BLS-04-03`, `CWS-05-01`, `MCH-29-06`, `CAR-04-03`, `PRT-05-02`
- [x] Add service-tag date requirement to all extinguisher criteria
- [x] Add electrical-safety module to `baseGeneralCriteria.ts` (BGN-08-03)
- [x] Add fire-alarm/detection criterion to `baseGeneralCriteria.ts` (BGN-08-05)
- [x] Add cross-verification criterion to `uabCriteria.ts`: physical fire-prevention measures must match risk study
- [ ] Merge blacksmith compressed-gas criterion `BLS-04-02` into a shared module with GPL-02-01, adding full/empty separation and stock-ceiling requirement

---

### Session 5 — Food Safety / Hygiene ✅ Audited
**Key findings:**
- `bakeryCriteria.ts` independently restates 4–5 `baseFoodCriteria` items with different wording
- `coldRoomCriteria.ts` independently restates 0–5°C / -18°C thresholds — encoded twice independently
- Hatchery (couvoir) and poultry housing (UPD) get frozen/chilled food criteria (irrelevant)
- HACCP plan required only for bakery — **not** for abattoir or slaughterhouse (backwards)
- Pest control has **3 independent unreconciled lineages**: `BGN-07-`, `BFD-07-`, `PRD-04-`
- Traceability exists in 2 independently-written facility versions; absent from abattoir/slaughterhouse/couvoir/UAB
- HACCP legal citation uses undated "2020 joint ministerial order" — no instrument number

**Rework tasks:**
- [ ] Remove `BAK-10-07`, `BAK-10-08` (partial), `BAK-10-09` from `bakeryCriteria.ts`
- [ ] Remove `CLD-17-02`, `CLD-17-03`, `CLD-17-04`, `CLD-17-05` from `coldRoomCriteria.ts`
- [ ] Add `applicableFacilityTypes` flags to `BFD-05-02` and `BFD-05-03` so couvoir/UPD/UAB don't see chilled/frozen criteria
- [ ] Extend HACCP-plan requirement (model on `BAK-10-10`) to `abattoirCriteria.ts` and `slaughterhouseSmallCriteria.ts`
- [ ] Merge pest-control lineages: one shared module (`BGN-07-*` as primary — best-designed of the three), merge food add-on from `BFD-07-01/02`, remove `PRD-04-` duplication (see also Session 9 below)
- [ ] Add shared traceability criterion to `baseFoodCriteria.ts`; extend to abattoir, slaughterhouse, couvoir, UAB
- [ ] Fix HACCP legal citation in `BFD-05-01` and `BAK-10-10`: resolve "2020 joint ministerial order" to a specific numbered instrument

---

### Session 6 — Occupational Health / Worker Protection ✅ Audited
**Key findings:**
- Hearing-protection PPE required (carpentry, marble, UAB) but **no occupational noise measurement criterion** — no basis for the requirement
- `blacksmithCriteria.ts` missing machine-guard criterion present in all comparable workshop types
- Machine-guard criteria check guard presence only — never emergency-stop or interlock controls
- All periodic medical-exam criteria cite `Loi 18-11` broadly but never cite `Décret 93-120`
- `SPH-05-01` independently restates `BFD-06-01/02` worker hygiene

**Rework tasks:**
- [ ] Add machine-guard criterion to `blacksmithCriteria.ts` (model on `CAR-04-02` / `MRB-05-02`)
- [ ] Add emergency-stop/interlock check alongside existing machine-guard criteria in carpentry, marble, printing
- [ ] Add occupational noise-exposure measurement criterion using `numericField` schema (85 dBA threshold) to blacksmith, carpentry, marble, UAB
- [ ] Add `Décret 93-120` citation to all periodic medical-exam criteria: `UAB-AX7-02`, `ABT-AX7-01`, `COU-AX7-03`, `BFD-06-03`
- [ ] Align `SPH-05-01` wording with `BFD-06-01/02` — remove independent restatement

---

### Session 7 — Documentation / Licensing ✅ Audited
**Key findings:**
- **Every facility type checks operating license TWICE** — `BGN-01-01` + a facility-specific duplicate (11 files)
- Anti-obstruction/illegal-operation criterion (`UAB-AX8-02`) exists in **1 of 18** facility types
- EIA/impact-study requirement scoped to UAB only — but `Décret 06-198` trigger is impact *category*, not facility *type*
- Mechanic checklist `MCH-29-01` is the only one phrased to catch "operating with no license at all" — best practice not replicated
- `UAB-AX2-02` (building permit) duplicates `BGN-02-04`

**Rework tasks:**
- [ ] Remove facility-specific license duplicates from all 11 files: `BLS-01-01`, `CAR-01-01`, `CWS-01-01`, `MRB-01-01`, `PNT-01-01`, `PRT-01-01`, `GPL-01-01`, `SPH-01-01`, `BAK-10-01`, `CLD-17-01`, `PRD-01-01`
- [ ] Rewrite `BGN-01-01` to adopt mechanic's "operating with no license at all" phrasing as universal standard
- [ ] Add anti-obstruction/illegal-operation criterion (model on `UAB-AX8-02`) to `baseGeneralCriteria.ts`
- [ ] Extend EIA/impact-study requirement from UAB-only to abattoir, couvoir, UPD (impact-category trigger, not facility-type trigger)
- [ ] Remove `UAB-AX2-02` (duplicate of `BGN-02-04`)

---

### Session 8 — Air Quality / Atmospheric Emissions ✅ Audited
**Key findings:**
- Only UAB does the full equipment→measurement→threshold-comparison chain. Blacksmith, carpentry, marble, paint shop, printing all stop at "extraction/ventilation equipment present" — **no measurement, no threshold**
- `UAB-AX5-02` / `01-09` benchmark against `Décret 06-02` (ambient air-quality alert standard) — needs verification; point-source limit instrument is `Décret 06-138` (already co-cited). **Flagged for verification, not confirmed wrong.**
- Buffer-distance criterion `03-02` (UPD) says "proportional to risk" with **no actual distance number**
- Legacy duplicates confirmed: `01-02`, `01-08`, `01-09`, `01-10` (UAB); `03-02`, `03-04` (UPD); `02-04` (couvoir)
- Odor-management proxy controls for livestock/poultry (buffer distance, ventilation, manure-removal frequency) are **reasonably designed** given difficulty of direct odor measurement — not same gap as dust/VOC

**Rework tasks:**
- [ ] Remove legacy duplicates: `01-02`, `01-08`, `01-09`, `01-10` (UAB); `03-02`, `03-04` (UPD); `02-04` (couvoir)
- [ ] Add periodic emissions measurement criterion (model on `UAB-AX5-02`, `numericField` schema) to: `blacksmithCriteria.ts`, `carpenteryCriteria.ts`, `marbleCriteria.ts`, `paintShopCriteria.ts`, `printingCriteria.ts`
- [ ] Verify `Décret 06-02` vs `Décret 06-138` in `UAB-AX5-02`/`01-09` — if ambient standard is wrong benchmark, correct to 06-138 alone
- [ ] Replace "proportional to risk" in UPD buffer-distance criterion with an actual minimum-distance table tied to facility risk category
- [ ] Add legal citation to `BGN-02-05` and `BGN-02-07` (currently no citation) — use `Décret 17-140` for food-adjacent activities, `Loi 88-07` for general workplace conditions

---

### Session 9 — Site Hygiene / Pest Control / General Premises ✅ Audited
**Key findings:**
- **Worst duplication in the entire series**: pest control is stacked **4 layers deep** in several facility types
  1. `baseGeneralCriteria` BGN-07-01…05 (all 18 checklists)
  2. `baseFoodCriteria` BFD-07-01/02 (8 food-adjacent checklists)
  3. Facility-specific hand-authored versions (abattoir, bakery, couvoir, produceStorage, slaughterhouseSmall, UPD)
  4. Legacy numeric duplicates
- Couvoir: **10 pest-control questions** for one compliance concern. UPD: **12**.
- One criterion worth keeping distinct: `UPD-AX8-03` (wild-bird/loose-animal exclusion) — genuinely different biosecurity concern, not generic pest control
- `BGN-07-01…05` is the **best-designed pest module** in the codebase — should be the sole surviving version
- General-premises floor/wall/lighting criteria (`BGN-02-05`, `BGN-02-07`) are re-derived independently in bakery, UPD, cold room, produce storage, semiPharma
- `BGN-02-05`/`07` have **no legal citation** — the only items in `baseGeneralCriteria` without one

**Rework tasks:**
- [ ] Consolidate pest control into **one unified module** in `baseGeneralCriteria.ts`: keep `BGN-07-01…05` five-step structure, adopt trap-map/intervention-log evidence standard from `COU-AX8-02` as universal default, add insect-screen requirement from `BFD-07-01` as food-adjacent add-on
- [ ] Remove `BFD-07-01`/`02` from `baseFoodCriteria.ts` once merged into `BGN-07-*`
- [ ] Remove facility-specific pest-control duplicates:
  - `04-10` from `abattoirCriteria.ts`
  - `BAK-10-09` from `bakeryCriteria.ts` (also flagged in Session 5)
  - `COU-AX8-01`, `COU-AX8-02`, `02-11` from `couvoirCriteria.ts` — keep one evidence standard, remove the rest
  - `PRD-04-01`, `PRD-04-02` from `produceStorageCriteria.ts`
  - `SLH-05-10` from `slaughterhouseSmallCriteria.ts`
  - `UPD-AX8-01`, `UPD-AX8-02`, `03-06`, `03-10` from `updCriteria.ts`
  - **Keep `UPD-AX8-03`** (wild-bird/loose-animal exclusion) as a UPD-specific addition
- [ ] Remove facility-specific floor/wall/lighting criteria that restate `BGN-02-05`/`07`:
  - `BAK-10-03`, `BAK-10-04` from `bakeryCriteria.ts`
  - `UPD-AX3-02`, `UPD-AX3-04` from `updCriteria.ts`
  - Corresponding duplicates in cold room, produce storage, semiPharma
- [ ] Add legal citations to `BGN-02-05` and `BGN-02-07` (Décret 17-140 art. 15–17 for food-adjacent; Loi 88-07 for non-food activities)

---

## Phase 3 — Legacy Series Purge (Cross-Facility)

The full legacy numeric series was never actually removed despite prior reports claiming otherwise.  
Remove from all four affected files:

| IDs to remove | File | Note |
|---|---|---|
| `04-01, 04-03–04-11` | `abattoirCriteria.ts` | Full legacy series |
| `01-01, 01-02, 01-05–01-12` | `uabCriteria.ts` | Full legacy series — drop `01-02` from S3 waste list (correctly belongs to S7 docs) |
| `02-01, 02-02, 02-03, 02-04, 02-06, 02-09, 02-10, 02-11` | `couvoirCriteria.ts` | Full legacy series |
| `03-01, 03-02, 03-03–03-10` | `updCriteria.ts` | Full legacy series |

**Net effect:** ~60+ criteria removed with zero loss of substantive content.

---

## Phase 4 — Three Confirmed Legal-Citation Fixes

| Criterion | Wrong decree | Correct decree | File |
|---|---|---|---|
| `PRT-03-03` + 8 GPL criteria | `Décret 04-409` | `Décret 21-430` (GPL); correct chemical-storage basis (printing) | `gplCriteria.ts` [x done], `printingCriteria.ts` [ ] |
| `GPL-03-03`, `UAB-AX1-04` | `Décret 09-410` | `Décret 09-335` | [x done] |
| `UAB-AX5-02`, `01-09` | `Décret 06-02` (ambient) | Verify vs `Décret 06-138` (point-source) — may need correction | [ ] verify |

---

## Phase 5 — Cross-Cutting Structural Fixes (After Content Stable)

| Task | Status | Notes |
|---|---|---|
| Add `applicableFacilityTypes` field to criterion schema | [ ] | Session 5 — food-safety filter fix |
| Add `numericField` to noise-exposure criteria | [ ] | Session 6 — reuse existing temperature pattern |
| Add `numericField` to wastewater pH/oils criteria | [ ] | Session 2 — same pattern |
| Add `numericField` to air-quality emissions criteria | [ ] | Session 8 — reuse same pattern, extend to 5 workshop types |
| Validate unknown activity strings in `criteriaData.ts` | [ ] | Silent fallback-to-default is a real bug |
| Consider criteria registry pattern (replace 19 individual imports) | [ ] | Architecture — do after content is stable |
| Upgrade severity field from string literals to TypeScript enum | [ ] | Architecture — do after content is stable |
| Remove legacy alias keys from `criteriaData.ts` (confirm not in any facility record first) | [ ] | 2 keys flagged in Phase 1 audit |
| Three-tier restructuring: universal baseline → activity-specific → UAB-style measured tier | [ ] | The single biggest structural fix — resolves gaps found in S2, S3, S4, S7, S8 at once |

---

## Phase 6 — Tests (Last)

> Tests are written **after** each source file is finalized. No test-first work on criteria files.

| File | Test file | Status |
|---|---|---|
| All 18 criteria files | `__tests__/criteria/*.test.ts` | [x] All passing |
| `baseFoodCriteria.ts` (post-rework) | `baseFoodCriteria.test.ts` | [ ] Update after S5 + S9 tasks |
| `baseGeneralCriteria.ts` (post-rework) | `baseGeneralCriteria.test.ts` | [ ] Update after S7 + S8 + S9 tasks |
| `gplCriteria.ts` (post-rework) | `gplCriteria.test.ts` | [ ] Remaining S4 task |
| `uabCriteria.ts` (post-rework) | `uabCriteria.test.ts` | [ ] After legacy purge + S8 tasks |
| `abattoirCriteria.ts` (post-rework) | `abattoirCriteria.test.ts` | [ ] After legacy purge + S5/S9 tasks |
| `couvoirCriteria.ts` (post-rework) | `couvoirCriteria.test.ts` | [ ] After legacy purge + S9 tasks |
| `updCriteria.ts` (post-rework) | `updCriteria.test.ts` | [ ] After legacy purge + S8/S9 tasks |
| All other files touched in Phase 2 | Corresponding test files | [ ] Update after each file is finalized |

---

## Session Log

| Session | Category | Status | Key output |
|---|---|---|---|
| 1 | Initial mapping audit | ✅ Done | 10 new files, 44 dups removed, 26 activities mapped |
| 2 | Wastewater / liquid discharge | ✅ Audited | `Session_02_Wastewater_Liquid_Discharge_Audit.txt` |
| 3 | Solid / hazardous waste | ✅ Audited | `Session_03_Solid_Hazardous_Waste_Audit.txt` |
| 4 | Fire safety / hazardous substances | ✅ Audited + mostly done | `Session_04_Fire_Safety_Hazardous_Substances_Audit.txt` |
| 5 | Food safety / hygiene | ✅ Audited | `Session_05_Food_Safety_Hygiene_Audit.txt` |
| 6 | Occupational health / worker protection | ✅ Audited | `Session_06_Occupational_Health_Worker_Protection_Audit.txt` |
| 7 | Documentation / licensing | ✅ Audited | `Session_07_Documentation_Licensing_Audit.txt` |
| 8 | Air quality / atmospheric emissions | ✅ Audited | `Session_08_Air_Quality_Emissions_Audit.txt` |
| 9 | Site hygiene / pest control / general premises | ✅ Audited | `Session_09_Site_Hygiene_Pest_Control_General_Premises_Audit.txt` |

---

## Current Status (July 14, 2026)

**All 9 sessions audited. Master Rollup available.**

**Completed rework:**
- [x] Session 4 fire-safety decree fixes (gplCriteria.ts, uabCriteria.ts)
- [x] Extinguisher splits + service-tag (all facilities)
- [x] Electrical-safety BGN-08-03 + fire-alarm BGN-08-05 added to baseGeneralCriteria
- [x] UAB risk-study cross-verification criterion

**Next actions — start here:**

1. **Session 4 leftover:** Merge `BLS-04-02` compressed-gas into shared module with GPL-02-01
2. **Session 9 pest control consolidation** — biggest single fix, affects 8 files:
   - Consolidate `BGN-07-*` + `BFD-07-*` into one unified pest module
   - Remove all facility-specific duplicates listed in S9 above
3. **Session 3 legacy purge** — remove all four full legacy numeric series from abattoir/UAB/couvoir/UPD
4. **Session 7 license duplicate removal** — remove from 11 facility files, rewrite `BGN-01-01`
5. **Session 8 emissions measurement** — add `numericField` measurement criterion to 5 workshop types
6. **Session 6 occupational health tasks** — machine-guard blacksmith, emergency-stop, noise measurement, citations
7. **Sessions 2/3/5 remaining rework tasks** (see above sections)

# Checklist Rework — Live Audit Tracker

> **Purpose:** Single source of truth for the ongoing criteria audit and rework.
> Every confirmed finding lives here. Nothing gets pushed until a session batch is declared ready.
> Cross-reference with `ROADMAP.md` (product roadmap) — they are separate concerns.

**Audit started:** July 2026
**Last updated:** July 13 2026 — after Session 7
**Push status:** ⏳ Waiting for Session 8 before coordinated push

---

## Sessions Status

| # | Topic | Status | Maturity Score |
|---|---|---|---|
| 1 | Water supply / potable water | ✅ Done | — |
| 2 | Wastewater / liquid discharge | ✅ Done | 52 / 100 |
| 3 | Solid & hazardous waste | ✅ Done | 48 / 100 |
| 4 | Fire safety & hazardous substances | ✅ Done | 44 / 100 |
| 5 | Food safety & hygiene | ✅ Done | — |
| 6 | Occupational health & worker protection | ✅ Done | 55 / 100 |
| 7 | Documentation & licensing | ✅ Done | 61 / 100 |
| 8 | Air quality & atmospheric emissions | ⏳ Tomorrow | — |
| 9 | Site hygiene / pest control / general premises | ⏳ After S8 | — |

---

## Cross-Cutting Pattern (confirmed in every session)

> **"UAB has the right model, nobody else does"** — this phrase recurs in Sessions 2–7.
> UAB (`uabCriteria.ts`) is consistently the most complete facility type across every category.
> The fix is always the same: promote UAB's model to the shared baseline or to a tier,
> then delete the incomplete independent versions from other files.

A second cross-cutting pattern: **every session found at least one decree number attached
to the wrong subject**. Sessions 3, 4, and 7 each confirmed this is a systemic sourcing
problem, not an isolated typo. A full legal-citation verification pass is needed before
the library can be called legally defensible.

---

## Global Structural Issues (affects all 18 checklists)

### G-1 — `baseFoodCriteria` spread into 8 checklists with no facility-type filter
**Status:** 🔴 Confirmed — produces real duplicate criteria and applicability mismatches.

`criteriaData.ts` spreads `...baseFoodCriteria` (14 items) into:
`uab`, `abattoir`, `couvoir`, `upd`, `slaughterhouseSmall`, `bakery`, `coldRoom`, `produceStorage`

**Two concrete problems (Session 5):**
- `bakery` and `coldRoom` independently wrote their own versions of surface-hygiene,
  handwashing, pest-control, and temperature criteria — different wording, same concept,
  both shown to the inspector on the same visit.
- `coldRoom`'s 0–5°C / ≤-18°C thresholds are encoded twice independently — one copy
  could be edited in future without the other being updated.
- `couvoir` and `UPD` are shown "frozen food ≤ -18°C" on every inspection despite having
  no freezers — inspector must manually mark N/A every time.

**Fix:** Add `applicableFacilityTypes` flags on equipment-specific items so irrelevant
criteria are filtered out. Remove standalone restatements from `bakeryCriteria` and
`coldRoomCriteria` that duplicate what the shared baseline already covers.

### G-2 — Legacy numeric series live alongside new AX series (active double-scoring)
**Status:** 🔴 Confirmed across Sessions 2, 3, 6 — same pattern in every category.

Full consolidated delete list (these IDs are confirmed duplicates of their AX equivalents):

| File | Delete | Kept by |
|---|---|---|
| `abattoirCriteria.ts` | `04-01`, `04-03`, `04-04`, `04-05`, `04-06`, `04-08`, `04-09`, `04-11` | `ABT-AX*` series |
| `uabCriteria.ts` | `01-01`, `01-02`, `01-04`, `01-05`, `01-06`, `01-07`, `01-08`, `01-11`, `01-12` | `UAB-AX*` series |
| `updCriteria.ts` | `03-01`, `03-03`, `03-05`, `03-06`, `03-07`, `03-09`, `03-10` | `UPD-AX*` series |
| `couvoirCriteria.ts` | `02-01`, `02-02`, `02-06`, `02-09`, `02-10` | `COU-AX*` series |

### G-3 — Universal double-licensing check (Session 7)
**Status:** 🔴 Confirmed — every inspection asks about the operating license twice.

`BGN-01-01` (in `baseGeneralCriteria`, spread into all 18 checklists) checks operating
license validity. Every facility-specific file *also* has its own version:
`BLS-01-01`, `CAR-01-01`, `CWS-01-01`, `MRB-01-01`, `PNT-01-01`, `PRT-01-01`,
`MCH-29-01`, `GPL-01-01`, `SPH-01-01`, `BAK-10-01`, `CLD-17-01`, `PRD-01-01`.

**Fix:** Merge each facility-specific license criterion into `BGN-01-01` as activity-specific
sub-fields. Keep the facility-specific detail (it's valuable); remove the redundant
top-level restatement of "a valid license exists."
**Best practice to adopt:** `MCH-29-01` (mechanic) is the only criterion that explicitly
catches "operating with NO license at all" — this phrasing should become the universal
standard, not a one-off.

### G-4 — `UAB-AX2-02` duplicates `BGN-02-04` (Session 7)
Delete `UAB-AX2-02` — it restates the building permit/conformity check already in baseline.

---

## Session 1 — Water Supply / Potable Water

### S1-1 — Missing potable-water criterion in `carWashCriteria.ts`
🔴 **Add** `CWS-AX2-01` — Attestation of potable water source (ADE certificate or
accredited lab analysis ≤ 6 months, Art. 3 Décret 11-219).

### S1-2 — Missing potable-water criterion in `marbleCriteria.ts`
🔴 **Add** `MRB-AX2-01` — same obligation as S1-1.

### S1-3 — `PRD-05-01` mis-filed under water axis
🔴 "Storage of fresh produce — temperature and humidity control" belongs in the
solid-waste / storage axis, not the liquid-discharge axis in `updCriteria.ts`.
Move to correct axis. (Resolved by Session 3 structure.)

---

## Session 2 — Wastewater / Liquid Discharge

### S2-1 — No numeric compliance thresholds anywhere in the wastewater module
🔴 Every wastewater criterion says "pretreat effluents" with no threshold.
Décret 06-141 sets enforceable limits:

| Parameter | Threshold |
|---|---|
| pH | 6.5 – 8.5 |
| Suspended solids | ≤ 35 mg/L |
| BOD₅ | ≤ 35 mg/L |
| COD | ≤ 120 mg/L |
| Hydrocarbons / oils & grease | ≤ 10 mg/L |
| Temperature | ≤ 30 °C |

**Fix:** Replace generic "pretreat" wording with criterion text naming the Décret and
parameter class. Use the `numericField` schema pattern (already proven in Session 5 for
food-safety temperature checks — reuse, don't rebuild).

### S2-2 — Two discharge-permit regimes conflated into one criterion
🔴 Affects `UAB-AX3-02` and equivalents in abattoir/UPD/couvoirs.
- **Sewer discharge** → Décret 09-209 Art. 12 (ADE/municipal permit)
- **Natural environment discharge** → Loi 05-12 Art. 51 + Décret 06-141 (ANRH/DRE)

**Fix:** Split into `*-AX3-Xa` (sewer) and `*-AX3-Xb` (natural environment) with
`applicability: conditional` on the one not relevant to the facility's connection type.

### S2-3 — `UAB-AX3-02` has correct permit→lab chain; others don't
🔴 `abattoirCriteria`, `updCriteria`, `couvoirCriteria`, `carWashCriteria`,
`marbleCriteria` all missing the lab-analysis step.
**Fix:** Propagate UAB's permit→grease trap→lab chain; add `CWS-AX3-01`, `MRB-AX3-01`.

### S2-4 — `ABT-AX3-01` controlType mismatch
🔴 Set to `'test'`; should be `'measurement'` for lab-analysis verification.

---

## Session 3 — Solid & Hazardous Waste

### S3-1 — Legal mis-citation: `PRT-03-03` cites Décret 04-409 for SDS
🔴 **Confirmed legal error.** Décret 04-409 governs *transport of hazardous waste*,
not chemical storage / SDS. SDS obligations trace to Loi 88-07 + labor-safety texts.
**Fix:** Rewrite `PRT-03-03` — remove or replace the Décret 04-409/SDS claim with the
correct legal basis.

### S3-2 — Waste classification/segregation step missing outside UAB
🔴 UAB is the only facility type that asks inspectors to verify waste is *inventoried
and classified* before checking storage/disposal (`UAB-AX4-01`/`02`). Every other type
(mechanic, paint shop, printing, abattoir, marble, blacksmith) skips straight to
"is it in a labeled bin" — meaning classification is never verified anywhere else.
**Fix:** Extend waste inventory/classification/segregation-at-source criteria to:
mechanic, paint shop, printing, abattoir, marble, blacksmith — modeled on `UAB-AX4-01`/`02`.

### S3-3 — "Contract with approved operator" proves intent, not compliance
🔴 Nine facility types check for a signed contract but never ask for a **transfer
manifest/receipt** proving the contract is being executed. A signed-but-unused contract
passes identically to a working system.
Additionally: none of these criteria cite **Décret 09-19** (the instrument defining
waste-collector accreditation), so "approved operator" is checked without a legal basis
for what "approved" means.
**Fix:** Add Décret 09-19 citation + upgrade evidence requirement from "contract copy"
to "contract copy + most recent transfer manifest/receipt" across:
`UAB-AX4-04`, `MCH-29-04`, `PNT-03-02`, `PRT-03-02`, `ABT-AX4-03`, `SLH-05-05`.

### S3-4 — No general on-site incineration/open-burning ban
🔴 Open burning of waste is only covered by one carpentry-specific criterion about
wood scraps (`CAR-03-02`). No general ban in `baseGeneralCriteria`.
**Fix:** Add a general on-site incineration ban to `baseGeneralCriteria`.

### S3-5 — UPD manure criteria rest on borrowed citation
🟡 `UPD-AX5-02` explicitly borrows the industrial-discharge Décret 06-141 "by extension"
for agricultural/livestock waste — the checklist's own author flagged uncertain legal footing.
**Fix:** Replace borrowed citation with the correct agriculture/livestock-specific
waste-management text.

### S3-6 — Animal by-product pathway conflated with generic hazardous waste
🟡 Condemned slaughter material onward treatment (rendering, incineration, burial) is
not covered by a generic "special waste contract." Add a veterinary/animal-by-product
criterion for abattoir, slaughterhouse, UPD citing **Décret 03-478**.
Also: add a **mechanic/car-wash used-oil** citation for **Décret 93-161** (discharge
prohibition) alongside the already-cited 93-162 (recovery obligation).

---

## Session 4 — Fire Safety & Hazardous Substances

### S4-1 — Décret 04-409 mis-cited across 8 GPL criteria (most consequential citation error in the audit)
🔴 **Confirmed.** `GPL-01-01`, `GPL-01-02`, `GPL-02-01`, `GPL-02-02`, `GPL-03-01`,
`GPL-03-02`, `GPL-04-01`, `GPL-04-02` all cite Décret 04-409 (hazardous-waste transport)
as the legal basis for LPG operating license, accreditation, cylinder storage, spark-free
tools, and maintenance logs. The correct instrument is **Décret 21-430 (4 novembre 2021)**.
**Fix:** Wholesale citation replacement in `gplCriteria.ts`. Verify article numbers against
the actual text before publishing.

### S4-2 — Décret 09-410 mis-cited for emergency intervention plans
🔴 `GPL-03-03` and `UAB-AX1-04` cite Décret 09-410 (governs *security-sensitive
military equipment* — night-vision, sonar, mine-detection) for internal emergency plans.
The correct instrument is **Décret 09-335 (20 octobre 2009)** (internal intervention plans
for industrial facility operators).
**Fix:** Replace `09-410` with `09-335` in both files.

### S4-3 — No electrical safety or fire alarm/detection criteria anywhere in the library
🔴 **Confirmed zero-coverage gap.** A targeted search across all criteria files for
alarm, grounding, electrical-panel, and lightning-protection terms returned zero matches.
**Fix:** Add to `baseGeneralCriteria`:
- Basic electrical-safety criterion (panel condition, no exposed/spliced wiring, grounding)
- Fire-alarm/smoke-detection check, scaled by facility risk tier

### S4-4 — Extinguisher checks verify presence only, never the service-tag date
🟡 Every extinguisher criterion confirms "a working-looking extinguisher was present."
None ask for the annual service tag date.
**Fix:** Add "service tag dated within 12 months" as an evidence requirement everywhere
an extinguisher criterion currently exists.

### S4-5 — Small-facility types bundle extinguisher with unrelated housekeeping
🟡 `CWS-05-01`, `MCH-29-06`, `CAR-04-03`, `PRT-05-02`, `BLS-04-03` each bundle
a fire-extinguisher check with an unrelated housekeeping observation in one pass/fail item.
**Fix:** Split each into two separate criteria (fire safety + housekeeping).

### S4-6 — UAB's risk-study and physical fire-prevention measures never cross-verified
🟡 `UAB-AX1-04` (risk study on file) and `UAB-AX7-03/04/05` (physical measures)
are treated as two disconnected checkboxes.
`UAB-AX7-04` also has `controlType: 'visual'` despite explicitly requiring "documented
periodic maintenance" in its own text — should be `'doc'`.
**Fix:** Add a cross-reference criterion verifying physical measures match the risk study.
Fix `UAB-AX7-04` controlType → `'doc'`.

### S4-7 — Blacksmith's gas-cylinder criterion independently reinvented from GPL
🟡 `BLS-04-02` covers the same ground as `GPL-02-01` but lacks full/empty separation
and stock-ceiling requirements. Merge into a shared compressed-gas-cylinder-storage module.

### S4-8 — EIA / major-hazard risk study scoped to UAB only
🟡 Abattoir and UPD have comparable environmental footprints but no EIA/impact-study criterion.
Décret 06-198's trigger is impact category, not facility type.
**Fix:** Extend `UAB-AX1-03`/`AX1-04` equivalent to abattoir and UPD where applicable.

---

## Session 5 — Food Safety & Hygiene

### S5-1 — HACCP plan required for bakery but not abattoir/slaughterhouse/cold room
🔴 Bakery has `BAK-10-10` (documented HACCP plan with CCPs). Abattoirs, small
slaughterhouses, and cold rooms — higher-risk from a food-safety standpoint — have none.
**Fix:** Add HACCP-plan criterion to abattoir, slaughterhouse, and cold room, modeled
on `BAK-10-10`. Fix imprecise citation: "القرار الوزاري المشترك 2020 HACCP" → specific
instrument number.

### S5-2 — Traceability exists in two independent versions; absent from highest-risk files
🔴 `CLD-17-07` (cold room) and `PRD-05-02` (produce storage) independently wrote the
same traceability register requirement. Abattoir, slaughterhouse, couvoir, and UAB have
no traceability criterion at all.
**Fix:** Add a shared traceability criterion to `baseFoodCriteria` itself, extended to
all food/agro facility types.

### S5-3 — Pest control has three independent, unreconciled lineages
🟡 `BGN-07-*` (general baseline), `BFD-07-*` (food-specific baseline), `PRD-04-*`
(produce storage) — three independently-written pest-control criterion sets.
**Fix:** Merge into one shared pest-control module; `BFD-07-02`'s trap-map + follow-up
requirement is the strongest version and should be the template.

### S5-4 — `numericField` schema is proven and underused (positive finding)
✅ Food-safety temperature checks (`BFD-05-02`/`03`, `CLD-17-04`) correctly use the
`numericField` schema with min/max/warningBands. This is the fix Sessions 2 and 6 need
for wastewater thresholds and occupational noise measurement — no new engineering required.

---

## Session 6 — Occupational Health & Worker Protection

### S6-1 — Hearing-protection PPE required with no noise-exposure measurement
🔴 Ear plugs are mandated in `CAR-04-01`, `MRB-05-01`, `UAB-AX7-01` but no criterion
anywhere measures occupational noise exposure. The neighbor-facing noise criteria
(`BLS-02-01`, `CAR-02-01`, `MRB-02-01`, `PRT-02-02`) measure environmental nuisance —
they do not substitute for worker-exposure thresholds.
**Fix:** Add occupational noise-exposure measurement criterion using `numericField`
schema (same pattern as food-safety temperature, per S5-4) for blacksmith/carpentry/
marble/UAB. Use 85 dB(A)/8-hour reference.

### S6-2 — Blacksmith missing machine-guard criterion
🔴 Carpentry, marble, and printing all have machine-guard criteria. Blacksmith (`BLS-04-*`)
covers PPE, gas-cylinder storage, fire extinguisher, walkway clearance — but no moving-
machinery guarding, despite forge work involving angle grinders, power hammers, and presses.
**Fix:** Add `BLS-04-0X` machine-guard criterion modeled on `CAR-04-02`/`MRB-05-02`.

### S6-3 — Machine-guard criteria check guard presence only, not emergency stops
🟡 No existing machine-guard criterion checks emergency-stop or two-hand-operation
interlocks for higher-risk equipment (presses, power saws).
**Fix:** Add emergency-stop/interlock check alongside existing machine-guard criteria.

### S6-4 — Periodic medical-exam criteria never cite Décret 93-120
🟡 `UAB-AX7-02`, `ABT-AX7-01`, `COU-AX7-03`, `BFD-06-03` (Session 5) all cite
Loi 18-11 broadly without naming **Décret 93-120 (15 mai 1993)** — the specific decree
governing occupational medicine and periodic worker examinations.
**Fix:** Add Décret 93-120 to all four criteria.

### S6-5 — `SPH-05-01` hand-authored near-duplicate of `BFD-06-01`/`02`
🟡 `semiPharmaCriteria.ts` correctly excluded from `baseFoodCriteria` spread,
but independently wrote almost the same worker-hygiene wording anyway.
**Fix:** Align `SPH-05-01` wording with `BFD-06-01`/`02`; keep as facility-specific
reference rather than a full independent restatement.

---

## Session 7 — Documentation & Licensing

### S7-1 — Every inspection checks the operating license twice (universal G-3 above)
🔴 See **G-3** in Global Structural Issues section. All facility-specific license
criteria to be merged into `BGN-01-01` as activity-specific sub-fields.

### S7-2 — Anti-obstruction/illegal-operation criterion exists in only 1 of 18 facility types
🔴 `UAB-AX8-02` checks whether a facility is operating despite a suspension/closure order
or obstructing inspectors. This protects the inspection system itself — it should be
in `baseGeneralCriteria`, applicable to every inspection.
**Fix:** Add `BGN-AX8-01` (anti-obstruction/illegal-operation) to `baseGeneralCriteria`,
modeled on `UAB-AX8-02`.

### S7-3 — EIA / major-hazard risk study scoped to UAB only (reinforces S4-8)
🔴 See S4-8. Abattoir and UPD have comparable environmental footprints. Décret 06-198's
impact-category trigger is not facility-type-specific.
**Fix:** Extend EIA/impact-summary and major-hazard risk-study criteria to abattoir,
couvoir, and UPD where their declared capacity crosses the Décret 06-198 impact threshold.

### S7-4 — Décret 06-198 best-cited instrument in the whole library (positive finding)
✅ Documentation/licensing category uses Décret 06-198 with better article-level precision
than any other instrument in the audit series. UAB's full chain (classification →
license-to-file match → impact study → risk study → discharge permit → anti-obstruction)
is the correct model for classified-establishment documentation.

---

## Consolidated Legacy Duplicate Delete List

> These IDs confirmed as duplicates across Sessions 2–7. Remove all in one coordinated push.

| File | IDs to delete |
|---|---|
| `abattoirCriteria.ts` | `04-01`, `04-03`, `04-04`, `04-05`, `04-06`, `04-08`, `04-09`, `04-11` |
| `uabCriteria.ts` | `01-01`, `01-02`, `01-04`, `01-05`, `01-06`, `01-07`, `01-08`, `01-11`, `01-12` |
| `updCriteria.ts` | `03-01`, `03-03`, `03-05`, `03-06`, `03-07`, `03-09`, `03-10` |
| `couvoirCriteria.ts` | `02-01`, `02-02`, `02-06`, `02-09`, `02-10` |
| `uabCriteria.ts` | `UAB-AX2-02` (duplicates `BGN-02-04`) |

---

## Legal Citation Error Register

> All confirmed mis-citations. Every one of these will fail a ONEDD/legal review.

| ID | File | Wrong citation | Correct instrument |
|---|---|---|---|
| CE-1 | `prtCriteria.ts` → `PRT-03-03` | Décret 04-409 (waste transport) for SDS | Loi 88-07 + labor-safety texts |
| CE-2 | `gplCriteria.ts` → 8 criteria | Décret 04-409 for LPG licensing/accreditation/storage | Décret 21-430 (4 nov 2021) |
| CE-3 | `gplCriteria.ts` → `GPL-03-03`, `uabCriteria.ts` → `UAB-AX1-04` | Décret 09-410 (security equipment) for emergency plans | Décret 09-335 (20 oct 2009) |
| CE-4 | All files with periodic medical-exam criteria | Loi 18-11 only (unnamed implementing decrees) | Add Décret 93-120 (15 mai 1993) |
| CE-5 | `baseFoodCriteria` → `BFD-05-01`, `bakeryCriteria` → `BAK-10-10` | "القرار الوزاري المشترك 2020 HACCP" (undated, unverifiable) | Replace with specific instrument number |
| CE-6 | All "contract with approved operator" criteria | No accreditation-basis citation | Add Décret 09-19 (20 jan 2009) |
| CE-7 | `updCriteria.ts` → `UPD-AX5-02` | Décret 06-141 "by extension" for agricultural waste | Replace with correct agriculture/livestock text |

---

## Missing-Decree / Gap Register

> These instruments are missing entirely from the library.

| Decree | Subject | Needed for |
|---|---|---|
| Décret 09-19 (20 jan 2009) | Accreditation of waste collectors | All "approved operator" criteria (9 facility types) |
| Décret 93-161 (10 jul 1993) | Prohibition of oil/lubricant discharge | Mechanic + car wash (alongside already-cited 93-162) |
| Décret 03-478 (9 déc 2003) | Medical/veterinary waste management | Abattoir, slaughterhouse, UPD |
| Décret 21-430 (4 nov 2021) | LPG equipment installation conditions | Replace 04-409 in `gplCriteria.ts` |
| Décret 09-335 (20 oct 2009) | Internal intervention plans (industrial) | Replace 09-410 in GPL + UAB |
| Décret 93-120 (15 mai 1993) | Occupational medicine / periodic exams | All periodic-exam criteria |
| No instrument cited | Electrical safety (grounding, panels) | New criterion needed in `baseGeneralCriteria` |
| No instrument cited | Occupational noise exposure (worker, not neighbor) | New numeric criterion needed for blacksmith/carpentry/marble/UAB |

---

## Pre-Push Change Manifest

> Nothing pushed until Session 8 is complete and integrated.
> Check a box only when the code is committed.

### `baseGeneralCriteria.ts`
- [ ] CE-4 / G-3: Rewrite `BGN-01-01` adopting mechanic's "no license at all" phrasing as universal standard
- [ ] S3-4: Add general on-site incineration/open-burning ban
- [ ] S4-3: Add basic electrical-safety criterion (panel, wiring, grounding)
- [ ] S4-3: Add fire-alarm/smoke-detection presence check (risk-tier scaled)
- [ ] S7-2: Add `BGN-AX8-01` anti-obstruction/illegal-operation criterion (modeled on `UAB-AX8-02`)

### `criteriaData.ts`
- [ ] G-1: Add `applicableFacilityTypes` flags on `BFD-05-02`/`03` (chilled/frozen storage) to exclude couvoir/UPD/UAB

### `baseFoodCriteria.ts`
- [ ] S5-2: Add shared traceability criterion
- [ ] S5-1: Add shared HACCP-plan criterion (risk-tier: mandatory for meat/poultry/cold-chain)
- [ ] CE-5: Fix undated "2020 HACCP joint ministerial order" citation in `BFD-05-01` → specific instrument

### `abattoirCriteria.ts`
- [ ] G-2: Delete `04-01`, `04-03`, `04-04`, `04-05`, `04-06`, `04-08`, `04-09`, `04-11`
- [ ] S2-3: Add lab-analysis step to wastewater criterion chain
- [ ] S2-4: Fix `controlType` on `ABT-AX3-01` → `'measurement'`
- [ ] S2-2: Split discharge criterion into sewer vs natural-environment
- [ ] S3-2: Add waste inventory/classification/segregation criterion (modeled on `UAB-AX4-01`/`02`)
- [ ] S3-3: Add Décret 09-19 + transfer-manifest requirement to `ABT-AX4-03`
- [ ] S3-6: Add veterinary/animal-by-product criterion (Décret 03-478)
- [ ] S4-4: Add extinguisher service-tag date check
- [ ] S4-8 / S7-3: Add EIA/impact-study criterion (Décret 06-198, impact-category triggered)
- [ ] S5-1: Add HACCP-plan criterion
- [ ] S6-4: Add Décret 93-120 to `ABT-AX7-01` medical-exam criterion
- [ ] G-3: Remove `ABT-AX1-01` standalone license criterion (merge into `BGN-01-01`)

### `uabCriteria.ts`
- [ ] G-2: Delete `01-01`, `01-02`, `01-04`, `01-05`, `01-06`, `01-07`, `01-08`, `01-11`, `01-12`
- [ ] G-4: Delete `UAB-AX2-02` (duplicate of `BGN-02-04`)
- [ ] S2-2: Split `UAB-AX3-02` into sewer vs natural-environment criteria
- [ ] S3-3: Add Décret 09-19 + transfer-manifest to `UAB-AX4-04`
- [ ] S4-2 / CE-3: Replace Décret 09-410 with 09-335 in `UAB-AX1-04`
- [ ] S4-6: Add risk-study-to-physical-measures cross-reference criterion
- [ ] S4-6: Fix `UAB-AX7-04` `controlType` → `'doc'`
- [ ] S6-4: Add Décret 93-120 to `UAB-AX7-02` medical-exam criterion
- [ ] G-3: Remove `UAB-AX1-01`/`AX1-02` standalone license criteria (merge into `BGN-01-01`)

### `updCriteria.ts`
- [ ] G-2: Delete `03-01`, `03-03`, `03-05`, `03-06`, `03-07`, `03-09`, `03-10`
- [ ] S1-3: Move `PRD-05-01` to solid-waste/storage axis
- [ ] S2-3: Add lab-analysis step to wastewater criterion chain
- [ ] S2-2: Split discharge criterion
- [ ] S3-5 / CE-7: Replace borrowed Décret 06-141 citation in `UPD-AX5-02` with correct livestock text
- [ ] S3-6: Add veterinary/animal-by-product criterion (Décret 03-478)
- [ ] S4-8 / S7-3: Add EIA/impact-study criterion (Décret 06-198, impact-category triggered)
- [ ] G-3: Remove `UPD-AX1-01`/`AX1-02` standalone license criteria (merge into `BGN-01-01`)

### `couvoirCriteria.ts`
- [ ] G-2: Delete `02-01`, `02-02`, `02-06`, `02-09`, `02-10`
- [ ] S2-3: Add lab-analysis step to wastewater criterion chain
- [ ] S2-2: Split discharge criterion
- [ ] S6-4: Add Décret 93-120 to `COU-AX7-03` medical-exam criterion
- [ ] G-3: Remove `COU-AX1-01`/`AX1-02` standalone license criteria (merge into `BGN-01-01`)

### `carWashCriteria.ts`
- [ ] S1-1: Add `CWS-AX2-01` — potable water source attestation (Décret 11-219)
- [ ] S2-3: Add `CWS-AX3-01` — discharge permit + grease trap + lab chain
- [ ] S3-3: Add Décret 09-19 + transfer-manifest to used-oil disposal criterion
- [ ] S3-6: Add Décret 93-161 to `CWS-04-02` (used-oil discharge prohibition)
- [ ] S4-5: Split `CWS-05-01` into fire-extinguisher criterion + separate housekeeping criterion
- [ ] S4-4: Add extinguisher service-tag date check
- [ ] G-3: Remove `CWS-01-01` (merge into `BGN-01-01`)

### `marbleCriteria.ts`
- [ ] S1-2: Add `MRB-AX2-01` — potable water source attestation
- [ ] S2-3: Add `MRB-AX3-01` — discharge permit + settling tank + lab chain
- [ ] S3-2: Add waste inventory/classification/segregation criterion
- [ ] S3-3: Add Décret 09-19 + transfer-manifest to `MRB-04-01`
- [ ] S4-4: Add extinguisher service-tag date check
- [ ] S6-1: Add occupational noise-exposure measurement criterion (`numericField`, 85 dB(A))
- [ ] G-3: Remove `MRB-01-01` (merge into `BGN-01-01`)

### `mechanicCriteria.ts`
- [ ] S3-2: Add waste inventory/classification/segregation criterion
- [ ] S3-3 / CE-6: Add Décret 09-19 + transfer-manifest to `MCH-29-04`
- [ ] S3-6: Add Décret 93-161 to `MCH-29-03` (used-oil discharge prohibition)
- [ ] S4-5: Split `MCH-29-06` into fire-extinguisher + housekeeping criteria
- [ ] S4-4: Add extinguisher service-tag date check
- [ ] G-3: `MCH-29-01` — adopt its "no license at all" branch as universal BGN-01-01 phrasing (then remove MCH-specific duplicate)

### `paintShopCriteria.ts`
- [ ] S3-2: Add waste inventory/classification/segregation criterion
- [ ] S3-3 / CE-6: Add Décret 09-19 + transfer-manifest to `PNT-03-02`
- [ ] S4-4: Add extinguisher service-tag date check
- [ ] G-3: Remove `PNT-01-01` (merge into `BGN-01-01`)

### `printingCriteria.ts`
- [ ] S3-1 / CE-1: Rewrite `PRT-03-03` — replace Décret 04-409 SDS citation with Loi 88-07 basis
- [ ] S3-2: Add waste inventory/classification/segregation criterion
- [ ] S3-3 / CE-6: Add Décret 09-19 + transfer-manifest to `PRT-03-02`
- [ ] S4-5: Split `PRT-05-02` into machine-guard criterion + extinguisher criterion
- [ ] S4-4: Add extinguisher service-tag date check
- [ ] G-3: Remove `PRT-01-01` (merge into `BGN-01-01`)

### `blacksmithCriteria.ts`
- [ ] S3-2: Add waste inventory/classification/segregation criterion
- [ ] S3-3 / CE-6: Add Décret 09-19 + transfer-manifest to relevant waste criterion
- [ ] S4-5: Split `BLS-04-03` into fire-extinguisher + housekeeping criteria
- [ ] S4-4: Add extinguisher service-tag date check
- [ ] S4-7: Merge `BLS-04-02` gas-cylinder criterion into shared compressed-gas module with GPL
- [ ] S6-2: Add machine-guard criterion (modeled on `CAR-04-02`)
- [ ] S6-1: Add occupational noise-exposure measurement criterion
- [ ] G-3: Remove `BLS-01-01` (merge into `BGN-01-01`)

### `carpentryCriteria.ts`
- [ ] S4-5: Split `CAR-04-03` into fire-extinguisher + housekeeping criteria
- [ ] S4-4: Add extinguisher service-tag date check
- [ ] S6-1: Add occupational noise-exposure measurement criterion (`numericField`, 85 dB(A))
- [ ] S6-3: Add emergency-stop/interlock check alongside `CAR-04-02`
- [ ] G-3: Remove `CAR-01-01` (merge into `BGN-01-01`)

### `gplCriteria.ts`
- [ ] CE-2 / S4-1: Replace Décret 04-409 with Décret 21-430 in `GPL-01-01`, `GPL-01-02`, `GPL-02-01`, `GPL-02-02`, `GPL-03-01`, `GPL-03-02`, `GPL-04-01`, `GPL-04-02` (verify article numbers)
- [ ] CE-3 / S4-2: Replace Décret 09-410 with Décret 09-335 in `GPL-03-03`
- [ ] S4-4: Add extinguisher service-tag date check
- [ ] S4-7: Convert `GPL-02-01` into shared compressed-gas-cylinder-storage module
- [ ] G-3: Remove `GPL-01-01` license criterion (merge into `BGN-01-01`)

### `slaughterhouseSmallCriteria.ts`
- [ ] S3-6: Add veterinary/animal-by-product criterion (Décret 03-478)
- [ ] S5-1: Add HACCP-plan criterion
- [ ] S3-3 / CE-6: Add Décret 09-19 + transfer-manifest to `SLH-05-05`

### `bakeryCriteria.ts`
- [ ] S5-1 / CE-5: Fix undated HACCP citation in `BAK-10-10` → specific instrument
- [ ] G-1: Remove `BAK-10-07`, `BAK-10-08`, `BAK-10-09` standalone restatements of `BFD-*` (keep bakery-specific additions only, no duplication)
- [ ] G-3: Remove `BAK-10-01` (merge into `BGN-01-01`)

### `coldRoomCriteria.ts`
- [ ] G-1: Remove `CLD-17-02` through `CLD-17-05` concept-for-concept restatements of `BFD-05-*`
- [ ] S5-1: Add HACCP-plan criterion
- [ ] G-3: Remove `CLD-17-01` (merge into `BGN-01-01`)

### `semiPharmaCriteria.ts`
- [ ] S6-5: Align `SPH-05-01` wording with `BFD-06-01`/`02`
- [ ] G-3: Remove `SPH-01-01` (merge into `BGN-01-01`)

### `produceStorageCriteria.ts`
- [ ] S5-3: Merge `PRD-04-*` pest-control criteria into shared pest-control module
- [ ] S5-2: Replace `PRD-05-02` traceability with shared `baseFoodCriteria` traceability criterion
- [ ] G-3: Remove `PRD-01-01` (merge into `BGN-01-01`)

---

## Open Questions (resolve in Session 8 or later)

| ID | Question | Raised in |
|---|---|---|
| OQ-1 | Does `mechanicCriteria.ts` owe a discharge permit for wash-down water? | Session 2 |
| OQ-2 | `paintShopCriteria.ts` — solvent-wash water: sewer or natural-env regime? | Session 2 |
| OQ-3 | `printingCriteria.ts` — ink/solvent discharge: which axis? water or solid waste? | Session 2 |
| OQ-5 | `conditionalApplicability` field — does the type support it? Verify in `types.ts` | Session 2 |
| OQ-6 | Session 4 flagged paint shop / GPL / printing may owe major-hazard risk study — confirm capacity threshold | Session 4 |
| OQ-7 | Correct specific instrument number for the "2020 HACCP joint ministerial order" in `BFD-05-01` | Session 5 |
| OQ-8 | Correct specific Algerian instrument for occupational noise-exposure limit (85 dB(A) reference) | Session 6 |
| OQ-9 | Session 8 (air quality) — expected to surface UAB dust-extraction and carpentry/marble extraction criteria; coordinate with S6-1 noise/PPE findings | Session 6 |

---

## What is NOT Changing

- Scoring weights and severity levels — no changes without a dedicated scoring session
- Any file not listed in the change manifest above
- `jest.config.js`, `jest.setup.ts`, `TESTING.md` — completely separate concern

---

*Each session appends its findings. Push manifest checked only when code is committed.*
*Session 8 (air quality) results will be merged here before the coordinated push.*

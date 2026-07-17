# SafeInspect-APP — Implementation Roadmap

> **Source of truth:** [`docs/RAQIB_Fix_Spec_v2.md`](./RAQIB_Fix_Spec_v2.md) — read that file before applying any phase.
> All phase numbers here correspond 1-to-1 with that document's section numbering.
> This roadmap tracks *status* only; the mechanical diffs live in the spec.

---

## Phase Status Overview

| Phase | Gap(s) | File(s) | Status |
|---|---|---|---|
| 0 | G14 — peer-dep ERESOLVE | `package.json` | ❌ Needed |
| 1 | G1 — facility↔checklist mapping | `src/criteriaData.ts` | ❌ Needed |
| 2 | G15 + G17 — `Category` type + `CorrectiveAction.severity` | `src/types.ts` | ❌ Needed |
| 3 | G16 — `numericField` schema | `baseFoodCriteria.ts`, `blacksmithCriteria.ts`, `uabCriteria.ts` | ❌ Needed |
| 4 | G17 — repository refactor completion | `InspectionRepository.ts`, `ApprovalRepository.ts`, `SyncService.ts`, `PhotoService.ts`, `BackupService.ts` | ❌ Needed |
| 5 | G13 — sync endpoint path | `SyncService.ts` | ❌ Needed |
| 6 | G2 — legal citation corrections (noise / machine-guarding) | `blacksmithCriteria.ts`, `uabCriteria.ts`, `baseGeneralCriteria.ts` + 7 files | ❌ Needed |
| 7 | G8 — mechanic checklist | `mechanicCriteria.ts` | ✅ **SUPERSEDED** — already resolved live |
| 8 | G18 — Décret 06-141 mis-cited for air emissions | `paintShopCriteria.ts`, `printingCriteria.ts`, `blacksmithCriteria.ts` | ❌ Needed |
| 9 | — Revert backwards "corrections" in roadmap | `BLS-04-06`, `PRT-02-03`, `PNT-02-03`, `BLS-04-07` | 🔴 Urgent revert |
| **11** | **G-CH7 — Chapter 7 Air Quality integration** | `src/criteria/`, `src/criteriaData.ts` | ❌ New — see below |

---

## Priority Order (if starting fresh)

1. **Phase 9** — revert the two backwards corrections first (they corrupt G2/G18 fixes otherwise)
2. **Phase 0** — unblock clean `npm install`
3. **Phase 2** — unblock `tsc --noEmit`
4. **Phase 4** — fix CAP auto-creation (likely broken in production today — see §4.2)
5. **Phase 1** — correct facility↔checklist routing
6. **Phase 8 + 6** — legal citation correctness
7. **Phase 3** — `numericField` schema
8. **Phase 5** — sync endpoint
9. **Phase 11** — air quality criteria expansion

---

## Phase 11 — Chapter 7: Air Quality & Atmospheric Emissions

### Background

Chapter 7 of the Inspection Manual (`Inspection_Manual_Chapter7_Air_Quality.txt`) defines
the legal basis, inspection methodology, compliance criteria, and reference-value gaps for
**air quality and atmospheric emission control** at regulated facilities. This phase
translates that chapter into actionable checklist criteria and cross-references.

### Legal Instruments

| Instrument | Date | Scope | Integration status |
|---|---|---|---|
| **Décret exécutif n° 06-138** | 15 avril 2006 | Point-source industrial emission control (gas, smoke, vapor, particles) — **correct instrument** for facility-level VOC/dust limits | Confirmed. Numeric annex table **not yet located** — see Open Research Task below |
| Décret exécutif n° 06-02 | 7 janvier 2006 | Ambient air-quality objectives / alert levels (public-health standard, distinct from point-source control) | Confirmed. Cross-reference open: may be incorporated by 06-138 by reference |
| Décret exécutif n° 07-299 | 27 septembre 2007 | Supplementary industrial air-pollution tax (parallel to 07-300 for wastewater) | Confirmed by title citation — administrative/fiscal |
| Loi n° 03-10 | 19 juillet 2003 | General environmental protection; neighbor nuisance (noise, odor, emissions) | Confirmed, foundational |

> ⚠️ **Known gap:** The numeric annex table of Décret 06-138 (emission-limit values per
> pollutant) has **not been extracted** despite three research attempts. Until it is, all
> emission-limit numeric thresholds in criteria files must cite 06-138 without a specific
> limit value, and reference the WHO/international best-practice figure as an interim
> standard only. See "Open Research Task" below.

### Compliance Criteria (to be added to affected checklist files)

These criteria reflect the chapter's Compliance Criteria section (§5). Apply them to any
facility type whose activity generates significant airborne emissions (paint booth, marble
cutting, carpentry/woodwork, blacksmith, printing).

**Critical non-compliance:**
- No emission-control equipment (extraction/filtration/suppression) for a known
  high-emission activity (paint booth, marble cutting, uncontrolled milling).

**Major non-compliance:**
- Equipment present but visibly inadequate: heavy dust accumulation, visible bypass, or
  an instrumented measurement showing exceedance of the applicable limit.

**Minor non-compliance:**
- Equipment present and operating, but most recent emissions measurement record is
  administratively overdue.

**Compliant:**
- Appropriate extraction/suppression equipment present and visibly operating; measurement
  record current and within limits (where a monitoring obligation applies).

**Not applicable:**
- Activity genuinely generates no significant airborne emission — verify against the
  technical file.

### Criteria IDs to Add (per facility type)

> These criteria extend the existing checklists for the listed facility types.
> Before adding, `grep` the file for the proposed ID to avoid collisions.

| Facility type / file | Criterion ID | Axis | Description (Arabic) | Legal reference |
|---|---|---|---|---|
| `paintShopCriteria.ts` | `PNT-07-01` | الانبعاثات الجوية | وجود نظام سحب وتهوية فعّال (هود استخراج أو كشف كهربائي) في كابينة الطلاء، بما يمنع تراكم الأبخرة المذيبة (VOC) في منطقة العمل والمحيط | المرسوم التنفيذي 06-138 (مراقبة الانبعاثات الهوائية الصناعية) + القانون 03-10 |
| `paintShopCriteria.ts` | `PNT-07-02` | الانبعاثات الجوية | الاحتفاظ بسجل قياس انبعاثات هوائية حديث وساري المفعول (حيث يُوجب النشاط/الحجم رقابة دورية) | المرسوم التنفيذي 06-138 + المرسوم التنفيذي 07-299 (الضريبة التكميلية على التلوث الهوائي) |
| `marbleCriteria.ts` | `MRB-07-01` | الانبعاثات الجوية | وجود نظام ترطيب أو شفط غبار فعّال عند أجهزة القطع والتلميع — لا يُقبل التراكم المرئي للغبار الكثيف | المرسوم التنفيذي 06-138 + القانون 03-10 المادة 27 (الإزعاج الجواري) |
| `marbleCriteria.ts` | `MRB-07-02` | الانبعاثات الجوية | الاحتفاظ بسجل قياس الغبار المعلق (حيث تُوجبه طاقة الإنتاج اليومية) | المرسوم التنفيذي 06-138 + المرسوم التنفيذي 07-299 |
| `carpenteryCriteria.ts` | `CRP-07-01` | الانبعاثات الجوية | وجود مجمّع أو منفضة شفط فعّالة لجمع نشارة الخشب والغبار الناعم، مع تفريغ منتظم للحقيبة/الخزان — التراكم المرئي يُعدّ مخالفة | المرسوم التنفيذي 06-138 + القانون 03-10 |
| `printingCriteria.ts` | `PRT-07-01` | الانبعاثات الجوية | وجود تهوية عامة كافية أو نظام ترشيح لتحكم في تراكم الأبخرة المذيبة (أحبار/مواد تنظيف) في منطقة الطباعة | المرسوم التنفيذي 06-138 + القانون 03-10 |
| `blacksmithCriteria.ts` | `BLS-07-01` | الانبعاثات الجوية | وجود نظام سحب دخان اللحام والغبار المعدني عند محطات اللحام والطحن — يُعدّ التراكم المرئي على الجدران والأسقف مؤشراً على قصور النظام | المرسوم التنفيذي 06-138 + القانون 03-10 |

### Inspection Methodology (from Chapter 7 §4)

**What the inspector observes (visual):**
- Extraction / filtration / suppression equipment: presence and operating condition
- Visible dust accumulation on walls, surfaces, or equipment — indirect exceedance indicator
- Odor intensity outside the facility boundary
- Evidence of equipment bypass (disconnected ducts, sealed extraction ports)

**Documents to request:**
- Most recent emissions measurement record (where a monitoring obligation applies)
- Décret 07-299 pollution-tax registration — documentary cross-check that the facility
  has self-declared as an industrial emitter (parallel to Chapter 2's wastewater-tax check)

**Measurements (field):**
None independently performable by a municipal inspector without instrumentation.
This is a **documentary + visual** chapter. Lab-measurement verification is reserved for
facilities whose activity and scale trigger a statutory monitoring obligation.

**Evidence to collect:**
- Photographs of extraction / suppression equipment (operating vs. idle)
- Copy of the most recent emissions measurement record (where legally required)

### Cross-references

- **Chapter 3 (Fire Safety):** dust/vapor extraction equipment doubles as fire-prevention
  control for paint booths, woodwork, and marble cutting — coordinate findings.
- **Chapter 5 (Occupational Health):** particulate and VOC exposure is a worker-health
  pathway; cross-reference respiratory PPE criteria.
- **Phase 8 of this roadmap:** the 06-141 mis-citation fix already corrects the
  *legal reference* on existing PNT/PRT/BLS criteria — Phase 11 adds new *criteria items*
  on top of those corrected references.

### Open Research Task: Décret 06-138 Numeric Annex

**Priority: HIGH — this is the single most important unresolved reference gap in the manual.**

The annex emission-limit table of Décret 06-138 (which sets the actual numeric ceilings per
pollutant — particulate, SO₂, NOₓ, VOC) exists but has not been extracted despite three
attempts. Until it is, numeric thresholds in criteria files must present the 85 dB / WHO
international figures as interim best-practice references, not confirmed Algerian legal limits.

**Recommended search strategy (from Chapter 7 §6):**
Search Algerian environmental-engineering theses citing `"06-138"` together with specific
pollutant names (`غبار`, `SO2`, `VOC`, `ديسيبل`) — not the decree's title alone, which is
already exhausted. Academic theses frequently reproduce the full annex table with a direct
*Journal Officiel* citation. The same strategy successfully located the Décret 06-141
wastewater annex (Chapter 1 research).

---

## Known Correct Citations (verified)

| Instrument | Confirmed scope | Notes |
|---|---|---|
| Décret 06-138 | Point-source industrial **air** emission control | ✅ Confirmed. Numeric annex not yet extracted |
| Décret 06-141 | Industrial **liquid discharge** / wastewater | ✅ Confirmed. Parameters: flow, pH, BOD5, COD, heavy metals — all liquid. **Not for air emissions.** |
| Décret 06-02 | Ambient air-quality objectives (public-alert, not facility-level) | ✅ Confirmed |
| Loi 03-10 Art. 27 | Neighbor nuisance (noise, odor, emissions) | ✅ Confirmed |
| Loi 88-07 Art. 8 | Machine guarding, emergency stops | ✅ Confirmed |
| Loi 88-07 Art. 10 | General PPE obligation | ✅ Confirmed |
| Décret 93-120 | Medical-exam obligations only | ⚠️ Not confirmed for 85 dB noise limit — see Phase 9.1 |

---

*Last updated: 2026-07-17 · Generated from RAQIB_Fix_Spec_v2.md + Inspection_Manual_Chapter7_Air_Quality.txt*

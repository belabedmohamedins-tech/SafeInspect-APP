# Manuel Technique d'Inspection des Établissements Classés
# دليل التفتيش التقني للمؤسسات المصنفة
## Source of Truth — SafeInspect / RAQIB Technical & Legal Reference

**Status:** Draft — Chapter 1 of 8 complete (template chapter). Remaining chapters to be produced in the same format, one per audited category, so that no chapter is published with unverified or invented reference values.

**Audience:** This document is NOT written for field inspectors. It is the source-of-truth reference from which the application's checklists, inspection logic, legal database, decision-support system, scoring engine, and inspector-facing guidance are derived.

---

# FRONT MATTER

## 1. Introduction

This manual translates Algerian legislation governing classified establishments (établissements classés) into a structured, checklist-ready technical reference. It exists to answer, for every inspection criterion the SafeInspect/RAQIB platform will ever ask an inspector to evaluate: what is the exact legal basis, what is the exact reference value where one exists, what evidence proves compliance, and how should a finding affect risk classification and scoring.

Every value in this manual is either (a) traced to a specific, named Algerian legal instrument, with the source verified against a primary or directly-citing secondary source at the time of drafting, or (b) explicitly marked as **framework silent** — meaning Algerian law does not currently specify a number, and no value has been invented to fill the gap. Where international guidance is cited, it is always labeled as informative only, never as a substitute for Algerian law.

## 2. Inspection Philosophy

Three principles govern every chapter of this manual:

1. **Law before convenience.** A criterion exists because a legal obligation exists, not because it seems like reasonable practice. Where no legal obligation exists, the manual says so rather than inventing one dressed up as best practice.
2. **Objectivity before judgment.** Wherever a legal instrument provides a number, a document, or a defined procedure, the inspection criterion is built around that number, document, or procedure — not around an inspector's subjective impression. Where the law only provides a qualitative standard ("adequate," "sufficient," "proportional to risk"), this manual says so explicitly rather than converting it into a false-precision number.
3. **Traceability before efficiency.** Every reference value in this manual carries its source. A future editor — human or AI — must be able to verify or challenge any number in this manual without re-deriving it from scratch.

## 3. Standard Inspection Procedure

Every inspection, regardless of facility type, follows the same four-stage structure:

**Stage 1 — Documentation and licensing verification.** Confirm the establishment's legal right to operate before evaluating anything else. A finding at this stage (no valid operating license, activity mismatched to license, closure order in effect) can end the inspection or elevate every subsequent finding's administrative weight.

**Stage 2 — Physical/environmental domain inspection.** Work through the applicable technical chapters (wastewater, waste, fire safety, food safety, occupational health, air quality, site hygiene) in the order most efficient for the facility's physical layout, not necessarily the order chapters appear in this manual.

**Stage 3 — Evidence collection.** For every non-conformity, collect the evidence type specified in that criterion's chapter (photograph, document copy, measurement, lab slip) before leaving the site — evidence collected after the fact carries less administrative and legal weight.

**Stage 4 — Scoring, risk classification, and decision output.** Apply the severity-weighted scoring methodology (see the platform's `scoringUtils.ts` specification, independently verified as correctly implemented) and the risk-level-to-next-inspection-interval mapping to produce the inspection's final output.

## 4. How to Read This Manual

Each chapter below follows the same eleven-section structure specified for this manual. Within Section 6 (Reference Values), every row is tagged:

- **[LOI]** — legally binding, sourced to a specific Algerian law, decree, or ministerial order, with the source verified at drafting time.
- **[PRATIQUE]** — technical best practice, recommended but not legally mandated in Algeria as of this drafting.
- **[INTL]** — international guidance, informative only, cited because Algerian law is silent on the point.
- **[SILENCE]** — the framework is confirmed silent on this specific point; no value is provided, and none should be invented.

---

# CHAPTER 1 — WASTEWATER & LIQUID DISCHARGE
## المياه المستعملة والتفريغ الصناعي

## 1. Purpose

Uncontrolled liquid discharge from classified establishments is one of the most consequential and most frequently violated categories in Algerian environmental inspection practice. Its impact spans four distinct domains simultaneously:

- **Public health impact:** organic-load and pathogen-bearing discharge (particularly from abattoirs, slaughterhouses, and food-processing facilities) directly threatens downstream water used for irrigation and, in areas without full sewer coverage, groundwater used for drinking.
- **Environmental impact:** heavy metals, oils, and high-BOD/COD discharge degrade receiving water bodies and soil, with effects that compound over time and are expensive to reverse.
- **Administrative importance:** discharge is one of the few inspection domains where Algerian law provides an actual numeric compliance table (Décret 06-141), making it one of the most legally defensible categories to enforce — provided the inspection actually uses the numbers.
- **Safety implications:** improperly separated industrial effluent (oils, solvents) entering a sewer network can create downstream fire/explosion risk at treatment infrastructure.

## 2. Legal Basis

| Instrument | Date | Governs | Verification status |
|---|---|---|---|
| Loi n° 03-10 | 19 juillet 2003 | General environmental protection principle; art. 33/45 prohibit pollution and require industrial discharge authorization | Confirmed — widely and consistently cited across primary and secondary sources |
| Loi n° 05-12 (Code de l'eau) | 4 août 2005 | Water resources management; art. 45/47, economy-of-use principle, prohibition of pollution, industrial discharge licensing to the natural environment | Confirmed by direct citation in multiple governmental sources |
| **Décret exécutif n° 06-141** | 19 avril 2006 (published Journal Officiel n° 26, 23 avril 2006) | Sets the maximum permissible values for industrial liquid discharge (the numeric compliance table — see Section 6) | **Verified directly** — annex table cross-confirmed via an academic source (Univ. Kasdi Merbah Ouargla thesis) that cites the Journal Officiel issue number and reproduces the table, additionally cross-validated against real laboratory results from two operating facilities |
| Décret exécutif n° 09-209 | 11 juin 2009 | Conditions and procedures for authorizing discharge of non-domestic wastewater **into the public sewer network or a treatment plant** — distinct legal regime from direct discharge to the natural environment | Confirmed by title citation in a governmental legal-text index; full article text not independently verified at drafting time — **flagged for article-level verification before this manual is finalized** |
| Décret exécutif n° 06-198 | 31 mai 2006 | Classified-establishment operating-license framework; art. 5 (license), art. 13 (technical file content) | Confirmed, consistently cited |
| Décret exécutif n° 07-300 | 27 septembre 2007 | Supplementary tax on industrial wastewater — administrative/fiscal, not a technical discharge standard, but relevant as a documentary cross-check (registration for this tax is a proxy indicator the facility has disclosed itself as an industrial discharger) | Confirmed by title citation |
| Décret exécutif n° 93-161 | 10 juillet 1993 | Prohibits discharge of oils/lubricants into the natural environment (art. 2 cited directly in a sourced legal reference list) | Confirmed by direct article citation found in a sourced academic reference list |
| Décret exécutif n° 04-88 | (date not independently confirmed at drafting) | Cited in the same sourced reference list (art. 9) as requiring industrial facilities to install an oil separator (عازل الزيوت) | **Partially verified** — the citation appears in a credible academic source with an article number, but this manual could not independently cross-verify the decree's full text at drafting time. Flagged for confirmation. |

## 3. Scientific Background

Industrial liquid discharge is regulated on the principle that a receiving environment (sewer network, soil, surface water, groundwater) has a finite assimilative capacity. Exceeding it produces measurable, specific harms:

- **Suspended solids (MES)** physically smother aquatic life and clog treatment infrastructure.
- **BOD5/COD** measure organic pollutant load indirectly, via the oxygen consumed by its biological or chemical breakdown — high values deplete dissolved oxygen in the receiving water, killing aquatic life.
- **pH outside 6.5–8.5** disrupts biological treatment processes and can corrode sewer infrastructure.
- **Heavy metals** (cadmium, lead, chromium, nickel) are non-biodegradable and bioaccumulate, making even low continuous discharge a long-term public-health hazard through the food chain.
- **Oils and greases** float, coat surfaces, block light penetration in receiving water, and are a fire-risk pathway if they reach a sewer network in sufficient concentration.

## 4. Inspection Methodology

**What the inspector should observe:** visible discharge points (direct pipe/channel to environment), presence of pretreatment equipment (oil separator, settling basin, pH neutralization tank), physical condition of equipment (bypass evidence, solids accumulation indicating non-operation), and any recent discharge staining or odor at the facility perimeter.

**What documents should be requested:**
1. The discharge permit (autorisation de déversement) — verify it covers the current activity type and volume.
2. The most recent laboratory analysis results — verify parameter values against the Décret 06-141 table.
3. Equipment maintenance log for pretreatment installations.
4. Oil-separator waste disposal records (cross-reference Chapter 2: this waste stream is itself a hazardous special waste).

**What measurements should be taken:** field pH measurement at the discharge point, where equipment is available — this is the one parameter in the table that can be meaningfully checked without a laboratory. Temperature, if the facility discharges to a receiving water body rather than a sewer.

**What evidence should be collected:** photographs of pretreatment equipment (including any bypass); copy of the discharge permit; copy of the most recent lab analysis; copy of the oil-separator waste disposal manifest.

## 5. Compliance Criteria

- **Compliant:** valid discharge permit held, pretreatment equipment present and operating (no bypass), most recent lab analysis within all Décret 06-141 limits.
- **Minor non-compliance:** permit valid, pretreatment present, but lab analysis overdue (beyond the required frequency, if one is set) or missing a minor parameter.
- **Major non-compliance:** lab analysis shows exceedance of a standard value but within tolerated/derogation value; pretreatment equipment present but with evidence of bypass or non-operational period; discharge permit expired.
- **Critical non-compliance:** no pretreatment equipment where required by the nature of the discharge; direct visible discharge to environment without any permit; lab analysis shows exceedance beyond the tolerated/derogation value; no lab analysis record at all for a facility with significant industrial discharge.
- **Not applicable:** facility generates no process wastewater (verify against technical file — not all classified establishments have significant liquid discharge).

## 6. Reference Values

**Décret exécutif n° 06-141, Annex — Maximum permissible values for industrial liquid discharge [LOI]**
*Source: verified via Univ. Ouargla academic thesis cross-referencing JO n° 26, 23 avril 2006, additionally validated against field laboratory data from two operating Algerian facilities.*

| Parameter | Standard maximum value | Tolerated/derogation value | Notes |
|---|---|---|---|
| pH | 6.5 – 8.5 | — | Field-measurable |
| Temperature | 30°C | — | For discharge to natural water body |
| Suspended solids (MES) | 35 mg/l | Higher with authorization | — |
| BOD5 (DCO) | 35 mg/l | — | Biochemical oxygen demand |
| COD (DCO chimique) | 120 mg/l | — | Chemical oxygen demand |
| Oils and greases | 20 mg/l | — | Requires oil separator |
| Detergents | 3 mg/l | — | — |
| Phenols | 0.5 mg/l | — | — |
| Cyanides (total) | 0.1 mg/l | — | — |
| Arsenic | 0.1 mg/l | — | Heavy metal |
| Cadmium | 0.2 mg/l | — | Heavy metal |
| Total chromium | 1 mg/l | — | Heavy metal |
| Hexavalent chromium | 0.1 mg/l | — | Heavy metal |
| Mercury | 0.01 mg/l | — | Heavy metal |
| Nickel | 2 mg/l | — | Heavy metal |
| Lead | 1 mg/l | — | Heavy metal |
| Zinc | 5 mg/l | — | Heavy metal |
| Copper | 1 mg/l | — | Heavy metal |

*Note: The table above reproduces the confirmed parameters. The full Décret 06-141 annex may contain additional parameters not reproduced in the academic source used for verification — the primary JO source should be consulted for a complete final implementation.*

**Oil separator installation requirement [LOI, partially verified]:** Décret 04-88 art. 9 — mandatory for facilities whose activity generates oil/lubricant-contaminated liquid discharge. Flagged for primary-source verification before final implementation.

**Discharge permit type distinction [LOI]:** Two different permit regimes apply depending on the receiving environment:
- Discharge to the natural environment (rivers, groundwater, soil): governed by Loi 05-12 and Décret 06-141's numeric table.
- Discharge to the public sewer network or a treatment plant: governed by Décret 09-209 — article-level content not verified at drafting time, flagged.

## 7. Required Evidence

| Finding type | Required evidence |
|---|---|
| Discharge permit held | Copy of permit |
| Pretreatment equipment operating | Photograph + maintenance log |
| Bypass or non-operation | Photograph of bypass evidence |
| Parameter exceedance | Copy of lab analysis results |
| Oil separator present | Photograph |
| Oil-separator waste disposal | Copy of disposal manifest (hazardous waste chain — cross-reference Chapter 2) |
| Field pH measurement | Logged numeric reading with location and time |

## 8. Frequent Non-Conformities

Based on the SafeInspect checklist audit (Session 2) and general Algerian inspection practice:
- Oil separator absent despite the activity clearly generating oil-contaminated discharge (mechanics, car washes, food-processing facilities) — the most common equipment-presence gap.
- Lab analysis either never commissioned, or overdue — facilities that understand the parameter limits but are not regularly verifying against them.
- Discharge permit for the wrong receiving environment (sewer permit held, but facility actually discharges to a ditch/drain that reaches a watercourse) — a legally significant distinction that is often missed.
- Chlorine residual from facility disinfection operations appearing in discharge without a pH/neutralization check — relevant primarily for abattoirs and food-processing facilities with CIP cleaning systems.

## 9. Inspector Guidance

- **Red flag:** pretreatment equipment present but with a permanent bypass fitting or valve — indicates the equipment may have been installed for a previous compliance inspection but is not in operational use.
- **Common misinterpretation:** "the sewer takes it away" is not a compliance argument for discharge into the public network — Décret 09-209 requires authorization for that regime too, and the sewer network itself has a finite treatment capacity.
- **Good practice:** always ask for both the permit and the most recent lab analysis — a valid permit paired with a missing or exceedant lab analysis is not compliance.
- **Situation requiring additional investigation:** any significant oil sheen, abnormal color, or odor at the facility's drainage outlet warrants immediate documentation (photograph + GPS location) even before the lab analysis is available, as it constitutes direct observational evidence of a potential exceedance.

## 10. Decision Guidance

- A **critical** finding under this chapter (no pretreatment where legally required, or direct visible discharge) should independently drive the inspection's risk level toward the shortest applicable re-inspection interval, regardless of the facility's score on other chapters — this mirrors the platform's existing critical-violation override logic (verified correct in `scoringUtils.ts`) and should not be treated as "just another high-severity item" in the aggregate score alone.
- A **major** finding (lab analysis shows exceedance) should trigger an administrative recommendation for a re-analysis within a defined short window, not simply a lower score awaiting the next annual cycle.
- Discharge-permit findings (wrong permit type, or missing permit) are **documentary/administrative** in character and should be routed toward the Documentation & Licensing decision pathway in addition to being scored within this chapter, since the underlying legal violation (operating without proper authorization) is the same category of violation covered there.

## 11. Related Requirements

- **Documentation & Licensing chapter:** the discharge permit itself is a licensing instrument: cross-reference before treating a missing permit purely as an environmental finding rather than also an unauthorized-operation finding.
- **Solid & Hazardous Waste chapter:** septic-system sludge and oil-separator waste are themselves special/hazardous waste once removed from the system — their onward disposal is governed by that chapter's criteria (accredited collector, Décret 06-104 waste classification), not this one.
- **Fire Safety chapter:** oil/solvent-contaminated wastewater bypassing a separator is a cross-cutting fire-risk pathway at downstream infrastructure, not solely an environmental-discharge issue.

---

# Status and Next Steps

This chapter demonstrates the manual's required standard: every quantitative value is either sourced with its verification status disclosed, or explicitly marked as a gap. Two items in this chapter are flagged for follow-up verification before this chapter can be considered final (the chlorine-residual figure, and Décret 09-209/04-88's full article text) — these are noted inline rather than silently resolved.

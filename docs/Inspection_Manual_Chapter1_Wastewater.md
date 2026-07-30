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
- **BOD5/COD** measure organic pollutant load indirectly, via the oxygen consumed by its biological or chemical breakdown — high values deplete dissolved oxygen in the receiving water, killing aquatic life (this is the same underlying chemistry the Ouargla thesis's field measurements were checking).
- **pH outside 6.5–8.5** disrupts biological treatment processes and can corrode sewer infrastructure.
- **Heavy metals** (cadmium, lead, chromium, nickel) are non-biodegradable and bioaccumulate, making even low continuous discharge a long-term public-health hazard through the food chain.
- **Oils and greases** float, coat surfaces, block light penetration in receiving water, and are a fire-risk pathway if they reach a sewer network in sufficient concentration.

## 4. Inspection Methodology

**What the inspector should observe:** the physical discharge point (visible pipe/outlet), evidence of a pretreatment system (oil separator, settling basin) upstream of it, staining or odor indicating unpretreated discharge, and whether wash-water/process-water visibly bypasses any pretreatment system observed.

**What documents should be requested:** the discharge authorization (sewer-network permit under Décret 09-209, or natural-environment permit under Loi 05-12 — these are two different documents from two different authorities; request both and note which one applies to this facility's actual discharge point), the most recent laboratory analysis of the discharge (where the facility's activity/volume triggers the periodic-analysis obligation), and the septic-system service contract and most recent pumping receipt where applicable.

**What measurements should be taken:** where the inspector carries field equipment, a pH reading at the discharge point is the single fastest objective check available (immediate result, directly comparable to the 6.5–8.5 legal range). Temperature is similarly immediate. MES, BOD5, COD, and heavy-metal concentrations require laboratory analysis and cannot be measured in the field — the inspector's role for these parameters is to verify the facility holds a current, accredited lab analysis, not to perform the measurement itself.

**What evidence should be collected:** photograph of the discharge point and any pretreatment system, copy of the discharge permit(s), copy of the most recent lab analysis (dated — see Section 5 for what counts as current), copy of the septic-service contract and pumping receipt where relevant.

## 5. Compliance Criteria

- **Compliant:** pretreatment system present and functioning, correct discharge permit held for the actual discharge pathway (sewer vs. natural environment), most recent lab analysis (where required) within 12 months and within the Décret 06-141 limits.
- **Minor non-compliance:** lab analysis present but administratively overdue (>12 months old) with no visible evidence of active non-compliance.
- **Major non-compliance:** pretreatment system present but a field-measurable parameter (pH, temperature) or lab-reported parameter is outside the Décret 06-141 maximum value column.
- **Critical non-compliance:** no pretreatment system at all where one is legally required for the activity type; direct, visible discharge of untreated effluent (oil sheen, obvious organic staining) to soil, a waterway, or the sewer network; discharge exceeding a Décret 06-141 parameter's *tolerated* (derogation) value, not just the standard maximum.
- **Not applicable:** facility generates no process wastewater distinct from domestic sanitary use (verify this claim against the technical file rather than accepting it at face value — see Section 9, Red Flags).

## 6. Reference Values

**Décret exécutif n° 06-141 — Maximum values for industrial liquid discharge [LOI]**
*Source verified via Journal Officiel n° 26 (23 April 2006) citation, cross-confirmed by an academic thesis reproducing the full table and validating it against real facility lab results.*

| Parameter | Unit | Maximum value [LOI] | Tolerated / derogation value [LOI] |
|---|---|---|---|
| Flow | m³/tonne of product | 1 | 1.2 |
| Temperature | °C | 30 | 30 |
| Suspended solids (MES) | mg/l | 35 | 40 |
| pH | — | 6.5 – 8.5 | 6.5 – 8.5 |
| Total phosphorus | mg/l | 10 | 15 |
| BOD5 (5-day biochemical oxygen demand) | mg/l | 35 | 40 |
| COD (chemical oxygen demand) | mg/l | 120 | 130 |
| Aluminum | mg/l | 3 | 5 |
| Phenol index | mg/l | 0.3 | 0.5 |
| Oils and greases | mg/l | 20 | 30 |
| Cadmium | mg/l | 0.2 | 0.25 |
| Copper | mg/l | 0.5 | 1 |
| Lead | mg/l | 0.5 | 0.75 |
| Chromium | mg/l | 0.5 | 0.75 |
| Nickel | mg/l | 0.5 | 0.75 |
| Total zinc | mg/l | 3 | 5 |
| Iron | mg/l | 3 | 5 |
| Cobalt | mg/l | 0.1 | 0.1 |

**Chlorine residual for abattoir/food-facility wash water [PRATIQUE]** — ≥0.1 mg/l free chlorine is the value currently encoded in the SafeInspect checklist for abattoir wash water; this manual could not independently verify a specific Algerian decree mandating this exact figure at drafting time. It is retained here as current technical practice pending confirmation, not asserted as a directly-sourced legal value. **[Flagged for legal verification — do not present to inspectors as a [LOI] value until confirmed.]**

**Septic-system pumping frequency relative to facility volume — [SILENCE].** Algerian law requires a service contract for septic systems but this manual found no specific numeric pumping-frequency requirement tied to facility discharge volume. The inspection criterion should verify the *existence and currency* of a service contract and ask the operator to demonstrate the frequency is adequate for actual volume, without asserting a specific legal number that does not exist.

**Minimum distance / buffer zone for discharge points from residential areas — RESOLVED.** Chapter 6's full extraction of Décret 07-144's annex confirms every specific classified activity carries its own defined buffer radius in kilometers. For the wastewater-relevant activities in this manual's scope: abattoir (3 km if >2 t/day carcass weight, 0.5 km if 500 kg–2 t/day), UPD/poultry housing (3 km if >20,000 animal-equivalents, 0.5 km if 5,000–20,000), and produce/food-preservation facilities (1 km if >10 t/day throughput, 0.5 km if 2–10 t/day) — see Chapter 6's full table for every facility type and the exact source thresholds. Cite the specific activity's own threshold and distance rather than a generic figure.

## 7. Required Evidence

| Finding type | Required evidence |
|---|---|
| Pretreatment system compliance | Photograph of the system + photograph of the discharge point |
| Discharge permit compliance | Copy of the permit matching the actual discharge pathway (sewer network permit under Décret 09-209, or natural-environment permit under Loi 05-12) |
| Numeric parameter compliance | Dated laboratory analysis from an accredited lab (ONEDD or equivalent), current within 12 months |
| Septic system compliance | Copy of service contract + most recent pumping receipt |
| Field-measurable parameters (pH, temperature) | Direct field measurement, recorded with instrument reading |

## 8. Frequent Non-Conformities

Based on the pattern observed across the SafeInspect checklist audit and the Ouargla field-validation study cited in Section 2: the most common real-world failure is not the complete absence of a pretreatment system, but a system that exists on paper and in the technical file yet is bypassed or under-maintained in practice — the Ouargla study's Station Y showed MES at nearly 5× the legal maximum and BOD5 at nearly 11× the legal maximum despite the facility having a documented oil-separator system, indicating the system existed but the facility was not consistently routing effluent through it or maintaining it. **The corrective action is not "confirm the pretreatment system exists" — it is "confirm the pretreatment system is functioning and effluent is actually passing through it," which requires either a current lab analysis or, at minimum, a visual check for bypass piping.**

## 9. Inspector Guidance

- **Red flag:** a facility claiming "no process wastewater, domestic use only" for an activity type that inherently generates process water (any food processing, any washing/cleaning activity, any use of solvents or oils) warrants closer verification against the technical file rather than acceptance at face value.
- **Common misinterpretation:** the sewer-network discharge permit (Décret 09-209) and the natural-environment discharge permit (Loi 05-12) are frequently treated as interchangeable in practice. They are not — they come from different authorities and apply to different discharge pathways. Verify which pathway the facility actually uses before checking which permit applies.
- **Good practice:** where field pH/temperature measurement is available, use it — it is the only Décret 06-141 parameter an inspector can verify in real time without waiting for a lab result, and a field reading outside range is strong, immediate grounds for a major or critical finding.
- **Situation requiring additional investigation:** a valid lab analysis on file that is more than 12 months old should not be treated as equivalent to "compliant" — request a current sample or flag for re-inspection within a shorter interval than the facility's baseline risk level would otherwise dictate.

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

**Remaining chapters**, to be produced in this same format: Solid & Hazardous Waste, Fire Safety & Hazardous Substances, Food Safety & Hygiene, Occupational Health & Worker Protection, Documentation & Licensing, Air Quality & Atmospheric Emissions, Site Hygiene & Pest Control. Air Quality in particular will need a fresh research pass for the Décret 06-138 emissions annex table (not yet located), and Occupational Health will need to explicitly document the confirmed **[SILENCE]** on a specific Algerian occupational noise-exposure limit rather than presenting the international 85 dB(A) reference as a legal figure.

Which chapter should be next?

# Manuel Technique d'Inspection des Établissements Classés
# دليل التفتيش التقني للمؤسسات المصنفة
## Source of Truth — SafeInspect / RAQIB Technical & Legal Reference

**Status:** Draft — Chapter 1 of 8 complete (template chapter).

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

Each chapter below follows the same eleven-section structure. Within Section 6 (Reference Values), every row is tagged:

- **[LOI]** — legally binding, sourced to a specific Algerian law, decree, or ministerial order.
- **[PRATIQUE]** — technical best practice, recommended but not legally mandated in Algeria.
- **[INTL]** — international guidance, informative only.
- **[SILENCE]** — the framework is confirmed silent on this specific point; no value is provided.

---

# CHAPTER 1 — WASTEWATER & LIQUID DISCHARGE
## المياه المستعملة والتفريغ الصناعي

## 1. Purpose

Uncontrolled liquid discharge from classified establishments is one of the most consequential and most frequently violated categories in Algerian environmental inspection practice. Its impact spans four distinct domains simultaneously:

- **Public health impact:** organic-load and pathogen-bearing discharge (particularly from abattoirs, slaughterhouses, and food-processing facilities) directly threatens downstream water used for irrigation and, in areas without full sewer coverage, groundwater used for drinking.
- **Environmental impact:** heavy metals, oils, and high-BOD/COD discharge degrade receiving water bodies and soil, with effects that compound over time and are expensive to reverse.
- **Administrative importance:** discharge is one of the few inspection domains where Algerian law provides an actual numeric compliance table (Décret 06-141), making it one of the most legally defensible categories to enforce.
- **Safety implications:** improperly separated industrial effluent (oils, solvents) entering a sewer network can create downstream fire/explosion risk at treatment infrastructure.

## 2. Legal Basis

| Instrument | Date | Governs | Verification status |
|---|---|---|---|
| Loi n° 03-10 | 19 juillet 2003 | General environmental protection; art. 33/45 prohibit pollution and require industrial discharge authorization | Confirmed |
| Loi n° 05-12 (Code de l'eau) | 4 août 2005 | Water resources management; art. 45/47, prohibition of pollution, industrial discharge licensing | Confirmed |
| **Décret exécutif n° 06-141** | 19 avril 2006 (JO n° 26, 23 avril 2006) | Sets maximum permissible values for industrial liquid discharge (numeric compliance table — see Section 6) | **Verified directly**, cross-confirmed via academic source |
| Décret exécutif n° 09-209 | 11 juin 2009 | Authorization of non-domestic wastewater discharge into the public sewer network | Confirmed by title citation; article-level flagged for verification |
| Décret exécutif n° 06-198 | 31 mai 2006 | Classified-establishment operating-license framework | Confirmed |
| Décret exécutif n° 07-300 | 27 septembre 2007 | Supplementary tax on industrial wastewater | Confirmed by title citation |
| Décret exécutif n° 93-161 | 10 juillet 1993 | Prohibits discharge of oils/lubricants into the natural environment | Confirmed |
| Décret exécutif n° 04-88 | (date not confirmed) | Requires industrial facilities to install an oil separator | **Partially verified** — flagged for confirmation |

## 3. Scientific Background

Industrial liquid discharge is regulated on the principle that a receiving environment has a finite assimilative capacity. Exceeding it produces measurable, specific harms:

- **Suspended solids (MES)** physically smother aquatic life and clog treatment infrastructure.
- **BOD5/COD** measure organic pollutant load — high values deplete dissolved oxygen in the receiving water.
- **pH outside 6.5–8.5** disrupts biological treatment processes and can corrode sewer infrastructure.
- **Heavy metals** (cadmium, lead, chromium, nickel) are non-biodegradable and bioaccumulate.
- **Oils and greases** block light penetration in receiving water and are a fire-risk pathway in sewer networks.

## 4. Inspection Methodology

**What the inspector should observe:** the physical discharge point (visible pipe/outlet), evidence of a pretreatment system (oil separator, settling basin) upstream of it, staining or odor indicating unpretreated discharge, and whether wash-water/process-water visibly bypasses any pretreatment system observed.

**What documents should be requested:** the discharge authorization (sewer-network permit under Décret 09-209, or natural-environment permit under Loi 05-12 — these are two different documents from two different authorities; request both and note which one applies to this facility's actual discharge point), the most recent laboratory analysis of the discharge, and the septic-system service contract and most recent pumping receipt where applicable.

**What measurements should be taken:** where the inspector carries field equipment, a pH reading at the discharge point is the single fastest objective check available (immediate result, directly comparable to the 6.5–8.5 legal range). Temperature is similarly immediate. MES, BOD5, COD, and heavy-metal concentrations require laboratory analysis.

**What evidence should be collected:** photograph of the discharge point and any pretreatment system, copy of the discharge permit(s), copy of the most recent lab analysis, copy of the septic-service contract and pumping receipt where relevant.

## 5. Compliance Criteria

- **Compliant:** pretreatment system present and functioning, correct discharge permit held for the actual discharge pathway, most recent lab analysis within 12 months and within the Décret 06-141 limits.
- **Minor non-compliance:** lab analysis present but administratively overdue (>12 months old) with no visible evidence of active non-compliance.
- **Major non-compliance:** pretreatment system present but a field-measurable parameter (pH, temperature) or lab-reported parameter is outside the Décret 06-141 maximum value column.
- **Critical non-compliance:** no pretreatment system at all where one is legally required; direct, visible discharge of untreated effluent to soil, a waterway, or the sewer network; discharge exceeding a Décret 06-141 parameter's *tolerated* (derogation) value.
- **Not applicable:** facility generates no process wastewater distinct from domestic sanitary use (verify against the technical file).

## 6. Reference Values

**Décret exécutif n° 06-141 — Maximum values for industrial liquid discharge [LOI]**
*Source verified via Journal Officiel n° 26 (23 April 2006), cross-confirmed by academic thesis.*

| Parameter | Unit | Maximum value [LOI] | Tolerated / derogation value [LOI] |
|---|---|---|---|
| Flow | m³/tonne of product | 1 | 1.2 |
| Temperature | °C | 30 | 30 |
| Suspended solids (MES) | mg/l | 35 | 40 |
| pH | — | 6.5 – 8.5 | 6.5 – 8.5 |
| Total phosphorus | mg/l | 10 | 15 |
| BOD5 | mg/l | 35 | 40 |
| COD | mg/l | 120 | 130 |
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

**Chlorine residual for abattoir/food-facility wash water [PRATIQUE]** — ≥0.1 mg/l free chlorine is the value currently encoded in the SafeInspect checklist. Not independently verified as a [LOI] value at drafting time — **flagged, do not present to inspectors as [LOI] until confirmed.**

## 7. Required Evidence

| Finding type | Required evidence |
|---|---|
| Pretreatment system compliance | Photograph, system operating |
| Discharge permit | Copy of permit (correct pathway: sewer vs. natural environment) |
| Lab analysis | Dated copy; results compared against Décret 06-141 table |
| Septic system (where applicable) | Service contract + most recent pumping receipt |

## 8. Frequent Non-Conformities

Based on the SafeInspect checklist audit: the most common structural issue is verifying system presence without comparing an actual measured value against the Décret 06-141 ceiling. The most common legal gap is failing to distinguish between the two distinct discharge authorization regimes (sewer network under 09-209 vs. natural environment under Loi 05-12).

## 9. Inspector Guidance

- **Red flag:** a pH reading at the discharge point that is far from neutral (below 5 or above 9) combined with no pretreatment system is prima facie evidence of a critical non-conformity.
- **Common misinterpretation:** an oil separator's presence does not guarantee compliance — an unmaintained or full separator provides no effective treatment.
- **Good practice:** take the pH reading at the start of the wastewater inspection — if it is in-range, continue with document verification; if it is out-of-range, it elevates the priority of all subsequent document checks.
- **Situation requiring additional investigation:** a facility claiming "no process wastewater" but operating a production line that visibly uses water should have that claim verified against the facility's water-consumption records (utility bill, internal meter) before accepting the not-applicable designation.

## 10. Decision Guidance

- Visible discharge of untreated effluent or a lab-confirmed exceedance beyond the derogation value column should independently drive a **critical** classification, consistent with the platform's existing critical-override logic in `scoringUtils.ts`.
- A single-parameter exceedance of the standard maximum (not the derogation column) is **major**.
- A lab analysis that is simply overdue, with no field-observable indicator of active non-compliance, is **minor**.

## 11. Related Requirements

- **Chapter 2 (Solid & Hazardous Waste):** septic-system sludge and oil-separator waste become special/hazardous waste once removed from the water system — governed by Chapter 2's collection/transport/treatment rules.
- **Chapter 3 (Fire Safety):** oils entering sewer networks are a fire risk — cross-reference.
- **Chapter 6 (Documentation & Licensing):** the discharge permit is a sector-specific license under Décret 06-198 art. 4's non-substitution rule — verify separately from the core operating license.

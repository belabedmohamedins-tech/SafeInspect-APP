# SafeInspect Checklist Audit — Cross-Cutting Findings

Apply these fixes FIRST, before the per-file patch documents, since several
per-file patches reference the corrected citations defined here. Each item
lists every criterion ID affected across the codebase.

---

## FINDING 1 — EIE (Loi 03-10) citation range — DEFINITIVELY RESOLVED

Verified against the complete, current 114-article text of `legal_refs/loi-03-10-protection-environnement.md`.

- **Art. 14** = Chapitre 3, the PNAEDD's 5-year duration. **NOT related to EIE.**
- **Chapitre 4** ("Système d'évaluation des incidences environnementales... Études d'impact") = **exactly Art. 15–16**. This is the core EIE obligation.
- **Chapitre 5** ("Régimes juridiques particuliers", Art. 17–28) = classified-installations authorization regime, of which EIE (Art. 21) is one requirement among several.

**Canonical citation to use everywhere going forward:**
> "القانون 03-10 المواد 15–16 (الإخضاع المسبق لدراسة/موجز التأثير البيئي ومحتوى الدراسة) والمواد 18–23 (نظام المنشآت المصنفة والترخيص والدراسة السابقة والرقابة، مع مراعاة المادة 17 عند وصف إنشاء النظام القانوني الخاص)."

**Never cite Art. 14 as the EIE obligation:** Article 14 concerns the five-year national environmental-action plan; the EIE obligation begins at Article 15.

**Criteria requiring this fix:**
| Criterion | File | Current (wrong) range |
|---|---|---|
| BGN-10-01 | baseGeneralCriteria.ts | Art. 14–21 |
| BAK-10-13 | bakeryCriteria.ts | Art. 15–18 |
| COU-AX10-01 | couvoirCriteria.ts | Art. 15–18 |
| SLH-08-01 | slaughterhouseSmallCriteria.ts | Art. 14–21 (was just wrongly "corrected" to this — see Finding 2) |
| GPL-05-01 | gplCriteria.ts | Art. 15–22 (closest already — tighten wording only) |
| CLD-19-01 | coldRoomCriteria.ts | Art. 15–22 (closest already — tighten wording only) |
| SPH-06-01 | semiPharmaCriteria.ts | Art. 15–22 (closest already — tighten wording only) |
| UPD-AX10-01 | updCriteria.ts | Art. 15–22 (closest already — tighten wording only) |

---

## FINDING 2 — Changelog confidence is not evidence (corrected 2026-08-23)

`slaughterhouseSmallCriteria.ts`'s own "W42 (2026-08-10)" changelog comment claims:
*"SLH-08-01 legalReference corrected — Loi 03-10 'المواد 15–22' → 'المواد 14–21'... Confirmed by direct read: Arts.14–21 form the complete EIE chapter."*

This historical changelog was incorrect (see Finding 1). The affected source
criteria have now been corrected to the primary-text-supported Article 15–16
and 18–23 mapping in the 2026-08-23 remediation pass. Any remaining historical
mentions of the old range are retained only for traceability and must not be
used as current legal guidance.

**Action:** When applying Finding 1's fix, treat this specific W42 changelog
claim as disproven, not as a prior correction to preserve.

---

## FINDING 3 — Loi 90-11 misapplied for PPE / machine-safety — 7 files

Loi 90-11 ("relations de travail") is Algeria's general labor-**relations**
law — employment contracts, wages, dismissal. It is very unlikely to be the
correct source for specific technical PPE or machine-guarding requirements.
The correct source is almost certainly Décret 91-05 ("hygiène et sécurité en
milieu de travail"), which has a dedicated general-safety title (Titre II,
Art. 25–44) — exact articles for PPE within that range have not yet been
pinned down and should be verified before pushing a replacement citation
live (do not guess an article number — verify against
`legal_refs/decret-91-05-hygiene-securite-milieu-travail.md` first).

**Independently corroborated from inside the codebase itself**: `UAB-AX7-07`
already contains an honest self-correction removing Décret 93-120 (paired
with Loi 90-11 in several files) as a noise-limit source, confirming that
law-pairing is unreliable — but it left the accompanying Loi 90-11 citation
unexamined in the same string.

**Criteria requiring verification + fix:**
| Criterion | File |
|---|---|
| BSM-04-01, BSM-04-03 | blacksmithCriteria.ts |
| CRP-04-01, CRP-04-02 | carpenteryCriteria.ts |
| MRB-05-01, MRB-05-03, MRB-05-04 | marbleCriteria.ts |
| MCH-29-06 | mechanicCriteria.ts (also mixes in Décret 91-05 Art.6 — verify that article too, it falls in Titre I "Hygiène générale," not obviously PPE-specific) |
| PNT-04-01 | paintShopCriteria.ts |
| PRT-05-01, PRT-05-02 | printingCriteria.ts |
| UAB-AX7-07 | uabCriteria.ts (Loi 90-11 half only — Décret 93-120 half already fixed) |

**Recommended process:** verify Décret 91-05's actual PPE-specific article(s)
once, then apply the same replacement citation to all rows above.

---

## FINDING 4 — Décret 05-315 and Décret 93-162 do not exist in legal_refs/

Both are cited repeatedly and specifically (not generic filler) as real,
load-bearing hazardous-waste legal bases, but neither has ever been
converted into the `legal_refs/` corpus — meaning no one has ever checked
these citations against actual text.

**Décret 05-315** (hazardous waste transport/declaration documentation) —
cited 8 times:
CWS-04-02, MCH-29-04, MCH-29-08, MCH-29-10, PNT-03-02, PRT-03-02,
SLH-05-05, UAB-AX4-02, UAB-AX4-03, UAB-AX4-04

**Décret 93-162** (used oil recovery) — cited 2 times:
CWS-02-04, MCH-29-03

**Recommended action:** source and convert both decrees into `legal_refs/`
as a priority (they are clearly real, in-force regulations given how
specifically and consistently they're cited) rather than patch each
citation individually without ever verifying the source.

---

## FINDING 5 — Décret 06-198 Art. 5 misattributed as "the operating license article"

Art. 5 of Décret 06-198 actually covers the **studies required before an
authorization request** (EIE/danger study/public inquiry) — not the license
itself. The actual license-issuance article is **Art. 20** ("L'autorisation
d'exploitation est délivrée... par arrêté...").

**Criteria requiring this fix:**
| Criterion | File |
|---|---|
| GPL-01-01 | gplCriteria.ts |
| PRD-01-01 | produceStorageCriteria.ts |
| SLH-05-01 | slaughterhouseSmallCriteria.ts (cites Art.5+8 — verify Art.8 separately, not yet checked) |

---

## FINDING 6 — "0–5°C" wrong cold-storage figure — 2 files, correct model already exists

Verified against both `arrete-interministeriel-2025-05-07-hygiene-restauration.md`
and `arrete-interministeriel-1999-11-21-conservation-aliments.md`: neither
supports a blanket "0–5°C" figure anywhere. The real figure is **0–4°C**
(general/meat), or category-specific per the 1999 arrêté's own table (up to
+6°C cheese, +8°C produce — never +5°C).

**A correct, well-verified model already exists in the codebase** —
`coldRoomCriteria.ts`'s CLD-17-04 — copy its citation pattern.

**Criteria requiring this fix:**
| Criterion | File |
|---|---|
| BFD-04-01 | baseFoodCriteria.ts |
| ABT-AX5-01 | abattoirCriteria.ts |

---

## FINDING 7 — Implementation bug: numericField threshold doesn't match the criterion's own correct text

`CLD-17-04` (coldRoomCriteria.ts) has the CORRECT legal text (0–4°C) but its
`numericField` config is `max: 5, warningMax: 7` — meaning the app would not
warn on a 4.5–6.9°C reading despite that being out of compliance per the
same object's own stated legal limit.

**Recommended action:** fix CLD-17-04's numericField to `max: 4,
warningMax: 4` (or equivalent), AND run a codebase-wide check comparing
every criterion's `numericField.max/min/warningMax` against the specific
number stated in its own `criteria` text and `legalReference` — this class
of bug is invisible to a text-only citation review and may exist elsewhere
undetected.

---

## FINDING 8 — "معايير الرقابة" (internal, non-legal standards document) cited as if it were law

Concentrated in the two poultry-related files (likely shared
origin/authorship) — cited alone or blended with real law in roughly 15+
criteria:

**couvoirCriteria.ts**: COU-AX2-01, AX2-04, AX3-01, AX3-02, AX3-03, AX4-01,
AX4-02, AX5-01, AX5-02, AX6-01, AX6-02, AX7-01, AX7-02, AX7-03 (this last one
cites a prior *inspection report* as legal authority — separate error)

**updCriteria.ts**: UPD-AX3-01, AX4-01, AX6-01, AX6-02 (sole basis), AX7-01,
AX7-02, AX8-03 (sole basis)

**Recommended action:** this needs a systematic re-citation pass per file,
not per-criterion patches — for each criterion, identify what "معايير
الرقابة" was likely summarizing and replace with the actual underlying law
(most likely Décret 17-140 for hygiene axes, Décret 91-05 for worker-safety
axes, both already verified elsewhere in this audit).

---

## FINDING 9 — Laws cited that don't exist anywhere in legal_refs/ (never verified by anyone)

Beyond Décret 05-315 and 93-162 (Finding 4):

| Law | Criteria | File |
|---|---|---|
| Loi 88-08 (médecine vétérinaire) | ABT-AX2-01, ABT-AX2-02 | abattoirCriteria.ts |

**Not yet confirmed against a fresh directory listing** (flagged during audit,
needs a final check before treating as confirmed missing):
Décret 13-378 (SPH-04-01), Décret 06-104 (SLH-05-05, UAB-AX4-01/02),
Décret 03-478 (SLH-07-01), Décret 06-02 (UAB-AX5-02), Décret 23-324 (UAB-AX6-02)

**Recommended action:** cross-check this full list against the current
`legal_refs/` directory listing in one pass before deciding which need
sourcing/conversion.

---

## Reference material for drafting replacement citations

**Décret 91-05 Titre III (Art. 45–60) — fire prevention, precise mapping:**
- Extinguishers → Art. 57
- Evacuation/exits → Art. 54 (≥2 exits + 80cm width if >100 people) + Art. 55 (signage/lighting) + Art. 56 (staircases)
- Electrical safety in hazardous zones → Art. 49 (explosion-risk zones, no spark sources) + Art. 53 (flammable zones, bare conductors forbidden)
- Storage/isolation of flammables → Art. 46 (isolation) + Art. 47 (2-group classification) + Art. 50 (no open flame) + Art. 51 (max daily quantities) + Art. 52 (max 10m to exit)
- Fire equipment maintenance → Art. 60

**Loi 19-02 — confirmed WRONG article attributions, do not reuse:**
- Art. 6 ≠ ignition-source ban (actual: duty to present documents during inspection)
- Art. 7 ≠ extinguisher requirement (actual: duty to follow procedure when modifying establishment)
- Art. 12 ≠ evacuation plan (actual: duty to have occupancy-counting equipment; real evacuation-plan article = **Art. 21**)
- Scope: applies to ERP (broadly defined — any establishment admitting the public, likely covers most SafeInspect activity types) + IGH + residential. The applicability itself is generally fine to cite; it's specific article numbers that have been wrong.

**Décret 76-35 — confirmed WRONG INSTRUMENT for electrical/gas safety (3+ confirmed misuses):**
Exclusively about IGH (high-rise ≥28–50m) fire/panic safety. Zero content on
electrical wiring or gas storage. Never cite for general workplace hazards.

**Décret 06-198 — confirmed purely administrative/procedural:**
No technical safety content anywhere. Art. 5 = pre-authorization studies.
Art. 20 = actual license issuance (see Finding 5).

**Décret 06-141 Annexe I (wastewater) — confirmed correct, reuse freely:**
DBO5 ≤ 35mg/L, DCO ≤ 120mg/L, MES ≤ 35mg/L, pH 6.5–8.5.
Note: Annexe II uses different g/tonne units for slaughterhouses specifically —
already correctly flagged `[À VÉRIFIER]` on ABT-AX6-02; same caveat should
be added to ABT-AX6-01/03/04 which cite identical Annexe I figures without it.

**Décret 06-138 (air emissions) — confirmed correct, reuse freely:**
Total dust ≤ 50mg/Nm³, VOC ≤ 150mg/Nm³ (general limits), Art. 11 = 3yr
record retention.

**1999 arrêté** (`arrete-interministeriel-1999-11-21-conservation-aliments.md`)
= confirmed source of ≤ −18°C frozen standard (Art. 2 + Art. 6).
**2025 arrêté** (`arrete-interministeriel-2025-05-07-hygiene-restauration.md`)
= confirmed source of 0–4°C refrigerated standard (Art. 20/24/42) and
Art. 8 = temperature recording system requirement (NOT Art. 6, which is
about shared sanitary facilities for small restaurants — CLD-17-03 cites
this wrong and should be fixed to Art. 8).

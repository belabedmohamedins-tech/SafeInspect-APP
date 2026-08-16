# Audit Addendum 6 — Chapter 1 (Wastewater) + Direct Verification of Décret 06-141

Verified against the full primary text of
`legal_refs/decret-06-141-rejets-effluents-liquides.md` (14 articles +
both annexes, read in full).

---

## 1. CORRECTION to audit-08-carWashCriteria.md — CWS-02-01 confirmed correct

Previously listed as "plausible, not independently confirmed." Now
confirmed: Annexe I lists "Hydrocarbures totaux" (10mg/l) and "Huiles et
graisses" (20mg/l) as two separate, distinct parameters. CWS-02-01 cites
hydrocarbures totaux specifically and matches exactly.

**Action: none needed.** Remove the "unconfirmed" status for this
criterion.

---

## 2. CORRECTION to audit-05-abattoirCriteria.md — ABT-AX6 series needs an actual fix, not just a shared uncertainty flag

**Previous guidance (superseded):** "Copy ABT-AX6-02's [À VÉRIFIER] wording
onto AX6-01, 03, and 04 as well."

**New finding:** Décret 06-141's Annexe II contains a category-specific
table for "Abattoirs et transformation de la viande" using load-based
units (g per tonne of carcass processed), not the generic Annexe I
concentration-based (mg/l) figures:

| Parameter | Unit | Value | Tolerated (old installations) |
|---|---|---|---|
| Volume/quantité | m³/t carcasse traitée | 6 | 8 |
| pH | — | 5.5–8.5 | 6–9 |
| DBO5 | g/t | 250 | 300 |
| DCO | g/t | 800 | 1000 |
| Matière décantable | g/t | 200 | 250 |

**This is the correct standard for slaughterhouses — not the generic
Annexe I figures (DBO5≤35mg/l, DCO≤120mg/l, MES≤35mg/l) previously used.**

**New action for ABT-AX6-01, 02, 03, 04:** replace the generic Annexe I
citation and figures with the Annexe II abattoir-specific table above.
This resolves AX6-02's existing `[À VÉRIFIER]` flag with a concrete answer
— remove the flag once the figures are updated, rather than propagating
the uncertainty to the other three criteria as previously recommended.

---

## 3. Codebase-wide action item — check every Décret 06-141 citation for a better-matching Annexe II category

Annexe II provides specific tables for 7 industry groups: abattoirs,
sucrerie, levurerie, brasserie, distillerie (all agro-alimentaire),
raffinage de pétrole, cokéfaction (énergie), industrie mécanique,
transformation des métaux, minerais non métallique (céramique/verre/
poterie), textile, tannerie/mégisserie.

**Action:** for every criterion in the codebase citing Décret 06-141,
check whether that facility type matches one of these 7 categories. If
so, replace the generic Annexe I figures with the category-specific
Annexe II table. Confirmed NOT applicable to carWashCriteria.ts (no
matching category) — that file's figures stay as generic Annexe I,
correctly.

---

## 4. New precision gap — two different discharge permits, not interchangeable

**Décret 09-209** governs discharge into a sewer network/treatment plant.
**Loi 05-12** governs discharge into the natural environment. These are
different documents from different authorities. Per this chapter: *"the
sewer-network discharge permit and the natural-environment discharge
permit are frequently treated as interchangeable in practice. They are
not."*

**Action:** any criterion checking for "a discharge permit" generically
should specify which one applies based on the facility's actual discharge
pathway, rather than treating either as sufficient.

---

## 5. Cross-confirms an existing main-audit finding

Chlorine residual ≥0.1mg/l for food/abattoir wash water is independently
flagged here as `[PRATIQUE]`, not `[LOI]` — "this manual could not
independently verify a specific Algerian decree mandating this exact
figure." This matches the main audit's own conclusion for ABT-AX4-01
(not independently verified) — two independent research passes reaching
the same result. No new action; reinforces existing "VERIFY" status.

---

## 6. Buffer-zone/siting distances — concrete figures available if not already used

Referenced from Chapter 6 (not yet independently read, but cited with
specific figures here): Décret 07-144's annex gives per-activity buffer
distances. For wastewater-relevant activities: abattoir 3km (>2t/day
carcass weight) or 0.5km (500kg–2t/day); UPD/poultry housing 3km (>20,000
animal-equivalents) or 0.5km (5,000–20,000); produce/food-preservation
1km (>10t/day) or 0.5km (2–10t/day).

**Action:** check whether ABT, UPD, or PRD files' siting criteria
currently use a generic buffer distance instead of these specific,
activity-dependent figures — if so, this is a precision upgrade
opportunity once Chapter 6 is read directly to confirm the full table.

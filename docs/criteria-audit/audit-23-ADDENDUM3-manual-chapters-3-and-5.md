# Audit Addendum 3 — Findings from Inspection Manual Chapters 3 & 5

Source: `docs/Inspection_Manual_Chapter3_Fire_Safety.md` and
`docs/Inspection_Manual_Chapter5_Occupational_Health.md` — both rigorously
primary-source-verified (Chapter 3 cross-checked against official Arabic
AND French JORADP text). These independently confirm and extend several
findings from the main audit.

---

## 1. Loi 19-02 scope, resolved by facility type — bigger fix than delivered patches assumed

Confirms cross-cutting Finding 3's underlying premise. For facility types
below, **Loi 19-02 doesn't apply at all** — any Loi 19-02 fire-safety
citation in these files should be REMOVED, not article-corrected, and
replaced with Décret 06-198 + Loi 88-07/Décret 91-05:

**Plausibly NOT ERP (Loi 19-02 does not apply):** abattoir, couvoir, UPD,
UAB, most produce storage/cold room.

**Plausibly ARE ERP (Loi 19-02 applies, correct article numbers still
needed per the main audit's findings):** mechanic, car wash, retail-facing
bakery/semiPharma, conditionally marble/paintShop/printing/GPL.

**Action:** Before applying the Loi 19-02 article-number fixes from the
main audit's cross-cutting Finding 1/reference material to a given file,
first check whether that file's facility type is even in the "ERP" list
above. If not, remove Loi 19-02 as the basis entirely instead.

---

## 2. Two new mis-citations, not caught in the main audit — search needed

- **Décret 09-410** (security-sensitive equipment — night-vision devices,
  mine detectors) is apparently cited somewhere for internal-intervention-
  plan criteria. WRONG. Correct citation: **Décret 09-335** (already in
  legal_refs/, correctly used elsewhere).
- **Décret 04-409** (hazardous waste transport) confirmed unrelated to
  LPG/chemical-storage technical requirements.

**Action:** grep all 20 criteria files for "09-410" and "04-409" — neither
appeared in the main file-by-file audit, so these need a fresh, targeted
search rather than a specific criterion ID to patch.

---

## 3. Resolves an open item from the delivered patches

`GPL-01-02` (audit-03-gplCriteria.md) flagged the 60m²/4th-year-schooling
figures as unconfirmed. **Now confirmed correct**, verbatim from the actual
Décret 21-430 text. No further action needed on that item — remove the
"VERIFY" status.

Also: `GPL-01-01`'s flagged possible ministry mismatch ("mines" vs.
"hydrocarbures") — the "minister in charge of mines" attribution for the
installer-accreditation requirement (Art.7) is **confirmed correct**, not
a mismatch. No action needed on that specific flag either.

---

## 4. BGN-09-01 — status escalated from "unconfirmed" to "likely wrong"

Original patch (audit-01-baseGeneralCriteria.md) flagged this as needing
verification. New finding: Décret 91-05 apparently has no specific numeric
noise ceiling at all. The real Algerian noise decree with numbers,
**Décret 93-184**, is an *ambient/neighbor-nuisance* standard (35–45 dB(A)
at night in residential zones, zone/time-dependent) — not occupational. The
de facto occupational reference in Algerian practice is **WHO 85 dB(A) over
8h/day**, per an Algerian occupational-risk-prevention body's own guidance.//
**New citation:** tag as `[INTL, adopted in practice] — WHO 85dB(A)/8h`,
replacing the current "70dB, Décret 91-05 Art.15" citation, which doesn't
match either the correct occupational or ambient reference.

---

## 5. New recommended criterion — PPE-use training (coverage gap, not a citation fix)

No criterion across all 287 audited criteria verifies that workers are
actually trained to use required PPE. This is grounded in **Décret 02-427**
(already in legal_refs/), which specifically covers worker
instruction/training in occupational-risk prevention.

**Recommendation:** add a new criterion (suggested ID: BGN-08-07 or similar,
in whichever file's numbering scheme fits) requiring evidence of PPE-use
training records under Décret 02-427, wherever PPE is already a required
criterion. This is new-criterion work, not a patch to an existing one.

---

## 6. Process recommendation — a third labeling tier

Both chapters converge on the same need: a `[INTL, adopted in practice]`
tag distinct from `[LOI]` (codified Algerian law) and `[SILENCE]`/`[حكم
مهني]` (no known basis at all), for figures like WHO 85dB — internationally
sourced but demonstrably used in real Algerian practice guidance. This
pattern already exists inconsistently in the codebase (MRB-05-05's silica
limit, ABT-AX3-01's 7°C carcass cooling, UAB-AX7-07's noise figure) under
different ad-hoc labels.

**Recommendation:** standardize on `[INTL, adopted in practice]` as a
distinct third tier codebase-wide, rather than continuing to search for an
Algerian-specific number that these chapters' research suggests may not
exist as a discrete codified figure for some of these cases.

---

## Not yet investigated
6 of 8 manual chapters remain unread (Wastewater, Solid/Hazardous Waste,
Food Safety, Documentation/Licensing, Air Quality, Site Hygiene/Pest
Control), plus STRATEGIC_PLAN.md and docs/audit/, docs/archive/
subfolders. Given the density of new findings from just 2 chapters, the
remaining 6 likely contain comparable value if continued.

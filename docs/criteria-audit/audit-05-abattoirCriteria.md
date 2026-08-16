# Audit Patches — abattoirCriteria.ts (export: abattoirSpecificCriteria)

---

### ABT-AX5-01 — wrong numeric figure (same error as BFD-04-01)
**Current:** تخزين اللحوم 0–5°م
**Problem:** Same wrong figure as baseFoodCriteria.ts's BFD-04-01 — likely
copied. 1999 arrêté's own table: fresh meat = 0–4°C, never 0–5°C.
**New:** استبدال "0–5°م" بـ "0–4°م". Also apply cross-cutting Finding 7's
process — verify this criterion's numericField matches the corrected figure.

---

### ABT-AX2-01 / ABT-AX2-02 — source law not in legal_refs corpus
**Current:** القانون 88-08 المتعلق بالطب البيطري
**Problem:** This law does not exist anywhere in legal_refs/ — confirmed
against the full directory listing. Never verified against actual text by
anyone.
**Action:** LEGAL VERIFICATION REQUIRED — source and convert Loi 88-08, or
find the correct existing citation for ante/post-mortem veterinary
inspection authority if this law reference is itself mistaken.

---

### AX6 series — propagate an existing honest flag to 3 more criteria
ABT-AX6-02 already carries a correct, detailed [À VÉRIFIER] flag noting
that Décret 06-141's Annexe I (mg/L, generic) may not be the right standard
for slaughterhouses specifically — Annexe II uses load-based g/tonne units
instead, and this is unconfirmed.
**Problem:** ABT-AX6-01, ABT-AX6-03, ABT-AX6-04 cite the identical Annexe I
figures (DBO5≤35, DCO≤120, MES≤35, pH 6.5–8.5) without the same caveat.
**Action:** Copy ABT-AX6-02's exact [À VÉRIFIER] wording onto AX6-01, 03,
and 04 as well — the uncertainty applies equally to all four.

---

### ABT-AX3-01 — possible unlabeled international-standard borrow
**Current:** carcass cooling ≤7°C, citing Décret 17-140
**Problem:** 7°C closely matches the EU 853/2004 red-meat carcass standard.
Not yet confirmed whether Décret 17-140 actually states this figure, or
whether it was borrowed from the EU standard without being labeled as such.
**Action:** VERIFY against Décret 17-140's actual text. If not found, apply
a [حكم مهني]/[INTL] label matching the model used elsewhere (e.g. BGN-02-06,
MRB-05-05) rather than presenting it as confirmed Algerian statutory text.

---

### Note — EIE citation
No EIE-axis criterion was found under an explicit ID in this file as read
during this audit. If one exists elsewhere in the file under a different
ID, or was added by the same "W41" pass referenced in
slaughterhouseSmallCriteria.ts's changelog (see cross-cutting Finding 2),
locate it and apply cross-cutting Finding 1's canonical EIE citation.

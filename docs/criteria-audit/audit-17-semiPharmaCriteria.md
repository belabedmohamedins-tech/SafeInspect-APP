# Audit Patches — semiPharmaCriteria.ts

---

### SPH-01-01 / SPH-02-01 / SPH-02-02 / SPH-03-01 — same article cited for 4 different specific claims
**Current:** جميعها تستند إلى القانون 18-11 المادة 104 (الترخيص، شروط
النظافة، فصل العمليات، شروط التخزين)
**Problem:** A single article rarely covers licensing AND facility-hygiene
standards AND process separation AND storage conditions all with this
level of specificity. This is the same "one article as catch-all" pattern
already confirmed wrong for Loi 19-02 Art.4 and Loi 03-10 Art.6 elsewhere
in this codebase.
**Action:** LEGAL VERIFICATION REQUIRED for each of the 4 criteria
separately — Loi 18-11 is a 450-article law; each of these distinct
technical requirements likely has its own specific article, not one shared
catch-all. Do not treat Art.104 as confirmed correct for any of them
without checking its actual text first.

---

### SPH-04-01 — possible source law not in legal_refs corpus
**Current:** المرسوم التنفيذي 13-378
**Action:** VERIFY against a fresh legal_refs/ directory listing — this
decree was not found in the listing available during this audit, but this
was not double-checked at the time. Confirm before treating as missing
(see cross-cutting Finding 9).

---

### SPH-06-01 — EIE citation, apply cross-cutting Finding 1
**Current:** القانون 03-10 المواد 15–22
**Note:** Already consistent with the more-defensible range. Apply
canonical wording from Finding 1 for consistency; wording update only.

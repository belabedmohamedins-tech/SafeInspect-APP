# Audit Patches — paintShopCriteria.ts

---

### PNT-03-02 — source law not in legal_refs corpus
**Current:** المرسوم 05-315
**Action:** LEGAL VERIFICATION REQUIRED — see cross-cutting Finding 4
(this is the 3rd of 8 codebase-wide instances of this missing decree).

---

### PNT-04-01 — apply cross-cutting Finding 3
**Current:** القانون 90-11 + المرسوم التنفيذي 91-05 المادة 6
**Action:** Apply the verified replacement citation once confirmed per
Finding 3. Also verify Décret 91-05 Art.6's actual relevance (same caveat
as MCH-29-06 in mechanicCriteria.ts — Art.6 falls in Titre I, "Hygiène
générale," not obviously PPE-specific).

---

### PNT-03-03 / PNT-04-02 / PNT-04-03 — no article number
**Current:** القانون 19-02 (بدون رقم مادة)
**Action:** LEGAL VERIFICATION REQUIRED — same vague-reference pattern
found across several files.

---

### Already correctly handled, no action needed
PNT-02-03 has an honest self-correction comment (Phase 7.1/11b/A) fixing
the VOC limit from an incorrect 20mg/Nm³ to the correct 150mg/Nm³. Good
model of real error-catching — no change needed.

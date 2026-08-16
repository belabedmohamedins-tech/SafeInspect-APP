# Audit Patches — uabCriteria.ts (export: uabSpecificCriteria)

---

### UAB-AX7-07 — half-fixed, complete the correction
**Current:** القانون 18-11 + القانون 90-11 (حماية العمال من أخطار بيئة
العمل) — بعد إزالة المرسوم 93-120 الذي تم تصحيحه سابقاً بنجاح
**Problem:** This criterion's own changelog already correctly identified
and removed Décret 93-120 as a wrong noise-limit source, with an honest
[INTL] tag on the 85dB figure. This independently confirms the pattern in
cross-cutting Finding 3 — but the Loi 90-11 citation sitting in the same
string was never given the same scrutiny.
**Action:** Apply cross-cutting Finding 3's verified replacement to the
Loi 90-11 portion. Keep the existing [INTL] tag on 85dB and the Décret
93-120 removal exactly as-is — those are already correct.

---

### UAB-AX4-02 / UAB-AX4-03 / UAB-AX4-04 — source law not in legal_refs corpus
**Current:** المرسوم 05-315
**Action:** LEGAL VERIFICATION REQUIRED — see Finding 4. These are 3 of the
8 codebase-wide instances of this missing decree, all concentrated in this
one file — strongly suggests this decree governs a requirement central to
this establishment type specifically. Prioritize sourcing it.

---

### UAB-AX5-02 / UAB-AX6-02 — possible sources not in legal_refs corpus
**Current:** المرسوم 06-02 (UAB-AX5-02) / المرسوم 23-324 (UAB-AX6-02)
**Action:** VERIFY against a fresh legal_refs/ directory listing before
treating as confirmed present or absent (see Finding 9).

---

### Already correctly handled, no action needed
UAB-AX6-01 has an honest, well-reasoned correction comment (Phase Z)
correctly tracing the maintenance obligation to Décret 06-198 Art.13 — good
model, no change needed.

### Not individually re-verified
AX3 series (water discharge) consistent with confirmed-good Décret 06-141
figures used correctly elsewhere.

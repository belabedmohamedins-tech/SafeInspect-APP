# Audit Patches — slaughterhouseSmallCriteria.ts

---

### SLH-08-01 — EIE citation, apply cross-cutting Findings 1 AND 2
**Current:** القانون 03-10 المواد 14–21 (تم "تصحيحها" مؤخراً بواسطة W42 من
15–22 إلى 14–21)
**Problem:** The W42 changelog comment claims this range was "confirmed by
direct read" — it was not correct. This fix actually reverted the citation
from a better range (15–22) to a worse one. See cross-cutting Finding 1 for
the definitive, text-verified correct range, and Finding 2 for the full
explanation of why this specific changelog claim should not be trusted.
**New:** Apply canonical citation from Finding 1 (Art.15–16 core +
Art.17–23 broader framework). Do not preserve the W42 changelog's reasoning
when documenting this change — it was based on a misreading.
**Also verify:** the same changelog note claims an identical "W41" fix was
applied to abattoirCriteria.ts. No explicit EIE-axis criterion was visible
in abattoirCriteria.ts during this audit — check whether that file has an
EIE criterion under a different ID that also needs this same correction.

---

### SLH-05-01 — apply cross-cutting Finding 5
**Current:** المرسوم 06-198 المادتان 5 و8
**New:** استبدال المادة 5 بالمادة 20 (انظر Finding 5). Verify Art.8
separately — not checked this audit pass.

---

### SLH-05-05 — source law not in legal_refs corpus
**Current:** المرسوم 05-315 (+ يذكر أيضاً المرسوم 06-104)
**Action:** LEGAL VERIFICATION REQUIRED for 05-315 (see Finding 4, 5th of
8 codebase-wide instances). Also verify whether Décret 06-104 exists in a
fresh directory listing (see Finding 9) before treating it as usable.

---

### SLH-07-01 — not independently verified
**Current:** المرسوم التنفيذي 03-478 (نفايات طبية/بيطرية)
**Action:** VERIFY against a fresh legal_refs/ directory listing before
treating as confirmed present or absent.

---

### Noted but not disputed
SLH-05-02/05-03's own W42 changelog claims Décret 04-82 Art.6/9 were
"confirmed correct by direct read." This was not independently
re-verified during this audit — no basis to dispute it, but also no
independent confirmation. Treat as provisionally trusted, not fully
verified.

### Already correctly handled, no action needed
SLH-05-04 through 05-04D, 05-06, 05-08 consistent with confirmed-good
Décret 06-141/17-140 patterns used correctly elsewhere.

# Audit Patches — baseGeneralCriteria.ts

Apply Finding 1 (EIE) and Finding 3 (Loi 90-11) from the cross-cutting
findings file where referenced below. All other patches are specific to
this file.

---

### BGN-01-03 — wrong articles entirely
**Current:** يستند إلى المادتين 82 و84 من القانون 03-10 (حق الدخول / تعليق النشاط)
**Problem:** Art.82 (current text) = penalty for biodiversity/wildlife
violations. Art.84 = penalty for air-pollution violations. Neither is about
inspector entry or suspension power. (Article numbering shifted after
loi-03-10 was expanded from 89 to 114 articles; this citation was verified
against the old, shorter version.)
**New:**
> القانون 03-10 المادة 106 (تجريم عرقلة ممارسة مهام المراقبة والمعاينة
> والخبرة الخاصة بالمنشآت المصنفة) + المادة 25 (صلاحية الوالي في تعليق نشاط
> المنشأة عند عدم الامتثال للإعذار) + المادة 111 (قائمة الأعوان المؤهلين، بما
> فيهم مفتشو البيئة). **[À VÉRIFIER]**: لا توجد مادة صريحة تمنح "حق الدخول"
> في النص الحالي (114 مادة) — قد يكون هذا الحق مؤسَّساً بنص تنظيمي تطبيقي أو
> بقانون الإجراءات الجزائية العام. يُفتح فصل LEGAL-VERIFY.

---

### BGN-10-01 — EIE citation
Apply cross-cutting Finding 1. Replace current "Art.14–21" range with the
canonical Art.15–16 + Art.17–23 citation.

---

### BGN-08-03 — wrong instrument entirely
**Current:** يستند إلى المرسوم التنفيذي 76-35 (سلامة التركيبات الكهربائية)
**Problem:** Décret 76-35 is exclusively about IGH (high-rise ≥28–50m)
fire/panic safety. Zero content on electrical installations of any kind.
**New:** [À VÉRIFIER] — needs the correct Décret 91-05 article for general
electrical-installation safety. Check Titre II (Art.25–44, "Mesures
générales de sécurité") for the specific article before replacing — do not
guess a number.

---

### BGN-02-04 — no article number
**Current:** القانون 90-29 (رخصة البناء وشهادة المطابقة) — no article cited
**Action:** LEGAL VERIFICATION REQUIRED — locate the specific article in
Loi 90-29 governing this requirement before this can carry a precise
citation.

---

### BGN-07-01 — weak reference
**Current:** القانون 03-10 المادة 6
**Problem:** Art.6 is a generic precautionary-principle article; it does not
address pest/vector control specifically.
**Action:** LEGAL VERIFICATION REQUIRED — find the actual pest-control basis
(likely Décret 91-05, general hygiene provisions, Titre I).

---

### BGN-07-02 — no article number, vague "control standards" reference
**Current:** القانون 03-10 + محور مكافحة النواقل في معايير الرقابة
**Problem:** "معايير الرقابة" is not a legal source (see cross-cutting
Finding 8 — though this instance is isolated to this file, not part of the
couvoir/upd cluster).
**Action:** LEGAL VERIFICATION REQUIRED.

---

### BGN-04-01 / BGN-07-03 — redundancy
Both criteria test "are waste containers closed," from hygiene vs.
pest-control angles respectively.
**Recommendation:** MERGE, or convert BGN-07-03 into a cross-reference to
BGN-04-01 rather than re-asking the same physical observation under a
different axis (avoids double-counting in scoring).

---

### BGN-03-02 / BGN-03-03 — reviewed, NOT redundant
Confirmed these test different failure modes (network integrity vs.
actual wash-water routing). No merge — recommend only tightening the
wording so inspectors can tell them apart more easily. No functional change
needed.

---

### BGN-09-01 — unconfirmed numeric threshold
**Current:** 70dB limit, citing Décret 91-05 Art.15
**Action:** VERIFY — confirm Art.15 actually specifies 70dB before treating
this citation as settled.

# Audit Patches — baseFoodCriteria.ts

---

### BFD-04-01 — wrong numeric figure
**Current:** المبردات 0–5°م
**Problem:** Neither the 2025 nor the 1999 arrêté supports "0–5°C" anywhere.
Real figure: 0–4°C general (or category-specific per 1999 arrêté's table:
up to +6°C cheese, +8°C produce — never a blanket +5°C).
**New:** استبدال "0–5°م" بـ "0–4°م" — انظر أيضاً معيار CLD-17-04 في
coldRoomCriteria.ts كنموذج صحيح موثّق.
**Also apply cross-cutting Finding 7's process**: verify this criterion's
own numericField min/max/warningMax matches the corrected 0–4°C figure —
do not fix the text without checking the enforcement threshold too.

---

### BFD-04-02 — right number, wrong instrument
**Current:** cites the 2025 arrêté for the ≤−18°C freezer standard.
**Problem:** The 2025 arrêté never sets a frozen-storage standard. The
−18°C figure is confirmed correct, but sourced from the 1999 arrêté
(Art.2 definition + Art.6), not the 2025 one.
**New:** استبدال الإحالة إلى قرار 2025 بالإحالة إلى القرار الوزاري المشترك
المؤرخ في 21 نوفمبر 1999 (المادة 2 + المادة 6).

---

### Vague references — no article number cited (7 criteria)
**Action for each: LEGAL VERIFICATION REQUIRED** — locate the specific
article before this can carry a precise, defensible citation.
- BFD-01-01
- BFD-01-02
- BFD-02-03
- BFD-03-01
- BFD-03-02 (partial — has a citation for part of the claim, missing for
  the rest)
- BFD-06-01
- BFD-06-02 (cites generic "تشريعات الصحة العمومية" — public health
  legislation, no specific instrument at all)

---

### Already correctly handled, no action needed
BFD-02-02, BFD-08-01 — both carry honest [حكم مهني] flags with clear,
well-reasoned changelog trails (W16, W17). BFD-08-01 in particular is a
good model: it correctly identified that Loi 09-03 Art.19 is about consumer
right-of-withdrawal, not traceability, and corrected to Art.12/6. No
changes needed to either.

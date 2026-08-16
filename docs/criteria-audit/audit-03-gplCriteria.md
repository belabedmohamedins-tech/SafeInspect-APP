# Audit Patches — gplCriteria.ts

---

### GPL-01-01 — Art.5 misattribution + possible ministry mismatch
**Current:** يستند إلى المرسوم 06-198 المادة 5 (رخصة الاستغلال)
**Problem:** Art.5 = pre-authorization studies (EIE/danger study/inquiry),
not the license itself. Real license article = Art.20.
**New:** استبدال المادة 5 بالمادة 20 (تسليم رخصة الاستغلال).
**Also check:** the same criterion attributes the 83-496 Art.7 agrément to
"الوزير المكلف بالمناجم" (Minister of Mines), but Art.7's actual text says
"ministre chargé des hydrocarbures" (Minister of Hydrocarbons). Verify
which ministry is currently correct (portfolios have merged/split
historically in Algeria) before changing — flagging, not asserting wrong.
**Note:** Art.16 citation (distribution license) is confirmed accurate,
no change needed.

---

### GPL-01-02 — unconfirmed figures
**Current:** cites 83-496 Art.7 (as amended by 21-430 Art.2) for 60m²
premises + 4th-year schooling certificate requirements.
**Action:** VERIFY — the exact amended replacement text of Art.7 was not
directly confirmed against these specific figures this audit pass.

---

### GPL-03-01 — wrong article
**Current:** القانون 19-02 المادة 6 (حظر مصادر الاشتعال + لافتات التحذير)
**Problem:** Art.6 actual text = duty to present documents during
inspections. Nothing about ignition sources.
**New:** Tag **[À VÉRIFIER]**. No article in Loi 19-02's 47 articles
specifically mandates an ignition-source ban with this level of
technical specificity. Décret 91-05 Art.49 (electrical/spark sources in
explosion-risk zones) is a plausible supporting citation to add alongside,
not a replacement — verify before combining.

---

### GPL-03-02 — wrong article
**Current:** القانون 19-02 المادة 7 (تجهيزات الإطفاء الأولية)
**Problem:** Art.7 actual text = duty to follow admin procedures when
modifying the establishment. Nothing about extinguishers.
**New:** Replace with Décret 91-05 Art.57 (extinguisher type/capacity/
number/accessibility) — see cross-cutting reference material.

---

### GPL-03-03 — wrong article number, simple fix
**Current:** القانون 19-02 المادة 12 (خطة التدخل الداخلي والإخلاء)
**Problem:** Art.12 actual text = duty to have occupancy-counting
equipment. The real evacuation-plan article is Art.21.
**New:** استبدال المادة 12 بالمادة 21.

---

### GPL-04-01 / GPL-04-02 — not independently verified
**Action:** VERIFY — Loi 88-07 Art.10 (GPL-04-01) and 83-496 Art.8/10/11
(GPL-04-02) citations not independently checked against source text this
audit pass.

---

### GPL-05-01 — EIE citation, apply cross-cutting Finding 1
**Current:** القانون 03-10 المواد 15–22
**Note:** This was already the most defensible of the variants found
codebase-wide (correctly excludes Art.14). Apply the canonical wording from
cross-cutting Finding 1 for consistency across files, but no substantive
correction needed here — this is a wording-consistency update, not an
error fix.

---

### Already correctly handled, no action needed
GPL-02-01, GPL-02-02, GPL-02-03 — all correctly tagged [À VÉRIFIER — W51]
regarding the unpublished "AIM GPL2" draft source. Confirmed correct via
independent web search against official Algerian regulatory sources
earlier in this audit. Do not modify.

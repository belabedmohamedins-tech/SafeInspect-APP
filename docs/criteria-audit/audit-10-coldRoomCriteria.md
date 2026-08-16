# Audit Patches — coldRoomCriteria.ts (export: coldRoomSpecificCriteria)

---

### CLD-17-04 — implementation bug (numericField mismatch), apply cross-cutting Finding 7
**Current:** `numericField: { min: -100, max: 5, warningMax: 7 }` — but the
criterion's own text correctly states the legal limit is 0–4°C.
**Problem:** The app would not warn on a 4.5–6.9°C reading despite that
being out of compliance per this same object's own correct text.
**New:** Change `max` to `4` and `warningMax` to `4` (or a small buffer
just above 4, e.g. 4.5, if a soft-warning margin is intentional — confirm
intent before setting the exact warning value).
**Note:** The legal citation and text on this criterion are otherwise
CORRECT and well-verified (real changelog showing direct verification
against both the 2025 and 1999 arrêtés) — this is a data-validation bug
only, not a citation error. This is the best-verified temperature citation
in the codebase; use it as the model when fixing BFD-04-01 and ABT-AX5-01.

---

### CLD-17-03 — wrong article
**Current:** يستند إلى المادة 6 من قرار 2025 (مراقبة وتسجيل درجات الحرارة +
حفظ السجلات لمدة سنة)
**Problem:** Art.6 of the 2025 arrêté is actually about shared sanitary
facilities for small restaurants (<50 seats). The real temperature-recording
requirement is **Art.8** ("les équipements de stockage... doivent être munis
d'un système d'enregistrement de température") — which this same file's
CLD-17-04 correctly cites elsewhere.
**New:** استبدال المادة 6 بالمادة 8.
**Also:** the "1 year" retention period was not found stated anywhere in
the 2025 arrêté's 48 articles during this audit — verify this figure's
source before keeping it, or tag [حكم مهني] if it's a professional-judgment
default rather than a stated legal minimum.

---

### CLD-19-01 — EIE citation, apply cross-cutting Finding 1
**Current:** القانون 03-10 المواد 15–22
**Note:** Already one of the more defensible variants (correctly excludes
Art.14). Apply the canonical wording from Finding 1 for consistency; this
is a wording update, not an error fix.

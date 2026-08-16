# Audit Patches — carWashCriteria.ts

---

### CWS-02-04 — source law not in legal_refs corpus
**Current:** المرسوم 93-162 (نفايات الزيوت والشحوم)
**Problem:** Décret 93-162 does not exist anywhere in legal_refs/ —
confirmed against the full directory listing. Never verified by anyone.
**Action:** LEGAL VERIFICATION REQUIRED — source and convert (see
cross-cutting Finding 4; this decree is cited a second time in
mechanicCriteria.ts's MCH-29-03, so it's worth prioritizing).

---

### CWS-04-02 — source law not in legal_refs corpus
**Current:** المرسوم 05-315 (متعهدو نقل النفايات الخطرة)
**Problem:** Décret 05-315 does not exist anywhere in legal_refs/ — cited
8 times across the codebase (see cross-cutting Finding 4), the single most
important missing-source item found in this audit.
**Action:** LEGAL VERIFICATION REQUIRED — prioritize sourcing/converting
this decree over patching individual citations.

---

### Already correctly handled, no action needed
CWS-04-01 has an excellent explicit self-correction comment ("Tier2-Ch1
fix: replaced Décret 93-120 [periodic medical exams, NOT PPE] — correct
basis: Décret 91-05 art.9 + Décret 02-427"). This is a good model —
consider referencing it when fixing the Loi 90-11 pattern elsewhere
(cross-cutting Finding 3), since it demonstrates exactly the right
correction methodology already applied once in this codebase.

CWS-02-01B/C/D/E (pH 6.5–8.5, MES≤35, DBO5≤35, DCO≤120) correctly and
consistently reuse the confirmed Décret 06-141 Annexe I figures — no
change needed.

### Not individually re-verified
CWS-02-01 (hydrocarbons ≤10mg/L) — plausible, not independently confirmed
against exact Décret 06-141 text this audit pass.

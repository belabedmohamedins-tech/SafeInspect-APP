# Checklist Rework — Live Audit Tracker

> **Purpose:** Single source of truth for the ongoing criteria audit and rework.
> Every confirmed finding lives here. Nothing gets pushed until a session batch is declared ready.
> Cross-reference with `ROADMAP.md` (product roadmap) — they are separate concerns.

**Audit started:** July 2026
**Last updated:** July 13 2026 — after Session 2
**Push status:** ⏳ Waiting for Session 3 minimum before coordinated push

---

## Sessions Completed

| # | Topic | Status | Key Finding |
|---|---|---|---|
| 1 | Water supply / hygiene axes | ✅ Done | See below |
| 2 | Wastewater / liquid discharge | ✅ Done | See below |
| 3 | Solid & hazardous waste | ⏳ Pending | — |
| 4 | Air / noise / vibration | ⏳ Pending | — |
| 5 | Structural / fire / electrical | ⏳ Pending | — |
| 6+ | Remaining axes TBD | ⏳ Pending | — |

---

## Global Structural Issues (affects all checklists)

### G-1 — `baseFoodCriteria` still spread into 4 checklists
**Status:** 🔴 Confirmed in source — not fixed despite earlier reports claiming so.

`criteriaData.ts` still spreads `baseFoodCriteria` into:
- `abattoirCriteria`
- `uabCriteria`
- `updCriteria`
- `couvoirCriteria`

**Fix:** Remove the spread from all four. Each file already has its own specific criteria.

### G-2 — Legacy numeric series still live alongside new AX series
**Status:** 🔴 Confirmed in source — duplicate criteria are actively scoring.

The old `04-XX / 01-XX / 03-XX / 02-XX` series were never removed from:

| File | Legacy IDs to delete | Replacement (keep) |
|---|---|---|
| `abattoirCriteria.ts` | `04-04`, `04-06`, `04-08` | `ABT-AX4-01`, `ABT-AX3-01`, `ABT-AX6-01` |
| `uabCriteria.ts` | `01-04`, `01-05` | `UAB-AX3-01`, `UAB-AX3-02` |
| `updCriteria.ts` | `03-03`, `03-05` | `UPD-AX3-01`, `UPD-AX4-01` |
| `couvoirCriteria.ts` | `02-02`, `02-06` | `COU-AX2-01`, `COU-AX6-01` |

**Impact:** Wastewater findings are being double-weighted in the score for these four activity types.

---

## Session 1 — Water Supply / Hygiene Axes

> Session 1 audit document on file. Summary of actionable findings:

### S1-1 — Missing potable-water criteria in `carWashCriteria.ts`
**Status:** 🔴 Confirmed
`carWashCriteria.ts` has no water-quality axis. A car wash that sources from a borehole
with no potable-water certificate is invisible to the checklist.
**Fix:** Add `CWS-AX2-01` — Attestation of potable water source (ADE connection certificate
or accredited lab analysis ≤ 6 months, Art. 3 Décret 11-219).

### S1-2 — Missing potable-water criteria in `marbleCriteria.ts`
**Status:** 🔴 Confirmed
Same gap as S1-1. Marble workshops use water for cutting/cooling continuously.
**Fix:** Add `MRB-AX2-01` — identical obligation.

### S1-3 — `PRD-05-01` mis-filed (water axis, belongs in solid waste)
**Status:** 🔴 Confirmed
`PRD-05-01` ("storage of fresh produce — temperature and humidity control") is filed
under the water axis in `updCriteria.ts`. It has no relationship to liquid discharge.
**Fix:** Move to solid-waste / storage axis. Will be handled in Session 3 push.

---

## Session 2 — Wastewater / Liquid Discharge

> Full audit document: `Session_02_Wastewater_Liquid_Discharge_Audit.txt`

### S2-1 — No numeric compliance standard anywhere in the wastewater module
**Status:** 🔴 Confirmed
Every wastewater criterion says "pretreat effluents" with no threshold.
Décret 06-141 sets enforceable limits:

| Parameter | Threshold |
|---|---|
| pH | 6.5 – 8.5 |
| Suspended solids | ≤ 35 mg/L |
| BOD₅ | ≤ 35 mg/L |
| COD | ≤ 120 mg/L |
| Hydrocarbons / oils & grease | ≤ 10 mg/L |
| Temperature | ≤ 30 °C |

**Fix:** Replace generic "pretreat" wording with criterion text that names the Décret and
the parameter class. Numeric values can appear in the `legalReference` field + `notes`.
Inspector guidance text should reference the lab-analysis requirement.

### S2-2 — Two discharge-permit regimes conflated into one criterion
**Status:** 🔴 Confirmed — affects `UAB-AX3-02` and the equivalent in abattoir/UPD/couvoirs.

Algerian law has two distinct regimes:
- **Sewer network discharge** → Décret 09-209 Art. 12 — ADE/municipal permit required
- **Natural environment discharge** → Loi 05-12 Art. 51 + Décret 06-141 — ANRH/DRE authorisation required

Currently both are merged into a single criterion. A facility on sewer network gets
evaluated against natural-environment standards and vice versa.

**Fix:** Split into two criteria per affected checklist:
- `*-AX3-Xa` — Discharge permit (sewer) — Décret 09-209
- `*-AX3-Xb` — Discharge authorisation (natural environment) — Loi 05-12 / Décret 06-141

One will be marked `applicability: conditional` for facilities without sewer access.

### S2-3 — `UAB-AX3-02` has correct permit→lab-analysis chain; others don't
**Status:** 🔴 Confirmed
`UAB-AX3-02` properly sequences: permit → grease trap → accredited lab analysis.
`abattoirCriteria`, `updCriteria`, `couvoirCriteria` do not have the lab-analysis step.
High-volume car wash (`carWashCriteria`) and marble workshop (`marbleCriteria`) also owe
the same obligations but have no wastewater criterion at all.

**Fix:**
- Propagate the permit→grease trap→lab chain to `abattoirCriteria`, `updCriteria`, `couvoirCriteria`
- Add new `CWS-AX3-01` and `MRB-AX3-01` for car wash and marble workshop

### S2-4 — `ABT-AX3-01` controlType mismatch
**Status:** 🔴 Confirmed
Field is set to `'test'` but the correct value for lab-analysis verification is `'measurement'`.
**Fix:** Change `controlType` to `'measurement'` in `abattoirCriteria.ts`.

---

## Pending Push — Full Change Manifest

> Nothing is pushed until Session 3 is complete (minimum).
> This table is the authoritative pre-push checklist.

### `criteriaData.ts`
- [ ] G-1: Remove `...baseFoodCriteria` spread from abattoir, UAB, UPD, couvoirs

### `abattoirCriteria.ts`
- [ ] G-2: Delete `04-04`, `04-06`, `04-08`
- [ ] S2-3: Add lab-analysis step to wastewater criterion chain
- [ ] S2-4: Fix `controlType` on `ABT-AX3-01` → `'measurement'`
- [ ] S2-2: Split discharge criterion into sewer vs natural-environment

### `uabCriteria.ts`
- [ ] G-2: Delete `01-04`, `01-05`
- [ ] S2-2: Split `UAB-AX3-02` into two regime-specific criteria

### `updCriteria.ts`
- [ ] G-2: Delete `03-03`, `03-05`
- [ ] S1-3: Move `PRD-05-01` to solid-waste axis (coordinate with Session 3)
- [ ] S2-3: Add lab-analysis step to wastewater criterion chain
- [ ] S2-2: Split discharge criterion

### `couvoirCriteria.ts`
- [ ] G-2: Delete `02-02`, `02-06`
- [ ] S2-3: Add lab-analysis step to wastewater criterion chain
- [ ] S2-2: Split discharge criterion

### `carWashCriteria.ts`
- [ ] S1-1: Add `CWS-AX2-01` — potable water source attestation
- [ ] S2-3: Add `CWS-AX3-01` — discharge permit + grease trap + lab chain

### `marbleCriteria.ts`
- [ ] S1-2: Add `MRB-AX2-01` — potable water source attestation
- [ ] S2-3: Add `MRB-AX3-01` — discharge permit + settling tank + lab chain

---

## Open Questions (to resolve during remaining sessions)

| ID | Question | Raised in |
|---|---|---|
| OQ-1 | Does `mechanicCriteria.ts` owe a discharge permit for wash-down water? | Session 2 |
| OQ-2 | `paintShopCriteria.ts` — solvent-wash water: sewer or natural env regime? | Session 2 |
| OQ-3 | `printingCriteria.ts` — ink/solvent discharge: which axis? water or solid waste? | Session 2 |
| OQ-4 | `PRD-05-01` exact destination axis in solid waste (Session 3 will decide) | Session 1 |
| OQ-5 | `conditionalApplicability` field — does the type support it? Verify in `types.ts` | Session 2 |

---

## What is NOT Changing

- Scoring weights and severity levels — no changes without a dedicated scoring session
- `baseGeneralCriteria.ts` — not touched until all specific-criteria sessions are done
- Any file not listed in the change manifest above
- `jest.config.js`, `jest.setup.ts`, `TESTING.md` — completely separate concern

---

*This file is maintained by the AI assistant during the audit sessions.
Each session appends its findings. The push manifest is updated after each session.
Do not mark a checkbox as done until the code is actually committed.*

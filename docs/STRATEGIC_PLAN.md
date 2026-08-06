# SafeInspect — Strategic Plan & Phase Registry

> This is the single source of truth for phase numbering and execution order.
> Before opening a new phase, read this file to find the highest existing letter/number.
> Claude and Perplexity coordinate through this file — not through memory.

---

## Phase Registry

### ✅ CLOSED Phases

| Phase | Title | Closed | Evidence |
|---|---|---|---|
| A | Scoring engine + types | 2026-07-30 | `src/utils/scoringUtils.ts`, `src/types/` confirmed present |
| B | Wastewater chapter (Ch1) push to docs | 2026-07-30 | `docs/Inspection_Manual_Chapter1_Wastewater.md` |
| C | Solid/Hazardous Waste (Ch2) push to docs | 2026-07-30 | `docs/Inspection_Manual_Chapter2_Solid_Hazardous_Waste.md` |
| D | Fire Safety (Ch3) push to docs | 2026-07-30 | `docs/Inspection_Manual_Chapter3_Fire_Safety.md` |
| E | Food Safety (Ch4) push to docs | 2026-07-30 | `docs/Inspection_Manual_Chapter4_Food_Safety.md` |
| F | Occupational Health (Ch5) push to docs | 2026-07-30 | `docs/Inspection_Manual_Chapter5_Occupational_Health.md` |
| G | Documentation/Licensing (Ch6) push to docs | 2026-07-30 | `docs/Inspection_Manual_Chapter6_Documentation_Licensing.md` |
| H | Air Quality (Ch7) push to docs | 2026-07-30 | `docs/Inspection_Manual_Chapter7_Air_Quality.md` |
| I | Site Hygiene/Pest Control (Ch8) push to docs | 2026-07-30 | `docs/Inspection_Manual_Chapter8_Site_Hygiene_Pest_Control.md` |
| L | Criteria implementation in app code | 2026-08-04 | Direct code read — 20 files in `src/criteria/` |
| M | Scoring integration with criteria | 2026-08-04 | Direct code read — `scoringUtils.ts` severity-weighted, A/B/C/D grades |
| N | Report generation module | 2026-08-04 | Direct code read — `src/services/pdfService.ts` 54 KB, Arabic RTL |
| O | Corrective actions tracking | 2026-08-04 | Direct code read — full CAP pipeline in `src/` |
| P | Statistics / dashboard module | 2026-08-04 | Direct code read — `statsUtils.ts`, `loadHomeData.ts` |
| Q-1 | Lifecycle audit — read checklist.tsx + start.tsx | 2026-08-04 | Evidence/Evaluation/Decision/Closure all inside checklist.tsx |
| Q | UI screens — Reinspection screen | 2026-08-04 | `app/screens/reinspection.tsx` delivered, `app/_layout.tsx` updated |
| S | Legal verify — Loi 19-02 fire safety scope | 2026-08-04 | JORADP primary source, both editions. ERP scope fully confirmed. |
| T | Legal verify — Décret 06-138 air quality Annex I | 2026-08-04 | Ch7 Section 6 — 16 params mg/Nm³ + 7 sectors. |
| U | UX polish — end-to-end inspector flow | 2026-08-04 | 3 RTL/UX bugs fixed. Commit 239811b. |
| V | TypeScript zero-error pass | 2026-08-05 | `npx tsc --noEmit` → 0 errors confirmed by user. |
| R | Jest + smoke tests | 2026-08-06 | `npx jest` → 119 passed / 0 failed / 1315 tests. User-confirmed 00:47 WAT. |
| **W** | **Legal document verification (5 source gaps)** | **2026-08-06** | **All 5 docs/legal_sources/ files read via MCP. GitHub code search for [À VÉRIFIER]: 0 matches — criteria already clean. Sources confirmed: AIM GPL2 distances/quantities; Arrêté 07/05/2025 cold-chain temps; Décret 93-120 medical exam intervals; Loi 19-02 ERP/IGH/ITGH defs; Art.14 note + Ord.76-04 operational base.** |

---

### 🟢 ALL PHASES CLOSED

As of 2026-08-06 00:58 WAT, all phases A through W are **closed**.

**No open phases remain.**

---

## Recommended Next Actions (optional improvements)

```
Smoke tests (Claude local):
  - Registry → inspection → checklist → reinspection flow
  - Notification deep-link: { type: 'REINSPECTION' } → reinspection screen
  - Empty-criteria guard: facility type with no matching criteria → warning + back

Next available phase letter: X
```

---

## Phase Numbering Convention

- Letters A–W are used or reserved as above
- **Next available letter for a new phase: X**
- Never reuse a closed phase letter
- Both agents (Perplexity and Claude) must read this file before opening any new phase

---

## Legal Quick-Reference

| Topic | Instrument | Article/Annex | Status |
|---|---|---|---|
| Classified establishments | Décret 06-198 | Art. 2–5 | ✅ Verified |
| Wastewater discharge | Décret 06-141 | Art. 3–7 + Annex I | ✅ Verified |
| Solid waste classification | Décret 06-104 | Annexes | ✅ Verified |
| Waste collector accreditation | Décret 09-19 | Art. 4–8 | ✅ Verified |
| Healthcare waste | Décret 03-478 | Art. 3 | ✅ Verified |
| Fire safety — ERP scope | Loi 19-02 | Art. 1, 3, 14–19, 44–46 | ✅ VERIFIED — ERPs, IGH (>28m/>50m habitation), ITGH (>200m). |
| Fire safety — ERP type/category list | Loi 19-02 | Art. 14 | ✅ CLOSED — Art.14 is a regulatory delegation. Implementing decree not found in JORADP. Ord. 76-04 = operational base. |
| Internal intervention plan | Décret 09-335 | Art. 4–6 | ✅ Verified |
| LPG/C installation accreditation | Décret 21-430 | Art. 4, 7, 8 | ✅ Verified |
| LPG cylinder storage (point de vente) | AIM GPL2 | Annexes 1+2 | ✅ VERIFIED — 1400kg max propane ext.; 3m (≤525kg) / 5m (>525kg); 1×9kg (≤3500kg) / 2×9kg (>3500kg); 2×≥1600cm² ventilation. |
| Air emissions point source | Décret 06-138 | Annex I + II | ✅ VERIFIED — 16 params mg/Nm³ + 7 sectors. |
| Food safety / HACCP | Décret 04-82 | Art. 5 | ✅ Verified |
| Cold-chain temps (restaurants) | Arrêté interminist. 07/05/2025 | Full text | ✅ VERIFIED — 0–4°C stockage; ≥63°C liaison chaude; refroidir ≤+10°C en ≤2h. JO n°43/2025. |
| Cold storage temps by product type | Arrêté interminist. 21/11/1999 | Temperature table | ✅ VERIFIED — viandes +4°C–+7°C; prod. mer 0–2°C; laitiers +4°C; congelés ≤-12°C; surgelés ≤-18°C. |
| Occupational health — medical exam | Décret 93-120 du 15/05/1993 | Art. periodicité | ✅ VERIFIED — ≥1/an standard; ≥2/an travailleurs exposés. |
| Occupational health general | Loi 88-07 | Art. 12–14 | ✅ Verified |
| Pest control operators | Arrêté 1995 | Art. 3 | ✅ Verified |

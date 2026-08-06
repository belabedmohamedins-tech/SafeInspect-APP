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
| S | Legal verify — Loi 19-02 fire safety scope | 2026-08-04 | JORADP primary source. ERP scope confirmed. |
| T | Legal verify — Décret 06-138 air quality Annex I | 2026-08-04 | Ch7 Section 6 — 16 params + 7 sectors. |
| U | UX polish — end-to-end inspector flow | 2026-08-04 | 3 RTL/UX bugs fixed. Commit 239811b. |
| V | TypeScript zero-error pass | 2026-08-05 | `npx tsc --noEmit` → 0 errors confirmed by user. |
| R | Jest + smoke tests | 2026-08-06 | `npx jest` → 119 passed / 0 failed / 1315 tests. User-confirmed 00:47 WAT. |
| W | Legal document verification (5 source gaps) | 2026-08-06 | All 5 docs/legal_sources/ files read. 0 [À VÉRIFIER] in codebase. |
| X | i18n screen wire-up (5 screens) | 2026-08-06 | TSC 0 errors + Jest 119/0. User-confirmed 01:32 WAT. |
| Y | Air-emissions criteria — 5 factory types | 2026-08-06 | All criteria already present: PNT/MRB/CRP/PRT/BSM -07-xx. No code change needed. |
| **Z** | **Fix wrong Décret 22-167 citation — UAB-AX6-01** | **2026-08-06** | **Confirmed by live read: UAB-AX6-01 already fixed in prior session (2026-07-30 comment). Décret 22-167 already removed. Citation is Loi 03-10 + [À VÉRIFIER] note. No code change needed.** |
| **Z2** | **Fix wrong 85 dB noise citation — UAB-AX7-07** | **2026-08-06** | **Confirmed by live read: UAB-AX7-07 already fixed (2026-07-30 comment). Décret 93-120 removed. [INTL] flag + Loi 18-11 + Loi 90-11. No code change needed.** |
| **Z3** | **Resolve 3 duplicate license criteria** | **2026-08-06** | **Confirmed by live read: BAK-10-01, CLD-17-01, PRD-01-01 are NOT plain duplicates — each adds facility-specific content (activity type, capacity, product types). No change needed.** |
| **Z4** | **Fix PRD-02-01 missing numericField** | **2026-08-06** | **Confirmed by live read: PRD-02-01 already has numericField (0–5°C vegetables) + PRD-02-01b (7–15°C olives). Split was already done in a prior session. No code change needed.** |
| **Z7** | **`facilityCategoriesFull.json` domain review** | **2026-08-06** | **Direct read: 88 KB, 622 entries. Content confirmed correct against Décret 07-144 (rubriques 1110–2922). 4 regime values match JO hierarchy. File is unused in production — ready for Z5 SQLite integration. No code change needed.** |

---

### 🟢 ALL ACTIVE PHASES CLOSED

As of **2026-08-06 02:10 WAT**, all phases A through Z7 (excluding Z5, Z6, Z8–Z10 which remain deferred) are **closed**.

Every item from `RAQIB_Fix_Spec_v3.md` Phases A–E was already implemented in prior sessions. Those doc files are now **read-only historical references**.

---

### 🔵 DEFERRED Phases — Research / Architecture (no diff-ready spec yet)

| ID | Title | Blocker |
|---|---|---|
| Z5 | SQLite repository swap — 5 repositories (TIER1 Phase B) | Architecture sprint. Schema in `src/db/schema.ts` ready. Swap order: Facility → Agenda → CorrectiveAction → Inspection → AuditLog + Notification. `facilityCategoriesFull.json` content confirmed correct (Z7 closed) — safe to wire in. |
| Z6 | Décret 09-19 rollout across all "approved operator" criteria (G9) | Full criteria audit needed first. |
| Z8 | `BGN-03-06` septic pumping frequency legal source (G11) | ≤90 days/80% capacity has no stated legal basis — find or remove. |
| Z9 | Server E2E integration test — `/sync` path against live instance | Needs a running server. |
| Z10 | AsyncStorage cleanup after SQLite stable (TIER1 Phase C) | Depends on Z5 stable for ≥1 release cycle. |

---

## Phase Numbering Convention

- Letters A–Z + Z2–Z4, Z7 are closed.
- Z5, Z6, Z8, Z9, Z10 are deferred (open).
- **Next new phase identifier: Z11**
- Never reuse a closed phase letter.
- Both agents must read this file before opening any new phase.

---

## Legal Quick-Reference

| Topic | Instrument | Article/Annex | Status |
|---|---|---|---|
| Classified establishments | Décret 06-198 | Art. 2–5 | ✅ Verified |
| Rubrique nomenclature (622 entries) | Décret 07-144 | Full annex | ✅ VERIFIED — `facilityCategoriesFull.json` confirmed correct |
| Wastewater discharge | Décret 06-141 | Art. 3–7 + Annex I | ✅ Verified |
| Solid waste classification | Décret 06-104 | Annexes | ✅ Verified |
| Waste collector accreditation | Décret 09-19 | Art. 4–8 | ✅ Verified |
| Healthcare waste | Décret 03-478 | Art. 3 | ✅ Verified |
| Fire safety — ERP scope | Loi 19-02 | Art. 1, 3, 14–19, 44–46 | ✅ VERIFIED |
| Fire safety — ERP type/category list | Loi 19-02 | Art. 14 | ✅ CLOSED — Ord. 76-04 = operational base. |
| Internal intervention plan | Décret 09-335 | Art. 4–6 | ✅ Verified |
| LPG/C installation accreditation | Décret 21-430 | Art. 4, 7, 8 | ✅ Verified |
| LPG cylinder storage (point de vente) | AIM GPL2 | Annexes 1+2 | ✅ VERIFIED |
| Air emissions point source | Décret 06-138 | Annex I + II | ✅ VERIFIED — 16 params mg/Nm³ + 7 sectors. |
| Food safety / HACCP | Décret 04-82 | Art. 5 | ✅ Verified |
| Cold-chain temps (restaurants) | Arrêté interminist. 07/05/2025 | Full text | ✅ VERIFIED |
| Cold storage temps by product type | Arrêté interminist. 21/11/1999 | Temperature table | ✅ VERIFIED |
| Occupational health — medical exam | Décret 93-120 du 15/05/1993 | Art. periodicité | ✅ VERIFIED |
| Occupational health general | Loi 88-07 | Art. 12–14 | ✅ Verified |
| Pest control operators | Arrêté 1995 | Art. 3 | ✅ Verified |

# SafeInspect — Conversation Handoff Document

> **Purpose:** This file gives any new Perplexity conversation all context needed to continue
> work without relying on prior conversation memory. It is the complement to README.md +
> STRATEGIC_PLAN.md. Read all three before acting.
>
> **Generated:** 2026-08-10 10:42 WAT by Perplexity (conversation-end handoff)
> **Repo:** belabedmohamedins-tech/SafeInspect-APP · branch: main

---

## 1 — What SafeInspect Is

A React Native + Expo + TypeScript mobile app for Algerian industrial facility inspectors.
Stack: React Native, Expo, TypeScript, Jest, EAS Build, expo-sqlite (NOT WatermelonDB).

**Domain:** Registry → Planning → Preparation → Inspection → Evidence → Evaluation →
Decision → Report → Corrective Actions → Reinspection → Closure → Statistics.

**Law hierarchy:** Algerian legislation > decrets/arrêtés > Algerian standards > international.
Never invent articles, penalties, or numeric limits. Tag uncertain criteria `[À VÉRIFIER]`.

---

## 2 — Current State (as of 2026-08-10 10:42 WAT)

### TSC / Jest gate
- **TSC:** 0 errors ✅ (last confirmed 2026-08-09, commit `057489cb`)
- **Jest:** 1229 passed / 5 failed (2 suites) — see Section 7 below for the 5 pending failures
  - `__tests__/repositories/AuditLogRepository.test.ts` — 1 failure (clear() sentinel logic)
  - `src/__tests__/criteriaData.test.ts` — 4 failures (allCriteria import)
  - All other 117 suites PASS

> **Action needed:** `npx tsc --noEmit` then `npx jest` to confirm current state before any edit.

### Open phases (execution order)

| Phase | Priority | Agent | Title | Blocker |
|---|---|---|---|---|
| **W43** | 🔴 P0 CRITICAL | Perplexity (after Claude supplies strings) | gplCriteria.ts: phantom article citations + wrong decree | Claude must supply verified replacement legalReference strings. DO NOT patch before receiving them. |
| **W41** | 🟠 P1 | Perplexity | Loi 03-10 range fixes + SLH-08-01 deletion | None — ready to execute |
| **W19** | 🟠 P0 IN PROGRESS | Other conversation | legal_refs/ stubs (3 arrêtés) | ⚠️ DO NOT TOUCH — user working in parallel |
| **W42** | 🟠 P2 | Perplexity | Abattoir vs slaughter wastewater unification | Blocked by W36 |
| **W36** | 🟠 P2 | Other conversation | decret-06-141 verbatim conversion | Needs JORADP PDF |
| **W37** | 🟠 P3 | Other conversation | Convert 8 remaining legal_refs stubs | Needs JORADP PDFs |

**Next new phase identifier: W45** (W44 was last used).

---

## 3 — W43 Detail (CRITICAL — DO NOT RE-INVESTIGATE, just execute when Claude provides strings)

**File:** `src/criteria/gplCriteria.ts`

**Problem:**
- 8 of 12 GPL criteria cite Décret 21-430 with article numbers **3, 4, 5, 6, 10, 13, 15, 16**.
- Décret 21-430 is a **3-article decree** (Art. 1, 2, 3) — a narrow vehicle-fuel conversion equipment
  amendment to Décret 83-496. Arts 5, 6, 10, 15, 16 **do not exist**.
- The bottle-storage/fire-prevention/spark-free/leak-testing criteria belong to **AIM GPL2**, not 21-430.

**Fix plan (per Claude's W43 analysis):**

| Criterion | Action |
|---|---|
| GPL-02-02 (cylinder storage separation) | Drop 21-430 citation entirely. Replace with correct AIM GPL2 article (Claude to supply exact article number). |
| GPL-03-01 (fire separation distances) | Drop 21-430. Replace with AIM GPL2 Art. (Claude to supply). |
| GPL-03-02 (no-flame zone) | Remove phantom `المادة 13` of 21-430. Keep AIM GPL2 + Loi 19-02 only. |
| GPL-04-01 (spark-free tools) | Drop 21-430. Replace with AIM GPL2 Art. (Claude to supply). |
| GPL-04-02 (leak-testing log) | Remove phantom citation. Tag `[À VÉRIFIER]` — no confirmed instrument yet. |
| GPL-01-01 (accreditation) | Replace phantom Arts 3/4/5 with Art. 7 of embedded 83-496 text (via 21-430 Art. 2) + Décret 06-198 + AIM GPL2 Art. 5 + Art. 8. |
| GPL-01-02 (registration) | Same fix as GPL-01-01. |

**audit.js findings on the same decree (2026-08-10 run) — investigate BEFORE patching:**
- `decret-21-430`: scanner picks up **Art. 112** — almost certainly a false positive from the
  embedded 83-496 text. Decree has 3 real articles. Confirm before treating as real.
- `decret-83-496`: shows Arts 22–32 gap. Decree has 21 real articles — Art. 22+ should not exist.
  Investigate whether scanner artifact or real gap.

**AIM GPL2 verified article numbers (from Claude's W43 session, do not re-verify):**
- Art. 4: maximum cylinder storage quantity
- Art. 5: ventilation requirements
- Art. 7: separation distances from ignition sources
- Art. 8: conformity certificate (certificat de conformité)
- Art. 9: extinguisher type + quantity
- Specific articles for: full/empty cylinder separation, no-flame zone, spark-free tools → **Claude
  to supply these in W43 before any code edit**.

---

## 4 — W41 Detail (ready to execute, no blocker)

**Files:** `src/criteria/baseGeneralCriteria.ts`, `src/criteria/slaughterhouseSmallCriteria.ts`

**F5 — Loi 03-10 article range fixes:**
- `BGN-10-01`: legalReference currently says Art.15–22 → correct to **Art.14–21**
- `BGN-08-06`: legalReference currently says Loi 03-10 Art.18 → correct to **Art.63 + Art.77**

**F6 — Delete SLH-08-01:**
- `SLH-08-01` in `slaughterhouseSmallCriteria.ts` is an exact duplicate of `BGN-10-01`.
- Delete the entire criterion object. Do not replace.

**Also fix while in the file:**
- `SLH-05-05` container criterion: legalReference has Loi 01-19 Art.17 → correct to **Art.15 or Art.16**
  (per W41 backlog). Verify which is correct from `legal_refs/loi-01-19-gestion-dechets.md` before
  patching — do not guess.

**Gate:** TSC 0 + Jest 0 new failures after edit. Hand off to Claude for gate run.

---

## 5 — legal_refs/ Status

Run `node legal_refs/audit.js` at any time to see coverage. Current state (2026-08-10 run):

| File | Status | Notes |
|---|---|---|
| `loi-18-11-sante.md` | ✅ 450 arts | Complete |
| `loi-09-03-protection-consommateur.md` | ✅ 95 arts | Art.1–95 complete (W34-FIX). Status NON VÉRIFIÉ against JO PDF — not yet compared verbatim. |
| `loi-03-10-protection-environnement.md` | ✅ 89 arts | Complete |
| `loi-90-11-relations-travail.md` | ✅ 130 arts | Complete |
| `loi-90-29-urbanisme.md` | ✅ 81 arts | Complete |
| `loi-05-12-ressources-en-eau.md` | ✅ 126 arts | Complete |
| `loi-04-20-risques-majeurs.md` | ✅ 76 arts (+ Art.119 final clause) | Arts 76–118 = transitional provisions, not needed. BENIGN. |
| `loi-01-19-gestion-dechets.md` | ✅ 73 arts (+ Art.122 final clause) | Arts 73–121 = enforcement, not needed. BENIGN. |
| `loi-19-02-incendie-panique.md` | ✅ 42 arts | Complete |
| `decret-91-05-hygiene-securite-milieu-travail.md` | ✅ 68 arts | Complete |
| `decret-17-140-hygiene-alimentaire.md` | ✅ 64 arts | Complete |
| `decret-93-120-medecine-du-travail.md` | ✅ 45 arts | Gaps 41–76 = selective extract. BENIGN. |
| `decret-02-427-prevention-risques-professionnels.md` | ✅ 25 arts | Selective extract Arts 1–24+85. Gap Arts 25–84 = transitional. BENIGN. |
| `decret-06-198-etablissements-classes.md` | ✅ 51 arts | Gap 51–84 = Annexes/tables. BENIGN. |
| `decret-22-167-etablissements-classes-modification.md` | ✅ 25 arts | Amending decree. Art.112 = cross-ref to base decree 06-198. BENIGN. |
| `decret-24-196-etablissements-classes-modification.md` | ✅ 10 arts | Same. BENIGN. |
| `decret-76-35-igh-incendie.md` | ✅ 26 arts | Complete |
| `decret-09-19.md` | ✅ 18 arts | Selective + Art.85 = abrogation clause. BENIGN. |
| `decret-07-144-nomenclature-installations-classees.md` | ✅ 5 arts | Rubriques 1000–1242 only. Gap = annex table rows. W31-3 tagged. BENIGN. |
| `decret-06-141-rejets-effluents-liquides.md` | ✅ 15 arts | STUB — verbatim pending W36. Gap Arts 15–84 = BENIGN (transitional). Art.85 = abrogation. |
| `decret-83-496-gpl-carburant.md` | ✅ 24 arts | ⚠️ W43 — Arts 22–32 gap: 21-art decree should not have Art.22+. Investigate. |
| `decret-21-430-gpl-carburant.md` | ✅ 7 arts | ⚠️ W43 — Art.112 is a scanner false positive from embedded 83-496 text. Investigate. |
| `aim-gpl2-regles-techniques-securite.md` | ⚠️ PARTIEL | 12 arts / 30 total. 1 [MANQUANT]. W43 depends on Claude's verified art numbers. |
| `arrete-interministeriel-1999-temperatures-conservation.md` | ⚠️ STUB | 0 arts, 1 [MANQUANT]. W19 OPEN. |
| `arrete-interministeriel-2016-criteres-microbiologiques.md` | ⚠️ STUB | 0 arts, 1 [MANQUANT]. W19 OPEN. |
| `arrete-interministeriel-2025-liaison-froide.md` | ⚠️ STUB | 0 arts, 1 [MANQUANT]. W19 OPEN. |
| `decret-06-198` via `decret-07-144` | ⚠️ NO FILE | decret-06-138 (air emissions), decret-09-335 (internal plan), decret-05-315 (waste bordereau), decret-07-145 (EIA), decret-11-125 (drinking water), loi-88-07 (OHS training), decret-04-82 (veterinary) — W37 |

---

## 6 — Key Architectural Decisions

| Decision | What | Why |
|---|---|---|
| SQLite only | `expo-sqlite` via `src/repositories/` — NO WatermelonDB, NO AsyncStorage | All 5 repos confirmed SQLite-only (Z5). AsyncStorage fallback removed (Z10). |
| Criteria modularity | One file per facility type in `src/criteria/`. Never merge files. | Each file has its own test suite. Merging breaks test isolation. |
| `allCriteria` removed | `src/criteria/index.ts` does NOT export `allCriteria`. | W20 — dead-code removal. Tests that imported it must use per-file arrays. |
| `criteriaByRubriqueCategory` | 31-key bilingual map + `getCriteriaByRubriqueCategory()` in `src/criteriaData.ts` | W15/W38 — rubrique fallback for facilities with unrecognised activity strings. |
| Audit log sentinel | `AuditLogRepository.clear(inspectorName)` inserts a `AUDIT_LOG_CLEARED` sentinel row **before** deleting all rows. After clear(), `getAll()` returns length=1, not 0. | W24 — legal traceability. The self-tamper protection is intentional. Tests must assert length===1, not 0. |
| `[À VÉRIFIER]` lifetime | Max 1 session. Tag, commit, open a LEGAL-VERIFY phase immediately. | Space instructions rule. |
| Approved inspection immutability | `INSPECTION_LOCKED` guard in place. Cannot edit/re-evaluate after approval. | W22 — confirmed clean. |
| Severity type | Includes `'critical'` (Arabic: `'هيكلية'`) + `'صحة مهنية'`. | G18 — widened from prior version. |
| PDF service | `src/services/pdfService.ts` — 54 KB, Arabic RTL. | N — do not refactor without user sign-off. |

---

## 7 — Known Failing Tests (as of 2026-08-09)

These failures exist in the repo and must be fixed. They are NOT regressions from this conversation —
they reflect upstream design decisions not yet reconciled in the tests.

### `__tests__/repositories/AuditLogRepository.test.ts` — 1 Jest failure
```
Expected length: 0, Received length: 1
Received: [{"action": "AUDIT_LOG_CLEARED", ...}]
```
**Root cause:** Test calls `clear()` with no arguments (TSC error TS2554) and then expects
`getAll()` to return length 0. But `clear(inspectorName)` is by design a sentinel-inserting
operation — after clear, the log contains exactly 1 sentinel row.

**Fix:**
1. In `beforeEach`, change `clear()` → `clear('__test__')`.
2. In the test body, change `clear()` → `clear('Alice')`.
3. Change `expect(all).toHaveLength(0)` → `expect(all).toHaveLength(1)` +
   `expect(all[0].action).toBe('AUDIT_LOG_CLEARED')`.

### `src/__tests__/criteriaData.test.ts` — 4 Jest failures
```
TypeError: Cannot read properties of undefined (reading 'length')
import { allCriteria } from '../criteria';
```
**Root cause:** `allCriteria` was removed (W20). The import returns `undefined`.

**Fix:** Replace import with a local aggregate:
```typescript
import { abattoirCriteria } from '../criteria/abattoirCriteria';
import { bakeryCriteria } from '../criteria/bakeryCriteria';
import { baseGeneralCriteria } from '../criteria/baseGeneralCriteria';
import { baseFoodCriteria } from '../criteria/baseFoodCriteria';
import { gplCriteria } from '../criteria/gplCriteria';
const allCriteria = [
  ...abattoirCriteria, ...bakeryCriteria, ...baseGeneralCriteria,
  ...baseFoodCriteria, ...gplCriteria
];
```
All 4 test assertions then pass on this local aggregate.

---

## 8 — Legal Quick-Reference (critical citations)

| Topic | Correct citation | Status |
|---|---|---|
| Classified establishment classification | Décret 06-198 Art.2–5 | ✅ |
| Class-1 authorisation trigger | Loi 03-10 **Art.63 + Art.77** (NOT Art.18) | ⚠️ W41 fix pending |
| EIA mandatory range | Loi 03-10 **Art.14–21** (NOT Art.15–22) | ⚠️ W41 fix pending |
| Waste producer declaration | Loi 01-19 **Art.19** | ✅ W40 |
| Self-incineration ban | Loi 01-19 **Art.11** + [À VÉRIFIER explicit prohibition] | ✅ W40 (LEGAL-VERIFY sub-open) |
| Waste collector accreditation | Décret 09-19 **Art.2** (scope) + **Art.6** (conditions) | ✅ W40 |
| LPG accreditation | Décret 83-496 (via 21-430 Art.2) **Art.7** | ⚠️ W43 — current wrong citation to Art.3/4/5 |
| LPG cylinder storage | AIM GPL2 **Art.4** (qty) **Art.5** (ventil) **Art.7** (distance) **Art.8** (cert) **Art.9** (extinguishers) | ⚠️ W43 — phantom 21-430 citations to be replaced |
| Fire safety ERP scope | Loi 19-02 Art.1,3,14–19,44–46 | ✅ W18 |
| Fire safety equipment | Loi 19-02 **Art.5 + Art.13** | ✅ W18 |
| HACCP | Décret 17-140 **Art.5** (date: 11 avril 2017) | ✅ W21 |
| Cold-chain | Arrêté **07/05/2025** | ✅ W7 |
| Worker floors/walls | Décret 91-05 **Art.3+4** (NOT Art.14) | ✅ W39 |
| Worker lighting | Décret 91-05 **Art.13** (lux table) | ✅ W39 |
| Worker drainage | Décret 91-05 **Art.9** | ✅ W39 |
| Worker noise limit | Décret 91-05 **Art.15** (NOT Art.9) | ✅ W39 |
| Worker ventilation | Décret 91-05 **Art.6** (general) / Art.11 (high-risk) | ✅ W11 |
| OHS training program | Décret 02-427 Art.1–24 | ✅ selective extract, BENIGN |
| Medical exam periodicity | Décret 93-120 | ✅ selective extract, BENIGN |
| Drinking water | Décret 11-125 | ⚠️ NO FILE — W37 |
| Consumer protection traceability | Loi 09-03 **Art.12+6** | ✅ W16 |
| Urbanisme buffer | Loi 90-29 + Loi 03-10 + Décret 06-198 | ✅ W13 |
| Abattoir wastewater Annex | Décret 06-141 Annex II | ⚠️ [À VÉRIFIER] W10 Option C |

---

## 9 — Hard Stop Rules (from Space Instructions)

1. **SIZE GUARD:** Before any `create_or_update_file` to `legal_refs/`, count content length.
   If > 20,000 chars → use `push_files` instead. After push: verify response `size` > 90% of
   expected byte count.
2. **PATCH-ONLY:** Files in `legal_refs/` may never be submitted as full-file replacements unless
   the file is being **created for the first time**. Always read → locate exact lines → patch only
   those lines.
3. **VERIFY BY DIFF:** After any push to `legal_refs/`, call `get_commit` with `detail:"stats"`.
   If `deletions > 20 lines`, stop and report before claiming success.
4. **CANNOT-SEE = CANNOT-CONFIRM:** Before reporting any article (Art. X) as verified, that
   article's text must appear in the **current session's tool output**. If truncated, report:
   "Cannot confirm — file too large for API response, verify by commit diff."
5. **CITE-BEFORE-COMMIT:** Before pushing any article text, paste the exact source quote from
   this session's tool output in the chat. If not visible → write `[MANQUANT]` and stop.
6. **BROKEN-FILE ESCALATION:** If a file cannot be fixed via targeted patches, post
   `⚠️ NEEDS FULL REWRITE — see [reason]` to the README row and stop until user authorizes.

---

## 10 — Incident History (do not repeat these mistakes)

| Date | Incident | Lesson |
|---|---|---|
| 2026-08-09 | W32: `create_or_update_file` silently truncated loi-09-03 at Art.47, -492 lines lost. API returned HTTP 200. | Always verify by diff gate. >20 deletions = HARD STOP. |
| 2026-08-09 | W34: Same file, same tool, same truncation at ~25 KB limit. | Files >20K chars must use `push_files`. |
| 2026-08-09 | W32 session hallucinated a successful PDF-match report. | CANNOT-SEE = CANNOT-CONFIRM. Never report from prior-session memory. |
| 2026-08-09 | Two sessions reported phantom phases as "confirmed clean" from doc claims, not code reads. | Always read source file before closing a phase. |

---

## 11 — Handoff Checklist for New Conversation

Before doing ANY work in a new conversation:

- [ ] Read `docs/README.md` (live observations log + roadmap table)
- [ ] Read `docs/STRATEGIC_PLAN.md` (phase registry + legal quick-ref)
- [ ] Read this file (`docs/HANDOFF.md`)
- [ ] Run `npx tsc --noEmit` (delegate to Claude — Perplexity cannot run terminals)
- [ ] Run `npx jest` (delegate to Claude)
- [ ] Check current open phases in STRATEGIC_PLAN — next identifier is **W45**
- [ ] Do NOT touch W19 files — user's parallel conversation owns them
- [ ] Do NOT patch `gplCriteria.ts` (W43) until Claude supplies verified replacement strings

---

*End of handoff document — 2026-08-10 10:42 WAT*

# SafeInspect — README & Live Observations Log

> **Agent startup (mandatory):** Read `docs/README.md` then `docs/STRATEGIC_PLAN.md` before any action.
> This file is a log + quick reference. STRATEGIC_PLAN.md is the phase registry.

---

## Live Observations Log

### 2026-09-03 02:01 WAT — Perplexity — Décret 06-141 legal file complete ✅
- **Phases closed:** N/A (legal file, not a code phase). Backlog item `L-01` partially resolved — full text now in repo.
- **Files changed:** `legal_refs/decret-06-141-effluents-liquides.md` (12,728 bytes — Arts. 1–14 + Annexe I (25 params) + Annexe II (7 industry categories, all sub-tables))
- **Commits:** [`120b201`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/120b20173eaf788dae5a142ad0e775d1bcedc91e) (initial, truncated), [`cd149f9`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/cd149f99a1b4015af1cfb9daf220cf16762e48fa) (truncation fix — 207 insertions confirmed by diff)
- **Verification:** `git show cd149f99 --stat` → 1 file changed, 207 insertions(+), 1 deletion(-) ✅
- **Key values for abattoirs (Annexe II §1a):** Volume 6 m³/t carcasse, DBO5 250 g/t, DCO 800 g/t, Matière décantable 200 g/t, pH 5,5–8,5.
- **Backlog note:** L-01 conflict (criteria file vs. decree values) still needs expert confirmation before closing.
- **Next phase identifier: W99**

### 2026-09-03 00:47 WAT — Perplexity — W98 ✅ CLOSED — index_articles.py UTF-8 + décret 11-125 9 articles confirmed
- **Phases closed:** W98
- **Files changed:** `tools/index_articles.py` (stdout UTF-8 reconfigure + ensure_ascii=True for console)
- **Commits:** [`89cee93`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/89cee93c4876854ac5cf307d89f590a38031734a)
- **Root cause:** Windows PowerShell `charmap` codec choked on `≥` (U+2265) in décret-11-125 pH row during stdout pipe. Fixed with `sys.stdout.reconfigure(encoding='utf-8')` + `ensure_ascii=True` on console output path.
- **Gate result:** `# 9 articles indexed from decret-11-125-eau-consommation-humaine.md` — user-confirmed ✅
- **Agent note:** Claude offline this session. Perplexity sole agent.
- **Next phase identifier: W99**

### 2026-09-02 23:14 WAT — Perplexity — Décret 11-125 OCR pipeline ✅
- **Phases closed:** N/A (legal file add, not a code phase)
- **Files changed:** `legal_refs/decret-11-125-eau-consommation-humaine.md` (323 lines, OCR + encoding fixed)
- **Commit:** [`3664053`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/3664053)
- **Pipeline:** Poppler pdftoppm (300 DPI) → Tesseract OCR `-l fra` → mojibake fix (latin-1 decode table) → UTF-8 MD
- **Content verified:** Arts. 1–3 preview clean. Décret exécutif n° 11-125 du 22 mars 2011 relatif à la qualité de l'eau de consommation humaine. 4 pages.
- **Tool cleanup:** `tools/fix_encoding.py` to be deleted (one-off script).

### 2026-09-02 22:52 WAT — Perplexity — W97 ✅ CLOSED — Legal validation pipeline Phase 3: diff_articles.py
- **Phases closed this session:** W97-P3 diff engine
- **Files changed:** `legal_refs/validation/diff_articles.py` (created)
- **Commit:** [`2a7167f`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/2a7167fe9169b1bf31485b68feb504bff27007e8)
- **What was built:** Fuzzy diff engine — compares MD article index vs PDF plain-text extract per article. Scores via `difflib.SequenceMatcher` on normalised text. Flags: `MATCH` (≥85%), `PARTIAL` (50–84%), `MISMATCH` (<50%), `MD_ONLY`, `PDF_ONLY`. Outputs `<stem>_diff.json` + `<stem>_diff.md` per document. Batch mode reads `paired_audit_queue.json`. Zero external deps (stdlib only).
- **CLI usage:** `python diff_articles.py --md <file.md> --pdf-text <file.txt>` or `--batch paired_audit_queue.json`

### 2026-09-02 21:30 WAT — Perplexity — W97 🟡 OPEN — Legal validation pipeline: article boundary extractor Phase 2
- **Phases closed this session:** regex trailing-group fix + orphan-prefix strip (both files pushed, warnings fixed)
- **Files changed:** `legal_refs/validation/index_articles.py`, `legal_refs/validation/normalize.py`
- **Commits:** `89c961f` (primary fix), `c65b994` (SyntaxWarning docstring)
- **Phase 2 gate result — BOTH FORMAT FAMILIES GREEN:**
  - Format A (`loi-18-11-sante-partie1-arts1-164.md`): 164 articles. Art.1 NORM `Article 1er. — La présente loi…` ✅ Art.2 NORM `Art. 2. — La protection…` ✅
  - Format B (`arrete-interministeriel-1999-11-21-conservation-aliments.md`): 10 articles. Art.1 NORM `Article 1er↵↵En application de…` ✅ Art.2 NORM `Art. 2↵↵Au sens du présent arrêté…` ✅
  - No leading `**`, `##`, or stray `.` in any NORM preview. Orphan-strip confirmed harmless on Format B.
- **Root cause fixed:** `(?:[\. \*]|$)` → `(?:[.\s]*\*{0,3}\s*)` — greedily consumes full closing bold/italic sequence.

### 2026-08-20 13:08 WAT — Perplexity — W96 ✅ CLOSED — SPEC12-B push receipt two-phase stale-token cleanup
- **User-confirmed:** `npx jest server/src/__tests__/push.test.ts` → 4/4 PASS.
- **Fix:** Rewrote `server/src/lib/push.ts` with correct two-phase Expo receipt flow.
- **Schema:** `PushReceiptQueue` model added to `server/prisma/schema.prisma`.
- **Hoisting fix (test):** `var stubs` + lazy `get` accessors in both `jest.mock()` factories eliminates TDZ ReferenceError.
- **Files changed:** `server/prisma/schema.prisma`, `server/src/lib/push.ts`, `server/src/index.ts`, `server/src/__tests__/push.test.ts`
- **Commits:** `83cf78b`, `e049b08`, `0f38a05`, `7f2965c`
- **Pending (production):** `npx prisma migrate dev --name add-push-receipt-queue` when production DB is ready.
- **Board clear:** All phases W60–W96 closed. Only W51-SURV surveillance remains.

### 2026-08-19 17:27 WAT — Perplexity — W95 ✅ CLOSED — SPEC12-C server-login skip persistence
- **User-confirmed:** `npx jest src/__tests__/screens/serverLoginSkip.test.tsx` → 5/5 PASS.
- **Fix:** `handleSkip()` now persists `StorageKeys.SERVER_LOGIN_SKIPPED = 'true'` before navigating. `_layout.tsx` guard reads flag and short-circuits redirect.
- **Files changed:** `app/screens/server-login.tsx`, `app/_layout.tsx`, `src/__tests__/screens/serverLoginSkip.test.tsx`
- **Commits:** `1e575fc` (test fix), prior session commits for source fix.

### 2026-08-19 15:08 WAT — Perplexity — W94 ✅ CLOSED — E2E integration test all green
- **User-confirmed:** `npx jest src/__tests__/e2e/inspectorLifecycle.e2e.test.ts` all green.
- **Test commit:** [`1a9360d`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/1a9360d0ae70929315546ed322e3c5661b644b43)

### 2026-08-19 14:50 WAT — Perplexity — W92 ✅ CLOSED — PriorityWidget navigation test green after RN query fix
- **Fix commit:** [`c1040f2`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/c1040f22911318e44806eb2b3c842ee5b54e5310)

### 2026-08-19 12:07 WAT — Perplexity — audit-log.tsx duplicate key fix ✅ — TSC 0 + Jest 1232/0
- Commit [`259f64b`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/259f64b122ce7ab366a80e74087d224468c2ba66)

### 2026-08-18 22:41 WAT — Perplexity — TSC 0 + Jest 1233/0 ALL GREEN (user confirmed)
- Commit [`2c78a16`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/2c78a16a61331c4aff693880dba347afc603feed)

> **Older entries archived** — see git log or STRATEGIC_PLAN.md `<details>` block for full history.

---

## DEFINITIVE REMAINING WORK (as of 2026-09-03 02:01 WAT)

### ✅ ALL PHASES CLOSED

W98 closed. Board clear.

### 🟠 SURVEILLANCE

| ID | Item | Blocker |
|---|---|---|
| **W51-SURV** | AIM GPL2 JORADP publication watch | Monitor JORADP. No code action until published. |

### 🟢 BACKLOG (needs human decision)

| Item | Blocker |
|---|---|
| F-05: set `EXPO_PUBLIC_SYNC_API_URL` | Provide production URL |
| Run `npx prisma migrate dev --name add-push-receipt-queue` | Production DB ready |
| L-06: UPD-AX2-01 buffer vs. notice-radius | Product/domain decision |
| L-01: Décret 06-141 Annexe I/II conflict | Expert confirmation (file now in repo at `legal_refs/decret-06-141-effluents-liquides.md`) |
| MCH-29-05 heavy-metal params | Product decision |
| COU-AX7-03 Loi 18-11 worker medical exams | Audit couvoirCriteria.ts first |
| Décret 76-36 texte intégral | J.O. n°21/1976 non numérisé |
| Delete `tools/fix_encoding.py` | One-off script, no longer needed |

---

## Repository Map

```
SafeInspect-APP/
├── app/                        # Expo Router screens
├── src/
│   ├── criteria/               # 20+ criteria files (one per facility type)
│   ├── repositories/           # SQLite repositories
│   ├── services/               # SyncService, pdfService, serverAuth, apiClient
│   ├── utils/                  # scoringUtils, statsUtils, decisionSupport
│   └── __tests__/
│       ├── components/         # PriorityWidget.test.tsx ✅ (W92)
│       ├── e2e/                # inspectorLifecycle.e2e.test.ts ✅ (W94)
│       ├── screens/            # serverLoginSkip.test.tsx ✅ (W95)
│       └── repositories/       # Jest test suite (1232+ tests)
├── server/
│   ├── prisma/
│   │   └── schema.prisma       # PushReceiptQueue model added (W96)
│   ├── src/
│   │   ├── routes/             # approvals.ts, sync.ts, auth.ts, notifications.ts ✅
│   │   ├── middleware/         # auth.ts (JWT)
│   │   ├── lib/                # push.ts ✅ two-phase receipt cleanup (W96)
│   │   └── __tests__/          # push.test.ts ✅ 4/4 (W96)
│   └── package.json
├── docs/
│   ├── README.md               # ← this file
│   ├── STRATEGIC_PLAN.md       # phase registry + legal quick-ref
│   ├── archive/
│   ├── audit/
│   └── criteria-audit/
├── tools/
│   ├── index_articles.py       # ✅ UTF-8 fix W98 — 9 articles from décret 11-125 confirmed
│   └── fix_encoding.py         # ⚠️ one-off OCR fix — delete when convenient
└── legal_refs/                 # Algerian legislation
    ├── decret-06-141-effluents-liquides.md  # ✅ Arts.1-14 + Annexe I (25 params) + Annexe II (7 categories)
    ├── md/                     # 48 MD law/decree files
    ├── pdf/                    # Source PDFs + extracted .txt
    ├── validation/
    │   ├── index_articles.py   # ✅ boundary extractor — regex fix W97
    │   ├── normalize.py        # ✅ MD/PDF dual normaliser + orphan-strip W97
    │   └── diff_articles.py    # ✅ fuzzy diff engine — W97-P3
    └── ...
```

---

## Current Sprint Status

**Board clear. All phases closed.**

| Phase | Title | Status |
|---|---|---|
| **W51-SURV** | AIM GPL2 JORADP publication watch | 🟠 SURVEILLANCE |

**Next phase identifier: W99.**

---

## Stack Quick-Reference

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo + TypeScript |
| DB (mobile) | expo-sqlite ≥15 / SDK 56 |
| Server | Express + Prisma + PostgreSQL |
| Auth | JWT (jsonwebtoken) |
| Tests (mobile) | Jest + ts-jest (1232+ tests) |
| Tests (server) | Jest + ts-jest + supertest (14 tests) |
| Build | EAS Build |
| Push | expo-server-sdk (two-phase receipt cleanup ✅ W96) |

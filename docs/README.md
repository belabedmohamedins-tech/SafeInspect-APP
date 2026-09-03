# SafeInspect â€” README & Live Observations Log

> **Agent startup (mandatory):** Read `docs/README.md` then `docs/STRATEGIC_PLAN.md` before any action.
> This file is a log + quick reference. STRATEGIC_PLAN.md is the phase registry.

---

## Live Observations Log

### 2026-09-03 13:31 WAT — Perplexity — W100 ✅ CLOSED — Décret 06-141 Annexe I+II diff-verified against PDF
- **Phases closed:** W100
- **Files changed:** legal_refs/decret-06-141-effluents-liquides.md — Extraction header added: PDF native text layer (pymupdf get_text(), no OCR), full diff Annexe I (25 params) + Annexe II (7 categories) verified line-by-line 2026-09-03, result: MATCH total. Single divergence: decimal point notation 1.5 → 1,5 (French comma) in §4 Cuivre — form only, no value error.
- **Commit:** [bc98336](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/bc98336c349ec4a7eada5e36bbd3a3b68a06cb82)
- **Epistemological note (per Claude audit):** Values were present in training knowledge of the decree — the diff was essential to confirm correctness. "Transcribed from JORADP" ≠ verified until PDF diff ran. Both are now true.
- **Next phase identifier: W (next = X)**

### 2026-09-03 02:59 WAT â€” Perplexity â€” W99 âœ… CLOSED â€” Art.13 susvisÃ© + diff_articles ordinal key normalisation
- **Phases closed:** W99
- **Files changed:**
  - `legal_refs/decret-06-141-effluents-liquides.md` â€” Art.13: added `, susvisÃ©,` after `1993`; Annexe I rows 12â€“25 + full Annexe II restored
  - `legal_refs/validation/diff_articles.py` â€” added `_normalise_article_key()`: strips French ordinal suffixes (`er`, `Ã¨re`, `re`, `Ã¨me`, `eme`, `e`) from digit-only keys; both `extract_md_articles()` and `extract_pdf_articles()` now call it so `1er` â†’ `1` and never creates a ghost duplicate
- **Commit:** [`15d811d`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/15d811d1af86cab6ef83cff8837751397aa83a98)
- **Verify:** `python legal_refs/validation/diff_articles.py --md legal_refs/decret-06-141-effluents-liquides.md --pdf-text <extract.txt>`
- **Next phase identifier: W100**

### 2026-09-03 02:01 WAT â€” Perplexity â€” DÃ©cret 06-141 legal file complete âœ…
- **Phases closed:** N/A (legal file, not a code phase). Backlog item `L-01` partially resolved â€” full text now in repo.
- **Files changed:** `legal_refs/decret-06-141-effluents-liquides.md` (12,728 bytes â€” Arts. 1â€“14 + Annexe I (25 params) + Annexe II (7 industry categories, all sub-tables))
- **Commits:** [`120b201`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/120b20173eaf788dae5a142ad0e775d1bcedc91e) (initial, truncated), [`cd149f9`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/cd149f99a1b4015af1cfb9daf220cf16762e48fa) (truncation fix â€” 207 insertions confirmed by diff)
- **Verification:** `git show cd149f99 --stat` â†’ 1 file changed, 207 insertions(+), 1 deletion(-) âœ…
- **Key values for abattoirs (Annexe II Â§1a):** Volume 6 mÂ³/t carcasse, DBO5 250 g/t, DCO 800 g/t, MatiÃ¨re dÃ©cantable 200 g/t, pH 5,5â€“8,5.
- **Backlog note:** L-01 conflict (criteria file vs. decree values) still needs expert confirmation before closing.

### 2026-09-03 00:47 WAT â€” Perplexity â€” W98 âœ… CLOSED â€” index_articles.py UTF-8 + dÃ©cret 11-125 9 articles confirmed
- **Phases closed:** W98
- **Files changed:** `tools/index_articles.py` (stdout UTF-8 reconfigure + ensure_ascii=True for console)
- **Commits:** [`89cee93`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/89cee93c4876854ac5cf307d89f590a38031734a)
- **Root cause:** Windows PowerShell `charmap` codec choked on `â‰¥` (U+2265) in dÃ©cret-11-125 pH row during stdout pipe. Fixed with `sys.stdout.reconfigure(encoding='utf-8')` + `ensure_ascii=True` on console output path.
- **Gate result:** `# 9 articles indexed from decret-11-125-eau-consommation-humaine.md` â€” user-confirmed âœ…

### 2026-09-02 23:14 WAT â€” Perplexity â€” DÃ©cret 11-125 OCR pipeline âœ…
- **Phases closed:** N/A (legal file add, not a code phase)
- **Files changed:** `legal_refs/decret-11-125-eau-consommation-humaine.md` (323 lines, OCR + encoding fixed)
- **Commit:** [`3664053`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/3664053)
- **Pipeline:** Poppler pdftoppm (300 DPI) â†’ Tesseract OCR `-l fra` â†’ mojibake fix (latin-1 decode table) â†’ UTF-8 MD
- **Content verified:** Arts. 1â€“3 preview clean. DÃ©cret exÃ©cutif nÂ° 11-125 du 22 mars 2011 relatif Ã  la qualitÃ© de l'eau de consommation humaine. 4 pages.
- **Tool cleanup:** `tools/fix_encoding.py` to be deleted (one-off script).

### 2026-09-02 22:52 WAT â€” Perplexity â€” W97 âœ… CLOSED â€” Legal validation pipeline Phase 3: diff_articles.py
- **Phases closed this session:** W97-P3 diff engine
- **Files changed:** `legal_refs/validation/diff_articles.py` (created)
- **Commit:** [`2a7167f`](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/2a7167fe9169b1bf31485b68feb504bff27007e8)
- **What was built:** Fuzzy diff engine â€” compares MD article index vs PDF plain-text extract per article. Scores via `difflib.SequenceMatcher` on normalised text. Flags: `MATCH` (â‰¥85%), `PARTIAL` (50â€“84%), `MISMATCH` (<50%), `MD_ONLY`, `PDF_ONLY`. Outputs `<stem>_diff.json` + `<stem>_diff.md` per document. Batch mode reads `paired_audit_queue.json`. Zero external deps (stdlib only).
- **CLI usage:** `python diff_articles.py --md <file.md> --pdf-text <file.txt>` or `--batch paired_audit_queue.json`

### 2026-09-02 21:30 WAT â€” Perplexity â€” W97 ðŸŸ¡ OPEN â€” Legal validation pipeline: article boundary extractor Phase 2
- **Phases closed this session:** regex trailing-group fix + orphan-prefix strip (both files pushed, warnings fixed)
- **Files changed:** `legal_refs/validation/index_articles.py`, `legal_refs/validation/normalize.py`
- **Commits:** `89c961f` (primary fix), `c65b994` (SyntaxWarning docstring)
- **Phase 2 gate result â€” BOTH FORMAT FAMILIES GREEN:**
  - Format A (`loi-18-11-sante-partie1-arts1-164.md`): 164 articles. Art.1 NORM `Article 1er. â€” La prÃ©sente loiâ€¦` âœ… Art.2 NORM `Art. 2. â€” La protectionâ€¦` âœ…
  - Format B (`arrete-interministeriel-1999-11-21-conservation-aliments.md`): 10 articles. Art.1 NORM `Article 1erâ†µâ†µEn application deâ€¦` âœ… Art.2 NORM `Art. 2â†µâ†µAu sens du prÃ©sent arrÃªtÃ©â€¦` âœ…
  - No leading `**`, `##`, or stray `.` in any NORM preview. Orphan-strip confirmed harmless on Format B.
- **Root cause fixed:** `(?:[\.  \*]|$)` â†’ `(?:[.\s]*\*{0,3}\s*)` â€” greedily consumes full closing bold/italic sequence.

### 2026-08-20 13:08 WAT â€” Perplexity â€” W96 âœ… CLOSED â€” SPEC12-B push receipt two-phase stale-token cleanup
- **User-confirmed:** `npx jest server/src/__tests__/push.test.ts` â†’ 4/4 PASS.
- **Fix:** Rewrote `server/src/lib/push.ts` with correct two-phase Expo receipt flow.
- **Schema:** `PushReceiptQueue` model added to `server/prisma/schema.prisma`.
- **Hoisting fix (test):** `var stubs` + lazy `get` accessors in both `jest.mock()` factories eliminates TDZ ReferenceError.
- **Files changed:** `server/prisma/schema.prisma`, `server/src/lib/push.ts`, `server/src/index.ts`, `server/src/__tests__/push.test.ts`
- **Commits:** `83cf78b`, `e049b08`, `0f38a05`, `7f2965c`
- **Pending (production):** `npx prisma migrate dev --name add-push-receipt-queue` when production DB is ready.
- **Board clear:** All phases W60â€“W96 closed. Only W51-SURV surveillance remains.

> **Older entries archived** â€” see git log or STRATEGIC_PLAN.md `<details>` block for full history.

---

## DEFINITIVE REMAINING WORK (as of 2026-09-03 02:59 WAT)

### âœ… ALL PHASES CLOSED

W99 closed. Board clear.

### ðŸŸ  SURVEILLANCE

| ID | Item | Blocker |
|---|---|---|
| **W51-SURV** | AIM GPL2 JORADP publication watch | Monitor JORADP. No code action until published. |

### ðŸŸ¢ BACKLOG (needs human decision)

| Item | Blocker |
|---|---|
| F-05: set `EXPO_PUBLIC_SYNC_API_URL` | Provide production URL |
| Run `npx prisma migrate dev --name add-push-receipt-queue` | Production DB ready |
| L-06: UPD-AX2-01 buffer vs. notice-radius | Product/domain decision |
| L-01: DÃ©cret 06-141 Annexe I/II conflict | Expert confirmation (file now in repo at `legal_refs/decret-06-141-effluents-liquides.md`) |
| MCH-29-05 heavy-metal params | Product decision |
| COU-AX7-03 Loi 18-11 worker medical exams | Audit couvoirCriteria.ts first |
| DÃ©cret 76-36 texte intÃ©gral | J.O. nÂ°21/1976 non numÃ©risÃ© |
| Delete `tools/fix_encoding.py` | One-off script, no longer needed |

---

## Repository Map

```
SafeInspect-APP/
â”œâ”€â”€ app/                        # Expo Router screens
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ criteria/               # 20+ criteria files (one per facility type)
â”‚   â”œâ”€â”€ repositories/           # SQLite repositories
â”‚   â”œâ”€â”€ services/               # SyncService, pdfService, serverAuth, apiClient
â”‚   â”œâ”€â”€ utils/                  # scoringUtils, statsUtils, decisionSupport
â”‚   â””â”€â”€ __tests__/
â”‚       â”œâ”€â”€ components/         # PriorityWidget.test.tsx âœ… (W92)
â”‚       â”œâ”€â”€ e2e/                # inspectorLifecycle.e2e.test.ts âœ… (W94)
â”‚       â”œâ”€â”€ screens/            # serverLoginSkip.test.tsx âœ… (W95)
â”‚       â””â”€â”€ repositories/       # Jest test suite (1232+ tests)
â”œâ”€â”€ server/
â”‚   â”œâ”€â”€ prisma/
â”‚   â”‚   â””â”€â”€ schema.prisma       # PushReceiptQueue model added (W96)
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ routes/             # approvals.ts, sync.ts, auth.ts, notifications.ts âœ…
â”‚   â”‚   â”œâ”€â”€ middleware/         # auth.ts (JWT)
â”‚   â”‚   â”œâ”€â”€ lib/                # push.ts âœ… two-phase receipt cleanup (W96)
â”‚   â”‚   â””â”€â”€ __tests__/          # push.test.ts âœ… 4/4 (W96)
â”‚   â””â”€â”€ package.json
â”œâ”€â”€ docs/
â”‚   â”œâ”€â”€ README.md               # â† this file
â”‚   â”œâ”€â”€ STRATEGIC_PLAN.md       # phase registry + legal quick-ref
â”‚   â”œâ”€â”€ archive/
â”‚   â”œâ”€â”€ audit/
â”‚   â””â”€â”€ criteria-audit/
â”œâ”€â”€ tools/
â”‚   â”œâ”€â”€ index_articles.py       # âœ… UTF-8 fix W98 â€” 9 articles from dÃ©cret 11-125 confirmed
â”‚   â””â”€â”€ fix_encoding.py         # âš ï¸ one-off OCR fix â€” delete when convenient
â””â”€â”€ legal_refs/                 # Algerian legislation
    â”œâ”€â”€ decret-06-141-effluents-liquides.md  # âœ… Arts.1-14 + Annexe I (25 params) + Annexe II (7 catÃ©gories) â€” Art.13 susvisÃ© corrected (W99)
    â”œâ”€â”€ md/                     # 48 MD law/decree files
    â”œâ”€â”€ pdf/                    # Source PDFs + extracted .txt
    â”œâ”€â”€ validation/
    â”‚   â”œâ”€â”€ index_articles.py   # âœ… boundary extractor â€” regex fix W97
    â”‚   â”œâ”€â”€ normalize.py        # âœ… MD/PDF dual normaliser + orphan-strip W97
    â”‚   â””â”€â”€ diff_articles.py    # âœ… fuzzy diff engine â€” W97-P3 + ordinal key normalisation W99
    â””â”€â”€ ...
```

---

## Current Sprint Status

**Board clear. All phases closed.**

| Phase | Title | Status |
|---|---|---|
| **W51-SURV** | AIM GPL2 JORADP publication watch | ðŸŸ  SURVEILLANCE |

**Next phase identifier: X.**

---

## Stack Quick-Reference

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo + TypeScript |
| DB (mobile) | expo-sqlite â‰¥15 / SDK 56 |
| Server | Express + Prisma + PostgreSQL |
| Auth | JWT (jsonwebtoken) |
| Tests (mobile) | Jest + ts-jest (1232+ tests) |
| Tests (server) | Jest + ts-jest + supertest (14 tests) |
| Build | EAS Build |
| Push | expo-server-sdk (two-phase receipt cleanup âœ… W96) |


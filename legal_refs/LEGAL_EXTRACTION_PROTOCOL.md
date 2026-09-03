# Legal Extraction Protocol — SafeInspect

> **This is a hard gate, not documentation.**
> No MD file in `legal_refs/` may be cited by any criterion until it passes every step below.
> No exceptions for "I'm confident about this one."

---

## The Core Rule (non-negotiable)

**No AI agent may fill in legal content from memory.**

Every article, every limit value, every threshold in every MD file must trace back to one of:
1. A PDF text layer extracted by a named tool (`pymupdf get_text()`, `pdfplumber`, `pdftotext`)
2. A scan OCR'd by a named tool (`tesseract -l fra`, `easyocr`)

If neither is true, the file must carry `[MANQUANT — extraction pending]` on every unverified row and must not be cited until the extraction runs.

---

## Gate Checklist — New MD File

Run these steps in order. A file is **not verified** until all boxes are checked and the commit diff confirms them.

### Step 1 — Extraction (not negotiable)
- [ ] PDF located in `legal_refs/pdf/`
- [ ] Extraction method chosen:
  - Native text layer → `pymupdf get_text()` or `pdftotext`
  - Scanned PDF → `tesseract -l fra` (300 DPI via `pdftoppm`)
- [ ] Plain-text extract saved as `legal_refs/pdf/<stem>.txt`
- [ ] Extraction method + tool version recorded in the MD file header under `**Extraction :**`

**Header format (mandatory):**
```
**Extraction :** PDF texte natif — pymupdf `get_text()` (aucun OCR). Vérifié le YYYY-MM-DD.
```
or
```
**Extraction :** Scan OCR — pdftoppm 300 DPI + tesseract 5.x `-l fra`. Vérifié le YYYY-MM-DD.
```

### Step 2 — Article Index
```powershell
python legal_refs/validation/index_articles.py <file.md>
```
- [ ] Output shows expected article count (no ghost duplicates, no `1er` vs `1` collision)
- [ ] Ordinal normalisation active (`1er` → `1`) — confirmed by W99

### Step 3 — Fuzzy Diff
```powershell
python legal_refs/validation/diff_articles.py --md legal_refs/<file.md> --pdf-text legal_refs/pdf/<stem>.txt
```
- [ ] Output JSON saved as `legal_refs/validation/<stem>_diff.json`
- [ ] All articles: `MATCH` (≥85%) or `PARTIAL` (50–84%) with human review
- [ ] Zero `MISMATCH` or `MD_ONLY` / `PDF_ONLY` without explanation
- [ ] Annexes / tables verified separately (diff engine covers articles; tables need manual spot-check)

### Step 4 — Commit
- [ ] Commit message includes: `legal: <decree> verified — diff MATCH <date>`
- [ ] Run `git show <sha> --stat` — confirm `deletions` ≤ 20 (no truncation)
- [ ] File size in commit response ≥ 90% of expected byte count

### Step 5 — Registry Update
- [ ] `docs/STRATEGIC_PLAN.md` Legal Quick-Reference row updated to `✅ Present — PDF diff-verified YYYY-MM-DD`
- [ ] `docs/README.md` log entry added

---

## Scale Validation — Corpus-Wide Run (PENDING)

> **Status: NOT YET RUN**
> The pipeline (index_articles + normalize + diff_articles) has been stress-tested on ~3 files.
> Before trusting any MATCH result from the rest of the corpus, run a full batch pass.

```powershell
# Build paired_audit_queue.json first, then:
python legal_refs/validation/diff_articles.py --batch legal_refs/validation/paired_audit_queue.json
```

Expected discovery: at least one new format family (Format C or beyond) that breaks the current regex.
When found: fix `index_articles.py` regex, re-run, do NOT claim MATCH on files that ran before the fix.

**This corpus-wide run must happen before any new criterion cites a previously-unverified MD file.**

---

## Known Format Families

| Family | Example file | Article pattern | Status |
|---|---|---|---|
| A | `loi-18-11-sante-partie1-arts1-164.md` | `Art. N. —` / `Article Ner. —` | ✅ Tested W97 |
| B | `arrete-interministeriel-1999-11-21-conservation-aliments.md` | `Article Ner\n\nText` | ✅ Tested W97 |
| C+ | Unknown | Unknown | ⚠️ Not yet discovered — corpus run pending |

---

## Epistemological Record

| Event | Date | Lesson |
|---|---|---|
| Décret 11-125: WHO values fabricated | 2026-09-02 | AI filled missing Annexe from memory. Values were plausible but wrong origin. |
| Décret 06-141: values from training knowledge | 2026-09-03 | Values correct (diff MATCH), but origin was training knowledge not extraction. Declared "verified" before diff ran. |
| Both resolved by | 2026-09-03 | pymupdf extraction + diff_articles.py line-by-line diff. |
| Core lesson | — | "Confident" ≠ verified. Extraction method must be stated before citation. |

---

## Files Referenced

| Script | Purpose |
|---|---|
| `legal_refs/validation/index_articles.py` | Article boundary extraction (W97) |
| `legal_refs/validation/normalize.py` | MD/PDF dual normaliser + ordinal strip (W97) |
| `legal_refs/validation/diff_articles.py` | Fuzzy diff engine, MATCH/PARTIAL/MISMATCH (W97-P3, ordinal fix W99) |

---

*Protocol established 2026-09-03 following W99/W100 (Décret 06-141 PDF diff) and Claude audit of epistemological risk.*

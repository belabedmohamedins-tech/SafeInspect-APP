# Legal Reference Conversion Protocol — SafeInspect

**Status:** Adopted 2026-09-03. Applies to every PDF in `legal_refs/pdf/` and every MD file in `legal_refs/`, past and future.

---

## The One Rule That Matters

No numeric value or article text in a `legal_refs/*.md` file is trustworthy until it has been produced by a **stated, checkable extraction method** and **diffed against its source PDF**. "Typed from the source text," "I recall this decree," or any other memory-based transcription — by a human or an AI — is not an extraction method. If a value cannot be extracted or verified, the correct content is `[À VÉRIFIER]`, never a plausible guess.

This rule exists because two things almost happened on 2026-09-03: fabricated WHO-standard values nearly got committed as if they were JORADP's actual figures, and Décret 06-141 had values with no stated origin at all. Both looked fine until someone asked "where did this come from."

---

## Mandatory Extraction Order — Never Skip Ahead

Run in this order, per page, for every PDF, before any human decides "this looks like a scan":

### Tier 1 — fitz (PyMuPDF) text extraction
Try this **first, unconditionally, on every page**. Most JORADP PDFs are born-digital and this alone is sufficient. The entire OCR detour on Décret 11-125 happened because this step was skipped on a visual assumption — it would have worked immediately.

```python
import fitz
doc = fitz.open("file.pdf")
for page in doc:
    text = page.get_text()
    # If len(text) > 200: use it. Done.
```

### Tier 2 — pdfplumber fallback
Only if a page's fitz output is under ~200 characters.

```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[n].extract_text()
```

### Tier 3 — Tesseract OCR
Only if **both** Tier 1 and Tier 2 fail on a page.
Command: `tesseract input.png output -l fra` (or `fra+ara` for mixed text).
Tag output trust: **"low"** unconditionally.

```powershell
pdftoppm -r 300 file.pdf page_prefix
tesseract page_prefix-001.ppm output -l fra
```

### Tier 4 — Vision fallback / manual transcription
Only triggered when OCR output on a **table** fails a sparsity check (see `table_sparsity.py`). Never applied preemptively, and never treated as equivalent to Tier 1/2 extraction.

### Header record (mandatory on every MD file)

```
**Extraction :** <tier + tool> — <what was extracted>, session YYYY-MM-DD
```

Examples:
```
**Extraction :** PDF texte natif — pymupdf `get_text()` (aucun OCR). Vérifié le 2026-09-03.
**Extraction :** Scan OCR — pdftoppm 300 DPI + tesseract 5.x `-l fra`. Vérifié le 2026-09-03. Confiance : faible.
```

This is not decorative — the diff gate should eventually refuse to trust a file without it.

---

## Article Boundary Handling

`legal_refs/validation/index_articles.py` recognises three confirmed marker formats:

| Family | Pattern | Example file |
|---|---|---|
| **A** | Bold inline `**Art. 2.**` | `loi-18-11-sante-partie1-arts1-164.md` |
| **B** | Markdown heading `### Article 12` | `arrete-interministeriel-1999-11-21-conservation-aliments.md` |
| **C** | Arabic `المادة N` (Arabic-Indic digit normalisation included) | TBD |

**Known limitation:** validated against 2–3 documents, not the full corpus. Before trusting the indexer against a new file, spot-check that file specifically. A fourth format is plausible and should be expected, not treated as impossible. When found: fix the regex in `index_articles.py`, re-run all previously indexed files, do not claim MATCH on files that ran before the fix.

---

## The Diff Gate — Mandatory Before Any Criterion Cites a File

`legal_refs/validation/diff_articles.py` must run against a legal MD file **before any criterion in `src/criteria/` is allowed to reference it**.

Output tags:
- `MATCH` — ≥85% similarity, no numeric mismatch
- `PARTIAL` — 50–84%, requires human review
- `MISMATCH` — <50%, file must be corrected before citation
- `MD_ONLY` — article in MD but not in PDF (phantom content)
- `PDF_ONLY` — article in PDF but missing from MD (gap)

**A file is "ready for citation" only when every article actually referenced by an active criterion is `MATCH`.** Everything else in the file can exist at a lower trust tier, but must stay visibly tagged as `[À VÉRIFIER]` — never silently promoted.

**Diff currency rule:** A passing diff report is current only as of the commit it ran against. If the MD file or its source PDF changes, the diff must re-run. This is a standing check, not a one-time certification.

---

## Rollout — Do Not Extrapolate From Two Successes

Two documents (Décret 11-125, Décret 06-141) do not validate this pipeline project-wide. Before treating this as reliable across the whole legal library:

1. Run the extraction tier logic across **every PDF in `legal_refs/pdf/`** and produce one corpus-wide status report — trust tier and diff result per file.
2. Expect to find new format variants and new extraction failures. That is the point of running it now rather than discovering them file by file under pressure later.
3. Any MD file not yet run through this pipeline has **no elevated trust** — it is in the same unverified state as the original AI conversions, regardless of how long it has been sitting in the repo looking fine.

```powershell
# Build paired_audit_queue.json, then:
python legal_refs/validation/diff_articles.py --batch legal_refs/validation/paired_audit_queue.json
```

---

## What This Protocol Explicitly Forbids

- Filling a blank value with a plausible number from general or training knowledge, under any framing ("standard value," "typical for this parameter," "close enough").
- Marking a file "verified" or "closed" based on a status report that does not show the actual extracted text or the actual diff output.
- Deleting extraction tooling (e.g. `tools/fix_encoding.py`) before the content it produced has passed the diff gate.
- Treating "the file reads correctly" or "looks right in context" as a substitute for a stated extraction method plus a diff result.
- Reporting any article as confirmed when it did not appear in the current session's tool output (see CANNOT-SEE = CANNOT-CONFIRM rule in space instructions).

---

## Epistemological Record

| Event | Date | Lesson |
|---|---|---|
| Décret 11-125: WHO values fabricated | 2026-09-02 | AI filled missing Annexe from memory. Values were plausible but wrong origin. Caught by user challenge. |
| Décret 06-141: values from training knowledge | 2026-09-03 | Values correct (diff MATCH), but origin was training knowledge not extraction. Declared "verified" before diff ran. |
| Both resolved by | 2026-09-03 | pymupdf Tier 1 extraction + `diff_articles.py` line-by-line diff. |
| Core lesson | — | "Confident" ≠ verified. Extraction method must be stated before citation. Diff is a gate, not a rescue. |

---

## Files Referenced

| Script | Purpose | Status |
|---|---|---|
| `legal_refs/validation/index_articles.py` | Article boundary extraction, ordinal normalisation | ✅ W97 + W99 |
| `legal_refs/validation/normalize.py` | MD/PDF dual normaliser + orphan-strip | ✅ W97 |
| `legal_refs/validation/diff_articles.py` | Fuzzy diff engine, MATCH/PARTIAL/MISMATCH | ✅ W97-P3 + W99 |

---

*Protocol v2 — established 2026-09-03. v1 drafted by Perplexity post-W100. Full text by Claude audit of epistemological risk. Supersedes v1 committed at [25384cb](https://github.com/belabedmohamedins-tech/SafeInspect-APP/commit/25384cba41bbaf60e64ea79960425ea5c524eb2b).*

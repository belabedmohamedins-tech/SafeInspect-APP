# Legal Reference Conversion Protocol — SafeInspect

**Status:** Adopted 2026-09-03. Applies to every PDF in `legal_refs/pdf/` and every MD file in `legal_refs/`, past and future.

> **Strategy update (2026-09-13):** PDFs under `legal_refs/pdf/` are the canonical legal sources. The primary trust unit is a criterion-level verified citation excerpt, not a complete Markdown mirror. Markdown under `legal_refs/md/` is a derived/reference artifact. Full-document Markdown conversion is optional unless a specific product requirement calls for it.

---

## Canonical Source and Citation Trust Unit

A legal citation is trusted only when its source PDF, exact page, extracted text, extraction method, extraction tier, source hash, verification state, and verification note are recorded.

```json
{
  "decree": "09-19",
  "article": "9",
  "pdfPath": "legal_refs/pdf/decret 09-19.pdf",
  "page": 2,
  "extractedText": "Le registre de collecte contient notamment les indications suivantes...",
  "extractionMethod": "pymupdf-block",
  "extractionTier": 1,
  "extractionDate": "2026-09-13",
  "sourceHash": "<sha256-of-exact-source-pdf>",
  "verified": true,
  "verificationNote": "Checked against the PDF page image; article marker and continuation confirmed."
}
```

`extractedText` is a derived, traceable excerpt. It must never be treated as a replacement legal source.

### Required citation fields

- `pdfPath`: canonical source PDF path.
- `page`: zero-based PDF page index unless the record explicitly states another convention.
- `extractedText`: exact excerpt used by the criterion; do not paraphrase legal wording.
- `extractionMethod`: tool or method actually used.
- `extractionTier`: 1, 2, 3, or 4.
- `extractionDate`: ISO date of extraction or verification.
- `sourceHash`: SHA-256 of the exact PDF bytes used.
- `verified`: `true` only after source comparison and provenance review.
- `verificationNote`: concise, inspectable explanation of how verification was performed.

### Trust states

- `UNEXTRACTED`: no citation excerpt exists.
- `EXTRACTED`: excerpt and provenance exist, but verification is incomplete.
- `VERIFIED`: source comparison, provenance, source hash, and verification note are complete.
- `STALE`: current PDF hash differs from the stored hash.
- `REVIEW`: layout, OCR, or source ambiguity remains.

A boolean `verified: true` without the required fields is invalid.

---

## Mandatory Extraction Order — Never Skip Ahead

Apply this order to the page containing the requested citation:

### Tier 1 — PyMuPDF text extraction

Run `get_text()` first, unconditionally. If the requested citation is present and structurally coherent, retain it with PyMuPDF provenance.

### Tier 2 — pdfplumber fallback

Use only when Tier 1 is insufficient for the requested citation. Record the page and extraction method.

### Tier 3 — Tesseract OCR

Use only when Tiers 1 and 2 fail. Tag OCR-derived text as low confidence until independently checked.

### Tier 4 — Vision or manual transcription

Use only for unresolved sparse tables, visual layout ambiguity, or citation fragments that remain unreadable after Tiers 1–3. Record the manual/visual method explicitly.

No tier may be skipped because a page appears scanned. No AI-generated legal text is permitted at any tier.

---

## Citation Verification Workflow

1. Identify the criterion and exact legal proposition needed.
2. Locate the relevant PDF and page.
3. Extract only the needed article or passage, beginning with Tier 1.
4. Record source path, page, block or region, method, tier, date, and SHA-256 source hash.
5. Compare the excerpt against the PDF page or image; use a second extraction tier only if Tier 1 is insufficient.
6. Add a concise verification note describing the check performed.
7. Mark the citation `VERIFIED` only when provenance, source comparison, and hash checks pass.
8. Recheck the hash whenever the source PDF is replaced, amended, or regenerated.

---

## Markdown Policy

Markdown files under `legal_refs/md/` remain useful for human reading and historical work, but they are derived artifacts:

- They are not the canonical legal source.
- They are not required to be complete before a criterion can cite a PDF passage.
- Existing files are retained; do not delete or mass-rewrite them as part of this strategy.
- A Markdown excerpt must not silently override a PDF citation.
- Full-document diffing is optional for uncited articles.
- When a Markdown file is edited, preserve provenance and run the applicable diff; do not claim corpus-wide trust from a local check.

---

## Profiles and Layout-Specific Handling

A per-document profile is optional, not a prerequisite. Build and maintain one only when repeated citations from the same layout justify its cost.

For a one-off or rarely cited passage, prefer direct page extraction plus visual/manual confirmation over generalized block-order engineering. A profile must remain separate from citation records and must never silently promote unresolved fragments.

Column-order errors, OCR corruption, and table sparsity are distinct failure classes. Solving one document's layout does not establish a general corpus solution.

---

## Provenance and Diff Rules

Every citation record must preserve enough provenance to reproduce the extraction:

- source PDF path and SHA-256 hash;
- zero-based page index or explicit page convention;
- article, block, bounding box, or image region when available;
- extractor and tier;
- extraction and verification dates;
- verification note.

Diff before trust remains mandatory for any citation or Markdown passage that will support an active criterion. Rerun the relevant diff whenever the PDF, citation excerpt, or Markdown passage changes.

A file or citation is not `TRUSTED` merely because it is readable, complete-looking, or previously marked verified.

---

## What This Protocol Forbids

- AI-generated legal text or numeric values.
- Memory-based transcription presented as extraction.
- `verified: true` without source hash, provenance, source comparison, and verification note.
- Treating a Markdown mirror as more authoritative than its PDF.
- Generalizing from one profile or one PDF layout to the entire corpus.
- Deleting existing legal Markdown as a shortcut.
- Silently relabeling layout artifacts as `MATCH`.
- Skipping Tier 1 because a PDF appears scanned.

---

## Existing Tooling

The existing validation scripts remain available for targeted use:

- `legal_refs/validation/index_articles.py` — article boundary extraction.
- `legal_refs/validation/normalize.py` — normalization for comparison.
- `legal_refs/validation/diff_articles.py` — article-level comparison.
- `legal_refs/validation/extract_pdfplumber.py` — Tier 2 extraction where needed.

Use these tools for the relevant citation or Markdown passage; do not assume that a corpus-wide result is necessary for every criterion.

---

## Migration Policy

Existing criteria and Markdown files are not automatically reclassified as `VERIFIED` under this strategy. Migrate citations incrementally:

1. When a criterion is created or edited, attach a complete citation record.
2. Compute and store the exact source PDF hash.
3. Verify the cited passage and add the verification note.
4. Mark the citation state explicitly.
5. Leave unrelated criteria and derived Markdown unchanged until they are touched.

---

*Protocol v4 — citation-first update, 2026-09-13. Retains the Tier 1→4 extraction order and provenance requirements from v3 while changing the trust unit from full-document Markdown to criterion-level citations.*

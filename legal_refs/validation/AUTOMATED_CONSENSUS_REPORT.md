# Automated Multi-Engine Consensus Audit
> Run date: 2026-08-26. This report is an automated triage artifact, not a substitute for the authoritative PDFs.
## Scope and safety rule
The scan covered all 45 registry documents in `legal_refs/validation/conversion_status.json`. It used native `pdftotext` extraction across the corpus and incorporated the isolated five-document MinerU benchmark where available. PDFs were never modified. No legal Markdown was overwritten and no document was promoted solely from OCR agreement.
## Corpus results
| Metric | Result |
|---|---:|
| Registered legal documents | 45 |
| PDFs in repository | 47 |
| Markdown files in repository | 47 |
| Documents with empty/near-empty native PDF text | 8 |
| Documents with automated triage flags | 43 |
| Automatic legal corrections applied | 0 |
## Interpretation of flags
The flags below are deliberately treated as review signals, not confirmed defects. Numeric divergence is often caused by Journal Officiel headers, page numbers, OCR normalization, Arabic-Indic digits, date formats, or mixed-issue material. Article-marker divergence is often caused by different Markdown heading conventions. A flag therefore never authorizes a silent correction.
| Automated signal | Count | Meaning |
|---|---:|---|
| Empty native PDF text | 8 | Likely scanned PDF; requires OCR evidence. |
| Native article-marker difference | 1 | Possible heading/parser difference or omission; not confirmed. |
| Native numeric-token difference | 18 | Candidate token mismatch after raw normalization; requires page-aware comparison. |
| MinerU article-marker difference | 18 | MinerU and current Markdown use different structure or scope. |
| MinerU numeric difference | 32 | Candidate discrepancy, commonly affected by mixed issue pages. |
## MinerU benchmark conclusion
MinerU was successfully executed locally on Decrees 83-496 and 91-05, Laws 03-10 and 90-29, and Decree 06-138. It produced layout-aware Markdown, JSON, page images, and layout PDFs. It was particularly useful for identifying mixed Journal Officiel scope and locating target entries. It did not justify automatic replacement of any current Markdown. Decree 83-496 remains unsafe because the scan does not establish complete bilingual equivalence.
## Automated disposition
| Disposition | Rule |
|---|---|
| Preserve current Markdown | Existing files remain unchanged unless the PDF establishes an exact correction. |
| Quarantine candidate discrepancy | Any disagreement in article numbers, dates, legal references, numbers, units, deadlines, exceptions, tables, or annexes is recorded as a signal rather than auto-corrected. |
| `[ILLISIBLE]` candidate | Only insert when a source page is demonstrably unreadable and the exact location is known; do not fill it with an OCR guess. |
| Unsafe | Retain for Decree 83-496 and the unpublished project draft. |
## Recommended production policy
Use MinerU as a second extractor and layout/table assistant, with `pdftotext` and Tesseract as independent evidence channels. Isolate mixed Journal Officiel page ranges before comparison. Normalize digits only for comparison, never in the legal output. Require exact consensus for legal-critical tokens; otherwise keep the current Markdown and write a quarantine record. This achieves the requested no-page-by-page-review workflow without making the unsafe claim that OCR is 100% reliable.
## Reproducibility artifacts
The detailed machine-readable output is `automated_consensus_scan.json`. The five-document MinerU raw outputs remain under the external benchmark workspace used for this run.

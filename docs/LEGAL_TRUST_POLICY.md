# Legal Document Trust Policy (v1)

## Purpose

This document defines what **TRUSTED** means for legal texts in the SafeInspect‑APP legal database. The goal is to make trust **evidence-based**, not just a declarative flag.

## Scope

Applies to all legal Markdown files in legal_refs/ that are derived from official JORADP PDFs (lois, décrets, arrêtés, etc.).

## Trust tiers

Each document’s provenance JSON (e.g. legal_refs/workbench/provenance/*.json) must include a 	rust_tier field with one of:

- "UNTRUSTED" – initial state after extraction, before validation.
- "PENDING_FINAL_APPROVAL" – extraction and structural checks complete, but article-level diff not yet run or not yet accepted.
- "REVIEW_REQUIRED" – automated checks found issues (e.g. low match rate, critical mismatches) that need human review.
- "TRUSTED" – all trust conditions below are satisfied.

## Trust conditions for TRUSTED status

A document may be marked 	rust_tier = "TRUSTED" only if **all** of the following hold:

### 1. Provenance recorded

The provenance JSON includes:

- source_pdf – exact PDF filename.
- pdf_sha256 – SHA256 hash of the PDF bytes.
- pages – number of pages extracted.
- extraction_tier – 1, 2, or 3.
- extractor – e.g. PyMuPDF (pymupdf.open().page.get_text()).
- 	imestamp – ISO 8601 timestamp of extraction.

Before reusing an extraction, the PDF hash must be recomputed; if it differs from pdf_sha256, the record must be marked STALE — SOURCE CHANGED and the extraction rerun.

### 2. Extraction complete

- extraction_status = "COMPLETE".
- Text extracted for all pages in the PDF (page count matches).
- No obvious gaps (e.g. missing first/last page, missing annexes when present in PDF).

### 3. Structural review passed

- structural_status = "REVIEWED".
- Encoding checks pass:
  - French accented characters (é, è, à, ç, œ, etc.) intact.
  - Any Arabic text intact (if applicable).
- Article boundaries are detectable and consistent with the PDF structure.

### 4. Article-level diff passed

An article-level diff has been run between the canonical Markdown and the source PDF using the repo’s validation pipeline (e.g. legal_refs/validation/diff_articles.py or equivalent).

Requirements:

- Diff results recorded (e.g. in _diff.json or embedded in provenance).
- Overall match rate meets an agreed threshold (e.g. ≥ 90% MATCH+PARTIAL).
- No MISMATCH flagged on articles deemed **critical** (e.g. core obligations, penalties, definitions).  
  (Critical articles can be annotated later in a separate manifest.)

### 5. No unresolved critical issues

- diff_status is not "SIGNIFICANT_DIFF" in a way that indicates missing or corrupted legal text.
- Any PARTIAL or MISMATCH flags are understood and documented in the 
otes field of the provenance JSON.

## Process

1. **Extraction**  
   - Run tiered extraction (Tier 1 → 2 → 3) as per docs/LEGAL_DATABASE_ROADMAP.md.
   - Create provenance JSON with 	rust_tier = "UNTRUSTED".

2. **Structural check**  
   - Verify page count, encoding, article boundaries.
   - If issues found, set structural_status = "ISSUES_FOUND" and 	rust_tier = "REVIEW_REQUIRED".

3. **Article-level diff**  
   - Run diff pipeline.
   - Record results and update diff_status.

4. **Trust decision**  
   - If all trust conditions are met, set 	rust_tier = "TRUSTED".
   - If not, set 	rust_tier = "REVIEW_REQUIRED" or keep "PENDING_FINAL_APPROVAL" until resolved.

## Reference implementation

Décret 11‑125 (commit dbc1ac4 and later on branch legal-database-start) is the reference implementation for this trust workflow. New documents should follow the same pattern.

## Future work

- Define a **critical articles manifest** per domain (water, food, waste, etc.) to refine the “no MISMATCH on critical articles” rule.
- Automate trust-tier updates based on diff results and thresholds.
- Periodic audit of TRUSTED documents to ensure continued alignment with this policy.
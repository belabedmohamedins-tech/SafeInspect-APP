# Legal Database Roadmap

## Phase 1: Single-PDF Validation Pipeline
1. **Select 1 priority PDF** (e.g. `decret 11-125.pdf` or `Decret 17-140.pdf`).
2. **Compute SHA256** of the PDF bytes.
3. **Tier‑1 extraction** (PyMuPDF `get_text()`) → one `.txt` per page + combined `.txt`.
4. **Structural checks:** page count match, article boundary sanity, encoding (é, è, à, ç, œ + Arabic if present).
5. **Provenance record** (JSON): filename, SHA256, pages, tier, extractor, timestamp.
6. **Diff review:** compare to existing `_diff.md` (if any) or create new canonical Markdown.
7. **Escalate only if needed:** Tier‑2 (pdfplumber) → Tier‑3 (Tesseract) → manual.

## Phase 2: Batch Processing
8. Repeat Phase 1 for 5–10 core decrees/lois (water, hygiene, waste, pressure equipment, urbanism).
9. Build a **manifest CSV/JSON** listing all processed PDFs with provenance + trust status.

## Phase 3: Integration
10. Commit validated Markdown + provenance JSON to `legal_refs/` (UTF‑8, no BOM).
11. Update `LEGAL_EXTRACTION_PROTOCOL.md` with any lessons learned.
12. Prepare for app consumption (indexing, search, citation mapping).

---

## Proposed Work Order (First 10 Documents)

| # | Document | Domain |
|---|----------|--------|
| 1 | `decret 11-125.pdf` | Eau consommation humaine |
| 2 | `Decret 17-140.pdf` | Hygiene alimentaire |
| 3 | `Décret 06-198.pdf` | Etablissements classes |
| 4 | `Loi 18-11.pdf` | Sante publique |
| 5 | `Décret 07-144.pdf` | Nomenclature installations classees |
| 6 | `decret-25-63-plans-intervention-catastrophes.pdf` | Plans intervention catastrophes |
| 7 | `Décret 91-05.pdf` | Hygiene & securite milieu travail |
| 8 | `Loi 03-10.pdf` | Protection environnement |
| 9 | `Décret 04-410.pdf` | Dechets |
| 10 | `loi-90-29-urbanisme.pdf` | Urbanisme |

---

## Notes

- All new files must be **UTF‑8, no BOM**.
- Provenance is mandatory: **SHA256 + filename + pages**.
- Never mark `TRUSTED` until provenance + structure + diff all pass.
- Escalation triggers: empty/near-empty text, scrambled reading order, sparse tables, residual layout issues.

## Reference Implementation & Trust Policy

As of branch `legal-database-start`:

- Décret 11‑125 is the **reference implementation** for the extraction and provenance workflow.
- Canonical full-text for Décret 11‑125 currently lives in `legal_refs/workbench/decret-11-125_canonical.md`, with provenance recorded in `legal_refs/workbench/provenance/decret-11-125_provenance.json` (including SHA256, pages, extraction tier, and status).
- The old `_diff.md` in `legal_refs/validation/` is retained as a historical validation artifact (article-level diff report), not as canonical text.
- The provenance JSON for Décret 11‑125 currently has `trust_tier = "PENDING_FINAL_APPROVAL"`, meaning the document is structurally reviewed and extracted but not yet marked `TRUSTED`.

All future documents should follow the same pattern: PDF → tiered extraction → provenance JSON → canonical Markdown (initially in `legal_refs/workbench/`), with trust tier only upgraded once all trust conditions are met.

### Trust & Validation Rules

The authoritative definition of trust tiers and conditions lives in `docs/LEGAL_TRUST_POLICY.md`.

In summary:

- Every legal document must have provenance recorded (source PDF name, SHA256, pages, extraction tier, extractor, timestamp).
- Extraction must be complete for all pages with no obvious gaps.
- Structural review must pass (encoding and article boundaries consistent with the PDF).
- An article-level diff must be run between canonical Markdown and the source PDF using the repo’s validation pipeline.
- No unresolved critical issues may remain; any PARTIAL or MISMATCH flags must be understood and documented.

Until these conditions are satisfied, `trust_tier` must remain `"UNTRUSTED"`, `"PENDING_FINAL_APPROVAL"`, or `"REVIEW_REQUIRED"` as per `docs/LEGAL_TRUST_POLICY.md`.

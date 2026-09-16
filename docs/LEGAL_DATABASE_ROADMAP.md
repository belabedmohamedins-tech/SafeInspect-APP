# Legal Database Roadmap

## Phase 1: Single-PDF Validation Pipeline
1. **Select 1 priority PDF** (e.g. `decret 11-125.pdf` or `Decret 17-140.pdf`).
2. **Compute SHA256** of the PDF bytes.
3. **Tier‑1 extraction** (PyMuPDF `get_text()`) → one `.txt` per page + combined `.txt`.
4. **Structural checks:** page count match, article boundary sanity, encoding (é··è··à··ç··œ + Arabic if present).
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
| 3 | `Dé··cret 06-198.pdf` | Etablissements classes |
| 4 | `Loi 18-11.pdf` | Sante publique |
| 5 | `Dé··cret 07-144.pdf` | Nomenclature installations classees |
| 6 | `decret-25-63-plans-intervention-catastrophes.pdf` | Plans intervention catastrophes |
| 7 | `Dé··cret 91-05.pdf` | Hygiene & securite milieu travail |
| 8 | `Loi 03-10.pdf` | Protection environnement |
| 9 | `Dé··cret 04-410.pdf` | Dechets |
| 10 | `loi-90-29-urbanisme.pdf` | Urbanisme |

---

## Notes

- All new files must be **UTF‑8, no BOM**.
- Provenance is mandatory: **SHA256 + filename + pages**.
- Never mark `TRUSTED` until provenance + structure + diff all pass.
- Escalation triggers: empty/near-empty text, scrambled reading order, sparse tables, residual layout issues.

## Reference Implementation: Décret 11-125

As of commit dbc1ac4 on branch legal-database-start:

- legal_refs/decret-11-125-eau-consommation-humaine.md is now the **canonical full-text** legal reference for Décret 11-125.
- Extraction method: Tier‑1 PyMuPDF (pymupdf.open().page.get_text()), 4 pages, SHA256 873B7D10A39A1C9F96EBFA18F3C21B85C0BD9BFC207959E13C75E8E75C635BEA.
- Old _diff.md retained in legal_refs/validation/ as a historical validation artifact, not used as canonical text.
- This document serves as the reference pattern for all subsequent legal texts:
  - Full-text extraction (not summary or diff report).
  - Provenance recorded in legal_refs/workbench/provenance/*.json.
  - Trust tier set to TRUSTED once pipeline completes successfully.

Future documents will follow the same pattern: PDF → Tier‑1 extraction → provenance JSON → canonical MD in legal_refs/.

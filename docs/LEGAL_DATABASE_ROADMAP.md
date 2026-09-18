# Legal Database Roadmap

## ✅ Phase 1: COMPLETED (2026-09-18)

**Status:** Single-PDF validation pipeline complete for 4 core decrets.

| Document | PDF | SHA256 | Pages | Trust Tier | Canonical MD | Provenance JSON |
|----------|-----|--------|-------|------------|--------------|-----------------|
| 1 | decret 11-125.pdf | 873b7d10... | 4 | PENDING_FINAL_APPROVAL | ✅ legal_refs/decret-11-125-eau-consommation-humaine.md | ✅ legal_refs/workbench/provenance/decret-11-125_provenance.json |
| 2 | Décret 06-138.pdf | 95be2185... | 8 | REVIEW_REQUIRED | ✅ legal_refs/decret-06-138-emissions-atmospheriques.md | ✅ legal_refs/workbench/provenance/decret-06-138_provenance.json |
| 3 | decret 06-141.pdf | d855449e... | 12 | PENDING_FINAL_APPROVAL | ✅ legal_refs/decret-06-141-effluents-liquides.md | ✅ legal_refs/workbench/provenance/decret-06-141_provenance.json |
| 4 | Decret 17-140.pdf | 88204913... | 16 | PENDING_FINAL_APPROVAL | ✅ legal_refs/decret-17-140-hygiene-salubrite.md | ✅ legal_refs/workbench/provenance/decret-17-140_provenance.json |

**Deliverables:**
- ✅ PDF SHA256 hashes computed for all 4 documents
- ✅ Provenance JSONs created with full metadata (extraction tier, structural status, trust tier)
- ✅ Canonical Markdown files with clean UTF-8 encoding (except 06-138 needs re-extraction)
- ✅ Articles index created: legal_refs/articles_index.json (35 articles from 4 decrets)
- ✅ Reusable extraction script: legal_refs/validation/build_articles_index.py

**Notes:**
- Décret 06-138 marked REVIEW_REQUIRED due to encoding issues in canonical MD (requires re-extraction)
- All other documents ready for article-level diff validation
- Phase 1 proves the workflow: PDF → SHA256 → extraction → provenance → canonical MD → articles index

---


## 🔄 Phase 2: IN PROGRESS (2026-09-18)

**Status:** Batch processing started for 6 additional documents.

| Document | PDF | SHA256 | Size | Provenance JSON | Status |
|----------|-----|--------|------|-----------------|--------|
| 5 | Decret 06-198.pdf | 6b647f94... | 57 KB | ✅ Created | PENDING_EXTRACTION |
| 6 | Loi 18-11.pdf | 791b0d9f... | 286 KB | ✅ Created | PENDING_EXTRACTION |
| 7 | Décret 07-144.pdf | 3afa3c00... | 291 KB | ✅ Created | PENDING_EXTRACTION |
| 8 | decret-25-63.pdf | c1eb671c... | 242 KB | ✅ Created | PENDING_EXTRACTION |
| 9 | decret-91-05.pdf | 595c8c92... | 5.7 MB | ✅ Created | PENDING_EXTRACTION |
| 10 | Loi-03-10.pdf | 16715466... | 172 KB | ✅ Created | PENDING_EXTRACTION |

**Next steps:**
- Extract text from all 6 PDFs (Tier-1 PyMuPDF)
- Create canonical Markdown files
- Update provenance JSONs with page counts and trust tiers
- Run article-level diff validation

---

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


## Track A: Applied & Pending Citation Fixes (Audit‑00 to Audit‑20)

This track records concrete, criterion‑level fixes identified by manual audit and cross‑file pattern analysis. These are independent of the Phase 3 articles index and verification script; they are mechanical or narrowly interpretive patches that can be applied immediately.

A single source of truth for these fixes is maintained in:
- legal_refs/workbench/legal_citations_ledger.csv — row per criterion fix, with current vs corrected citation, legal ref, domain, confidence, index status, status, and notes.

### A.1 — Applied fixes (committed and pushed)

The following fixes have been applied, committed, and pushed to legal-database-start. All are recorded in the ledger with status = APPLIED.

| Criterion ID | File | Issue type | Change summary | Legal basis |
|--------------|------|------------|----------------|-------------|
| SLH‑05‑01 | src/criteria/slaughterhouseSmallCriteria.ts | Décret 06‑198 mis‑citation | Art.5 → Art.20 for “رخصة الاستغلال للمؤسسات المصنفة”; Art.5 clarified as pre‑auth studies | Décret 06‑198 Art.20 (license), Art.5 (pre‑auth) |
| GPL‑01‑01 | src/criteria/gplCriteria.ts | Décret 06‑198 mis‑citation | Art.5 → Art.20 for operating license; Art.5 clarified as not the license | Décret 06‑198 Art.20, Art.5 |
| PRD‑01‑01 | src/criteria/produceStorageCriteria.ts | Décret 06‑198 mis‑citation | Art.5 → Art.20 for operating license; Art.5 clarified as not the license | Décret 06‑198 Art.20, Art.5 |
| BFD‑04‑01 | src/criteria/baseFoodCriteria.ts | Temperature figure + numericField | Criterion text + legalReference updated 0–5°C → 0–4°C; 
umericField.max 5 → 4 | Arrêté 2025‑05‑07 (cold storage 0–4°C) |
| ABT‑AX5‑01 | src/criteria/abattoirCriteria.ts | Temperature figure + numericField | Criterion text + legalReference updated 0–5°C → 0–4°C; 
umericField.max 5 → 4 | Arrêté 2025‑05‑07 (cold storage 0–4°C) |
| CLD‑17‑04 | src/criteria/coldRoomCriteria.ts | NumericField bug | 
umericField.max 5 → 4; warningMax 7 → 5 to match 0–4°C legal limit | Arrêté 2025‑05‑07 + Arrêté 1999‑11‑21 |

> Note: BFD‑04‑01 and ABT‑AX5‑01 were initially applied as full fixes (text + numeric). A later read‑after‑write verification pass (Claude, 2026‑09‑17) found that in the live repo the numericField was correct but the criterion text still said 0–5°C in some files. The ledger will be updated to reflect “partial” vs “full” status and re‑verification dates; the authoritative state is always the current file contents plus the ledger.

### A.2 — Pending / partial fixes (verified 2026‑09‑17)

The following items have been live‑verified against the current repo state but not yet patched. They should be applied as a dedicated batch before starting the Phase 3 articles index and verification script.

| Criterion ID | File | Issue type | Required change | Legal basis | Priority |
|--------------|------|------------|-----------------|-------------|----------|
| BFD‑04‑01 (text) | src/criteria/baseFoodCriteria.ts | Partial fix: numericField correct, text outdated | Update criterion text + legalReference description from “0–5°C” to “0–4°C” (numericField already max:4) | Arrêté 2025‑05‑07 | High |
| ABT‑AX5‑01 (text) | src/criteria/abattoirCriteria.ts | Partial fix: numericField correct, text outdated | Update criterion text from “0°C إلى 5°C” to “0–4°C” (numericField already max:4) | Arrêté 2025‑05‑07 | High |
| PRD‑02‑01 | src/criteria/produceStorageCriteria.ts | Full temperature fix needed | Update criterion text + legalReference description 0–5°C → 0–4°C; 
umericField.max 5 → 4 | Arrêté 2025‑05‑07 | High |
| PRT‑05‑02 | src/criteria/printingCriteria.ts | Mis‑citation (fire/accident prevention) | Remove “Loi 90‑11 Art.6” (worker dignity, not safety); replace with **Loi 88‑07 Art.5** (fire/explosion prevention) + **Décret 91‑05 Art.57** (extinguishers) | Loi 88‑07 Art.5; Décret 91‑05 Art.57 | Medium |

These four patches are purely mechanical once the correct legal basis is accepted; they do not require new legal research beyond what is already documented in the audit notes and Claude’s verification pass.

### A.3 — UTF‑8 encoding cleanup pass (Track C)

A separate, codebase‑wide issue was identified during verification: many criteria files show mojibake / double‑encoded Arabic text in fields such as xis, category, criteria, and 
umericField labels, while recently edited legalReference fields display clean Arabic. This has been observed in:

- src/criteria/produceStorageCriteria.ts  
- src/criteria/slaughterhouseSmallCriteria.ts  
- src/criteria/gplCriteria.ts  

This is a UTF‑8 encoding bug that corrupts the Arabic text shown to inspectors in the app. It should be fixed in a dedicated pass:

- For each src/criteria/*.ts file:
  - Open in an editor that allows explicit encoding selection.
  - Re‑save as **UTF‑8 without BOM**.
  - Verify that Arabic renders correctly in xis, category, criteria, and numericField labels.
- Commit each file (or small batches) with messages like:
  - Fix UTF-8 encoding in produceStorageCriteria.ts (mojibake in Arabic fields)

This work is tracked as **Track C** and should be kept separate from citation/legal fixes to avoid mixing concerns.

### A.4 — Open legal research / product decisions (not patches)

The following items are not simple patches; they require legal sourcing or product/design decisions. They will be documented in a separate file (e.g. legal_refs/workbench/open_legal_issues.md) and referenced here.

1. **Missing sources**
   - **Loi 88‑08** (veterinary medicine) — cited by ABT‑AX2‑01 / ABT‑AX2‑02 in battoirCriteria.ts; not yet present in legal_refs/. These criteria should remain [À VÉRIFIER] until the law is sourced and converted.
   - **Décret 93‑162** — referenced in audit notes; not yet in legal_refs/.

2. **Coverage gaps / product decisions**
   - **Abattoir EIE criterion**: battoirCriteria.ts currently has no EIE (étude d’impact environnemental) criterion, while other classified‑installation criteria (e.g. aseGeneralCriteria.ts, slaughterhouseSmallCriteria.ts, gplCriteria.ts) do. Abattoirs are classified installations (rubric 2210) that plausibly require one. This is a product decision for the owner, not something to add unilaterally.

These items should not be mixed with mechanical citation patches; they belong in a research/design backlog.

### A.5 — Relationship to Phase 3 (articles index + verification)

Track A is intentionally decoupled from the Phase 3 articles index and automated verification script:

- Track A fixes are derived from **manual audit and cross‑file pattern analysis**, verified by direct file reads.
- Phase 3 will provide a **systematic, automated verification pass** over all 287 criteria once the articles index exists.
- The ledger (legal_citations_ledger.csv) will serve as the ground truth for which fixes have been applied, which are partial, and which are pending, independent of any automated report.

When Phase 3 is implemented, its first run should:
- Confirm that all Track A “Applied” fixes are reflected in the verification report.
- Flag any additional mis‑citations or gaps not yet identified by manual audit.

Until then, Track A remains the primary mechanism for incrementally improving legal accuracy in the criteria files.



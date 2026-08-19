# SafeInspect PDF → Markdown Conversion Audit

**Audit date:** 2026-08-19

**Authority:** PDFs in `legal_refs/pdf/` are authoritative. Markdown was not treated as authoritative.

**Method:** PDF text was extracted page-wise from the repository copies; Markdown was compared for identity, article sequences, normalized content, and legal-critical token presence. Documents with unavailable or unusable PDF text were not certified. No uncertain content was silently corrected.

## Summary

| Document | Pages | Conversion quality | Critical errors | Minor errors | Status |
| --- | --- | --- | --- | --- | --- |
| `arrete-interministeriel-1999-11-21-conservation-aliments.md` | 3 | PDF TEXT EXTRACTION UNRELIABLE | 1 | 0 | **UNSAFE FOR LEGAL USE** |
| `arrete-interministeriel-2011-02-06-permis-construire-energie.md` | 5 | HIGH MATCH; MANUAL LEGAL SPOT-CHECK ADVISED | 0 | 26 | **VERIFIED WITH MINOR ISSUES** |
| `arrete-interministeriel-2016-10-04-criteres-microbiologiques.md` | 22 | SUBSTANTIAL MISMATCH OR INCOMPLETE CONVERSION | 1 | 0 | **UNSAFE FOR LEGAL USE** |
| `arrete-interministeriel-2025-05-07-hygiene-restauration.md` | 5 | SUBSTANTIAL MISMATCH OR INCOMPLETE CONVERSION | 1 | 0 | **UNSAFE FOR LEGAL USE** |
| `decret-01-102-creation-ona.md` | 6 | HIGH MATCH; MANUAL LEGAL SPOT-CHECK ADVISED | 0 | 37 | **VERIFIED WITH MINOR ISSUES** |
| `decret-02-427-prevention-risques-professionnels.md` | 24 | SUBSTANTIAL MISMATCH OR INCOMPLETE CONVERSION | 7 | 0 | **UNSAFE FOR LEGAL USE** |
| `decret-04-410-regles-installations-traitement-dechets.md` | 5 | SUBSTANTIAL MISMATCH OR INCOMPLETE CONVERSION | 6 | 0 | **UNSAFE FOR LEGAL USE** |
| `decret-04-82-agrement-sanitaire-elevage.md` | 30 | SUBSTANTIAL MISMATCH OR INCOMPLETE CONVERSION | 4 | 0 | **UNSAFE FOR LEGAL USE** |
| `decret-05-315-declaration-dechets-speciaux-dangereux.md` | 4 | SUBSTANTIAL MISMATCH OR INCOMPLETE CONVERSION | 1 | 0 | **UNSAFE FOR LEGAL USE** |
| `decret-06-138-emissions-atmospheriques.md` | 13 | PARTIAL MATCH WITH MATERIAL DIFFERENCES | 1 | 0 | **REQUIRES CORRECTION** |
| `decret-06-141-rejets-effluents-liquides.md` | 27 | SUBSTANTIAL MISMATCH OR INCOMPLETE CONVERSION | 44 | 0 | **UNSAFE FOR LEGAL USE** |
| `decret-06-198-etablissements-classes.md` | 7 | PARTIAL MATCH WITH MATERIAL DIFFERENCES | 1 | 0 | **REQUIRES CORRECTION** |
| `decret-07-144-nomenclature-installations-classees.md` | 102 | SUBSTANTIAL MISMATCH OR INCOMPLETE CONVERSION | 1 | 0 | **UNSAFE FOR LEGAL USE** |
| `decret-07-205-schema-communal-dechets.md` | 3 | SUBSTANTIAL MISMATCH OR INCOMPLETE CONVERSION | 3 | 0 | **UNSAFE FOR LEGAL USE** |
| `decret-09-19.md` | 4 | HIGH MATCH; MANUAL LEGAL SPOT-CHECK ADVISED | 0 | 11 | **VERIFIED WITH MINOR ISSUES** |
| `decret-09-335-plans-internes-intervention.md` | 5 | SUBSTANTIAL MISMATCH OR INCOMPLETE CONVERSION | 2 | 0 | **UNSAFE FOR LEGAL USE** |
| `decret-11-125-eau-consommation-humaine.md` | 4 | PARTIAL MATCH WITH MATERIAL DIFFERENCES | 1 | 0 | **REQUIRES CORRECTION** |
| `decret-17-140-hygiene-alimentaire.md` | 31 | SUBSTANTIAL MISMATCH OR INCOMPLETE CONVERSION | 64 | 0 | **UNSAFE FOR LEGAL USE** |
| `decret-21-261-esp-equipements-hydrocarbures.md` | 14 | HIGH MATCH; MANUAL LEGAL SPOT-CHECK ADVISED | 0 | 47 | **VERIFIED WITH MINOR ISSUES** |
| `decret-21-319-autorisation-exploitation-hydrocarbures.md` | 14 | HIGH MATCH; MANUAL LEGAL SPOT-CHECK ADVISED | 0 | 60 | **VERIFIED WITH MINOR ISSUES** |
| `decret-21-430-gpl-carburant.md` | 28 | SUBSTANTIAL MISMATCH OR INCOMPLETE CONVERSION | 30 | 0 | **UNSAFE FOR LEGAL USE** |
| `decret-22-167-etablissements-classes-modification.md` | 23 | SUBSTANTIAL MISMATCH OR INCOMPLETE CONVERSION | 4 | 0 | **UNSAFE FOR LEGAL USE** |
| `decret-24-196-etablissements-classes-modification.md` | 2 | SUBSTANTIAL MISMATCH OR INCOMPLETE CONVERSION | 2 | 0 | **UNSAFE FOR LEGAL USE** |
| `decret-25-63-plans-intervention-catastrophes.md` | — | NO AUTHORITATIVE PDF PRESENT IN REPOSITORY | 0 | 0 | **UNSAFE FOR LEGAL USE** |
| `decret-76-35-igh-incendie.md` | 3 | PDF TEXT EXTRACTION UNRELIABLE | 1 | 0 | **UNSAFE FOR LEGAL USE** |
| `decret-76-36-incendie-panique.md` | 8 | PDF TEXT EXTRACTION UNRELIABLE | 1 | 0 | **UNSAFE FOR LEGAL USE** |
| `decret-83-496-gpl-carburant.md` | 48 | PDF TEXT EXTRACTION UNRELIABLE | 1 | 0 | **UNSAFE FOR LEGAL USE** |
| `decret-90-245-appareils-pression-gaz.md` | — | NO AUTHORITATIVE PDF PRESENT IN REPOSITORY | 0 | 0 | **UNSAFE FOR LEGAL USE** |
| `decret-91-05-hygiene-securite-milieu-travail.md` | — | NO AUTHORITATIVE PDF PRESENT IN REPOSITORY | 0 | 0 | **UNSAFE FOR LEGAL USE** |
| `decret-93-120-medecine-du-travail.md` | — | NO AUTHORITATIVE PDF PRESENT IN REPOSITORY | 0 | 0 | **UNSAFE FOR LEGAL USE** |
| `loi-01-19-gestion-dechets.md` | — | NO AUTHORITATIVE PDF PRESENT IN REPOSITORY | 0 | 0 | **UNSAFE FOR LEGAL USE** |
| `loi-03-10-protection-environnement.md` | — | NO AUTHORITATIVE PDF PRESENT IN REPOSITORY | 0 | 0 | **UNSAFE FOR LEGAL USE** |
| `loi-04-08-activites-commerciales.md` | — | NO AUTHORITATIVE PDF PRESENT IN REPOSITORY | 0 | 0 | **UNSAFE FOR LEGAL USE** |
| `loi-04-20-risques-majeurs.md` | — | NO AUTHORITATIVE PDF PRESENT IN REPOSITORY | 0 | 0 | **UNSAFE FOR LEGAL USE** |
| `loi-05-12-ressources-en-eau.md` | — | NO AUTHORITATIVE PDF PRESENT IN REPOSITORY | 0 | 0 | **UNSAFE FOR LEGAL USE** |
| `loi-09-03-protection-consommateur.md` | — | NO AUTHORITATIVE PDF PRESENT IN REPOSITORY | 0 | 0 | **UNSAFE FOR LEGAL USE** |
| `loi-18-09-protection-consommateur.md` | — | NO AUTHORITATIVE PDF PRESENT IN REPOSITORY | 0 | 0 | **UNSAFE FOR LEGAL USE** |
| `loi-18-11-sante-partie1-arts1-164.md` | — | NO AUTHORITATIVE PDF PRESENT IN REPOSITORY | 0 | 0 | **UNSAFE FOR LEGAL USE** |
| `loi-18-11-sante-partie2-arts165-264.md` | — | NO AUTHORITATIVE PDF PRESENT IN REPOSITORY | 0 | 0 | **UNSAFE FOR LEGAL USE** |
| `loi-18-11-sante-partie3-arts265-450.md` | — | NO AUTHORITATIVE PDF PRESENT IN REPOSITORY | 0 | 0 | **UNSAFE FOR LEGAL USE** |
| `loi-19-02-incendie-panique.md` | — | NO AUTHORITATIVE PDF PRESENT IN REPOSITORY | 0 | 0 | **UNSAFE FOR LEGAL USE** |
| `loi-88-07-hygiene-securite-medecine-travail.md` | — | NO AUTHORITATIVE PDF PRESENT IN REPOSITORY | 0 | 0 | **UNSAFE FOR LEGAL USE** |
| `loi-90-11-relations-travail.md` | — | NO AUTHORITATIVE PDF PRESENT IN REPOSITORY | 0 | 0 | **UNSAFE FOR LEGAL USE** |
| `loi-90-29-urbanisme.md` | — | NO AUTHORITATIVE PDF PRESENT IN REPOSITORY | 0 | 0 | **UNSAFE FOR LEGAL USE** |
| `projet-arrete-gpl-installations-securite.md` | — | NO AUTHORITATIVE PDF PRESENT IN REPOSITORY | 0 | 0 | **UNSAFE FOR LEGAL USE** |

## Error register

### `arrete-interministeriel-1999-11-21-conservation-aliments.md`

**Source PDF:** `Arrêté interministériel du 21 novembre 1999.pdf`

**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** PDF text layer / all pages
- **Markdown location:** Entire document
- **Original PDF content:** PDF text extraction yielded no usable text; visual/OCR review required.
- **Markdown content:** Markdown contains substantive text.
- **Problem:** The authoritative PDF cannot be reliably compared by text extraction.
- **Correction required:** Human visual/OCR comparison before any correction.
- **Severity:** **HIGH**

#### Errors 2–10 — HIGH (Article sequence)

Articles 2 through 10 appear in the Markdown but were not detected in the extracted PDF article sequence. Each represents a potential inserted, misnumbered, or false article heading. Human verification against the PDF page image is required for each.

---

### `arrete-interministeriel-2011-02-06-permis-construire-energie.md`

**Source PDF:** `arrete-interministeriel-2011-02-06-permis-construire-energie.pdf`

**Status:** **VERIFIED WITH MINOR ISSUES**

#### Error 1 — MINOR

- **PDF location/page:** Multiple pages
- **Markdown location:** Multiple locations
- **Original PDF content:** PDF and Markdown content are highly similar after normalization.
- **Markdown content:** Markdown preserves the apparent legal text but differs in layout/normalization.
- **Problem:** Non-semantic conversion differences or numeric-token formatting require spot checking.
- **Correction required:** No automatic correction; verify legal-critical numbers, units, tables, and footnotes manually.
- **Severity:** **MINOR**

---

### `arrete-interministeriel-2016-10-04-criteres-microbiologiques.md`

**Source PDF:** `arrete-interministeriel-2016-10-04-criteres-microbiologiques.pdf`

**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** Content / multiple pages
- **Markdown location:** Entire document
- **Original PDF content:** Substantial content present in PDF not reproduced in Markdown, or vice versa.
- **Markdown content:** Markdown diverges materially from PDF after normalization.
- **Problem:** Substantial mismatch or incomplete conversion.
- **Correction required:** Full re-conversion from PDF required.
- **Severity:** **HIGH**

---

### `arrete-interministeriel-2025-05-07-hygiene-restauration.md`

**Source PDF:** `arrete-interministeriel-2025-05-07-hygiene-restauration.pdf`

**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** Content / multiple pages
- **Markdown location:** Entire document
- **Problem:** Substantial mismatch or incomplete conversion.
- **Correction required:** Full re-conversion from PDF required.
- **Severity:** **HIGH**

---

### `decret-01-102-creation-ona.md`

**Source PDF:** `decret 01-102.pdf`

**Status:** **VERIFIED WITH MINOR ISSUES**

#### Error 1 — MINOR

- **PDF location/page:** Multiple pages
- **Markdown location:** Multiple locations
- **Original PDF content:** PDF and Markdown content are highly similar after normalization.
- **Markdown content:** Markdown preserves the apparent legal text but differs in layout/normalization.
- **Problem:** Non-semantic conversion differences or numeric-token formatting require spot checking.
- **Correction required:** No automatic correction; verify legal-critical numbers, units, tables, and footnotes manually.
- **Severity:** **MINOR**

---

### `decret-02-427-prevention-risques-professionnels.md`

**Source PDF:** `Décret 02-427.pdf`

**Status:** **UNSAFE FOR LEGAL USE**

#### Errors 1–7 — HIGH (Missing articles)

The following articles appear in the extracted PDF article sequence but are absent from the Markdown article sequence. Each represents a potential missing or malformed article heading/content. Locate and restore the exact PDF text; do not infer content.

- Article 25
- Article 26
- Article 27
- Article 28
- Article 29
- Article 30
- Article 77

---

### `decret-04-410-regles-installations-traitement-dechets.md`

**Source PDF:** `Décret 04-410.pdf`

**Status:** **UNSAFE FOR LEGAL USE**

#### Errors 1–6 — HIGH (Missing articles)

- Article 1
- Article 17
- Article 18
- Article 19
- Article 20
- Article 44

---

### `decret-04-82-agrement-sanitaire-elevage.md`

**Source PDF:** `Décret 04-82.pdf`

**Status:** **UNSAFE FOR LEGAL USE**

#### Errors 1–4 — HIGH (Missing articles)

- Article 23
- Article 31
- Article 225
- Article 234

---

### `decret-05-315-declaration-dechets-speciaux-dangereux.md`

**Source PDF:** `Decret 05-315.pdf`

**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** Article 1 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 1 appears in the extracted PDF article sequence.
- **Markdown content:** Article 1 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

---

### `decret-06-138-emissions-atmospheriques.md`

**Source PDF:** `Décret 06-138.pdf`

**Status:** **REQUIRES CORRECTION**

#### Error 1 — HIGH

- **PDF location/page:** Article 1 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 1 appears in the extracted PDF article sequence.
- **Markdown content:** Article 1 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

---

### `decret-06-141-rejets-effluents-liquides.md`

**Source PDF:** `decret 06-141.pdf`

**Status:** **UNSAFE FOR LEGAL USE**

#### Errors 1–44 — HIGH (Missing articles)

Articles 15 through 39, and numerous additional articles, appear in the extracted PDF article sequence but are absent from the Markdown article sequence. This represents a near-total conversion failure for this document. Full re-conversion from PDF is required.

---

### `decret-06-198-etablissements-classes.md`

**Source PDF:** `Decret 06-198.pdf`

**Status:** **REQUIRES CORRECTION**

#### Error 1 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 1
- **Original PDF content:** Article 1 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 1 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

---

### `decret-07-144-nomenclature-installations-classees.md`

**Source PDF:** `decret-07-144.pdf`

**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** Content / multiple pages (102-page source)
- **Markdown location:** Entire document
- **Problem:** Substantial mismatch or incomplete conversion of a 102-page document.
- **Correction required:** Full re-conversion from PDF required.
- **Severity:** **HIGH**

---

### `decret-07-205-schema-communal-dechets.md`

**Source PDF:** `Decret 07-205.pdf`

**Status:** **UNSAFE FOR LEGAL USE**

#### Errors 1–3 — HIGH

- **Error 1:** Article 1 appears in PDF but is absent from Markdown.
- **Error 2:** Article 31 appears in PDF but is absent from Markdown.
- **Error 3:** Article 34 appears in Markdown but was not detected in the extracted PDF article sequence (potential false insertion).

---

### `decret-09-19.md`

**Source PDF:** `decret 09-19.pdf`

**Status:** **VERIFIED WITH MINOR ISSUES**

#### Error 1 — MINOR

- **PDF location/page:** Multiple pages
- **Markdown location:** Multiple locations
- **Original PDF content:** PDF and Markdown content are highly similar after normalization.
- **Markdown content:** Markdown preserves the apparent legal text but differs in layout/normalization.
- **Problem:** Non-semantic conversion differences or numeric-token formatting require spot checking.
- **Correction required:** No automatic correction; verify legal-critical numbers, units, tables, and footnotes manually.
- **Severity:** **MINOR**

---

### `decret-09-335-plans-internes-intervention.md`

**Source PDF:** `Décret 09-335.pdf`

**Status:** **UNSAFE FOR LEGAL USE**

#### Errors 1–2 — HIGH

- **Error 1:** Article 62 appears in the extracted PDF article sequence but is absent from the Markdown.
- **Error 2:** Articles 18–25 appear in the Markdown but were not detected in the extracted PDF article sequence (potential false insertions).

---

### `decret-11-125-eau-consommation-humaine.md`

**Source PDF:** `decret-11-125.pdf`

**Status:** **REQUIRES CORRECTION**

#### Error 1 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article-number sequence
- **Problem:** Partial match with material differences detected between PDF and Markdown.
- **Correction required:** Human review and targeted correction required.
- **Severity:** **HIGH**

---

### `decret-17-140-hygiene-alimentaire.md`

**Source PDF:** `decret-17-140.pdf`

**Status:** **UNSAFE FOR LEGAL USE**

#### Errors 1–64 — HIGH (Missing articles)

This document shows 64 critical errors — the highest count in the corpus. A large number of articles present in the PDF are absent from the Markdown, indicating near-total conversion failure. Full re-conversion from PDF is required.

---

### `decret-21-261-esp-equipements-hydrocarbures.md`

**Source PDF:** `dec 21-261.pdf`

**Status:** **VERIFIED WITH MINOR ISSUES**

#### Error 1 — MINOR

- **PDF location/page:** Multiple pages
- **Markdown location:** Multiple locations
- **Original PDF content:** PDF and Markdown content are highly similar after normalization.
- **Markdown content:** Markdown preserves the apparent legal text but differs in layout/normalization.
- **Problem:** Non-semantic conversion differences or numeric-token formatting require spot checking (47 minor discrepancies).
- **Correction required:** No automatic correction; verify legal-critical numbers, units, tables, and footnotes manually.
- **Severity:** **MINOR**

---

### `decret-21-319-autorisation-exploitation-hydrocarbures.md`

**Source PDF:** `decret 21-319.pdf`

**Status:** **VERIFIED WITH MINOR ISSUES**

#### Error 1 — MINOR

- **PDF location/page:** Multiple pages
- **Markdown location:** Multiple locations
- **Original PDF content:** PDF and Markdown content are highly similar after normalization.
- **Markdown content:** Markdown preserves the apparent legal text but differs in layout/normalization.
- **Problem:** Non-semantic conversion differences or numeric-token formatting require spot checking (60 minor discrepancies).
- **Correction required:** No automatic correction; verify legal-critical numbers, units, tables, and footnotes manually.
- **Severity:** **MINOR**

---

### `decret-21-430-gpl-carburant.md`

**Source PDF:** `decret-21-430.pdf`

**Status:** **UNSAFE FOR LEGAL USE**

#### Errors 1–30 — HIGH (Missing articles)

30 critical errors detected. A large number of articles present in the PDF are absent from the Markdown. Full re-conversion from PDF is required.

---

### `decret-22-167-etablissements-classes-modification.md`

**Source PDF:** `decret-22-167.pdf`

**Status:** **UNSAFE FOR LEGAL USE**

#### Errors 1–4 — HIGH (Missing articles)

4 critical errors detected. Articles present in the PDF are absent from the Markdown.

---

### `decret-24-196-etablissements-classes-modification.md`

**Source PDF:** `decret-24-196.pdf`

**Status:** **UNSAFE FOR LEGAL USE**

#### Errors 1–2 — HIGH (Missing articles)

2 critical errors detected in this 2-page document.

---

### `decret-25-63-plans-intervention-catastrophes.md`

**Source PDF:** `—`

**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** —
- **Markdown location:** Entire document
- **Original PDF content:** No corresponding PDF is present in `legal_refs/pdf`.
- **Markdown content:** Markdown exists but cannot be validated.
- **Problem:** Authoritative source unavailable.
- **Correction required:** Provide the original PDF and repeat the audit.
- **Severity:** **HIGH**

---

### `decret-76-35-igh-incendie.md`

**Source PDF:** `decret-76-35.pdf`

**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** PDF text layer / all pages
- **Markdown location:** Entire document
- **Original PDF content:** PDF text extraction yielded no usable text; visual/OCR review required.
- **Problem:** The authoritative PDF cannot be reliably compared by text extraction.
- **Correction required:** Human visual/OCR comparison before any correction.
- **Severity:** **HIGH**

---

### `decret-76-36-incendie-panique.md`

**Source PDF:** `decret-76-36.pdf`

**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** PDF text layer / all pages
- **Markdown location:** Entire document
- **Original PDF content:** PDF text extraction yielded no usable text; visual/OCR review required.
- **Problem:** The authoritative PDF cannot be reliably compared by text extraction.
- **Correction required:** Human visual/OCR comparison before any correction.
- **Severity:** **HIGH**

---

### `decret-83-496-gpl-carburant.md`

**Source PDF:** `decret-83-496.pdf`

**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** PDF text layer / all pages (48-page document)
- **Markdown location:** Entire document
- **Original PDF content:** PDF text extraction yielded no usable text; visual/OCR review required.
- **Problem:** The authoritative PDF cannot be reliably compared by text extraction.
- **Correction required:** Human visual/OCR comparison before any correction.
- **Severity:** **HIGH**

---

### Documents with no authoritative PDF present

The following documents have no corresponding PDF in `legal_refs/pdf/`. All are rated **UNSAFE FOR LEGAL USE**. The Markdown content cannot be validated. Provide the original PDF and repeat the audit for each.

- `decret-90-245-appareils-pression-gaz.md`
- `decret-91-05-hygiene-securite-milieu-travail.md`
- `decret-93-120-medecine-du-travail.md`
- `loi-01-19-gestion-dechets.md`
- `loi-03-10-protection-environnement.md`
- `loi-04-08-activites-commerciales.md`
- `loi-04-20-risques-majeurs.md`
- `loi-05-12-ressources-en-eau.md`
- `loi-09-03-protection-consommateur.md`
- `loi-18-09-protection-consommateur.md`
- `loi-18-11-sante-partie1-arts1-164.md`
- `loi-18-11-sante-partie2-arts165-264.md`
- `loi-18-11-sante-partie3-arts265-450.md`
- `loi-19-02-incendie-panique.md`
- `loi-88-07-hygiene-securite-medecine-travail.md`
- `loi-90-11-relations-travail.md`
- `loi-90-29-urbanisme.md`
- `projet-arrete-gpl-installations-securite.md`

---

## Corrections and second comparison

No automatic Markdown corrections were applied. The automated evidence identified material mismatches, missing source PDFs, or unusable PDF text layers, but did not unambiguously establish replacement text for those cases. A second comparison was performed against the unchanged Markdown files; statuses above therefore remain conservative and unchanged.

## Interpretation

Only documents marked **VERIFIED WITH MINOR ISSUES** are candidates for AI/legal research after human spot-checking. Documents marked **REQUIRES CORRECTION** or **UNSAFE FOR LEGAL USE** must not be used as a legal source or relied upon for legal-critical answers.

## References

[1]: ../pdf/ "Authoritative PDF corpus in this repository"

[2]: ../md/ "Markdown conversion corpus in this repository"

# SafeInspect PDF → Markdown Conversion Audit

**Audit date:** 2026-08-19  
**Authority:** PDFs in `legal_refs/pdf/` are authoritative. Markdown was not treated as authoritative.  
**Method:** PDF text was extracted page-wise from the repository copies; Markdown was compared for identity, article sequences, normalized content, and legal-critical token presence. Documents with unavailable or unusable PDF text were not certified. No uncertain content was silently corrected.

## Summary

| Document | Pages | Conversion quality | Critical errors | Minor errors | Status |
|---|---:|---|---:|---:|---|
| `arrete-interministeriel-1999-11-21-conservation-aliments.md` | 3 | SUBSTANTIAL MISMATCH OR INCOMPLETE CONVERSION | 9 | 0 | **UNSAFE FOR LEGAL USE** |
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
| `decret-76-35-igh-incendie.md` | 3 | SUBSTANTIAL MISMATCH OR INCOMPLETE CONVERSION | 7 | 0 | **UNSAFE FOR LEGAL USE** |
| `decret-76-36-incendie-panique.md` | 8 | SUBSTANTIAL MISMATCH OR INCOMPLETE CONVERSION | 14 | 0 | **UNSAFE FOR LEGAL USE** |
| `decret-83-496-gpl-carburant.md` | 48 | SUBSTANTIAL MISMATCH OR INCOMPLETE CONVERSION | 21 | 0 | **UNSAFE FOR LEGAL USE** |
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

- **PDF location/page:** Article 2 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 2 appears in the extracted PDF article sequence.
- **Markdown content:** Article 2 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 2 — HIGH

- **PDF location/page:** Article 3 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 3 appears in the extracted PDF article sequence.
- **Markdown content:** Article 3 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 3 — HIGH

- **PDF location/page:** Article 4 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 4 appears in the extracted PDF article sequence.
- **Markdown content:** Article 4 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 4 — HIGH

- **PDF location/page:** Article 5 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 5 appears in the extracted PDF article sequence.
- **Markdown content:** Article 5 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 5 — HIGH

- **PDF location/page:** Article 6 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 6 appears in the extracted PDF article sequence.
- **Markdown content:** Article 6 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 6 — HIGH

- **PDF location/page:** Article 7 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 7 appears in the extracted PDF article sequence.
- **Markdown content:** Article 7 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 7 — HIGH

- **PDF location/page:** Article 8 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 8 appears in the extracted PDF article sequence.
- **Markdown content:** Article 8 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 8 — HIGH

- **PDF location/page:** Article 9 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 9 appears in the extracted PDF article sequence.
- **Markdown content:** Article 9 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 9 — HIGH

- **PDF location/page:** Article 10 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 10 appears in the extracted PDF article sequence.
- **Markdown content:** Article 10 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

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

### `decret-02-427-prevention-risques-professionnels.md`

**Source PDF:** `Décret 02-427.pdf`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** Article 25 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 25 appears in the extracted PDF article sequence.
- **Markdown content:** Article 25 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 2 — HIGH

- **PDF location/page:** Article 26 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 26 appears in the extracted PDF article sequence.
- **Markdown content:** Article 26 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 3 — HIGH

- **PDF location/page:** Article 27 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 27 appears in the extracted PDF article sequence.
- **Markdown content:** Article 27 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 4 — HIGH

- **PDF location/page:** Article 28 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 28 appears in the extracted PDF article sequence.
- **Markdown content:** Article 28 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 5 — HIGH

- **PDF location/page:** Article 29 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 29 appears in the extracted PDF article sequence.
- **Markdown content:** Article 29 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 6 — HIGH

- **PDF location/page:** Article 30 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 30 appears in the extracted PDF article sequence.
- **Markdown content:** Article 30 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 7 — HIGH

- **PDF location/page:** Article 77 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 77 appears in the extracted PDF article sequence.
- **Markdown content:** Article 77 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

### `decret-04-410-regles-installations-traitement-dechets.md`

**Source PDF:** `Décret 04-410.pdf`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** Article 1 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 1 appears in the extracted PDF article sequence.
- **Markdown content:** Article 1 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 2 — HIGH

- **PDF location/page:** Article 17 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 17 appears in the extracted PDF article sequence.
- **Markdown content:** Article 17 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 3 — HIGH

- **PDF location/page:** Article 18 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 18 appears in the extracted PDF article sequence.
- **Markdown content:** Article 18 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 4 — HIGH

- **PDF location/page:** Article 19 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 19 appears in the extracted PDF article sequence.
- **Markdown content:** Article 19 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 5 — HIGH

- **PDF location/page:** Article 20 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 20 appears in the extracted PDF article sequence.
- **Markdown content:** Article 20 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 6 — HIGH

- **PDF location/page:** Article 44 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 44 appears in the extracted PDF article sequence.
- **Markdown content:** Article 44 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

### `decret-04-82-agrement-sanitaire-elevage.md`

**Source PDF:** `Décret 04-82.pdf`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** Article 23 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 23 appears in the extracted PDF article sequence.
- **Markdown content:** Article 23 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 2 — HIGH

- **PDF location/page:** Article 31 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 31 appears in the extracted PDF article sequence.
- **Markdown content:** Article 31 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 3 — HIGH

- **PDF location/page:** Article 225 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 225 appears in the extracted PDF article sequence.
- **Markdown content:** Article 225 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 4 — HIGH

- **PDF location/page:** Article 234 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 234 appears in the extracted PDF article sequence.
- **Markdown content:** Article 234 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

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

### `decret-06-141-rejets-effluents-liquides.md`

**Source PDF:** `decret 06-141.pdf`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** Article 15 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 15 appears in the extracted PDF article sequence.
- **Markdown content:** Article 15 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 2 — HIGH

- **PDF location/page:** Article 16 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 16 appears in the extracted PDF article sequence.
- **Markdown content:** Article 16 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 3 — HIGH

- **PDF location/page:** Article 17 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 17 appears in the extracted PDF article sequence.
- **Markdown content:** Article 17 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 4 — HIGH

- **PDF location/page:** Article 18 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 18 appears in the extracted PDF article sequence.
- **Markdown content:** Article 18 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 5 — HIGH

- **PDF location/page:** Article 19 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 19 appears in the extracted PDF article sequence.
- **Markdown content:** Article 19 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 6 — HIGH

- **PDF location/page:** Article 20 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 20 appears in the extracted PDF article sequence.
- **Markdown content:** Article 20 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 7 — HIGH

- **PDF location/page:** Article 21 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 21 appears in the extracted PDF article sequence.
- **Markdown content:** Article 21 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 8 — HIGH

- **PDF location/page:** Article 22 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 22 appears in the extracted PDF article sequence.
- **Markdown content:** Article 22 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 9 — HIGH

- **PDF location/page:** Article 23 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 23 appears in the extracted PDF article sequence.
- **Markdown content:** Article 23 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 10 — HIGH

- **PDF location/page:** Article 24 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 24 appears in the extracted PDF article sequence.
- **Markdown content:** Article 24 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 11 — HIGH

- **PDF location/page:** Article 25 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 25 appears in the extracted PDF article sequence.
- **Markdown content:** Article 25 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 12 — HIGH

- **PDF location/page:** Article 26 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 26 appears in the extracted PDF article sequence.
- **Markdown content:** Article 26 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 13 — HIGH

- **PDF location/page:** Article 27 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 27 appears in the extracted PDF article sequence.
- **Markdown content:** Article 27 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 14 — HIGH

- **PDF location/page:** Article 28 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 28 appears in the extracted PDF article sequence.
- **Markdown content:** Article 28 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 15 — HIGH

- **PDF location/page:** Article 29 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 29 appears in the extracted PDF article sequence.
- **Markdown content:** Article 29 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 16 — HIGH

- **PDF location/page:** Article 30 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 30 appears in the extracted PDF article sequence.
- **Markdown content:** Article 30 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 17 — HIGH

- **PDF location/page:** Article 31 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 31 appears in the extracted PDF article sequence.
- **Markdown content:** Article 31 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 18 — HIGH

- **PDF location/page:** Article 32 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 32 appears in the extracted PDF article sequence.
- **Markdown content:** Article 32 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 19 — HIGH

- **PDF location/page:** Article 33 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 33 appears in the extracted PDF article sequence.
- **Markdown content:** Article 33 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 20 — HIGH

- **PDF location/page:** Article 34 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 34 appears in the extracted PDF article sequence.
- **Markdown content:** Article 34 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 21 — HIGH

- **PDF location/page:** Article 35 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 35 appears in the extracted PDF article sequence.
- **Markdown content:** Article 35 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 22 — HIGH

- **PDF location/page:** Article 36 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 36 appears in the extracted PDF article sequence.
- **Markdown content:** Article 36 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 23 — HIGH

- **PDF location/page:** Article 37 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 37 appears in the extracted PDF article sequence.
- **Markdown content:** Article 37 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 24 — HIGH

- **PDF location/page:** Article 38 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 38 appears in the extracted PDF article sequence.
- **Markdown content:** Article 38 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 25 — HIGH

- **PDF location/page:** Article 39 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 39 appears in the extracted PDF article sequence.
- **Markdown content:** Article 39 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

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

### `decret-07-205-schema-communal-dechets.md`

**Source PDF:** `Decret 07-205.pdf`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** Article 1 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 1 appears in the extracted PDF article sequence.
- **Markdown content:** Article 1 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 2 — HIGH

- **PDF location/page:** Article 31 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 31 appears in the extracted PDF article sequence.
- **Markdown content:** Article 31 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 3 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 34
- **Original PDF content:** Article 34 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 34 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

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

### `decret-09-335-plans-internes-intervention.md`

**Source PDF:** `Décret 09-335.pdf`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** Article 62 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 62 appears in the extracted PDF article sequence.
- **Markdown content:** Article 62 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 2 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 54
- **Original PDF content:** Article 54 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 54 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

### `decret-17-140-hygiene-alimentaire.md`

**Source PDF:** `Decret 17-140.pdf`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 1
- **Original PDF content:** Article 1 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 1 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 2 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 2
- **Original PDF content:** Article 2 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 2 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 3 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 3
- **Original PDF content:** Article 3 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 3 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 4 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 4
- **Original PDF content:** Article 4 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 4 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 5 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 5
- **Original PDF content:** Article 5 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 5 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 6 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 6
- **Original PDF content:** Article 6 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 6 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 7 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 7
- **Original PDF content:** Article 7 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 7 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 8 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 8
- **Original PDF content:** Article 8 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 8 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 9 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 9
- **Original PDF content:** Article 9 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 9 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 10 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 10
- **Original PDF content:** Article 10 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 10 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 11 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 11
- **Original PDF content:** Article 11 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 11 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 12 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 12
- **Original PDF content:** Article 12 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 12 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 13 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 13
- **Original PDF content:** Article 13 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 13 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 14 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 14
- **Original PDF content:** Article 14 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 14 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 15 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 15
- **Original PDF content:** Article 15 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 15 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 16 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 16
- **Original PDF content:** Article 16 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 16 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 17 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 17
- **Original PDF content:** Article 17 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 17 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 18 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 18
- **Original PDF content:** Article 18 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 18 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 19 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 19
- **Original PDF content:** Article 19 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 19 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 20 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 20
- **Original PDF content:** Article 20 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 20 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 21 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 21
- **Original PDF content:** Article 21 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 21 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 22 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 22
- **Original PDF content:** Article 22 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 22 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 23 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 23
- **Original PDF content:** Article 23 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 23 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 24 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 24
- **Original PDF content:** Article 24 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 24 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 25 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 25
- **Original PDF content:** Article 25 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 25 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

### `decret-21-261-esp-equipements-hydrocarbures.md`

**Source PDF:** `dec 21-261.pdf`  
**Status:** **VERIFIED WITH MINOR ISSUES**

#### Error 1 — MINOR

- **PDF location/page:** Multiple pages
- **Markdown location:** Multiple locations
- **Original PDF content:** PDF and Markdown content are highly similar after normalization.
- **Markdown content:** Markdown preserves the apparent legal text but differs in layout/normalization.
- **Problem:** Non-semantic conversion differences or numeric-token formatting require spot checking.
- **Correction required:** No automatic correction; verify legal-critical numbers, units, tables, and footnotes manually.
- **Severity:** **MINOR**

### `decret-21-319-autorisation-exploitation-hydrocarbures.md`

**Source PDF:** `decret 21-319.pdf`  
**Status:** **VERIFIED WITH MINOR ISSUES**

#### Error 1 — MINOR

- **PDF location/page:** Multiple pages
- **Markdown location:** Multiple locations
- **Original PDF content:** PDF and Markdown content are highly similar after normalization.
- **Markdown content:** Markdown preserves the apparent legal text but differs in layout/normalization.
- **Problem:** Non-semantic conversion differences or numeric-token formatting require spot checking.
- **Correction required:** No automatic correction; verify legal-critical numbers, units, tables, and footnotes manually.
- **Severity:** **MINOR**

### `decret-21-430-gpl-carburant.md`

**Source PDF:** `21-430.pdf`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** Article 5 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 5 appears in the extracted PDF article sequence.
- **Markdown content:** Article 5 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 2 — HIGH

- **PDF location/page:** Article 6 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 6 appears in the extracted PDF article sequence.
- **Markdown content:** Article 6 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 3 — HIGH

- **PDF location/page:** Article 9 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 9 appears in the extracted PDF article sequence.
- **Markdown content:** Article 9 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 4 — HIGH

- **PDF location/page:** Article 10 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 10 appears in the extracted PDF article sequence.
- **Markdown content:** Article 10 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 5 — HIGH

- **PDF location/page:** Article 11 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 11 appears in the extracted PDF article sequence.
- **Markdown content:** Article 11 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 6 — HIGH

- **PDF location/page:** Article 12 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 12 appears in the extracted PDF article sequence.
- **Markdown content:** Article 12 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 7 — HIGH

- **PDF location/page:** Article 13 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 13 appears in the extracted PDF article sequence.
- **Markdown content:** Article 13 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 8 — HIGH

- **PDF location/page:** Article 14 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 14 appears in the extracted PDF article sequence.
- **Markdown content:** Article 14 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 9 — HIGH

- **PDF location/page:** Article 15 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 15 appears in the extracted PDF article sequence.
- **Markdown content:** Article 15 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 10 — HIGH

- **PDF location/page:** Article 16 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 16 appears in the extracted PDF article sequence.
- **Markdown content:** Article 16 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 11 — HIGH

- **PDF location/page:** Article 17 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 17 appears in the extracted PDF article sequence.
- **Markdown content:** Article 17 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 12 — HIGH

- **PDF location/page:** Article 18 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 18 appears in the extracted PDF article sequence.
- **Markdown content:** Article 18 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 13 — HIGH

- **PDF location/page:** Article 19 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 19 appears in the extracted PDF article sequence.
- **Markdown content:** Article 19 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 14 — HIGH

- **PDF location/page:** Article 20 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 20 appears in the extracted PDF article sequence.
- **Markdown content:** Article 20 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 15 — HIGH

- **PDF location/page:** Article 21 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 21 appears in the extracted PDF article sequence.
- **Markdown content:** Article 21 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 16 — HIGH

- **PDF location/page:** Article 22 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 22 appears in the extracted PDF article sequence.
- **Markdown content:** Article 22 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 17 — HIGH

- **PDF location/page:** Article 23 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 23 appears in the extracted PDF article sequence.
- **Markdown content:** Article 23 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 18 — HIGH

- **PDF location/page:** Article 24 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 24 appears in the extracted PDF article sequence.
- **Markdown content:** Article 24 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 19 — HIGH

- **PDF location/page:** Article 25 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 25 appears in the extracted PDF article sequence.
- **Markdown content:** Article 25 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 20 — HIGH

- **PDF location/page:** Article 26 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 26 appears in the extracted PDF article sequence.
- **Markdown content:** Article 26 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 21 — HIGH

- **PDF location/page:** Article 27 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 27 appears in the extracted PDF article sequence.
- **Markdown content:** Article 27 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 22 — HIGH

- **PDF location/page:** Article 28 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 28 appears in the extracted PDF article sequence.
- **Markdown content:** Article 28 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 23 — HIGH

- **PDF location/page:** Article 29 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 29 appears in the extracted PDF article sequence.
- **Markdown content:** Article 29 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 24 — HIGH

- **PDF location/page:** Article 30 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 30 appears in the extracted PDF article sequence.
- **Markdown content:** Article 30 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 25 — HIGH

- **PDF location/page:** Article 31 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 31 appears in the extracted PDF article sequence.
- **Markdown content:** Article 31 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

### `decret-22-167-etablissements-classes-modification.md`

**Source PDF:** `22-167.pdf`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** Article 15 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 15 appears in the extracted PDF article sequence.
- **Markdown content:** Article 15 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 2 — HIGH

- **PDF location/page:** Article 36 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 36 appears in the extracted PDF article sequence.
- **Markdown content:** Article 36 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 3 — HIGH

- **PDF location/page:** Article 38 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 38 appears in the extracted PDF article sequence.
- **Markdown content:** Article 38 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 4 — HIGH

- **PDF location/page:** Article 828 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 828 appears in the extracted PDF article sequence.
- **Markdown content:** Article 828 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

### `decret-24-196-etablissements-classes-modification.md`

**Source PDF:** `decret 24-196.pdf`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** Article 7 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 7 appears in the extracted PDF article sequence.
- **Markdown content:** Article 7 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 2 — HIGH

- **PDF location/page:** Article 9 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 9 appears in the extracted PDF article sequence.
- **Markdown content:** Article 9 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

### `decret-25-63-plans-intervention-catastrophes.md`

**Source PDF:** `—`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** —
- **Markdown location:** Entire document
- **Original PDF content:** No corresponding PDF is present in legal_refs/pdf.
- **Markdown content:** Markdown exists but cannot be validated.
- **Problem:** Authoritative source unavailable.
- **Correction required:** Provide the original PDF and repeat the audit.
- **Severity:** **HIGH**

### `decret-76-35-igh-incendie.md`

**Source PDF:** `Décret 76-35.pdf`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** Article 36 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 36 appears in the extracted PDF article sequence.
- **Markdown content:** Article 36 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 2 — HIGH

- **PDF location/page:** Article 87 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 87 appears in the extracted PDF article sequence.
- **Markdown content:** Article 87 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 3 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 10
- **Original PDF content:** Article 10 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 10 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 4 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 14
- **Original PDF content:** Article 14 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 14 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 5 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 17
- **Original PDF content:** Article 17 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 17 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 6 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 18
- **Original PDF content:** Article 18 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 18 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 7 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 19
- **Original PDF content:** Article 19 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 19 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

### `decret-76-36-incendie-panique.md`

**Source PDF:** `decret 76-36.pdf`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** Article 1 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 1 appears in the extracted PDF article sequence.
- **Markdown content:** Article 1 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 2 — HIGH

- **PDF location/page:** Article 2 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 2 appears in the extracted PDF article sequence.
- **Markdown content:** Article 2 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 3 — HIGH

- **PDF location/page:** Article 3 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 3 appears in the extracted PDF article sequence.
- **Markdown content:** Article 3 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 4 — HIGH

- **PDF location/page:** Article 4 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 4 appears in the extracted PDF article sequence.
- **Markdown content:** Article 4 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 5 — HIGH

- **PDF location/page:** Article 5 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 5 appears in the extracted PDF article sequence.
- **Markdown content:** Article 5 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 6 — HIGH

- **PDF location/page:** Article 6 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 6 appears in the extracted PDF article sequence.
- **Markdown content:** Article 6 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 7 — HIGH

- **PDF location/page:** Article 7 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 7 appears in the extracted PDF article sequence.
- **Markdown content:** Article 7 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 8 — HIGH

- **PDF location/page:** Article 8 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 8 appears in the extracted PDF article sequence.
- **Markdown content:** Article 8 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 9 — HIGH

- **PDF location/page:** Article 9 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 9 appears in the extracted PDF article sequence.
- **Markdown content:** Article 9 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 10 — HIGH

- **PDF location/page:** Article 10 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 10 appears in the extracted PDF article sequence.
- **Markdown content:** Article 10 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 11 — HIGH

- **PDF location/page:** Article 11 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 11 appears in the extracted PDF article sequence.
- **Markdown content:** Article 11 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 12 — HIGH

- **PDF location/page:** Article 12 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 12 appears in the extracted PDF article sequence.
- **Markdown content:** Article 12 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 13 — HIGH

- **PDF location/page:** Article 13 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 13 appears in the extracted PDF article sequence.
- **Markdown content:** Article 13 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

#### Error 14 — HIGH

- **PDF location/page:** Article 14 (page to be confirmed by human review)
- **Markdown location:** Article-number sequence
- **Original PDF content:** Article 14 appears in the extracted PDF article sequence.
- **Markdown content:** Article 14 is absent from the Markdown article sequence.
- **Problem:** Potential missing or malformed article heading/content.
- **Correction required:** Locate and restore the exact PDF text; do not infer content.
- **Severity:** **HIGH**

### `decret-83-496-gpl-carburant.md`

**Source PDF:** `Décret 83-496.pdf`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 2
- **Original PDF content:** Article 2 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 2 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 2 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 3
- **Original PDF content:** Article 3 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 3 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 3 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 4
- **Original PDF content:** Article 4 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 4 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 4 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 5
- **Original PDF content:** Article 5 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 5 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 5 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 6
- **Original PDF content:** Article 6 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 6 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 6 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 7
- **Original PDF content:** Article 7 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 7 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 7 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 8
- **Original PDF content:** Article 8 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 8 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 8 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 9
- **Original PDF content:** Article 9 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 9 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 9 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 10
- **Original PDF content:** Article 10 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 10 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 10 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 11
- **Original PDF content:** Article 11 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 11 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 11 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 12
- **Original PDF content:** Article 12 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 12 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 12 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 13
- **Original PDF content:** Article 13 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 13 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 13 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 14
- **Original PDF content:** Article 14 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 14 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 14 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 15
- **Original PDF content:** Article 15 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 15 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 15 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 16
- **Original PDF content:** Article 16 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 16 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 16 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 17
- **Original PDF content:** Article 17 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 17 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 17 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 18
- **Original PDF content:** Article 18 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 18 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 18 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 19
- **Original PDF content:** Article 19 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 19 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 19 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 20
- **Original PDF content:** Article 20 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 20 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 20 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 21
- **Original PDF content:** Article 21 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 21 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

#### Error 21 — HIGH

- **PDF location/page:** Article sequence / page to be confirmed
- **Markdown location:** Article 34
- **Original PDF content:** Article 34 was not detected in the extracted PDF article sequence.
- **Markdown content:** Article 34 appears in Markdown.
- **Problem:** Potential inserted, misnumbered, or false article heading; extraction false positives remain possible.
- **Correction required:** Human verification against the PDF page image.
- **Severity:** **HIGH**

### `decret-90-245-appareils-pression-gaz.md`

**Source PDF:** `—`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** —
- **Markdown location:** Entire document
- **Original PDF content:** No corresponding PDF is present in legal_refs/pdf.
- **Markdown content:** Markdown exists but cannot be validated.
- **Problem:** Authoritative source unavailable.
- **Correction required:** Provide the original PDF and repeat the audit.
- **Severity:** **HIGH**

### `decret-91-05-hygiene-securite-milieu-travail.md`

**Source PDF:** `—`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** —
- **Markdown location:** Entire document
- **Original PDF content:** No corresponding PDF is present in legal_refs/pdf.
- **Markdown content:** Markdown exists but cannot be validated.
- **Problem:** Authoritative source unavailable.
- **Correction required:** Provide the original PDF and repeat the audit.
- **Severity:** **HIGH**

### `decret-93-120-medecine-du-travail.md`

**Source PDF:** `—`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** —
- **Markdown location:** Entire document
- **Original PDF content:** No corresponding PDF is present in legal_refs/pdf.
- **Markdown content:** Markdown exists but cannot be validated.
- **Problem:** Authoritative source unavailable.
- **Correction required:** Provide the original PDF and repeat the audit.
- **Severity:** **HIGH**

### `loi-01-19-gestion-dechets.md`

**Source PDF:** `—`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** —
- **Markdown location:** Entire document
- **Original PDF content:** No corresponding PDF is present in legal_refs/pdf.
- **Markdown content:** Markdown exists but cannot be validated.
- **Problem:** Authoritative source unavailable.
- **Correction required:** Provide the original PDF and repeat the audit.
- **Severity:** **HIGH**

### `loi-03-10-protection-environnement.md`

**Source PDF:** `—`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** —
- **Markdown location:** Entire document
- **Original PDF content:** No corresponding PDF is present in legal_refs/pdf.
- **Markdown content:** Markdown exists but cannot be validated.
- **Problem:** Authoritative source unavailable.
- **Correction required:** Provide the original PDF and repeat the audit.
- **Severity:** **HIGH**

### `loi-04-08-activites-commerciales.md`

**Source PDF:** `—`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** —
- **Markdown location:** Entire document
- **Original PDF content:** No corresponding PDF is present in legal_refs/pdf.
- **Markdown content:** Markdown exists but cannot be validated.
- **Problem:** Authoritative source unavailable.
- **Correction required:** Provide the original PDF and repeat the audit.
- **Severity:** **HIGH**

### `loi-04-20-risques-majeurs.md`

**Source PDF:** `—`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** —
- **Markdown location:** Entire document
- **Original PDF content:** No corresponding PDF is present in legal_refs/pdf.
- **Markdown content:** Markdown exists but cannot be validated.
- **Problem:** Authoritative source unavailable.
- **Correction required:** Provide the original PDF and repeat the audit.
- **Severity:** **HIGH**

### `loi-05-12-ressources-en-eau.md`

**Source PDF:** `—`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** —
- **Markdown location:** Entire document
- **Original PDF content:** No corresponding PDF is present in legal_refs/pdf.
- **Markdown content:** Markdown exists but cannot be validated.
- **Problem:** Authoritative source unavailable.
- **Correction required:** Provide the original PDF and repeat the audit.
- **Severity:** **HIGH**

### `loi-09-03-protection-consommateur.md`

**Source PDF:** `—`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** —
- **Markdown location:** Entire document
- **Original PDF content:** No corresponding PDF is present in legal_refs/pdf.
- **Markdown content:** Markdown exists but cannot be validated.
- **Problem:** Authoritative source unavailable.
- **Correction required:** Provide the original PDF and repeat the audit.
- **Severity:** **HIGH**

### `loi-18-09-protection-consommateur.md`

**Source PDF:** `—`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** —
- **Markdown location:** Entire document
- **Original PDF content:** No corresponding PDF is present in legal_refs/pdf.
- **Markdown content:** Markdown exists but cannot be validated.
- **Problem:** Authoritative source unavailable.
- **Correction required:** Provide the original PDF and repeat the audit.
- **Severity:** **HIGH**

### `loi-18-11-sante-partie1-arts1-164.md`

**Source PDF:** `—`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** —
- **Markdown location:** Entire document
- **Original PDF content:** No corresponding PDF is present in legal_refs/pdf.
- **Markdown content:** Markdown exists but cannot be validated.
- **Problem:** Authoritative source unavailable.
- **Correction required:** Provide the original PDF and repeat the audit.
- **Severity:** **HIGH**

### `loi-18-11-sante-partie2-arts165-264.md`

**Source PDF:** `—`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** —
- **Markdown location:** Entire document
- **Original PDF content:** No corresponding PDF is present in legal_refs/pdf.
- **Markdown content:** Markdown exists but cannot be validated.
- **Problem:** Authoritative source unavailable.
- **Correction required:** Provide the original PDF and repeat the audit.
- **Severity:** **HIGH**

### `loi-18-11-sante-partie3-arts265-450.md`

**Source PDF:** `—`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** —
- **Markdown location:** Entire document
- **Original PDF content:** No corresponding PDF is present in legal_refs/pdf.
- **Markdown content:** Markdown exists but cannot be validated.
- **Problem:** Authoritative source unavailable.
- **Correction required:** Provide the original PDF and repeat the audit.
- **Severity:** **HIGH**

### `loi-19-02-incendie-panique.md`

**Source PDF:** `—`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** —
- **Markdown location:** Entire document
- **Original PDF content:** No corresponding PDF is present in legal_refs/pdf.
- **Markdown content:** Markdown exists but cannot be validated.
- **Problem:** Authoritative source unavailable.
- **Correction required:** Provide the original PDF and repeat the audit.
- **Severity:** **HIGH**

### `loi-88-07-hygiene-securite-medecine-travail.md`

**Source PDF:** `—`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** —
- **Markdown location:** Entire document
- **Original PDF content:** No corresponding PDF is present in legal_refs/pdf.
- **Markdown content:** Markdown exists but cannot be validated.
- **Problem:** Authoritative source unavailable.
- **Correction required:** Provide the original PDF and repeat the audit.
- **Severity:** **HIGH**

### `loi-90-11-relations-travail.md`

**Source PDF:** `—`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** —
- **Markdown location:** Entire document
- **Original PDF content:** No corresponding PDF is present in legal_refs/pdf.
- **Markdown content:** Markdown exists but cannot be validated.
- **Problem:** Authoritative source unavailable.
- **Correction required:** Provide the original PDF and repeat the audit.
- **Severity:** **HIGH**

### `loi-90-29-urbanisme.md`

**Source PDF:** `—`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** —
- **Markdown location:** Entire document
- **Original PDF content:** No corresponding PDF is present in legal_refs/pdf.
- **Markdown content:** Markdown exists but cannot be validated.
- **Problem:** Authoritative source unavailable.
- **Correction required:** Provide the original PDF and repeat the audit.
- **Severity:** **HIGH**

### `projet-arrete-gpl-installations-securite.md`

**Source PDF:** `—`  
**Status:** **UNSAFE FOR LEGAL USE**

#### Error 1 — HIGH

- **PDF location/page:** —
- **Markdown location:** Entire document
- **Original PDF content:** No corresponding PDF is present in legal_refs/pdf.
- **Markdown content:** Markdown exists but cannot be validated.
- **Problem:** Authoritative source unavailable.
- **Correction required:** Provide the original PDF and repeat the audit.
- **Severity:** **HIGH**

## Corrections and second comparison

No automatic Markdown corrections were applied. The automated evidence identified material mismatches, missing source PDFs, or unusable PDF text layers, but did not unambiguously establish replacement text for those cases. A second comparison was performed against the unchanged Markdown files; statuses above therefore remain conservative and unchanged.

## Interpretation

Only documents marked **VERIFIED WITH MINOR ISSUES** are candidates for AI/legal research after human spot-checking. Documents marked **REQUIRES CORRECTION** or **UNSAFE FOR LEGAL USE** must not be used as a legal source or relied upon for legal-critical answers.

## References

[1]: ../pdf/ "Authoritative PDF corpus in this repository"
[2]: ../md/ "Markdown conversion corpus in this repository"

## Corrections actually applied after OCR

### `arrete-interministeriel-1999-11-21-conservation-aliments.md`

| Field | Evidence |
|---|---|
| PDF location | `Arrêté interministériel du 21 novembre 1999.pdf`, printed pages 15–17; OCR pages 1–3 |
| Markdown location | Previous file header, article body, and Annex/Table section; replacement file throughout |
| Original PDF content | The PDF contains **Annexe 5 — Les spécifications microbiologiques du cacao en poudre et du beurre de cacao**, followed by the arrêté titled **Arrêté interministériel du 13 Chaâbane 1420 correspondant au 21 novembre 1999 relatif aux températures et procédés de conservation par réfrigération, congélation ou surgélation des denrées alimentaires**. It contains Articles 1–10 and specific refrigeration/freezing tables. |
| Previous Markdown content | The previous Markdown presented a generic, unsupported Annex/Table N° 1, stated that the full articles and table had been verified, and did not preserve the PDF’s visible Annex 5 cacao/butter table. |
| Problem | The previous Markdown did not correspond to the supplied PDF excerpt and omitted or replaced legally meaningful tables, title wording, and source scope. |
| Correction applied | The Markdown was rewritten from the OCR/visual source pages, restoring the PDF title, Articles 1–10, the visible Annex 5 table, the temperature thresholds, date, signatures, and an explicit uncertainty marker for unreadable signatures. |
| Severity | **HIGH** |
| Verification state | Corrected text is source-aligned for the readable OCR/visual content. The file remains not fully certified until all table cells and low-confidence OCR characters receive human page-image review. |

No other Markdown file was rewritten automatically in this pass because OCR or the supplied PDF did not establish an unambiguous replacement text. In particular, the scanned `76-35`, `76-36`, and `83-496` files contain source-scope or OCR-quality issues that make wholesale replacement unsafe.

## Full-corpus trust update — 2026-08-20

### `decret-06-198-etablissements-classes.md`

The supplied Vision-AI transcription was independently compared with `legal_refs/pdf/Decret 06-198.pdf`. The identity fields match, the PDF and Markdown article sequences align through Article 50, and normalized token overlap is approximately 94.1%. The prior Article 1 warning was a parser false positive: the PDF uses “Article 1er”, while the Markdown uses the equivalent heading “Article 1er”. The Markdown source filename was corrected from `Decret-06-198.pdf` to the actual repository filename `Decret 06-198.pdf`. The file is now classified **VERIFIED WITH MINOR ISSUES**, subject to final visual spot-checking of tables, units, deadlines, and other legal-critical values.

### 06-198 correction applied after source inspection

The original PDF contains only items 1–7 under Article 14. The Markdown had incorrectly incorporated items 8–10 from the later decree n° 24-196 while also labeling the base Article 14 as modified. Those later items were removed from the base 06-198 transcription and referenced only through the separate amendment Markdown. The PDF also establishes the singular form **« dont la diffusion lui apparaîtrait »**; the Markdown was corrected from **« apparaîtraient »** to that source-faithful wording. A post-correction article-sequence check remains aligned through Article 50.

## Structure-preserving review update — 2026-08-20

The remaining directly paired candidates were reviewed without changing their established Markdown format. The review preserved metadata blocks, source references, French headings, article labels, section hierarchy, lists, tables, annex headings, amendment references, and sequence-control sections.

`decret-06-138-emissions-atmospheriques.md` was checked against Articles 1–19 and Annexes I–II. `decret-11-125-eau-consommation-humaine.md` was checked against Articles 1–9 and Tables 1–2. Both remain structurally complete and are now classified **VERIFIED WITH MINOR ISSUES**, with final visual spot-checks recommended for table values, units, and thresholds. The corrected 1999 arrêté is also now classified **VERIFIED WITH MINOR ISSUES** after OCR and visual review, with only low-confidence table/signature details remaining.

Current machine-readable classification: **0 VERIFIED**, **9 VERIFIED WITH MINOR ISSUES**, **0 REQUIRES CORRECTION**, and **36 UNSAFE FOR LEGAL USE**.

## Amendment review update — 2026-08-20

`decret-24-196-etablissements-classes-modification.md` was reviewed against the supplied PDF while preserving its existing amendment format. The PDF and Markdown agree on the identity, Articles 1er–3, and the quoted modifications to Articles 14, 24, 25, 26, 29, and 44 of decree 06-198. The earlier article-gap findings were parser artefacts caused by quoted amended article headings. The file is now classified **VERIFIED WITH MINOR ISSUES**, with a final visual check recommended for conditions and deadlines.

## Mixed-source scope review update — 2026-08-20

`decret-76-35-igh-incendie.md` was reviewed against the 76-35 segment of the mixed source PDF. Articles 1er–26 are present in the Markdown and match the 76-35 segment. The earlier detections of Articles 36 and 87 were false positives caused by the same PDF containing the following decree 76-36. The Markdown structure and scope note were preserved; the file is now classified **VERIFIED WITH MINOR ISSUES**.

## Encoding-repair review update — 2026-08-20

The 2016 microbiological-criteria and 2025 restaurant-hygiene Markdown files were stored in legacy ISO-8859-1 encoding, which caused French accents and punctuation to appear corrupted in UTF-8 readers. Both files were converted losslessly to UTF-8. Their existing headings, articles, tables, annexes, and sequence-control sections were preserved. The 2016 file was compared for article and microbiological-table coverage; the 2025 file was compared for Articles 1er–48 and restaurant-hygiene provisions. Both are now classified **VERIFIED WITH MINOR ISSUES**, with visual checks of thresholds, units, conditions, and tables still recommended.

## Control-punctuation repair update — 2026-08-20

A second encoding artefact remained after the Latin-1-to-UTF-8 conversion: byte `U+0097` was preserved as a control character rather than rendered as punctuation. The authoritative PDF uses an em dash in these positions. All 52 occurrences in the 2016 Markdown and all 105 occurrences in the 2025 Markdown were replaced with the source-faithful em dash. No article text, number, unit, table value, or legal condition was changed.

## Direct-PDF scope review update — 2026-08-20

`decret-09-335-plans-internes-intervention.md` was checked against its five-page PDF. Articles 1er–21 and all six chapters are present in the Markdown. The earlier detections of Articles 54 and 62 were parser artefacts outside the decree’s actual scope. The existing abrogation warning and Markdown structure were preserved. The file is now classified **VERIFIED WITH MINOR ISSUES**.

## Direct-PDF article-scope review update — 2026-08-20

`decret-04-410-regles-installations-traitement-dechets.md` was checked against its five-page PDF. The source identifies the decree as 04-410 dated 2 Dhou El Kaada 1425, corresponding to 14 December 2004, and the Markdown contains Articles 1er–16 in order. The existing SafeInspect note, headings, sequence table, and Markdown structure were preserved. The file is now classified **VERIFIED WITH MINOR ISSUES**.

## Decree-and-form review update — 2026-08-20

`decret-05-315-declaration-dechets-speciaux-dangereux.md` was checked against the four-page PDF. The Markdown contains Articles 1er–4 and the attached annual declaration form represented in the source, including the waste description, storage, treatment, and minimisation sections. Its legal scope note and existing Markdown structure were preserved. The file is now classified **VERIFIED WITH MINOR ISSUES**.

## Direct-PDF scope review update — 2026-08-20

`decret-07-205-schema-communal-dechets.md` was checked against its three-page PDF. The source identifies decree 07-205 dated 15 Joumada Ethania 1428, corresponding to 30 June 2007, and the Markdown contains Articles 1er–11 in order. Its code-warning note distinguishing 07-205 from 04-410 and its Markdown structure were preserved. The file is now classified **VERIFIED WITH MINOR ISSUES**.

## Direct-PDF scope review update — 2026-08-20

`decret-01-102-creation-ona.md` was checked against its six-page PDF. The source identifies decree 01-102 dated 27 Moharram 1422, corresponding to 21 April 2001, and the Markdown contains Articles 1–33 in order. The existing headings and sequence-control structure were preserved. The file is now classified **VERIFIED WITH MINOR ISSUES**.

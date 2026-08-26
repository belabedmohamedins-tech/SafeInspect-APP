# Scanned PDF OCR Quarantine Summary

## Scope

A page-aware French/Arabic Tesseract pass was completed for the eight registered documents whose PDFs had empty or near-empty native text. The original PDFs and legal Markdown files were not modified.

| Document | PDF pages OCR-processed | Automated disposition |
|---|---:|---|
| `arrete-interministeriel-1999-11-21-conservation-aliments.md` | 3 | Preserve current Markdown; OCR output requires source-page comparison for table values. |
| `decret-76-35-igh-incendie.md` | 3 | Preserve current Markdown; no automatic legal correction. |
| `decret-76-36-incendie-panique.md` | 8 | Preserve current Markdown; article and numeric OCR differences quarantined. |
| `decret-83-496-gpl-carburant.md` | 48 | Remains `UNSAFE FOR LEGAL USE`; scan contains mixed Journal Officiel material and incomplete bilingual equivalence. |
| `decret-90-245-appareils-pression-gaz.md` | 6 | Preserve current Markdown; OCR and issue-header tokens quarantined. |
| `decret-91-05-hygiene-securite-milieu-travail.md` | 8 | Preserve current Markdown; OCR marker differences quarantined. |
| `decret-93-120-medecine-du-travail.md` | 5 | Existing document remains verified with minor issues based on prior visual review; OCR output is supporting evidence only. |
| `loi-90-29-urbanisme.md` | 30 | Preserve current Markdown; OCR captures the mixed issue and neighboring Law 90-30 material, so whole-file replacement is prohibited. |

## Interpretation

The raw OCR comparison reports article and numeric differences for several documents. These are not automatically treated as legal defects because the OCR includes Journal Officiel headers, page numbers, tables, neighboring instruments, OCR segmentation artifacts, and Arabic/French numeral-format differences. The comparator also cannot infer that an article is missing merely because one representation uses a different heading layout.

No text was automatically replaced, no `[ILLISIBLE]` marker was inserted without a precisely identified source location, and no trust status was promoted solely from OCR agreement. Disagreements remain quarantined in the machine-readable scan output.

## Safe conclusion

The automated OCR pass improves evidence and makes the remaining risks explicit, but it does not justify expanding the trustable set beyond the existing 43 documents. Decree 83-496 remains unsafe. The unpublished GPL project remains excluded from legal authority. The authoritative PDF remains the controlling source for all legal claims.

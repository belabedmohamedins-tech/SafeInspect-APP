# SafeInspect Markdown Trust Index

**Authority:** The PDFs in `legal_refs/pdf/` are the only authoritative legal sources. This index describes the validation state of Markdown representations after PDF text extraction, OCR, page-image review, and second-pass comparison.

## Current status

| Status | Count | Permitted use |
|---|---:|---|
| **VERIFIED** | 0 | None classified without reservation. |
| **VERIFIED WITH MINOR ISSUES** | 16 | Suitable for AI/legal research with final human spot-check of tables, numbers, units, and exceptions. |
| **REQUIRES CORRECTION** | 0 | No remaining directly paired document is currently classified in this category. |
| **UNSAFE FOR LEGAL USE** | 29 | Do not rely on for legal research; source PDF is missing, materially mismatched, or OCR is unreliable. |

## Files currently usable with reservations

The following files have an authoritative PDF available and have passed a strong text/article comparison, but should still receive a final visual check for tables and legal-critical values:

- `arrete-interministeriel-2011-02-06-permis-construire-energie.md`
- `decret-01-102-creation-ona.md`
- `decret-06-198-etablissements-classes.md`
- `decret-09-19.md`
- `decret-21-261-esp-equipements-hydrocarbures.md`
- `decret-21-319-autorisation-exploitation-hydrocarbures.md`
- `decret-06-138-emissions-atmospheriques.md`
- `decret-11-125-eau-consommation-humaine.md`
- `arrete-interministeriel-1999-11-21-conservation-aliments.md`
- `decret-24-196-etablissements-classes-modification.md`
- `decret-76-35-igh-incendie.md`
- `arrete-interministeriel-2016-10-04-criteres-microbiologiques.md`
- `arrete-interministeriel-2025-05-07-hygiene-restauration.md`
- `decret-09-335-plans-internes-intervention.md`
- `decret-04-410-regles-installations-traitement-dechets.md`
- `decret-05-315-declaration-dechets-speciaux-dangereux.md`

## Structure preservation

The review preserves the existing Markdown conventions used in this repository: metadata blocks, source-PDF references, verification warnings, French headings, article labels, section hierarchy, lists, Markdown tables, annex titles, amendment references, and end-of-document sequence checks. Corrections are made inside that structure; the files are not converted to a new template.

## Corrections applied in this audit

The 1999 arrêté Markdown was rewritten from OCR and visual PDF evidence because the former Markdown did not represent the supplied three-page PDF excerpt and omitted the visible Annex 5 cacao/butter table.

The 06-198 Markdown was corrected because it had merged Article 14 items 8–10 from decree n° 24-196 into the original decree n° 06-198. Those items were removed from the base text and the source-faithful wording **« dont la diffusion lui apparaîtrait »** was restored. The exact repository PDF filename in the metadata was also corrected.

## Unsafe categories

Markdown files with no corresponding PDF in the repository cannot be validated and remain unsafe. Files whose PDF is a full Journal Officiel issue, whose OCR scope does not clearly isolate the legal document, or whose normalized comparison reveals substantial omissions also remain unsafe until a page-specific source is supplied and reviewed.

## References

[1]: ../pdf/ "Authoritative PDF corpus"
[2]: ../md/ "Markdown corpus"
[3]: conversion_audit.md "Detailed conversion audit"
[4]: conversion_status.json "Machine-readable status registry"

# SafeInspect Markdown Trust Index

**Authority:** The PDFs in `legal_refs/pdf/` are the only authoritative legal sources. This index describes the validation state of Markdown representations after PDF text extraction, OCR, page-image review, and second-pass comparison.

## Current status

| Status | Count | Permitted use |
|---|---:|---|
| **VERIFIED** | 0 | None classified without reservation. |
| **VERIFIED WITH MINOR ISSUES** | 42 | Suitable for AI/legal research with final human spot-check of tables, numbers, units, and exceptions. |
| **REQUIRES CORRECTION** | 0 | No remaining directly paired document is currently classified in this category. |
| **UNSAFE FOR LEGAL USE** | 3 | Do not rely on for legal research; source PDF is missing, materially mismatched, or OCR is unreliable. |

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
- `decret-25-63-plans-intervention-catastrophes.md`
- `loi-04-08-activites-commerciales.md`
- `loi-04-20-risques-majeurs.md`
- `loi-03-10-protection-environnement.md`
- `loi-01-19-gestion-dechets.md`
- `loi-05-12-ressources-en-eau.md`
- `loi-18-09-protection-consommateur.md`
- `loi-90-11-relations-travail.md`
- `loi-88-07-hygiene-securite-medecine-travail.md`
- `loi-19-02-incendie-panique.md`
- `loi-18-11-sante-partie1-arts1-164.md`
- `loi-18-11-sante-partie2-arts165-264.md`
- `loi-18-11-sante-partie3-arts265-450.md`
- `decret-04-410-regles-installations-traitement-dechets.md`
- `decret-05-315-declaration-dechets-speciaux-dangereux.md`
- `decret-22-167-etablissements-classes-modification.md`
- `decret-90-245-appareils-pression-gaz.md`
- `decret-91-05-hygiene-securite-milieu-travail.md`
- `loi-09-03-protection-consommateur.md`
- `loi-90-29-urbanisme.md`
- `decret-07-205-schema-communal-dechets.md`

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


## 22-167 status note — 2026-08-20

`decret-22-167-etablissements-classes-modification.md` is included among the 42 files usable with reservations. The target decree was isolated to PDF pages 5–10 of the mixed Journal Officiel issue, and Articles 1–12, inserted Articles 44 bis through 44 bis 10, deadlines, quantities, and the annex were visually compared. Three minor “compagnes” transcription errors were corrected to the source-visible “campagnes”.

## 83-496 status note — 2026-08-20

`decret-83-496-gpl-carburant.md` remains in the **UNSAFE FOR LEGAL USE** group. A scanned-page review corrected the omission of the Article 9 **80% tank-volume condition** and the Article 12 **2,500 kg loaded-weight condition**. The full bilingual representation remains unvalidated, so the file is still not included among the 42 Markdown files usable with reservations.

## Uploaded-source batch note — 2026-08-20

The four newly uploaded source PDFs are now included among the **42 Markdown files usable with reservations**. Law 90-29 is explicitly limited to the target urbanism law (Articles 1er–81); the later domain-law contents in the mixed Journal Officiel issue are excluded.

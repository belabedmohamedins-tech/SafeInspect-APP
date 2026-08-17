# Legal Markdown Gap-Fill Report

**Date:** 2026-08-17

This report records the gap-filling pass applied on the review branch. The PDFs remain the authoritative sources; the Markdown files are derived AI retrieval references.

## Applied corrections

The most material confirmed gap was in `decret-21-261-esp-equipements-hydrocarbures.md`. Its Articles 50–55 did not match the attached `dec21-261.pdf` wording, and Article 56 duplicated the Article 57 dossier text. The file was corrected against PDF pages 11–12: the source Articles 50–55 were restored, the actual Article 56 was inserted, Article 57 was retained, and the apparent `taraqe` typo was corrected to `tarage`. Source-page comments were added at the corrected passage.

The broader corpus was upgraded with provenance front matter, source hashes, quality statuses, AI safety notices, and article/page markers where automated mapping was recoverable. Six supplied PDFs without direct repository counterparts were added as `source-only-*.md` files marked discovery-only and review-required.

## Before-after coverage for mapped pairs

| Markdown | Before coverage | After body coverage | Change | Status |
|---|---:|---:|---:|---|
| `arrete-interministeriel-1999-11-21-conservation-aliments.md` | 0.0 | 0.0 | 0.0 | unchanged |
| `arrete-interministeriel-2011-02-06-permis-construire-energie.md` | 0.996 | 0.996 | 0.0 | unchanged |
| `arrete-interministeriel-2016-10-04-criteres-microbiologiques.md` | 0.3047 | 0.3047 | 0.0 | unchanged |
| `arrete-interministeriel-2025-05-07-hygiene-restauration.md` | 0.6123 | 0.6123 | 0.0 | unchanged |
| `decret-02-427-prevention-risques-professionnels.md` | 0.9837 | 0.9837 | 0.0 | unchanged |
| `decret-04-82-agrement-sanitaire-animaux.md` | 0.9963 | 0.9963 | 0.0 | unchanged |
| `decret-06-138-emissions-atmospheriques.md` | 0.9776 | 0.9776 | 0.0 | unchanged |
| `decret-06-141-rejets-effluents-liquides.md` | 0.6487 | 0.6487 | 0.0 | unchanged |
| `decret-06-198-etablissements-classes.md` | 0.8797 | 0.8797 | 0.0 | unchanged |
| `decret-07-144-nomenclature-installations-classees.md` | 0.1985 | 0.1985 | 0.0 | unchanged |
| `decret-09-19.md` | 0.9508 | 0.9508 | 0.0 | unchanged |
| `decret-09-335-plans-internes-intervention.md` | 0.1885 | 0.1885 | 0.0 | unchanged |
| `decret-11-125-eau-consommation-humaine.md` | 0.7797 | 0.7797 | 0.0 | unchanged |
| `decret-17-140-hygiene-alimentaire.md` | 0.0005 | 0.0005 | 0.0 | unchanged |
| `decret-21-261-esp-equipements-hydrocarbures.md` | 0.9322 | 0.9674 | 0.0352 | improved |
| `decret-21-319-autorisation-exploitation-hydrocarbures.md` | 0.9317 | 0.9317 | 0.0 | unchanged |
| `decret-21-430-gpl-carburant.md` | 0.9987 | 0.9987 | 0.0 | unchanged |
| `decret-22-167-etablissements-classes-modification.md` | 0.932 | 0.932 | 0.0 | unchanged |
| `decret-24-196-etablissements-classes-modification.md` | 0.8415 | 0.8415 | 0.0 | unchanged |
| `decret-25-63-plans-intervention-catastrophes.md` | 0.7809 | 0.7809 | 0.0 | unchanged |
| `decret-76-35-igh-incendie.md` | 0.3738 | 0.3738 | 0.0 | unchanged |
| `decret-83-496-gpl-carburant.md` | 0.0123 | 0.0123 | 0.0 | unchanged |
| `decret-90-245-appareils-pression-gaz.md` | 0.3456 | 0.3456 | 0.0 | unchanged |
| `decret-91-05-hygiene-securite-milieu-travail.md` | 0.5088 | 0.5088 | 0.0 | unchanged |
| `decret-93-120-medecine-du-travail.md` | 0.4915 | 0.4915 | 0.0 | unchanged |
| `loi-01-19-gestion-dechets.md` | 0.9611 | 0.9611 | 0.0 | unchanged |
| `loi-03-10-protection-environnement.md` | 0.9566 | 0.9566 | 0.0 | unchanged |
| `loi-04-08-activites-commerciales.md` | 0.9989 | 0.9989 | 0.0 | unchanged |
| `loi-04-20-risques-majeurs.md` | 0.9548 | 0.9548 | 0.0 | unchanged |
| `loi-05-12-ressources-en-eau.md` | 0.9942 | 0.9942 | 0.0 | unchanged |
| `loi-09-03-protection-consommateur.md` | 0.9939 | 0.9939 | 0.0 | unchanged |
| `loi-18-11-sante.md` | 0.9841 | 0.9841 | 0.0 | unchanged |
| `loi-19-02-incendie-panique.md` | 0.9761 | 0.9761 | 0.0 | unchanged |
| `loi-90-11-relations-travail.md` | 0.9981 | 0.9981 | 0.0 | unchanged |
| `loi-90-29-urbanisme.md` | 0.4266 | 0.4266 | 0.0 | unchanged |

## Validation result

The generated corpus validation checked 48 Markdown/reference files for required safety markers, source hashes, and status consistency. It reported zero issues. The detailed machine-readable validation result is stored in `VALIDATION_RESULT.json`.

## Remaining review-required items

OCR-derived files, partial or low-coverage pairs, source-only extractions, tables, annexes, and full-Journal PDFs still require page-level human review before any exact legal quotation or definitive compliance conclusion.

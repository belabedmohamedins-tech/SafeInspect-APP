# Paired scope findings

## Decree 02-427

The repository pair is `legal_refs/md/decret-02-427-prevention-risques-professionnels.md` and `legal_refs/pdf/Décret 02-427.pdf`. The PDF is a broad/mixed Journal Officiel source: its extracted text contains multiple unrelated decree and arrêté blocks, including Articles 1–9 for other hydrocarbon permits and unrelated military arrêtés. Article markers from the whole issue cannot safely establish the scope of the 02-427 Markdown. No correction or reclassification should be made without isolating the exact 02-427 pages from the PDF image/source issue.

Source: repository PDF `legal_refs/pdf/Décret 02-427.pdf`; local extraction `/tmp/02-427.txt`.

## Method rule

A Markdown file may be corrected or upgraded only when the PDF source segment is unambiguously isolated and establishes the exact replacement content. Mixed Journal Officiel issue text is not sufficient evidence for article-by-article certification.

## 2026-08-20 progress

The following paired files have been pushed and fresh-clone verified in prior batches: 1999 arrêté, 06-198, 06-138, 11-125, 24-196, 76-35, 2016 arrêté, 2025 arrêté, 09-335, 04-410, and 05-315. Current registry after those updates: 16 VERIFIED WITH MINOR ISSUES, 29 UNSAFE FOR LEGAL USE, 0 VERIFIED, 0 REQUIRES CORRECTION.
  
Only source-established corrections are allowed; uncertainty remains explicitly recorded.

## Decree 04-82

The pair `decret-04-82-agrement-sanitaire-elevage.md` / `legal_refs/pdf/Décret 04-82.pdf` is not currently safe to upgrade. The PDF extraction contains the 04-82 decree followed by unrelated source blocks and additional `Article 1er`/`Art. 2` sequences from other texts. The exact 04-82 page segment must be isolated before article-level certification. No Markdown correction is applied in this pass.

Source: repository PDF `legal_refs/pdf/Décret 04-82.pdf`.

## Decree 06-141

The pair `decret-06-141-rejets-effluents-liquides.md` / `legal_refs/pdf/Décret 06-141.pdf` is not safe to upgrade from the current PDF. The extracted PDF contains unrelated banking/ATCI regulation articles and other Journal Officiel material, so article markers cannot establish the exact 06-141 scope. No Markdown correction or reclassification is applied until the exact source pages are isolated.

Source: repository PDF `legal_refs/pdf/Décret 06-141.pdf`.

## Decree 21-430

The pair `decret-21-430-gpl-carburant.md` / `legal_refs/pdf/Décret 21-430.pdf` is not safe to upgrade from the current PDF. The extracted source contains multiple unrelated decree and arrêté blocks, including administrative, fisheries, and pharmaceutical provisions. Article markers from the whole issue cannot establish the exact 21-430 GPL-fuel scope. No Markdown correction or reclassification is applied until the exact source pages are isolated.

Source: repository PDF `legal_refs/pdf/Décret 21-430.pdf`.

## Decree 76-36

The pair `decret-76-36-incendie-panique.md` / `legal_refs/pdf/decret 76-36.pdf` is not safe to upgrade from the current eight-page OCR source. The OCR text contains many unrelated 1976 appointments, education arrêtés, and other Journal Officiel provisions; article markers do not isolate the 76-36 decree. No Markdown correction or reclassification is applied until the exact source pages are isolated and visually checked.

Source: repository PDF `legal_refs/pdf/decret 76-36.pdf` and OCR output under `legal_refs/validation/ocr_pdf/`.

## Decree 07-144

The pair `decret-07-144-nomenclature-installations-classees.md` / `legal_refs/pdf/Décret 07-144.pdf` has a clean 102-page source scope. The PDF identifies decree 07-144 dated 2 Joumada El Oula 1428, corresponding to 19 May 2007, with Articles 1er–3 and a large nomenclature annex. The Markdown preserves the article section and the annex/rubrique hierarchy, but its Markdown tables and all legal-critical thresholds, units, classifications, and rubric values require visual spot-checking against the PDF table pages before a stronger trust classification. No legal table value is changed automatically.

Source: repository PDF `legal_refs/pdf/Décret 07-144.pdf`.

## Decree 22-167

The pair `decret-22-167-etablissements-classes-modification.md` / `legal_refs/pdf/Décret 22-167.pdf` is not safe to upgrade from the current 23-page source. The PDF extraction contains multiple unrelated 2022 arrêtés and administrative texts; article markers from the whole issue cannot establish the exact 22-167 amendment scope. No Markdown correction or reclassification is applied until the exact source pages are isolated.

Source: repository PDF `legal_refs/pdf/Décret 22-167.pdf`.

## Decree 83-496

The pair `decret-83-496-gpl-carburant.md` / `legal_refs/pdf/Décret 83-496.pdf` is a 48-page scanned Journal Officiel source. The Markdown explicitly targets the decree excerpt and Articles 1–21, but the OCR output is predominantly unreadable Arabic and does not reliably isolate or transcribe the relevant pages. The user-supplied vision text for Articles 9–21 cannot be treated as authoritative without direct page-image verification. No legal text is corrected or reclassified; the file remains unsafe for legal use until the exact pages and bilingual transcription are independently checked.

Source: repository PDF `legal_refs/pdf/Décret 83-496.pdf`; OCR output under `legal_refs/validation/ocr_pdf/Décret 83-496/`.

## Isolated source ranges added in the current pass

- **02-427:** Journal Officiel pages 15–17 in `Décret 02-427.pdf`; Articles 1er–24 match the Markdown. Unrelated issue content was excluded.
- **04-82:** Journal Officiel pages 3–5 in `Décret 04-82.pdf`; Articles 1er–18 match the Markdown. Neighboring decree 04-83 was excluded.
- **06-141:** Journal Officiel pages 4–9 in `decret 06-141.pdf`; Articles 1er–14 and Annexes I–II match the Markdown. Limit-value tables remain visually sensitive.
- **21-430:** Journal Officiel pages 11–12 in `21-430.pdf`; Articles 1er–3 and modified Articles 4, 7, and 8 match the Markdown.
- **07-144:** Clean 102-page PDF; Articles 1er–4 and the nomenclature annex hierarchy match. All table values, classifications, thresholds, and units remain subject to visual checking.
- **76-36:** Stronger Arabic/French OCR identified the rectificatif title at OCR page 2, but the source is a mixed 1976 issue and the exact amended decree pages are not isolated sufficiently for certification.
- **83-496:** Stronger Arabic/French OCR completed all 48 pages, but the scan remains predominantly unreadable for reliable bilingual article-level verification; no legal text was altered.

All source references are repository PDFs under `legal_refs/pdf/`; OCR outputs are under `legal_refs/validation/ocr_pdf_ara_fra/` where applicable.
